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

  private async taskWhoami(): Promise<void> {
    let systemMessageText: string  = '';
    const hints: string[] = [];
    let result: { isKnownPerson: boolean; personName: string | null; } = { isKnownPerson: false, personName: null };
    while(true) {
      const { msg, hint }: PlatformApiData = await this.platformController.getTaskData('whoami');
      systemMessageText+=`${msg}. Answer strictly with JSON format: "{ isKnownPerson: true/false, personName: null/personName}" as string`;
      hints.push(hint!);
      const userMessage: HumanMessage = new HumanMessage(hints.join(','));
      const systemMessage: SystemMessage = new SystemMessage(systemMessageText);
      const messageContent: MessageContent = await this.openAIController.getChatContent([systemMessage, userMessage]);
      result = JSON.parse(messageContent as string);
      if (result.isKnownPerson) {
        await this.platformController.sendAnswer(result.personName);
        break;
      }
    }
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskWhoami();
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
