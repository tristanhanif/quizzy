export function formatDate(dateString: string | { seconds?: number; nanoseconds?: number } | Date): string {
  let date: Date;
  if (dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'object' && dateString.seconds) {
    date = new Date(dateString.seconds * 1000);
  } else {
    date = new Date(String(dateString));
  }
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString('id-ID');
}

export function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRankBadge(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `#${rank}`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateTotalScore(answers: { score: number }[]): number {
  return answers.reduce((sum, a) => sum + a.score, 0);
}
