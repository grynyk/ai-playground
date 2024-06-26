import axios, { AxiosInstance, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { PlatformApiData, PlatformApiResponse } from '../models';
import { isNil } from 'lodash';
dotenv.config();

const PLATFORM_URL: string | undefined = process.env.PLATFORM_URL;

class PlatformController {
  private client: AxiosInstance;
  private _token: string | undefined;

  get token(): string | undefined {
    return this._token;
  }

  set token(_token: string | undefined) {
    this._token = _token;
  }

  constructor() {
    this.client = axios.create({
      baseURL: PLATFORM_URL,
      timeout: 20000,
    });
    this._token = undefined;
  }

  public async getTaskData <T extends PlatformApiData>(name: string): Promise<T> {
    try {
      if (isNil(name)) {
        throw new Error('task name was not provided');
      }
      await this.setToken(name);
      if (isNil(this.token)) {
        throw new Error('task token was not provided');
      }
      const response: AxiosResponse<T> = await this.client.get(`/task/${this.token}`);
      console.log(`\tTASK DESCRIPTION:`, response?.data);
      return response?.data;
    } catch (error) {
      throw error;
    }
  }

  public async sendTaskQuestion(name: string, question: string): Promise<string | undefined> {
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
      return response?.data.answer;
    } catch (error) {
      throw error;
    }
  }

  public async sendAnswer(answer: unknown | undefined): Promise<AxiosResponse<PlatformApiResponse>> {
    try {
      if (isNil(this.token) || isNil(answer)) {
        throw new Error('task token or answer was not provided');
      }
      const response: AxiosResponse<PlatformApiResponse> = await this.client.post(`/answer/${this.token}`, {
        answer,
      });
      console.log(`\nSubmit status:`, response?.data.note);
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
      return response;
    } catch (error) {
      throw(error);
    }
  }

  private async setToken(name: string): Promise<void> {
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
