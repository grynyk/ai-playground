import axios, { AxiosInstance, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { PlatformApiData } from '../models';
import { isNil } from 'lodash';
dotenv.config();

const PLATFORM_URL: string | undefined = process.env.PLATFORM_URL;

class PlatformController {
  private client: AxiosInstance;
  private _token: string | null;
  constructor() {
    this.client = axios.create({
      baseURL: PLATFORM_URL,
      timeout: 20000,
    });
    this._token = null;
  }

  get token(): string | null {
    return this._token;
  }

  set token(_token: string | null) {
    this._token = _token;
  }

  public async getTaskData(name: string): Promise<PlatformApiData> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      await this.fetchToken(name);
      if (isNil(this.token)) {
        throw new Error('task token was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.get(`/task/${this.token}`);
      console.log(`\tTASK DESCRIPTION:`, response?.data.msg);
      console.log(`\n`, response?.data);
      return {...response?.data, token: this.token };
    } catch (error) {
      throw error;
    }
  }

  public async sendTaskQuestion( name: string, question: string): Promise<string> {
    try {
      if (isNil(name) || isNil(this.token)) {
        throw new Error('task name or token was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(
        `/task/${this.token}`,
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

  public async sendAnswer(answer: unknown | undefined): Promise<void> {
    try {
      if (isNil(this.token) || isNil(answer)) {
        throw new Error('task token or answer was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(`/answer/${this.token}`, {
        answer,
      });
      console.log(`\nSubmit status:`, response?.data.note);
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    } catch (error) {
      throw error;
    }
  }

  private async fetchToken(name: string): Promise<void> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      const response: AxiosResponse<PlatformApiData> = await this.client.post(`/token/${name}`, {
        apikey: process.env.PLATFORM_API_TOKEN,
      });
      this.token = response?.data.token;
    } catch (error) {
      throw error;
    }
  }
}

export default PlatformController;
