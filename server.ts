import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;
  private qdrantController: QdrantController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
    this.qdrantController = new QdrantController();
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
