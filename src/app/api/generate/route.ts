//===src/app/api/generate/route.ts

import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question, parentTail, mode = 'generate' } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "질문이 없습니다." }, { status: 400 });
    }

    // ========================================
    // 1. 답변 생성 (GENERATE or REGENERATE)
    // ========================================
    const systemPrompt = `
You are a great thinker operating in a Head-Body-Tail block structure system.

[Block Structure Understanding]
- Head: Summary from parent block (context)
- Body: User question + AI answer
- Tail: Summary of this block (for children to reference)

[Answer Format Rules]
0. ANSWER in KOREAN.
1. You know every valid and meaningful statement exists only in a certain world model. 
2. So you will use language to describe/simulate a suitable world model, and do reasoning within this model. 
3. Only write a detailed answer in Markdown format. Without expression of block structure.
4. If Head context exists, naturally continue from it WITHOUT meta-references like "이전 블록에서...".
5. You will always follow this strategy.

${mode === 'regenerate' ? '[REGENERATION MODE] The parent block was updated. Regenerate answer reflecting new context while keeping the question essence.' : ''}
    `;

    // 프롬프트 구성
    let userPrompt = question;
    if (parentTail) {
      userPrompt = `[부모 블록 요약 (Head)]\n${parentTail}\n\n[질문]\n${question}\n\n위 맥락을 자연스럽게 이어받아 답변하세요.`;
    }

    // API 호출
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content || "";

    // ========================================
    // 2. Tail 생성 (답변 요약)
    // ========================================
    const tailCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "다음 Q&A의 핵심을 1-2문장으로 간결하게 요약하세요. 메타 언급 없이 내용만 추출하세요. 반드시 한국어로 답변하세요."
        },
        {
          role: "user",
          content: `질문: ${question}\n\n답변: ${answer}\n\n위 내용을 1-2문장으로 요약:`
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_tokens: 256
    });

    const tail = tailCompletion.choices[0]?.message?.content || answer.split('\n')[0];

    return NextResponse.json({ 
      answer,
      tail,
      head: parentTail || null
    });

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