import { useState, useEffect } from 'react';
import { useData } from './hooks/useData';
import { useExam } from './hooks/useExam';
import { useSettings } from './hooks/useSettings';
import { HomePage } from './pages/HomePage';
import { ExamPage } from './pages/ExamPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

type AppView = 'home' | 'exam' | 'history' | 'settings';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const { indexData, questionsByChapter, loading, error } = useData();
  const { settings, updateSettings } = useSettings();
  const examHook = useExam(indexData, questionsByChapter, settings);

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // If exam is in progress, show exam page
  const activeView = examHook.examState !== null ? 'exam' : view;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading question bank...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {activeView !== 'exam' && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setView('home')}
            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:opacity-80"
          >
            ISTQB TAE Prep
          </button>
          <nav className="flex gap-4 text-sm font-medium">
            <button
              onClick={() => setView('history')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 ${view === 'history' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              History
            </button>
            <button
              onClick={() => setView('settings')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 ${view === 'settings' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              Settings
            </button>
          </nav>
        </header>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeView === 'home' && indexData && (
          <HomePage
            indexData={indexData}
            passPercent={settings.passPercent}
            onStartFullExam={examHook.startFullExam}
            onStartSection={examHook.startSectionPractice}
          />
        )}
        {activeView === 'exam' && examHook.examState && (
          <ExamPage
            examState={examHook.examState}
            indexData={indexData!}
            onAnswer={examHook.answerQuestion}
            onToggleFlag={examHook.toggleFlag}
            onGoToIndex={examHook.goToIndex}
            onNext={examHook.goNext}
            onPrev={examHook.goPrev}
            onEnterReview={examHook.enterReview}
            onBackToQuestion={examHook.backToQuestion}
            onSubmit={examHook.submitExam}
            onExit={() => { examHook.exitExam(); setView('home'); }}
            onGoHome={() => { examHook.exitExam(); setView('home'); }}
          />
        )}
        {activeView === 'history' && (
          <HistoryPage indexData={indexData} passPercent={settings.passPercent} />
        )}
        {activeView === 'settings' && (
          <SettingsPage settings={settings} onUpdate={updateSettings} />
        )}
      </main>
    </div>
  );
}
