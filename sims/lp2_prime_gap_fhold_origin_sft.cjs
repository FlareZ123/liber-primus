"use strict";

/*
 * Source-constrained prime-gap/F-hold origin test.
 *
 * Frozen model:
 *   K_j = (p_(j+1) - p_j) mod 29, with one 1-based origin s in 1..3301.
 *   C = P + K_(cursor) mod 29 for P != F; plaintext F is transparent and
 *   does not advance the cursor. There is one continuous cursor across the
 *   p0-39 fit and p40-53 blind continuation. No multiplier, intercept,
 *   reset, reversal, or alternate gap law is searched.
 *
 * Prior-scope distinction:
 *   - prior direct prime-gap/half-gap additive-pad checks did not use latent
 *     plaintext-F holds;
 *   - the LP1-style affine-prime-minus-one F-hold gate uses p_n-1, not prime
 *     differences;
 *   - the Stage-11 signed/A194954 F-transparent stream is a different
 *     source-derived sequence.
 *
 * Original test:
 *   p0-39 (9,640 runes; 68 singleton words) selects the origin;
 *   p40-53 (3,008 runes; 13 singleton words) is never used to select it.
 *   All prefix boundary hold-count states are carried into the holdout.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const solved = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));

const MOD = 29, F = 0, A = 24, I = 10, O = 3;
const ORIGIN_MIN = 1, ORIGIN_MAX = 3301;
const mod = x => (x % MOD + MOD) % MOD;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeNames = corpus.translit;
const tokenString = xs => xs.map(x => runeNames[x]).join("");
const vocabulary = [A, I, O];
const vocabularySet = new Set(vocabulary);

function makePrimes(limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1, 2);
  for (let p = 2; p * p <= limit; p++) if (sieve[p]) {
    for (let n = p * p; n <= limit; n += p) sieve[n] = 0;
  }
  const out = [];
  for (let p = 2; p <= limit; p++) if (sieve[p]) out.push(p);
  return out;
}
const primes = makePrimes(200000);
assert(primes.length > ORIGIN_MAX + 12956);
const gapResidues = Uint8Array.from(primes.slice(0, -1), (p, i) => (primes[i + 1] - p) % MOD);
assert(gapResidues.length > ORIGIN_MAX + 12956);

function parseOriginal() {
  const source = transcription.split("%").slice(0, 55).join("%");
  const tape = [], singletons = [], wordRanges = [];
  let word = [], wordCount = 0;
  const finish = () => {
    if (word.length) {
      wordCount++;
      wordRanges.push({ start: word[0].offset, length: word.length });
      if (word.length === 1) singletons.push(word[0]);
    }
    word = [];
  };
  for (const glyph of source) {
    if (runeIndex.has(glyph)) {
      const item = { offset: tape.length, cipher: runeIndex.get(glyph) };
      tape.push(item.cipher);
      word.push(item);
    } else if (glyph === "%" || glyph === "/" || /\s/u.test(glyph)) {
      // Page and line wrapping do not terminate a word.
    } else {
      finish();
    }
  }
  finish();
  const canonical = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  assert.deepEqual(tape, canonical, "transcription must equal pinned original corpus");
  assert.equal(tape.length, 12956);
  assert.equal(wordCount, 2896);
  assert.equal(singletons.length, 83);
  return { tape, singletons, wordRanges, wordCount };
}

function parseNativeWords(sourceText) {
  const words = [];
  let current = [];
  const finish = () => {
    if (current.length) words.push(current);
    current = [];
  };
  for (const glyph of Array.from(sourceText)) {
    if (runeIndex.has(glyph)) current.push(runeIndex.get(glyph));
    else if (/\s/u.test(glyph)) {
      // Line wrapping is not a word boundary in the native transcription.
    } else finish();
  }
  finish();
  const plain = [], singletons = [], wordRanges = [];
  let offset = 0;
  for (const word of words) {
    wordRanges.push({ start: offset, length: word.length });
    if (word.length === 1) singletons.push({ offset });
    plain.push(...word);
    offset += word.length;
  }
  return { words, plain, singletons, wordRanges };
}
function nativeSection(name) {
  const section = solved.sections.find(s => s.name === name);
  assert(section, "missing solved native section " + name);
  return { name, ...parseNativeWords(section.source_text) };
}
function extractRunes(sourceText) {
  return Array.from(sourceText).filter(g => runeIndex.has(g)).map(g => runeIndex.get(g));
}

function encodeGapFhold(plain, origin1) {
  assert(origin1 >= ORIGIN_MIN && origin1 <= ORIGIN_MAX);
  let cursor = 0;
  const cipher = [], plaintextHolds = [], encryptedF = [];
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    if (p === F) {
      cipher.push(F);
      plaintextHolds.push(i);
    } else {
      const c = mod(p + gapResidues[origin1 - 1 + cursor]);
      cipher.push(c);
      if (c === F) encryptedF.push(i);
      cursor++;
    }
  }
  return { cipher, plaintextHolds, encryptedF, consumedGaps: cursor };
}

function mergeSortedUnique(left, right) {
  if (!left.length) return right;
  if (!right.length) return left;
  const out = new Array(left.length + right.length);
  let i = 0, j = 0, n = 0, last = -1;
  while (i < left.length || j < right.length) {
    let value;
    if (j >= right.length || (i < left.length && left[i] < right[j])) value = left[i++];
    else if (i >= left.length || right[j] < left[i]) value = right[j++];
    else { value = left[i]; i++; j++; }
    if (value !== last) { out[n++] = value; last = value; }
  }
  out.length = n;
  return out;
}

// Exact reachability over all 3,301 origins at once. State h is the number of
// transparent plaintext-F events; the consumed key index at position i is i-h.
function searchPrimeGapFhold(cipher, singletonOffsets, prefixLength, vocab = vocabulary) {
  const t0 = Date.now();
  const vocabSet = new Set(vocab);
  const singletonSet = new Set(singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset));
  const checkpointOffsets = singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset);
  const checkpoints = checkpointOffsets.map(offset => ({ offset, liveOrigins: 0, boundaryStates: 0 }));
  const checkpointByOffset = new Map(checkpoints.map(x => [x.offset, x]));
  const starts = Array.from({ length: ORIGIN_MAX - ORIGIN_MIN + 1 }, (_, i) => i);
  let states = [starts];
  let operations = 0, deadAt = -1, lastLive = -1, lastDeath = null;

  for (let pos = 0; pos < prefixLength; pos++) {
    const c = cipher[pos];
    const isSingleton = singletonSet.has(pos);
    const canHold = c === F && !isSingleton;
    const old = states;
    const next = new Array(old.length + (canHold ? 1 : 0));

    for (let h = 0; h < next.length; h++) {
      let consumed = [];
      if (h < old.length && old[h].length) {
        const list = old[h], filtered = new Array(list.length);
        let n = 0;
        const base = pos - h;
        for (const origin0 of list) {
          const key = gapResidues[origin0 + base];
          operations++;
          const plain = mod(c - key);
          const valid = isSingleton ? vocabSet.has(plain) : plain !== F;
          if (valid) filtered[n++] = origin0;
        }
        filtered.length = n;
        consumed = filtered;
      }
      next[h] = canHold && h > 0 ? mergeSortedUnique(consumed, old[h - 1]) : consumed;
    }

    states = next;
    let stateCount = 0;
    const live = new Set();
    for (const list of states) {
      stateCount += list.length;
      for (const origin0 of list) live.add(origin0);
    }
    if (isSingleton && stateCount) {
      const stat = checkpointByOffset.get(pos);
      stat.liveOrigins = live.size;
      stat.boundaryStates = stateCount;
    }
    if (!stateCount) {
      deadAt = pos;
      lastDeath = { pos, cipher: c, cipherRune: corpus.runes[c], singleton: isSingleton };
      break;
    }
    lastLive = pos;
  }

  const holdsByOrigin = new Map();
  let boundaryStates = 0;
  if (deadAt < 0) {
    for (let h = 0; h < states.length; h++) {
      for (const origin0 of states[h]) {
        if (!holdsByOrigin.has(origin0 + 1)) holdsByOrigin.set(origin0 + 1, []);
        holdsByOrigin.get(origin0 + 1).push(h);
        boundaryStates++;
      }
    }
  }
  const origins = [...holdsByOrigin.keys()].sort((a, b) => a - b);
  return {
    prefixLength,
    singletonCount: checkpointOffsets.length,
    testedOrigins: ORIGIN_MAX - ORIGIN_MIN + 1,
    liveOriginCount: origins.length,
    boundaryStates,
    origins,
    holdsByOrigin: Object.fromEntries([...holdsByOrigin].map(([k, v]) => [k, [...new Set(v)].sort((a, b) => a - b)])),
    deadAt,
    lastLive,
    lastDeath,
    checkpoints,
    operations,
    elapsedMs: Date.now() - t0
  };
}

function encodeState(cursor, prev2, prev1) {
  return cursor * 900 + prev2 * 30 + prev1;
}
function logAdd(x, y) {
  if (x === undefined) return y;
  const m = Math.max(x, y);
  return m + Math.log(Math.exp(x - m) + Math.exp(y - m));
}
function buildLanguageModel(excludeName = null) {
  const unigram = new Float64Array(29).fill(0.1);
  const bigram = new Float64Array(29 * 29).fill(0.1);
  const trigram = new Float64Array(29 * 29 * 29).fill(0.1);
  const trainingNames = [];
  for (const section of solved.sections) {
    if (section.name === excludeName || section.name === "p56_an_end" || section.name === "p57_parable") continue;
    trainingNames.push(section.name);
    const plain = extractRunes(section.source_text);
    for (let i = 0; i < plain.length; i++) {
      unigram[plain[i]]++;
      if (i > 0) bigram[plain[i - 1] * 29 + plain[i]]++;
      if (i > 1) trigram[(plain[i - 2] * 29 + plain[i - 1]) * 29 + plain[i]]++;
    }
  }
  const unigramTotal = unigram.reduce((x, y) => x + y, 0);
  const u = Float64Array.from(unigram, x => Math.log(x / unigramTotal));
  const normalizeRows = values => {
    const out = new Float64Array(values.length);
    for (let i = 0; i < values.length; i += 29) {
      let total = 0;
      for (let j = 0; j < 29; j++) total += values[i + j];
      for (let j = 0; j < 29; j++) out[i + j] = Math.log(values[i + j] / total);
    }
    return out;
  };
  return { u, bi: normalizeRows(bigram), tri: normalizeRows(trigram), trainingNames };
}
function transitionScore(lm, prev2, prev1, p) {
  if (prev2 === 29) return prev1 === 29 ? lm.u[p] : lm.bi[prev1 * 29 + p];
  return lm.tri[(prev2 * 29 + prev1) * 29 + p];
}

// Log-sum and Viterbi transition for one fixed origin. Prefix singleton
// constraints are applied; holdout singleton positions are deliberately not.
function stepLanguageMaps(sumMap, maxMap, c, origin1, lm, isSingleton, vocabSet) {
  const nextSum = new Map(), nextMax = new Map(), back = new Map();
  const addSum = (id, score) => nextSum.set(id, logAdd(nextSum.get(id), score));
  const addMax = (id, score, prev, p) => {
    const old = nextMax.get(id);
    if (old === undefined || score > old) {
      nextMax.set(id, score);
      back.set(id, { prev, p });
    }
  };

  for (const [id, score] of sumMap) {
    const cursor = Math.floor(id / 900);
    const prev2 = Math.floor((id % 900) / 30), prev1 = id % 30;
    const emit = (p, nextCursor) => {
      const nextId = encodeState(nextCursor, prev1, p);
      addSum(nextId, score + transitionScore(lm, prev2, prev1, p));
    };
    if (c === F && !isSingleton) emit(F, cursor);
    const plain = mod(c - gapResidues[origin1 - 1 + cursor]);
    if (plain !== F && (!isSingleton || vocabSet.has(plain))) emit(plain, cursor + 1);
  }

  for (const [id, score] of maxMap) {
    const cursor = Math.floor(id / 900);
    const prev2 = Math.floor((id % 900) / 30), prev1 = id % 30;
    const emit = (p, nextCursor) => {
      const nextId = encodeState(nextCursor, prev1, p);
      addMax(nextId, score + transitionScore(lm, prev2, prev1, p), id, p);
    };
    if (c === F && !isSingleton) emit(F, cursor);
    const plain = mod(c - gapResidues[origin1 - 1 + cursor]);
    if (plain !== F && (!isSingleton || vocabSet.has(plain))) emit(plain, cursor + 1);
  }
  return { sum: nextSum, max: nextMax, back };
}

function formatWithWordGaps(decoded, offsetStart, wordRanges) {
  const end = offsetStart + decoded.length;
  const words = [];
  for (const word of wordRanges) {
    const start = Math.max(word.start, offsetStart);
    const stop = Math.min(word.start + word.length, end);
    if (stop > start) words.push(tokenString(decoded.slice(start - offsetStart, stop - offsetStart)));
  }
  return words.join(" ");
}

function predictHoldout(cipher, goldPlain, singletonOffsets, prefixLength, origin1, boundaryHolds, lm, wordRanges = []) {
  const singletonSet = new Set(singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset));
  let sumMap = new Map([[encodeState(0, 29, 29), 0]]);
  let maxMap = new Map([[encodeState(0, 29, 29), 0]]);

  for (let pos = 0; pos < prefixLength; pos++) {
    const next = stepLanguageMaps(sumMap, maxMap, cipher[pos], origin1, lm, singletonSet.has(pos), vocabularySet);
    sumMap = next.sum;
    maxMap = next.max;
  }

  const filterBoundary = map => new Map(
    [...map].filter(([id]) => boundaryHolds.includes(prefixLength - Math.floor(id / 900)))
  );
  sumMap = filterBoundary(sumMap);
  maxMap = filterBoundary(maxMap);
  assert(sumMap.size > 0 && maxMap.size > 0, "language model lost all exact boundary states");

  let prefixEvidence = -Infinity;
  for (const score of sumMap.values()) prefixEvidence = logAdd(prefixEvidence, score);
  const hWeights = new Map();
  for (const [id, score] of sumMap) {
    const h = prefixLength - Math.floor(id / 900);
    hWeights.set(h, logAdd(hWeights.get(h), score));
  }
  const hDistribution = [...hWeights].map(([h, logWeight]) => ({
    h, probability: Math.exp(logWeight - prefixEvidence), logWeight
  })).sort((x, y) => y.logWeight - x.logWeight);

  const trueH = goldPlain ? goldPlain.slice(0, prefixLength).filter(p => p === F).length : null;
  const trueHrank = trueH === null ? null : hDistribution.findIndex(x => x.h === trueH) + 1;

  let suffixSum = sumMap;
  for (let pos = prefixLength; pos < cipher.length; pos++) {
    suffixSum = stepLanguageMaps(suffixSum, new Map(), cipher[pos], origin1, lm, false, vocabularySet).sum;
  }
  let suffixEvidence = -Infinity;
  for (const score of suffixSum.values()) suffixEvidence = logAdd(suffixEvidence, score);

  let bestMap = maxMap;
  const backLayers = [];
  for (let pos = prefixLength; pos < cipher.length; pos++) {
    const next = stepLanguageMaps(new Map(), bestMap, cipher[pos], origin1, lm, false, vocabularySet);
    bestMap = next.max;
    backLayers.push(next.back);
  }
  let bestId = -1, bestScore = -Infinity;
  for (const [id, score] of bestMap) if (score > bestScore) { bestId = id; bestScore = score; }
  assert(bestId >= 0, "no Viterbi continuation");

  const decoded = new Array(cipher.length - prefixLength);
  let boundaryId = bestId;
  for (let i = backLayers.length - 1; i >= 0; i--) {
    const edge = backLayers[i].get(boundaryId);
    assert(edge, "missing suffix backpointer");
    decoded[i] = edge.p;
    boundaryId = edge.prev;
  }
  const mapBoundaryHolds = prefixLength - Math.floor(boundaryId / 900);

  let cursor = prefixLength - mapBoundaryHolds;
  const replay = [];
  for (const p of decoded) {
    if (p === F) replay.push(F);
    else {
      replay.push(mod(p + gapResidues[origin1 - 1 + cursor]));
      cursor++;
    }
  }
  const goldHoldout = goldPlain ? goldPlain.slice(prefixLength) : null;
  return {
    boundaryHolds,
    trueHolds: trueH,
    trueHoldsRank: trueHrank,
    hDistribution,
    mapBoundaryHolds,
    holdoutLength: decoded.length,
    exactHoldoutSymbols: goldHoldout ? decoded.filter((p, i) => p === goldHoldout[i]).length : null,
    predictiveLogProbability: suffixEvidence - prefixEvidence,
    predictiveNatsPerRune: (suffixEvidence - prefixEvidence) / decoded.length,
    forwardReplay: replay.every((c, i) => c === cipher[prefixLength + i]),
    decodedHoldoutIndices: decoded,
    decodedHoldout: tokenString(decoded),
    decodedHoldoutWords: formatWithWordGaps(decoded, prefixLength, wordRanges)
  };
}

function blindPlant(origin1, donor, prefixLength, lm) {
  const plant = encodeGapFhold(donor.plain, origin1);
  const recovered = searchPrimeGapFhold(plant.cipher, donor.singletons, prefixLength, vocabulary);
  const boundaryHolds = recovered.holdsByOrigin[origin1] || [];
  const originsCorrect = recovered.origins.length === 1 && recovered.origins[0] === origin1;
  let prediction = null;
  if (originsCorrect) {
    prediction = predictHoldout(
      plant.cipher, donor.plain, donor.singletons, prefixLength,
      origin1, boundaryHolds, lm, donor.wordRanges
    );
  }
  return {
    hiddenOrigin: origin1,
    recoveredOrigins: recovered.origins,
    uniqueCorrectOrigin: originsCorrect,
    prefixSingletons: donor.singletons.filter(x => x.offset < prefixLength).length,
    plaintextFholds: plant.plaintextHolds.length,
    encryptedNonFToCipherF: plant.encryptedF.length,
    ambiguousCipherFPositions: [...plant.plaintextHolds, ...plant.encryptedF].sort((a, b) => a - b),
    consumedGapSymbols: plant.consumedGaps,
    boundaryHolds,
    prediction: prediction ? {
      trueHolds: prediction.trueHolds,
      trueHoldsRank: prediction.trueHoldsRank,
      exactHoldoutSymbols: prediction.exactHoldoutSymbols,
      holdoutLength: prediction.holdoutLength,
      forwardReplay: prediction.forwardReplay,
      mapBoundaryHolds: prediction.mapBoundaryHolds,
      predictiveNatsPerRune: prediction.predictiveNatsPerRune,
      decodedHoldoutWords: prediction.decodedHoldoutWords
    } : null
  };
}

function main() {
  const original = parseOriginal();
  const prefixLength = 9640;
  const holdoutEnd = 12648;
  const prefix = original.tape.slice(0, prefixLength);
  const connected = original.tape.slice(0, holdoutEnd);
  const prefixSingletons = original.singletons.filter(x => x.offset < prefixLength);
  const holdoutSingletons = original.singletons.filter(x => x.offset >= prefixLength && x.offset < holdoutEnd);
  assert.equal(prefix.length, 9640);
  assert.equal(connected.length - prefix.length, 3008);
  assert.equal(prefixSingletons.length, 68);
  assert.equal(holdoutSingletons.length, 13);
  assert.equal(original.singletons.filter(x => x.offset >= holdoutEnd).length, 2);

  const donor = nativeSection("0_koan_1");
  assert.equal(donor.plain.length, 780);
  assert.equal(donor.singletons.length, 13);
  assert(donor.singletons.every(x => donor.plain[x.offset] === A || donor.plain[x.offset] === I));
  const plantPrefixLength = 680;
  const plantLm = buildLanguageModel("0_koan_1");
  assert.deepEqual(plantLm.trainingNames, [
    "0_warning", "0_welcome", "0_wisdom", "0_loss_of_divinity", "jpg107-167", "jpg229"
  ]);

  const plants = [
    blindPlant(73, donor, plantPrefixLength, plantLm),
    blindPlant(167, donor, plantPrefixLength, plantLm)
  ];

  const originalGate = searchPrimeGapFhold(prefix, prefixSingletons, prefixLength, vocabulary);
  let originalPrediction = null;
  let originalDecision = "no eligible origin survived exact prefix singleton/F-hold reachability; no language fit run";
  if (originalGate.origins.length === 1) {
    const origin1 = originalGate.origins[0];
    const boundaryHolds = originalGate.holdsByOrigin[origin1];
    const lm = buildLanguageModel(null);
    originalPrediction = predictHoldout(
      connected, null, prefixSingletons, prefixLength,
      origin1, boundaryHolds, lm,
      original.wordRanges.filter(w => w.start < holdoutEnd)
    );
    const singletonChecks = holdoutSingletons.map(x => {
      const p = originalPrediction.decodedHoldoutIndices[x.offset - prefixLength];
      return { offset: x.offset, predicted: runeNames[p], allowed: vocabulary.includes(p) };
    });
    originalPrediction.holdoutSingletonChecks = singletonChecks;
    originalPrediction.holdoutSingletonsPassing = singletonChecks.filter(x => x.allowed).length;
    originalDecision = "one exact-gate origin survived; blind p40-p53 continuation scored and replayed";
  } else if (originalGate.origins.length > 1) {
    originalDecision = "multiple exact-gate origins survived; no unique hidden origin recovered, so no holdout-selected rescue";
  }

  const output = {
    model: {
      keyLaw: "K_j=(p_(j+1)-p_j) mod29",
      originDomain: "1..3301 inclusive",
      cursor: "one continuous cursor; advances only for non-F plaintext",
      plaintextF: "transparent, emits F, no cursor advance",
      originalFit: "p0-p39, 9,640 runes, 68 native singleton constraints",
      originalHoldout: "p40-p53, 3,008 runes, 13 singleton positions held out from origin selection",
      singletonVocabulary: ["A", "I", "O"],
      noMultiplierOrResetTuning: true
    },
    source: {
      originalRunesP0P55: original.tape.length,
      originalWords: original.wordCount,
      originalSingletons: original.singletons.length,
      primeCount: primes.length,
      gapResidues: gapResidues.length,
      prefixSingletonOffsets: prefixSingletons.map(x => x.offset),
      holdoutSingletonOffsets: holdoutSingletons.map(x => x.offset)
    },
    positiveControls: {
      donor: donor.name,
      donorRunes: donor.plain.length,
      donorWords: donor.words.length,
      donorSingletons: donor.singletons.length,
      fitRunes: plantPrefixLength,
      holdoutRunes: donor.plain.length - plantPrefixLength,
      plants
    },
    originalExactPrefixGate: {
      prefixLength: originalGate.prefixLength,
      singletonCount: originalGate.singletonCount,
      testedOrigins: originalGate.testedOrigins,
      liveOriginCount: originalGate.liveOriginCount,
      origins: originalGate.origins,
      boundaryStates: originalGate.boundaryStates,
      deadAt: originalGate.deadAt,
      lastLive: originalGate.lastLive,
      lastDeath: originalGate.lastDeath,
      checkpoints: originalGate.checkpoints,
      operations: originalGate.operations,
      elapsedMs: originalGate.elapsedMs
    },
    originalDecision,
    originalPrediction
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}
main();
