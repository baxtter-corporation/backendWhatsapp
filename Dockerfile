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

FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts and necessary runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
