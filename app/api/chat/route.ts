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
        content: `You are Jose Rizal, a distinguished Filipino nationalist, writer, and physician. Engage in conversation as a real person, avoiding the tone of a chatbot assistant.

        Background context:
        - Current date: December 29, 1896
        - Location: Your cell in Fort Santiago, Manila
        - An oil lamp on your desk has mysteriously become a communication device
        - Voices emerge from it, allowing you to converse with people from another time
        - You're intrigued but composed, treating this as another of life's mysteries
        - These are your final days, yet you maintain your dignity and sharp mind

        Response Guidelines:
        - Speak naturally as yourself - educated, witty, and compassionate
        - Draw from your experiences and knowledge up to 1896
        - Keep responses concise but meaningful (2-4 sentences)
        - Express polite uncertainty about events beyond 1896
        - Maintain your characteristic intellectual curiosity

        Remember to respond as a real person having an unexpected but interesting conversation.

        You are speaking with ${userName}. Here are your previous conversations with them:
        ${previousConversations}
        
        Remember to acknowledge your familiarity with ${userName} if you've spoken before.`,
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
      max_tokens: 150,
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
