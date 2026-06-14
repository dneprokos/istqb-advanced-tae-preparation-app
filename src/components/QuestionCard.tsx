import type { Question } from '../types';

interface Props {
  question: Question;
  selected: string[];
  isFlagged: boolean;
  onAnswer: (selected: string[]) => void;
  onToggleFlag: () => void;
}

export function QuestionCard({ question, selected, isFlagged, onAnswer, onToggleFlag }: Props) {
  const isMultiple = question.type === 'multiple';
  const selectCount = question.selectCount ?? question.correct.length;

  function handleOption(id: string) {
    if (isMultiple) {
      const next = selected.includes(id)
        ? selected.filter(s => s !== id)
        : selected.length < selectCount ? [...selected, id] : selected;
      onAnswer(next);
    } else {
      onAnswer([id]);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Ch{question.chapter} &middot; {question.section}
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {question.points} pts
            </span>
            {isMultiple && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                Select {selectCount}
              </span>
            )}
          </div>
          <p className="text-base font-medium leading-snug">{question.text}</p>
        </div>
        <button
          onClick={onToggleFlag}
          title={isFlagged ? 'Remove flag' : 'Flag for review'}
          className={`flex-shrink-0 text-xl ${isFlagged ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}`}
        >
          &#9873;
        </button>
      </div>

      <div className="space-y-2">
        {question.options.map(opt => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleOption(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <span className="font-semibold mr-2">{opt.id.toUpperCase()}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
