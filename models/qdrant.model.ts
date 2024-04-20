export interface QdrantCollection {
  name: string;
}

export interface BasicCollectionData {
  title: string;
  url: string;
  info: string;
  date: string;
}

export interface CollectionPoint {
  id: string;
  payload: Record<string, any>;
  vector: number[] | null;
}

export interface CollectionSearchResultPayload extends BasicCollectionData {
  content: string;
  id: string;
  source: string;
}

export interface CollectionSearchResult extends CollectionPoint {
  id: string;
  version: number;
  score: number;
  payload: CollectionSearchResultPayload;
  vector: number[] | null;
}
