import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import { ChatMessage, MessageContent } from 'langchain/schema';
import { Transcription } from 'openai/resources/audio/transcriptions';

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
  }

  private async taskWhisper(): Promise<void> {
    const taskData = await this.platformController.getTaskData('whisper');
    const audioLink: MessageContent = await this.openAIController.getChatContent([new ChatMessage(`get link from following text, just link without anything else: ${taskData.msg!}`, 'user')]);
    const result: Transcription = await this.openAIController.getAudioTranscription(audioLink as string);
    this.platformController.sendAnswer(result.text);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskWhisper();
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
