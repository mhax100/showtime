# Multi-stage build to reduce final image size
# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
# nginx:alpine is a lightweight web server perfect for serving static files
FROM nginx:alpine

# Copy custom nginx configuration
# We'll create this file next to handle API proxying
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from the builder stage
# Vite outputs to 'dist' directory by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# nginx runs in foreground by default in Docker
CMD ["nginx", "-g", "daemon off;"]