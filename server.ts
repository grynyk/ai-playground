import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';
import { PlatformApiData } from './models';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';

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

  private async taskOptimalDb(): Promise<void> {
    const { database: dbUrl }: PlatformApiData = await this.platformController.getTaskData<{ database: string }>('optimaldb');
    const { data: databaseJSON } = await axios.get(dbUrl);
    const databaseStringified: string = JSON.stringify(databaseJSON);
    const systemMessage: SystemMessage = new SystemMessage(`
    Provide compressed brief facts about persons. Make sure any fact was lost.
    Make sure all information about given person is included in response.
    Input data is provided in stringified JSON, make sure every element in array below persons name is mentioned in compressed facts.
    Rules:
    - only short dry facts
    - every fact should be included in response
    - full sentences are forbidden
    - use comma separator between facts
    - be very specific
    - use English language
    ### Example input
    stefan: [
      'Dla Stefana ważnym elementem świątecznego stołu są hot dogi z szynką i serem, które sam przygotowuje.',
      'Przyjaciele Stefana często proszą go o porady dotyczące ćwiczeń na rozbudowanie mięśni ramion.',
      ...
    ],
    zygfryd: [
      'Mało osób wie, że Zygfryd był kiedyś mistrzem ortografii w szkole podstawowej.',
      'Z kolekcji winylowych płyt Zygfryda można wywnioskować, że jest on wielkim fanem klasycznego rocka.',
      ...
    ]
    ### Example output
    stefan: best dishes are own cooked hot dogs with ham and cheese, expert in delta muscles building.
    zygfryd: orthography champion in elementary school, classic rock fan, has vinyl collection`);
    const userMessage: HumanMessage = new HumanMessage(`Provide compressed data for given data source: ${databaseStringified}`);
    const messageContent: MessageContent = await this.openAIController.getChatContent([systemMessage, userMessage]);
    await this.platformController.sendAnswer(messageContent);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskOptimalDb();
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
