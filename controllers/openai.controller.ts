import OpenAI from 'openai';
import dotenv from 'dotenv';
import { OpenAIModerationChain } from 'langchain/chains';
import { ChatOpenAI, ChatOpenAICallOptions, OpenAIEmbeddings } from '@langchain/openai';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';
import { Transcription } from 'openai/resources/audio/transcriptions';
import { Document } from 'langchain/document';
dotenv.config();
const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

class OpenAiController {
  private openAI: OpenAI;
  private chat: ChatOpenAI<ChatOpenAICallOptions>;
  private moderation: OpenAIModerationChain;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.openAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    this.chat = new ChatOpenAI();
    this.moderation = new OpenAIModerationChain();
    this.embeddings = new OpenAIEmbeddings();
  }

  public async getModeration(input: string | string[]): Promise<unknown[]> {
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

  public async getEmbeddedQuery(input: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(input);
    } catch (error) {
      throw error;
    }
  }

  public async getEmbeddedDocument(document: Document): Promise<number[][]> {
    try {
      return await this.embeddings.embedDocuments([
        document.pageContent,
      ]);
    } catch (error) {
      throw error;
    }
  }
}

export default OpenAiController;
