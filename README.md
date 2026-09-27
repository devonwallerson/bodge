# Bodge

A terminal-style project idea generator for builders and hackathon teams. A local Next.js preview now includes the five-question interview and fixture idea cards. Model generation and saved ideas are upcoming milestones.

## Run the local preview

Use Node.js 20.9 or newer. From the repository root, run `npm install` and `npm run dev`, then open `http://localhost:3000`. Run `npm run typecheck` and `npm run build` to check the source. No provider key is needed for this preview.

Run `/generateIdea` to answer five questions drawn from the 50-question bank. Each group now has ten distinct practical angles and an optional detail cue; the owner approved the revision. The draft and question selection survive a reload on this device, and known answers can be changed from the side panel or mobile sheet. The resulting three ideas are still sample data. `/help`, `/theme`, `/knows`, command completion, and idea paging work locally. Accept, refine, and saved ideas currently explain that those features are coming later; they do not claim to save data.

Run `npm run check:interview` to verify the bank, recent-repeat selection, answer normalization, and draft recovery.

GitHub repository: [devonwallerson/bodge](https://github.com/devonwallerson/bodge) (public).

## Design renderings

These uploaded renderings are committed in this repository and are the visual reference for implementation.

**Desktop** — [open full image](docs/reference/design/bodge-desktop.png)

![Bodge desktop terminal design](docs/reference/design/bodge-desktop.png)

**Mobile** — [open full image](docs/reference/design/bodge-mobile.png)

![Bodge mobile question, idea card, and answer sheet designs](docs/reference/design/bodge-mobile.png)

**Revised terminal idea result concept** — [design decisions](docs/IDEA_CARD_DESIGN.md). These renderings supersede only the idea treatment shown in the original full-page images. The local fixture result now uses this styling for review.

![Terminal idea result desktop concept](docs/reference/design/idea-card-concept-desktop.png)

![Terminal idea result mobile concept](docs/reference/design/idea-card-concept-mobile.png)

## Build documents

- [Living feasibility and product specification](docs/FEASIBILITY.md)
- [Acceptance criteria](docs/ACCEPTANCE_CRITERIA.md)
- [Implementation runbook](docs/IMPLEMENTATION_RUNBOOK.md)
- [Start here for a new coding agent](docs/IMPLEMENTATION_HANDOFF.md)
- [50-question bank and selection rules](docs/QUESTION_BANK.md)
- [Desktop design reference](docs/reference/design/bodge-desktop.png)
- [Mobile design reference](docs/reference/design/bodge-mobile.png)
- [New idea card design specification](docs/IDEA_CARD_DESIGN.md)
- [New desktop card rendering](docs/reference/design/idea-card-concept-desktop.png)
- [New mobile card rendering](docs/reference/design/idea-card-concept-mobile.png)
- [Original Claude feasibility](docs/reference/source/claude-feasibility.txt)
- [Original Claude acceptance plan](docs/reference/source/claude-acceptance-criteria.txt)

The renderings guide the UI. The living plan records current scope and resolves differences between earlier drafts.
