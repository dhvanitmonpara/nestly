# Simple Dockerfile for Google Cloud Run
# Build: docker build -f Dockerfile.cloudrun -t nestly-server .
# Run:   docker run -p 8080:8080 --env-file .env nestly-server

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Cloud Run sets PORT automatically (default 8080)
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
