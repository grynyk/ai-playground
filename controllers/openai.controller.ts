import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Moderation } from 'openai/resources';
import { OpenAIModerationChain } from 'langchain/chains';
import { ChatOpenAI, ChatOpenAICallOptions, OpenAIEmbeddings } from '@langchain/openai';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';
import { Transcription } from 'openai/resources/audio/transcriptions';
dotenv.config();
const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

class OpenAiController {
  private openAI: OpenAI;
  private chat: ChatOpenAI<ChatOpenAICallOptions>;
  private moderation: OpenAIModerationChain;
  private embedding: OpenAIEmbeddings;

  constructor() {
    this.openAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    this.chat = new ChatOpenAI();
    this.moderation = new OpenAIModerationChain();
    this.embedding = new OpenAIEmbeddings();
  }

  public async getModeration(input: string | string[]): Promise<Moderation[]> {
    try {
      const { results } = await this.moderation.invoke({
        input,
      });
      return results;
    } catch (error) {
      throw error;
    }
  }

  public async getAudioTranscription(filePath: string): Promise<Transcription> {
    const file: Response = await fetch(filePath);
    const transcription: Transcription = await this.openAI.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });
    return transcription;
  }

  public async getChatContent(messages: (HumanMessage | SystemMessage)[]): Promise<MessageContent> {
    try {
      const { content } = await this.chat.invoke([...messages]);
      return content;
    } catch (error) {
      throw error;
    }
  }

  public async getEmbedding(input: string): Promise<number[]> {
    try {
      return await this.embedding.embedQuery(input);
    } catch (error) {
      throw error;
    }
  }
}

export default OpenAiController;
