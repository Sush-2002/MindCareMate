import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load the API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

// Get the model (Important: Gemini 1.0 Pro is deprecated, use 'gemini-1.5-pro' or 'gemini-1.5-flash')
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { userPrompt } = reqBody;

    if (!userPrompt) {
      return NextResponse.json({ text: "Prompt is missing." }, { status: 400 });
    }

    // Start a new chat
    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 1000 },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    const text = await response.text();

    if (!text || text.trim() === "") {
      return NextResponse.json({ text: "Sorry, I don't understand." });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Therapy API Error:", error);
    return NextResponse.json({ text: "Something went wrong. Try again!" }, { status: 500 });
  }
}