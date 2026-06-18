# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN rm -f tsconfig.build.tsbuildinfo && npm run build && test -f dist/main.js || (echo "ERROR: dist/main.js missing after build" && exit 1)

# ---- production stage ----
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
