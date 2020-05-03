FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
ENV CYPRESS_INSTALL_BINARY=0
RUN yarn
COPY ./ .
RUN yarn lint
RUN yarn test:unit
RUN yarn build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx/nginx.conf /etc/nginx/nginx.conf
