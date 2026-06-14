import type { ExamState } from '../hooks/useExam';

interface Props {
  examState: ExamState;
  onGoToQuestion: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewScreen({ examState, onGoToQuestion, onSubmit, onBack }: Props) {
  const answerMap = new Map(examState.answers.map(a => [a.questionId, a.selected]));
  const unanswered = examState.questions.filter(q => (answerMap.get(q.id) ?? []).length === 0);
  const flagged = examState.questions.filter(q => examState.flagged.includes(q.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Review Before Submit</h2>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          &larr; Back to exam
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600">{examState.answers.filter(a => a.selected.length > 0).length}</div>
          <div className="text-sm text-gray-500">Answered</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className={`text-2xl font-bold ${unanswered.length > 0 ? 'text-red-500' : 'text-green-600'}`}>{unanswered.length}</div>
          <div className="text-sm text-gray-500">Unanswered</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-amber-500">{flagged.length}</div>
          <div className="text-sm text-gray-500">Flagged</div>
        </div>
      </div>

      {unanswered.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-500 mb-2">Unanswered questions</h3>
          <div className="flex flex-wrap gap-2">
            {unanswered.map(q => {
              const i = examState.questions.indexOf(q);
              return (
                <button key={q.id} onClick={() => onGoToQuestion(i)}
                  className="px-3 py-1 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  Q{i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {flagged.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-500 mb-2">Flagged questions</h3>
          <div className="flex flex-wrap gap-2">
            {flagged.map(q => {
              const i = examState.questions.indexOf(q);
              return (
                <button key={q.id} onClick={() => onGoToQuestion(i)}
                  className="px-3 py-1 text-sm border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  Q{i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3">
        <button
          onClick={onSubmit}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Submit Exam
        </button>
        <button onClick={onBack} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          Keep reviewing
        </button>
      </div>
    </div>
  );
}
