#!/bin/sh
set -e

# Start cron daemon
crond

# Execute original Postgres entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"