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
        const firewall = new gcp.compute.Firewall('todo-vm-firewall', {
            network: 'default',
            allows: [
                {
                    protocol: 'tcp',
                    ports: ['80', '3000'],
                },
            ],
            sourceRanges: ['0.0.0.0/0'],
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
                email: '985227244631-compute@developer.gserviceaccount.com',
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
