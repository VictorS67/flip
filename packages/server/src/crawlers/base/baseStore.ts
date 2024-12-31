
// src/crawlers/base/AbstractStore.ts

export interface ContentItem {
    [key: string]: any;
  }
  
  export abstract class AbstractStore {
    abstract storeContent(contentItem: ContentItem): Promise<void>;
    abstract storeComment(commentItem: ContentItem): Promise<void>;
    abstract storeCreator(creator: ContentItem): Promise<void>;
  }
  