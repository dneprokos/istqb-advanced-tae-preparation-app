import { parseQuestionBlocks } from '../utils/questionText';

interface Props {
  text: string;
  className?: string;
}

export function QuestionText({ text, className }: Props) {
  const blocks = parseQuestionBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.type === 'table') {
          return (
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
          );
        }

        if (block.type === 'matching-list') {
          const columns = [block.left, block.right];
          return (
            <div key={i} className="grid sm:grid-cols-2 gap-3 text-sm">
              {columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 space-y-1"
                >
                  {col.label && (
                    <div className="font-semibold text-gray-700 dark:text-gray-300">{col.label}</div>
                  )}
                  {col.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-2">
                      <span className="font-semibold flex-shrink-0">
                        {colIdx === 0 ? itemIdx + 1 : String.fromCharCode(65 + itemIdx)}.
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={i} className={className}>
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
