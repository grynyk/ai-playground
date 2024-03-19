import express, { Express } from 'express';
import dotenv from 'dotenv';
import PlatformController from './controllers/platform.controller';
dotenv.config();

// const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

class Server {
  private app: Express;
  private platformController: PlatformController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
  }

  public start: (PORT: number) => Promise<unknown> = (PORT: number) => {
    return new Promise((resolve, reject): void => {
      this.app
        .listen(PORT, (): void => {
          resolve(PORT);
          this.onInit();
        })
        .on('error', (err: Object) => reject(err));
    });
  };
}

export default Server;
