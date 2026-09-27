"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { domainLabels, goalLabels, questionById, skillCatalog, Slot, SlotAnswer, spiceLabels, teamLabels, TeamSize, timeLabels, TimeBudget } from "./interview";

type Props = { questionId: string; slot: Slot; previous?: SlotAnswer; onAnswer: (answer: SlotAnswer) => void };

function clean(value: string): string { return value.trim().replace(/\s+/g, " ").slice(0, 200); }

export function InterviewQuestion({ questionId, slot, previous, onAnswer }: Props) {
  const question = questionById.get(questionId);
  const [goal, setGoal] = useState(previous?.slot === "goal" ? previous.goal : "");
  const [domains, setDomains] = useState<string[]>(previous?.slot === "worlds" ? previous.domains : []);
  const [timeBudget, setTimeBudget] = useState<TimeBudget>(previous?.slot === "scope" ? previous.timeBudget : "48h");
  const [teamSize, setTeamSize] = useState<TeamSize>(previous?.slot === "scope" ? previous.teamSize : "solo");
  const [skills, setSkills] = useState<string[]>(previous?.slot === "toolkit" ? previous.skills : []);
  const [avoid, setAvoid] = useState(previous?.slot === "toolkit" ? previous.avoid ?? "" : "");
  const [spice, setSpice] = useState<1 | 2 | 3 | 4>(previous?.slot === "spice" ? previous.spice : 2);
  const [twistNote, setTwistNote] = useState(previous?.slot === "spice" ? previous.twistNote ?? "" : "");
  const [custom, setCustom] = useState("");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState("");
  const suggested = question?.suggestions ?? [];
  const quickChoices = slot === "goal" ? suggested : slot === "worlds" ? suggested : slot === "spice" ? [...spiceLabels] : [];
  const availableDomains = useMemo(() => [...suggested, ...Object.keys(domainLabels).filter(id => !suggested.includes(id))].filter(id => (domainLabels[id] ?? id).toLowerCase().includes(search.toLowerCase())), [suggested, search]);
  const availableSkills = useMemo(() => [...suggested, ...skillCatalog.filter(id => !suggested.includes(id))].filter(id => id.toLowerCase().includes(search.toLowerCase())), [suggested, search]);

  function choose(choice: string) {
    if (slot === "goal") setGoal(choice);
    else if (slot === "worlds") setDomains(current => {
      if (choice === "any") return ["any"];
      if (current.includes(choice)) return current.filter(value => value !== choice);
      return [...current.filter(value => value !== "any"), choice].slice(-2);
    });
    else if (slot === "spice") setSpice((spiceLabels.indexOf(choice as typeof spiceLabels[number]) + 1) as 1 | 2 | 3 | 4);
  }

  function addCustom() {
    const value = clean(custom);
    if (!value) return;
    if (slot === "goal") setGoal(value);
    else if (slot === "worlds") setDomains(current => [...current.filter(item => item !== "any" && item !== value), value].slice(-2));
    else if (slot === "toolkit") setSkills(current => current.includes(value) ? current : [...current, value]);
    setCustom("");
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    if (slot === "goal") {
      const resolved = goal === "surprise" ? Object.keys(goalLabels).filter(id => id !== "surprise")[crypto.getRandomValues(new Uint32Array(1))[0] % (Object.keys(goalLabels).length - 1)] : goal;
      if (!resolved) { setError("Pick a goal or type your own."); return; }
      onAnswer({ slot, goal: resolved });
    } else if (slot === "worlds") onAnswer({ slot, domains: domains.length ? domains : ["any"] });
    else if (slot === "scope") onAnswer({ slot, timeBudget, teamSize });
    else if (slot === "toolkit") onAnswer({ slot, skills, ...(clean(avoid) ? { avoid: clean(avoid) } : {}) });
    else onAnswer({ slot: "spice", spice, ...(clean(twistNote) ? { twistNote: clean(twistNote) } : {}) });
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.altKey || event.ctrlKey || event.metaKey || !quickChoices.length) return;
      if (/^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1;
        if (quickChoices[index]) { event.preventDefault(); setCursor(index); choose(quickChoices[index]); document.querySelectorAll<HTMLButtonElement>(".interview-question .option-grid button")[index]?.focus(); }
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const next = (cursor + direction + quickChoices.length) % quickChoices.length;
        setCursor(next);
        if (slot === "goal" || slot === "spice") choose(quickChoices[next]);
        document.querySelectorAll<HTMLButtonElement>(".interview-question .option-grid button")[next]?.focus();
      }
      else if (event.key === "Enter") {
        if (event.target instanceof HTMLButtonElement) {
          if ((slot === "goal" || slot === "spice") && event.target.closest(".option-grid") && event.target.classList.contains("selected")) { event.preventDefault(); submit(); }
          return;
        }
        event.preventDefault(); submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!question) return <p className="system-line">Question unavailable. Start a new interview with /generateIdea.</p>;
  return <form className="interview-question" onSubmit={submit}>
    <div className="question-heading"><span>{slot}</span><h2>{question.prompt}</h2></div>
    {slot === "goal" && <><div className="option-grid">{suggested.map((id, index) => <button type="button" className={`${goal === id ? "selected" : ""} ${cursor === index ? "cursor" : ""}`} key={id} onClick={() => choose(id)}><span>{index + 1}</span>{goalLabels[id] ?? id}</button>)}</div><div className="custom-row"><input aria-label="Custom goal" placeholder="or type your own goal" maxLength={200} value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} /><button type="button" onClick={addCustom}>use this</button></div>{goal && <p className="answer-preview">selected: {goalLabels[goal] ?? goal}</p>}</>}
    {slot === "worlds" && <><p className="question-note">Pick up to two. Leave blank for a surprise.</p><input className="filter-input" aria-label="Search domains" placeholder="search all domains" value={search} onChange={e => setSearch(e.target.value)} /><div className="option-grid domain-grid">{availableDomains.map((id, index) => <button type="button" className={`${domains.includes(id) ? "selected" : ""} ${suggested[cursor] === id ? "cursor" : ""}`} key={id} onClick={() => choose(id)}><span>{index < 9 ? index + 1 : "·"}</span>{domainLabels[id] ?? id}{domains.includes(id) && <b>✓</b>}</button>)}</div><div className="custom-row"><input aria-label="Custom domain" placeholder="or add your own domain" maxLength={200} value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} /><button type="button" onClick={addCustom}>add</button></div><p className="answer-preview">{domains.length ? domains.map(id => domainLabels[id] ?? id).join(" × ") : "Bodge will pick for you"}</p></>}
    {slot === "scope" && <><p className="question-note">Two quick controls, one question.</p><fieldset><legend>Time available</legend><div className="option-grid compact">{(Object.keys(timeLabels) as TimeBudget[]).map(id => <button type="button" className={timeBudget === id ? "selected" : ""} key={id} onClick={() => setTimeBudget(id)}>{timeLabels[id]}</button>)}</div></fieldset><fieldset><legend>Team size</legend><div className="option-grid compact">{(Object.keys(teamLabels) as TeamSize[]).map(id => <button type="button" className={teamSize === id ? "selected" : ""} key={id} onClick={() => setTeamSize(id)}>{teamLabels[id]}</button>)}</div></fieldset></>}
    {slot === "toolkit" && <><p className="question-note">Choose any skills or leave them blank. Nothing is invented for you.</p><input className="filter-input" aria-label="Search skills" placeholder="search skills and tools" value={search} onChange={e => setSearch(e.target.value)} /><div className="option-grid domain-grid">{availableSkills.map(id => <button type="button" className={skills.includes(id) ? "selected" : ""} key={id} onClick={() => setSkills(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])}>{id}{skills.includes(id) && <b>✓</b>}</button>)}</div><div className="custom-row"><input aria-label="Custom skill or tool" placeholder="add a skill or tool" maxLength={200} value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} /><button type="button" onClick={addCustom}>add</button></div><input className="filter-input" aria-label="Avoid this tool or approach" placeholder="avoid anything? optional" maxLength={200} value={avoid} onChange={e => setAvoid(e.target.value)} /><p className="answer-preview">{skills.length ? skills.join(", ") : "no preference"}</p></>}
    {slot === "spice" && <><p className="question-note">Even unhinged ideas still need a plausible MVP.</p><div className="option-grid">{spiceLabels.map((label, index) => <button type="button" className={`${spice === index + 1 ? "selected" : ""} ${cursor === index ? "cursor" : ""}`} key={label} onClick={() => setSpice((index + 1) as 1 | 2 | 3 | 4)}><span>{index + 1}</span>{label}</button>)}</div><input className="filter-input" aria-label="Optional twist or constraint" placeholder="extra constraint? optional" maxLength={200} value={twistNote} onChange={e => setTwistNote(e.target.value)} /></>}
    {error && <p className="question-error" role="alert">{error}</p>}
    <div className="question-footer"><span>1–9 pick · arrows move · confirm to continue</span><button type="submit">confirm answer ↵</button></div>
  </form>;
}
