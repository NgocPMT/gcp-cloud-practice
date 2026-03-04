FROM postgres:15-alpine

# Use root to install and write system files
USER root

# Install deps
RUN apk add --no-cache curl ca-certificates tar bash libc6-compat

# WAL-G version + asset
ARG WALG_VERSION=v3.0.8
ARG WALG_ASSET=wal-g-pg-24.04-amd64.tar.gz
ARG WALG_URL=https://github.com/wal-g/wal-g/releases/download/${WALG_VERSION}/${WALG_ASSET}

# Download + extract WAL-G, normalize binary name
RUN curl -fSL "${WALG_URL}" -o /tmp/wal-g.tar.gz \
 && tar -xzvf /tmp/wal-g.tar.gz -C /usr/local/bin \
 && rm /tmp/wal-g.tar.gz \
 && find /usr/local/bin -type f -name "wal-g*" -exec mv {} /usr/local/bin/wal-g \; || true \
 && chmod +x /usr/local/bin/wal-g \
 && chown postgres:postgres /usr/local/bin/wal-g

# copy cron script and wrapper
COPY wal-g-cron.sh /usr/local/bin/wal-g-cron.sh
COPY docker-entrypoint-wrapper.sh /usr/local/bin/docker-entrypoint-wrapper.sh

# fix permissions and install cron schedule
RUN chmod +x /usr/local/bin/wal-g-cron.sh /usr/local/bin/docker-entrypoint-wrapper.sh \
 && touch /var/log/wal-g-cron.log \
 && chown postgres:postgres /var/log/wal-g-cron.log \
 # create crontab file for postgres user — format: (minute hour day month dow command)
 && printf '%s\n' "0 2 * * * /usr/local/bin/wal-g-cron.sh >> /var/log/wal-g-cron.log 2>&1" > /etc/crontabs/postgres \
 && chmod 0644 /etc/crontabs/postgres

# Ensure wrapper is the entrypoint, keep original default CMD
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-wrapper.sh"]
# default CMD: the original postgres image uses ["postgres"] by default, so keep none or use below
CMD ["postgres"]

# Run container as postgres (like base image)
USER postgres