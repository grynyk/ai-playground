import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';
import { PlatformApiData } from './models';
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

  private async getGuessedPersonName(systemMessageText: string, userMessageText: string): Promise<string> {
    const userMessage: HumanMessage = new HumanMessage(userMessageText);
    const systemMessage: SystemMessage = new SystemMessage(systemMessageText);
    const messageContent: MessageContent = await this.openAIController.getChatContent([systemMessage, userMessage]);
    return messageContent as string;
  }

  private async taskWhoami(): Promise<void> {
    let userMessageText: string = '';
    let isKnownPersonName: boolean = false;
    do {
      try {
        const { msg, hint }: PlatformApiData = await this.platformController.getTaskData('whoami');
        const systemMessageText: string  = `${msg}. Answer strictly with only name of person or null. without any annotations. Answer if you are sure.`;
        userMessageText += `${hint}`;
        const personName: string = await this.getGuessedPersonName(systemMessageText, userMessageText);
        isKnownPersonName = !isNil(personName);
        if (isKnownPersonName) {
          await this.platformController.sendAnswer(personName);
        }
      } catch(e: unknown) {
        isKnownPersonName = false;
        continue;
      }
    } while (!isKnownPersonName);
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
