import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';
import { PlatformApiData } from './models';
import dotenv from 'dotenv';
dotenv.config();

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

  private async taskMeme(): Promise<void> {
    const { text, image }: PlatformApiData = await this.platformController.getTaskData<{ text: string, image: string }>('meme');
    const body: string = JSON.stringify({
      template: 'clumsy-scorpions-scrub-brightly-1065',
      data: {
        'TEXT.text': text,
        'NAME.src': image,
      }
    });
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.RENDER_FORM_API_KEY ?? '',
    };
    const renderFormMemeTemplate = await fetch(`https://get.renderform.io/api/v2/render`, {
      method: 'POST',
      body,
      headers,
    });
    const { href } = (await renderFormMemeTemplate.json()) as unknown as { href: string };
    await this.platformController.sendAnswer(href);

  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskMeme();
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
