# Implementation progress

## Step 1 — Foundation

- [x] Scaffold AdonisJS with React and Inertia.
- [x] Pin Node.js 24 and npm 11.
- [x] Configure PostgreSQL.
- [x] Add local PostgreSQL container setup.
- [x] Configure Arabic as the default locale.
- [x] Add authorization and rate-limiter foundations.
- [x] Add security headers, CSRF and CORS rules.
- [x] Add API response and error conventions.
- [x] Add request correlation IDs and structured logs.
- [x] Add lint, format, typecheck and test commands.
- [x] Add local Git hooks and CI quality checks.
- [x] Capture initial lean game data model notes.
- [x] Approval received for Step 2.

## Step 2 — Authentication APIs

- [x] Implement session auth APIs.
- [x] Implement mobile OTP verification foundation.
- [x] Add auth validation and tests.
- [x] Run lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 3.

## Step 3 — Account Profile + Public Content APIs

- [x] Implement account profile APIs.
- [x] Implement account password API.
- [x] Implement public content page API.
- [x] Implement contact form API.
- [x] Add validations and tests.
- [x] Run lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 4.

## Step 4 — Master APIs

- [x] Implement game master APIs.
- [x] Implement optional question category master API payloads.
- [x] Add validations and tests.
- [x] Run lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 5.

## Step 5 — Game Session Setup APIs

- [x] Implement draft game session creation.
- [x] Implement session team setup APIs.
- [x] Implement session settings APIs.
- [x] Implement optional category selection API.
- [x] Implement setup lock API.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 6.

## Step 6 — Payment and Credit Reservation Foundation

- [x] Implement wallet read API.
- [x] Implement payment records and category payment intent.
- [x] Implement payment confirmation placeholder.
- [x] Implement game session credit reservation.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 7.

## Step 7 — Gameplay Round Lifecycle APIs

- [x] Implement game start API.
- [x] Implement round creation/start lifecycle.
- [x] Implement round completion lifecycle.
- [x] Implement round abandon/refund/forfeit lifecycle.
- [x] Implement host stop lifecycle and unplayed round refunds.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 8.

## Step 8 — Questions, Answers and Scoring APIs

- [x] Implement question master consumption for active rounds.
- [x] Implement round question assignment.
- [x] Implement answer/scoring records.
- [x] Implement normal, double and steal scoring rules.
- [x] Implement scoreboard API.
- [x] Add validations and tests.
- [x] Run quality checks.
- [x] Approval received for Step 9.

## Step 9 — Admin/CMS Management APIs

- [x] Add admin role and admin middleware.
- [x] Implement admin game CMS APIs.
- [x] Implement admin question category CMS APIs.
- [x] Implement admin question CMS APIs.
- [x] Implement admin content page CMS APIs.
- [x] Implement admin contact message moderation APIs.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 10.

## Step 10 — Public Account History APIs

- [x] Implement game history list API.
- [x] Implement game history detail API.
- [x] Implement purchased history API.
- [x] Implement credit transaction history API.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 11.

## Step 11 — Admin Dashboard/Reporting APIs

- [x] Implement dashboard summary API.
- [x] Implement payment report API.
- [x] Implement game session report API.
- [x] Implement user report API.
- [x] Implement contact message report API.
- [x] Add validations and tests.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 12.

## Step 12 — Admin Panel UI Foundation

- [x] Add admin Inertia web routes.
- [x] Add admin dashboard page.
- [x] Add admin layout, sidebar and topbar.
- [x] Add admin CMS list shells.
- [x] Reuse Masarra Figma palette tokens.
- [x] Run format, lint, typecheck and production build.
- [x] Approval received for Step 13.

## Step 13 — Admin CMS Forms

- [x] Add game create/edit form.
- [x] Add category create/edit form.
- [x] Add question create/edit form.
- [x] Add content page create/edit form.
- [x] Add contact message detail/status form.
- [x] Store question content/effect metadata.
- [x] Run format, lint, typecheck and production build.
- [x] Approval received for Step 14.

## Step 14 — Admin Form Polish and Validation UX

- [x] Add inline validation display hooks.
- [x] Add field help text and disabled states.
- [x] Improve question category filtering UX.
- [x] Add media URL placeholder handling.
- [x] Add admin UI smoke tests.
- [x] Run format, lint, typecheck and production build.
- [x] Approval received for Step 15.

## Step 15 — Local Media Storage Foundation

- [x] Add media assets table and model.
- [x] Add local media storage service.
- [x] Add admin media upload/list/detail APIs.
- [x] Add public media file delivery route.
- [x] Connect admin question form to media uploads.
- [x] Store question media asset IDs in metadata.
- [x] Add media upload tests.
- [x] Run format, lint, typecheck and production build.
- [x] Run unit tests.
- [ ] Run full test suite after local PostgreSQL is available.
- [x] Approval received for Step 16.

## Step 16 — Admin Media Library UI

- [x] Add admin media library route.
- [x] Add media library screen.
- [x] Add type and visibility filters.
- [x] Add image, video and audio previews.
- [x] Add reusable media picker in question form.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 17.

## Step 17 — Admin Question Bank UI Enhancements

- [x] Add question filters by game, category, status, type, content mode and effect.
- [x] Show media and effect metadata in the question bank.
- [x] Add question preview cards.
- [x] Add question bank stats.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 18.

## Step 18 — Admin Game/Category List Filters and Polish

- [x] Add game list filters by status and optional category support.
- [x] Add category list filters by game, status and enabled state.
- [x] Add game and category stats cards.
- [x] Show key configuration directly in list cards.
- [x] Improve empty states and quick edit links.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 19.

## Step 19 — Admin Content/Pages Polish

- [x] Add content page filters by status.
- [x] Add content page stats and preview cards.
- [x] Add preview summary for legal/general pages.
- [x] Add contact message filters by status.
- [x] Improve contact message list cards and preview.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 20.

## Step 20 — Admin User Management UI

- [x] Add admin users route.
- [x] Add user filters by role and status.
- [x] Add user stats cards.
- [x] Show profile, verification, wallet, session and purchase summaries.
- [x] Keep user management read-only for this phase.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 21.

## Step 21 — Admin User Detail and Moderation

- [x] Add admin user detail route.
- [x] Show profile and verification details.
- [x] Show recent game sessions.
- [x] Show recent payments.
- [x] Show credit transaction history.
- [x] Add read-only account timeline.
- [x] Keep moderation state changes out of scope.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 22.

## Step 22 — Admin Operational Reports UI

- [x] Add admin reports route.
- [x] Add date range filters.
- [x] Show revenue, sessions, payments, users and credits summary.
- [x] Show status/method/type breakdown cards.
- [x] Show most played games.
- [x] Show latest sessions and payments.
- [x] Keep reports read-only.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received for Step 23.

## Step 23 — Admin Question/Game Detail Views

- [x] Add read-only game detail route.
- [x] Add read-only category detail route.
- [x] Add read-only question preview route.
- [x] Link list cards to detail screens.
- [x] Show operational stats and recent usage.
- [x] Show question media preview and effect logic.
- [x] Keep detail screens read-only.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.
- [x] Approval received to complete remaining admin steps without pausing.

## Step 24 — Admin Safe State Actions

- [x] Add validated game status actions.
- [x] Add validated category status actions.
- [x] Add validated category availability action.
- [x] Add validated question status actions.
- [x] Add validated content page status actions.
- [x] Add validated user activate/suspend action.
- [x] Block self-suspension for current admin.
- [x] Add confirmation prompts in admin UI.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.

## Step 25 — Admin Finance and Credit UI

- [x] Add admin finance route.
- [x] Add payment review table.
- [x] Add credit transaction review table.
- [x] Add date range filters.
- [x] Add revenue and credit movement summaries.
- [x] Keep manual credit adjustment out of scope.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.

## Step 26 — Admin System Settings UI

- [x] Add admin settings route.
- [x] Show runtime, localization, storage, auth, payment and gameplay config.
- [x] Keep settings read-only.
- [x] Avoid exposing secrets.
- [x] Add admin UI smoke test coverage.
- [x] Run format, lint, typecheck and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.

## Step 27 — Final Admin QA and Handoff

- [x] Reuse Masarra color palette across added admin screens.
- [x] Keep new finance/settings screens admin-only.
- [x] Keep destructive/delete actions out.
- [x] Run format check.
- [x] Run lint.
- [x] Run typecheck.
- [x] Run production build.
- [ ] Run full functional suite after local PostgreSQL role `masarra` is available.

## Step 28 — Admin Form UI Refinement

- [x] Tighten and constrain shared admin form layouts.
- [x] Match admin form width to the full-width list-page content area.
- [x] Clarify game setup field labels without changing behavior.
- [x] Add a reusable themed checkbox with explicit spacing and interaction states.
- [x] Run targeted formatting, lint and production build.
- [ ] Run full check after local PostgreSQL role `masarra` is available.

## Step 29 — isEnabled Removal

- [x] Removed `isEnabled` column from `QuestionCategory` model and all backend layers.
- [x] Added drop-column migration `1785348816836`.
- [x] Updated all validators, controllers, transformer, service, and routes.
- [x] Removed from all admin UI pages (form, show, list, game detail).
- [x] Updated all functional tests to use status as the single availability gate.
- [x] Status=published is now the single source of truth for category visibility.
- [x] Run typecheck and production build.
- [ ] Run full test suite after local PostgreSQL role `masarra` is available.

## Step 30 — Admin Filter Sections UI Redesign (Arabic)

- [x] Redesigned the filter forms on all admin list pages (questions, games, categories, content pages, contact messages, and users) into clean responsive grid cards.
- [x] Added explicit Arabic titles, field labels, and select option names, removing all English text.
- [x] Translated all table headers and stats titles to Arabic across these pages.
- [x] Resolved pre-existing and related typescript warning/error issues in tsconfig, calendar, and unused variables.
- [x] Ran formatting, linting, typechecking, and verified production build success.

## Step 30 — Admin Subscription Plans

- [x] Add `subscription_plans` + `subscription_plan_translations` tables and models.
- [x] Add bilingual-ready admin CRUD (list, create, edit, status) mirroring games/categories.
- [x] Add VineJS validator and admin routes under `/admin/subscriptions`.
- [x] Add sidebar navigation entry.
- [x] Add list, create/edit form, and read-only show pages.
- [x] Store `rounds_granted` so a future purchase phase can credit the wallet via a `grant` transaction.
- [x] Use a Quill rich-text editor for plan advantages and add a live preview card in the form.
- [x] Add a delete action (row overflow menu + confirmation dialog) with a hard-delete backend route.
- [x] Add admin subscription CRUD functional test.
- [x] Run typecheck and production build.
- [ ] Wire user-facing purchase/checkout that credits the wallet (next phase).
- [ ] Run full test suite after local PostgreSQL role `masarra` is available.

## Step 31 — Dynamic Fun Rules & Question Rule Snapshotting

- [x] Add `fun_rules` migration `1785348816840_create_fun_rules_table.ts` and `FunRule` model.
- [x] Seed default fun rules (`normal`, `steal`, `transfer`, `freeze`, `double`) in development seeder.
- [x] Add VineJS validation schemas for Fun Rules management.
- [x] Register admin routes under `/admin/fun-rules` (list, create, store, edit, update, toggle status).
- [x] Add sidebar navigation entry "قواعد التأثير" in admin layout.
- [x] Create Inertia React list page `inertia/pages/admin/fun_rules.tsx` and form page `inertia/pages/admin/fun_rule_form.tsx`.
- [x] Update Question Form (`inertia/pages/admin/question_form.tsx`) to dynamically load active fun rules options from server.
- [x] Implement Rule Snapshotting: When creating or updating a question, freeze and snapshot full rule attributes into `question.metadata.funRule`.
- [x] Update Question detail page (`inertia/pages/admin/question_show.tsx`) to display snapshotted rule details.
- [x] Add functional tests in `tests/functional/admin/fun_rules.spec.ts` verifying CRUD operations and snapshot retention when master rule definition changes.
- [x] Run formatting, linting, and typechecking.

