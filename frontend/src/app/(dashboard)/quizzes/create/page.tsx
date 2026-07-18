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

  const choiceColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Buat Quiz Baru</h1>
        <p className="mt-1 text-sm text-gray-500">Isi informasi quiz dan tambahkan pertanyaan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Quiz</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Judul Quiz"
              placeholder="Masukkan judul quiz..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                placeholder="Jelaskan tentang quiz ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
                  {qIndex + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">Pertanyaan {qIndex + 1}</h3>
              </div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Hapus
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
                <textarea
                  placeholder="Contoh: Berapa hasil dari 2 + 2?"
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={QuestionType.MULTIPLE_CHOICE}>Pilihan Ganda</option>
                    <option value={QuestionType.TRUE_FALSE}>Benar / Salah</option>
                  </select>
                </div>
                <Input
                  label="Poin"
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                  required
                />
                <Input
                  label="Waktu (detik)"
                  type="number"
                  min={5}
                  value={q.timeLimit}
                  onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan Jawaban</label>
                <div className="space-y-2.5">
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center gap-3">
                      <span className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${choiceColors[cIndex]}`}>
                        {String.fromCharCode(65 + cIndex)}
                      </span>
                      <input
                        placeholder={`Pilihan ${cIndex + 1}`}
                        value={choice}
                        onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban Benar</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Pilih jawaban benar</option>
                  {q.choices.filter((c) => c.trim()).map((choice, i) => (
                    <option key={i} value={choice}>{String.fromCharCode(65 + i)}. {choice}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-4 text-sm font-semibold text-indigo-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Pertanyaan
        </button>

        <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={createQuiz.isPending}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {createQuiz.isPending ? 'Membuat...' : 'Buat Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
