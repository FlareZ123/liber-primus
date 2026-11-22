'use strict';
/**
 * Original-source word-clock feedback alphabet capacity, all-secret exact test.
 * Node.js CommonJS, standalone, using the canonical repository resources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const original = JSON.parse(read('lp2-corpus.json'));
const transcript = read('lp2-transcription.txt');
const alphabet = new Map(original.runes.map((r, index) => [r, index]));
const pages = original.pages.filter((p) => p.indices.length > 0);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
/** @param {number} page */
function chapter(page) {
  return chapters.findIndex(([a, b]) => page >= a && page <= b);
}
/** @type {Array<{page:number,offset:number,cipher:number,prior:number,wordStart:boolean,wordPosition:number,wordLength:number}>} */
const observations = [];
let pageSlot = 0, localOffset = 0, prior = -1, pending = [], wordCount = 0;
function closeWord() {
  if (pending.length === 0) return;
  for (const index of pending) observations[index].wordLength = pending.length;
  pending = [];
  wordCount += 1;
}
for (const ch of transcript) {
  if (ch === '%') {
    pageSlot += 1;
    localOffset = 0; // Do not break an incomplete word at page boundaries.
  } else if (alphabet.has(ch)) {
    assert.ok(pageSlot < pages.length);
    const cipher = alphabet.get(ch);
    observations.push({
      page: pages[pageSlot].page, offset: localOffset,
      cipher, prior, wordStart: pending.length === 0,
      wordPosition: pending.length, wordLength: -1,
    });
    pending.push(observations.length - 1);
    prior = cipher;
    localOffset += 1;
  } else if ('-.&$'.includes(ch)) closeWord();
}
closeWord();
assert.equal(pageSlot + 1, pages.length);
assert.equal(observations.length, 13136);
assert.equal(wordCount, 2941);
for (const p of pages) {
  const actual = observations.filter((r) => r.page === p.page).map((r) => r.cipher);
  assert.deepEqual(actual, p.indices, 'p' + p.page + ': original-source mismatch');
}
assert.equal(observations.filter((r) => r.page <= 55).length, 12956);
/**
 * @param {string} name
 * @param {(r: typeof observations[number]) => string} stateKey
 */
function study(name, stateKey) {
  /** @type {Map<string,Set<number>>} */
  const sets = new Map();
  for (const r of observations) {
    if (r.page > 55 || r.prior === -1) continue;
    const key = stateKey(r);
    if (!sets.has(key)) sets.set(key, new Set());
    sets.get(key).add(r.cipher);
  }
  const counts = [...sets.values()].map((s) => s.size);
  return {
    name, sets, states: sets.size,
    maximum: Math.max(...counts),
    moreThan26: counts.filter((n) => n > 26).length,
    moreThan16: counts.filter((n) => n > 16).length,
  };
}
const tests = [
  study('chapter+prior', (r) => [chapter(r.page),r.prior].join('|')),
  study('chapter+prior+wordStart', (r) => [chapter(r.page),r.prior,Number(r.wordStart)].join('|')),
  study('chapter+prior+positionParity', (r) => [chapter(r.page),r.prior,r.wordPosition%2].join('|')),
  study('chapter+prior+lengthParity', (r) => [chapter(r.page),r.prior,r.wordLength%2].join('|')),
  study('chapter+prior+start+end', (r) => [chapter(r.page),r.prior,Number(r.wordStart),Number(r.wordPosition===r.wordLength-1)].join('|')),
  study('page+prior', (r) => [r.page,r.prior].join('|')),
  study('chapter+prior+positionBucket', (r) => [chapter(r.page),r.prior,Math.min(3,r.wordPosition)].join('|')),
];
assert.deepEqual(tests.map((t) => [t.maximum,t.moreThan26]), [
  [29,44], [29,20], [28,3], [27,3], [28,7], [15,0], [26,0]
]);
const witness = observations.filter((r) =>
  chapter(r.page) === 7 && r.prior === 18 && !r.wordStart);
assert.equal(witness.length, 91);
const first = new Map();
for (const r of witness) if (!first.has(r.cipher)) first.set(r.cipher, [r.page,r.offset]);
assert.deepEqual([...first.keys()].sort((a,b)=>a-b), [...Array(29).keys()]);
assert.equal(tests[1].sets.get('7|18|0').size, 29);
// A 29-symbol, prior-ciphertext and word-start dependent additive plant
// reconstructs the native original register exactly (implementation control).
const mod29 = (x) => ((x%29)+29)%29;
const key = (r,previous) => mod29(7*chapter(r.page)+3*Math.max(0,previous)+(r.wordStart?11:0));
const planted = [];
let feedback=-1;
for (const r of observations) {
  const c=mod29(r.cipher+key(r,feedback));
  planted.push(c);
  feedback=c;
}
const recovered=[];
feedback=-1;
for(let i=0;i<observations.length;i++) {
  recovered.push(mod29(planted[i]-key(observations[i],feedback)));
  feedback=planted[i];
}
assert.deepEqual(recovered,observations.map((r)=>r.cipher));
console.log('PASS 13136 original rune/control positions, 2941 words, all-secret cardinality');
console.log(JSON.stringify({
  witness: {state:'chapter7|previous18|wordStart0',occurrences:witness.length,
    successorLocations:[...first.entries()].sort((a,b)=>a[0]-b[0])},
  counts:tests.map(({name,states,maximum,moreThan26,moreThan16})=>
    ({name,states,maximum,moreThan26,moreThan16}))
},null,2));
