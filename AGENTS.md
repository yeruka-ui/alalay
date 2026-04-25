# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Expo Router screens and route groups: `app/(auth)` for public flows and `app/(app)` for authenticated screens. Reusable UI lives in `components/`, shared business logic in `utils/`, typed models in `types/`, and static medication data in `data/`. Screen-specific styling is kept in `styles/`, media assets in `assets/`, and backend schema/functions in `supabase/`. Unit tests live in `tests/`.

## Build, Test, and Development Commands
- `npm install`: install project dependencies.
- `npm start`: launch the Expo dev server.
- `npm run android`: build and run the native Android app locally.
- `npm run ios`: build and run the iOS app locally.
- `npm run web`: run the Expo web target.
- `npm run lint`: run Expo ESLint checks.
- `npm run test:unit`: run Node-based unit tests in `tests/**/*.test.ts`.

## Coding Style & Naming Conventions
Use TypeScript with strict typing and the `@/*` path alias from `tsconfig.json`. Match the existing style: 2-space indentation, semicolons, double quotes, and trailing commas where the current file uses them. Use `PascalCase` for React components (`MedicationCard.tsx`), `camelCase` for helpers (`getSchedulesForDate`), and lowercase route filenames for Expo Router screens (`record_locker.tsx`). Keep shared styles in `styles/*.styles.ts`; prefer one style module per screen when the file is non-trivial.

## Testing Guidelines
Tests use Node's built-in `node:test` runner with `assert/strict`. Name tests `*.test.ts` and keep them in `tests/`. Add unit coverage for new utility logic, especially date, database-mapping, and presentation helpers. For UI-heavy changes in `app/` or `components/`, run `npm start` and verify the affected flow manually in Expo in addition to `npm run lint`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit-style subjects such as `feat(calendar): ...`, `fix(storage): ...`, and `chore: ...`. Keep subjects imperative, scoped when helpful, and optionally include task IDs like `(T-003)`. PRs should explain user-visible impact, list the commands you ran (`npm run lint`, `npm run test:unit`), and include screenshots or screen recordings for visual changes. Call out schema, env, or Supabase function changes explicitly.

## Security & Configuration Tips
Use `.env.example` as the client-side config template. Keep `EXPO_PUBLIC_*` values in `.env`, but never store provider secrets there. Gemini and other server-only keys belong in Supabase secrets, not in app code or committed files.
