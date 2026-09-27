# Bodge idea result — terminal concept

Status: revised design direction for owner review, 2026-09-26. This replaces the **idea card portion** of the original desktop and mobile renderings. The original images remain the reference for the shell, transcript, and knowledge panel. The local fixture result now uses this concept; final owner review and full theme/device checks remain.

## Renderings

- [Desktop PNG](reference/design/idea-card-concept-desktop.png) — 1440 × 900
- [Mobile PNG](reference/design/idea-card-concept-mobile.png) — 390 × 844
- [Editable HTML/CSS concept](reference/design/idea-card-concept.html) — layout and copy reference, not application code

## Direction

Treat an idea as **structured terminal output**, not a website card. It inherits the transcript background with no filled panel, shadow, rounded rectangle, tag pills, or boxed buttons. A single thin vertical gutter identifies the result as one response. A compact header gives the idea's pool position, build scope, and spice. The project title and plain-language hook remain the first substantial content.

The design should feel technical without making the user decode it. Keep the familiar four category names: `problem`, `loop`, `stack`, and `stretch`. Use a small prompt chevron and aligned label column to make each row easy to scan. Body copy stays readable and wraps normally. Subtle horizontal rules separate the header/body and body/actions; do not draw a full box around the result.

The owner asked for tighter spacing and a clearer terminal feel after reviewing the first quiet-card proposal. These renderings replace that earlier proposal at the same file paths.

## Component contract

| Part | Treatment |
| --- | --- |
| Result boundary | Transparent background matching the transcript. One thin left gutter line and two short hairline separators; no card fill, outer border, radius, or shadow. |
| Header | `idea 02 / 03` in the theme accent at left. `48h · spice 2/4` is quiet text at right. Use pool position, not a pseudo-global idea ID or decorative spice meter. |
| Title and hook | Clear sans title at about 28–30 px, followed by a short readable hook. These carry the visual hierarchy. Do not truncate long copy. |
| Tags | Plain mono `#domain` text in muted color. No chip fill or outline. Omit absent tags. |
| Categories | `› problem`, `› loop`, `› stack`, `› stretch` in a compact aligned column. Problem and loop text have higher emphasis; stack and stretch are quieter. These labels present the existing `problem`, `loop`, `stack`, and `stretch` data fields. |
| Actions | Visible `[a] accept`, `[r] refine`, `[n] next` text actions plus a `‹ 02 / 03 ›` page control. They must be real buttons with keyboard focus and touch targets of at least 44 px, even though they look like terminal text. The pager has explicit previous/next controls and the mobile swipe remains available. |

On desktop, use a compact two-column label/value grid. Mobile keeps a narrower label column so the same terminal syntax survives, with natural wrapping of values. Let the result grow with content; never set a fixed height. Keep the action row in the transcript flow and the composer reachable above the keyboard.

The renderings use the Terminal palette. For Magenta, Indigo, Blue, and Matcha, map the prompt chevrons, active action, idea position, and focus through semantic theme tokens. Keep labels and metadata muted. Check contrast and focus visibility in every theme. Screen readers should hear semantic category names and complete idea text rather than punctuation art.

## Content example

**Queue Goblin** — “A tiny creature that helps your team finish the tasks quietly rotting in the backlog.” The `problem` names forgotten project chores; the `loop` explains add task → gentle nudge → finish to feed the goblin. The joke supports a buildable product and does not replace the practical explanation.

This is a visual concept, not a completed M3 implementation or a change to the generation schema. Owner feedback on this revision can be applied before the result component is built.
