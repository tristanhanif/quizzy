'use client';

import { formatDate, truncateText } from '@/utils/formatters';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export default function QuizCard({ quiz, onClick, actions }: QuizCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-indigo-200 p-6 transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          {actions}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4 line-clamp-2">{truncateText(quiz.description, 100)}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            {quiz.questions.length} pertanyaan
          </div>
          <span className="text-xs text-gray-400">{formatDate(quiz.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
