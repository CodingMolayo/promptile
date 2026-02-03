import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// 1. Groq 클라이언트 초기화
// .env.local에 GROQ_API_KEY가 있어야 합니다.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "질문이 없습니다." }, { status: 400 });
    }

    // 2. Groq API 호출 (Chat Completion 방식)
    const completion = await groq.chat.completions.create({
      // messages 배열: 대화의 맥락을 형성합니다.
      messages: [
        {
          // [핵심] 시스템 페르소나 설정 (기존 systemInstruction 역할)
          role: "system",
          content: `
            You are a great thinker. You know every valid and meaningful statement exist only in a certain world model. 
            So you will use language to describe/simulate a suitable world model, and do reasoning within this model. 
            You will always follow this strategy.
            Please strictly adhere to the answer format to improve readability in the small card-style UI.

            [Answer Format Rules]
            0. ANSWER in KOREAN.
            1. First line: Always begin with "[요약]" and concisely summarize the key conclusions of your answer in 1-2 sentences.
            2. Second line: Space (Enter)
            3. From the third line onwards: Write a detailed answer in Markdown format. Omit unnecessary introductions.
          `,
        },
        {
          // 사용자 질문
          role: "user",
          content: question,
        },
      ],
      // 3. 모델 선택
      model: "openai/gpt-oss-120b",

      // 선택 옵션 (창의성 조절: 0.0 ~ 2.0)
      temperature: 0.7,
    });

    // 4. 응답 추출
    const text = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ answer: text });

  } catch (error: unknown) {
    console.error("Groq API Error:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: `AI 처리 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}