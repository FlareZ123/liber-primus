"use strict";
/**
 * Original-clue-frozen 6395-rune Kasiski phase-equality gate.
 * Windows 11: node sims/lp2_p27_p55_exact6395_allsecret_period_sft.cjs
 *
 * A p27 printed DJU-BEI two-word ciphertext phrase recurs unchanged at the
 * end of p55, source offset positions 28 and 70 respectively. Their absolute
 * book-local starting positions differ by exactly 6395, outside the earlier
 * all-secret test's <=6000 whole-book lag range. Here period 6395 is fixed
 * by that exact source glyph match, before any English control is sampled.
 *
 * For ANY invertible substitution table (one arbitrary 29! per phase) at
 * a book-continuous 6395-clock, C[i] == C[i-6395] iff
 * P[i] == P[i-6395]. This invariant needs no key guess or language score.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const db = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = db.pages.slice(0, 56);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);

const start27 = pages.slice(0, 27).reduce((n, p) => n + p.indices.length, 0);
const start55 = pages.slice(0, 55).reduce((n, p) => n + p.indices.length, 0);
const a = start27 + 28;
const b = start55 + 70;
const period = b - a;
assert.equal(a, 6555);
assert.equal(b, 12950);
assert.equal(period, 6395);
assert.deepEqual(cipher.slice(a, a + 6), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(cipher.slice(b, b + 6), cipher.slice(a, a + 6));
assert.equal(db.pages[56].indices[0], cipher[a + 6]);

/** @param {number[]} tape @returns {{equal:number,pairs:number,rate:number}} */
function collisions(tape) {
  let equal = 0;
  for (let i = period; i < tape.length; i++) {
    if (tape[i] === tape[i - period]) equal++;
  }
  const pairs = tape.length - period;
  return { equal, pairs, rate: equal / pairs };
}
const original = collisions(cipher);
assert.equal(original.equal, 199);
assert.equal(original.pairs, 6561);
const minusKnownClone = {
  equal: original.equal - 6,
  pairs: original.pairs - 6,
  rate: (original.equal - 6) / (original.pairs - 6)
};

const gp = db.translit.map((token, index) => ({token,index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function tokenize(text) {
  const result = [];
  for (const src of text.match(/[A-Za-z]+/g) || []) {
    const word = src.toUpperCase().replace(/[VKZQ]/g, (c) =>
      ({V:"U", K:"C", Z:"S", Q:"C"})[c]);
    for (let i = 0; i < word.length;) {
      const found = gp.find((t) => word.startsWith(t.token, i));
      assert(found, "Unsupported source orthography " + word.slice(i));
      result.push(found.index);
      i += found.token.length;
    }
  }
  return result;
}
const sources = [
  ["shakespeare", tokenize(read("resources/control/shakespeare_first300k.txt"))],
  ["gibran", tokenize(read("resources/control/gibran_prophet_58585.txt"))],
  ["emerson", tokenize(read("resources/control/emerson_essays.txt"))]
];
// Ten source-text offsets are independent of the ciphertext and model outputs.
const samples = [
  ...Array.from({length:5}, (_,i) => ["shakespeare", 20000 + 36000*i]),
  ...Array.from({length:5}, (_,i) => ["gibran", 1000 + 10000*i]),
  ...Array.from({length:5}, (_,i) => ["emerson", 5000 + 45000*i])
];
const controls = samples.map(([source, start]) => {
  const data = sources.find(([name]) => name === source)[1];
  const values = data.slice(start, start + cipher.length);
  assert.equal(values.length, cipher.length, source + "/" + start);
  return { source, start, values, ...collisions(values) };
});
assert.equal(controls.length, 15);
assert(controls.every((r) => r.equal > original.equal), "original not below every control");

// One real positive verifies the full difficult hypothesis under ALL unknown
// phase secrets (6395 independently secret and arbitrary 29-way bijections).
let state = 0x33011337;
/** @returns {number} */
function rand32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const tables = Array.from({length:period}, () => {
  const perm = Array.from({length:29},(_,i)=>i);
  for (let i=28;i>0;i--) {
    const j=rand32()%(i+1);
    [perm[i],perm[j]]=[perm[j],perm[i]];
  }
  return perm;
});
const inverses = tables.map((perm) => {
  const inv = Array(29);
  perm.forEach((v,i)=>{inv[v]=i;});
  return inv;
});
const plant = controls[0].values;
const encrypted = plant.map((p,i)=>tables[i%period][p]);
const recovered = encrypted.map((c,i)=>inverses[i%period][c]);
assert.deepEqual(recovered,plant);
assert.deepEqual(collisions(encrypted),collisions(plant));
assert(controls.every((r)=>r.equal>=350)); // source-native margin is substantial

const ranked = [...controls].sort((x,y)=>x.equal-y.equal);
console.log(JSON.stringify({
  originalSource: "LP2 p27 offset28 DJU-BEI = p55 offset70 DJU-BEI",
  sourceOriginalAbsolutePositions:[a,b],
  exactBookContinuousPeriod:period,
  previouslyExaminedWholeBookPeriods:"1-6000; this is a source-fixed out-of-range candidate",
  unchangedOriginalRungs:cipher.length,
  original,
  originalExcludingSixObservedForcedMatches:minusKnownClone,
  nativeControlCases:controls.length,
  nativeEqualCountMinimum:ranked[0].equal,
  nativeEqualCountMaximum:ranked.at(-1).equal,
  closestNative:{
    source:ranked[0].source,start:ranked[0].start,...collisions(ranked[0].values)
  },
  casesWithEqualAtOrBelowOriginal:controls.filter(r=>r.equal<=original.equal).length,
  exactSecret6395PhasePlant:recovered.length,
  result:"A book-wide, per-phase arbitrary secret GP29 bijection of period 6395 cannot explain ordinary native-GP English at the exact clue-selected lag. The six-rune repeat is a local exception, not whole-book periodic key evidence; no unknown plaintext/key."
},null,2));
