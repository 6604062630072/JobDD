import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing text or targetLang' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Translate the following text to ${targetLang}. 
    If the text contains HTML tags, preserve them and only translate the content.
    Return only the translated text without any explanations, markdown formatting, or code blocks.
    
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    );
  }
}
