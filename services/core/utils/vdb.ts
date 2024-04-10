import OpenAIClient from "../lib/openai-client";
import { rbIndex } from "../lib/pinecone";

const vdb = {
  upsert: async (id: string, chunk: string) => {
    const embedding = await OpenAIClient.embeddings.create({
      input: [chunk],
      model: "text-embedding-3-small",
    });

    return await rbIndex.upsert([
      {
        id: id.toString(),
        values: embedding.data[0].embedding,
        metadata: { id, chunk },
      },
    ]);
  },
  similar: async (query: string) => {
    const embedding = await OpenAIClient.embeddings.create({
      input: [query],
      model: "text-embedding-3-small",
    });

    const matchesResponse = await rbIndex.query({
      topK: 8,
      vector: embedding.data[0].embedding,
    });

    return matchesResponse;
  },
};

export default vdb;
