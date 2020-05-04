import server from './server';

const port = process.env.PORT || 3000;

const initialise = async () => {
  await server.listen({port});
};

initialise().then(() => {
  console.log(`🚀 Server is running on localhost: ${port}`);
});
