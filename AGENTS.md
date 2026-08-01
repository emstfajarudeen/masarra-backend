# Masarra backend rules

- Work one approved implementation phase at a time.
- Do not implement unapproved modules or endpoints.
- Use Node.js 24, AdonisJS, Inertia React and PostgreSQL.
- Keep controllers thin and domain logic framework-light.
- Keep table design lean; avoid separate settings/relationship tables unless the requirement needs them.
- Use VineJS for request validation.
- Use the shared API response shape and global exception handler.
- Add tests with each endpoint.
- Update `docs/IMPLEMENTATION_PROGRESS.md` after every completed step.
- Run `npm run check` before handoff.
- Never commit or push unless explicitly requested.
