import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';
import { PlatformApiData } from './models';
import { getPageContent } from './helpers';
import { isNil } from 'lodash';

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
  }

  private async taskScraper(): Promise<void> {
    const { msg, input, question }: PlatformApiData = await this.platformController.getTaskData<{
      msg: string;
      input: string;
      question: string;
    }>('scraper');

    const content: string | null = await getPageContent(input, 'pre');
    if (isNil(content)) {
      return;
    }
    const hasError: boolean = content.includes('server error X_X') || content.includes('bot detected!') || content.includes('timeout error');
    if (hasError) {
      console.error('Error', content);
    } else {
      const humanMessage: HumanMessage = new HumanMessage(`${question}`);
      const systemMessage: SystemMessage = new SystemMessage(`${msg}. Given article: ${content}`)
      const answer: MessageContent = await this.openAIController.getChatContent([humanMessage, systemMessage]);
      await this.platformController.sendAnswer(answer);
    }
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskScraper();
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
