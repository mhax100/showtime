#!/bin/sh
# Docker entrypoint script that handles database initialization

echo "🚀 Starting Showtime app..."

# Wait for database to be ready (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for database to be ready..."
  
  # Extract connection details from DATABASE_URL
  # Format: postgres://user:password@host:port/database
  DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
  
  # Wait for database to accept connections
  until nc -z $DB_HOST $DB_PORT; do
    echo "Waiting for database at $DB_HOST:$DB_PORT..."
    sleep 2
  done
  
  echo "✅ Database is ready!"
  
  # Run migrations if INIT_DB is set
  if [ "$INIT_DB" = "true" ]; then
    echo "📝 Running database migrations..."
    psql $DATABASE_URL < /app/api/schema.sql || echo "⚠️  Migrations may have already been applied"
  fi
fi

# Start supervisor to run both nginx and node
exec /usr/bin/supervisord -c /etc/supervisord.conf