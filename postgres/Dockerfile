FROM postgres:15-alpine

RUN apk add --no-cache curl bash ca-certificates openrc tzdata busybox-suid

# Install WAL-G
RUN curl -L https://github.com/wal-g/wal-g/releases/latest/download/wal-g-pg-linux-amd64.tar.gz \
    | tar -xz -C /usr/local/bin \
    && mv /usr/local/bin/wal-g-pg-linux-amd64 /usr/local/bin/wal-g \
    && chmod +x /usr/local/bin/wal-g

# Add a cron script that runs backup daily at 02:00
USER root
RUN mkdir -p /etc/cron.d
COPY wal-g-cron.sh /usr/local/bin/wal-g-cron.sh
RUN chmod +x /user/local/bin/wal-g-cron.sh \
    && echo "0 2 * * * postgres /usr/local/bin/wal-g-cron.sh >> /var/log/wal-g-cron.log 2>&1" > /etc/cron.d/wal-g-cron \
    && chmod 0644 /etc/cron.d/wal-g-cron

RUN touch /var/log/wal-g-cron.log && chown postgres:postgres /var/log/wal-g-cron.log

USER postgres

RUN chown postgres:postgres /usr/local/bin/wal-g