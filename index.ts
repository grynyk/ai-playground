import Server from './server';

const PORT: number = parseInt(process.env.PORT || '4200');
const server: Server = new Server();
const starter: Promise<void> = server
  .start(PORT)
  .then((PORT): void => {
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log(`Server is running on http://localhost:${PORT}\n`);
  })
  .catch((error: Object): void => {
    throw(error);
  });

export default starter;
