import type { Question, AttemptAnswer } from '../types';

interface Props {
  questions: Question[];
  answers: AttemptAnswer[];
  flagged: string[];
  currentIndex: number;
  onGoTo: (i: number) => void;
}

export function NavGrid({ questions, answers, flagged, currentIndex, onGoTo }: Props) {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selected]));

  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex gap-4">
        <span><span className="inline-block w-3 h-3 rounded bg-blue-500 mr-1" />Current</span>
        <span><span className="inline-block w-3 h-3 rounded bg-green-500 mr-1" />Answered</span>
        <span><span className="inline-block w-3 h-3 rounded bg-amber-400 mr-1" />Flagged</span>
        <span><span className="inline-block w-3 h-3 rounded border border-gray-300 dark:border-gray-600 mr-1" />Unanswered</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const answered = (answerMap.get(q.id) ?? []).length > 0;
          const isFlagged = flagged.includes(q.id);
          const isCurrent = i === currentIndex;
          let cls = 'w-8 h-8 rounded text-xs font-medium border transition ';
          if (isCurrent) cls += 'bg-blue-600 border-blue-600 text-white';
          else if (isFlagged) cls += 'bg-amber-400 border-amber-400 text-white';
          else if (answered) cls += 'bg-green-500 border-green-500 text-white';
          else cls += 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400';
          return (
            <button key={q.id} onClick={() => onGoTo(i)} className={cls}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
