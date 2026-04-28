# Build React
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Optional: custom config for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80