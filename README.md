# Todo App GCP Docker, SST & Traefik Practice

This project is a practical example for deploying a Todo application on Google Cloud Platform (GCP) using Docker, Docker Swarm, Infrastructure as Code (IaC) with SST, and Traefik as a reverse proxy. It demonstrates building and pushing Docker images to Artifact Registry, provisioning infrastructure with SST, orchestrating containers on Compute Engine VMs using Docker Swarm, and securing/routing traffic with Traefik. The entire process is automated via GitHub Actions.

## Features

-   **Todo List API**: RESTful API for managing todo items (add, update, delete, list).
-   **Frontend**: React-based UI served via Express static files.
-   **Persistence**: PostgreSQL backends.
-   **Monitoring**: Prometheus configuration included for metrics collection.
-   **Reverse Proxy**: Traefik for HTTPS, routing, and automatic Let's Encrypt certificates.
-   **Dockerized**: Fully containerized for local development and production.
-   **Docker Swarm Orchestration**: Uses Docker Swarm on Compute Engine VM for container orchestration.
-   **IaC with SST**: Infrastructure is provisioned and managed automatically using SST.
-   **GCP Integration**: Automated build, push, and deployment to GCP using GitHub Actions.

## Tech Stack

-   **Backend**: Node.js (Express)
-   **Frontend**: React, React-Bootstrap
-   **Database**: PostgreSQL
-   **Containerization**: Docker, Docker Compose, Docker Swarm
-   **Reverse Proxy**: Traefik
-   **Monitoring**: Prometheus
-   **IaC**: SST (TypeScript)
-   **CI/CD**: GitHub Actions
-   **Cloud**: GCP Artifact Registry, Compute Engine

## Project Structure

```
.github/workflows/deploy.yml
.sst/                  # SST state (excluded)
node_modules/           # Dependencies (excluded)
src/
  index.js
  persistence/
    index.js
    mysql.js
    sqlite.js
    postgres.js
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
utils/
  index.js
  logger.js
Dockerfile
package.json
docker-compose.yml
  # Local development (Traefik, API, DB)
docker-compose.prod.yml
  # Production stack (Traefik, API, DB, labels, HTTPS)
sst.config.ts           # SST infrastructure config
sst-env.d.ts            # SST environment typings
prometheus.yml          # Prometheus config
.gitignore
bun.lock
tsconfig.json
```

## Local Development

### Prerequisites

-   Docker & Docker Compose
-   Node.js & Bun (for local runs)

### Running Locally

1. **With Docker Compose (MySQL/Postgres, Traefik):**

    ```bash
    docker-compose up -d
    ```

    - App runs on [http://localhost:80](http://localhost:80)
    - Traefik reverse proxy is enabled
    - MySQL or PostgreSQL is used as backend
    - Traefik dashboard available at [http://localhost:8080](http://localhost:8080)

2. **Without Docker (SQLite):**
    ```bash
    bun install
    bun run dev
    ```
    - App runs on [http://localhost:3000](http://localhost:3000)
    - SQLite is used as backend

## Infrastructure as Code (IaC) with SST

This project uses [SST](https://sst.dev/) to provision and manage GCP infrastructure automatically. The `sst.config.ts` file defines:

-   GCP project, region, and zone
-   Firewall rules for VM access
-   Compute Engine VM creation and configuration
-   Automatic Docker installation and Swarm initialization on the VM
-   Overlay network for Traefik

To deploy or update infrastructure, use SST commands. See [SST documentation](https://docs.sst.dev/) for details.

## Traefik Reverse Proxy

-   Traefik is used for HTTPS, routing, and automatic certificate management (Let's Encrypt).
-   In production, Traefik is deployed as a Swarm service and configured via labels in `docker-compose.prod.yml`.
-   Example domain: `ngocpmt-todo-app.duckdns.org` (see compose labels for routing).

## Monitoring

-   Prometheus is supported via `prometheus.yml` for metrics collection and monitoring.

## Deployment Workflow (GCP)

Deployment is automated via GitHub Actions and Docker Swarm:

-   On push to `main`, the workflow:
    1. Authenticates to GCP
    2. Configures Docker for Artifact Registry
    3. Builds and pushes the Docker image to Artifact Registry
    4. Discovers VM name by tag
    5. Copies production compose and Prometheus config to VM
    6. Logs in to Artifact Registry on the VM
    7. Deploys/updates the Docker Swarm stack with Traefik and API services

See `.github/workflows/deploy.yml` for details.

## Environment Variables

-   `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`: MySQL configuration
-   `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: PostgreSQL configuration
-   `SQLITE_DB_LOCATION`: Optional, sets SQLite DB file location

## License

MIT

---

**Practice Focus:**

-   GCP Artifact Registry
-   Compute Engine deployment
-   Docker image automation
-   Docker Swarm orchestration
-   Traefik reverse proxy & HTTPS
-   GitHub Actions CI/CD
-   Infrastructure as Code (SST)
-   Monitoring with Prometheus

---

For any issues or questions, please open an issue or contact the maintainer.
