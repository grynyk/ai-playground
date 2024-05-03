import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';
import { PlatformApiData } from './models';
import { ChatCompletion } from 'openai/resources/chat/completions';

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

  private async taskGnome(): Promise<void> {
    const { msg, url }: PlatformApiData = await this.platformController.getTaskData<{ msg: string; url: string }>('gnome');
    const { choices }: ChatCompletion = await this.openAIController.getImageChatCompletion(msg, url);
    const { message } = choices[0];
    const result: string | null = message.content;
    await this.platformController.sendAnswer(result);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskGnome();
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
