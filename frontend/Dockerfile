# Build Stage
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
# Install dependencies using npm install for better cross-platform compatibility
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Default nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    client_max_body_size 100M; \
    resolver 127.0.0.11 valid=30s; \
    \
    location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
    } \
    \
    location /api/ { \
    proxy_pass http://backend:5000/api/; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    proxy_set_header Host $host; \
    proxy_cache_bypass $http_upgrade; \
    } \
    \
    location /uploads/ { \
    proxy_pass http://backend:5000/uploads/; \
    proxy_set_header Host $host; \
    } \
    }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
