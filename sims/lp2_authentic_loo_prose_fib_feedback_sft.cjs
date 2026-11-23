'use strict';

/**
 * Agent39, Director #2421. Frozen GP29 prose recognition on seven genuine
 * solved Cicada sections. Withhold each entire section during calibration;
 * reserve p56/p57 as wholly untouched positives. A historical nonauthor
 * control measures false authorship acceptance. Finally score ONE frozen
 * previously proposed original feedback inverse from Director #2417.
 *
 * Windows 11 / Node 22, CommonJS. Read-only SFT.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const paths = {
  solved: 'resources/external/relikd-solved-gp29-native-v1.json',
  corpus: 'resources/liber-primus/lp2-corpus.json',
  original: 'resources/liber-primus/lp2-transcription.txt',
  history: 'resources/external/2013-book-of-law-I.txt'
};
const files = Object.fromEntries(Object.entries(paths).map(([k, v]) =>
  [k, fs.readFileSync(path.join(root, v), 'utf8')]));
const hashes = Object.fromEntries(Object.entries(files).map(([k, v]) =>
  [k, crypto.createHash('sha256').update(v).digest('hex')]));
const solved = JSON.parse(files.solved);
const corpus = JSON.parse(files.corpus);
assert.deepStrictEqual(solved.runes, corpus.runes);
const alphabet = new Map(solved.runes.map((ch, i) => [ch, i]));

/** @param {string} s @param {boolean} ignoreOriginalPageWrap */
function parseWords(s, ignoreOriginalPageWrap = false) {
  const result = [];
  let w = [];
  for (const ch of s) {
    if (alphabet.has(ch)) w.push(alphabet.get(ch));
    else if (ignoreOriginalPageWrap &&
      (ch === '%' || ch === '/' || /\s/u.test(ch))) continue;
    else if (w.length) { result.push(w); w = []; }
  }
  if (w.length) result.push(w);
  return result;
}
const sections = solved.sections.map(s => ({
  name: s.name, words: parseWords(s.source_text)
}));
assert.deepStrictEqual(sections.map(s => s.words.flat().length),
  [184, 515, 157, 780, 755, 319, 89, 85, 95]);

/** @param {{words:number[][]}[]} sections */
function fit(sections) {
  const one = Array(29).fill(0.5), two = new Map(), three = new Map();
  for (const s of sections) for (const w of s.words) {
    for (let i = 0; i < w.length; i++) {
      one[w[i]]++;
      for (let k = 1; k <= 2; k++) {
        if (i < k) continue;
        const table = k === 1 ? two : three;
        const key = w.slice(i - k, i).join(',');
        if (!table.has(key))
          table.set(key, {total: 0, counts: Array(29).fill(0)});
        const e = table.get(key);
        e.total++;
        e.counts[w[i]]++;
      }
    }
  }
  const n = one.reduce((a, b) => a + b, 0);
  return {one: one.map(x => x / n), two, three};
}

/** @param {number[][]} words @param {ReturnType<typeof fit>} m */
function score(words, m) {
  let sum = 0, count = 0;
  for (const w of words) for (let i = 0; i < w.length; i++) {
    const x = w[i];
    let prob = m.one[x];
    if (i >= 1) {
      const e = m.two.get(String(w[i - 1]));
      if (e) prob = (e.counts[x] + 12 * prob) / (e.total + 12);
    }
    if (i >= 2) {
      const e = m.three.get(w.slice(i - 2, i).join(','));
      if (e) prob = (e.counts[x] + 5 * prob) / (e.total + 5);
    }
    sum -= Math.log(prob);
    count++;
  }
  assert.ok(count);
  return {runes: count, natsPerRune: Number((sum / count).toFixed(6))};
}
const train = sections.slice(0, 7);
const loo = train.map((s, i) => ({
  section: s.name, ...score(s.words, fit(train.filter((_, j) => i !== j)))
}));
const cutoff = Number((Math.max(...loo.map(x => x.natsPerRune)) +
  0.12).toFixed(6));
assert.equal(cutoff, 2.806747);
const model = fit(train);
const heldout = sections.slice(7).map(s => ({
  section: s.name, ...score(s.words, model)
}));
assert.ok(heldout.every(x => x.natsPerRune <= cutoff));

/** Contemporary external source, deliberately NOT authored by Cicada.
 * Exact documented Latin-to-GP conversion convention. No vocabulary tuning.
 * @param {string} word
 */
function latin(word) {
  const spelling = word.toUpperCase().replace(/[VKQZ]/gu,
    ch => ({V:'U',K:'C',Q:'C',Z:'S'})[ch]);
  const abc = {F:0,U:1,TH:2,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,
    EO:12,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,NG:21,
    OE:22,D:23,A:24,AE:25,Y:26,IO:27,EA:28};
  const out = [];
  for (let i = 0; i < spelling.length;) {
    const ing = spelling.slice(i, i + 3) === 'ING';
    const pair = spelling.slice(i, i + 2);
    const take = ing ? 'NG' :
      Object.hasOwn(abc, pair) ? pair : spelling[i];
    assert.ok(Object.hasOwn(abc, take));
    out.push(abc[take]);
    i += ing ? 3 : take.length;
  }
  return out;
}
const outsider = (files.history.match(/[A-Za-z]+/gu) || []).map(latin);
let cursor = 0;
const falseAuthor = sections.map(s => {
  const target = s.words.flat().length;
  let length = 0;
  const ww = [];
  while (cursor < outsider.length && length < target) {
    const w = outsider[cursor++];
    ww.push(w);
    length += w.length;
  }
  return {targetSection: s.name, ...score(ww, model)};
});
assert.equal(falseAuthor.filter(x => x.natsPerRune <= cutoff).length, 9);

/** A single fixed known p56-family moving prime-totient additive cipher,
 * without transparent F events, applied to three solved-native controls.
 * The second decode is intentionally one prime out of phase.
 */
function firstPrimes(n) {
  const primes = [];
  for (let x = 2; primes.length < n; x++) {
    let ok = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { ok = false; break; }
    }
    if (ok) primes.push(x);
  }
  return primes;
}
const primes = firstPrimes(300);
function plant(s) {
  const plain = s.words.flat();
  const cipher = plain.map((v, i) =>
    (v + (primes[i] - 1) % 29) % 29);
  const decoded = cipher.map((v, i) =>
    (v - (primes[i] - 1) % 29 + 29) % 29);
  assert.deepStrictEqual(decoded, plain);
  let k = 0;
  const got = s.words.map(w => {
    const v = decoded.slice(k, k + w.length);
    k += w.length;
    return v;
  });
  k = 0;
  const wrong = s.words.map(w => w.map(() => {
    const p = (cipher[k] - (primes[k + 1] - 1) % 29 + 29) % 29;
    k++;
    return p;
  }));
  const positive = score(got, model), negative = score(wrong, model);
  assert.ok(positive.natsPerRune <= cutoff);
  assert.ok(negative.natsPerRune > cutoff);
  return {section: s.name, ...positive, wrongPhase: negative.natsPerRune};
}
const plants = [sections[0], sections[7], sections[8]].map(plant);

/** Frozen independent #2417 candidate, not a fitted key family.
 * Previous word's first/last ciphertext rune seeds (a,b).
 * Per rune p=c-a, then simultaneous (a,b)=(b,a+b+c) mod29.
 */
const source = parseWords(files.original.split('%').slice(0, 55).join('%'), true);
assert.equal(source.length, 2896);
assert.equal(source.flat().length, 12956);
assert.deepStrictEqual(source.flat(), corpus.pages
  .filter(p => p.page <= 55).flatMap(p => p.indices));
const decoded = [];
let previous = null;
for (const w of source) {
  let a = previous ? previous[0] : 0;
  let b = previous ? previous.at(-1) : 0;
  const recovered = [];
  for (const c of w) {
    const p = (c - a + 29) % 29;
    assert.equal((p + a) % 29, c);
    recovered.push(p);
    [a, b] = [b, (a + b + c) % 29];
  }
  decoded.push(recovered);
  previous = w;
}
let offset = 0;
const pages = new Map();
for (const p of corpus.pages.filter(p => p.page <= 55)) {
  pages.set(p.page, [offset, offset + p.indices.length]);
  offset += p.indices.length;
}
const annotated = [];
offset = 0;
for (const w of decoded) {
  annotated.push({start: offset, end: offset + w.length, w});
  offset += w.length;
}
assert.equal(offset, 12956);
function span(startPage, endPage) {
  const [start] = pages.get(startPage);
  const end = pages.get(endPage)[1];
  const full = annotated.filter(w => w.start >= start && w.end <= end);
  return {pages: String(startPage) + '-' + String(endPage),
    physicalRunes: end - start, fullWords: full.length,
    ...score(full.map(x => x.w), model)};
}
const original = {
  whole: score(decoded, model),
  intervals: [span(16, 21), span(40, 53)],
  exactReplay: true
};
assert.deepStrictEqual(original.intervals.map(x => x.runes), [1605, 3008]);
assert.ok(original.intervals.every(x => x.natsPerRune > cutoff));
console.log('SOURCES', JSON.stringify(hashes));
console.log('AUTHOR_CALIBRATION', JSON.stringify({loo, cutoff, heldout}));
console.log('HISTORICAL_FALSE_AUTHOR', JSON.stringify(falseAuthor));
console.log('THREE_AUTHENTIC_MOVING_CIPHER_PLANTS', JSON.stringify(plants));
console.log('ONE_FROZEN_ORIGINAL_INVERSE', JSON.stringify(original));
console.log('PASS: prose detection accepts historical outsider and rejects the one frozen original candidate; no LP2 plaintext or key');
