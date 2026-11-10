'use strict';
/**
 * Test a source-motivated one-symbol prime-feedback extension of the
 * authentic solved-LP2 p56 prime-totient cipher.
 *
 * Candidate:
 *   P[i] = C[i] - sign * (prime[state[i-1]] - 1) mod 29
 * where state is either the previous plaintext or previous ciphertext rune.
 * Exhaust all 29 initial states, both signs, and global/page/section/word
 * resets. This is a finite test, not an unrestricted cipher search.
 *
 * Node.js 22, no external packages:
 *   node sims/lp2_prime_feedback_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const master = read('resources/liber-primus/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const mod = x => ((x % 29) + 29) % 29;
const START = 29, END = 30, N = 31;

/** Parse exact original rune positions, word boundaries and section clocks. */
function originalInput() {
  const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
  const pageSegments = master.split('%');
  const pages = [];
  let active = false, sectionId = 0;
  for (const p of corpus.pages.filter(p => p.page < 56 && p.runic_count > 0)) {
    // Physical LP2 page 50 is runeless; source transcription omits it.
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
  assert.equal(pages.length, 55);
  assert.equal(xs.length, 12956);
  assert.equal(starts.filter(Boolean).length, 2896);
  assert.equal(ends.filter(Boolean).length, 2896);
  assert.equal(Math.max(...sectionIds) + 1, 8);
  return {pages, xs, starts, ends, sectionIds, pageStarts};
}

/** Gematria Primus transliteration used by the repository's controls. */
function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = corpus.translit.indexOf(s.slice(i, i + 2));
    if (digraph >= 0) { out.push(digraph); i += 2; }
    else {
      const one = corpus.translit.indexOf(s[i]);
      if (one >= 0) out.push(one);
      i++;
    }
  }
  return out;
}
function encodeText(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(encodeWord);
}

/** Smoothed Shakespeare-trained GP trigram model with explicit word ends. */
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
  // Mean log-likelihood per modeled event: each rune plus each word-end event.
  return sum / count;
}

/**
 * Apply the feedback cipher. In encryption mode, values are plaintext;
 * in decryption mode, values are ciphertext.
 */
function transform(values, feedback, sign, seed, resetMode, starts,
                   sectionIds, pageStarts, direction) {
  const out = [];
  let prev = seed, pageIndex = 0, previousSection = sectionIds[0];
  for (let i = 0; i < values.length; i++) {
    while (pageIndex + 1 < pageStarts.length && i >= pageStarts[pageIndex + 1])
      pageIndex++;
    const section = sectionIds[i];
    const reset = resetMode === 'page' ? i === pageStarts[pageIndex]
      : resetMode === 'section' ? (i === 0 || section !== previousSection)
      : resetMode === 'word' ? starts[i]
      : false;
    if (reset) prev = seed;
    const value = values[i];
    const shift = mod(corpus.prime[prev] - 1);
    const result = direction === 'decrypt'
      ? mod(value - sign * shift)
      : mod(value + sign * shift);
    out.push(result);
    if (direction === 'decrypt') prev = feedback === 'plain' ? result : value;
    else prev = feedback === 'plain' ? value : result;
    previousSection = section;
  }
  return out;
}

function plantControl(original) {
  const heldoutWords = encodeText(shakespeare.slice(240000));
  const plain = [], starts = [], ends = [];
  for (const word of heldoutWords) {
    for (let j = 0; j < word.length && plain.length < original.xs.length; j++) {
      plain.push(word[j]);
      starts.push(j === 0);
      ends.push(j === word.length - 1 && plain.length < original.xs.length);
    }
    if (plain.length === original.xs.length) break;
  }
  assert.equal(plain.length, original.xs.length);
  const results = [];
  for (const feedback of ['plain', 'cipher']) {
    for (const sign of [1, -1]) {
      for (const resetMode of ['global', 'page', 'section', 'word']) {
        const seed = 13;
        const cipher = transform(plain, feedback, sign, seed, resetMode,
          starts, original.sectionIds, original.pageStarts, 'encrypt');
        const recovered = transform(cipher, feedback, sign, seed, resetMode,
          starts, original.sectionIds, original.pageStarts, 'decrypt');
        assert.deepEqual(recovered, plain,
          'Positive plant failed: ' + feedback + '/' + sign + '/' + resetMode);
        results.push({feedback, sign, resetMode, seed, exact: true});
      }
    }
  }
  return {plain, starts, ends, results};
}

function run() {
  const original = originalInput();
  const trainWords = encodeText(shakespeare.slice(0, 240000));
  const lm = train(trainWords);
  const control = plantControl(original);
  const candidates = [];
  for (const feedback of ['plain', 'cipher']) {
    for (const sign of [1, -1]) {
      for (const resetMode of ['global', 'page', 'section', 'word']) {
        for (let seed = 0; seed < 29; seed++) {
          const decoded = transform(original.xs, feedback, sign, seed,
            resetMode, original.starts, original.sectionIds,
            original.pageStarts, 'decrypt');
          candidates.push({
            feedback, sign, resetMode, seed,
            score: score(decoded, original.starts, original.ends, lm),
            preview: decoded.slice(0, 180).map(i => corpus.translit[i]).join('')
          });
        }
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const rawScore = score(original.xs, original.starts, original.ends, lm);
  const controlScore = score(control.plain, control.starts, control.ends, lm);
  const result = {
    source: {
      pages: original.pages.length, runes: original.xs.length,
      words: original.starts.filter(Boolean).length,
      sections: Math.max(...original.sectionIds) + 1
    },
    model: 'GP trigram; Shakespeare first 240,000 source characters for training',
    search: {
      candidates: candidates.length, feedback: 'previous plaintext or ciphertext',
      signs: [1, -1], seeds: 'all 29 GP indices',
      resets: ['global', 'physical page', 'source section', 'printed word'],
      rawScore, best: candidates[0], nextBest: candidates[1]
    },
    heldoutPositive: {
      runes: control.plain.length, score: controlScore,
      exactPlants: control.results.length
    }
  };
  assert.equal(candidates.length, 464);
  assert.equal(control.results.length, 16);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {run, originalInput, encodeWord, transform};
