# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc -p tsconfig.build.json \
 && test -f dist/main.js \
 || { echo "ERROR: dist/main.js was not produced"; ls -laR dist/ 2>/dev/null; exit 1; }

# ---- production stage ----
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
