# Bodge — 50-question bank

Status: owner approved the substantive revision after feedback that the original variants felt repetitive. The revised wording, choices, and optional detail cues are the v1 interview baseline. Bodge asks **five questions per run**, selected from the 50 below, not all 50.

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
  notes?: Partial<Record<'goal' | 'worlds' | 'scope' | 'toolkit', string>>; // optional prompt-specific context
  questionIds: [string, string, string, string, string];
};
```

Use `questionIds` for local analytics/debugging only; omit them from model prompts unless needed for an explicit evaluation. Cap custom text to 200 characters and trim/sanitize on both client and server. A skipped toolkit answer maps to an empty skills array, not to invented expertise. An empty domain answer maps to an explicit `any` choice. The generation prompt must handle those defaults.

### Shared controls

- **Goal** is a single choice plus an optional detail. IDs: `solve` (fix an annoyance), `learn` (try a skill), `impress` (showcase), `laugh` (make people smile), `portfolio` (show employers), `community` (help a group), `money` (test a business), `experiment` (explore a weird concept), `surprise` (randomly choose another goal). Each variant offers five suggested IDs from this catalog plus custom text.
- **Worlds** chooses up to two domains and can capture a concrete setting or problem. IDs: `games`, `climate`, `health`, `education`, `local`, `art`, `finance`, `productivity`, `food`, `music`, `sports`, `accessibility`, `civic`, `travel`, `science`, `entertainment`, `any`. Each variant highlights six suggestions, plus search/custom and `any`; the full domain catalog remains accessible so the question variant never blocks a preference.
- **Scope** always asks two compact controls in one turn: time (`evening`, `48h`, `week`) and team (`solo`, `2-3`, `4+`). Its optional detail captures a different MVP constraint or demo boundary. This protects feasibility across all runs.
- **Toolkit** always accepts multiple skill/tool chips, a free-text tool/skill, an optional “avoid” text, a prompt-specific detail, and `no preference`. The chip suggestions vary by question; all known chips remain searchable.
- **Spice** always uses four levels (`sensible`, `quirky`, `spicy`, `unhinged`) mapped to 1–4. Even level 4 must produce a plausible MVP. Its optional twist note follows the selected question's angle. Labels may be themed, but the canonical value stays stable.

## Goal: one of G01–G10

| ID | Bodge asks | Optional detail cue | Suggested goal IDs |
| --- | --- | --- | --- |
| G01 | Which tiny everyday frustration should this project remove? | Who hits this snag, and when? | solve, community, laugh, experiment, surprise |
| G02 | What would you love to learn by building the first version? | Name a skill or concept you want to practice. | learn, portfolio, impress, experiment, surprise |
| G03 | Who should leave the demo smiling or relieved? | Describe that person or group. | laugh, community, impress, solve, surprise |
| G04 | What would make someone ask how you built it? | Which part should feel impressive? | impress, portfolio, experiment, learn, surprise |
| G05 | What proof of your ability is missing from your portfolio? | Name the work you want this to show. | portfolio, impress, learn, money, surprise |
| G06 | Which group deserves a small, practical win? | What is that group trying to do? | community, solve, laugh, money, surprise |
| G07 | What business hunch could a tiny prototype test? | What would count as evidence? | money, experiment, learn, impress, surprise |
| G08 | What strange what-if idea have you wanted to try? | Describe the hypothesis in one line. | experiment, laugh, learn, impress, surprise |
| G09 | Whose day could you make ten minutes easier? | What task would get easier? | solve, community, money, laugh, surprise |
| G10 | What should people remember after the demo? | Name the feeling, result, or moment. | impress, laugh, portfolio, community, surprise |

## Worlds: one of W01–W10

Each question uses the same up-to-two picker. The suggestion column changes the first visible chips; searchable catalog and custom entry remain available.

| ID | Bodge asks | Optional detail cue | Suggested domain IDs |
| --- | --- | --- | --- |
| W01 | Which two interests do you wish talked to each other? | What connection do you see between them? | games, climate, health, education, art, productivity |
| W02 | Where do you notice friction away from your screen? | Describe the place or situation. | local, food, music, travel, games, civic |
| W03 | Which routine could use a playful layer? | What is dull about that routine now? | climate, games, finance, art, health, sports |
| W04 | Which niche community knows a problem outsiders miss? | What do members complain about? | education, accessibility, music, productivity, civic, entertainment |
| W05 | Which rabbit holes do you explore without being asked? | Name a topic you keep returning to. | science, games, art, food, travel, climate |
| W06 | Which public service could use a friendlier interface? | Where does it frustrate people? | health, local, education, finance, productivity, accessibility |
| W07 | Which serious issue might benefit from play? | What would make it approachable? | climate, health, finance, games, music, entertainment |
| W08 | Which hobby has surprisingly messy coordination? | What do participants juggle? | sports, food, local, civic, travel, productivity |
| W09 | Which two kinds of information should meet in one place? | What would you learn by connecting them? | science, art, finance, games, education, music |
| W10 | Which overlooked place or topic could inspire a project? | What detail would most people miss? | accessibility, climate, local, entertainment, health, science |

## Scope: one of S01–S10

All ten show the same time and team controls, plus a different optional MVP or demo detail. Display the chosen values in separate `time` and `team` rows in “what Bodge knows.”

| ID | Bodge asks | Optional detail cue |
| --- | --- | --- |
| S01 | What must be working by the end of your build window? | Name the one feature the demo needs. |
| S02 | Can the first version be tested alone, or does it need a crew? | Which task depends on another person? |
| S03 | What would you cut first to hit the deadline? | Name a feature to leave out. |
| S04 | Does the demo need real data, or can a convincing mock prove it? | What data can you access or fake? |
| S05 | What single interaction should the first demo prove? | Describe that interaction. |
| S06 | What must happen live instead of in a slide? | Name the live moment. |
| S07 | What's your biggest build constraint besides time? | Think budget, access, hardware, or approvals. |
| S08 | What could you show before the first long break? | Describe the smallest visible result. |
| S09 | How much setup can your crew tolerate? | Name a setup step you'd rather skip. |
| S10 | Where should the MVP stop, even if you have more ideas? | Draw a clear line around version one. |

## Toolkit: one of T01–T10

Each question supports searchable skill chips, free text, optional avoid text and detail, and `no preference`. Suggestions vary; the app stores the selected skills rather than treating one prompt as a different schema.

| ID | Bodge asks | Optional detail cue | Suggested chips |
| --- | --- | --- | --- |
| T01 | Which tool gets you to a clickable demo fastest? | What can you already ship with it? | TypeScript, Python, React, design, hardware |
| T02 | Which part can you build without a tutorial? | Name the work you can own confidently. | JavaScript, Python, SQL, mobile, no-code |
| T03 | Which unfamiliar tool would be fun to learn here? | What would you like to try with it? | AI API, mapping, data viz, games, hardware |
| T04 | Would you rather build the interface, logic, data, or hardware? | Which layer should carry the demo? | frontend, backend, data, design, hardware |
| T05 | Which existing asset could you reuse instead of starting from zero? | Name a component, dataset, sketch, or template. | React, Node, Python, Figma, spreadsheets |
| T06 | What must work offline or without an API key? | Describe the no-network version. | web, mobile, AI API, local data, sensors |
| T07 | Which teammate has an unusual strength to build around? | What can that person do well? | UI, backend, data, storytelling, integrations |
| T08 | What tool or approach should we steer clear of? | Why would it slow you down? | TypeScript, Python, AI API, maps, no-code |
| T09 | What data, device, or integration can you access already? | Name the resource you can use today. | frontend, backend, design, ML, domain knowledge |
| T10 | Which noncoding skill could carry this project? | Think research, writing, facilitation, or design. | research, writing, design, data, hardware |

## Spice: one of P01–P10

All ten use the same four-level scale and a question-specific optional twist note. The idea model receives the numeric level and note, not the prompt's metaphor.

| ID | Bodge asks | Optional detail cue |
| --- | --- | --- |
| P01 | Should the joke live in the mascot, interaction, or reveal? | Where should the funny moment happen? |
| P02 | Should the product sound straight-faced or self-aware? | Describe its voice in a few words. |
| P03 | What harmless surprise would make the demo memorable? | Name the unexpected moment. |
| P04 | How absurd can the premise get before it stops helping? | Name a boundary the joke should respect. |
| P05 | Would you rather land one punchline or a recurring bit? | What kind of joke fits? |
| P06 | Which ordinary task deserves dramatic treatment? | Name the task and the exaggeration. |
| P07 | When should the weirdness appear: first click or final payoff? | Describe the moment you prefer. |
| P08 | What should never become the punchline? | Name anything off-limits for the joke. |
| P09 | Should the twist make the pitch funnier or the product itself? | How would people notice it? |
| P10 | What bizarre rule could still fit a feasible MVP? | State a strange but buildable rule. |

## Review and implementation checks

The owner approved the new angles and optional detail cues. Several full runs and physical-device checks still need review before M2 closes. Keep each detail optional so the interview stays at five turns. Tests should assert exactly 50 unique IDs, ten per slot, one of each slot in every run, stable answers after refresh, no repeated variants within the recent-window rule when alternatives exist, and that all five answers normalize into the same server schema.
