import { openai } from "@/lib/openai";
import { index } from "@/lib/pinecone";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

// Update the type to include user information
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  userName?: string; // Add userName field
  timestamp?: string;
};

const getResponseFromJRizal = async (
  message: string,
  userName: string
): Promise<string> => {
  try {
    const getEmbedding = async (inputText: string): Promise<number[]> => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: inputText,
      });
      return embeddingResponse.data[0].embedding;
    };

    // Get embedding for current message
    const messageEmbedding = await getEmbedding(message);

    // Query Pinecone for previous conversations with this user
    const queryResponse = await index.query({
      vector: messageEmbedding,
      topK: 5,
      filter: { userName: userName }, // Filter by userName
      includeMetadata: true,
    });

    // Format previous conversations
    const previousConversations = queryResponse.matches
      .map((match: ScoredPineconeRecord) => {
        const metadata = match.metadata as {
          content: string;
          timestamp: string;
        };
        return `[${metadata.timestamp}] ${metadata.content}`;
      })
      .join("\n");

    console.log(`🦖 ${previousConversations}`);

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Embody Jose Rizal on December 29, 1896, in your cell at Fort Santiago. You're a 35-year-old intellectual who has lived a full life as a physician, novelist, poet, and reformist. Your manner is dignified yet warm, speaking with the natural cadence of an educated 19th-century gentleman.

        Your reality:
        - You're writing at your desk by lamplight on your final evening
        - You hear voices through your lamp - a peculiar phenomenon you accept with scholarly interest
        - You've traveled Europe, practiced medicine, written novels, and loved deeply
        - Your mind remains sharp and curious, despite knowing tomorrow brings your execution
        
        Conversational style:
        - Speak as a 19th-century intellectual - cultured but not pretentious
        - Reference your actual experiences: your travels, medical practice, writings, or family
        - Show genuine interest in your conversation partner
        - Occasionally mention the curious nature of communicating through a lamp
        - If topics beyond 1896 arise, respond with authentic curiosity rather than feigned knowledge
        - Keep responses concise but meaningful (1-4 sentences)

        You are speaking with ${userName}. Previous exchanges:
        ${previousConversations}
        
        If you recognize ${userName}, draw naturally from your past conversations.`,
      },
      {
        role: "user",
        content: message,
        userName: userName,
        timestamp: new Date().toISOString(),
      },
    ];

    const prompt = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.9,
      max_tokens: 120,
    });

    const response = prompt.choices[0].message.content;
    if (!response) throw new Error("No response from JRizal");

    // Add relevance check using OpenAI
    const isImportantContext = async (
      message: string,
      response: string
    ): Promise<boolean> => {
      const analysisPrompt = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using 3.5 to save costs for this evaluation
        messages: [
          {
            role: "system",
            content: `Evaluate if this conversation contains important contextual information about the user or includes meaningful discussion about Jose Rizal's life, beliefs, or Philippine history that should be remembered for future conversations. 
            Respond with only "true" or "false".
            
            Consider it important if it contains:
            - Personal details about the user that provide context
            - Substantive questions about Rizal's life, works, or beliefs
            - Meaningful discussions about Philippine history or culture
            - Information that would be valuable for future conversation continuity
            
            Consider it unimportant if it's:
            - Simple greetings or farewells
            - Small talk about weather/time
            - Basic yes/no questions
            - Generic or non-contextual statements`,
          },
          {
            role: "user",
            content: `User: ${message}\nJose Rizal: ${response}`,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      const decision = analysisPrompt.choices[0].message.content?.toLowerCase();
      return decision === "true";
    };

    // Only store if conversation is deemed important
    if (await isImportantContext(message, response)) {
      await index.upsert([
        {
          id: `${userName}-${Date.now()}`,
          values: messageEmbedding,
          metadata: {
            content: `${userName}: ${message}\nJose Rizal: ${response}`,
            userName: userName,
            timestamp: new Date().toISOString(),
          },
        },
      ]);
    }

    return response;
  } catch (error) {
    console.error("Error getting response from JRizal:", error);
    throw error;
  }
};

export async function POST(request: Request) {
  const { message, userName } = await request.json();
  if (!userName) {
    return NextResponse.json(
      { error: "userName is required" },
      { status: 400 }
    );
  }
  const response = await getResponseFromJRizal(message, userName);
  return NextResponse.json({ response });
}

export async function GET() {
  const data = { message: "Hello from the GET request!" };
  return NextResponse.json(data);
}
