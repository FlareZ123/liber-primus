"use strict";
/**
 * Source-constrained 812-cycle digraph substitution test.
 *
 * Inputs:
 *   u(x,y) = (y-x) + x*epsilon in GF(29)[epsilon]/(epsilon^2)
 *   g = 19 + 13*epsilon, source-derived from the p50 quotient chain.
 * The signed p15 matrix and p39 double root independently give the same
 * order 812. Test the full-ring action u -> g^(+/-s)u on all 841 ordered
 * rune pairs, not just the 812 units. Also test a running clock g^(s+t).
 *
 * Read-only Node 22/CommonJS SFT; no external dependencies or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const N = 29;
const ORDER = 812;
const mod = n => ((n % N) + N) % N;
const ringMul = (u, v) => [
  mod(u[0] * v[0]),
  mod(u[0] * v[1] + u[1] * v[0])
];
function ringPow(base, exponent) {
  let out = [1, 0];
  let factor = base;
  let n = exponent;
  while (n > 0) {
    if (n & 1) out = ringMul(out, factor);
    factor = ringMul(factor, factor);
    n = Math.floor(n / 2);
  }
  return out;
}
const g = [19, 13];
const powers = Array.from({ length: ORDER }, (_, i) => ringPow(g, i));
assert.equal(new Set(powers.map(x => x.join(","))).size, ORDER);
assert.deepEqual(ringPow(g, ORDER), [1, 0]);
assert.ok(Array.from({ length: ORDER - 1 }, (_, i) =>
  ringPow(g, i + 1).join(",")).every(x => x !== "1,0"));

function pairToRing(x, y) {
  return [mod(y - x), x];
}
function ringToPair(u) {
  return [u[1], mod(u[1] + u[0])];
}
function transformPair(x, y, multiplier) {
  return ringToPair(ringMul(pairToRing(x, y), multiplier));
}
function pairCycleLengths() {
  const seen = new Set();
  const lengths = [];
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      const first = x * N + y;
      if (seen.has(first)) continue;
      let pair = [x, y];
      let length = 0;
      while (!seen.has(pair[0] * N + pair[1])) {
        seen.add(pair[0] * N + pair[1]);
        pair = transformPair(pair[0], pair[1], g);
        length++;
      }
      lengths.push(length);
    }
  }
  return lengths.sort((a, b) => a - b);
}
const cycles = pairCycleLengths();
assert.deepEqual(cycles, [1, 28, 812]);

const pages = source.pages
  .filter(p => p.page < 56 && p.indices.length > 0)
  .map(p => p.indices);
const flat = pages.flat();
assert.equal(pages.length, 55);
assert.equal(flat.length, 12956);
const p57 = source.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
let withinPagePairs = 0;
let equalPairs = 0;
for (const page of pages) {
  for (let i = 1; i < page.length; i++) {
    withinPagePairs++;
    if (page[i] === page[i - 1]) equalPairs++;
  }
}
assert.equal(withinPagePairs, 12901);
assert.equal(equalPairs, 86);

let pairPhaseRoundTrips = 0;
for (let phase = 0; phase < ORDER; phase++) {
  const enc = powers[phase];
  const dec = powers[(ORDER - phase) % ORDER];
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      const c = transformPair(x, y, enc);
      const p = transformPair(c[0], c[1], dec);
      assert.deepEqual(p, [x, y]);
      pairPhaseRoundTrips++;
    }
  }
}
assert.equal(pairPhaseRoundTrips, ORDER * N * N);

function transformFrames(frames, offset, phase, running, resetClock, direction) {
  const out = [];
  let globalPairIndex = 0;
  for (const frame of frames) {
    const transformed = frame.slice();
    let localPairIndex = 0;
    for (let i = offset; i + 1 < frame.length; i += 2) {
      const t = resetClock ? localPairIndex : globalPairIndex;
      const exponent = running ? (phase + t) % ORDER : phase;
      const powerIndex = direction === "encrypt"
        ? exponent
        : (ORDER - exponent) % ORDER;
      const pair = transformPair(
        frame[i], frame[i + 1], powers[powerIndex]
      );
      transformed[i] = pair[0];
      transformed[i + 1] = pair[1];
      localPairIndex++;
      globalPairIndex++;
    }
    out.push(...transformed);
  }
  return out;
}
function ioc(a) {
  const hist = Array(N).fill(0);
  for (const v of a) hist[v]++;
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) /
    (a.length * (a.length - 1));
}
const modes = [
  { name: "fixed-global-offset0", frames: [flat], offset: 0, running: false, reset: false },
  { name: "fixed-global-offset1", frames: [flat], offset: 1, running: false, reset: false },
  { name: "fixed-page-local-offset0", frames: pages, offset: 0, running: false, reset: true },
  { name: "fixed-page-local-offset1", frames: pages, offset: 1, running: false, reset: true },
  { name: "running-global-offset0", frames: [flat], offset: 0, running: true, reset: false },
  { name: "running-global-offset1", frames: [flat], offset: 1, running: true, reset: false },
  { name: "running-page-reset-offset0", frames: pages, offset: 0, running: true, reset: true },
  { name: "running-page-reset-offset1", frames: pages, offset: 1, running: true, reset: true },
  { name: "running-page-continuous-offset0", frames: pages, offset: 0, running: true, reset: false },
  { name: "running-page-continuous-offset1", frames: pages, offset: 1, running: true, reset: false }
];

let p57RoundTrips = 0;
for (const mode of modes) {
  for (let phase = 0; phase < ORDER; phase++) {
    const encrypted = transformFrames(
      [p57], mode.offset, phase, mode.running, mode.reset, "encrypt"
    );
    const decrypted = transformFrames(
      [encrypted], mode.offset, phase, mode.running, mode.reset, "decrypt"
    );
    assert.deepEqual(decrypted, p57);
    p57RoundTrips++;
  }
}
assert.equal(p57RoundTrips, ORDER * modes.length);

const modeResults = [];
for (const mode of modes) {
  let best = null;
  let worst = null;
  let scoreSum = 0;
  let above050 = 0;
  for (let phase = 0; phase < ORDER; phase++) {
    const decoded = transformFrames(
      mode.frames, mode.offset, phase, mode.running, mode.reset, "decrypt"
    );
    const score = ioc(decoded);
    scoreSum += score;
    if (score >= 0.05) above050++;
    if (best === null || score > best.score) best = { phase, score, decoded };
    if (worst === null || score < worst.score) worst = { phase, score };
  }
  modeResults.push({
    mode: mode.name,
    max_ioc: best.score,
    max_phase: best.phase,
    mean_ioc: scoreSum / ORDER,
    min_ioc: worst.score,
    min_phase: worst.phase,
    phases_ioc_at_least_0_05: above050,
    output_runes: best.decoded.length,
    best_prefix_120: best.decoded.slice(0, 120)
      .map(i => source.translit[i]).join("")
  });
}
const originalIoc = ioc(flat);
const p57Ioc = ioc(p57);
console.log(JSON.stringify({
  model: "full-ring dual-number 812-cycle digraph substitution",
  pair_embedding: "u(x,y)=(y-x)+x*epsilon",
  ring: "GF(29)[epsilon]/(epsilon^2)",
  generator: "19+13*epsilon",
  generator_order: ORDER,
  full_pair_state_cycle_lengths: cycles,
  original: {
    rune_pages: pages.length,
    rune_count: flat.length,
    within_page_pairs: withinPagePairs,
    equal_pairs: equalPairs,
    unequal_pairs: withinPagePairs - equalPairs,
    ioc: originalIoc
  },
  solved_p57_ioc: p57Ioc,
  exhaustive_pair_phase_roundtrips: pairPhaseRoundTrips,
  solved_p57_roundtrips: p57RoundTrips,
  candidates_tested: ORDER * modes.length,
  mode_results: modeResults,
  verdict: "No tested fixed-phase or 812-step running pair-action framing yields native-GP plaintext."
}, null, 2));
