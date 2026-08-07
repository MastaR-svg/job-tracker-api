# ============================================================
# Multi-Stage Dockerfile for Job Tracker API
# Stage 1 (builder): installs deps and compiles TypeScript
# Stage 2 (production): lean runtime image with only what's needed
# ============================================================

# ── Stage 1: Builder ──────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build tools needed for native modules (bcrypt uses them)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first — Docker layer caching
# If package.json hasn't changed, this layer is cached and
# npm ci is skipped on rebuilds (saves ~30 seconds each time)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove devDependencies after build — production only
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS production

# Security: don't run as root
# Create a non-root user for running the app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy only what's needed from builder
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

# Create uploads directory with correct permissions
RUN mkdir -p uploads/resumes && \
    chown -R appuser:nodejs uploads

# Switch to non-root user
USER appuser

# Document the port (doesn't actually expose it — that's in compose)
EXPOSE 5000

# Health check — Docker will mark container unhealthy if this fails
# Kubernetes and load balancers use this to route traffic
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })" \
  || exit 1

# Start the compiled app — NOT ts-node (that's for development only)
CMD ["node", "dist/index.js"]
