import type { Attempt, InProgressAttempt, AppSettings } from '../types';

const KEYS = {
  attempts: 'tae_attempts',
  inProgress: 'tae_in_progress',
  settings: 'tae_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  passPercent: 65,
  randomizeQuestions: true,
  randomizeOptions: true,
  theme: 'light',
};

export function getAttempts(): Attempt[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.attempts) ?? '[]');
  } catch { return []; }
}

export function saveAttempt(attempt: Attempt): void {
  const all = getAttempts();
  localStorage.setItem(KEYS.attempts, JSON.stringify([attempt, ...all]));
}

export function clearAttempts(): void {
  localStorage.removeItem(KEYS.attempts);
}

export function exportAttempts(): void {
  const data = JSON.stringify(getAttempts(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tae-history.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function getInProgress(): InProgressAttempt | null {
  try {
    const raw = localStorage.getItem(KEYS.inProgress);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveInProgress(state: InProgressAttempt): void {
  localStorage.setItem(KEYS.inProgress, JSON.stringify(state));
}

export function clearInProgress(): void {
  localStorage.removeItem(KEYS.inProgress);
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
