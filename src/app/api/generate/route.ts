import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// .env.local에 있는 API 키를 사용
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "질문이 없습니다." }, { status: 400 });
    }

    // [핵심] 시스템 지침(System Instruction) 설정
    // 모델에게 답변의 구조를 강제하여 사용자 경험을 높입니다.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: `
        당신은 '블록형 인터페이스'를 위한 AI 어시스턴트입니다.
        작은 카드 형태의 UI에서 가독성을 높이기 위해 답변 형식을 엄격히 지켜주세요.

        [답변 형식 규칙]
        1. 첫 줄: 반드시 "[요약]"으로 시작하며, 답변의 핵심 결론을 1~2문장으로 간결하게 요약하세요.
        2. 두 번째 줄: 공백(엔터)
        3. 세 번째 줄부터: 상세한 답변을 마크다운(Markdown) 형식으로 작성하세요. 불필요한 서론은 생략하세요.
      `
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ answer: text });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}