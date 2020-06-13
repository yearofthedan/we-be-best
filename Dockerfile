FROM node:alpine as spa-build-stage
WORKDIR /spa
COPY spa/package.json ./
ENV CYPRESS_INSTALL_BINARY=0
RUN yarn
COPY spa .
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:latest as server-build-stage
WORKDIR /server
COPY server/package.json .
RUN yarn
COPY server .
COPY spa /spa
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:latest as production-stage
WORKDIR /app
COPY --from=server-build-stage /server/dist .
COPY --from=server-build-stage /server/node_modules ./node_modules
COPY --from=server-build-stage /server/launch.sh .
COPY --from=spa-build-stage /spa/dist ./spa
CMD ./launch.sh
