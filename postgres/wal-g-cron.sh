#!/bin/sh
# /usr/local/bin/wal-g-cron.sh
# run as postgres
set -e

# Export WALG settings (read from env or defaults)
export WALG_GS_PREFIX="${WALG_GS_PREFIX:-gs://todo-postgres-backups}"
export WALG_COMPRESSION_METHOD="${WALG_COMPRESSION_METHOD:-brotli}"

# small delay to ensure DB is ready
sleep 10

# Run wal-g backup-push; on failure, log error
wal-g backup-push /var/lib/postgresql/data || echo "wal-g backup failed: $?" >&2