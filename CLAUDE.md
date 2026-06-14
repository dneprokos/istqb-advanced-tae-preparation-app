# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # tsc -b && vite build
npm run lint       # eslint .
npm run preview    # preview production build
npm run validate   # validate question bank JSON integrity
```

No test suite exists (no jest/vitest).

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS. No router library — `App.tsx` manages a single `AppView` state (`'home' | 'exam' | 'history' | 'settings'`). If `examState !== null`, the exam view overrides whatever view is set.

**Data flow:**
- `src/hooks/useData.ts` — module-level singleton that fetches `public/data/index.json` + all `chapter-{n}.json` files once. Components subscribe via a listener array; subsequent mounts get the cached result.
- `src/hooks/useExam.ts` — full exam state machine (start, answer, flag, navigate, review, submit, exit). Persists in-progress state to localStorage on every change.
- `src/hooks/useSettings.ts` — reads/writes `AppSettings` to localStorage.

**Persistence** (`src/utils/storage.ts`, localStorage keys):
- `tae_attempts` — completed `Attempt[]` history
- `tae_in_progress` — resumable `InProgressAttempt`
- `tae_settings` — `AppSettings` (passPercent, randomize flags, theme)

**Question bank** (`public/data/`):
- `index.json` — chapter metadata + exam config (40 questions, 66 points, 90 min, 65% pass)
- `chapter-{1..8}.json` — arrays of `Question` objects
- All questions within a chapter must have equal `points` (required for random selection fairness)
- Run `npm run validate` after editing any JSON to check structural integrity

**Types** (`src/types.ts`): single source of truth — `Question`, `Attempt`, `InProgressAttempt`, `AppSettings`, `IndexData`.

## Protected directories — never touch
- `docs/` — source PDFs and reference material. Never delete, overwrite, or pass `--overwrite` / `-f` flags to any scaffolding tool that could affect this directory.

## Scaffolding in non-empty directories
When running `npm create vite`, `create-react-app`, or any generator in this directory: do NOT use `--overwrite`, `--force`, or equivalent flags. Create files manually or move existing files out first.
