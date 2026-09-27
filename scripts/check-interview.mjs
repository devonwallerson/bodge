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
const { bank, slots, selectQuestions, startDraft, normalizeAnswers, saveDraft, loadDraft } = module.exports;

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};

assert.equal(bank.length, 50);
assert.equal(new Set(bank.map(question => question.id)).size, 50);
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

const draft = startDraft();
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
values.set("bodge-draft-v1", "{broken");
assert.equal(loadDraft(), null);
console.log("Interview bank, selection, normalization, and draft recovery: passed");
