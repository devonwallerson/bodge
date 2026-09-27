"use client";

import { FormEvent, KeyboardEvent, PointerEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

type Theme = "terminal" | "magenta" | "indigo" | "blue" | "matcha";
type Mood = "idle" | "listening" | "thinking" | "typing" | "eureka" | "confused";
type Idea = { title: string; oneLiner: string; tags: string[]; spice: number; problem: string; loop: string; stack: string[]; scope: string; stretch: string };
type Entry =
  | { id: number; type: "intro" }
  | { id: number; type: "user"; text: string }
  | { id: number; type: "bot"; text: string }
  | { id: number; type: "question"; text: string; options: string[] }
  | { id: number; type: "progress"; value: number }
  | { id: number; type: "ideas" }
  | { id: number; type: "system"; text: string };
type State = { entries: Entry[]; mood: Mood; activeIdea: number; sheetOpen: boolean };
type Action =
  | { type: "add"; entry: Entry; mood?: Mood }
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
    title: "Queue Goblin", oneLiner: "A tiny creature that eats the tasks your team has left rotting in the backlog.",
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
  mood: "eureka", activeIdea: 0, sheetOpen: false,
  entries: [
    { id: 1, type: "intro" },
    { id: 9, type: "system", text: "shell preview · the conversation and ideas below are sample content" },
    { id: 2, type: "user", text: "/generateIdea" },
    { id: 3, type: "bot", text: "ok. five questions. no wrong answers, only boring ones." },
    { id: 4, type: "progress", value: 4 },
    { id: 5, type: "question", text: "how weird are we allowed to get?", options: ["sensible", "quirky", "spicy", "unhinged"] },
    { id: 6, type: "user", text: "3" },
    { id: 7, type: "bot", text: "cooked three. this one's my favorite." },
    { id: 8, type: "ideas" },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": return { ...state, entries: [...state.entries, action.entry], mood: action.mood ?? state.mood };
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
    <div className="idea-top"><span><strong>idea {String(number).padStart(3, "0")}</strong> <span className="idea-meta">· {idea.tags.join(" × ")} · {idea.scope}</span></span><span className="spice" aria-label={`Spice ${idea.spice} of 4`}>spice <b>{"■".repeat(idea.spice)}{"□".repeat(4 - idea.spice)}</b></span></div>
    <h2>{idea.title}</h2><p className="idea-hook">{idea.oneLiner}</p>
    <dl className="idea-fields"><dt>problem</dt><dd>{idea.problem}</dd><dt>loop</dt><dd>{idea.loop}</dd><dt>stack</dt><dd>{idea.stack.join(" · ")}</dd><dt>stretch</dt><dd>{idea.stretch}</dd></dl>
  </article>;
}

function Knowledge({ onCommand }: { onCommand: (command: string) => void }) {
  const rows = [["vibe", "chaotic good"], ["field", "games × climate"], ["time", "48h"], ["team", "2–3"], ["skills", "TS, Python"], ["spice", "spicy ▮"]];
  return <div className="knowledge-content">
    <h2>WHAT BODGE KNOWS</h2>
    <dl className="knowledge-list">{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
    <p className="subtle">Fixture answers for this shell preview.</p>
    <h2 className="commands-heading">COMMANDS</h2>
    <div className="command-list">{[["/generateIdea", "show the fixture idea pool"], ["/help", "everything bodge understands"], ["/theme", "cycle color themes"], ["/savedIdeas", "local saves, coming next"]].map(([command, detail]) => <button key={command} type="button" onClick={() => onCommand(command)}><strong>{command}</strong><span>{detail}</span></button>)}</div>
    <p className="sidebar-foot">/ open commands<br />← → browse sample ideas</p>
  </div>;
}

function EntryView({ entry, activeIdea, onIdea, onCommand }: { entry: Entry; activeIdea: number; onIdea: (index: number) => void; onCommand: (command: string) => void }) {
  if (entry.type === "intro") return <div className="intro"><p><span className="accent">bodge</span> v0.1 — tell me who you are, i&apos;ll hand you something to build.</p><p>type <strong>/help</strong> for commands, or just start talking.</p></div>;
  if (entry.type === "user") return <p className="user-line"><span aria-hidden="true">❯</span> {entry.text}</p>;
  if (entry.type === "bot") return <p className="bot-line"><Bodge mood="listening" small /> <span>{entry.text}</span></p>;
  if (entry.type === "system") return <p className="system-line" role="status">{entry.text}</p>;
  if (entry.type === "progress") return <p className="progress-line"><span className="meter" aria-hidden="true">{"■".repeat(entry.value)}{"□".repeat(5 - entry.value)}</span> {entry.value} of 5 logged → what bodge knows</p>;
  if (entry.type === "question") return <div className="question-preview"><p><span>q5</span> {entry.text}</p><div>{entry.options.map((option, index) => <span className={option === "spicy" ? "selected-option" : ""} key={option}>{index + 1} {option}</span>)}</div><small>← → move · ↵ lock in · or type your own</small></div>;
  return <div className="ideas-block"><IdeaCard idea={ideas[activeIdea]} number={17 + activeIdea} /><div className="idea-actions"><button type="button" onClick={() => onCommand("/accept")}>[a] accept</button><button type="button" onClick={() => onCommand("/refine")}>[r] refine</button><button type="button" onClick={() => onIdea(activeIdea + 1)}>[n] next</button><div className="pager"><button aria-label="Previous idea" type="button" onClick={() => onIdea(activeIdea - 1)}>‹</button><span>{activeIdea + 1} / {ideas.length}</span><button aria-label="Next idea" type="button" onClick={() => onIdea(activeIdea + 1)}>›</button></div></div></div>;
}

export function Terminal() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [theme, setTheme] = useState<Theme>("terminal");
  const [themeReady, setThemeReady] = useState(false);
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const nextId = useRef(10);

  useEffect(() => { const current = document.documentElement.dataset.theme as Theme; if (themes.some(t => t.id === current)) setTheme(current); setThemeReady(true); }, []);
  useEffect(() => { if (!themeReady) return; document.documentElement.dataset.theme = theme; try { localStorage.setItem("bodge-theme", theme); } catch {} }, [theme, themeReady]);
  useEffect(() => { if (atBottom) { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); } else setNewCount(n => n + 1); }, [state.entries.length]);
  useEffect(() => { if (!state.sheetOpen) return; const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { dispatch({ type: "sheet", open: false }); sheetTriggerRef.current?.focus(); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [state.sheetOpen]);

  const add = useCallback((entry: Omit<Extract<Entry, {type: "user" | "bot" | "system"}>, "id">, mood?: Mood) => dispatch({ type: "add", entry: { ...entry, id: nextId.current++ } as Entry, mood }), []);
  const cycleTheme = useCallback(() => setTheme(previous => themes[(themes.findIndex(t => t.id === previous) + 1) % themes.length].id), []);
  const runCommand = useCallback((raw: string) => {
    const command = raw.trim();
    if (!command) return;
    add({ type: "user", text: command });
    setCompletion(false);
    if (command === "/help") add({ type: "bot", text: "try /generateIdea, /theme, /savedIdeas, or /knows. the idea pool is fixture data for this first build." }, "listening");
    else if (command === "/theme") { cycleTheme(); add({ type: "bot", text: "new colors. same questionable confidence." }, "eureka"); }
    else if (command === "/knows") { dispatch({ type: "sheet", open: true }); add({ type: "bot", text: "here's what i know in this preview." }, "listening"); }
    else if (command === "/generateIdea") { dispatch({ type: "idea", index: 0 }); add({ type: "bot", text: "showing three sample ideas. the five-question interview is the next milestone." }, "eureka"); }
    else if (command === "/savedIdeas" || command === "/accept" || command === "/refine") add({ type: "system", text: "Saving and refinement arrive after the interview and generation flow. This preview does not store ideas yet." }, "idle");
    else if (command.startsWith("/")) add({ type: "system", text: `unknown command: ${command}. type /help for the list.` }, "confused");
    else add({ type: "bot", text: "i hear you. the interview will turn that into a real answer in the next milestone. try /help." }, "listening");
    setInput("");
  }, [add, cycleTheme]);
  const commandMatches = useMemo(() => ["/generateIdea", "/help", "/theme", "/savedIdeas", "/knows"].filter(c => c.toLowerCase().startsWith(input.toLowerCase())), [input]);
  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); runCommand(input); }
    else if (event.key === "Tab" && completion && commandMatches.length) { event.preventDefault(); setInput(commandMatches[0]); setCompletion(false); }
    else if (event.key === "Escape") setCompletion(false);
  };
  useEffect(() => { const key = (event: globalThis.KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || state.sheetOpen) return;
    if (event.key === "/") { event.preventDefault(); inputRef.current?.focus(); setInput("/"); setCompletion(true); }
    if (event.key === "ArrowRight") dispatch({ type: "idea", index: state.activeIdea + 1 });
    if (event.key === "ArrowLeft") dispatch({ type: "idea", index: state.activeIdea - 1 });
    if (event.key.toLowerCase() === "n") dispatch({ type: "idea", index: state.activeIdea + 1 });
  }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [state.activeIdea, state.sheetOpen]);
  const onScroll = () => { const box = scrollRef.current; if (!box) return; const bottom = box.scrollHeight - box.scrollTop - box.clientHeight < 48; setAtBottom(bottom); if (bottom) setNewCount(0); };
  const onSwipeStart = (event: PointerEvent<HTMLDivElement>) => { touchStart.current = event.clientX; };
  const onSwipeEnd = (event: PointerEvent<HTMLDivElement>) => { if (touchStart.current == null) return; const distance = event.clientX - touchStart.current; if (Math.abs(distance) > 70) dispatch({ type: "idea", index: state.activeIdea + (distance < 0 ? 1 : -1) }); touchStart.current = null; };
  const onSubmit = (event: FormEvent) => { event.preventDefault(); runCommand(input); };

  return <main className="scene"><div className="terminal-window">
    <header className="titlebar"><div className="traffic" aria-hidden="true"><i /><i /><i /></div><div className="title-center"><Bodge mood={state.mood} /><strong>bodge</strong><span className="path">~/idea-lab</span><span className="status">● {state.mood}</span></div><div className="themes" aria-label="Color theme">{themes.map(item => <button type="button" title={item.label} aria-label={`${item.label} theme`} aria-pressed={theme === item.id} className={`theme-dot ${item.id}`} key={item.id} onClick={() => setTheme(item.id)} />)}</div></header>
    <button ref={sheetTriggerRef} className="mobile-progress" type="button" onClick={() => dispatch({ type: "sheet", open: true })}><span className="meter">■■■■■</span><span>5 of 5 · what bodge knows</span><span aria-hidden="true">›</span></button>
    <div className="terminal-body"><div className="left-pane"><div ref={scrollRef} className="transcript" onScroll={onScroll} aria-label="Conversation transcript"><div className="transcript-inner" onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd}>{state.entries.map(entry => <EntryView key={entry.id} entry={entry} activeIdea={state.activeIdea} onIdea={index => dispatch({ type: "idea", index })} onCommand={runCommand} />)}</div></div>{newCount > 0 && <button type="button" className="jump-button" onClick={() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); setAtBottom(true); setNewCount(0); }}>↓ {newCount} new</button>}
    <form className="composer" onSubmit={onSubmit}><label htmlFor="terminal-input" className="sr-only">Command or answer</label><span className="prompt" aria-hidden="true">❯</span><input id="terminal-input" ref={inputRef} value={input} onChange={e => { setInput(e.target.value); setCompletion(e.target.value.startsWith("/")); }} onKeyDown={onInputKey} placeholder="answer, refine, or /command" autoComplete="off" spellCheck={false} /><button aria-label="Send command" type="submit">↵</button>{completion && commandMatches.length > 0 && <div className="completion" role="listbox" aria-label="Commands">{commandMatches.map(command => <button type="button" role="option" aria-selected="false" key={command} onClick={() => { setInput(command); setCompletion(false); inputRef.current?.focus(); }}>{command}</button>)}</div>}</form></div>
    <aside className="sidebar" aria-label="What Bodge knows"><Knowledge onCommand={runCommand} /></aside></div>
    {state.sheetOpen && <div className="sheet-layer"><button className="sheet-backdrop" type="button" aria-label="Close what Bodge knows" onClick={() => { dispatch({ type: "sheet", open: false }); sheetTriggerRef.current?.focus(); }} /><section className="sheet" role="dialog" aria-modal="true" aria-label="What Bodge knows"><div className="sheet-handle" /><button className="sheet-close" type="button" onClick={() => { dispatch({ type: "sheet", open: false }); sheetTriggerRef.current?.focus(); }}>close ↓</button><Knowledge onCommand={command => { dispatch({ type: "sheet", open: false }); runCommand(command); }} /></section></div>}
  </div><p className="preview-caption">BODGE / SHELL PREVIEW · sample conversation and ideas</p></main>;
}
