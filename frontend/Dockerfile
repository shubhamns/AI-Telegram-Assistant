FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN test -n "$VITE_API_URL"
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./
COPY src ./src
RUN npm run build
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
