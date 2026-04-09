# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

COPY packages/shared/package.json packages/shared/package.json

RUN yarn install --immutable

# ---- build ----
FROM deps AS builder
COPY . .

RUN yarn exec biome check packages/shared
RUN yarn workspace @towers/shared build

RUN yarn exec biome check apps/api
RUN yarn workspace @towers/api build

# ---- runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=builder /app ./

USER nestjs
EXPOSE 3001

CMD ["yarn", "workspace", "@towers/api", "start:prod"]