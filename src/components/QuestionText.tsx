import { parseQuestionBlocks } from '../utils/questionText';

interface Props {
  text: string;
  className?: string;
}

export function QuestionText({ text, className }: Props) {
  const blocks = parseQuestionBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) =>
        block.type === 'table' ? (
          <div key={i} className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
              <thead>
                <tr>
                  {block.headers.map((h, j) => (
                    <th
                      key={j}
                      className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="border border-gray-200 dark:border-gray-700 px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p key={i} className={className}>
            {block.content}
          </p>
        )
      )}
    </div>
  );
}
