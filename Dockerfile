FROM node:20.14-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# See https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine for why libc6-compat may be needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies according to preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then \
  corepack enable && \
  yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
  npm config set registry https://registry.npmmirror.com && \
  npm ci; \
  elif [ -f pnpm-lock.yaml ]; then \
  corepack enable pnpm && \
  pnpm config set registry https://registry.npmmirror.com && \
  pnpm i --frozen-lockfile; \
  else \
  echo "No lock file found." && exit 1; \
  fi

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_DEFAULT_SHARE_DIR=/mnt/azure/shared

RUN pwd
RUN ls -a

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN \
  if [ -f yarn.lock ]; then corepack enable yarn && yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "No lock file found." && exit 1; \
  fi;


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
