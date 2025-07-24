# Use Node.js LTS (Long Term Support) version as base image
# Alpine Linux variant is smaller and more secure
FROM node:20-alpine

# Set working directory inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# Copy package files first (before source code)
# This allows Docker to cache the dependency installation layer
# If package.json hasn't changed, Docker will reuse the cached layer
COPY package*.json ./

# Install production dependencies only
# --omit=dev excludes devDependencies to keep image smaller
RUN npm ci --omit=dev

# Copy the rest of the application source code
# Done after npm install so code changes don't invalidate dependency cache
COPY . .

# Create a non-root user to run the application (security best practice)
# Running as root in containers is a security risk
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose port 3000 (documentation purposes, doesn't actually publish the port)
EXPOSE 3000

# Define the command to run when container starts
# Using node instead of npm start avoids an extra process
CMD ["node", "index.js"]