/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'todo-app-infra',
            removal: input?.stage === 'production' ? 'retain' : 'remove',
            protect: ['production'].includes(input?.stage),
            home: 'local',
            providers: {
                gcp: {
                    project: 'voltarocks-42-sandbox',
                    region: 'asia-southeast1',
                    zone: 'asia-southeast1-a',
                },
            },
        };
    },
    async run() {
        // Registry for storing Docker images
        const repository = new gcp.artifactregistry.Repository('todo-repo', {
            format: 'DOCKER',
            repositoryId: 'todo-repo',
            location: 'asia-southeast1',
            description: 'Docker repository for Todo App',
        });

        // Bucket for Postgres backup
        const backupBucket = new gcp.storage.Bucket('todo-postgres-backups', {
            location: 'ASIA-SOUTHEAST1',
            uniformBucketLevelAccess: true,
            lifecycleRules: [
                {
                    action: { type: 'Delete' },
                    condition: { age: 30 }, // auto-delete after 30 days
                },
            ],
        });

        // VM Runtime Service Account
        const runtimeSA = new gcp.serviceaccount.Account('vm-runtime-sa', {
            accountId: 'todo-vm-runtime',
            displayName: 'Service Account for Todo VM Runtime',
        });

        // Github Actions Service Account
        const deployerSA = new gcp.serviceaccount.Account(
            'github-deployer-sa',
            {
                accountId: 'todo-github-deployer',
                displayName: 'Service Account for Github Actions CI/CD',
            },
        );

        // Permissions for the RUNTIME (The VM)
        // Pull images from the repo we just created
        new gcp.artifactregistry.RepositoryIamMember('runtime-pull-perm', {
            repository: repository.name,
            location: repository.location,
            role: 'roles/artifactregistry.reader',
            member: $interpolate`serviceAccount:${runtimeSA.email}`,
        });

        // Write logs
        new gcp.projects.IAMMember('runtime-log-perm', {
            project: gcp.config.project,
            role: 'roles/logging.logWriter',
            member: $interpolate`serviceAccount:${runtimeSA.email}`,
        });

        // Write to Backup Bucket
        new gcp.storage.BucketIAMMember('runtime-bucket-perm', {
            bucket: backupBucket.name,
            role: 'roles/storage.objectAdmin',
            member: $interpolate`serviceAccount:${runtimeSA.email}`,
        });

        // Permissions for the DEPLOYER (GitHub Actions)
        // Push images to Registry
        new gcp.artifactregistry.RepositoryIamMember('deployer-push-perm', {
            repository: repository.name,
            location: repository.location,
            role: 'roles/artifactregistry.writer',
            member: $interpolate`serviceAccount:${deployerSA.email}`,
        });

        // Allow GitHub to talk to the VM and use the Runtime SA
        new gcp.projects.IAMMember('deployer-compute-perm', {
            project: gcp.config.project,
            role: 'roles/compute.instanceAdmin.v1',
            member: $interpolate`serviceAccount:${deployerSA.email}`,
        });

        new gcp.projects.IAMMember('deployer-iap-perm', {
            project: gcp.config.project,
            role: 'roles/iap.tunnelResourceAccessor',
            member: $interpolate`serviceAccount:${deployerSA.email}`,
        });

        // Allows GitHub to "act as" the runtime SA when deploying the VM
        new gcp.serviceaccount.IAMMember('deployer-sa-user', {
            serviceAccountId: runtimeSA.name,
            role: 'roles/iam.serviceAccountUser',
            member: $interpolate`serviceAccount:${deployerSA.email}`,
        });

        // Open only port 80 (HTTP) and 443 (HTTPS)
        const webFirewall = new gcp.compute.Firewall('allow-todo-web', {
            network: 'default',
            allows: [
                {
                    protocol: 'tcp',
                    ports: ['80', '443'],
                },
            ],
            sourceRanges: ['0.0.0.0/0'],
            targetTags: ['todo-iac-vm'],
        });

        // Restrict port 22 so only Google's internal proxy servers can SSH to the VM
        const iapFirewall = new gcp.compute.Firewall('allow-ssh-from-iap', {
            network: 'default',
            allows: [
                {
                    protocol: 'tcp',
                    ports: ['22'],
                },
            ],
            sourceRanges: ['35.235.240.0/20'],
            targetTags: ['todo-iac-vm'],
        });

        const vm = new gcp.compute.Instance('todo-swarm-manager-iac', {
            machineType: 'e2-micro',
            zone: 'asia-southeast1-a',
            allowStoppingForUpdate: true,
            bootDisk: {
                initializeParams: {
                    image: 'ubuntu-minimal-2404-noble-amd64-v20260219',
                },
            },
            tags: ['http-server', 'https-server', 'todo-iac-vm'],
            networkInterfaces: [
                {
                    network: 'default',
                    accessConfigs: [{}],
                },
            ],
            serviceAccount: {
                email: runtimeSA.email,
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            },
            metadataStartupScript: $interpolate`
                #!/bin/bash
                # Update packages and install dockers
                sudo apt-get update
                sudo apt-get install -y docker.io cron

                # Start and enable Docker
                sudo systemctl start docker
                sudo systemctl enable docker

                # Configure docker credential helper for Artifact Registry
                sudo gcloud auth configure-docker asia-southeast1-docker.pkg.dev --quiet

                # Initialize Swarm (only if not already initialized)
                if ! docker info | grep -q "Swarm: active"; then
                docker swarm init
                fi

                # Create overlay network if it does not exist
                if ! docker network ls --format '{{.Name}}' | grep -q "^traefik-public$"; then
                docker network create -d overlay traefik-public
                fi
            `,
        });

        return {
            vmExternalIp: vm.networkInterfaces[0].accessConfigs[0].natIp,
            wifProvider: poolProvider.name,
            deployerEmail: deployerSA.email,
        };
    },
});
