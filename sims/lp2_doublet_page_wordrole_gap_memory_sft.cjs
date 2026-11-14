"use strict";
/**
 * Original LP2 repeated-rune gap dependence after conditioning on every
 * physical page's repeat count and on every repeated rune's word role.
 *
 * SOURCE: canonical 55 unknown rune-bearing LP2 pages and the exact 2,896
 * printed words (including page-carried words). All 86 repeat events are
 * measured on second-rune positions within a physical page.
 *
 * HYPOTHESIS: page-local, role-local independent placements of the observed
 * same-symbol transition events. Conditional Monte Carlo preserves the
 * complete page x (word-start, word-end, interior) event count matrix.
 * A second null excludes adjacent events, as the source has no AAA triples.
 *
 * This tests a finite site-placement model, NOT an original ciphertext
 * decoder, and does not recover plaintext or prove a historical state rule.
 *
 * SFT (Windows / Node.js 22):
 *   node sims/lp2_doublet_page_wordrole_gap_memory_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const unknown = gp.pages.filter(p => p.page < 56 && p.indices.length);
const sourceParts = transcript.split("%").slice(0, 55);
assert.equal(sourceParts.length, 55);
assert.equal(unknown.length, 55);

const glyphIndex = new Map(gp.runes.map((ch, i) => [ch, i]));
const isRune = ch => /[\u16a0-\u16ff]/u.test(ch);
const wordRuns = [];
let word = [];
const sourceRunes = [];
for (const ch of sourceParts.join("%")) {
  if (isRune(ch)) {
    assert(glyphIndex.has(ch));
    word.push(sourceRunes.length);
    sourceRunes.push(glyphIndex.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Physical lines/pages do not end words in the source transcription.
  } else if (word.length) {
    wordRuns.push(word);
    word = [];
  }
}
if (word.length) wordRuns.push(word);
assert.equal(wordRuns.length, 2896);
assert.equal(sourceRunes.length, 12956);
assert.deepEqual(sourceRunes, unknown.flatMap(p => p.indices));

const roles = Array(sourceRunes.length).fill("interior");
for (const w of wordRuns) {
  roles[w[0]] = "start";
  if (w.length > 1) roles[w[w.length - 1]] = "end";
}

/** @type {Array<{page:number,role:string,slots:number[],k:number}>} */
const groups = [];
/** @type {number[]} */
const events = [];
let offset = 0;
for (const page of unknown) {
  const slots = {start:[], end:[], interior:[]};
  const counts = {start:0, end:0, interior:0};
  for (let i = 1; i < page.indices.length; i++) {
    const pos = offset + i;
    const role = roles[pos];
    slots[role].push(pos);
    if (page.indices[i] === page.indices[i-1]) {
      events.push(pos);
      counts[role]++;
    }
  }
  for (const role of ["start", "end", "interior"]) {
    if (counts[role]) groups.push({
      page:page.page, role, slots:slots[role], k:counts[role]});
  }
  offset += page.indices.length;
}
assert.equal(events.length, 86);
assert.equal(offset, 12956);
assert(events.every((p, i) => i === 0 || p > events[i-1] + 1),
  "actual original no triple-repeated-rune positions");
const roleCounts = Object.fromEntries(["start","end","interior"].map(role =>
  [role, groups.filter(g => g.role === role).reduce((s,g) => s + g.k, 0)]));
assert.deepEqual(roleCounts, {start:23, end:19, interior:44});

/**
 * Pearson correlation of consecutive event gaps. A gap is the difference
 * between consecutive SECOND-rune event positions, so an offset of +1 or
 * -1 applied to every event would not change the statistic.
 * @param {number[]} gap
 * @returns {number}
 */
function lagOneCorrelation(gap) {
  const n = gap.length - 1;
  let a = 0, b = 0;
  for (let i = 0; i < n; i++) {
    a += gap[i]; b += gap[i+1];
  }
  a /= n;
  b /= n;
  let aa = 0, bb = 0, ab = 0;
  for (let i = 0; i < n; i++) {
    const x = gap[i] - a, y = gap[i+1] - b;
    aa += x*x; bb += y*y; ab += x*y;
  }
  return ab / Math.sqrt(aa * bb);
}

/** @param {number[]} positions @returns {number[]} */
const gaps = positions => positions.slice(1).map((x,i) => x-positions[i]);
const observed = lagOneCorrelation(gaps(events));
assert(Math.abs(observed - 0.38001968924100965) < 1e-12);

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}

/**
 * Exactly preserve all original page-by-word-role event counts.
 * Optional additional constraint forbids immediately neighboring events,
 * matching the source's absence of three identical adjacent runes.
 * @param {number} n
 * @param {number} seed
 * @param {boolean} forbidAdjacent
 */
function conditionedNull(n, seed, forbidAdjacent) {
  const next = xorshift32(seed);
  const values = [];
  const selected = new Set();
  let rejectedProposals = 0;
  for (let trial = 0; trial < n; trial++) {
    let sample = [];
    let accepted = false;
    for (let attempt = 0; attempt < 500 && !accepted; attempt++) {
      selected.clear();
      sample = [];
      for (const gr of groups) {
        let k = 0;
        while (k < gr.k) {
          const candidate = gr.slots[next() % gr.slots.length];
          if (!selected.has(candidate)) {
            selected.add(candidate);
            sample.push(candidate);
            k++;
          }
        }
      }
      sample.sort((a,b) => a-b);
      accepted = !forbidAdjacent ||
        sample.every((value, i) => i === 0 || value > sample[i-1] + 1);
      if (!accepted) rejectedProposals++;
    }
    assert(accepted, "conditional sample acceptance exceeded 500 attempts");
    assert.equal(sample.length, events.length);
    values.push(lagOneCorrelation(gaps(sample)));
  }
  const greaterOrEqual = values.filter(x => x >= observed).length;
  const mean = values.reduce((s,x) => s+x, 0) / n;
  const sd = Math.sqrt(values.reduce((s,x) => s + (x-mean)**2, 0) / n);
  values.sort((a,b) => a-b);
  return {
    n, mean, sd, observed, greaterOrEqual,
    upperTailAddOne:(greaterOrEqual + 1)/(n + 1),
    q99: values[Math.floor(0.99*n)],
    rejectedProposals
  };
}

const plain = conditionedNull(30000, 0x534227, false);
const noTriples = conditionedNull(30000, 0x534228, true);
assert.equal(plain.greaterOrEqual, 147);
assert.equal(noTriples.greaterOrEqual, 135);
assert(plain.upperTailAddOne < 0.01);
assert(noTriples.upperTailAddOne < 0.01);
assert(plain.mean > 0.20 && plain.mean < 0.25);
assert(noTriples.mean > 0.20 && noTriples.mean < 0.25);
console.log(JSON.stringify({
  source: "12956 authentic unsolved GP29 runes / 55 physical pages",
  sourcePrintedWords:wordRuns.length,
  sourceRepeatEvents:events.length,
  sourceNoTripleRepeats:true,
  sourceWordRoleCounts:roleCounts,
  hypothesis: "iid position placement conditional on page x word-role event counts",
  observedGapLagOne:observed,
  conditionalPageAndRole:plain,
  conditionalPageRoleAndNoTriple:noTriples,
  decision: "residual positive gap dependence under these conditioned site nulls; no recovered cipher/key/plaintext"
}, null, 2));
