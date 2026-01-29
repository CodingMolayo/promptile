// 서버 API 엔드포인트로 질문을 보내고 답변을 받아오는 함수
export const generateAnswer = async (question: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
  
      if (!response.ok) {
        // 서버에서 에러가 났을 경우
        const errorData = await response.json();
        throw new Error(errorData.error || '네트워크 오류');
      }
  
      const data = await response.json();
      return data.answer; // 실제 AI의 답변 텍스트
    } catch (error) {
      console.error("API 호출 실패:", error);
      return "죄송합니다. 현재 AI 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }
  };
  
  // (참고) mockGenerateAnswer 함수는 이제 지우셔도 됩니다.