# Bodge — draft 50-question bank

Status: proposed content for owner review, 2026-09-26. This is an implementation-ready **shape** and a first copy pass. It is not yet approved wording. Bodge asks **five questions per run**, selected from the 50 below, not all 50.

## Selection contract

The bank has five slots with ten variants each. Select one question from each slot: **goal**, **worlds**, **scope**, **toolkit**, **spice**. This guarantees useful inputs while making the conversation vary. The first two slots may swap order; scope and toolkit may swap; spice is last. Store recent question IDs locally and avoid the last two sessions' variants within each slot when possible. Use browser crypto randomness, then save the selected IDs with the draft session so a refresh does not reshuffle mid-interview. If storage is unavailable, draw randomly without history. Every variant offers **Other / type your own** where it makes sense; no answer is required to reveal personal data.

Do not send question wording or the whole bank to the idea model. Normalize answers into one stable `InterviewAnswers` object. The side panel uses six labels because scope fills both time and team. `Surprise me` becomes an explicit random choice before API submission; it is never a missing answer. Re-answer edits the current normalized value, and prior idea cards remain unchanged.

```ts
type InterviewAnswers = {
  goal: string;                   // one canonical goal id or safe custom text
  domains: string[];              // one or two canonical domain ids or safe custom text
  timeBudget: 'evening' | '48h' | 'week';
  teamSize: 'solo' | '2-3' | '4+';
  skills: string[];               // zero or more known skills/tools
  avoid?: string;                 // optional tool/approach to avoid
  spice: 1 | 2 | 3 | 4;
  twistNote?: string;             // optional creative constraint
  questionIds: [string, string, string, string, string];
};
```

Use `questionIds` for local analytics/debugging only; omit them from model prompts unless needed for an explicit evaluation. Cap custom text to 200 characters and trim/sanitize on both client and server. A skipped toolkit answer maps to an empty skills array, not to invented expertise. An empty domain answer maps to an explicit `any` choice. The generation prompt must handle those defaults.

### Shared controls

- **Goal** is a single choice. IDs: `solve` (fix an annoyance), `learn` (try a skill), `impress` (showcase), `laugh` (make people smile), `portfolio` (show employers), `community` (help a group), `money` (test a business), `experiment` (explore a weird concept), `surprise` (randomly choose another goal). Each variant offers five suggested IDs from this catalog plus custom text.
- **Worlds** chooses up to two domains. IDs: `games`, `climate`, `health`, `education`, `local`, `art`, `finance`, `productivity`, `food`, `music`, `sports`, `accessibility`, `civic`, `travel`, `science`, `entertainment`, `any`. Each variant highlights six suggestions, plus search/custom and `any`; the full domain catalog remains accessible so the question variant never blocks a preference.
- **Scope** always asks two compact controls in one turn: time (`evening`, `48h`, `week`) and team (`solo`, `2-3`, `4+`). It may offer an optional constraint note but does not require one. This protects feasibility across all runs.
- **Toolkit** always accepts multiple skill/tool chips, a free-text tool/skill, an optional “avoid” text, and `no preference`. The chip suggestions vary by question; all known chips remain searchable.
- **Spice** always uses four levels (`sensible`, `quirky`, `spicy`, `unhinged`) mapped to 1–4. Even level 4 must produce a plausible MVP. It may accept an optional twist note. Labels may be themed, but the canonical value stays stable.

## Goal: one of G01–G10

| ID | Bodge asks | Suggested goal IDs |
| --- | --- | --- |
| G01 | What kind of win are we after? | solve, learn, impress, laugh, surprise |
| G02 | When this is done, what would make you say “worth it”? | solve, portfolio, community, experiment, surprise |
| G03 | Who are we trying to delight first: you, judges, friends, or strangers? | learn, impress, laugh, community, money |
| G04 | Is this a useful tool, a great demo, or a glorious experiment? | solve, impress, experiment, portfolio, surprise |
| G05 | What would you most like to show someone on Sunday night? | portfolio, impress, laugh, learn, solve |
| G06 | Pick the mission Bodge should optimize for. | solve, learn, community, money, experiment |
| G07 | Should this teach you something or prove what you already know? | learn, portfolio, impress, experiment, surprise |
| G08 | What should your teammates thank you for building? | solve, community, laugh, impress, money |
| G09 | Is the headline “it helps,” “it slaps,” or “why does this exist?” | solve, impress, experiment, laugh, portfolio |
| G10 | If Bodge could give you one outcome, which one? | solve, learn, portfolio, community, surprise |

## Worlds: one of W01–W10

Each question uses the same up-to-two picker. The suggestion column changes the first visible chips; searchable catalog and custom entry remain available.

| ID | Bodge asks | Suggested domain IDs |
| --- | --- | --- |
| W01 | Which worlds should collide? | games, climate, health, education, art, productivity |
| W02 | Where should this little contraption live? | local, food, music, travel, games, civic |
| W03 | Pick two unlikely neighbors for this idea. | climate, games, finance, art, health, sports |
| W04 | Whose corner of the internet are we building for? | education, accessibility, music, productivity, civic, entertainment |
| W05 | What topics would keep you tinkering past midnight? | science, games, art, food, travel, climate |
| W06 | Which space needs a better weekend project? | health, local, education, finance, productivity, accessibility |
| W07 | Choose a serious world and a playful one, if you like. | climate, health, finance, games, music, entertainment |
| W08 | What do you already have opinions about? | sports, food, local, civic, travel, productivity |
| W09 | If Bodge mashed up two tabs in your browser, which tabs? | science, art, finance, games, education, music |
| W10 | Give me a field, or give me two and make it weird. | accessibility, climate, local, entertainment, health, science |

## Scope: one of S01–S10

All ten show the same time and team controls. The varied wording changes the character of the turn without weakening the scope data. Display the chosen values in separate `time` and `team` rows in “what Bodge knows.”

| ID | Bodge asks |
| --- | --- |
| S01 | What do we have to work with: time and humans? |
| S02 | Is this an evening solo sprint or a team weekend? |
| S03 | How much calendar and how many keyboards can I borrow? |
| S04 | Set the build budget: hours first, teammates second. |
| S05 | Before I get carried away, what's the deadline and crew size? |
| S06 | How long until demo time, and who's building? |
| S07 | Tell me the size of the sandbox. |
| S08 | Is this a quick sketch, a hackathon, or a weeklong build? |
| S09 | How ambitious may the implementation be, in time and people? |
| S10 | Give Bodge a clock and a headcount. |

## Toolkit: one of T01–T10

Each question supports searchable skill chips, free text, optional avoid text, and `no preference`. Suggestions vary; the app stores the selected skills rather than treating one prompt as a different schema.

| ID | Bodge asks | Suggested chips |
| --- | --- | --- |
| T01 | What's already in your toolbox? | TypeScript, Python, React, design, hardware |
| T02 | What can you build without looking up every other line? | JavaScript, Python, SQL, mobile, no-code |
| T03 | What new tool are you willing to learn, and what should I avoid? | AI API, mapping, data viz, games, hardware |
| T04 | Are we strongest in screens, servers, data, or physical stuff? | frontend, backend, data, design, hardware |
| T05 | Pick your comfortable ingredients. | React, Node, Python, Figma, spreadsheets |
| T06 | What should the stack lean on? | web, mobile, AI API, local data, sensors |
| T07 | Which part would your team happily own? | UI, backend, data, storytelling, integrations |
| T08 | Any tool you want to use or definitely never touch? | TypeScript, Python, AI API, maps, no-code |
| T09 | What's your unfair technical advantage today? | frontend, backend, design, ML, domain knowledge |
| T10 | What skills are in the room, even if they're not coding? | research, writing, design, data, hardware |

## Spice: one of P01–P10

All ten use the same four-level scale and optional twist note. The idea model receives the numeric level and note, not the prompt's metaphor.

| ID | Bodge asks |
| --- | --- |
| P01 | How weird may this get? |
| P02 | Where is the dial: useful, quirky, spicy, or unhinged? |
| P03 | How much “wait, what?” should the demo earn? |
| P04 | Should the joke be a wink or the whole costume? |
| P05 | How brave are we feeling about the twist? |
| P06 | Give this idea a chaos budget. |
| P07 | How far can Bodge wander before you pull the leash? |
| P08 | Do you want a safe bet or an excellent eyebrow raise? |
| P09 | Choose the spice level for the pitch and the product. |
| P10 | How much nonsense can the MVP carry while still working? |

## Review and implementation checks

The owner should approve tone, any domain omissions, and whether question-specific options should be more varied. The first implementation may use the IDs, catalog, and prompts above, but the product milestone is complete only after this review. Tests should assert exactly 50 unique IDs, ten per slot, one of each slot in every run, stable answers after refresh, no repeated variants within the recent-window rule when alternatives exist, and that all five answers normalize into the same server schema. A manual review should compare several full runs for genuinely different feel, not merely different wording.
