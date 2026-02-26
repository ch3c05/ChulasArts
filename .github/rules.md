# Code Rules & Best Practices

## File Size & Complexity

- **Max 300 lines per file.** Split large files into smaller, focused modules.
- **Max 50 lines per function.** If a function is longer, extract helpers.
- **One component per file.** No multi-component files in React.
- **Flat imports preferred.** Avoid deep relative paths; use path aliases (`@/`).

## Code Style

- **No inline styles.** Use MUI's `sx` prop with theme tokens, or extract to `styled()` / CSS Modules for reusable patterns. Never use the HTML `style` attribute.
- **No magic numbers or strings.** Extract constants with descriptive names.
- **No `any` type.** Every variable, parameter, and return value must be typed. Use `unknown` + type guards when the type is truly dynamic.
- **No unused code.** Remove dead imports, variables, and commented-out blocks before committing.
- **No console.log in production code.** Use a structured logger on the backend. Remove `console.log` from frontend before merge.

## Security

- **No secrets in code.** API keys, connection strings, tokens, and passwords go in `.env` files (never committed). Access via `process.env` or `import.meta.env`.
- **Validate all external input.** Use express-validator on backend routes. Sanitize user-provided HTML to prevent XSS.
- **Parameterize all database queries.** Never interpolate user input into queries or regex patterns.
- **Use httpOnly cookies for auth tokens.** Never store JWTs in localStorage or sessionStorage.
- **Set CORS, rate limiting, and security headers** on every backend deployment.
- **No credentials in logs.** Redact tokens, passwords, and PII before logging.

## Accessibility (WCAG 2.1 AA)

- **Every interactive element must be keyboard accessible.** Buttons, links, modals, dropdowns — all must work with Tab, Enter, Escape.
- **Every `<img>` must have a meaningful `alt` attribute.** Decorative images use `alt=""` with `role="presentation"`.
- **Use semantic HTML.** Prefer `<button>`, `<nav>`, `<main>`, `<section>` over generic `<div>` with click handlers.
- **ARIA labels on icon-only buttons.** Every `<IconButton>` needs `aria-label`.
- **Color contrast ratio ≥ 4.5:1** for text, ≥ 3:1 for large text and UI components.
- **Visible focus indicators.** Never remove outline without providing an equivalent.
- **Form inputs require associated labels.** Use `<label htmlFor>` or `aria-label`.

## React & Frontend

- **Functional components only.** No class components.
- **Props must have explicit TypeScript interfaces.** Define them above the component.
- **Extract logic into custom hooks** when state/effects are reused or complex (>10 lines).
- **Memoize expensive computations.** Use `useMemo` / `useCallback` where re-renders are measurable.
- **Lazy-load routes and heavy components** with `React.lazy` + `Suspense`.
- **Always provide loading and error states** for async operations.
- **No direct DOM manipulation.** Use refs only when React APIs are insufficient.

## Backend & API

- **Consistent response shape:** `{ data, error, message, pagination }`.
- **Status codes must be correct:** 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.
- **Handle all async errors.** Every `async` route handler must have a `try/catch` that calls `next(error)`.
- **Validate before processing.** Reject bad input at the middleware layer, not inside services.
- **Keep routes thin.** Business logic belongs in service files, not in route handlers.
- **Use transactions** for operations that modify multiple collections.

## Database

- **Define TypeScript interfaces before Mongoose schemas.**
- **Add indexes for every query pattern.** Review with `explain()` for slow queries.
- **Paginate all list endpoints.** Never return unbounded result sets.
- **Use `lean()` for read-only queries** to skip Mongoose hydration overhead.

## Testing

- **Coverage ≥ 80%** for critical paths (auth, uploads, CRUD, social features).
- **Test behavior, not implementation.** Assert on outputs and side effects, not internal state.
- **Name tests descriptively:** `it('returns 401 when token is expired')`.
- **No test interdependence.** Each test must pass in isolation.

## Git & Workflow

- **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Small, focused PRs.** One feature or fix per pull request.
- **No force-push to shared branches.**
- **Run `npm run lint && npm test` before every commit.**
