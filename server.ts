import express, { Express } from 'express';
import dotenv from 'dotenv';
import { OpenAiController, PlatformController } from './controllers';
import { ChatCompletion } from 'openai/resources';
import { isNil } from 'lodash';
import { HumanMessage, SystemMessage } from './models';

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

  private async liarTask(): Promise<void> {
    await this.platformController.getTaskData('liar');
    const question = 'what is the highest building of Ukraine?';
    const answer = await this.platformController.sendTaskQuestion('liar', question);
    const user: HumanMessage = new HumanMessage(question);
    const system: SystemMessage = new SystemMessage(`Return strictly YES or NO if the answer: "${answer}" was the accurate response for the question in prompt`);
    const response: ChatCompletion = await this.openAIController.getChatCompletion([user, system]);
    const choice: ChatCompletion.Choice | undefined = response.choices.find((choice) => !isNil(choice));
    if (isNil(choice) || isNil(choice?.message?.content)) {
      return;
    }
    await this.platformController.sendAnswer(choice.message.content);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.liarTask();
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
