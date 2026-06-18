# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
