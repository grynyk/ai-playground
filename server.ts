import express, { Express } from 'express';
import dotenv from 'dotenv';
import { OpenAiController, PlatformController } from './controllers';
import { Moderation, ModerationCreateResponse } from 'openai/resources';

dotenv.config();

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
  }

  private async moderationTask(): Promise<void> {
    const { token, input } = await this.platformController.getTaskData('moderation');
    const response: ModerationCreateResponse = await this.openAIController.getModerationForInput(input!);
    const result: number[] = response.results.map((item: Moderation) => Number(item.flagged));
    await this.platformController.sendAnswer(token, result);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.moderationTask();
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
