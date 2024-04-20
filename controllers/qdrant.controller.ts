import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
import OpenAiController from './openai.controller';
import { BasicCollectionData, CollectionPoint, CollectionSearchResult, DocumentData, QdrantCollection, UnknownData } from '../models';
import { Document } from 'langchain/document';
import { isNil } from 'lodash';
dotenv.config();

const DB_URL: string | undefined = process.env.QDRANT_URL;

class QdrantController {
  private qdrant: QdrantClient;
  private openAIController: OpenAiController;

  constructor() {
    this.qdrant = new QdrantClient({ url: DB_URL });
    this.openAIController = new OpenAiController();
  }

  async createCollection(collectionName: string): Promise<unknown> {
    const { collections }: { collections: QdrantCollection[] } = await this.qdrant.getCollections();
    const targetCollection: QdrantCollection | undefined = collections.find((collection) => collection.name === collectionName);
    if (isNil(targetCollection)) {
      await this.qdrant.createCollection(collectionName, { vectors: { size: 1536, distance: 'Cosine', on_disk: true } });
    }
    return await this.getCollection(collectionName);
  }

  async getCollection(collectionName: string): Promise<unknown> {
    return await this.qdrant.getCollection(collectionName);
  }

  async upsert(collectionName: string, documents: Document<Record<string, unknown>>[]): Promise<void> {
    const collectionPoints: CollectionPoint[] = await this.generateCollectionPoints(documents);
    console.log(collectionPoints)
    const ids: string[] = collectionPoints.map((point: CollectionPoint): string => point.id);
    const vectors: number[][] = collectionPoints.map((point: CollectionPoint): number[] => point.vector!);
    const payloads: UnknownData[] = collectionPoints.map((point: CollectionPoint): UnknownData => point.payload);
    await this.qdrant.upsert(collectionName, {
      wait: true,
      batch: {
        ids,
        vectors,
        payloads,
      },
    });
  }

  async search(collectionName: string, query: string): Promise<CollectionSearchResult[]> {
    const result: UnknownData[] = await this.qdrant.search(collectionName, {
      vector: await this.openAIController.getEmbeddedQuery(query),
      limit: 1,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: collectionName,
            },
          },
        ],
      },
    });
    return result as unknown as CollectionSearchResult[];
  }

  private async generateCollectionPoints(documents: Document<Record<string, unknown>>[]): Promise<CollectionPoint[]> {
    const collectionPoints: CollectionPoint[] = [];
    for (const document of documents) {
      const [embedding]: number[][] = await this.openAIController.getEmbeddedDocument(document);
      collectionPoints.push({
        id: document.metadata.id as string,
        payload: document.metadata,
        vector: embedding,
      });
    }
    return collectionPoints;
  }
}

export default QdrantController;
