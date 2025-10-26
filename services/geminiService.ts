
import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem, TaskList, User } from '../types';

// FIX: Define HubAnalysis interface to be used by the CollaborationReportModal and the analyzeHubContent function.
export interface HubAnalysis {
  gaps: string[];
  mergeSuggestions: {
    itemIds: string[];
    reason: string;
  }[];
}

// Initialize the GoogleGenAI client lazily to avoid runtime errors at module import time.
// Read the key from Vite env: define VITE_GEMINI_API_KEY in a .env file at project root.
const model = 'gemini-2.5-flash';

function getClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
}

// FIX: Implement the generateIdeas function to brainstorm ideas using the Gemini API.
export const generateIdeas = async (topic: string): Promise<string[]> => {
  try {
    const ai = getClient();
    if (!ai) {
      // Graceful fallback without API key
      return [
        `Draft outline: ${topic}`,
        `Research references for ${topic}`,
        `Create visuals for ${topic}`,
        `Write summary on ${topic}`,
        `Plan distribution for ${topic}`,
      ];
    }
    const response = await ai.models.generateContent({
      model,
      contents: `Brainstorm 5-7 concise, actionable ideas or task titles related to the following topic: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'A list of 5 to 7 brainstormed ideas.'
            },
          },
          required: ['ideas'],
        },
      },
    });

    const json = JSON.parse(response.text);
    return json.ideas || [];
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error("Failed to generate ideas. Please check the API key and try again.");
  }
};

// FIX: Implement the parseTaskFromString function to parse natural language into a structured task item.
export const parseTaskFromString = async (prompt: string): Promise<Partial<ContentItem>> => {
  try {
    const ai = getClient();
    if (!ai) {
      // Fallback parse when no API key is present
      return {
        title: prompt.slice(0, 60) || 'New Item',
        description: prompt,
        subtasks: [],
        tags: [],
      };
    }
    const response = await ai.models.generateContent({
        model,
        contents: `Parse the following text into a structured task. Identify the main title, a detailed description, any potential subtasks as a simple list of strings, and relevant hashtags (e.g., #planning) starting with '#'. If no specific title is obvious, create a concise one. Text: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The main title of the task." },
                    description: { type: Type.STRING, description: "A detailed description of the task." },
                    subtasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of strings, where each string is a subtask."
                    },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of relevant tags or keywords, each starting with '#'."
                    },
                },
                required: ['title', 'description', 'subtasks', 'tags'],
            },
        },
    });

    const parsed = JSON.parse(response.text);
    
    const subtasks = parsed.subtasks?.map((title: string, index: number) => ({
        id: `sub-${Date.now()}-${index}`,
        title,
        completed: false,
    })) || [];

    return {
        title: parsed.title,
        description: parsed.description,
        subtasks,
        tags: parsed.tags,
    };
  } catch(error) {
    console.error("Error parsing task:", error);
    throw new Error("Failed to parse task from string. The AI could not understand the input.");
  }
};

// FIX: Implement the rewriteText function for AI-powered text manipulation.
export const rewriteText = async (text: string, instruction: string): Promise<string> => {
  try {
    const ai = getClient();
    if (!ai) {
      return `${instruction}: ${text}`;
    }
    const response = await ai.models.generateContent({
        model,
        contents: `Instruction: "${instruction}". Please apply this instruction to the following text and return only the rewritten text, without any preamble. Text: "${text}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error rewriting text:", error);
    throw new Error("Failed to rewrite text.");
  }
};

// FIX: Implement the analyzeHubContent function to generate a collaboration report.
export const analyzeHubContent = async (hub: TaskList, users: User[]): Promise<HubAnalysis> => {
  try {
    const ai = getClient();
    const userMap = new Map(users.map(u => [u.id, u.name]));
    const contentContext = hub.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      createdBy: userMap.get(item.createdBy) || 'Unknown User',
    }));

    const prompt = `
      Analyze the following project hub content created by a team.
      The goal is to provide a "Collaborative Intelligence Report".
      1. Identify potential knowledge gaps: These are topics or tasks that seem to be missing or underdeveloped for the project to be successful. Be concise and actionable.
      2. Suggest items that could be merged: Identify 2 or more items that have overlapping concepts or could be combined into a single, more comprehensive item. Provide the item IDs and a brief reason.

      Team Members: ${users.map(u => u.name).join(', ')}
      Hub Name: ${hub.name}
      Hub Content (JSON):
      ${JSON.stringify(contentContext, null, 2)}
    `;

    if (!ai) {
      // Fallback analysis when no API key is present
      return {
        gaps: [
          'Define clear success metrics for the launch.',
          'Add timeline and milestones.',
        ],
        mergeSuggestions: [],
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: {
              type: Type.ARRAY,
              description: "List of potential knowledge gaps or missing tasks.",
              items: { type: Type.STRING },
            },
            mergeSuggestions: {
              type: Type.ARRAY,
              description: "Suggestions for merging related items.",
              items: {
                type: Type.OBJECT,
                properties: {
                  itemIds: {
                    type: Type.ARRAY,
                    description: "The IDs of the items to merge (must exist in the provided Hub Content).",
                    items: { type: Type.STRING },
                  },
                  reason: {
                    type: Type.STRING,
                    description: "A brief justification for why these items should be merged.",
                  },
                },
                required: ['itemIds', 'reason'],
              },
            },
          },
          required: ['gaps', 'mergeSuggestions'],
        },
      },
    });

    return JSON.parse(response.text) as HubAnalysis;
  } catch (error) {
    console.error("Error analyzing hub content:", error);
    throw new Error("Failed to analyze the hub. The AI could not process the content.");
  }
};
