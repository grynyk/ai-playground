import express, { Express } from 'express';
import dotenv from 'dotenv';
import { PlatformController } from './controllers';
import { PlatformApiData } from './models';

dotenv.config();

class Server {
  private app: Express;
  private platformController: PlatformController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
  }

  /**
   * First Task: 'helloapi'
   **/
  async helloApi(): Promise<void> {
    const taskData: PlatformApiData = await this.platformController.getTaskData('helloapi');
    const { cookie } = taskData;
    const { token } = taskData;
    await this.platformController.sendAnswer(token, cookie);
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
