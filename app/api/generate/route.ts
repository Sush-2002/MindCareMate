import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const GET = async () => {
  return NextResponse.json({ message: 'Hello, Next.js Version 13!' }, { status: 200 });
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { gender, userPrompt } = body;

    const prompt = userPrompt || `A portrait of a ${gender}`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    // The response is already parsed; no need to call .json()
    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ message: 'No image URL found in response' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      message: 'Image generation failed',
      error: error?.message || 'Unknown error',
    }, { status: 400 });
  }
};
