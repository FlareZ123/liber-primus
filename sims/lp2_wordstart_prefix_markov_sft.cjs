"use strict";

/**
 * SFT: original LP2 printed-word English-prefix anomaly under transition-preserving nulls.
 * Usage on Windows 11: node sims/lp2_wordstart_prefix_markov_sft.cjs
 * No packages, network, subprocesses, or file writes.
 * The source-attested 29-rune GP orthography is used exactly as stored.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(DATA, "lp2-corpus.json"), "utf8"));
const originalText = fs.readFileSync(path.join(ROOT, "resources", "transcriptions", "lp2-image-corrected.txt"), "utf8");
const dictionary = fs.readFileSync(path.join(ROOT, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpIndex = new Map(corpus.translit.map((name, i) => [name, i]));
const manuscript = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const visiblePages = originalText.trim().split("%");
const pages = [];
const words = [];
let current = [];
let after = false;
let followsPeriod = false;
let periods = 0;

function flushWord() {
  if (current.length) {
    words.push({ slots: current.slice(0, 6), length: current.length, after });
    current = [];
  }
}
for (let p = 0; p < 55; p++) {
  const arr = [];
  for (const ch of visiblePages[p]) {
    if (runeIndex.has(ch)) {
      if (!current.length) {
        after = followsPeriod;
        followsPeriod = false;
      }
      current.push([p, arr.length]);
      arr.push(runeIndex.get(ch));
    } else if ("/ \n\r\t".includes(ch)) {
      continue;
    } else {
      flushWord();
      if (ch === ".") {
        periods++;
        followsPeriod = true;
      }
    }
  }
  assert.deepEqual(arr, manuscript[p].indices, "source images/transcription must agree");
  pages.push(arr);
}
flushWord();
assert.equal(manuscript.length, 55);
assert.equal(pages.flat().length, 12956);
assert.equal(words.length, 2896);
assert.equal(periods, 173);
assert.equal(words.filter((w) => w.after).length, 172);

const longTokens = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
const prefixLengths = [3, 4, 5, 6];
const thresholds = [1, 2, 5, 10, 20, 50, 100, 500];
const prefixes = new Map(prefixLengths.map((k) => [k, new Set()]));
const completions = thresholds.map(() => new Map());
const lexiconCounts = thresholds.map(() => 0);
let wordTypes = 0;
for (const line of dictionary.split("\n")) {
  const match = /^([A-Za-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const text = match[1].toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const values = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (longTokens.has(pair)) {
      values.push(gpIndex.get(pair));
      i += 2;
    } else {
      const value = gpIndex.get(text[i]);
      if (value === undefined) {
        values.length = 0;
        break;
      }
      values.push(value);
      i++;
    }
  }
  if (values.length >= 3) {
    wordTypes++;
    for (const k of prefixLengths) {
      if (values.length >= k) prefixes.get(k).add(values.slice(0, k).join(","));
    }
  }
  if (values.length < 4) continue;
  const key = values.slice(0, 3).join(",");
  for (let t = 0; t < thresholds.length; t++) {
    if (Number(match[2]) < thresholds[t]) continue;
    lexiconCounts[t]++;
    if (!completions[t].has(key)) completions[t].set(key, new Set());
    completions[t].get(key).add(values[3]);
  }
}
assert.equal(wordTypes, 28941);
assert.deepEqual(prefixLengths.map((k) => prefixes.get(k).size), [2479, 7612, 11956, 13291]);

function prefixSummary(shuffledPages) {
  const results = { n3: 0, n4: 0, n5: 0, n6: 0, post4: 0, allmax: 0 };
  for (const word of words) {
    const first = word.slots.map(([p, i]) => shuffledPages[p][i]);
    for (const k of prefixLengths) {
      if (word.length >= k && prefixes.get(k).has(first.slice(0, k).join(","))) {
        results["n" + k]++;
        results.allmax = Math.max(results.allmax, k);
        if (k === 4 && word.after) results.post4++;
      }
    }
  }
  return results;
}
const observed = prefixSummary(pages);
assert.deepEqual(observed, { n3: 252, n4: 27, n5: 1, n6: 1, post4: 4, allmax: 6 });
console.log("original", JSON.stringify({ runes: 12956, words: words.length, periods, observed }));

/** @param {number} initial */
function randomGenerator(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const edgeLists = pages.map((page) => {
  const outgoing = Array.from({ length: 29 }, () => []);
  for (let i = 1; i < page.length; i++) outgoing[page[i - 1]].push(page[i]);
  return outgoing;
});

/**
 * Return another Euler trail with exactly the original within-page
 * 29x29 ordered transition counts, initial/terminal glyph and rune count.
 * Randomized outgoing-edge order followed by iterative Hierholzer.
 */
function randomTrail(page, edges, random) {
  const outgoing = edges.map((xs) => xs.slice());
  for (const row of outgoing) {
    for (let i = row.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
  }
  const stack = [page[0]];
  const sequence = [];
  while (stack.length) {
    const v = stack[stack.length - 1];
    if (outgoing[v].length) stack.push(outgoing[v].pop());
    else sequence.push(stack.pop());
  }
  sequence.reverse();
  assert.equal(sequence.length, page.length);
  assert.equal(sequence[0], page[0]);
  assert.equal(sequence.at(-1), page.at(-1));
  return sequence;
}
const firstRandom = randomGenerator(0x33013279);
const CONTROL_REPS = 1200;
const controlCounts = { n3: [], n4: [], n5: [], n6: [], post4: [], allmax: [] };
for (let repeat = 0; repeat < CONTROL_REPS; repeat++) {
  const shuffled = pages.map((p, i) => randomTrail(p, edgeLists[i], firstRandom));
  const trial = prefixSummary(shuffled);
  for (const key of Object.keys(controlCounts)) controlCounts[key].push(trial[key]);
}
const trailSummary = {};
for (const [key, values] of Object.entries(controlCounts)) {
  const mean = values.reduce((a, b) => a + b, 0) / CONTROL_REPS;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / CONTROL_REPS);
  const ge = values.filter((x) => x >= observed[key]).length;
  trailSummary[key] = { observed: observed[key], mean, sd, ge, p: (ge + 1) / (CONTROL_REPS + 1) };
}
assert.equal(trailSummary.n4.ge, 23);
assert.equal(trailSummary.n6.ge, 19);
console.log("exact-transition Euler-trail null", JSON.stringify(trailSummary));

const transition = Array.from({ length: 29 }, () => new Float64Array(29));
for (const page of pages) {
  for (let i = 1; i < page.length; i++) transition[page[i - 1]][page[i]]++;
}
const conditional = transition.map((row) => {
  const n = row.reduce((a, b) => a + b, 0);
  return Array.from(row, (x) => x / n);
});
const candidates = words.filter((w) => w.length >= 4).map((w) => {
  const values = w.slots.slice(0, 4).map(([p, i]) => pages[p][i]);
  return { key: values.slice(0, 3).join(","), previous: values[2], fourth: values[3] };
});
assert.equal(candidates.length, 1645);

/** Independent Bernoulli upper tail at a fixed observed count. */
function upperTail(probabilities, count) {
  const distribution = new Float64Array(probabilities.length + 1);
  distribution[0] = 1;
  for (let i = 0; i < probabilities.length; i++) {
    const p = probabilities[i];
    for (let j = i + 1; j >= 1; j--) {
      distribution[j] = distribution[j] * (1 - p) + distribution[j - 1] * p;
    }
    distribution[0] *= (1 - p);
  }
  return distribution.slice(count).reduce((a, b) => a + b, 0);
}
const conditioned = thresholds.map((threshold, t) => {
  let count = 0, mean = 0, variance = 0, eligible = 0;
  const probabilities = [];
  for (const x of candidates) {
    const options = completions[t].get(x.key);
    if (!options) continue;
    eligible++;
    let p = 0;
    for (const v of options) p += conditional[x.previous][v];
    probabilities.push(p);
    mean += p;
    variance += p * (1 - p);
    if (options.has(x.fourth)) count++;
  }
  return { threshold, lexiconWords: lexiconCounts[t], observed: count, expected: mean,
    sd: Math.sqrt(variance), z: (count - mean) / Math.sqrt(variance),
    exactUpperTail: upperTail(probabilities, count), eligible };
});
assert.deepEqual(conditioned.map((x) => x.observed), [27, 21, 12, 10, 7, 5, 5, 2]);
const maxZ = Math.max(...conditioned.map((x) => x.z));
const random = randomGenerator(0x3301009e);
const draws = 20000;
const candidateOptions = candidates.map((x) => completions.map((m) => m.get(x.key)));
const candidateProb = candidates.map((x) => conditional[x.previous]);
let familyGe = 0;
for (let rep = 0; rep < draws; rep++) {
  const hits = Array(thresholds.length).fill(0);
  for (let j = 0; j < candidates.length; j++) {
    const row = candidateProb[j];
    const u = random() / 4294967296;
    let sum = 0, symbol = 28;
    for (let k = 0; k < 29; k++) {
      sum += row[k];
      if (u < sum) { symbol = k; break; }
    }
    for (let t = 0; t < thresholds.length; t++) {
      if (candidateOptions[j][t]?.has(symbol)) hits[t]++;
    }
  }
  let bestZ = -Infinity;
  for (let t = 0; t < thresholds.length; t++) {
    bestZ = Math.max(bestZ, (hits[t] - conditioned[t].expected) / conditioned[t].sd);
  }
  if (bestZ >= maxZ) familyGe++;
}
const familyP = (familyGe + 1) / (draws + 1);
assert.equal(familyGe, 1545);
console.log("first-3-frozen threshold scan", JSON.stringify({
  candidates: candidates.length, seed: "0x3301009e", draws, conditioned, maxZ, familyGe, familyP
}));
assert(familyP > 0.07 && familyP < 0.08);
console.log("PASS: source original, conditional nulls and limited familywise scan reproduced");
