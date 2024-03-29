import express, { Express } from 'express';
import dotenv from 'dotenv';
import { OpenAiController, PlatformController } from './controllers';
import { HumanMessage, PlatformApiData, SystemMessage } from './models';
import { isNil, uniq } from 'lodash';
import { ChatCompletion } from 'openai/resources';

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

  private async inpromptTask(): Promise<void> {
    const { input, question }: PlatformApiData = await this.platformController.getTaskData('inprompt');
    if (isNil(input) || isNil(question)) {
      return;
    }
    const allAvailableNames: string[] = uniq(input?.map((item: string) => item.replace(/ .*/,'')));
    const targetName: string = allAvailableNames.find((name: string) => question?.includes(name))!;
    const targetInputs: string[] = input?.filter((item: string) => item.includes(targetName));
    const user: HumanMessage = new HumanMessage(question);
    const system: SystemMessage = new SystemMessage(`answer using only using following information: ${targetInputs.join('.')}`);
    const response: ChatCompletion = await this.openAIController.getChatCompletion([user, system]);
    const choice: ChatCompletion.Choice | undefined = response.choices.find((choice) => !isNil(choice));
    if (isNil(choice) || isNil(choice?.message?.content)) {
      return;
    }
    const result: string = choice.message.content;
    await this.platformController.sendAnswer(result);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.inpromptTask();
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
