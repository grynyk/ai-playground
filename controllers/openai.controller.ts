import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ModerationCreateParams,
  ModerationCreateResponse,
} from 'openai/resources';
import { MODEL_COMPLETION, MODEL_MODERATION } from '../models';
dotenv.config();

const OPENAI_API_TOKEN: string | undefined = process.env.OPENAI_API_TOKEN;

class OpenAiController {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_TOKEN,
    });
  }

  public async getModerationForInput(
    input: string | string[],
    model: MODEL_MODERATION = 'text-moderation-latest'
  ): Promise<ModerationCreateResponse> {
    try {
      const payload: ModerationCreateParams = {
        input,
        model,
      };
      return await this.client.moderations.create(payload);
    } catch (error) {
      throw error;
    }
  }

  public async getChatCompletion(messages: ChatCompletionMessageParam[], model: MODEL_COMPLETION = 'gpt-3.5-turbo'): Promise<ChatCompletion> {
    try {
      const payload: ChatCompletionCreateParamsNonStreaming = {
        messages,
        model,
      };
      return await this.client.chat.completions.create(payload);
    } catch (error) {
      throw error;
    }
  }
}

export default OpenAiController;
