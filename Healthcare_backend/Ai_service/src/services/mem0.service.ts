import { Memory } from 'mem0ai/oss';

const config = {
  vectorStore: {
    provider: 'qdrant',
    config: {
      collectionName: 'memories',
      embeddingModelDims: 1536,
      host: 'localhost',
      port: 6333,
    },
  },
  enableGraph: true,
  graphStore: {
    provider: "neo4j",
    config: {
      url: process.env.NEO4J_URL!,
      username: process.env.NEO4J_USERNAME!,
      password: process.env.NEO4J_PASSWORD!,
      database: "neo4j",
    },
  },
};

export const memory = new Memory(config);