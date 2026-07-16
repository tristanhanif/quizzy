'use client';

import Card from '@/components/ui/Card';
import { formatDate, truncateText } from '@/utils/formatters';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export default function QuizCard({ quiz, onClick, actions }: QuizCardProps) {
  return (
    <Card variant="hover" onClick={onClick}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{quiz.title}</h3>
          {actions}
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{truncateText(quiz.description, 100)}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-400">{formatDate(quiz.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
