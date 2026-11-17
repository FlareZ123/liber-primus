"use strict";

/**
 * Issue #1329, key-independent ciphertext-difference receiver.
 * Original GP29 text / original 66 wordwise source-number directions,
 * stationary secret cyclic-256 phase bijections, no latent skips.
 * Windows 11, Node.js 22, CommonJS, read-only standalone test.
 *
 * Source: original 2016 signed "words/numbers" hint and existing 256-cell
 * p50 table. GP29 predecessor differencing follows the separately motivated
 * anti-adjacent-repeat / ciphertext-feedback interpretation; no original
 * instruction authenticates this decoding layer.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");
const {originalWords, direction, trace, RULES, GP, Q, N, KEY_STATES} =
  require("./lp2_pdir_cyclic256_allsecret_capacity_sft.cjs");

const ROOT = path.join(__dirname, "..");
const mod = (x, n) => ((x % n) + n) % n;

/**
 * Three natural GP29 ciphertext-feedback inverse source registers.
 * The GP29 difference is ALWAYS derived from original observed C, before
 * applying an independently secret per-pointer-state output alphabet.
 *
 * @param {object[][]} sections Exact printed source word sequence.
 */
function feedbackRegisters(sections) {
  const sequences = [[], [], []];
  let previousGlobal = 0;
  for (const section of sections) {
    let previousSection = 0;
    for (const {r} of section) {
      let previousWord = 0;
      for (const current of r) {
        sequences[0].push(mod(current - previousGlobal, Q));
        sequences[1].push(mod(current - previousSection, Q));
        sequences[2].push(mod(current - previousWord, Q));
        previousGlobal = current;
        previousSection = current;
        previousWord = current;
      }
    }
  }
  for (const a of sequences) assert.equal(a.length, N);
  return sequences;
}

/**
 * Exact maximal global GP29 index of coincidence for ALL 29! bijections
 * independently assigned at each pointer phase; top-two/frequency also.
 * Rearrangement inequality aligns descending state-local bin frequencies.
 *
 * @param {number[]} phases Public-ciphertext-selected pointer phases.
 * @param {number[]} sourceRegister One frozen original GP29 register.
 */
function allSecretEnvelope(phases, sourceRegister) {
  const hist = new Uint16Array(KEY_STATES * Q);
  for (let i = 0; i < N; i++)
    hist[phases[i] * Q + sourceRegister[i]]++;
  const majorized = new Uint32Array(Q);
  let maxE = 0, maxTwo = 0;
  for (let phase = 0; phase < KEY_STATES; phase++) {
    const sorted = Array.from(hist.subarray(phase * Q, (phase + 1) * Q))
      .sort((a, b) => b - a);
    maxE += sorted[0];
    maxTwo += sorted[0] + sorted[1];
    for (let j = 0; j < Q; j++) majorized[j] += sorted[j];
  }
  assert.equal(majorized.reduce((a, b) => a + b, 0), N);
  const maximumNumerator = majorized.reduce(
    (sum, n) => sum + n * (n - 1), 0);
  return {maxE, maxTwo, maximumNumerator,
    maximumIoC: maximumNumerator / (N * (N - 1))};
}

/** Exact window minimum GP29 coincidence, no sampling, every position. */
function minimumNativeIoC(text) {
  assert.ok(text.length >= N);
  const count = new Uint32Array(Q);
  let numerator = 0, minimumNumerator = Infinity, at = -1;
  for (let i = 0; i < text.length; i++) {
    const entered = text[i];
    numerator += 2 * count[entered];
    count[entered]++;
    if (i >= N) {
      const leaving = text[i - N];
      count[leaving]--;
      numerator -= 2 * count[leaving];
    }
    if (i >= N - 1 && numerator < minimumNumerator) {
      minimumNumerator = numerator;
      at = i - N + 1;
    }
  }
  return {minimumNumerator, at,
    minimumIoC: minimumNumerator / (N * (N - 1))};
}

/**
 * Positive actual-English word-feedback cipher with source-derived
 * previous-cipher-word prime-sum direction A_prev_G. Enciphering is
 * causal, and inverse uses only original ciphertext and the secret key.
 */
function positiveControl(template, nativeWords, configuration) {
  const pool = new Map(), counts = new Map();
  for (const word of nativeWords) {
    if (!pool.has(word.length)) pool.set(word.length, []);
    pool.get(word.length).push(word);
  }
  const plaintext = template.map((section) => section.map((record) => {
    const options = pool.get(record.n);
    assert.ok(options?.length, "No GP-English word of length " + record.n);
    const k = counts.get(record.n) || 0;
    counts.set(record.n, k + 1);
    return options[k % options.length];
  }));
  const key = Array.from({length: KEY_STATES},
    (_, i) => (7 * i + 11) % Q);
  let previousCipher = -1;
  const encrypted = plaintext.map((section) => {
    let pointer = 0, old = null, lastBackward = previousCipher,
      previousWordPrimeSum = 0;
    return section.map((word, wi) => {
      const dir = (wi === 0 || previousWordPrimeSum % 2 === 0 ? 1 : -1) *
        (configuration.flip ? -1 : 1);
      if (old !== null) pointer += configuration.m === 0 ? 0 :
        configuration.m === 1 ? old : dir;
      if (dir < 0 && configuration.h) pointer--;
      const cipherWord = [];
      for (let i = 0; i < word.length; i++) {
        const previousInWord = i ? cipherWord[i - 1] : 0;
        const cipher = (previousInWord + word[i] +
          key[mod(pointer, KEY_STATES)]) % Q;
        const comparator = dir > 0 || configuration.c === 0 ?
          previousCipher : configuration.c === 1 ?
          (i === 0 ? -1 : previousCipher) : lastBackward;
        pointer += dir * (configuration.skip &&
          cipher === comparator && comparator >= 0 ? 2 : 1);
        if (dir < 0) lastBackward = cipher;
        previousCipher = cipher;
        cipherWord.push(cipher);
      }
      old = dir;
      previousWordPrimeSum = cipherWord.reduce(
        (sum, c) => sum + GP.prime[c], 0);
      return cipherWord;
    });
  });
  const plant = template.map((section, si) => section.map((record, wi) => {
    const r = encrypted[si][wi];
    return {...record, r,
      G: r.reduce((sum, c) => sum + GP.prime[c], 0)};
  }));
  const dirs = plant.map((section) =>
    section.map((_, i) => direction("A_prev_G", section, i)));
  const phases = trace(plant, dirs, configuration, true).phases;
  const delta = feedbackRegisters(plant)[2];
  const nativeFlat = plaintext.flat(2), recovered = delta.map(
    (d, i) => mod(d - key[phases[i]], Q));
  assert.deepEqual(recovered, nativeFlat);
  // Check entire forward emission under the actual original ciphertext.
  assert.deepEqual(recovered.map((p, i) =>
    (p + key[phases[i]]) % Q), delta);
  const reencrypted = [];
  let offset = 0;
  for (const section of plant)
    for (const {r} of section) {
      let previousInWord = 0;
      for (const originalCipher of r) {
        const cipher = (previousInWord + recovered[offset] +
          key[phases[offset]]) % Q;
        reencrypted.push(cipher);
        assert.equal(cipher, originalCipher);
        previousInWord = cipher;
        offset++;
      }
    }
  assert.equal(offset, N);
  assert.deepEqual(reencrypted, encrypted.flat(2));
  const countsBySymbol = new Uint32Array(Q);
  for (const c of recovered) countsBySymbol[c]++;
  const genuineNumerator = countsBySymbol.reduce(
    (sum, n) => sum + n * (n - 1), 0);
  const envelope = allSecretEnvelope(phases, delta);
  assert.ok(envelope.maximumNumerator >= genuineNumerator);
  return {runes: N, recoveredExactly: true, exactForwardDifferences: true,
    nativeGP29IoC: genuineNumerator / (N * (N - 1)),
    allSecretMaximumIoC: envelope.maximumIoC};
}

function main() {
  const original = originalWords();
  const inputs = feedbackRegisters(original);
  const names = ["book-global predecessor", "section-reset predecessor",
    "word-reset predecessor"];
  const controls = [
    ["Gibran", "resources/control/gibran_prophet_58585.txt"],
    ["Emerson", "resources/control/emerson_essays_2944.txt"],
    ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
  ].map(([name, filename]) => {
    const source = fs.readFileSync(path.join(ROOT, filename), "utf8");
    const words = encodeWords(source);
    const window = minimumNativeIoC(words.flat());
    return {name, ...window, words};
  });
  const minReference = Math.min(...controls.map((x) => x.minimumIoC));
  const champions = Array.from({length: 3}, () => null);
  const minima = Array.from({length: 3}, () => null);
  const variants = 2 * 2 * 2 * 3 * 3;
  let models = 0;
  for (const name of RULES) {
    const dirs = original.map((section) =>
      section.map((_, i) => direction(name, section, i)));
    for (let h = 0; h < 2; h++)
      for (let m = 0; m < 3; m++)
        for (let c = 0; c < 3; c++)
          for (let flip = 0; flip < 2; flip++)
            for (let skip = 0; skip < 2; skip++) {
              const config = {name, h, m, c, flip, skip};
              const phases = trace(original, dirs, config, true).phases;
              for (let k = 0; k < 3; k++) {
                const envelope = allSecretEnvelope(phases, inputs[k]);
                const item = {...config, ...envelope};
                if (!champions[k] ||
                  envelope.maximumNumerator > champions[k].maximumNumerator)
                  champions[k] = item;
                if (!minima[k] ||
                  envelope.maximumNumerator < minima[k].maximumNumerator)
                  minima[k] = item;
              }
              models++;
            }
  }
  assert.equal(models, RULES.length * variants);
  assert.equal(models, 4752);
  const plant = positiveControl(original, controls[0].words,
    {h: 1, m: 2, c: 2, flip: 1, skip: 1});
  const report = {
    originalGP29Runes: N, printedWords: original.flat().length,
    registeredDirectionRules: RULES.length, pointerModels: models,
    sourceFeedbackRegisters: names.map((name, i) => ({
      name, best: champions[i], weakest: minima[i],
      strictNativeIoCExclusion: champions[i].maximumIoC < minReference})),
    nativeControls: controls.map(({name, minimumIoC,
      minimumNumerator, at}) => ({name, minimumIoC, minimumNumerator, at})),
    nativeReferenceLowerIoC: minReference, genuineGPPositive: plant,
    originalUnknownPlaintextRecovered: false
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}
if (require.main === module) main();
module.exports = {main};
