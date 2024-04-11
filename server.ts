import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import { ChatMessage, MessageContent } from 'langchain/schema';
import { Transcription } from 'openai/resources/audio/transcriptions';

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
  }

  private async taskFunctions(): Promise<void> {
    const taskData = await this.platformController.getTaskData('functions');
    console.log(taskData);
    const addUserFunctionSchema = {
      name: 'addUser',
      description: 'add new user',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'first name',
          },
          surname: {
            type: 'string',
            description: 'last name',
          },
          year: {
            type: 'integer',
            description: 'year of birth',
          },
        },
      },
      required: ['name', 'surname', 'year'],
    };
    this.platformController.sendAnswer(addUserFunctionSchema);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskFunctions();
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
