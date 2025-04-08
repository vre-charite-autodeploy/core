# Build React app source files
FROM node:12-alpine AS build

ARG PORTAL_ENV=prod

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN cp .env.template .env
RUN npm run build-${PORTAL_ENV}


# Setting up static server
FROM nginx:stable-alpine AS prod

RUN mkdir /app
# COPY --from=build /app/build /app
COPY --from=build /app/build /usr/share/nginx/html/vre
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
