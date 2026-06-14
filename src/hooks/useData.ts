import { useState, useEffect } from 'react';
import type { IndexData, Question } from '../types';

let _indexData: IndexData | null = null;
let _questionsByChapter: Map<number, Question[]> = new Map();
let _loaded = false;
let _loading = false;
const _listeners: Array<() => void> = [];

async function loadData() {
  if (_loaded || _loading) return;
  _loading = true;
  try {
    const base = import.meta.env.BASE_URL;
    const idx = await fetch(`${base}data/index.json`).then(r => r.json()) as IndexData;
    _indexData = idx;
    const entries = await Promise.all(
      idx.chapters.map(ch =>
        fetch(`${base}data/chapter-${ch.id}.json`)
          .then(r => r.json() as Promise<Question[]>)
          .then(qs => [ch.id, qs] as [number, Question[]])
      )
    );
    _questionsByChapter = new Map(entries);
    _loaded = true;
  } finally {
    _loading = false;
    _listeners.forEach(fn => fn());
  }
}

export function useData() {
  const [, forceUpdate] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const notify = () => forceUpdate(n => n + 1);
    _listeners.push(notify);
    loadData().catch(e => setError(String(e)));
    return () => {
      const i = _listeners.indexOf(notify);
      if (i >= 0) _listeners.splice(i, 1);
    };
  }, []);

  return {
    indexData: _indexData,
    questionsByChapter: _questionsByChapter,
    loading: !_loaded,
    error,
  };
}
