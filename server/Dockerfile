# -------- Build stage --------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests + prisma schema first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (need devDeps to build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# -------- Runtime stage --------
FROM node:20-alpine AS runtime

RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy only what's needed to run
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000
USER nodejs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]