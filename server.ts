import express, { Express } from 'express';
import { OpenAiController, PlatformController } from './controllers';
import QdrantController from './controllers/qdrant.controller';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HumanMessage, MessageContent, SystemMessage } from 'langchain/schema';
import { FinishReason, PlatformApiData } from './models';
import { first, isNil } from 'lodash';
import { ChatCompletionCreateParamsBase, ChatCompletionMessageToolCall, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from 'openai/resources/chat/completions';
import { ChatCompletion } from 'openai/src/resources/index.js';
import { formatISO, startOfDay } from 'date-fns';

interface CategorizedTaskData {
  category: 'CURRENCY' | 'GENERAL' | 'POPULATION';
  value: string | null;
}

interface CurrencyRateData {
  no: string;
  effectiveDate: string;
  mid: number;
}

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

  private async taskTools(): Promise<void> {
    const { question, msg }: PlatformApiData = await this.platformController.getTaskData<{ msg: string; question: string }>('tools');
    const functions: ChatCompletionCreateParamsBase['tools'] = [
      {
        type: 'function',
        function: {
          name: 'getTaskToolObject',
          description: `${msg}`,
          parameters: {
            type: 'object',
            properties: {
              tool: {
                type: 'string',
                description: `
                  'ToDo' - action which should be added to ToDo list.
                  'Calendar' - event which should be added to the calendar.
                `,
              },
              desc: {
                type: 'string',
                description: 'event or action provided by user',
              },
              date: {
                type: 'string',
                description: `Optional parameter added strictly when user mentions any date or time, date format: "YYYY-MM-DD" e.g. 2024-01-28`,
              },
            },
            required: ['tool', 'desc'],
          },
        },
      },
    ];
    const todaysDate: string = formatISO(startOfDay(new Date()), { representation: 'date' });
    const systemMessage: ChatCompletionSystemMessageParam = {
      content: `
        You are an assistant who analyze provided message and decides whether it is task of type "ToDo" or "Calendar".
        Response should be strictly in JSON, example: "{ "tool":"ToDo/Calendar", "desc":"brief description of task", "date":"2024-04-26" }".
        "date" property should be present in response JSON strictly when in provided message was mentioned date, time, week day, example:
        "tomorrow I have MOT check".
        Input/Output Examples:
          1. Message: "Remind me to buy milk". Response: "{"tool":"ToDo","desc":"buy milk" }".
          2. Message: "I have meeting with Marian tomorrow". Response: "{"tool":"Calendar", "desc":"Meeting with Marian", "date":"2024-04-26"}".
        Rules:
          1. todays date is ${todaysDate}
          2. response language is Polish
      `,
      role: 'system'
    };
    const userMessage: ChatCompletionUserMessageParam = {
      content: `${question}`,
      role: 'user'
    };
    const choice: ChatCompletion.Choice = await this.openAIController.getChatFunctionCallingContent(functions, [userMessage, systemMessage]);
    const { finish_reason, message }: ChatCompletion.Choice = choice;
    if (finish_reason !== FinishReason.TOOL_CALLS) {
      return;
    }
    const toolCalls: ChatCompletionMessageToolCall = first(message.tool_calls)!;
    const { tool, desc, date } = JSON.parse(toolCalls.function.arguments);
    const answer = { 
      tool,
      desc,
      ...(!isNil(date) && { date })
    };
    this.platformController.sendAnswer(answer);
  }

  private onInit(): void {
    /**
     * Executes method on initialization.
     **/
    this.taskTools();
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
