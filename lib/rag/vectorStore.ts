const CHROMA_HOST = process.env.CHROMA_HOST || "localhost";
const CHROMA_PORT = parseInt(process.env.CHROMA_PORT || "8000");

export interface VectorDocument {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export async function getVectorStore() {
  const { ChromaClient } = await import("chromadb");
  return new ChromaClient({
    host: CHROMA_HOST,
    port: CHROMA_PORT,
  });
}

export async function addToVectorStore(
  collectionName: string,
  documents: VectorDocument[]
) {
  const client = await getVectorStore();
  const collection = await client.getOrCreateCollection({ name: collectionName });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await collection.add({
    ids: documents.map((d) => d.id),
    documents: documents.map((d) => d.content),
    metadatas: documents.map((d) => d.metadata || {}),
  } as any);
}

export async function queryVectorStore(
  collectionName: string,
  query: string,
  nResults: number = 5
) {
  const client = await getVectorStore();
  const collection = await client.getOrCreateCollection({ name: collectionName });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await collection.query({
    queryTexts: [query],
    nResults,
  } as any);
  
  return results;
}
