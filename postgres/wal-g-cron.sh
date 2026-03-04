#!/bin/sh
# run as root in cron, runs wal-g backup-push as postgres user
export WALG_GS_PREFIX="${WALG_GS_PREFIX:-gs://todo-postgres-backups}"
export WALG_COMPRESSION_METHOD="${WALG_COMPRESSION_METHOD:-brotli}"

# Wait a short time to ensure DB started (safe-guard)
sleep 10

# Run backup-push as postgres user so it uses the local data dir safely
su -s /bin/sh postgres -c "wal-g backup-push /var/lib/postgresql/data || echo 'wal-g backup failed: $?'" 