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
        // Open port 3000 so everyone can view the application running
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
            tags: ['http-server', 'todo-iac-vm'],
            networkInterfaces: [
                {
                    network: 'default',
                    accessConfigs: [{}],
                },
            ],
            serviceAccount: {
                email: 'todo-vm-runtime@voltarocks-42-sandbox.iam.gserviceaccount.com',
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            },
            metadataStartupScript: `
                #!/bin/bash
                # Update packages and install dockers
                sudo apt-get update
                sudo apt-get install -y docker.io

                # Start and enable Docker
                sudo systemctl start docker
                sudo systemctl enable docker

                # Initialize Docker Swarm
                sudo docker swarm init
            `,
        });

        return {
            vmExternalIp: vm.networkInterfaces[0].accessConfigs[0].natIp,
        };
    },
});
