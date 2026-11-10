'use strict';
/**
 * Conditional EA-zero-step model with cumulative plaintext-sum feedback.
 *
 * Let 15 be the F29 primitive root and r_i = log_15(C[i]-C[i-1]) mod 28.
 * For a noninitial rune:
 *   P_i = EA (28) if the ciphertext difference is zero;
 *   otherwise P_i = r_i + sign*K_i mod 28.
 * The state is a Gematria accumulator:
 *   K_(i+1) = K_i + P_i mod 28.
 * Since EA is index 28 == 0 mod 28, a zero-step marker leaves the state fixed.
 *
 * Page initials use P_0 = C_0 + sign*K_0 mod 29. Exhaust all 28 phases,
 * both signs, and global/page/section/word resets. This is a finite test.
 *
 * Node.js 22, no external packages:
 *   node sims/ea_cumulative_plaintext_sum.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const master = read('resources/liber-primus/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const mod29 = x => ((x % 29) + 29) % 29;
const mod28 = x => ((x % 28) + 28) % 28;
const Q = 28, START = 29, END = 30, N = 31;

function originalInput() {
  const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
  const pageSegments = master.split('%');
  const pages = [];
  let active = false, sectionId = 0;
  for (const p of corpus.pages.filter(p => p.page < 56 && p.runic_count > 0)) {
    const raw = pageSegments[p.page >= 51 ? p.page - 1 : p.page];
    assert.notEqual(raw, undefined, 'Missing physical page segment ' + p.page);
    const xs = [], starts = [], ends = [], sectionIds = [];
    for (const ch of raw) {
      if (runeMap.has(ch)) {
        xs.push(runeMap.get(ch));
        starts.push(!active);
        ends.push(false);
        sectionIds.push(sectionId);
        active = true;
      } else if ('-.$&§'.includes(ch)) {
        if (ends.length) ends[ends.length - 1] = true;
        active = false;
        if (ch === '$') sectionId++;
      }
    }
    assert.deepEqual(xs, p.indices, 'Original transcription mismatch on page ' + p.page);
    pages.push({page: p.page, xs, starts, ends, sectionIds});
  }
  const xs = pages.flatMap(p => p.xs);
  const starts = pages.flatMap(p => p.starts);
  const ends = pages.flatMap(p => p.ends);
  const sectionIds = pages.flatMap(p => p.sectionIds);
  const pageStarts = [];
  let pos = 0;
  for (const p of pages) { pageStarts.push(pos); pos += p.xs.length; }
  const markerPositions = [];
  let offset = 0;
  for (const p of pages) {
    for (let i = 1; i < p.xs.length; i++)
      if (p.xs[i] === p.xs[i - 1]) markerPositions.push(offset + i);
    offset += p.xs.length;
  }
  assert.equal(pages.length, 55);
  assert.equal(xs.length, 12956);
  assert.equal(starts.filter(Boolean).length, 2896);
  assert.equal(ends.filter(Boolean).length, 2896);
  assert.equal(Math.max(...sectionIds) + 1, 8);
  assert.equal(markerPositions.length, 86);
  return {pages, xs, starts, ends, sectionIds, pageStarts, markerPositions};
}

function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = corpus.translit.indexOf(s.slice(i, i + 2));
    if (digraph >= 0) { out.push(digraph); i += 2; }
    else {
      const one = corpus.translit.indexOf(s[i]);
      assert.notEqual(one, -1, 'Unmapped GP source letter: ' + s[i]);
      out.push(one);
      i++;
    }
  }
  return out;
}
function encodeText(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(encodeWord);
}

function train(words) {
  const h3 = new Float64Array(N * N * N);
  const ctx3 = new Float64Array(N * N);
  const bi = new Float64Array(N * N);
  const ctx2 = new Float64Array(N);
  const uni = new Float64Array(N);
  for (const word of words) {
    let a = START, b = START;
    for (const c of [...word, END]) {
      h3[(a * N + b) * N + c]++;
      ctx3[a * N + b]++;
      bi[b * N + c]++;
      ctx2[b]++;
      uni[c]++;
      a = b; b = c;
    }
  }
  const total = uni.reduce((a, b) => a + b, 0);
  const prior = Float64Array.from(uni, x => (x + 1) / (total + N));
  return {h3, ctx3, bi, ctx2, prior};
}
function score(xs, starts, ends, lm) {
  let sum = 0, count = 0, a = START, b = START;
  for (let i = 0; i < xs.length; i++) {
    if (starts[i]) { a = START; b = START; }
    const c = xs[i];
    const p1 = (lm.bi[b * N + c] + 5 * lm.prior[c]) / (lm.ctx2[b] + 5);
    const p2 = (lm.h3[(a * N + b) * N + c] + 5 * p1) /
      (lm.ctx3[a * N + b] + 5);
    sum += Math.log(p2); count++;
    a = b; b = c;
    if (ends[i]) {
      const e = END;
      const q1 = (lm.bi[b * N + e] + 5 * lm.prior[e]) / (lm.ctx2[b] + 5);
      const q2 = (lm.h3[(a * N + b) * N + e] + 5 * q1) /
        (lm.ctx3[a * N + b] + 5);
      sum += Math.log(q2); count++;
      a = START; b = START;
    }
  }
  return sum / count;
}

function markerCount(values, pages) {
  let count = 0, offset = 0;
  for (const p of pages) {
    for (let i = 1; i < p.xs.length; i++)
      if (values[offset + i] === values[offset + i - 1]) count++;
    offset += p.xs.length;
  }
  return count;
}

function transform(values, phase, sign, resetMode, wordStarts,
                   sectionIds, pageStarts, direction) {
  const steps = transform.steps, logs = transform.logs;
  const out = [];
  let state = phase, pageIndex = 0, previousSection = sectionIds[0];
  for (let i = 0; i < values.length; i++) {
    while (pageIndex + 1 < pageStarts.length && i >= pageStarts[pageIndex + 1])
      pageIndex++;
    const section = sectionIds[i];
    const reset = resetMode === 'page' ? i === pageStarts[pageIndex]
      : resetMode === 'section' ? (i === 0 || section !== previousSection)
      : resetMode === 'word' ? wordStarts[i]
      : false;
    if (reset) state = phase;
    const value = values[i];
    let result;
    if (direction === 'decrypt') {
      if (i === pageStarts[pageIndex]) result = mod29(value + sign * state);
      else {
        const d = mod29(value - values[i - 1]);
        result = d === 0 ? 28 : mod28(logs[d] + sign * state);
      }
    } else {
      if (i === pageStarts[pageIndex]) result = mod29(value - sign * state);
      else if (value === 28) result = out[i - 1];
      else result = mod29(out[i - 1] + steps[mod28(value - sign * state)]);
    }
    out.push(result);
    // Encryption updates from its plaintext input; decryption from recovered plaintext.
    state = mod28(state + (direction === 'encrypt' ? value : result));
    previousSection = section;
  }
  return out;
}
transform.steps = Array.from({length: Q}, (_, i) => {
  let x = 1;
  for (let j = 0; j < i; j++) x = x * 15 % 29;
  return x;
});
transform.logs = new Int8Array(29).fill(-1);
for (let i = 0; i < Q; i++) transform.logs[transform.steps[i]] = i;
assert.equal(new Set(transform.steps).size, 28, '15 must have order 28 mod 29');

function heldoutPlant(original) {
  const words = encodeText(shakespeare.slice(240000));
  const plain = [], starts = [], ends = [];
  for (const word of words) {
    for (let j = 0; j < word.length && plain.length < original.xs.length; j++) {
      plain.push(word[j]);
      starts.push(j === 0);
      ends.push(j === word.length - 1);
    }
    if (plain.length === original.xs.length) break;
  }
  assert.equal(plain.length, original.xs.length);
  for (let i = 0; i < plain.length; i++) if (plain[i] === 28) plain[i] = 0;
  for (const i of original.markerPositions) plain[i] = 28;
  return {plain, starts, ends};
}

function run() {
  const original = originalInput();
  const lm = train(encodeText(shakespeare.slice(0, 240000)));
  const plant = heldoutPlant(original);
  const modes = ['global', 'page', 'section', 'word'];
  const candidates = [];
  for (const sign of [1, -1]) {
    for (const resetMode of modes) {
      for (let phase = 0; phase < Q; phase++) {
        const decoded = transform(original.xs, phase, sign, resetMode,
          original.starts, original.sectionIds, original.pageStarts, 'decrypt');
        candidates.push({
          phase, sign, resetMode,
          score: score(decoded, original.starts, original.ends, lm),
          preview: decoded.slice(0, 180).map(i => corpus.translit[i]).join('')
        });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const controls = [];
  for (const sign of [1, -1]) {
    for (const resetMode of modes) {
      const phase = 7;
      const cipher = transform(plant.plain, phase, sign, resetMode,
        plant.starts, original.sectionIds, original.pageStarts, 'encrypt');
      const recovered = transform(cipher, phase, sign, resetMode,
        plant.starts, original.sectionIds, original.pageStarts, 'decrypt');
      const reencrypted = transform(recovered, phase, sign, resetMode,
        plant.starts, original.sectionIds, original.pageStarts, 'encrypt');
      assert.deepEqual(recovered, plant.plain, 'Positive decrypt failed');
      assert.deepEqual(reencrypted, cipher, 'Positive re-encrypt failed');
      assert.equal(markerCount(cipher, original.pages), 86);
      controls.push({phase, sign, resetMode, exact: true});
    }
  }
  const bestByReset = modes.map(resetMode => {
    const best = candidates.filter(x => x.resetMode === resetMode)
      .sort((a, b) => b.score - a.score)[0];
    return {resetMode, score: best.score, phase: best.phase, sign: best.sign};
  });
  const heldout = encodeText(shakespeare.slice(240000)).flat().slice(0, original.xs.length);
  const result = {
    source: {
      pages: original.pages.length, runes: original.xs.length,
      words: original.starts.filter(Boolean).length,
      sections: Math.max(...original.sectionIds) + 1,
      pageInitials: original.pages.length,
      repeatedCipherMarkers: original.markerPositions.length
    },
    stateRule: 'K_(i+1) = K_i + P_i mod 28; EA (index 28) contributes zero',
    search: {
      candidates: candidates.length, phases: 28, signs: [1, -1],
      resets: modes, rawScore: score(original.xs, original.starts, original.ends, lm),
      best: candidates[0], nextBest: candidates[1], bestByReset
    },
    heldoutEnglish: {
      runes: heldout.length,
      score: score(heldout, plant.starts, plant.ends, lm),
      layoutMatchedPlantScore: score(plant.plain, plant.starts, plant.ends, lm),
      positiveControls: controls.length
    }
  };
  assert.equal(candidates.length, 224);
  assert.equal(controls.length, 8);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {run, originalInput, transform};
