# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_BASE_PATH=""
ENV NEXT_BASE_PATH=$NEXT_BASE_PATH
# NEXT_PUBLIC_* must be present at build time (inlined into the client bundle).
ARG NEXT_PUBLIC_SITE_URL=""
ARG PUBLIC_URL=""
ARG NEXT_PUBLIC_OPERATOR_NAME=""
ARG NEXT_PUBLIC_OPERATOR_INN=""
ARG NEXT_PUBLIC_OPERATOR_EMAIL=""
ARG NEXT_PUBLIC_OPERATOR_ADDRESS=""
ARG NEXT_PUBLIC_OPERATOR_RKN_NOTICE=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    PUBLIC_URL=$PUBLIC_URL \
    NEXT_PUBLIC_OPERATOR_NAME=$NEXT_PUBLIC_OPERATOR_NAME \
    NEXT_PUBLIC_OPERATOR_INN=$NEXT_PUBLIC_OPERATOR_INN \
    NEXT_PUBLIC_OPERATOR_EMAIL=$NEXT_PUBLIC_OPERATOR_EMAIL \
    NEXT_PUBLIC_OPERATOR_ADDRESS=$NEXT_PUBLIC_OPERATOR_ADDRESS \
    NEXT_PUBLIC_OPERATOR_RKN_NOTICE=$NEXT_PUBLIC_OPERATOR_RKN_NOTICE
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
