# Bodge — living feasibility and product specification

Updated 2026-09-26. This is the canonical specification for implementation. The [desktop rendering](reference/design/bodge-desktop.png), [mobile renderings](reference/design/bodge-mobile.png), [new idea card concept](IDEA_CARD_DESIGN.md), [Claude feasibility](reference/source/claude-feasibility.txt), and [Claude acceptance plan](reference/source/claude-acceptance-criteria.txt) are preserved as sources. The original renderings guide the overall UI; the new concept takes precedence for idea cards. This document resolves scope and technical choices.

## Product and confirmed decisions

Bodge is a personality driven project idea generator for hackathon participants, builders, and hobbyists. A five-question conversation produces three **useful ideas with a funny twist**, scoped to the user's time, team, and skills. Users can accept, refine, and move to the next idea. Accepted ideas survive a reload **on the same device**, without an account.

The owner confirmed that the five questions shown in the renderings should be redesigned before implementation. Bodge will draw five questions from a [50-question bank](QUESTION_BANK.md), one per coverage slot, so runs vary while still providing enough information for useful ideas. The original Claude plan deferred saved ideas; that is superseded by the owner's local-save decision. Our first draft proposed two ideas; the renderings and attached plan show three, so the MVP will return three.

## MVP scope

One responsive terminal-style page, Bodge avatar and event-driven moods, deterministic commands, five-question interview, live “what Bodge knows” panel/sheet, three validated idea cards per generation, paging, accept/refine/next, local saved view, five themes, mobile keyboard work, and server-only AI generation. No end-user accounts, cloud sync, sharing, or generated code in v1. Copy/export can follow the MVP.

## Visual contract

### Desktop

Match the centered dark window, subtle dotted outer field, one-pixel dividers, title bar, Bodge sprite, `bodge ~/idea-lab`, status pill, and five theme swatches. The left transcript scrolls; the fixed right panel shows current answers and commands; the composer remains at the bottom. Use the [revised idea result specification and desktop/mobile renderings](IDEA_CARD_DESIGN.md): transparent transcript background, thin output gutter, compact command-style metadata, title and hook first, and aligned `problem`, `loop`, `stack`, and `stretch` rows. The original renderings' bordered card and spice meter are superseded for ideas.

### Mobile

Use the same conversation state and components. The progress strip opens “what Bodge knows” as a bottom sheet. Question options are full-width rows with at least 44 px tap targets. Idea fields stack vertically as in the [new mobile card rendering](reference/design/idea-card-concept-mobile.png). Three ideas page by swipe **and** visible previous/next controls. Keep the action row and composer reachable above the on-screen keyboard. The sheet supports re-answering and shows commands. The original mobile image shows Terminal, Magenta, and Indigo; Blue and Matcha follow the same visual rules.

### Character, text, and themes

Use one small inline SVG with face/spark variations for idle, listening, thinking, typing/revealing, eureka, and confused/error. Trigger states from events, not random loops. The header and latest Bodge line share the state. Display a thinking state immediately on request; receive and validate the complete AI response before reveal. Reveal briefly and provide skip. Respect reduced motion and announce complete text once to screen readers.

Theme tokens: background, surface, border, text, muted text, primary action, character accent, card label, on-primary, and focus. Define tested palettes for Terminal, Magenta, Indigo, Blue, and Matcha; persist the selection and apply it before first paint. The traffic-light dots are decorative. Use mono typography for terminal cues and test the attached IBM Plex Mono/Bricolage Grotesque proposal against the renderings.

### Commands and input

`/generateIdea`, `/help`, `/theme`, `/savedIdeas`, and `/knows` are deterministic. `/` focuses the prompt and opens completion. Desktop keyboard shortcuts work only in the relevant state and only when the prompt is empty: number keys for options; `a`, `r`, `n` for ideas; Enter to confirm. Mobile always has visible controls and does not depend on shortcuts. Unknown commands return a helpful hint. New transcript messages auto-scroll only while the user is already at the bottom; otherwise show a jump-to-new control. Do not virtualize the short transcript.

## Interview structure — bank approved 2026-09-26

The [question bank](QUESTION_BANK.md) contains 50 approved questions, ten in each of five groups. For each run, select one goal, one worlds/domain, one time-and-team scope, one toolkit, and one spice question. The five sample prompts below show the direction; they are no longer a fixed script.

| Slot | Proposed prompt | Input | Stored answer |
| --- | --- | --- | --- |
| 1 | “What kind of win are we after?” | Solve an annoyance / learn a tool / impress judges / make friends laugh / surprise me; optional text | `vibe` |
| 2 | “Which worlds should collide?” | Up to two domains: games, climate, health, education, local life, art, money, productivity, other | `domains[]` |
| 3 | “What do we have to work with?” | Time: one evening / 48h / one week; team: solo / 2–3 / 4+ | `timeBudget`, `teamSize` |
| 4 | “What can you build with, and what should I avoid?” | Skill chips plus optional text; no preference available | `skills[]`, `avoid` |
| 5 | “How weird may this get?” | Sensible / quirky / spicy / unhinged; optional constraint | `spice`, `extraConstraint` |

The five turns produce six sidebar labels (`vibe`, `field`, `time`, `team`, `skills`, `spice`) because the scope turn contains two quick controls. Every answer can be edited from the panel/sheet. Editing affects future generations and does not rewrite already generated ideas. “Surprise me” resolves to a valid explicit value. The owner approved the bank's wording and choices on 2026-09-26.

## State, schema, and persistence

Use a single client reducer for step, answers, transcript messages, active idea, and Bodge mood. Store the 50-question bank as typed data and select one per slot using the rules in `QUESTION_BANK.md`. Render transcript entries by type (`user`, `bot`, `question`, `progress`, `ideas`, `system`). The side panel and sheet read the same normalized answers. Send those answers to the API, not the rendered transcript. Bodge's name, SVG, and moods are frontend configuration, so they need no backend table.

```ts
type IdeaContent = {
  title: string;
  oneLiner: string;
  tags: string[];
  spice: 1 | 2 | 3 | 4;
  problem: string;
  loop: string;
  stack: string[];
  scope: string;
  stretch: string;
};
type GenerateResult = { ideas: [IdeaContent, IdeaContent, IdeaContent]; quip: string };
type SavedIdea = IdeaContent & {
  id: string;
  createdAt: string;
  parentIdeaId?: string;
  schemaVersion: 1;
};
```

The model returns content fields. The server validates and adds IDs/timestamps. Refinement sends `{ sourceIdea, instruction }`, returns **one** new idea, and appends it under the original with `parentIdeaId`. Accept saves the exact visible version. A versioned local storage adapter is enough for a small collection; `/savedIdeas` lists, reopens, and removes saved ideas. State clearly that local saves do not sync and browser data clearing removes them.

## Architecture and feasibility

**Recommended MVP:** one Next.js App Router app with React and TypeScript, Node runtime [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) for `/api/ideas` and `/api/ideas/refine`, and a provider adapter behind `generateIdeas()` / `refineIdea()`. This provides the requested Node backend without two deployments. A Vite frontend plus Hono server, as proposed in the attached feasibility, is viable if a separately deployed backend becomes a goal, but adds CORS and deployment work. The visual design is stack independent.

Use Tailwind CSS with semantic CSS variables; build the terminal, transcript, card, and sprite as custom components. Borrow accessible primitives for the sheet/command list only after testing them against the needed behavior. Use Zod or equivalent for request and response validation. No database is needed in v1.

The browser owns questions, commands, themes, and saves. The server owns the model key and prompt, validates input, requests strict structured output, validates the result again, and returns typed errors. [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) supports schema-constrained replies. [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) is the initial hosted candidate. Compare it against the official [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B) open-weight model using the same 20–30 input cases after the card schema is fixed. Self-hosting an open-weight model still has inference cost and operational work; humor, feasibility, latency, and schema reliability must be measured.

The prompt should be short, dry, friendly, and useful first. The three ideas must differ materially and fit the stated time, team, and skills. Spice controls creative direction through instructions; do not assume every model supports a temperature control. Treat user text as data. Never show partial JSON; retry appropriate incomplete/invalid responses once, then show a recoverable error.

For a public endpoint, cap input, output, and execution time; keep secrets in server environment variables; use shared rate limiting or a host feature rather than an in-memory counter across serverless instances; set provider spend alerts and a hard limit. OpenAI's [production guidance](https://developers.openai.com/api/docs/guides/production-best-practices) documents key and spend controls. Avoid logging raw free-text answers by default.

The first technical spike is the mobile keyboard. Start with `100dvh`, safe-area padding, and 16 px input text; use `visualViewport` only if real device tests show a gap. Avoid a hard-coded keyboard offset without measuring iOS Safari and Android Chrome. Test on physical phones during the shell milestone. Performance work should focus on model wait, mobile load, and interaction; card caching and list virtualization are unnecessary at this scale.

## GitHub, hosting, and accounts

GitHub should host the **repository** and checks. [GitHub Pages is static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and cannot run the secret-bearing Node API. The simplest live setup is a GitHub-connected Next.js host such as Vercel, with the API key entered in server environment settings. If GitHub Pages itself is mandatory, put the static frontend there and deploy the API separately.

For a solo engineer, keep `main` stable. Use short feature branches and PRs for larger milestones because they give reviewable diffs and deploy previews; PRs are optional for tiny changes. No self-approval ceremony is needed. Git is initialized and the public [devonwallerson/bodge](https://github.com/devonwallerson/bodge) remote is connected. Never commit `.env.local` or keys. GitHub's [local repository import guide](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) describes the setup used.

The owner will eventually need a GitHub account/repository, a model-provider project and key, billing/spend limits, and a host connected to GitHub. A custom domain is optional. End users need no login. Credentials go directly into provider/host secret settings, never into chat or tracked files. See [implementation runbook](IMPLEMENTATION_RUNBOOK.md).

## Open decisions

Confirmed: useful with a funny twist; local persistence; original renderings guide the shell and the new card concept guides cards; five questions drawn from a 50-question bank; public GitHub repository under `devonwallerson`. The owner approved the question bank on 2026-09-26. Pending: owner feedback on the new card concept, final card copy, hosting provider, model provider and budget, and optional domain. These do not block the shell prototype with fake ideas. Keep this plan and the [acceptance criteria](ACCEPTANCE_CRITERIA.md) current as the implementation reveals constraints.
