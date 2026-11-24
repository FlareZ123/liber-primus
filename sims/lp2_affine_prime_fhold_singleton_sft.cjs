"use strict";
// Exact all-key inverse for the GP0-forward affine-prime clock with transparent plaintext F.
// Standalone Node 22 SFT; reads only pinned original corpus/transcription and solved native GP29 controls.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const solved = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));

const MOD = 29, F = 0, A = 24, I = 10, O = 3, MAX_START = 3300;
const mod = x => (x % MOD + MOD) % MOD;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

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
assert(primes.length > MAX_START + 12956);
const primeResidues = Uint8Array.from(primes, p => p % MOD);

function parseOriginal() {
  // Preserve the exact #1400 parser: % and / are layout, not word ends.
  const source = transcription.split("%").slice(0, 55).join("%");
  const tape = [], singletons = [];
  let word = [], wordCount = 0;
  const finish = () => {
    if (word.length) {
      wordCount++;
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
      // Original layout/cross-page continuation.
    } else {
      finish();
    }
  }
  finish();
  const canonical = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  assert.deepEqual(tape, canonical, "transcription must equal the pinned original corpus");
  assert.equal(tape.length, 12956);
  assert.equal(wordCount, 2896);
  assert.equal(singletons.length, 83);
  return { tape, singletons, wordCount };
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
      // Line wrapping is not a word boundary in this native transcription.
    } else {
      finish();
    }
  }
  finish();
  const plain = [], singletons = [];
  let offset = 0;
  for (const word of words) {
    if (word.length === 1) singletons.push({ offset });
    plain.push(...word);
    offset += word.length;
  }
  return { words, plain, singletons };
}

function nativeSection(name) {
  const section = solved.sections.find(s => s.name === name);
  assert(section, "missing solved native section " + name);
  return { name, ...parseNativeWords(section.source_text) };
}
function extractRunes(sourceText) {
  return Array.from(sourceText).filter(g => runeIndex.has(g)).map(g => runeIndex.get(g));
}

function encodeAffineFhold(plain, start, a, b) {
  let cursor = 0;
  const cipher = [], holds = [];
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    if (p === F) {
      cipher.push(F);
      holds.push(i);
    } else {
      const shift = mod(a * (primes[start + cursor] - 1) + b);
      cipher.push(mod(p + shift));
      cursor++;
    }
  }
  return { cipher, holds, consumed: cursor };
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

// For each (a,b), all 3301 starts are propagated together. At position i,
// a state (s,h) has absolute prime ordinal t=s+i-h. At C=F, the hold branch
// increments h; the consuming branch is legal only when it decrypts non-F.
// Singleton positions have no hold branch and require A/I (or A/I/O).
function searchAffineFhold(cipher, singletonOffsets, prefixLength, vocabulary) {
  const t0 = Date.now();
  const singletonSet = new Set(singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset));
  const checkpointOffsets = singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset);
  const stats = checkpointOffsets.map(offset => ({ offset, coefficientPairs: 0, boundaryStates: 0 }));
  const statByOffset = new Map(stats.map(x => [x.offset, x]));
  const starts = Array.from({ length: MAX_START + 1 }, (_, i) => i);
  const survivors = [];
  let liveCoefficientPairs = 0, operations = 0, maxLastLive = -1, lastDeath = null;

  for (let a = 1; a < MOD; a++) {
    for (let b = 0; b < MOD; b++) {
      const shifts = new Uint8Array(MAX_START + prefixLength + 1);
      for (let t = 0; t < shifts.length; t++) shifts[t] = mod(a * (primeResidues[t] - 1) + b);
      let states = [starts];
      let deadAt = -1;

      for (let pos = 0; pos < prefixLength; pos++) {
        const c = cipher[pos];
        const isSingleton = singletonSet.has(pos);
        const allowedShifts = isSingleton ? new Set(vocabulary.map(p => mod(c - p))) : null;
        const canHold = c === F && !isSingleton;
        const old = states;
        const next = new Array(old.length + (canHold ? 1 : 0));

        for (let h = 0; h < next.length; h++) {
          let consumed = [];
          if (h < old.length && old[h].length) {
            const list = old[h], filtered = new Array(list.length);
            let n = 0;
            const base = pos - h;
            for (const start of list) {
              const shift = shifts[start + base];
              operations++;
              const valid = isSingleton
                ? allowedShifts.has(shift)
                : c === F ? shift !== F : shift !== c;
              if (valid) filtered[n++] = start;
            }
            filtered.length = n;
            consumed = filtered;
          }
          next[h] = canHold && h > 0 ? mergeSortedUnique(consumed, old[h - 1]) : consumed;
        }

        states = next;
        let stateCount = 0;
        for (const list of states) stateCount += list.length;
        if (isSingleton && stateCount) {
          const stat = statByOffset.get(pos);
          stat.coefficientPairs++;
          stat.boundaryStates += stateCount;
        }
        if (!stateCount) { deadAt = pos; break; }
      }

      if (deadAt < 0) {
        liveCoefficientPairs++;
        for (let h = 0; h < states.length; h++) {
          for (const start of states[h]) survivors.push({ a, b, start, holds: h });
        }
      } else if (deadAt - 1 > maxLastLive) {
        maxLastLive = deadAt - 1;
        lastDeath = { a, b, deadAt };
      }
    }
  }

  const uniqueKeys = new Set(survivors.map(x => x.a + "," + x.b + "," + x.start));
  return {
    prefixLength,
    singletonCount: checkpointOffsets.length,
    coefficientPairs: 28 * 29,
    starts: MAX_START + 1,
    testedKeys: 28 * 29 * (MAX_START + 1),
    liveCoefficientPairs,
    boundaryStates: survivors.length,
    uniqueKeys: uniqueKeys.size,
    maxLastLive,
    lastDeath,
    checkpoints: stats.slice(0, 5),
    operations,
    elapsedMs: Date.now() - t0,
    survivors
  };
}

function tracePair(cipher, singletonOffsets, prefixLength, a, b, vocabulary, snapshotAt) {
  const singletonSet = new Set(singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset));
  const shifts = new Uint8Array(MAX_START + prefixLength + 1);
  for (let t = 0; t < shifts.length; t++) shifts[t] = mod(a * (primeResidues[t] - 1) + b);
  const starts = Array.from({ length: MAX_START + 1 }, (_, i) => i);
  let states = [starts], snapshot = null;

  for (let pos = 0; pos < prefixLength; pos++) {
    const c = cipher[pos], isSingleton = singletonSet.has(pos);
    const allowedShifts = isSingleton ? new Set(vocabulary.map(p => mod(c - p))) : null;
    const canHold = c === F && !isSingleton;
    const old = states, activeBefore = [];

    if (pos >= snapshotAt) {
      for (let h = 0; h < old.length; h++) {
        for (const start of old[h]) {
          const cursor = start + pos - h;
          activeBefore.push({ start, holds: h, cursor, prime: primes[cursor], shift: shifts[cursor] });
        }
      }
    }

    const next = new Array(old.length + (canHold ? 1 : 0));
    for (let h = 0; h < next.length; h++) {
      let consumed = [];
      if (h < old.length && old[h].length) {
        const filtered = [];
        const base = pos - h;
        for (const start of old[h]) {
          const shift = shifts[start + base];
          const valid = isSingleton
            ? allowedShifts.has(shift)
            : c === F ? shift !== F : shift !== c;
          if (valid) filtered.push(start);
        }
        consumed = filtered;
      }
      next[h] = canHold && h > 0 ? mergeSortedUnique(consumed, old[h - 1]) : consumed;
    }
    states = next;

    if (pos === snapshotAt) {
      snapshot = [];
      for (let h = 0; h < states.length; h++) {
        for (const start of states[h]) snapshot.push({ start, holds: h, nextCursor: start + pos + 1 - h });
      }
    }

    let count = 0;
    for (const list of states) count += list.length;
    if (!count) {
      return {
        a, b, vocabulary: vocabulary.join("/"), snapshot,
        death: { pos, cipher: c, cipherRune: corpus.runes[c], singleton: isSingleton, activeBefore }
      };
    }
  }
  return { a, b, vocabulary: vocabulary.join("/"), snapshot, alive: true };
}

function logAdd(x, y) {
  if (x === undefined) return y;
  const m = Math.max(x, y);
  return m + Math.log(Math.exp(x - m) + Math.exp(y - m));
}

function buildLanguageModel(excludeName) {
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

function stepLanguageMaps(sumMap, maxMap, c, start, a, b, lm, isSingleton) {
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
      const nextId = nextCursor * 900 + prev1 * 30 + p;
      addSum(nextId, score + transitionScore(lm, prev2, prev1, p));
    };
    if (c === F && !isSingleton) emit(F, cursor);
    const p = mod(c - mod(a * (primes[start + cursor] - 1) + b));
    if (p !== F && (!isSingleton || p === A || p === I)) emit(p, cursor + 1);
  }

  for (const [id, score] of maxMap) {
    const cursor = Math.floor(id / 900);
    const prev2 = Math.floor((id % 900) / 30), prev1 = id % 30;
    const emit = (p, nextCursor) => {
      const nextId = nextCursor * 900 + prev1 * 30 + p;
      addMax(nextId, score + transitionScore(lm, prev2, prev1, p), id, p);
    };
    if (c === F && !isSingleton) emit(F, cursor);
    const p = mod(c - mod(a * (primes[start + cursor] - 1) + b));
    if (p !== F && (!isSingleton || p === A || p === I)) emit(p, cursor + 1);
  }
  return { sum: nextSum, max: nextMax, back };
}

function predictHoldout(cipher, goldPlain, singletonOffsets, prefixLength, key, boundaryHolds, lm) {
  const singletonSet = new Set(singletonOffsets.filter(x => x.offset < prefixLength).map(x => x.offset));
  let sumMap = new Map([[899, 0]]), maxMap = new Map([[899, 0]]);

  for (let pos = 0; pos < prefixLength; pos++) {
    const next = stepLanguageMaps(sumMap, maxMap, cipher[pos], key.start, key.a, key.b, lm, singletonSet.has(pos));
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

  const trueH = goldPlain.slice(0, prefixLength).filter(p => p === F).length;
  const trueHrank = hDistribution.findIndex(x => x.h === trueH) + 1;

  let suffixSum = sumMap;
  for (let pos = prefixLength; pos < cipher.length; pos++) {
    suffixSum = stepLanguageMaps(suffixSum, new Map(), cipher[pos], key.start, key.a, key.b, lm, false).sum;
  }
  let suffixEvidence = -Infinity;
  for (const score of suffixSum.values()) suffixEvidence = logAdd(suffixEvidence, score);

  let bestMap = maxMap;
  const backLayers = [];
  for (let pos = prefixLength; pos < cipher.length; pos++) {
    const next = stepLanguageMaps(new Map(), bestMap, cipher[pos], key.start, key.a, key.b, lm, false);
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
      replay.push(mod(p + mod(key.a * (primes[key.start + cursor] - 1) + key.b)));
      cursor++;
    }
  }
  const goldHoldout = goldPlain.slice(prefixLength);
  return {
    boundaryHolds,
    trueHolds: trueH,
    trueHoldsRank: trueHrank,
    hDistribution,
    mapBoundaryHolds,
    holdoutLength: goldHoldout.length,
    exactHoldoutSymbols: decoded.filter((p, i) => p === goldHoldout[i]).length,
    predictiveLogProbability: suffixEvidence - prefixEvidence,
    predictiveNatsPerRune: (suffixEvidence - prefixEvidence) / goldHoldout.length,
    forwardReplay: replay.every((c, i) => c === cipher[prefixLength + i]),
    decodedHoldout: decoded.map(p => corpus.translit[p]).join("")
  };
}

function summarizeSearch(result) {
  return {
    prefixLength: result.prefixLength,
    singletonCount: result.singletonCount,
    testedKeys: result.testedKeys,
    liveCoefficientPairs: result.liveCoefficientPairs,
    boundaryStates: result.boundaryStates,
    uniqueKeys: result.uniqueKeys,
    maxLastLive: result.maxLastLive,
    lastDeath: result.lastDeath,
    checkpoints: result.checkpoints,
    operations: result.operations,
    elapsedMs: result.elapsedMs
  };
}

function main() {
  const { tape, singletons, wordCount } = parseOriginal();
  const pageRunes = (lo, hi) => corpus.pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices);
  const prefix = pageRunes(0, 39);
  const frozenHoldoutLength = corpus.pages.filter(p => p.page >= 40 && p.page <= 53).reduce((n, p) => n + p.indices.length, 0);
  const postHoldoutLength = corpus.pages.filter(p => p.page >= 54 && p.page <= 55).reduce((n, p) => n + p.indices.length, 0);
  assert.equal(prefix.length, 9640);
  assert.equal(frozenHoldoutLength, 3008);
  assert.equal(postHoldoutLength, 308);
  assert.equal(tape.length, prefix.length + frozenHoldoutLength + postHoldoutLength);
  const prefixSingletons = singletons.filter(x => x.offset < prefix.length);
  assert.equal(prefixSingletons.length, 68);
  assert.equal(singletons.filter(x => x.offset >= 9640 && x.offset < 12648).length, 13);
  assert.equal(singletons.filter(x => x.offset >= 12648).length, 2);
  assert.deepEqual(prefixSingletons.slice(0, 5).map(x => x.offset), [176, 244, 350, 530, 644]);

  // The full p40-p53 ciphertext is deliberately never passed to parameter selection.
  const originalAI = searchAffineFhold(prefix, prefixSingletons, prefix.length, [A, I]);
  const originalAIO = searchAffineFhold(prefix, prefixSingletons, prefix.length, [A, I, O]);
  assert.equal(originalAI.testedKeys, 2680412);
  assert.equal(originalAIO.testedKeys, 2680412);
  assert.equal(originalAI.liveCoefficientPairs, 0);
  assert.equal(originalAIO.liveCoefficientPairs, 0);
  assert.equal(originalAI.maxLastLive, 546);
  assert.equal(originalAI.lastDeath.deadAt, 547);
  assert.equal(originalAI.lastDeath.a, 4);
  assert.equal(originalAI.lastDeath.b, 22);
  assert.equal(originalAIO.maxLastLive, 552);
  assert.equal(originalAIO.lastDeath.deadAt, 553);
  assert.equal(originalAIO.lastDeath.a, 3);
  assert.equal(originalAIO.lastDeath.b, 19);

  const aiTrace = tracePair(prefix, prefixSingletons, prefix.length, 4, 22, [A, I], 530);
  const aioTrace = tracePair(prefix, prefixSingletons, prefix.length, 3, 19, [A, I, O], 530);
  assert.deepEqual(aiTrace.snapshot, [
    { start: 2384, holds: 17, nextCursor: 2898 },
    { start: 2385, holds: 18, nextCursor: 2898 }
  ]);
  assert.equal(aiTrace.death.pos, 547);
  assert.equal(aiTrace.death.cipher, 6);
  assert.equal(aiTrace.death.singleton, false);
  assert.equal(aiTrace.death.activeBefore.length, 2);
  assert(aiTrace.death.activeBefore.every(x => x.cursor === 2914 && x.prime === 26561 && x.shift === 6));
  assert.deepEqual(aioTrace.snapshot, [
    { start: 1535, holds: 14, nextCursor: 2052 },
    { start: 1536, holds: 15, nextCursor: 2052 }
  ]);
  assert.equal(aioTrace.death.pos, 553);
  assert.equal(aioTrace.death.cipher, 27);
  assert.equal(aioTrace.death.singleton, false);
  assert.equal(aioTrace.death.activeBefore.length, 2);
  assert(aioTrace.death.activeBefore.every(x => x.cursor === 2074 && x.prime === 18119 && x.shift === 27));

  // Positive control: the independently solved original p56 uses a=1,b=0,start=0.
  const p56Cipher = corpus.pages.find(p => p.page === 56).indices;
  const p56Plain = extractRunes(solved.sections.find(s => s.name === "p56_an_end").source_text);
  assert.equal(p56Cipher.length, 85);
  assert.equal(p56Plain.length, 85);
  const p56Replay = encodeAffineFhold(p56Plain, 0, 1, 0);
  assert.deepEqual(p56Replay.cipher, p56Cipher);
  assert.deepEqual(p56Replay.holds, [56]);
  assert.equal(p56Replay.consumed, 84);

  // Blinded native donor plants. The inverse sees only ciphertext, singleton offsets,
  // and the declared GP29 alphabet; hidden key values are used only after recovery.
  const donor = nativeSection("0_koan_1");
  assert.equal(donor.plain.length, 780);
  assert.equal(donor.words.length, 208);
  assert.equal(donor.singletons.length, 13);
  assert(donor.singletons.every(x => donor.plain[x.offset] === A || donor.plain[x.offset] === I));
  const prefixLength = 680;
  assert.equal(donor.singletons.filter(x => x.offset < prefixLength).length, 12);
  const lm = buildLanguageModel("0_koan_1");
  assert.deepEqual(lm.trainingNames, [
    "0_warning", "0_welcome", "0_wisdom", "0_loss_of_divinity", "jpg107-167", "jpg229"
  ]);

  function blindPlant(start, a, b, expectedHolds) {
    const plant = encodeAffineFhold(donor.plain, start, a, b);
    const recovered = searchAffineFhold(plant.cipher, donor.singletons, prefixLength, [A, I]);
    const keySet = new Set(recovered.survivors.map(x => x.a + "," + x.b + "," + x.start));
    assert.equal(keySet.size, 1, "blind plant must identify one unique key");
    const state = recovered.survivors[0];
    assert.deepEqual({ start: state.start, a: state.a, b: state.b }, { start, a, b });
    const boundaryHolds = [...new Set(recovered.survivors.map(x => x.holds))].sort((x, y) => x - y);
    assert.deepEqual(boundaryHolds, expectedHolds);
    const prediction = predictHoldout(
      plant.cipher, donor.plain, donor.singletons, prefixLength,
      { start: state.start, a: state.a, b: state.b }, boundaryHolds, lm
    );
    assert.equal(prediction.exactHoldoutSymbols, 100);
    assert.equal(prediction.forwardReplay, true);
    assert.equal(prediction.mapBoundaryHolds, prediction.trueHolds);
    return {
      hiddenKey: { start, a, b },
      recoveredUniqueKeys: keySet.size,
      prefixSingletonsUsed: 12,
      boundaryHolds,
      trueHolds: prediction.trueHolds,
      trueHoldsRank: prediction.trueHoldsRank,
      hDistribution: prediction.hDistribution,
      mapBoundaryHolds: prediction.mapBoundaryHolds,
      exactHoldoutSymbols: prediction.exactHoldoutSymbols,
      holdoutLength: prediction.holdoutLength,
      predictiveLogProbability: prediction.predictiveLogProbability,
      predictiveNatsPerRune: prediction.predictiveNatsPerRune,
      forwardReplay: prediction.forwardReplay,
      decodedHoldout: prediction.decodedHoldout
    };
  }

  const plant1 = blindPlant(73, 7, 11, [8, 9, 10, 11, 12, 13, 14, 15]);
  const plant2 = blindPlant(167, 13, 5, [9]);
  assert.equal(plant1.trueHolds, 9);
  assert.equal(plant1.trueHoldsRank, 2);
  assert.equal(plant2.trueHolds, 9);
  assert.equal(plant2.trueHoldsRank, 1);

  const summary = {
    source: {
      originalRunes: tape.length,
      originalWords: wordCount,
      originalSingletonWords: singletons.length,
      prefix: "p0-p39",
      prefixRunes: prefix.length,
      prefixSingletons: prefixSingletons.length,
      frozenHoldout: "p40-p53",
      frozenHoldoutRunes: frozenHoldoutLength,
      postHoldout: "p54-p55",
      postHoldoutRunes: postHoldoutLength
    },
    original: {
      ai: summarizeSearch(originalAI),
      aio: summarizeSearch(originalAIO),
      finalContradictions: {
        ai: aiTrace.death,
        aio: aioTrace.death
      }
    },
    p56PositiveControl: {
      cipherRunes: p56Cipher.length,
      plaintextRunes: p56Plain.length,
      exactReplay: true,
      plaintextFHoldPositions: p56Replay.holds,
      consumedPrimes: p56Replay.consumed
    },
    blindedNativePlants: [plant1, plant2],
    conclusion: "No key in the declared affine-prime/F-hold family survives p0-p39. The p40-p53 holdout was frozen and never used."
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
