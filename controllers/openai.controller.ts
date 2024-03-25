import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam, ModerationCreateParams, ModerationCreateResponse } from 'openai/resources';
dotenv.config();

const OPENAI_API_TOKEN: string | undefined = process.env.OPENAI_API_TOKEN;

class OpenAiController {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_TOKEN,
    });
  }

  public async getModerationForInput(input: string | string[]): Promise<ModerationCreateResponse> {
    try {
      const payload: ModerationCreateParams = {
        input,
        model: 'text-moderation-latest',
      };
      return await this.client.moderations.create(payload);
    } catch (error) {
      throw error;
    }
  }

  public async getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
    try {
      const payload: ChatCompletionCreateParamsNonStreaming = {
        messages,
        model: 'gpt-3.5-turbo',
      };
      return await this.client.chat.completions.create(payload)
    } catch (error) {
      throw error;
    }
  }
}

export default OpenAiController;
