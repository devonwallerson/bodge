# Bodge — handoff for a fresh coding context

Use this as the first file in a new coding session. Repository: [devonwallerson/bodge](https://github.com/devonwallerson/bodge). Current local checkout: `/Users/gtrgodzilla05/hackathon-startup-idea-generator`. Read the [living specification](FEASIBILITY.md), [50-question bank](QUESTION_BANK.md), [acceptance checklist](ACCEPTANCE_CRITERIA.md), and [runbook](IMPLEMENTATION_RUNBOOK.md). Inspect both image files directly: [desktop](reference/design/bodge-desktop.png) and [mobile](reference/design/bodge-mobile.png). They are committed assets, not transient chat attachments.

## Current state — M1 shell preview started

The GitHub remote is public and `main` tracks `origin/main`. The repo now contains a Next.js App Router + TypeScript + Tailwind shell preview with fixture transcript and three fixture ideas. It has no AI endpoint, provider API key, Vercel connection, or end-user login system. No application has been deployed. The references remain in the repository README and at `docs/reference/design/`. The shell changes are local and have not been pushed; the owner asked to verify them manually first.

The product owner decided: match the renderings closely; generate three ideas; make them useful with a funny twist; save accepted ideas locally across reloads; ask five questions selected from a roughly 50-question bank. `QUESTION_BANK.md` now drafts exactly 50 (ten per coverage slot), but its wording and options remain open for owner review. Keep the interview selection mechanism flexible enough to revise copy without rewriting UI components.

## Which model to use in Codex

Use **GPT-6 Sol at high reasoning** as the practical default for implementation. OpenAI's [code-generation guidance](https://developers.openai.com/api/docs/guides/code-generation) recommends recent general-purpose models such as Sol for Codex; its [model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection) positions Sol for everyday coding and Astra for more demanding projects. If visual fidelity, mobile keyboard behavior, or a difficult integration stalls, use GPT-6 Astra for that focused problem. This is the **coding assistant model**, separate from the app's eventual runtime model. The runtime candidate remains GPT-6 Luna, to be evaluated later against other providers on actual idea quality.

## Recommended implementation sequence

1. **Environment and scaffold:** Inspect the repo and run existing checks. Use current Node/npm if compatible with the current Next.js release; verify requirements before installing. Scaffold one Next.js App Router + TypeScript + Tailwind app in the repository root while preserving the docs and images. Because the root is nonempty, a temporary scaffold copied into the root or a manual scaffold may be required. Add `package.json`, lockfile, scripts, and `.env.example` with names only. No AI key or end-user authentication is needed for this phase.
2. **Static visual shell:** Build desktop and mobile terminal layouts against the committed renderings using fixture transcript and three fixture idea cards. Implement semantic theme tokens, five palettes, Bodge SVG/mood states, side panel/mobile sheet, composer, scroll anchoring, and reduced-motion behavior. Test at 390 px and 1440 px and on real devices for mobile keyboard behavior. Do not call a model yet.
3. **Deterministic conversation:** Implement command parser, typed messages, reducer, question widgets, local theme preference, and answer panel. Load the 50-question bank as typed data; pick one from each slot with recent-repeat avoidance and refresh-stable selection. Normalize answers into the single request shape. Have the owner review the bank before calling M2 complete.
4. **AI endpoint:** After the shell and question contract work, request a provider project/key handoff. Create server-only API routes and strict schema validation. Test generation and refinement with a 20–30 case evaluation set. Never put credentials in Git, client bundles, or chat.
5. **Persistence and launch:** Add local saved ideas/refinement lineage, accessibility and real-device polish, shared rate limiting, spend controls, and a GitHub-connected Next.js deployment. Ask for hosting login/connection only when a preview is ready to deploy. GitHub Pages alone cannot serve the Node API.

At each stage, run the relevant checks and update [acceptance statuses](ACCEPTANCE_CRITERIA.md). Keep changes reviewable. A solo engineer can use a feature branch and PR for major milestones; it is not mandatory for every small edit.

## Accounts and secrets

GitHub is already connected. **No end-user login is planned in v1.** A model-provider account/key is needed only when implementing the AI endpoint, not for scaffolding or the visual shell. A Vercel or other compatible hosting login is needed only when connecting a preview/production deployment. The owner should enter secrets in the provider and host settings or an ignored `.env.local` file. Do not request a password or token in chat. Record chosen provider, model, spending controls, and host in the living plan when selected.

## Start prompt for the new context

> Implement Bodge in this repository, beginning with M1: a responsive Next.js terminal shell that closely follows the committed desktop and mobile renderings. Read `AGENTS.md`, `docs/IMPLEMENTATION_HANDOFF.md`, `docs/FEASIBILITY.md`, `docs/QUESTION_BANK.md`, and `docs/ACCEPTANCE_CRITERIA.md`; inspect both PNGs in `docs/reference/design/`. The repository contains planning assets only—scaffold the app in the root and preserve those files. Start with fixture data and no AI credentials. Build and verify the shell on desktop and mobile, including keyboard behavior, then update the checklist. The later interview must draw one question from each of five groups in the 50-question bank, and accepted ideas must persist locally. Ask me to review question wording before declaring that milestone complete.
