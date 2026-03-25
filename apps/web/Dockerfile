# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json

COPY packages/shared/package.json packages/shared/package.json

RUN yarn install --immutable

# ---- build ----
FROM deps AS builder
COPY . .

RUN yarn workspace @towers/shared build
RUN yarn workspace @towers/web build

# ---- runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]