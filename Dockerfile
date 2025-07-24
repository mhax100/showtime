# Production Dockerfile - Single container with nginx serving frontend and Node.js backend
# This approach works well for Fly.io deployment

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --omit=dev
COPY api/ ./

# Stage 3: Production image with nginx and Node.js
FROM nginx:alpine

# Install required packages
# - nodejs & npm: for running the backend
# - supervisor: for managing multiple processes
# - postgresql-client: for database operations (psql)
# - netcat-openbsd: for checking database connectivity
RUN apk add --no-cache nodejs npm supervisor postgresql-client netcat-openbsd

# Create app directory
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/api ./api

# Copy frontend build to nginx directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy configuration files
COPY production.nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY schema.sql /app/api/schema.sql

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /app/api

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Use the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]