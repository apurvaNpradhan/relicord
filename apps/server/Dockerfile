############################
# Builder stage
############################
FROM node:20-alpine AS builder

WORKDIR /build

# Enable pnpm
RUN corepack enable

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy packages (shared libs)
COPY packages ./packages

# Copy server app
COPY apps/server ./apps/server

# Install deps for entire workspace
RUN pnpm install --frozen-lockfile

# Build only the server app
WORKDIR /build/apps/server
RUN pnpm run build

############################
# Production stage
############################
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Enable pnpm in prod image if runtime deps are needed
RUN corepack enable

# Copy only runtime files
COPY --from=builder /build/apps/server/dist ./dist
COPY --from=builder /build/apps/server/package.json ./

# If server depends on workspace packages at runtime:
COPY --from=builder /build/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
