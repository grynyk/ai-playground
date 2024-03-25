import axios, { AxiosInstance, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { PlatformApiData } from '../models';
import { isNil } from 'lodash';
dotenv.config();

const PLATFORM_URL: string | undefined = process.env.PLATFORM_URL;

class PlatformController {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: PLATFORM_URL,
      timeout: 20000,
    });
  }

  public async getTaskData(name: string): Promise<PlatformApiData> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      const token: string = await this.getToken(name);
      if (isNil(token)) {
        throw new Error('task token was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.get(`/task/${token}`);
      console.log(`\tTASK DESCRIPTION:`, response?.data.msg);
      console.log(`\n`, response?.data);
      return {...response?.data, token };
    } catch (error) {
      throw error;
    }
  }

  public async sendTaskQuestion(token: string, name: string, question: string): Promise<string> {
    try {
      if (isNil(name) || isNil(token)) {
        throw new Error('task name or token was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(
        `/task/${token}`,
        {
          question,
        },
        {
          headers: {
            'content-type': 'multipart/form-data',
          },
        }
      );
      console.log(`\tTASK ANSWER:`, response?.data.answer!);
      return response?.data.answer!;
    } catch (error) {
      throw error;
    }
  }

  public async sendAnswer(token: string, answer: unknown | undefined): Promise<void> {
    try {
      if (isNil(token) || isNil(answer)) {
        throw new Error('task token or answer was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(`/answer/${token}`, {
        answer,
      });
      console.log(`\nSubmit status:`, response?.data.note);
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    } catch (error) {
      throw error;
    }
  }

  private async getToken(name: string): Promise<string> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(`/token/${name}`, {
        apikey: process.env.PLATFORM_API_TOKEN,
      });
      console.log(`\tTASK TOKEN:`, response?.data.token);
      return response?.data.token;
    } catch (error) {
      throw error;
    }
  }
}

export default PlatformController;
