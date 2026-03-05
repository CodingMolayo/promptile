//===src/app/api/keywords/route.ts (신규)

import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { blocks } = await req.json(); // Block[] 받기

    if (!blocks || blocks.length === 0) {
      return NextResponse.json({ keywords: [] });
    }

    // 최근 5개 블록의 질문+답변 수집
    const recentBlocks = blocks.slice(0, 5);
    const conversationText = recentBlocks
      .map((b: { body: { question: string; answer: string; }; }) => `Q: ${b.body.question}\nA: ${b.body.answer}`)
      .join('\n\n');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are an expert at analyzing and summarizing conversation topics.
Read the given conversation and extract 3-5 key keywords.

[Rules]
0. ANSWER in KOREAN!
1. Keywords should be nouns (e.g., "Python," "travel," "restaurant")
2. Be specific and clear (e.g., "travel in Europe" is better then "travel")
3. Avoid overly general or abstract words
4. Minimum of 3, maximum of 5
5. Output only as a JSON array: ["Keyword1", "Keyword2", "Keyword3"]
6. Do not include any other text.
          `
        },
        {
          role: "user",
          content: `다음 대화의 핵심 키워드를 추출하세요:\n\n${conversationText}`
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      max_tokens: 256
    });

    const response = completion.choices[0]?.message?.content || "[]";
    
    // JSON 파싱 (안전하게)
    let keywords: string[] = [];
    try {
      // 백틱이나 마크다운 제거
      const cleaned = response.replace(/```json|```/g, '').trim();
      keywords = JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse keywords:', error);
      // 폴백: 쉼표로 구분된 텍스트 파싱
      keywords = response
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 5);
    }

    return NextResponse.json({ keywords });

  } catch (error) {
    console.error("Keywords API Error:", error);
    return NextResponse.json({ keywords: [] }, { status: 500 });
  }
}