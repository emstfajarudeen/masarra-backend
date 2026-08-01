# Development rules

## UI design tokens

- Reuse Masarra public UI colors from `docs/DESIGN_TOKENS.md`.
- Admin UI must not introduce a separate color palette without approval.
- Keep Arabic-first RTL support in all frontend/admin screens.

- Keep controllers thin; business logic belongs in services or domain modules.
- Validate every external input with VineJS.
- Return API payloads through the shared response helpers.
- Let exceptions reach the global exception handler.
- Never expose stack traces, secrets or internal database errors.
- Use database transactions for multi-write operations.
- Make payment, credit and game commands idempotent.
- Keep migrations immutable after they reach a shared environment.
- Prefer lean tables; add relationship/config tables only for real many-to-many, versioning or independent lifecycle.
- Store user-facing database content in translation tables.
- Default to Arabic and add English through locale records.
- Store uploaded media behind media asset records, not hardcoded file paths.
- Keep storage implementation swappable; local storage now, S3-compatible storage later.
- Add unit tests for domain logic and functional tests for every API.
- Run `npm run check` before requesting review.
- Do not add a new phase until the previous phase is approved.
