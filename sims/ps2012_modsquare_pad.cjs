'use strict';

/**
 * Source-keyed modular-squaring stream attack on the 55 unsolved LP2 rune pages.
 * Source: the authenticated 2012 Cicada final-message P.S. RSA modulus, later
 * factored publicly, and the previously printed Cicada numbers 3301/1033.
 * Other fixed historical numeric seeds are bounded exploratory alternatives.
 *
 * This tests direct, synchronous mod-29 addition only. It cannot rule out
 * an unknown outer alphabet, altered key-pointer state, or a different use
 * of the RSA factors.
 *
 * Run: node sims/ps2012_modsquare_pad.cjs
 * @module ps2012_modsquare_pad
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpusBytes = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'));
const corpus = JSON.parse(corpusBytes.toString('utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const P = 99554414790940424414351515490472769096534141749790794321708050837n;
const Q = 104593961812606247801193807142122161186583731774511103180935025763n;
const N = P * Q;
const SEEDS = [3301n, 1033n, 2012n, 2014n, 167n, 761n];
const MODES = ['full-residue', 'low-byte', 'five-bit-big', 'five-bit-little'];
const RESETS = ['continuous', 'page'];
const SIGNS = [-1, +1];
const PAGE_RUNES = 12956;

/**
 * A modular-squaring stream. The low-bit forms use rejection of 29..31.
 * This is a conventional source-motivated deterministic test family, not
 * a claim that the 2012 modulus is a Blum integer.
 * @param {bigint} seed
 * @param {string} mode
 * @returns {Generator<number, never, unknown>}
 */
function* pad(seed, mode) {
  let x = (seed * seed) % N;
  const nextBit = () => {
    x = x * x % N;
    return Number(x & 1n);
  };
  while (true) {
    if (mode === 'full-residue') {
      x = x * x % N;
      yield Number(x % 29n);
    } else if (mode === 'low-byte') {
      x = x * x % N;
      yield Number(x & 255n) % 29;
    } else {
      let value = 0;
      for (let b = 0; b < 5; b++) {
        const bit = nextBit();
        if (mode === 'five-bit-big') value = (value << 1) | bit;
        else value |= bit << b;
      }
      if (value < 29) yield value;
    }
  }
}

/**
 * @param {Array<{page:number,indices:number[]}>} input
 * @param {{seed:bigint,mode:string,reset:string,sign:number}} option
 * @returns {number[][]}
 */
function transform(input, option) {
  let stream = pad(option.seed, option.mode);
  return input.map(page => {
    if (option.reset === 'page') stream = pad(option.seed, option.mode);
    return page.indices.map(c => {
      const v = (c + option.sign * stream.next().value) % 29;
      return (v + 29) % 29;
    });
  });
}

/** @param {number[][]} data */
function ioc(data) {
  const counts = new Uint32Array(29);
  let length = 0;
  for (const page of data) for (const c of page) {
    counts[c]++;
    length++;
  }
  return counts.reduce((s, count) => s + count * (count - 1), 0) /
    (length * (length - 1));
}

/** @returns {Array<{seed:bigint,mode:string,reset:string,sign:number}>} */
function options() {
  const result = [];
  for (const seed of SEEDS)
    for (const mode of MODES)
      for (const reset of RESETS)
        for (const sign of SIGNS)
          result.push({seed, mode, reset, sign});
  return result;
}

/**
 * @param {Array<{page:number,indices:number[]}>} input
 * @returns {Array<{seed:string,mode:string,reset:string,sign:number,ioc:number}>}
 */
function screen(input) {
  return options().map(option => ({
    seed: String(option.seed), mode: option.mode,
    reset: option.reset, sign: option.sign,
    ioc: ioc(transform(input, option))
  })).sort((a, b) => b.ioc - a.ioc);
}

/**
 * Encode the source's independent Shakespeare English excerpt into GP.
 * @param {string} word
 * @param {Map<string, number>} table
 * @returns {number[]}
 */
function encode(word, table) {
  const latin = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < latin.length;) {
    const pair = table.get(latin.slice(i, i + 2));
    const single = table.get(latin[i]);
    if (pair !== undefined) { result.push(pair); i += 2; }
    else if (single !== undefined) { result.push(single); i++; }
    else return [];
  }
  return result;
}

/** @returns {Array<{page:number,indices:number[]}>} */
function englishPlant() {
  const training = fs.readFileSync(path.join(root,
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const table = new Map(corpus.translit.map((x, i) => [x, i]));
  const symbols = (training.match(/[A-Za-z]+/g) || [])
    .flatMap(word => encode(word, table)).slice(0, PAGE_RUNES);
  assert.equal(symbols.length, PAGE_RUNES);
  let offset = 0;
  return pages.map(p => {
    const result = {page: p.page,
      indices: symbols.slice(offset, offset + p.indices.length)};
    offset += p.indices.length;
    return result;
  });
}

function run() {
  assert.equal(N.toString(2).length, 432);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((n, p) => n + p.indices.length, 0),
    PAGE_RUNES);
  assert.ok(pages.every(p => p.indices.every(x => Number.isInteger(x) &&
    x >= 0 && x < 29)));

  const plantedPlain = englishPlant();
  const plantedOption = {seed:3301n, mode:'five-bit-big',
    reset:'page', sign:1};
  const plantedCipher = transform(plantedPlain, plantedOption);
  const original = screen(pages);
  const positive = screen(pages.map((p, i) => ({
    page:p.page, indices:plantedCipher[i]
  })));
  const decoded = transform(
    pages.map((p, i) => ({page:p.page, indices:plantedCipher[i]})),
    {...plantedOption, sign:-1});
  assert.deepEqual(decoded, plantedPlain.map(p => p.indices));
  assert.ok(ioc(plantedPlain.map(p => p.indices)) > 0.055);
  assert.equal(positive[0].seed, '3301');
  assert.equal(positive[0].mode, 'five-bit-big');
  assert.equal(positive[0].reset, 'page');
  assert.equal(positive[0].sign, -1);
  assert.ok(positive[0].ioc > 0.055);

  const best = original[0];
  const bestOutput = transform(pages, {
    seed:BigInt(best.seed), mode:best.mode,
    reset:best.reset, sign:best.sign
  }).flat();
  return {
    inputSha256:createHash('sha256').update(corpusBytes).digest('hex'),
    source:'2012 signed P.S. composite N with known 216-bit factors',
    modulusBits:432,
    primeResiduesModulo4:[Number(P % 4n), Number(Q % 4n)],
    inputPages:pages.length, inputRunes:PAGE_RUNES,
    candidateCount:original.length,
    originalCipherIoC:ioc(pages.map(p => p.indices)),
    topOriginalCandidates:original.slice(0, 10),
    leadingPlainHypothesis:bestOutput.slice(0, 120)
      .map(x => corpus.translit[x]).join(' '),
    positiveControl:{
      source:'GP-encoded Shakespeare, independent of unknown LP2 plaintext',
      unencryptedIoC:ioc(plantedPlain.map(p => p.indices)),
      correctModel:positive[0],
      secondRankedModel:positive[1],
      exactRuneRecovery:PAGE_RUNES
    },
    verdict:'No direct synchronous English-like inversion among these 96 concrete models; unknown key skips, alphabet changes or other use of N remain untested.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {N, pad, transform, ioc, screen, run};
