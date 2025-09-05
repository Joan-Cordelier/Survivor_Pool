# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install full deps (incl. prisma as devDep)
COPY Backend/package*.json ./
RUN npm ci

# Copy source and build
COPY Backend/ ./
# Generate Prisma client if schema exists (safe even if it doesn't)
RUN npx prisma generate --schema=src/prisma/schema.prisma || true
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Bring over deps from builder, then prune dev deps to keep image small
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Bring built app
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/app.js"]
