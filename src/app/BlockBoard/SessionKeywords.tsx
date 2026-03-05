//===src/app/BlockBoard/SessionKeywords.tsx (신규)

'use client';

import React, { useState } from 'react';
import { Tag, Edit2, Check, X, RefreshCw } from 'lucide-react';

interface SessionKeywordsProps {
  keywords: string[];
  isManual: boolean;
  onUpdate: (keywords: string[]) => void;
  onRegenerate: () => void;
}

export default function SessionKeywords({ 
  keywords, 
  isManual, 
  onUpdate, 
  onRegenerate 
}: SessionKeywordsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [tempKeywords, setTempKeywords] = useState<string[]>(keywords);

  const handleStartEdit = () => {
    setTempKeywords(keywords);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(tempKeywords);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempKeywords(keywords);
    setIsEditing(false);
    setEditValue('');
  };

  const handleAddKeyword = () => {
    if (editValue.trim() && tempKeywords.length < 7) {
      setTempKeywords([...tempKeywords, editValue.trim()]);
      setEditValue('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setTempKeywords(tempKeywords.filter((_, i) => i !== index));
  };

  if (keywords.length === 0 && !isEditing) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-lg p-3 shadow-lg flex items-center gap-2 text-sm text-gray-600">
        <Tag size={16} />
        <span>키워드 없음</span>
        <button
          onClick={onRegenerate}
          className="ml-2 text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <RefreshCw size={14} />
          생성
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-md border border-gray-200/50 rounded-lg p-3 shadow-lg max-h-40 overflow-y-auto w-full md:w-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Tag size={16} className="text-blue-500" />
          주제 키워드
          {isManual && !isEditing && (
            <span className="text-xs text-gray-400">(수정됨)</span>
          )}
        </div>
  
        {/* 편집 모드에 따라 버튼 변경 */}
        <div className="flex gap-1">
          {isEditing ? (
            <>
              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                className="p-1.5 hover:bg-green-100 rounded transition-colors"
                title="저장"
              >
                <Check size={16} className="text-green-600" />
              </button>
              {/* 취소 버튼 */}
              <button
                onClick={handleCancel}
                className="p-1.5 hover:bg-red-100 rounded transition-colors"
                title="취소"
              >
                <X size={16} className="text-red-600" />
              </button>
            </>
          ) : (
            <>
              {/* 편집 버튼 */}
              <button
                onClick={handleStartEdit}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="키워드 편집"
              >
                <Edit2 size={14} className="text-gray-600" />
              </button>
              {/* 재생성 버튼 */}
              <button
                onClick={onRegenerate}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="키워드 재생성"
              >
                <RefreshCw size={14} className="text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 표시 모드 */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* 편집 모드 */}
      {isEditing && (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tempKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 flex items-center gap-1"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(index)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {tempKeywords.length < 7 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddKeyword}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                추가
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}