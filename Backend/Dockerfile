# Survivor_Pool/Backend/Dockerfile
# Multi-stage build for a TypeScript + Prisma Express API
FROM node:20-alpine AS deps
WORKDIR /app
COPY Survivor_Pool/Backend/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY Survivor_Pool/Backend/package*.json ./
RUN npm ci
COPY Survivor_Pool/Backend/ ./
# Generate Prisma client if schema exists
RUN if [ -f src/prisma/schema.prisma ]; then npx prisma generate --schema=src/prisma/schema.prisma; fi
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Copy only built artifacts and production deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Ensure Prisma client is present in production image
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma || true
# If you serve static files, copy them here (optional)
EXPOSE 3000
CMD ["node", "dist/app.js"]
