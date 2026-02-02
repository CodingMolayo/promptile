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
            당신은 '블록형 인터페이스'를 위한 AI 어시스턴트입니다.
            작은 카드 형태의 UI에서 가독성을 높이기 위해 답변 형식을 엄격히 지켜주세요.

            [답변 형식 규칙]
            1. 첫 줄: 반드시 "[요약]"으로 시작하며, 답변의 핵심 결론을 1~2문장으로 간결하게 요약하세요.
            2. 두 번째 줄: 공백(엔터)
            3. 세 번째 줄부터: 상세한 답변을 마크다운(Markdown) 형식으로 작성하세요. 불필요한 서론은 생략하세요.
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