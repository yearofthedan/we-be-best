FROM node:latest as spa-build-stage
WORKDIR /app
COPY spa/package*.json ./
ENV CYPRESS_INSTALL_BINARY=0
RUN yarn
COPY spa .
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:latest as server-build-stage
WORKDIR /app/server
COPY server/package*.json ./
RUN yarn
COPY . /app
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:latest as production-stage
WORKDIR /app
COPY --from=server-build-stage /app/server/dist /app
COPY --from=server-build-stage /app/server/node_modules /app/node_modules
ENV SPA_PATH=/app/spa
COPY --from=spa-build-stage /app/dist /app/spa
CMD node index.js
