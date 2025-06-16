import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { userPrompt } = reqBody;
    
    const prompt = "you are a mental health professional. you are talking to a patient who is suffering from depression. you want to help them feel better. so answer the following questions: " + userPrompt;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { maxOutputTokens: 400 } });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ text: `Error: ${error.message || "Unknown error occurred."}` }, { status: 500 });
  }
}