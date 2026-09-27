"use client";

import { FormEvent, Fragment, KeyboardEvent, PointerEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { answerSummary, completedCount, currentSlot, domainLabels, Draft, goalLabels, loadDraft, normalizeAnswers, saveDraft, Slot, SlotAnswer, slots, spiceLabels, startDraft, teamLabels, timeLabels } from "./interview";
import { InterviewQuestion } from "./interview-question";

type Theme = "terminal" | "magenta" | "indigo" | "blue" | "matcha";
type Mood = "idle" | "listening" | "thinking" | "typing" | "eureka" | "confused";
type Idea = { title: string; oneLiner: string; tags: string[]; spice: number; problem: string; loop: string; stack: string[]; scope: string; stretch: string };
type Entry =
  | { id: number; type: "intro" }
  | { id: number; type: "user"; text: string }
  | { id: number; type: "bot"; text: string }
  | { id: number; type: "question-preview"; text: string; options: string[] }
  | { id: number; type: "interview-summary" }
  | { id: number; type: "progress"; value: number }
  | { id: number; type: "ideas" }
  | { id: number; type: "system"; text: string };
type State = { entries: Entry[]; mood: Mood; activeIdea: number; sheetOpen: boolean; draft: Draft | null };
type Action =
  | { type: "add"; entry: Entry; mood?: Mood }
  | { type: "start"; draft: Draft; entries: Entry[] }
  | { type: "advance"; draft: Draft; entries: Entry[]; mood: Mood }
  | { type: "restore"; draft: Draft; entries: Entry[] }
  | { type: "edit"; draft: Draft }
  | { type: "idea"; index: number }
  | { type: "sheet"; open: boolean }
  | { type: "mood"; mood: Mood };

const themes: { id: Theme; label: string }[] = [
  { id: "terminal", label: "Terminal" }, { id: "magenta", label: "Magenta" },
  { id: "indigo", label: "Indigo" }, { id: "blue", label: "Blue" }, { id: "matcha", label: "Matcha" },
];

const ideas: [Idea, Idea, Idea] = [
  {
    title: "Carbon Tamagotchi", oneLiner: "A desk pet that thrives when your local grid is clean and sulks when it’s running on coal.",
    tags: ["games", "climate"], spice: 3,
    problem: "Nobody knows when their electricity is dirty, so nobody shifts when they run the dishwasher.",
    loop: "Poll grid carbon data → pet mood → nudge: ‘Grid’s green for 2h, go do laundry.’",
    stack: ["TypeScript", "grid carbon API", "pixel sprites"], scope: "48h · 2–3 people",
    stretch: "Neighborhood leaderboard — whose pet survived the heatwave.",
  },
  {
    title: "Queue Goblin", oneLiner: "A tiny creature that helps your team finish the tasks quietly rotting in the backlog.",
    tags: ["productivity", "games"], spice: 2,
    problem: "Small teams forget the unglamorous tasks that quietly block the whole project.",
    loop: "Add a task → goblin nags gently → finish it to feed the goblin and clear the queue.",
    stack: ["React", "local storage", "CSS animation"], scope: "one evening · solo",
    stretch: "A shared team lair with a particularly judgmental weekly recap.",
  },
  {
    title: "Museum of Almost", oneLiner: "Turn abandoned side projects into tiny exhibits with one useful lesson each.",
    tags: ["community", "art"], spice: 2,
    problem: "Builders hide unfinished work, so other people repeat the same mistakes in private.",
    loop: "Submit an abandoned project → add the lesson → browse exhibits by problem or stack.",
    stack: ["Next.js", "Markdown", "search"], scope: "one week · 2–3 people",
    stretch: "Visitors leave a respectful ‘I tried this too’ sticker on each exhibit.",
  },
];

const initial: State = {
  mood: "eureka", activeIdea: 0, sheetOpen: false, draft: null,
  entries: [
    { id: 1, type: "intro" },
    { id: 9, type: "system", text: "shell preview · the conversation and ideas below are sample content" },
    { id: 2, type: "user", text: "/generateIdea" },
    { id: 3, type: "bot", text: "ok. five questions. no wrong answers, only boring ones." },
    { id: 4, type: "progress", value: 4 },
    { id: 5, type: "question-preview", text: "what harmless surprise would make the demo memorable?", options: ["sensible", "quirky", "spicy", "unhinged"] },
    { id: 6, type: "user", text: "3" },
    { id: 7, type: "bot", text: "cooked three. this one's my favorite." },
    { id: 8, type: "ideas" },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": return { ...state, entries: [...state.entries, action.entry], mood: action.mood ?? state.mood };
    case "start": return { ...state, entries: action.entries, draft: action.draft, activeIdea: 0, mood: "listening", sheetOpen: false };
    case "advance": return { ...state, entries: [...state.entries, ...action.entries], draft: action.draft, mood: action.mood };
    case "restore": return { ...state, entries: action.entries, draft: action.draft, mood: action.draft.currentIndex === 5 ? "eureka" : "listening" };
    case "edit": return { ...state, draft: action.draft, mood: "listening", sheetOpen: false };
    case "idea": return { ...state, activeIdea: (action.index + ideas.length) % ideas.length, mood: "eureka" };
    case "sheet": return { ...state, sheetOpen: action.open };
    case "mood": return { ...state, mood: action.mood };
  }
}

function Bodge({ mood, small = false }: { mood: Mood; small?: boolean }) {
  return <svg className={small ? "bodge-icon small" : "bodge-icon"} viewBox="0 0 24 24" role="img" aria-label={`Bodge ${mood}`}>
    <path fill="currentColor" d="M11 2h2v4h-2zM5 9a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
    <circle cx="9" cy="12" r="1.35" fill="var(--surface)" /><circle cx="15" cy="12" r="1.35" fill="var(--surface)" />
    {mood === "confused" ? <path d="M10 17q2-2 4 0" fill="none" stroke="var(--surface)" strokeWidth="1.4" /> : <path d="M10 16q2 2 4 0" fill="none" stroke="var(--surface)" strokeWidth="1.4" />}
    {mood === "eureka" && <path d="m4 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" />}
    {mood === "thinking" && <circle cx="21" cy="5" r="2" fill="currentColor" />}
  </svg>;
}

function IdeaCard({ idea, number }: { idea: Idea; number: number }) {
  return <article className="idea-card">
    <div className="idea-card-head">
      <div className="idea-overline"><span>idea {String(number).padStart(2, "0")} / 03</span><span>{idea.scope.split(" · ")[0]} · spice {idea.spice}/4</span></div>
      <h2>{idea.title}</h2><p className="idea-hook">{idea.oneLiner}</p>
      <p className="idea-tags">{idea.tags.slice(0, 2).map(tag => <span key={tag}>#{tag.replaceAll(" ", "-")}</span>)}</p>
    </div>
    <dl className="idea-fields"><div><dt><span aria-hidden="true">›</span>problem</dt><dd>{idea.problem}</dd></div><div><dt><span aria-hidden="true">›</span>loop</dt><dd>{idea.loop}</dd></div><div><dt><span aria-hidden="true">›</span>stack</dt><dd>{idea.stack.join(" · ")}</dd></div><div><dt><span aria-hidden="true">›</span>stretch</dt><dd>{idea.stretch}</dd></div></dl>
  </article>;
}

function restoredEntries(draft: Draft): Entry[] {
  let id = 1000;
  const entries: Entry[] = [
    { id: id++, type: "intro" },
    { id: id++, type: "user", text: "/generateIdea" },
    { id: id++, type: "bot", text: "ok. five questions. no wrong answers, only boring ones." },
    { id: id++, type: "interview-summary" },
  ];
  if (draft.currentIndex === 5) {
    entries.push({ id: id++, type: "bot", text: "interview complete. these three cards are visual samples; idea generation based on your answers is next. type /generateIdea for a fresh set of questions." });
    entries.push({ id: id++, type: "ideas" });
  }
  return entries;
}

function InterviewSummary({ draft, onEdit }: { draft: Draft; onEdit: (slot: Slot) => void }) {
  const count = completedCount(draft);
  return <section className="interview-summary" aria-label="Your interview answers">
    <div className="interview-summary-head"><strong>YOUR ANSWERS</strong><span role="status">{count} / 5 answered</span></div>
    <div className="interview-summary-meter" aria-hidden="true"><span style={{ width: `${count * 20}%` }} /></div>
    {count > 0 && <ol>{draft.order.map((slot, index) => {
      const answer = draft.answers[slot];
      return answer ? <li key={slot}><span className="interview-summary-slot">{String(index + 1).padStart(2, "0")} {slot}</span><button type="button" onClick={() => onEdit(slot)} title={`Edit ${slot} answer`}>{answerSummary(answer)}</button></li> : null;
    })}</ol>}
  </section>;
}

function Knowledge({ draft, onEdit, onCommand }: { draft: Draft | null; onEdit: (slot: Slot) => void; onCommand: (command: string) => void }) {
  const goal = draft?.answers.goal;
  const worlds = draft?.answers.worlds;
  const scope = draft?.answers.scope;
  const toolkit = draft?.answers.toolkit;
  const spice = draft?.answers.spice;
  const rows: { key: string; value: string; slot: Slot; answered: boolean }[] = draft ? [
    { key: "vibe", value: goal?.slot === "goal" ? goalLabels[goal.goal] ?? goal.goal : "···", slot: "goal", answered: goal?.slot === "goal" },
    { key: "field", value: worlds?.slot === "worlds" ? worlds.domains.map(id => domainLabels[id] ?? id).join(" × ") : "···", slot: "worlds", answered: worlds?.slot === "worlds" },
    { key: "time", value: scope?.slot === "scope" ? timeLabels[scope.timeBudget] : "···", slot: "scope", answered: scope?.slot === "scope" },
    { key: "team", value: scope?.slot === "scope" ? teamLabels[scope.teamSize] : "···", slot: "scope", answered: scope?.slot === "scope" },
    { key: "skills", value: toolkit?.slot === "toolkit" ? toolkit.skills.join(", ") || "no preference" : "···", slot: "toolkit", answered: toolkit?.slot === "toolkit" },
    { key: "spice", value: spice?.slot === "spice" ? spiceLabels[spice.spice - 1] : "···", slot: "spice", answered: spice?.slot === "spice" },
  ] : [["vibe", "chaotic good", "goal"], ["field", "games × climate", "worlds"], ["time", "48h", "scope"], ["team", "2–3", "scope"], ["skills", "TS, Python", "toolkit"], ["spice", "spicy ▮", "spice"]].map(([key, value, slot]) => ({ key, value, slot: slot as Slot, answered: false }));
  return <div className="knowledge-content">
    <h2>WHAT BODGE KNOWS</h2>
    <dl className="knowledge-list">{rows.map(row => <div key={row.key}><dt>{row.key}</dt><dd>{row.answered ? <button type="button" title={`Change ${row.key}`} onClick={() => onEdit(row.slot)}>{row.value}</button> : row.value}</dd></div>)}</dl>
    <p className="subtle">{draft ? "Tap a known value to re-answer it. Changes shape future ideas." : "Fixture answers for this shell preview."}</p>
    <h2 className="commands-heading">COMMANDS</h2>
    <div className="command-list">{[["/generateIdea", "start a five-question interview"], ["/help", "everything bodge understands"], ["/theme", "cycle color themes"], ["/savedIdeas", "local saves, coming next"]].map(([command, detail]) => <button key={command} type="button" onClick={() => onCommand(command)}><strong>{command}</strong><span>{detail}</span></button>)}</div>
    <p className="sidebar-foot">/ open commands<br />← → browse sample ideas</p>
  </div>;
}

function EntryView({ entry, draft, activeIdea, onEdit, onIdea, onCommand }: { entry: Entry; draft: Draft | null; activeIdea: number; onEdit: (slot: Slot) => void; onIdea: (index: number) => void; onCommand: (command: string) => void }) {
  if (entry.type === "intro") return <div className="intro"><p><span className="accent">bodge</span> v0.1 — tell me who you are, i&apos;ll hand you something to build.</p><p>type <strong>/help</strong> for commands, or just start talking.</p></div>;
  if (entry.type === "user") return <p className="user-line"><span aria-hidden="true">❯</span> {entry.text}</p>;
  if (entry.type === "bot") return <p className="bot-line"><Bodge mood="listening" small /> <span>{entry.text}</span></p>;
  if (entry.type === "system") return <p className="system-line" role="status">{entry.text}</p>;
  if (entry.type === "interview-summary") return draft ? <InterviewSummary draft={draft} onEdit={onEdit} /> : null;
  if (entry.type === "progress") return <p className="progress-line"><span className="meter" aria-hidden="true">{"■".repeat(entry.value)}{"□".repeat(5 - entry.value)}</span> {entry.value} of 5 logged → what bodge knows</p>;
  if (entry.type === "question-preview") return <div className="question-preview"><p><span>q5</span> {entry.text}</p><div>{entry.options.map((option, index) => <span className={option === "spicy" ? "selected-option" : ""} key={option}>{index + 1} {option}</span>)}</div><small>← → move · ↵ lock in · or type your own</small></div>;
  return <div className="ideas-block"><IdeaCard idea={ideas[activeIdea]} number={activeIdea + 1} /><div className="idea-actions"><button className="accept-action" type="button" onClick={() => onCommand("/accept")}><span>[a]</span> accept</button><button type="button" onClick={() => onCommand("/refine")}><span>[r]</span> refine</button><button type="button" onClick={() => onIdea(activeIdea + 1)}><span>[n]</span> next</button><div className="pager"><button aria-label="Previous idea" type="button" onClick={() => onIdea(activeIdea - 1)}>‹</button><span>{String(activeIdea + 1).padStart(2, "0")} / 03</span><button aria-label="Next idea" type="button" onClick={() => onIdea(activeIdea + 1)}>›</button></div></div></div>;
}

export function Terminal() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [theme, setTheme] = useState<Theme>("terminal");
  const [themeReady, setThemeReady] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);
  const sheetHistoryRef = useRef(false);
  const touchStart = useRef<number | null>(null);
  const nextId = useRef(10);

  useEffect(() => { const current = document.documentElement.dataset.theme as Theme; if (themes.some(t => t.id === current)) setTheme(current); setThemeReady(true); }, []);
  useEffect(() => { if (!themeReady) return; document.documentElement.dataset.theme = theme; try { localStorage.setItem("bodge-theme", theme); } catch {} }, [theme, themeReady]);
  useEffect(() => { const saved = loadDraft(); if (saved) dispatch({ type: "restore", draft: saved, entries: restoredEntries(saved) }); setDraftReady(true); }, []);
  useEffect(() => { if (draftReady) saveDraft(state.draft); }, [state.draft, draftReady]);
  useEffect(() => { if (state.sheetOpen) sheetCloseRef.current?.focus(); }, [state.sheetOpen]);
  useEffect(() => { if (atBottom) { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); } else setNewCount(n => n + 1); }, [state.entries.length, state.draft?.currentIndex]);
  useEffect(() => { if (state.draft?.editingSlot) scrollRef.current?.querySelector(".interview-question")?.scrollIntoView({ block: "nearest" }); }, [state.draft?.editingSlot]);

  const add = useCallback((entry: Omit<Extract<Entry, {type: "user" | "bot" | "system"}>, "id">, mood?: Mood) => dispatch({ type: "add", entry: { ...entry, id: nextId.current++ } as Entry, mood }), []);
  const cycleTheme = useCallback(() => setTheme(previous => themes[(themes.findIndex(t => t.id === previous) + 1) % themes.length].id), []);
  const openSheet = useCallback(() => { if (!sheetHistoryRef.current) { history.pushState({ bodgeSheet: true }, ""); sheetHistoryRef.current = true; } dispatch({ type: "sheet", open: true }); }, []);
  const closeSheet = useCallback(() => { if (sheetHistoryRef.current) { sheetHistoryRef.current = false; history.back(); } dispatch({ type: "sheet", open: false }); sheetTriggerRef.current?.focus(); }, []);
  useEffect(() => {
    const onPop = () => { if (sheetHistoryRef.current) { sheetHistoryRef.current = false; dispatch({ type: "sheet", open: false }); sheetTriggerRef.current?.focus(); } };
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape" && sheetHistoryRef.current) closeSheet(); };
    window.addEventListener("popstate", onPop); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("keydown", onKey); };
  }, [closeSheet]);
  const onAnswer = (answer: SlotAnswer) => {
    const draft = state.draft;
    if (!draft || currentSlot(draft) !== answer.slot) return;
    const editing = Boolean(draft.editingSlot);
    const updated: Draft = { ...draft, answers: { ...draft.answers, [answer.slot]: answer }, currentIndex: editing ? draft.currentIndex : Math.min(5, draft.currentIndex + 1), editingSlot: undefined };
    const ready = updated.currentIndex === 5 && Boolean(normalizeAnswers(updated));
    const entries: Entry[] = [];
    if (!editing && updated.currentIndex === 5) {
      entries.push({ id: nextId.current++, type: "bot", text: ready ? "interview complete. these three cards are visual samples; idea generation based on your answers is next. type /generateIdea for a fresh set of questions." : "one answer needs another look. tap what i know to fix it." });
      if (ready) entries.push({ id: nextId.current++, type: "ideas" });
    }
    dispatch({ type: "advance", draft: updated, entries, mood: updated.currentIndex === 5 ? "eureka" : "listening" });
  };
  const onEdit = (slot: Slot) => {
    if (!state.draft?.answers[slot]) return;
    dispatch({ type: "edit", draft: { ...state.draft, editingSlot: slot } });
    if (state.sheetOpen) closeSheet();
  };
  const runCommand = useCallback((raw: string) => {
    const command = raw.trim();
    if (!command) return;
    if (command === "/generateIdea") {
      const draft = startDraft();
      dispatch({ type: "start", draft, entries: [
        { id: nextId.current++, type: "intro" },
        { id: nextId.current++, type: "user", text: command },
        { id: nextId.current++, type: "bot", text: "ok. five questions. no wrong answers, only boring ones." },
        { id: nextId.current++, type: "interview-summary" },
      ] });
      setInput(""); setCompletion(false); setAtBottom(true); setNewCount(0);
      return;
    }
    add({ type: "user", text: command });
    setCompletion(false);
    if (command === "/help") add({ type: "bot", text: "try /generateIdea for five questions, /theme for colors, /knows for answers, or /savedIdeas. idea cards are sample data until generation is connected." }, "listening");
    else if (command === "/theme") { cycleTheme(); add({ type: "bot", text: "new colors. same questionable confidence." }, "eureka"); }
    else if (command === "/knows") { openSheet(); add({ type: "bot", text: "here's what i know so far." }, "listening"); }
    else if (command === "/savedIdeas" || command === "/accept" || command === "/refine") add({ type: "system", text: "Saving and refinement arrive after the interview and generation flow. This preview does not store ideas yet." }, "idle");
    else if (command.startsWith("/")) add({ type: "system", text: `unknown command: ${command}. type /help for the list.` }, "confused");
    else add({ type: "bot", text: state.draft && currentSlot(state.draft) ? "pick an option in the current question, or use /help." : "i hear you. start an interview with /generateIdea." }, "listening");
    setInput("");
  }, [add, cycleTheme, openSheet, state.draft]);
  const commandMatches = useMemo(() => ["/generateIdea", "/help", "/theme", "/savedIdeas", "/knows"].filter(c => c.toLowerCase().startsWith(input.toLowerCase())), [input]);
  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); runCommand(input); }
    else if (event.key === "Tab" && completion && commandMatches.length) { event.preventDefault(); setInput(commandMatches[0]); setCompletion(false); }
    else if (event.key === "Escape") setCompletion(false);
  };
  useEffect(() => { const key = (event: globalThis.KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || state.sheetOpen) return;
    if (event.key === "/") { event.preventDefault(); inputRef.current?.focus(); setInput("/"); setCompletion(true); }
    if (state.draft && currentSlot(state.draft)) return;
    if (event.key === "ArrowRight") dispatch({ type: "idea", index: state.activeIdea + 1 });
    if (event.key === "ArrowLeft") dispatch({ type: "idea", index: state.activeIdea - 1 });
    if (event.key.toLowerCase() === "n") dispatch({ type: "idea", index: state.activeIdea + 1 });
  }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [state.activeIdea, state.sheetOpen, state.draft]);
  const onScroll = () => { const box = scrollRef.current; if (!box) return; const bottom = box.scrollHeight - box.scrollTop - box.clientHeight < 48; setAtBottom(bottom); if (bottom) setNewCount(0); };
  const onSwipeStart = (event: PointerEvent<HTMLDivElement>) => { touchStart.current = event.clientX; };
  const onSwipeEnd = (event: PointerEvent<HTMLDivElement>) => { if (touchStart.current == null) return; const distance = event.clientX - touchStart.current; if (Math.abs(distance) > 70 && (!state.draft || state.draft.currentIndex === 5)) dispatch({ type: "idea", index: state.activeIdea + (distance < 0 ? 1 : -1) }); touchStart.current = null; };
  const onSubmit = (event: FormEvent) => { event.preventDefault(); runCommand(input); };
  const activeSlot = state.draft ? currentSlot(state.draft) : undefined;
  const activeQuestionId = activeSlot && state.draft ? state.draft.questionIds[slots.indexOf(activeSlot)] : undefined;
  const progress = state.draft ? completedCount(state.draft) : 5;
  useEffect(() => { if (activeQuestionId) document.querySelector<HTMLButtonElement>(".interview-question .option-grid button")?.focus(); }, [activeQuestionId]);

  return <main className={`scene${draftReady ? "" : " initializing"}${activeSlot ? " interview-active" : ""}`} aria-busy={!draftReady}><div className="terminal-window">
    <header className="titlebar"><div className="traffic" aria-hidden="true"><i /><i /><i /></div><div className="title-center"><Bodge mood={state.mood} /><strong>bodge</strong><span className="path">~/idea-lab</span><span className="status">● {state.mood}</span></div><div className="themes" aria-label="Color theme">{themes.map(item => <button type="button" title={item.label} aria-label={`${item.label} theme`} aria-pressed={theme === item.id} className={`theme-dot ${item.id}`} key={item.id} onClick={() => setTheme(item.id)} />)}</div></header>
    <button ref={sheetTriggerRef} className="mobile-progress" type="button" onClick={openSheet}><span className="meter">{"■".repeat(progress)}{"□".repeat(5 - progress)}</span><span>{progress} of 5 · what bodge knows</span><span aria-hidden="true">›</span></button>
    <div className="terminal-body"><div className="left-pane"><div ref={scrollRef} className="transcript" onScroll={onScroll} aria-label="Conversation transcript"><div className="transcript-inner" onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd}>{state.entries.map(entry => <Fragment key={entry.id}><EntryView entry={entry} draft={state.draft} activeIdea={state.activeIdea} onEdit={onEdit} onIdea={index => dispatch({ type: "idea", index })} onCommand={runCommand} />{entry.type === "interview-summary" && state.draft?.editingSlot && activeSlot && activeQuestionId && <InterviewQuestion key={`${activeQuestionId}-edit`} questionId={activeQuestionId} slot={activeSlot} previous={state.draft.answers[activeSlot]} onAnswer={onAnswer} />}</Fragment>)}{!state.draft?.editingSlot && activeSlot && activeQuestionId && <InterviewQuestion key={`${activeQuestionId}-run`} questionId={activeQuestionId} slot={activeSlot} previous={state.draft?.answers[activeSlot]} onAnswer={onAnswer} />}</div></div>{newCount > 0 && <button type="button" className="jump-button" onClick={() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); setAtBottom(true); setNewCount(0); }}>↓ {newCount} new</button>}
    <form className="composer" onSubmit={onSubmit}><label htmlFor="terminal-input" className="sr-only">Command or answer</label><span className="prompt" aria-hidden="true">❯</span><input id="terminal-input" ref={inputRef} value={input} onChange={e => { setInput(e.target.value); setCompletion(e.target.value.startsWith("/")); }} onKeyDown={onInputKey} placeholder="answer, refine, or /command" autoComplete="off" spellCheck={false} /><button aria-label="Send command" type="submit">↵</button>{completion && commandMatches.length > 0 && <div className="completion" role="listbox" aria-label="Commands">{commandMatches.map(command => <button type="button" role="option" aria-selected="false" key={command} onClick={() => { setInput(command); setCompletion(false); inputRef.current?.focus(); }}>{command}</button>)}</div>}</form></div>
    <aside className="sidebar" aria-label="What Bodge knows"><Knowledge draft={state.draft} onEdit={onEdit} onCommand={runCommand} /></aside></div>
    {state.sheetOpen && <div className="sheet-layer"><button className="sheet-backdrop" type="button" aria-label="Close what Bodge knows" onClick={closeSheet} /><section className="sheet" role="dialog" aria-modal="true" aria-label="What Bodge knows"><div className="sheet-handle" /><button ref={sheetCloseRef} className="sheet-close" type="button" onClick={closeSheet}>close ↓</button><Knowledge draft={state.draft} onEdit={onEdit} onCommand={command => { closeSheet(); runCommand(command); }} /></section></div>}
  </div><p className="preview-caption">BODGE / LOCAL PREVIEW · {state.draft ? "interview active · sample ideas" : "sample conversation and ideas"}</p></main>;
}
