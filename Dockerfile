FROM node:20-bullseye AS builder

# Ensure libatomic and basic build tools are present for native modules / Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
    ca-certificates \
    build-essential \
    python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install all dependencies (including dev) for the build
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files and run build. Prisma generate may require DB env — do not fail build on it.
COPY . .
RUN npm run db:generate || true
RUN npm run build
RUN npm prune --production

FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

EXPOSE 3000
CMD ["node", "dist/main"]
