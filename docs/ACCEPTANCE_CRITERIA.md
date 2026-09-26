# Bodge — implementation acceptance criteria

Updated 2026-09-26. This is the executable checklist derived from the [living feasibility](FEASIBILITY.md) and the [original Claude criteria](reference/source/claude-acceptance-criteria.txt). IDs remain stable. Status values: `Not started`, `In progress`, `Blocked`, `Done`. Add a short note to any blocked row. A milestone closes when every row passes; a later milestone may begin early when work is independent.

**Common check:** each UI criterion is checked at 390 px on a real phone and at 1440 px desktop, in the relevant themes, with touch and keyboard as appropriate. No console errors or unsafe TypeScript escape hatches are accepted. “Matches the rendering” means comparing the implementation beside [desktop](reference/design/bodge-desktop.png) and [mobile](reference/design/bodge-mobile.png), allowing only documented accessibility and browser changes.

## M0 — Decisions and environment

| ID | Observable result / check | Status |
| --- | --- | --- |
| M0-01 | Owner reviews the 50-question bank, five coverage slots, choices, and sidebar labels; approved wording is recorded in `QUESTION_BANK.md`. | Blocked: owner review |
| M0-02 | Git repo has `main`, a safe `.gitignore`, and a README linking these plans; no secrets are tracked. | Done |
| M0-03 | Public `devonwallerson/bodge` remote exists and local `main` tracks `origin/main`. | Done |
| M0-04 | Model provider is chosen after a structured-output smoke test; key stays outside Git and server build output. | Blocked: provider account/key |
| M0-05 | Deployment provider is selected and connected to GitHub when preview deployment is needed. | Blocked: hosting choice |

## M1 — Responsive shell and conversation

| ID | Observable result / check | Status |
| --- | --- | --- |
| M1-01 | Next.js + TypeScript app runs locally; one preview can be opened on phone and desktop. | Not started |
| M1-02 | Title bar, traffic dots, Bodge SVG, `~/idea-lab`, status, theme dots, desktop frame, and mobile frame match references. | Not started |
| M1-03 | Typed transcript renders seeded user, Bodge, question, progress, idea, and system entries distinctly from one reducer. | Not started |
| M1-04 | `/help`, `/theme`, unknown command, and command completion work by keyboard and touch without model requests. | Not started |
| M1-05 | Transcript follows new messages only when at bottom; scrolling up reveals a jump-to-new control. | Not started |
| M1-06 | With a physical iPhone Safari and Android Chrome keyboard open, composer stays visible, title bar remains stable, and page does not jump. | Not started |

M1-06 is the first technical spike. Record the tested OS/browser versions and any viewport workaround before moving on.

## M2 — Five-question interview

| ID | Observable result / check | Status |
| --- | --- | --- |
| M2-01 | Bank contains 50 unique question IDs, ten per slot; new questions require no new screen component. | Blocked: M0-01 |
| M2-02 | `/generateIdea` selects one from each slot, asks exactly five turns, and normalizes answers into the same schema; refresh does not reshuffle an active run. | Blocked: M0-01 |
| M2-07 | New runs avoid variants used in the last two sessions when alternatives exist; several runs feel different in manual review. | Not started |
| M2-03 | Desktop number keys, arrow selection, Enter, and mobile 44 px tap rows work; free text never triggers idea shortcuts. | Not started |
| M2-04 | Progress and “what Bodge knows” update from the same answer state on desktop and mobile. | Not started |
| M2-05 | Editing one answer from panel/sheet re-asks only that item and preserves the other answers. | Not started |
| M2-06 | Mobile sheet opens/closes by tap and system back/Escape; focus returns to its trigger. | Not started |

## M3 — AI generation and idea cards

| ID | Observable result / check | Status |
| --- | --- | --- |
| M3-01 | `POST /api/ideas` returns exactly three distinct cards plus a quip, validated by the shared schema. | Blocked: M0-04 |
| M3-02 | A fixed set of 20–30 interviews yields valid output and is reviewed for usefulness, funny twist, variety, and stated scope. | Not started |
| M3-03 | Invalid/incomplete/provider-error cases return typed recoverable errors; the UI shows confused Bodge and retry, never a blank card. | Not started |
| M3-04 | Key is server-only; public endpoint enforces request limits and shared/host rate limiting before launch. | Not started |
| M3-05 | Thinking appears immediately. Validated card content reveals briefly and can be skipped; screen readers hear complete content once. | Not started |
| M3-06 | The outlined card, inset border label, typography, field order, scope/tags/spice, and action row match both renderings. | Not started |
| M3-07 | Three-card paging works with desktop keys/buttons and mobile swipe/buttons; counter and active actions agree. | Not started |

## M4 — Accept, refine, and saved ideas

| ID | Observable result / check | Status |
| --- | --- | --- |
| M4-01 | Accept marks the visible idea and saves that exact version locally; reload retains it. | Not started |
| M4-02 | `/savedIdeas` lists, reopens, and removes saved ideas; empty and storage-error states are understandable. | Not started |
| M4-03 | Refine sends one instruction plus the selected source idea and appends one new version with lineage; original remains readable. | Not started |
| M4-04 | A future schema version can be detected; corrupt local data cannot crash the app. | Not started |
| M4-05 | UI explains that saves are device-specific and clearing browser data removes them. | Not started |

## M5 — Theme, accessibility, and launch

| ID | Observable result / check | Status |
| --- | --- | --- |
| M5-01 | Six Bodge moods and status text reflect real events; reduced motion removes nonessential animation. | Not started |
| M5-02 | Terminal, Magenta, Indigo, Blue, Matcha persist without first-paint flash; text/focus contrast passes checks. | Not started |
| M5-03 | No clickable divs; buttons/fields have labels; transcript and sheet pass keyboard and screen-reader checks. | Not started |
| M5-04 | Production build loads and responds smoothly on a midrange phone; measure and fix actual bottlenecks. | Not started |
| M5-05 | GitHub-connected deployment serves frontend and Node API, with secret set in host settings and provider spend alert/hard limit. | Blocked: M0-04/M0-05 |
| M5-06 | Complete fresh-session gate passes on iPhone Safari, Android Chrome, and desktop Chrome. | Not started |

## Fresh-session gate

1. Clear site data and open the live URL. Bodge is idle, intro/commands are legible.
2. Run `/help`, change a theme, reload, and confirm the theme persists without flash.
3. Run `/generateIdea`, answer the five approved questions, and edit one answer from the side panel/sheet.
4. Watch thinking and the validated reveal; inspect all three cards and move to card 2 by keyboard or touch.
5. Accept card 2, reload, open `/savedIdeas`, and reopen it.
6. Refine that card with “make it multiplayer”; compare new and original versions.
7. Force a network/model error and verify a clear retry path.
8. On both phones, open the keyboard at each stage and verify the composer and actions remain reachable.

Any failed step becomes a criterion or a note on the existing criterion, then the gate is rerun.
