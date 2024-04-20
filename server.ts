import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';
import axios from 'axios';
import { first, isNil } from 'lodash';
import { BasicCollectionData, PlatformApiData, CollectionSearchResult } from './models';

class Server {
  private app: Express;
  private platformController: PlatformController;
  private openAIController: OpenAiController;
  private qdrantController: QdrantController;

  constructor() {
    this.app = express();
    this.platformController = new PlatformController();
    this.openAIController = new OpenAiController();
    this.qdrantController = new QdrantController();
  }

  async populateQdrantDbData(url: string, collectionName: string): Promise<void> {
    try {
      const { data }: { data: BasicCollectionData[] } = await axios.get(url);
      await this.qdrantController.createCollection(collectionName);
      await this.qdrantController.upsert(collectionName, data);
    } catch (error) {
      throw error;
    }
  }

  private async taskSearch(): Promise<void> {
    const { question }: PlatformApiData = await this.platformController.getTaskData<{ question: string }>('search');
    const collectionName: string = `UNKNOWN_DATA`;
    const unknownDataUrl: string = `https://unknow.news/archiwum_aidevs.json`;
    await this.populateQdrantDbData(unknownDataUrl, collectionName);
    const answer: CollectionSearchResult | undefined = first(await this.qdrantController.search(collectionName, question));
    if (isNil(answer)) {
      return;
    }
    const { payload }: CollectionSearchResult = answer;
    await this.platformController.sendAnswer(payload.url);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskSearch();
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
