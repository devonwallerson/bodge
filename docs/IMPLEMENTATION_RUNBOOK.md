# Bodge — implementation runbook

Use this file to resume work in a new session. Start with [IMPLEMENTATION_HANDOFF.md](IMPLEMENTATION_HANDOFF.md), then read [FEASIBILITY.md](FEASIBILITY.md), [QUESTION_BANK.md](QUESTION_BANK.md), [IDEA_CARD_DESIGN.md](IDEA_CARD_DESIGN.md), and [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md). The original [desktop](reference/design/bodge-desktop.png) and [mobile](reference/design/bodge-mobile.png) renderings guide the shell. The newer [desktop card](reference/design/idea-card-concept-desktop.png) and [mobile card](reference/design/idea-card-concept-mobile.png) renderings guide idea cards. The two original Claude texts are preserved under `reference/source/`; treat their implementation choices as proposals where the living plan differs.

## Current state

- Planning documents and visual references are saved in this repository. The M1 shell preview was approved and pushed as `fc73938`. The M2 interview and revised fixture results are pushed on `codex/m2-interview` for continuation. Run `npm install`, `npm run dev`, `npm run typecheck`, `npm run check:interview`, and `npm run build` from the root.
- Git is initialized on `main`; the public remote is `https://github.com/devonwallerson/bodge.git`, and `main` tracks `origin/main`. No deployment exists yet.
- Owner confirmed local saved ideas, “useful with a funny twist,” and five questions drawn from the approved 50-question bank in `QUESTION_BANK.md`.
- The interview uses real bank questions but still ends with sample ideas. Physical-device checks and several-run owner review remain before merging M2 into `main`.

## Build sequence

1. Inspect the repository and any changes made since this runbook. Update the M0 statuses. Git and the public remote are set up; keep `main` in sync with `origin/main` as work progresses.
2. Scaffold one Next.js + React + TypeScript app with Tailwind and a minimal test/build setup. Build a static responsive version of the attached desktop and mobile terminal using fake transcript and idea data. Validate mobile keyboard behavior on physical devices during this phase; record what was tested.
3. Implement reducer, typed message renderers, deterministic command parser, theme tokens, Bodge SVG/moods, responsive side panel/sheet, and scroll behavior. Check M1 criteria and compare screenshots to references.
4. Review `QUESTION_BANK.md` with the owner. Implement its 50 typed records, one-per-slot selector, recent-repeat avoidance, answer edit flow, and normalized API input; check M2.
5. Set up a model-provider project and server key via `.env.local` and host secrets; never commit the key. Implement generation/refinement routes and provider adapter. Validate strict structured output. Build and run the 20–30 case quality set; check M3.
6. Implement accept, local persistence, `/savedIdeas`, refinement lineage, and storage error handling; check M4.
7. Polish five themes, character timing, accessibility, reduced motion, device keyboard behavior, and production performance. Connect GitHub to a Next.js host, set rate limiting and spend controls, and run the fresh-session gate; check M5.

Each stage should leave a usable app and update the acceptance statuses. A failed criterion is fixed before declaring its milestone complete. Avoid adding a database, account system, transcript virtualization, or self-hosted model unless new evidence requires it.

## Environment and owner handoffs

| Item | Why / when | Owner action |
| --- | --- | --- |
| GitHub repository | Complete | Public `devonwallerson/bodge` repository is connected and the first commit has been pushed |
| Model provider project and API key | Needed at M3 | Create project/key; enter key directly in local `.env.local` and host secret settings |
| Provider budget | Needed before public launch | Set spend alert and hard limit in provider dashboard |
| Hosting account | Needed for preview/production | Connect GitHub repo to a Next.js capable host (Vercel is the simplest candidate) |
| Domain | Optional | Supply domain only if a custom launch URL is wanted |
| Device testing | Needed at M1 and gate | Provide access to real iPhone Safari and Android Chrome, or arrange testers |

Use `.env.example` for variable names only, for example `OPENAI_API_KEY=` and `MODEL_NAME=`; `.env.local` stays ignored. No end-user login is needed. If OpenAI is selected, the key is used by server code only. The model can be changed behind the provider adapter.

## Git workflow for one engineer

`main` is the stable branch. Build larger milestones or risky changes on a short feature branch. A pull request is useful when its diff, preview, and checks help review; it is not mandatory for every small change, and no second engineer is required. Merge after the relevant acceptance checks pass. Keep docs-only changes lightweight. Tag a first release after the three-device gate passes.

GitHub Pages hosts static files and cannot run the secret-bearing model API. Use GitHub for source and CI, then deploy the full app from GitHub to a compatible host. To insist on GitHub Pages, split the static frontend and API into two hosted services and update this plan before implementation.

## Resume prompt for a future implementation session

> Build Bodge following `docs/FEASIBILITY.md`, `docs/QUESTION_BANK.md`, `docs/IDEA_CARD_DESIGN.md`, and `docs/ACCEPTANCE_CRITERIA.md`. Use the original `bodge-desktop.png` and `bodge-mobile.png` for the shell, and the newer `idea-card-concept-desktop.png` and `idea-card-concept-mobile.png` for cards. Start with the earliest uncompleted milestone, update status as you go, and test mobile and desktop together. Keep secrets out of Git. The 50-question bank was approved on 2026-09-26; ask for model-provider/hosting account details only at the handoff where needed. Preserve the local-save and useful-with-funny-twist decisions.
