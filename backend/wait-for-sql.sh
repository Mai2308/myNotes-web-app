#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

until /opt/mssql-tools/bin/sqlcmd -S $host -U SA -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; do
  echo "Waiting for SQL Server at $host..."
  sleep 5
done

exec $cmd