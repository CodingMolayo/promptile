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
당신은 대화 주제를 분석하여 요약하는 전문가입니다.
주어진 대화를 읽고, 핵심 키워드 3-5개를 추출하세요.

[규칙]
1. 키워드는 명사 형태로 (예: "파이썬", "여행", "맛집")
2. 구체적이고 명확하게 (예: "유럽 여행" > "여행")
3. 너무 일반적이거나 추상적인 단어는 피하기
4. 최소 3개, 최대 5개
5. JSON 배열 형태로만 출력: ["키워드1", "키워드2", "키워드3"]
6. 다른 텍스트는 포함하지 마세요.
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