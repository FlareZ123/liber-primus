'use strict';

/**
 * Source-selected Fabre/Cicada running-key test.
 *
 * Hypothesis: LP2 p57's “instar ... tunneling to the surface ... shed ... emerge”
 * selects Fabre's Book of Insects (1921), Chapter III, THE CICADA. Test the
 * simplest reversible use: the GP29 text beginning at the first body sentence
 * of that chapter is a continuous running key for original LP2 p0–55.
 *
 * No fitted source offset, alphabet permutation, reset schedule, or key period.
 * Operations are the three ordinary GP29 running-key conventions:
 * Vigenere C-K, Vigenere C+K, and Beaufort K-C. Also test the direct literal-F
 * bypass as a separate, p56-motivated convention.
 *
 * Run: node sims/lp2_fabre_cicada_runningkey_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_URL = 'https://www.gutenberg.org/cache/epub/67000/pg67000.txt';
const SOURCE_TITLE = "FABRE'S BOOK OF INSECTS";
const CICADA_BODY = 'I am in an excellent position to study the habits of the Cicada';
const MOD = 29;
const UNKNOWN_RUNES = 12956;
const EXPECTED_CHAPTERS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3008, 308];
const EXPECTED_WORDS = 2896;

/** @param {string} url @returns {Promise<Buffer>} */
async function retrieve(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'LiberPrimusResearch/1.0 (source-key test)' }
  });
  if (!response.ok) throw new Error('Gutenberg HTTP ' + response.status + ' for ' + url);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Map a historical English source into the manuscript's canonical GP29 alphabet.
 * Latin ligatures AE/OE are preserved as the corresponding single GP runes.
 * QU→CW, V→U, K→C, Z→S are the same source-native normalizations used by
 * the repository's existing full-book running-key tests.
 * @param {string} input
 * @param {string[]} alphabet
 * @returns {number[]}
 */
function encodeGP29(input, alphabet) {
  const names = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const text = input.toUpperCase()
    .replace(/[ÆǼ]/g, 'AE').replace(/[Œ]/g, 'OE').replace(/ß/g, 'SS')
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] < 'A' || text[i] > 'Z') { i++; continue; }
    const found = names.find(t => text.startsWith(t.token, i));
    assert(found, 'Unmapped source letter at ' + i + ': ' + text.slice(i, i + 12));
    out.push(found.index);
    i += found.token.length;
  }
  return out;
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const counts = new Uint32Array(MOD);
  for (const v of x) counts[v]++;
  return [...counts].reduce((s, n) => s + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}

/**
 * Build a source-English GP29 trigram model with add-0.25 smoothing.
 * @param {number[]} ref
 */
function trigramModel(ref) {
  const tri = new Float64Array(MOD ** 3);
  const bi = new Float64Array(MOD ** 2);
  for (let i = 2; i < ref.length; i++) {
    const p = ref[i - 2] * MOD + ref[i - 1];
    bi[p]++;
    tri[p * MOD + ref[i]]++;
  }
  return { tri, bi };
}

/**
 * @param {number[]} x
 * @param {{tri:Float64Array,bi:Float64Array}} model
 */
function trigramScore(x, model) {
  let sum = 0, n = 0;
  for (let i = 2; i < x.length; i++) {
    const p = x[i - 2] * MOD + x[i - 1];
    sum += Math.log((model.tri[p * MOD + x[i]] + 0.25) /
      (model.bi[p] + 0.25 * MOD));
    n++;
  }
  return sum / n;
}

/** @param {number[]} c @param {number[]} k @param {string} op */
function decode(c, k, op) {
  const out = new Array(c.length);
  for (let i = 0; i < c.length; i++) {
    const a = c[i], b = k[i];
    if (op === 'C-K') out[i] = (a - b + MOD) % MOD;
    else if (op === 'C+K') out[i] = (a + b) % MOD;
    else if (op === 'K-C') out[i] = (b - a + MOD) % MOD;
    else throw new Error('unknown operation ' + op);
  }
  return out;
}

/**
 * Direct p56-motivated convention: ciphertext F is literal and consumes no key;
 * all non-F ciphertext symbols consume one source-key rune.
 * @param {number[]} c @param {number[]} k @param {string} op
 */
function decodeLiteralF(c, k, op) {
  const out = [];
  let used = 0;
  for (const a of c) {
    if (a === 0) { out.push(0); continue; }
    assert(used < k.length, 'Fabre source key exhausted');
    const b = k[used++];
    if (op === 'C-K') out.push((a - b + MOD) % MOD);
    else if (op === 'C+K') out.push((a + b) % MOD);
    else if (op === 'K-C') out.push((b - a + MOD) % MOD);
  }
  return { out, used };
}

/**
 * Exact existence test for the p56 literal-F bypass, retaining every possible
 * key-consumption count when C=F could also be an encrypted non-F.
 * This is a feasibility gate, not plaintext recovery.
 * @param {number[]} c @param {number[]} k @param {string} op
 */
function reachableTransparentF(c, k, op) {
  let states = new Set([0]), peak = 1;
  for (let i = 0; i < c.length; i++) {
    const next = new Set();
    for (const used of states) {
      if (c[i] === 0) next.add(used); // literal plaintext F, no key tick
      if (used < k.length) {
        const p = decode([c[i]], [k[used]], op)[0];
        if (p !== 0) next.add(used + 1); // encrypted non-F
      }
    }
    states = next;
    peak = Math.max(peak, states.size);
    if (!states.size) return { possible: false, firstFailure: i, peak, terminalStates: 0 };
  }
  return { possible: true, firstFailure: -1, peak, terminalStates: states.size };
}

/** @param {number[]} values @param {string[]} alphabet */
function spell(values, alphabet) {
  return values.slice(0, 180).map(x => alphabet[x]).join(' ');
}

async function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  assert.deepEqual(corpus.translit, [
    'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
    'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
  ]);
  const ciphertext = corpus.pages.slice(0, 56).flatMap(p => p.indices);
  assert.equal(ciphertext.length, UNKNOWN_RUNES);
  assert.equal(corpus.pages.length, 58);

  const raw = await retrieve(SOURCE_URL);
  const sourceHash = crypto.createHash('sha256').update(raw).digest('hex');
  const text = raw.toString('utf8').replace(/^\uFEFF/, '');
  assert(text.toUpperCase().includes(SOURCE_TITLE), 'wrong Gutenberg title');
  assert(text.includes('Cicada-grubs come up from the underground'),
    'source lacks the Cicada emergence passage');
  const bodyStart = text.indexOf(CICADA_BODY);
  assert(bodyStart >= 0, 'cannot locate selected Chapter III body start');
  const chapterIV = text.indexOf('CHAPTER IV', bodyStart);
  assert(chapterIV > bodyStart, 'cannot locate Chapter IV boundary');

  const chapterOnly = encodeGP29(text.slice(bodyStart, chapterIV), corpus.translit);
  const chapterForward = encodeGP29(text.slice(bodyStart), corpus.translit);
  assert(chapterForward.length >= UNKNOWN_RUNES,
    'selected Chapter III-to-end source is too short for the full LP2 stream');

  const shakespeare = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const reference = encodeGP29(shakespeare.slice(0, 240000), corpus.translit);
  const model = trigramModel(reference);
  const knownLP1 = encodeGP29(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'),
    corpus.translit);
  const knownP56 = corpus.pages[56].indices;
  const knownP57 = corpus.pages[57].indices;

  const controls = {
    originalCipherIoC: ioc(ciphertext),
    shakespeareIoC: ioc(reference),
    lp1IoC: ioc(knownLP1),
    p56CipherIoC: ioc(knownP56),
    p57ClearIoC: ioc(knownP57),
    shakespeareTrigram: trigramScore(reference, model),
    lp1Trigram: trigramScore(knownLP1, model),
    p57Trigram: trigramScore(knownP57, model)
  };

  console.log('SOURCE ' + JSON.stringify({
    url: SOURCE_URL, title: SOURCE_TITLE, sha256: sourceHash,
    bytes: raw.length, chapterBodyStartByte: Buffer.byteLength(text.slice(0, bodyStart)),
    chapterOnlyGP29: chapterOnly.length,
    chapterIIIToEndGP29: chapterForward.length,
    fixedKeyStart: 'first body sentence of Chapter III, THE CICADA',
    fullUnknownRunes: ciphertext.length
  }));
  console.log('CONTROLS ' + JSON.stringify(controls));

  const key = chapterForward.slice(0, UNKNOWN_RUNES);
  const ops = ['C-K', 'C+K', 'K-C'];
  const rows = [];
  for (const op of ops) {
    const direct = decode(ciphertext, key, op);
    const directRow = {
      source: 'Chapter III body to book end',
      operation: op, clock: 'continuous one-symbol-per-rune',
      runes: direct.length, ioc: ioc(direct),
      trigram: trigramScore(direct, model), head: spell(direct, corpus.translit)
    };
    rows.push(directRow);
    console.log('DIRECT ' + JSON.stringify(directRow));

    const literal = decodeLiteralF(ciphertext, key, op);
    const literalRow = {
      source: 'Chapter III body to book end',
      operation: op, clock: 'literal-F bypass; skip only ciphertext F',
      consumedKeyRunes: literal.used, runes: literal.out.length,
      ioc: ioc(literal.out), trigram: trigramScore(literal.out, model),
      head: spell(literal.out, corpus.translit)
    };
    rows.push(literalRow);
    console.log('LITERAL_F ' + JSON.stringify(literalRow));

    const reachable = reachableTransparentF(ciphertext, key, op);
    console.log('F_TRANSPARENT_REACHABILITY ' + JSON.stringify({
      operation: op, ...reachable
    }));
  }

  // Positive controls: the same fixed source key and all three arithmetic
  // conventions must exactly round-trip a known clear 95-rune LP2 page.
  for (const op of ops) {
    const plain = knownP57;
    const planted = plain.map((p, i) => {
      const k = key[i];
      if (op === 'C-K') return (p + k) % MOD;
      if (op === 'C+K') return (p - k + MOD) % MOD;
      return (k - p + MOD) % MOD;
    });
    const recovered = decode(planted, key, op);
    assert.deepEqual(recovered, plain, 'planted p57 round-trip failed: ' + op);
  }
  console.log('POSITIVE_CONTROL ' + JSON.stringify({
    clearP57Runes: knownP57.length,
    threeArithmeticConventionsRoundTrip: true,
    sourceKeyOffsetWasFixedBeforeScoring: true
  }));

  const best = rows.reduce((a, b) => b.trigram > a.trigram ? b : a);
  console.log('FINAL ' + JSON.stringify({
    candidate: 'Fabre 1921 Chapter III Cicada, body-start GP29 running key',
    best: { operation: best.operation, clock: best.clock,
      ioc: best.ioc, trigram: best.trigram },
    englishControls: { shakespeare: controls.shakespeareTrigram,
      lp1: controls.lp1Trigram, p57: controls.p57Trigram },
    recoveredUnknownPlaintext: false,
    note: 'A high score would require independent plaintext validation; a low score rejects only these fixed direct-key conventions.'
  }));
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
