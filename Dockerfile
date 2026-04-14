FROM node:24.14 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies using yarn
COPY package.json yarn.lock* ./

RUN corepack enable && yarn --frozen-lockfile

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_DEFAULT_SHARE_DIR=/mnt/azure/shared

RUN pwd
RUN ls -a

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN corepack enable yarn && yarn run build


# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set correct permissions for pre-rendered cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output tracking to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Persist data directory
RUN mkdir -p /app/shared && chmod -R 777 /app/shared

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD HOSTNAME="0.0.0.0" node server.js
