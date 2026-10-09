#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
backup_dir=${BACKUP_DIR:?BACKUP_DIR is required}
retention_days=${BACKUP_RETENTION_DAYS:-30}
mkdir -p "$backup_dir"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
tmp="$backup_dir/.topica-$stamp.dump.tmp"
out="$backup_dir/topica-$stamp.dump"
pg_dump --format=custom --no-owner --file="$tmp" "$DATABASE_URL"
mv "$tmp" "$out"
find "$backup_dir" -type f -name 'topica-*.dump' -mtime "+$retention_days" -delete
printf '{"event":"postgres_backup_succeeded","file":"%s","at":"%s"}\n' "$out" "$stamp"
