import express, { Express } from 'express';
import dotenv from 'dotenv';
import { OpenAiController, PlatformController } from './controllers';
import { ChatCompletion, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { isNil } from 'lodash';

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

  private async bloggerTask(): Promise<void> {
    const { token, blog } = await this.platformController.getTaskData('blogger');
    const user: ChatCompletionUserMessageParam = { role: 'user', content: `${blog!.join('.')}` };
    const system: ChatCompletionSystemMessageParam = { role: 'system', content: 
    `You are an assistant who helps to write a blog strictly according to provided content topics list using same language.
    Result should be provided in array JSON format "{ "answer": []}".`}
    const response: ChatCompletion = await this.openAIController.getChatCompletion([user, system]);
    const choice: ChatCompletion.Choice | undefined = response.choices.find((choice) => !isNil(choice));
    if (isNil(choice) || isNil(choice?.message?.content)) {
      return;
    }
    const result: { answer: string[] } = JSON.parse(choice.message.content);
    await this.platformController.sendAnswer(token, result.answer);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.bloggerTask();
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
