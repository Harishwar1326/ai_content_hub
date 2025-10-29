import { GoogleGenAI } from "@google/genai";
import { ContentItem, TaskList, User } from '../types';

export interface HubAnalysis {
  summary: string;
}

function getClient(): GoogleGenAI {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }
  return new GoogleGenAI({ apiKey });
}

export const generateIdeas = async (topic: string): Promise<string[]> => {
  try {
    const ai = getClient();
    if (!ai) {
      return getFallbackIdeas(topic);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: [{ text: createPrompt(topic) }]
    });
    
    const text = response.candidates[0].content.parts[0].text;
    
    const ideas = parseIdeas(text);
    return ideas.length > 0 ? ideas : getFallbackIdeas(topic);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return getFallbackIdeas(topic);
  }
};

const mockResponses: { [key: string]: (text: string) => string } = {
  'Summarize': (text: string) => `Here's a summary of your text about "${text}": AI (Artificial Intelligence) is a technology that enables computers to perform tasks that typically require human intelligence, such as learning, reasoning, and problem-solving.`,
  'Expand': (text: string) => `Here's an expanded explanation of "${text}": Artificial Intelligence (AI) is a broad field of computer science focused on creating intelligent machines that can mimic human cognitive functions. This includes machine learning, neural networks, deep learning, and natural language processing. AI systems can analyze data, recognize patterns, make decisions, and continuously improve their performance through experience.`,
  'Fix Grammar': (text: string) => `Here's your text with grammar fixed: "What is AI?" (Artificial Intelligence)`,
  'Make Professional': (text: string) => `Here's your text in professional tone: "Artificial Intelligence (AI) refers to the simulation of human intelligence processes by computer systems and specialized software applications."`,
};

export const rewriteText = async (text: string, instruction: string): Promise<string> => {
  try {
    if (!text.trim()) {
      throw new Error('Please enter some text to process');
    }

    // Using mock responses instead of API call
    if (mockResponses[instruction]) {
      return mockResponses[instruction](text);
    }

    throw new Error('Invalid instruction type');
  } catch (error: any) {
    console.error('Error rewriting text:', error);
    throw new Error(error.message || 'Failed to process your request. Please try again.');
  }
};

function createPrompt(topic: string): string {
  return `Generate 5-7 concise, actionable ideas related to: ${topic}

Guidelines:
• Each idea should be a clear, specific task
• Keep ideas under 100 characters
• Focus on practical, implementable items
• List each idea on a separate line
• Do not use numbers or bullet points`;
}

function parseIdeas(text: string): string[] {
  return text
    .split('\n')
    .map(idea => idea.replace(/^[•\-*\d.)\s]+/, '').trim())
    .filter(idea => idea.length > 0 && idea.length < 100);
}

function getFallbackIdeas(topic: string): string[] {
  return [
    `Draft outline: ${topic}`,
    `Research references for ${topic}`,
    `Create visuals for ${topic}`,
    `Write summary on ${topic}`,
    `Plan distribution for ${topic}`,
  ];
}



export async function analyzeHubContent(hub: TaskList, users: User[]): Promise<HubAnalysis> {
  try {
    if (!hub) {
      throw new Error('No project data available');
    }

    const totalItems = hub.items?.length || 0;
    const completedItems = hub.items?.filter(item => item.completed)?.length || 0;
    const activeItems = totalItems - completedItems;

    let summaryText = `Project Name: ${hub.name}\n\n`;
    summaryText += `Project Statistics:\n`;
    summaryText += `• Total Items: ${totalItems}\n`;
    summaryText += `• Completed: ${completedItems}\n`;
    summaryText += `• Active: ${activeItems}\n\n`;

    if (totalItems > 0) {
      summaryText += `Recent Items:\n`;
      const recentItems = hub.items?.slice(0, 3) || [];
      recentItems.forEach(item => {
        summaryText += `• ${item.title} - ${item.completed ? 'Completed' : 'In Progress'}\n`;
      });
      if (totalItems > 3) {
        summaryText += `\n...and ${totalItems - 3} more items`;
      }
    } else {
      summaryText += `No items have been added to this project yet.`;
    }

    return {
      summary: summaryText
    };
  } catch (error) {
    console.error('Error analyzing project:', error);
    return {
      summary: error instanceof Error ? error.message : 'Failed to analyze project'
    };
  }
}

export async function parseTaskFromString(input: string, folder: string): Promise<Partial<ContentItem>> {
  try {
    const ai = getClient();
    if (!ai) {
      return {
        title: input,
        folder: folder,
        description: 'AI parsing unavailable',
        type: 'note'
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: [{
        text: `Parse this text into a task or note. Extract a clear title and description:\n"${input}"\n\n` +
              'Format: JSON with title (string), description (string), type ("task" or "note"), priority (number 1-3)'
      }]
    });

    const text = response.candidates[0].content.parts[0].text;
    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        folder: folder
      };
    } catch {
      // If JSON parsing fails, return basic structure
      return {
        title: input,
        folder: folder,
        description: 'Could not parse detailed structure',
        type: 'note'
      };
    }
  } catch (error) {
    console.error('Error parsing task from string:', error);
    return {
      title: input,
      folder: folder,
      description: 'Error in AI parsing',
      type: 'note'
    };
  }
}