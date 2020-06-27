# we-be-best
Collaborative sticky notes on a shared whiteboard.

## Tech overview
_We Be Best_ is a VueJs frontend communicating with an Apollo Graphql server with mongodb for data storage.
Source code for the front and backend are in this repo under `spa` and `server`, respectively.

The `spa` and `server` folders have their own package.json and associated tasks.
The project root package.json has some scripts which mostly just call the same scripts in the spa and server folders.  

## Actions
You can run the following commands from project root:

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `yarn install`  | Install project dependencies for spa and server |
| `yarn lint`     | Lints spa and server                            |
| `yarn test`     | Runs the tests for spa and server               |
| `yarn serve`    | Serves the web app with hot reloading           |
| `yarn server`   | Starts the backend server                       |
| `yarn build`    | Production build of the the app and server      |
| ` yarn generate-graphql-types` | Generates types based upon .graphql files | 

We build a docker image for deployment. 
You can build the image and spin up a local container with `docker-compose up --build`.
