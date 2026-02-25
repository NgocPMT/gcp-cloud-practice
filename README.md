# Todo App GCP Docker Practice

This project is an example application for practicing Google Cloud Platform (GCP) deployments using Docker and GitHub Actions. The app demonstrates how to build a Docker image, push it to GCP Artifact Registry, and deploy it to a Compute Engine VM, with the entire process automated via GitHub Actions.

## Features

-   **Todo List API**: A simple RESTful API for managing todo items (add, update, delete, list).
-   **Frontend**: React-based UI served via Express static files.
-   **Persistence**: Supports both SQLite and MySQL backends.
-   **Dockerized**: Fully containerized for local development and production.
-   **GCP Integration**: Automated build, push, and deployment to GCP using GitHub Actions.
-   **Docker Swarm Orchestration**: Uses Docker Swarm on the Compute Engine VM to orchestrate containers in production.

## Tech Stack

-   **Backend**: Node.js (Express)
-   **Frontend**: React, React-Bootstrap
-   **Database**: SQLite (default) or MySQL (via Docker Compose)
-   **Containerization**: Docker, Docker Compose, Docker Swarm
-   **CI/CD**: GitHub Actions
-   **Cloud**: GCP Artifact Registry, Compute Engine

## Project Structure

```
docker-compose.yml
Dockerfile
.dockerignore
.gitignore
package.json
sst.config.ts
sst-env.d.ts
tsconfig.json
src/
  index.js
  persistence/
    index.js
    mysql.js
    sqlite.js
  routes/
    addItem.js
    deleteItem.js
    getItems.js
    updateItem.js
  static/
    index.html
    css/
      bootstrap.min.css
      styles.css
      font-awesome/
        all.min.css
        ...
    js/
      app.js
      babel.min.js
      react-bootstrap.js
      react-dom.production.min.js
      react.production.min.js
```

## Local Development

### Prerequisites

-   Docker & Docker Compose
-   Node.js (for local runs)
-   Bun (package manager)

### Running Locally

1. **With Docker Compose (MySQL):**

    ```bash
    docker-compose up -d
    ```

    - App runs on [http://localhost:3000](http://localhost:3000)
    - MySQL is used as backend

2. **Without Docker (SQLite):**

    ```bash
    bun install
    bun run dev
    ```

    - App runs on [http://localhost:3000](http://localhost:3000)
    - SQLite is used as backend

## Infrastructure as Code (IaC) with SST

This project now uses [SST](https://sst.dev/) to provision and manage GCP infrastructure automatically, instead of manual setup. The `sst.config.ts` file defines:

-   GCP project, region, and zone
-   Firewall rules for VM access
-   Compute Engine VM creation and configuration
-   Automatic Docker installation and Swarm initialization on the VM

To deploy or update infrastructure, use SST commands. See [SST documentation](https://docs.sst.dev/) for details.

### Key SST Files

-   `sst.config.ts`: Main infrastructure configuration
-   `sst-env.d.ts`: SST-generated environment typings
-   `.sst/`: SST state and build artifacts
-   `tsconfig.json`: TypeScript config for SST

## Deployment Workflow (GCP)

Deployment is automated via GitHub Actions and Docker Swarm:

-   On push to `main`, the workflow:
    1. Authenticates to GCP
    2. Configures Docker for Artifact Registry
    3. Builds and pushes the Docker image to Artifact Registry
    4. Logs in to Artifact Registry on the VM
    5. Updates or creates the Docker Swarm service for the app

See `.github/workflows/deploy.yml` for details.

## IAM Access Matrix

| Identity                                | Target Resource            | Required IAM Role             | Description                                                                                                                                                   |
| :-------------------------------------- | :------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. GitHub Actions SA**<br>_(Builder)_ | Artifact Registry          | `Artifact Registry Writer`    | Needs permission to upload new Docker images after compiling your TypeScript code.                                                                            |
|                                         | Compute Engine VM          | `Compute Instance Admin (v1)` | Needs permission to query the VM's status and network tags to find it.                                                                                        |
|                                         | IAP (Identity-Aware Proxy) | `IAP-secured Tunnel User`     | Needs permission to securely tunnel through Google's firewall to reach port 22 (SSH).                                                                         |
|                                         | VM's Service Account       | `Service Account User`        | _Crucial:_ Because the VM wears an ID badge, GitHub Actions needs permission to "impersonate" or interact with that specific badge to run commands on the VM. |
| **2. GCE VM Custom SA**<br>_(Runtime)_  | Artifact Registry          | `Artifact Registry Reader`    | The VM only needs to _download_ images to run them in Docker Swarm. It should never be allowed to upload/overwrite images.                                    |
|                                         | Cloud Logging              | `Logs Writer`                 | The VM needs permission to stream its internal Docker logs out to the GCP Console.                                                                            |

## Environment Variables

-   `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`: Used for MySQL configuration in Docker Compose.
-   `SQLITE_DB_LOCATION`: Optional, sets SQLite DB file location.

## License

MIT

---

**Practice Focus:**

-   GCP Artifact Registry
-   Compute Engine deployment
-   Docker image automation
-   Docker Swarm orchestration
-   GitHub Actions CI/CD
-   Infrastructure as Code (SST)
-   Least-privileges IAM Roles Design

---

For any issues or questions, please open an issue or contact the maintainer.
