import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const root = process.cwd();
const source = readFileSync(join(root, "app/interview.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const module = { exports: {} };
const load = path => {
  assert.equal(path, "./question-bank.json");
  return JSON.parse(readFileSync(join(root, "app/question-bank.json"), "utf8"));
};
new Function("require", "module", "exports", compiled)(load, module, module.exports);
const { bank, slots, selectQuestions, startDraft, currentSlot, normalizeAnswers, saveDraft, loadDraft } = module.exports;

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};

assert.equal(bank.length, 50);
assert.equal(new Set(bank.map(question => question.id)).size, 50);
assert.equal(new Set(bank.map(question => question.prompt)).size, 50);
assert.equal(new Set(bank.map(question => question.detailPrompt)).size, 50);
const bankDocument = readFileSync(join(root, "docs/QUESTION_BANK.md"), "utf8");
for (const question of bank) {
  const documented = `| ${question.id} | ${question.prompt} | ${question.detailPrompt} |${question.suggestions ? ` ${question.suggestions.join(", ")} |` : ""}`;
  assert.ok(bankDocument.includes(documented), `${question.id} differs between app and reviewed bank`);
}
for (const slot of slots) assert.equal(bank.filter(question => question.slot === slot).length, 10);

const first = selectQuestions();
const second = selectQuestions();
const third = selectQuestions();
for (let index = 0; index < 5; index++) {
  assert.equal(bank.find(question => question.id === first[index])?.slot, slots[index]);
  assert.notEqual(second[index], first[index]);
  assert.notEqual(third[index], first[index]);
  assert.notEqual(third[index], second[index]);
}

const originalCrypto = globalThis.crypto;
for (const [first, second, expected] of [
  [0, 0, ["goal", "worlds", "scope", "toolkit", "spice"]],
  [1, 0, ["worlds", "goal", "scope", "toolkit", "spice"]],
  [0, 1, ["goal", "worlds", "toolkit", "scope", "spice"]],
  [1, 1, ["worlds", "goal", "toolkit", "scope", "spice"]],
]) {
  const draws = [first, second];
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues: bytes => { bytes[0] = draws.shift() ?? 0; return bytes; } } });
  const ordered = startDraft();
  assert.deepEqual(ordered.order, expected);
  assert.equal(currentSlot(ordered), expected[0]);
}
Object.defineProperty(globalThis, "crypto", { configurable: true, value: originalCrypto });

const draft = startDraft();
assert.equal(draft.schemaVersion, 2);
assert.deepEqual([...draft.order].sort(), [...slots].sort());
assert.equal(draft.order[4], "spice");
assert.equal(currentSlot(draft), draft.order[0]);
draft.answers = {
  goal: { slot: "goal", goal: "solve" },
  worlds: { slot: "worlds", domains: ["games", "climate"] },
  scope: { slot: "scope", timeBudget: "48h", teamSize: "2-3" },
  toolkit: { slot: "toolkit", skills: ["TypeScript"] },
  spice: { slot: "spice", spice: 3 },
};
draft.currentIndex = 5;
saveDraft(draft);
assert.deepEqual(loadDraft(), draft);
assert.deepEqual(normalizeAnswers(draft), {
  goal: "solve", domains: ["games", "climate"], timeBudget: "48h", teamSize: "2-3",
  skills: ["TypeScript"], spice: 3, questionIds: draft.questionIds,
});
draft.answers.goal = { slot: "goal", goal: "solve", note: "Help neighbors share unused tools" };
draft.answers.scope = { slot: "scope", timeBudget: "48h", teamSize: "2-3", note: "Demo a single exchange" };
draft.answers.spice = { slot: "spice", spice: 3, twistNote: "The toolbox has a tiny personality" };
saveDraft(draft);
assert.deepEqual(loadDraft(), draft);
assert.deepEqual(normalizeAnswers(draft)?.notes, { goal: "Help neighbors share unused tools", scope: "Demo a single exchange" });
assert.equal(normalizeAnswers(draft)?.twistNote, "The toolbox has a tiny personality");
const legacy = { ...draft, schemaVersion: 1 };
delete legacy.order;
values.set("bodge-draft-v1", JSON.stringify(legacy));
assert.deepEqual(loadDraft()?.order, slots);
values.set("bodge-draft-v1", "{broken");
assert.equal(loadDraft(), null);
console.log("Interview bank, selection, question order, normalization, and draft recovery: passed");
