# Instructions for coding agents working on Bodge

Read [docs/IMPLEMENTATION_HANDOFF.md](docs/IMPLEMENTATION_HANDOFF.md), [docs/FEASIBILITY.md](docs/FEASIBILITY.md), [docs/QUESTION_BANK.md](docs/QUESTION_BANK.md), [docs/IDEA_CARD_DESIGN.md](docs/IDEA_CARD_DESIGN.md), and [docs/ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) before changing application code. Inspect the original desktop and mobile PNGs directly for the shell, and the newer idea-card desktop and mobile PNGs directly for cards. The new card concept takes precedence over the card portions of the original images.

The repository contains a Next.js shell preview and planning references. Do not assume an AI endpoint, provider API key, hosting connection, or end-user authentication exists. Use mock ideas until the provider milestone. Work in the repository root and preserve the reference files and planning history.

Keep the app accountless in v1. Accepted ideas persist on the current device. Generate three useful ideas with a funny twist. The interview draws exactly five questions from the 50-question bank, one per coverage slot. The owner approved the revised bank; physical device checks remain before the interview milestone closes.

Update the acceptance checklist as milestones are verified. Keep credentials in ignored local files or host secrets. GitHub repository: `https://github.com/devonwallerson/bodge`.
