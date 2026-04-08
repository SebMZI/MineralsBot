# Use Node.js 20 LTS
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S discordbot -u 1001

# Change ownership of app directory
RUN chown -R discordbot:nodejs /app
USER discordbot

# Expose port (if needed for health checks)
EXPOSE 3000

# Default command
CMD ["pnpm", "run", "start"]