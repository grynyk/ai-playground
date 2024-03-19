import express, { Express } from 'express';
import TaskController from './controllers/task.controller';
import dotenv from 'dotenv';
import { PlatformApiData } from './models';
dotenv.config();

// const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

class Server {
  private app: Express;
  private taskController: TaskController;

  constructor() {
    this.app = express();
    this.taskController = new TaskController();
  }

  /**
   * First Task: 'helloapi'
   **/
  async helloApi(): Promise<void> {
    const taskDescResponse: PlatformApiData = await this.taskController.getDescription('helloapi');
    const { cookie } = taskDescResponse;
    const { token } = taskDescResponse;
    await this.taskController.sendAnswer(token, cookie);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.helloApi();
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
