FROM postgres:15-alpine

RUN apk add --no-cache curl bash ca-certificates openrc tzdata busybox-suid

# Install WAL-G
RUN curl -fSL https://github.com/wal-g/wal-g/releases/download/v3.0.8/wal-g-pg-24.04-amd64.tar.gz \
    -o /tmp/wal-g.tar.gz \
    && tar -xzvf /tmp/wal-g.tar.gz -C /usr/local/bin \
    && rm /tmp/wal-g.tar.gz \
    && find /usr/local/bin -type f -name "wal-g*" -exec mv {} /usr/local/bin/wal-g \; \
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