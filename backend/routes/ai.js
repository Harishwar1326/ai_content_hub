
const express = require('express');
const router = express.Router();
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// @route   POST /api/ai/parse-item
// @desc    Use AI to parse a string into a structured item
router.post('/parse-item', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }
  
  try {
     const response = await ai.models.generateContent({
        model,
        contents: `Parse the following text into a structured task. Identify title, description, subtasks, and tags. Text: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    subtasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'description', 'subtasks', 'tags'],
            },
        },
    });

    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch (error) {
    console.error('AI parsing error:', error);
    res.status(500).json({ message: 'Failed to parse text with AI.' });
  }
});

module.exports = router;
