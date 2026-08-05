import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY or GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function generate() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A modern, sleek, minimalist app logo for an AI voiceover software named DZ VoixOff. The logo features a stylized microphone merging with digital soundwaves. The color palette uses deep navy blue and vibrant neon teal. Clean lines, vector art style, isolated on a solid white background, professional and tech-forward.',
          },
        ],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        fs.writeFileSync('./public/logo.png', Buffer.from(base64EncodeString, 'base64'));
        console.log('Logo saved to public/logo.png');
      }
    }
  } catch (error) {
    console.error('Error generating logo:', error);
  }
}

generate();
