FROM node:14.4 as build-stage
WORKDIR /app
COPY package.json package.json
COPY spa spa
COPY server server
COPY types types
COPY codegen.yml codegen.yml
RUN yarn install
RUN yarn generate-graphql-types
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:14.4 as production-stage
WORKDIR /app
COPY --from=build-stage /app/server/dist .
COPY --from=build-stage /app/server/node_modules ./node_modules
COPY --from=build-stage /app/server/launch.sh .
COPY --from=build-stage /app/spa/dist ./spa
CMD ./launch.sh
