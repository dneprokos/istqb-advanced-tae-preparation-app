interface Props {
  seconds: number;
}

export function TimerDisplay({ seconds }: Props) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const isWarning = seconds <= 300;
  const formatted = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;

  return (
    <span className={`font-mono font-semibold text-sm px-3 py-1 rounded-lg ${
      isWarning
        ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }`}>
      &#9201; {formatted}
    </span>
  );
}
