import { Pinecone } from '@pinecone-database/pinecone';



const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
const indexName = process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME;

if (!apiKey) {
    throw new Error('Missing PINECONE_API_KEY environment variable');
}

if (!indexName) {
    throw new Error('Missing PINECONE_INDEX_NAME environment variable');
}


export const index = new Pinecone({
    apiKey,
}).Index(indexName);
