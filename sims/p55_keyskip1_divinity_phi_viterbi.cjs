"use strict";

// Keyskip1: one-key collision rejection (distinct from grid_keyskip2's
// pair-consuming j+=2 rule). Fixed source-selected keys only:
//   1. LP1/LP2 vocabulary key DIUINITY
//   2. solved-p56 prime-totient stream p_i - 1 mod 29
// Target: p57-selected 43 strict interiors on p55.
// Run from repository root: node sims/p55_keyskip1_divinity_phi_viterbi.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const qgram = new Map();
let qtotal = 0;
for (const line of read("resources/control/duko_round27_english_quadgrams.txt").trim().split("\n")) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (m) { const n = Number(m[2]); qgram.set(m[1], n); qtotal += n; }
}
assert.equal(qgram.size, 79495);

function parseWords(raw, pageCount = 55) {
  const segments = raw.split("%").slice(0, pageCount);
  const byStartPage = Array.from({length: segments.length}, () => []);
  let current = "", startPage = 0, page = 0;
  function finish() {
    if (current) { byStartPage[startPage].push([...current].map(r => corpus.runes.indexOf(r))); current = ""; }
  }
  for (const ch of segments.join("%")) {
    if (/[\u16A0-\u16FF]/u.test(ch)) {
      if (!current) startPage = page;
      current += ch;
    } else if (ch === "%") page++;
    else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line wraps do not terminate words.
    } else finish();
  }
  finish();
  return byStartPage;
}
function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}
const mod = x => (x % 29 + 29) % 29;
function scoreText(seq) {
  const letters = seq.map(x => corpus.translit[x]).join("");
  let score = 0;
  for (let i = 0; i + 3 < letters.length; i++) {
    const count = qgram.get(letters.slice(i, i + 4)) || 0.1;
    score += Math.log(count) - Math.log(qtotal);
  }
  const quadgrams = Math.max(0, letters.length - 3);
  return {letters, letterCount: letters.length, quadgrams,
    score, meanNatsPerQuadgram: score / Math.max(1, quadgrams)};
}

// Infer the source-calibrated rejection/lapse prior from all original LP2
// transitions, matching the repository's existing rejection-rate convention.
const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= 3);
const totalRunes = originalPages.reduce((s, p) => s + p.indices.length, 0);
const transitions = originalPages.reduce((s, p) => s + p.indices.length - 1, 0);
const doublets = originalPages.reduce((s, p) =>
  s + p.indices.slice(1).filter((x, i) => x === p.indices[i]).length, 0);
assert.equal(totalRunes, 12956);
assert.equal(transitions, 12901);
assert.equal(doublets, 86);
const q = 1 / 29;
const observedDoubletRate = doublets / transitions;
const suppression = (q - observedDoubletRate) / (q * (1 - observedDoubletRate));
const lapse = 1 - suppression;

const primes = firstPrimes(300);
const keyDefs = [
  {name: "DIUINITY repeating GP29", at: i => [23,10,1,10,9,10,16,26][i % 8], state: i => i % 8},
  {name: "p_i-1 mod29 (solved-p56 prime-totient stream)", at: i => (primes[i] - 1) % 29, state: i => i}
];

// If key K_j would emit the previous ciphertext rune, keyskip1 rejects K_j
// and emits with K_{j+1}. Given C_i and C_{i-1}, the skip branch is possible
// exactly when C_i-C_{i-1} = K_{j+1}-K_j (mod 29). No-skip remains a branch.
function viterbi(cipher, fPositions, literalMask, keyDef, scorePositions) {
  let states = new Map([["0|", {j: 0, suffix: "", score: 0, runes: [], skips: [], lapses: []}]]);
  let maxStates = 1;
  const prevCipher = cipher.map((c, i) => i ? cipher[i - 1] : null);
  const fBit = new Map(fPositions.map((p, b) => [p, b]));
  const scoreSet = new Set(scorePositions);

  for (let i = 0; i < cipher.length; i++) {
    const next = new Map();
    const c = cipher[i], bit = fBit.get(i);
    const literalF = bit !== undefined && (literalMask & (1 << bit));

    function add(st, plain, newJ, prior, isSkip, isLapse) {
      const token = scoreSet.has(i) ? corpus.translit[plain] : "";
      let suffix = st.suffix, score = st.score;
      for (const ch of token) {
        suffix += ch;
        if (suffix.length >= 4) {
          const gram = suffix.slice(-4);
          score += Math.log(qgram.get(gram) || 0.1) - Math.log(qtotal);
        }
      }
      suffix = suffix.slice(-3);
      const state = {
        j: newJ, suffix, score: score + prior,
        runes: scoreSet.has(i) ? st.runes.concat(plain) : st.runes,
        skips: isSkip ? st.skips.concat(i) : st.skips,
        lapses: isLapse ? st.lapses.concat(i) : st.lapses
      };
      // Future score depends only on key state and the last three output letters.
      const id = keyDef.state(newJ) + "|" + suffix;
      const old = next.get(id);
      if (!old || state.score > old.score) next.set(id, state);
    }

    for (const st of states.values()) {
      if (literalF) { add(st, 0, st.j, 0, false, false); continue; }
      const k0 = keyDef.at(st.j);
      const doublet = prevCipher[i] !== null && c === prevCipher[i];
      const collisionCandidate = prevCipher[i] !== null && !doublet &&
        mod(c - prevCipher[i]) === mod(keyDef.at(st.j + 1) - k0);
      if (collisionCandidate) {
        add(st, mod(c - k0), st.j + 1, Math.log(lapse), false, false);
        add(st, mod(c - keyDef.at(st.j + 1)), st.j + 2, Math.log(suppression), true, false);
      } else {
        add(st, mod(c - k0), st.j + 1, doublet ? Math.log(lapse) : 0, false, doublet);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
  }
  const ranked = [...states.values()].sort((a, b) => b.score - a.score);
  assert.ok(ranked.length);
  return {best: ranked[0], maxStates};
}

// Positive arithmetic controls: plant solved p57 text under each fixed key
// with the exact one-position collision rejection, then invert with the
// recorded skip schedule and verify every rejected candidate really collides.
function plantKeyskip1(plain, keyAt) {
  let j = 0, previous = null;
  const cipher = [], rejected = [];
  for (const p of plain) {
    let r = 0, c;
    do {
      c = mod(p + keyAt(j + r));
      if (previous !== null && c === previous) r++;
      else break;
      assert.ok(r < 20, "unexpected repeated-key collision loop");
    } while (true);
    cipher.push(c);
    rejected.push(r);
    j += r + 1;
    previous = c;
  }
  return {cipher, rejected};
}
function invertKnownSkipSchedule(cipher, rejected, keyAt) {
  let j = 0, previous = null;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const r = rejected[i], acceptedKey = keyAt(j + r);
    const p = mod(cipher[i] - acceptedKey);
    for (let t = 0; t < r; t++)
      assert.equal(mod(p + keyAt(j + t)), previous, "rejected draw must collide");
    assert.equal(mod(p + acceptedKey), cipher[i], "accepted draw must reproduce ciphertext");
    plain.push(p);
    j += r + 1;
    previous = cipher[i];
  }
  return plain;
}

const byStartPage = parseWords(transcription);
const words = byStartPage[54];
assert.equal(words.length, 16);
assert.deepEqual(words.map(w => w.length), [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(p55.length, 76);
assert.deepEqual(words.flat(), p55.slice(1)); // one incoming p54 carry
const inner = words.flatMap(w => w.slice(1, -1));
assert.equal(inner.length, 43);
const innerF = inner.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
const pageF = p55.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(innerF, [11]);
assert.deepEqual(pageF, [15,25,41]);
const innerLocal = [];
let offset = 1;
for (const word of words) {
  for (let j = 1; j < word.length - 1; j++) innerLocal.push(offset + j);
  offset += word.length;
}
assert.equal(offset, p55.length);
assert.equal(innerLocal.length, 43);

const p57Control = corpus.pages.find(p => p.page === 57).indices.slice(7, 50);
assert.equal(p57Control.length, 43);
const syntheticControls = keyDefs.map(kd => {
  const plant = plantKeyskip1(p57Control, kd.at);
  const recovered = invertKnownSkipSchedule(plant.cipher, plant.rejected, kd.at);
  assert.deepEqual(recovered, p57Control);
  return {key: kd.name, rejectedKeySymbols: plant.rejected.reduce((a, n) => a + n, 0),
    rejectedPositions: plant.rejected.map((n, i) => n ? i : -1).filter(i => i >= 0),
    exactRoundTrip: true};
});

const cases = [];
for (const keyDef of keyDefs) {
  // Remove circumferences before keying: two masks for the one interior F.
  for (let mask = 0; mask < (1 << innerF.length); mask++) {
    const result = viterbi(inner, innerF, mask, keyDef, inner.map((_, i) => i));
    const score = scoreText(result.best.runes);
    cases.push({
      key: keyDef.name, clock: "compacted interiors", mask,
      literalFPositions: innerF.filter((_, b) => mask & (1 << b)),
      maxStates: result.maxStates, ...score,
      skippedPositions: result.best.skips, observedDoubletLapses: result.best.lapses,
      outputGP: result.best.runes.map(x => corpus.translit[x]).join(" ")
    });
  }
  // Preserve original page-local key consumption through discarded boundaries.
  for (let mask = 0; mask < (1 << pageF.length); mask++) {
    const result = viterbi(p55, pageF, mask, keyDef, innerLocal);
    const score = scoreText(result.best.runes);
    cases.push({
      key: keyDef.name, clock: "original p55 page clock; score interiors only", mask,
      literalFPositions: pageF.filter((_, b) => mask & (1 << b)),
      maxStates: result.maxStates, ...score,
      skippedPositions: result.best.skips, observedDoubletLapses: result.best.lapses,
      outputGP: result.best.runes.map(x => corpus.translit[x]).join(" ")
    });
  }
}
cases.sort((a, b) => b.meanNatsPerQuadgram - a.meanNatsPerQuadgram);
const rawP55 = scoreText(inner);
const p57Score = scoreText(p57Control);
const summary = {
  model: "exact Viterbi/DP over key state × last-three-letter suffix, English quadgrams",
  rule: "one-key collision skip: reject K_j only when the hypothesized plaintext would make C_i equal C_(i-1), then use K_(j+1)",
  keyCandidates: keyDefs.map(k => k.name),
  sourceDoublets: {doublets, transitions, observedRate: observedDoubletRate, inferredSkipProbability: suppression, lapseProbability: lapse},
  p55: {pageRunes: p55.length, incomingCarry: 1, completeWords: words.length, strictInteriors: inner.length, interiorF: innerF, pageF, rawScore: rawP55},
  solvedP57SameLengthControl: p57Score,
  syntheticControls,
  testedCases: cases.length,
  bestOverall: cases[0],
  bestByKey: keyDefs.map(k => cases.filter(x => x.key === k.name).sort((a,b) => b.meanNatsPerQuadgram - a.meanNatsPerQuadgram)[0]),
  cases
};
console.log(JSON.stringify(summary, null, 2));
