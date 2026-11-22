"use strict";
/**
 * Bounded source-readable GP29 program synthesis, original LP2 and blind chapters.
 * Experimental cipher grammar (29 symbols):
 *   C[i] = (P[i] + s*f(P[i-d]) + t*g(C[i-e]) + k) mod 29.
 * f,g are either identity or the native GP prime residue; delays are 1 or 5.
 * The absent tap contributes zero. Signs are +/-1. k is constant in [0,28].
 * Exactly 9 plaintext-feedback choices x 9 ciphertext-feedback choices x 29
 * shifts = 2,349 reversible, prefix-free specifications (about 11.21 bits).
 * Previous state before position zero is zero and the clock runs continuously
 * across original physical pages. Printed separators are retained separately.
 *
 * Original source 2014 GP prime column motivates prime-residue lookups, and
 * documented within-word lag-five echoes motivate tap 5. Neither proves this
 * grammar is the historical LP2 cipher. The bounded family must not be
 * generalized to arbitrary nonlinear state machines or independent pad keys.
 *
 * Run on Node 22: node sims/lp2_gp29_prime_plaincipher_autokey_synth_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const M = 29;
assert.equal(source.runes.length, M);
assert.equal(source.prime.length, M);
const prime = source.prime.map(x => x % M);
const mod = x => ((x % M) + M) % M;

/**
 * Reproduce the project's native GP ligature spellings and declared
 * Q/V/K/Z normalization. This independent reference teaches likelihood only;
 * no ciphertext data contributes to language-model training.
 * @param {string} input English plaintext
 * @returns {number[]} native GP indices
 */
function toGP(input) {
  const tokens = source.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const output = [];
  for (let w of input.toUpperCase().match(/[A-Z]+/g) || []) {
    w = w.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < w.length;) {
      const token = tokens.find(x => w.startsWith(x.s, i));
      assert.ok(token, "Unencodable English GP token");
      output.push(token.i);
      i += token.s.length;
    }
  }
  return output;
}

/**
 * @param {number[]} samples independent training GP English
 * @returns {(v: ArrayLike<number>) => number} log P per rune
 */
function trigramScorer(samples) {
  const counts = new Uint32Array(M * M * M);
  const totals = new Uint32Array(M * M);
  for (let i = 2; i < samples.length; i++) {
    const prefix = samples[i - 2] * M + samples[i - 1];
    counts[prefix * M + samples[i]] += 1;
    totals[prefix] += 1;
  }
  const logp = new Float32Array(M * M * M);
  for (let j = 0; j < M * M; j++)
    for (let c = 0; c < M; c++)
      logp[j * M + c] = Math.log(
        (counts[j * M + c] + 0.2) / (totals[j] + M * 0.2));
  return function score(v) {
    assert.ok(v.length >= 3);
    let value = 0;
    for (let i = 2; i < v.length; i++)
      value += logp[(v[i - 2] * M + v[i - 1]) * M + v[i]];
    return value / (v.length - 2);
  };
}

/** @typedef {{name:string,delay:number,prime:boolean,sign:number}} Tap */
const makeTap = (name, delay, isPrime, sign) =>
  ({name, delay, prime:isPrime, sign});
const noTap = makeTap("none", 0, false, 0);
/** @type {Tap[]} */
const plaintextTaps = [noTap];
/** @type {Tap[]} */
const ciphertextTaps = [noTap];
for (const delay of [1,5]) {
  for (const isPrime of [false,true])
    for (const sign of [1,-1]) {
      plaintextTaps.push(makeTap(
        (isPrime ? "GPprime(P)" : "P") + "[" + delay + "]",
        delay, isPrime, sign));
      ciphertextTaps.push(makeTap(
        (isPrime ? "GPprime(C)" : "C") + "[" + delay + "]",
        delay, isPrime, sign));
    }
}
assert.equal(plaintextTaps.length * ciphertextTaps.length * M, 2349);

/**
 * @param {ArrayLike<number>} output current decoded/plain or cipher source
 * @param {number} i position
 * @param {Tap} tap
 * @returns {number}
 */
function contribution(output, i, tap) {
  if (!tap.delay || i < tap.delay) return 0;
  const previous = output[i - tap.delay];
  return tap.sign * (tap.prime ? prime[previous] : previous);
}

/**
 * @param {ArrayLike<number>} cipher GP29 ciphertext
 * @param {Tap} p previous-plaintext tap
 * @param {Tap} c previous-ciphertext tap
 * @param {number} k constant rotation
 * @returns {Uint8Array}
 */
function decrypt(cipher, p, c, k) {
  const plain = new Uint8Array(cipher.length);
  for (let i = 0; i < cipher.length; i++)
    plain[i] = mod(cipher[i] - contribution(plain, i, p)
      - contribution(cipher, i, c) - k);
  return plain;
}

/**
 * @param {ArrayLike<number>} plain GP29 plaintext
 * @param {Tap} p
 * @param {Tap} c
 * @param {number} k
 * @returns {Uint8Array}
 */
function encrypt(plain, p, c, k) {
  const cipher = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++)
    cipher[i] = mod(plain[i] + contribution(plain, i, p)
      + contribution(cipher, i, c) + k);
  return cipher;
}

/** @param {ArrayLike<number>} a @param {ArrayLike<number>} b */
function same(a,b) {
  return a.length === b.length && Array.from(a).every((v,i) => v === b[i]);
}
function originalPages(first,last) {
  const pages = source.pages.filter(p => p.page >= first
    && p.page <= last);
  assert.equal(pages.length,last-first+1);
  return pages.flatMap(p => p.indices);
}
const first = originalPages(0,2);
const untouchedA = originalPages(8,14);
const untouchedB = originalPages(40,53);
assert.deepEqual([first.length,untouchedA.length,untouchedB.length],
  [729,1729,3008]);

const english = toGP(read("resources/control/shakespeare_first300k.txt"));
assert.ok(english.length > 210000);
const training = english.slice(0,-18000);
const score = trigramScorer(training);
const independentPlantPlain = Uint8Array.from(english.slice(-17000,
  -17000 + first.length));
assert.equal(independentPlantPlain.length, first.length);
const clearPage57 = source.pages[57].indices;
const baseline = {
  original:score(first),
  untouchedA:score(untouchedA),
  untouchedB:score(untouchedB),
  clearP57:score(clearPage57),
  independentPlant:score(independentPlantPlain)
};

/** Search the *frozen* complete grammar; retain only training top20. */
function search(cipher) {
  const top = [];
  let models = 0;
  for (let pi=0;pi<plaintextTaps.length;pi++)
    for (let ci=0;ci<ciphertextTaps.length;ci++)
      for (let k=0;k<M;k++) {
        const ll = score(decrypt(cipher,
          plaintextTaps[pi], ciphertextTaps[ci], k));
        models += 1;
        if (top.length === 20 && ll <= top[top.length-1].train)
          continue;
        top.push({pi,ci,k,train:ll});
        top.sort((a,b) => b.train-a.train);
        if(top.length>20) top.pop();
      }
  assert.equal(models,2349);
  return top;
}
const sourceTop = search(first);
const top = sourceTop.map(({pi,ci,k,train}) => ({
  p:plaintextTaps[pi].name,
  pSign:plaintextTaps[pi].sign,
  c:ciphertextTaps[ci].name,
  cSign:ciphertextTaps[ci].sign,
  k,train,
  holdA:score(decrypt(untouchedA,plaintextTaps[pi],
    ciphertextTaps[ci],k)),
  holdB:score(decrypt(untouchedB,plaintextTaps[pi],
    ciphertextTaps[ci],k))
}));
const chosen = sourceTop[0];
assert.ok(same(encrypt(decrypt(first,
  plaintextTaps[chosen.pi],ciphertextTaps[chosen.ci],chosen.k),
  plaintextTaps[chosen.pi],ciphertextTaps[chosen.ci],chosen.k), first));

/* Blind positive: planted key was not used in model design or scoring. */
const plantedKey = {pi:3,ci:6,k:13};
const p=plaintextTaps[plantedKey.pi],c=ciphertextTaps[plantedKey.ci];
const plantedCipher = encrypt(independentPlantPlain,p,c,plantedKey.k);
assert.ok(same(decrypt(plantedCipher,p,c,plantedKey.k),independentPlantPlain));
const plantTop = search(plantedCipher);
assert.deepEqual(plantTop[0] && {
  pi:plantTop[0].pi,ci:plantTop[0].ci,k:plantTop[0].k}, plantedKey);
assert.ok(same(encrypt(decrypt(plantedCipher,p,c,plantedKey.k),
  p,c,plantedKey.k), plantedCipher));
assert.ok(baseline.clearP57 > -3.1,"clear p57 English calibration");
assert.ok(top[0].train < -3.8,"No original GP-English-like survivor");

const sha256 = items => crypto.createHash("sha256")
  .update(Buffer.from(items)).digest("hex");
console.log(JSON.stringify({
  test:"GP29 reversible prime/plaincipher autokey finite grammar",
  descriptionBits:Math.log2(2349),
  models:2349,
  sources:{opening:"LP2 p0-p2",holdA:"LP2 p8-p14",
    holdB:"LP2 p40-p53",reference:"Shakespeare GP 300k"},
  lengths:[first.length,untouchedA.length,untouchedB.length],
  sha256:{opening:sha256(first),holdA:sha256(untouchedA),
    holdB:sha256(untouchedB)},
  calibration:baseline,
  bestOriginal:top.slice(0,10),
  maxHeldoutFromTrainingTop20:{
    holdA:Math.max(...top.map(x=>x.holdA)),
    holdB:Math.max(...top.map(x=>x.holdB))},
  planted:{
    grammar:plantedKey,first:plantTop[0],
    exactRecovered:true,exactReencryption:true},
  exactSourceReencryption:true,
  interpretation:"Bounded negative; no unknown LP2 plaintext recovered."
},null,2));
