import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { Task } from '../models';
import { isNil } from 'lodash';
import { logError } from '../helpers';
dotenv.config();

const AI_DEVS_URL: string | undefined = process.env.AI_DEVS_TASKS_URL;

class TaskController {

  public async getDescription(name: string): Promise<Task> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      const tokenResponse: AxiosResponse<Task> = await this.getToken(name);
      const token = tokenResponse?.data.token;
      if (isNil(token)) {
        throw new Error('task token was not provided');
      }
      const descriptionResponse: AxiosResponse = await axios.get(`${AI_DEVS_URL}/task/${token}`);
      console.log(`\tTASK DESCRIPTION:`, descriptionResponse?.data.msg);
      return {...descriptionResponse?.data, token };
    } catch (error) {
      logError(error);
      throw(error);
    }
  }

  public async sendAnswer(token: string, answer: string | undefined): Promise<void> {
    try {
      if (isNil(token) || isNil(answer)) {
        throw new Error('task token or answer was not provided');
      }
      const response: AxiosResponse = await axios.post(`${AI_DEVS_URL}/answer/${token}`, {
        answer,
      });
      console.log(`\nSubmit status:`, response?.data.note);
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    } catch (error) {
      logError(error);
      throw(error);
    }
  }

  private async getToken(name: string): Promise<AxiosResponse<Task>> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      const response: AxiosResponse = await axios.post(`${AI_DEVS_URL}/token/${name}`, {
        apikey: process.env.AI_DEVS_API_KEY,
      });
      console.log(`\tTASK TOKEN:`, response?.data.token);
      return response;
    } catch (error) {
      logError(error);
      throw(error);
    }
  }
}

export default TaskController;
