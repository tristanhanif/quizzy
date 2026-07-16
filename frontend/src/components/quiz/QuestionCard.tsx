'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { Question } from '@/types';
import { QuestionType } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult = false,
  selectedAnswer,
  isCorrect,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(selectedAnswer || null);

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-indigo-600">
          Question {questionNumber} / {totalQuestions}
        </span>
        <span className="text-sm text-gray-500">{question.points} pts</span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.text}</h2>

      <div className="space-y-3">
        {question.choices.map((choice, index) => {
          const isSelected = selected === choice;
          const isCorrectAnswer = choice === question.correctAnswer;
          const letter = String.fromCharCode(65 + index);

          let borderClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
          if (showResult) {
            if (isCorrectAnswer) {
              borderClass = 'border-indigo-500 bg-indigo-50';
            } else if (isSelected && !isCorrectAnswer) {
              borderClass = 'border-gray-400 bg-gray-100';
            }
          } else if (isSelected) {
            borderClass = 'border-indigo-500 bg-indigo-50';
          }

          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${borderClass}`}
            >
              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                {letter}
              </span>
              <span className="text-gray-900">{choice}</span>
              {showResult && isCorrectAnswer && (
                <svg className="w-5 h-5 text-indigo-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {showResult && isSelected && !isCorrectAnswer && (
                <svg className="w-5 h-5 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`mt-4 p-3 rounded-xl text-sm ${isCorrect ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
          {isCorrect ? `Correct! +${question.points} points` : `Incorrect. The correct answer is: ${question.correctAnswer}`}
        </div>
      )}
    </div>
  );
}
