'use strict';

/**
 * Direct held-out original-cipher inversion of 13-step/previous-C full
 * GP29 permutations by reversible row swaps and source-native word trigram
 * likelihood. A positive control uses the identical physical word lengths,
 * random real secret permutations, and a disjoint donor author.
 *
 * Windows Node.js 22 CommonJS, no dependencies, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const ciphertext = pages.flatMap((p) => p.indices);
const parsed = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
assert.equal(ciphertext.length, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
const lengths = parsed.words.map((word) => word.length);
const wordStarts = [];
const wordIndex = new Uint16Array(ciphertext.length);
let start = 0;
for (let word = 0; word < lengths.length; word++) {
  wordStarts.push(start);
  for (let j = 0; j < lengths[word]; j++) wordIndex[start + j] = word;
  start += lengths[word];
}
assert.equal(start, ciphertext.length);
const markPage = new Uint8Array(ciphertext.length);
const pageInitial = new Uint8Array(ciphertext.length);
let offset = 0;
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i++) {
    markPage[offset + i] = page.page;
    if (!i) pageInitial[offset + i] = 1;
  }
  offset += page.indices.length;
}
const sourceTokens = [
  {rune: 'ING', value: 21}, {rune: 'IO', value: 27},
  ...corpus.translit.map((rune, value) => ({rune, value})),
].sort((a, b) => b.rune.length - a.rune.length);
function nativeWord(w) {
  const out = [];
  for (let i = 0; i < w.length;) {
    const tok = sourceTokens.find((t) => w.startsWith(t.rune, i));
    assert.ok(tok);
    out.push(tok.value);
    i += tok.rune.length;
  }
  return out;
}
function nativeWords(raw) {
  const norm = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  return (norm.match(/[A-Z]+/g) || []).map(nativeWord);
}
const trainWords = nativeWords(
  read('resources/control/shakespeare_first300k.txt')
  + '\n' + read('resources/control/gibran_prophet_58585.txt'));
const nativeHoldoutWords = nativeWords(
  read('resources/control/emerson_essays_2944.txt'));
const donorPools = Array.from({length: 15}, () => []);
for (const w of nativeHoldoutWords) {
  if (w.length <= 14) donorPools[w.length].push(w);
}
for (const len of new Set(lengths)) assert.ok(donorPools[len].length);
let seed = 0x3301a441;
function draw() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
function sourcePlant() {
  return lengths.flatMap((len) => {
    const p = donorPools[len];
    return p[draw() % p.length];
  });
}
const ABC = 30;
const triCount = new Uint32Array(ABC ** 3);
const context = new Uint32Array(ABC ** 2);
const biCount = new Uint32Array(ABC ** 2);
const biContext = new Uint32Array(ABC);
const uni = new Uint32Array(ABC);
for (const w of trainWords) {
  let a = 29, b = 29;
  for (const c of [...w, 29]) {
    triCount[(a * ABC + b) * ABC + c]++;
    context[a * ABC + b]++;
    biCount[b * ABC + c]++;
    biContext[b]++;
    uni[c]++;
    a = b;
    b = c;
  }
}
const unisum = uni.reduce((x, y) => x + y, 0);
const logP = new Float64Array(ABC ** 3);
for (let a = 0; a < ABC; a++) {
  for (let b = 0; b < ABC; b++) {
    for (let c = 0; c < ABC; c++) {
      const back2 = (biCount[b * ABC + c] + 3 * (uni[c] + 1) / (unisum + ABC))
        / (biContext[b] + 3);
      const p = (triCount[(a * ABC + b) * ABC + c] + 5 * back2)
        / (context[a * ABC + b] + 5);
      logP[(a * ABC + b) * ABC + c] = Math.log(p);
    }
  }
}
const rankPlain = Array.from({length: 29}, (_, i) => i)
  .sort((a, b) => uni[b] - uni[a]);
function cipherStates(data) {
  const rows = new Int16Array(data.length);
  rows.fill(-1);
  let off = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++) {
      const state = 29 * (i % 13) + data[off + i - 1];
      rows[off + i] = state;
    }
    off += page.indices.length;
  }
  return rows;
}
function freshSecret() {
  const maps = Array.from({length: 377}, () =>
    Array.from({length: 29}, (_, i) => i));
  for (const row of maps) {
    for (let i = 28; i > 0; i--) {
      const j = draw() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
  }
  return maps;
}
function encryptPlant(p, secret) {
  const cy = ciphertext.slice();
  let off = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++) {
      cy[off + i] = secret[29 * (i % 13) + cy[off + i - 1]][p[off + i]];
    }
    off += page.indices.length;
  }
  return cy;
}
function fit(data, iterations, label) {
  const states = cipherStates(data);
  const selectedTrain = [];
  const heldWords = [];
  for (let w = 0; w < lengths.length; w++) {
    const begin = wordStarts[w], end = begin + lengths[w];
    let isTrain = true, isHeld = true;
    for (let pos = begin; pos < end; pos++) {
      isTrain &&= markPage[pos] < 28;
      isHeld &&= markPage[pos] >= 28;
    }
    if (isTrain) selectedTrain.push(w);
    if (isHeld) heldWords.push(w);
  }
  const trainMember = new Uint8Array(lengths.length);
  for (const w of selectedTrain) trainMember[w] = 1;
  const rowsAt = Array.from({length: 377 * 29}, () => []);
  const trainActive = [];
  for (let i = 0; i < data.length; i++) {
    if (states[i] < 0 || !trainMember[wordIndex[i]]) continue;
    rowsAt[states[i] * 29 + data[i]].push(i);
    trainActive.push(i);
  }
  const maps = Array.from({length: 377}, (_, r) => {
    const h = new Uint16Array(29);
    for (let c = 0; c < 29; c++) h[c] = rowsAt[29 * r + c].length;
    const cipherOrder = Array.from({length: 29}, (_, x) => x)
      .sort((a, b) => h[b] - h[a] || a - b);
    const row = new Uint8Array(29);
    for (let n = 0; n < 29; n++) row[cipherOrder[n]] = rankPlain[n];
    return row;
  });
  const plain = new Uint8Array(data.length);
  for (let pos = 0; pos < data.length; pos++) {
    plain[pos] = states[pos] < 0 ? 0 : maps[states[pos]][data[pos]];
  }
  function scoreWord(w) {
    let a = 29, b = 29, sum = 0, pos = wordStarts[w];
    for (let j = 0; j <= lengths[w]; j++) {
      const c = j === lengths[w] ? 29 : plain[pos + j];
      sum += logP[(a * ABC + b) * ABC + c];
      a = b;
      b = c;
    }
    return sum;
  }
  function sumScore(words) {
    let score = 0, n = 0;
    for (const w of words) {
      score += scoreWord(w);
      n += lengths[w];
    }
    return {perRune: score / n, n, words: words.length};
  }
  function remapPlain() {
    for (let pos = 0; pos < data.length; pos++) {
      plain[pos] = states[pos] < 0 ? 0 : maps[states[pos]][data[pos]];
    }
  }
  const baselineTrain = sumScore(selectedTrain);
  const baselineHeld = sumScore(heldWords);
  let trainScore = baselineTrain.perRune * baselineTrain.n;
  const touched = [];
  let accepted = 0;
  let evaluated = 0;
  const temperatures = [2.25, 1.25, 0.8, 0.55, 0.35, 0.22];
  for (let move = 0; move < iterations; move++) {
    const phase = Math.floor(move / (iterations / temperatures.length));
    const temperature = temperatures[Math.min(temperatures.length - 1, phase)];
    const i = trainActive[draw() % trainActive.length];
    const state = states[i], ca = data[i], cb = draw() % 29;
    if (ca === cb) continue;
    const rowA = rowsAt[29 * state + ca];
    const rowB = rowsAt[29 * state + cb];
    const affected = new Set();
    for (const pos of rowA) affected.add(wordIndex[pos]);
    for (const pos of rowB) affected.add(wordIndex[pos]);
    let before = 0;
    for (const w of affected) before += scoreWord(w);
    [maps[state][ca], maps[state][cb]] =
      [maps[state][cb], maps[state][ca]];
    for (const pos of rowA) plain[pos] = maps[state][ca];
    for (const pos of rowB) plain[pos] = maps[state][cb];
    let after = 0;
    for (const w of affected) after += scoreWord(w);
    const delta = after - before;
    evaluated++;
    if (delta >= 0 || draw() / 4294967296 < Math.exp(delta / temperature)) {
      accepted++;
      trainScore += delta;
    } else {
      [maps[state][ca], maps[state][cb]] =
        [maps[state][cb], maps[state][ca]];
      for (const pos of rowA) plain[pos] = maps[state][ca];
      for (const pos of rowB) plain[pos] = maps[state][cb];
    }
  }
  remapPlain();
  const finalTrain = sumScore(selectedTrain);
  const finalHeld = sumScore(heldWords);
  assert.ok(Math.abs(finalTrain.perRune * finalTrain.n - trainScore) < 1e-6,
    'incremental optimizer score matches exact completed training score');
  const srcWords = [];
  for (let w = 0; w < lengths.length && srcWords.length < 16; w++) {
    if (markPage[wordStarts[w]] < 28) continue;
    const pos = wordStarts[w];
    srcWords.push(Array.from({length: lengths[w]}, (_, j) =>
      corpus.translit[plain[pos + j]]).join(''));
  }
  return {
    label, train: {before: baselineTrain.perRune, after: finalTrain.perRune,
      n: finalTrain.n, words: finalTrain.words},
    heldout: {before: baselineHeld.perRune, after: finalHeld.perRune,
      n: finalHeld.n, words: finalHeld.words},
    accepted, evaluated, previewHoldout: srcWords.join(' '),
    decode: plain, maps, states,
  };
}
const iterations = Number(process.env.LP2_MOVE_BUDGET || 750000);
assert.ok(Number.isSafeInteger(iterations) && iterations > 1000);
const controlPlain = sourcePlant();
const secret = freshSecret();
const controlCipher = encryptPlant(controlPlain, secret);
const cipherOriginal = fit(ciphertext, iterations, 'original');
const cipherControl = fit(controlCipher, iterations, 'native-Emerson-encrypted');
let correctHeld = 0, eligibleHeld = 0, correctTrain = 0, eligibleTrain = 0;
for (let pos = 0; pos < ciphertext.length; pos++) {
  if (pageInitial[pos]) continue;
  if (markPage[pos] < 28) {
    eligibleTrain++;
    correctTrain += Number(cipherControl.decode[pos] === controlPlain[pos]);
  } else {
    eligibleHeld++;
    correctHeld += Number(cipherControl.decode[pos] === controlPlain[pos]);
  }
}
function compact(r) {
  const {label,train,heldout,accepted,evaluated,previewHoldout} = r;
  return {label,train,heldout,accepted,evaluated,previewHoldout};
}
console.log(JSON.stringify({
  scenario: 'all-secret 377-row previous-ciphertext page-phase13 permutation',
  objective: 'source-frozen GP29 word-boundary trigram likelihood',
  iterations, seed: '0x3301a441',
  trainDonors: 'Shakespeare+Gibran', plantedControlDonor: 'Emerson',
  result: [compact(cipherOriginal),compact(cipherControl)],
  controlAccuracy: {train: correctTrain / eligibleTrain,
    heldout: correctHeld / eligibleHeld,
    heldoutMatched: correctHeld, heldoutEligible: eligibleHeld},
  conclusionRule: 'only a heldout original language improvement comparable to positive warrants a plaintext claim',
}, null, 2));
