'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateQuiz } from '@/hooks/useQuiz';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { QuestionType } from '@/types';

interface QuestionInput {
  text: string;
  type: QuestionType;
  points: number;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const createQuiz = useCreateQuiz();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      text: '',
      type: QuestionType.MULTIPLE_CHOICE,
      points: 10,
      choices: ['', '', '', ''],
      correctAnswer: '',
      timeLimit: 30,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: QuestionType.MULTIPLE_CHOICE,
        points: 10,
        choices: ['', '', '', ''],
        correctAnswer: '',
        timeLimit: 30,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuiz.mutateAsync({
        title,
        description,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          choices: q.choices.filter((c) => c.trim() !== ''),
          correctAnswer: q.correctAnswer,
          timeLimit: q.timeLimit,
        })),
      });
      router.push('/quizzes');
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="space-y-4">
            <Input
              label="Quiz Title"
              placeholder="My Awesome Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Describe your quiz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                required
              />
            </div>
          </div>
        </Card>

        {questions.map((q, qIndex) => (
          <Card key={qIndex}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  placeholder="What is 2 + 2?"
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                    <option value={QuestionType.TRUE_FALSE}>True / False</option>
                  </select>
                </div>
                <Input
                  label="Points"
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                  required
                />
                <Input
                  label="Time (sec)"
                  type="number"
                  min={5}
                  value={q.timeLimit}
                  onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                <div className="space-y-2">
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                        {String.fromCharCode(65 + cIndex)}
                      </span>
                      <input
                        placeholder={`Choice ${cIndex + 1}`}
                        value={choice}
                        onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select correct answer</option>
                  {q.choices.filter((c) => c.trim()).map((choice, i) => (
                    <option key={i} value={choice}>{String.fromCharCode(65 + i)}. {choice}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        ))}

        <Button type="button" variant="secondary" onClick={addQuestion} className="w-full">
          + Add Question
        </Button>

        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={createQuiz.isPending}>
            Create Quiz
          </Button>
        </div>
      </form>
    </div>
  );
}
