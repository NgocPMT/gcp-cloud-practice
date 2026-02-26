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
                    ports: ['3000'],
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

        const privateIpBlock = new gcp.compute.GlobalAddress(
            'private-ip-block',
            {
                purpose: 'VPC_PEERING',
                addressType: 'INTERNAL',
                prefixLength: 24,
                network:
                    'projects/voltarocks-42-sandbox/global/networks/default',
            },
        );

        const privateVpcConnection = new gcp.servicenetworking.Connection(
            'private-vpc-connection',
            {
                network:
                    'projects/voltarocks-42-sandbox/global/networks/default',
                service: 'servicenetworking.googleapis.com',
                reservedPeeringRanges: [privateIpBlock.name],
            },
        );

        const sqlInstance = new gcp.sql.DatabaseInstance(
            'todo-mysql-instance',
            {
                databaseVersion: 'MYSQL_8_0',
                region: 'asia-southeast1',
                settings: {
                    tier: 'db-f1-micro',
                    ipConfiguration: {
                        ipv4Enabled: false,
                        privateNetwork:
                            'projects/voltarocks-42-sandbox/global/networks/default',
                    },
                },
                deletionProtection: false,
            },
            { dependsOn: [privateVpcConnection] },
        );

        const todoDb = new gcp.sql.Database('todo-db', {
            instance: sqlInstance.name,
            name: 'todos_db',
        });

        const todoDbUser = new gcp.sql.User('todo-db-user', {
            instance: sqlInstance.name,
            name: 'todo_admin',
            password: 'super-super-secret-password', // Hardcode for dev demo, VERY BAD for production
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
            databasePrivateIp: sqlInstance.privateIpAddress,
        };
    },
});
