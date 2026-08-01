# Data model notes

## Table design rule

- Keep one table per real business concept.
- Add relationship/config tables only when one record must connect many records or when the data has independent lifecycle.
- Do not split simple game setup settings into separate tables until product requirements need versioning or reuse.
- Store user-facing multilingual content in translation tables when the content belongs to admin-managed records.

## Initial lean game model

### `games`

- Main game types shown on the home screen.
- Stores setup rules directly when they are simple:
  - min team count
  - max team count
  - allowed round counts
  - allowed question timer values
  - base credit cost rules
  - status
  - optional category feature flag
- Has translations for title, description and instructions.

### `game_sessions`

- One play setup/session created by a host.
- Stores selected setup:
  - host user
  - game
  - selected rounds
  - selected question duration
  - optional category, nullable
  - status
  - locked timestamp
  - start/end timestamps
- Setup is locked after payment or game start.
- Only one optional category is allowed per session.

### `game_session_teams`

- Teams created for one session only.
- No separate `teams` table unless saved/reusable teams become a product feature.
- Team names and colors must be unique within the same session.

### `question_categories`

- Admin-managed optional categories/occasion packs.
- Belongs to a game for the initial build.
- Stores price/status and enable/disable flag.
- Has translations for user-facing name and description.
- No separate `game_category_settings` table unless categories must be reused across multiple games with different settings per game.

### `payments`

- Payment attempts and provider traceability.
- Must support future wallet credit and direct payment methods.
- Category access expires if payment succeeds but the game is not started.

### `credit_transactions`

- Wallet/credit ledger.
- Records deductions, refunds and forfeits.
- Credits are reserved/deducted when a game session is triggered.
- Completed rounds stay deducted.
- User-cancelled or abandoned started rounds are forfeited.
- System/API failure before round completion should be refundable.

## Tables intentionally not planned initially

- `game_settings`: not needed while game setup rules fit directly on `games`.
- `teams`: not needed while teams exist only inside a session.
- `game_category_settings`: not needed while categories belong to one game.
