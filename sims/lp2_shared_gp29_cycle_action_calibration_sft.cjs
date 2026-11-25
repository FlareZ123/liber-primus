"use strict";

const fs = require("node:fs");
const path = require("node:path");

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
}
function parseWords(text, runeIndex) {
  return (text.replace(/[\s/%]/g, "").match(/[\u16a0-\u16ff]+/g) || [])
    .map(word => Array.from(word, rune => {
      const value = runeIndex.get(rune);
      if (value === undefined) throw new Error("Unknown rune: " + rune);
      return value;
    }));
}
function mod(x) { return ((x % 29) + 29) % 29; }
function pow29(a, n) {
  let z = 1;
  while (n) {
    if (n & 1) z = mod(z * a);
    a = mod(a * a);
    n >>= 1;
  }
  return z;
}
function shuffle(input, rng) {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
function isPrimitiveQ8(key) {
  return ![1, 2, 4].some(d => key.every((v, i) => v === key[i % d]));
}

const repoFiles = {
  corpus: "resources/liber-primus/lp2-corpus.json",
  transcription: "resources/liber-primus/lp2-transcription.txt",
  native: "resources/external/relikd-solved-gp29-native-v1.json",
  lexicon: "resources/control/english_wordfreq_textblob.txt"
};
const gp = JSON.parse(read(repoFiles.corpus));
const native = JSON.parse(read(repoFiles.native));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const originalGroups = parseWords(read(repoFiles.transcription), runeIndex).slice(-66);
const nativePool = native.sections.flatMap(section => parseWords(section.source_text, runeIndex));
const poolByLength = new Map();
for (const word of nativePool) {
  if (!poolByLength.has(word.length)) poolByLength.set(word.length, []);
  poolByLength.get(word.length).push(word);
}

const alphabet = new Map(gp.translit.map((r, i) => [r, i]));
const dictionary = new Map();
function addDictionaryWord(encoded, word, frequency) {
  const key = String.fromCharCode(...encoded);
  const previous = dictionary.get(key);
  if (!previous || frequency > previous.frequency) {
    dictionary.set(key, { encoded, word, frequency });
  }
}
function addLatinWord(word, frequency) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  function walk(index, encoded) {
    if (index === normalized.length) {
      addDictionaryWord(encoded, word, frequency);
      return;
    }
    for (const n of [1, 2, 3]) {
      const part = normalized.slice(index, index + n);
      if (part.length !== n) continue;
      const value = n === 3
        ? (part === "ING" ? alphabet.get("NG") : undefined)
        : alphabet.get(part);
      if (value !== undefined) walk(index + n, [...encoded, value]);
    }
  }
  walk(0, []);
}
const lexiconLines = read(repoFiles.lexicon).split(/\r?\n/);
let latinWordForms = 0;
for (const line of lexiconLines) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  latinWordForms++;
  addLatinWord(match[1], Number(match[2]));
}
for (const word of ["A", "I", "O"]) addLatinWord(word, 1);
for (const section of native.sections) {
  for (const word of parseWords(section.source_text, runeIndex)) {
    addDictionaryWord(word, "[native]", 1);
  }
}
const dictionarySet = new Set(dictionary.keys());

/* Exact oracle-assisted calibration for the strict shared-cycle model:
   C = pi^-1(pi(P) + key[phase]) with transparent plaintext-F holds. */
const ORACLE_VARIABLES = 35; // x_1..x_28, key_1..key_7; key_0 is normalized to 1.
function addOracleRow(basis, input) {
  const row = input.slice();
  for (const entry of basis) {
    const factor = row[entry.pivot];
    if (!factor) continue;
    for (let j = entry.pivot; j <= ORACLE_VARIABLES; j++) {
      row[j] = mod(row[j] - factor * entry.row[j]);
    }
  }
  let pivot = -1;
  for (let j = 0; j < ORACLE_VARIABLES; j++) {
    if (row[j]) { pivot = j; break; }
  }
  if (pivot < 0) return row[ORACLE_VARIABLES] === 0 ? basis : null;
  const inverse = pow29(row[pivot], 27);
  for (let j = pivot; j <= ORACLE_VARIABLES; j++) row[j] = mod(row[j] * inverse);
  for (const entry of basis) {
    const factor = entry.row[pivot];
    if (!factor) continue;
    for (let j = pivot; j <= ORACLE_VARIABLES; j++) {
      entry.row[j] = mod(entry.row[j] - factor * row[j]);
    }
  }
  const at = basis.findIndex(entry => entry.pivot > pivot);
  const entry = { pivot, row };
  if (at < 0) basis.push(entry);
  else basis.splice(at, 0, entry);
  return basis;
}
function addOracleGroup(basis, group, start) {
  const out = basis.map(entry => ({ pivot: entry.pivot, row: entry.row.slice() }));
  let phase = start;
  for (let i = 0; i < group.plain.length; i++) {
    const p = group.plain[i], c = group.cipher[i];
    if (p === 0) {
      if (c !== 0) return null;
      continue;
    }
    const row = new Array(ORACLE_VARIABLES + 1).fill(0);
    if (c !== 0) row[c - 1] = mod(row[c - 1] + 1);
    row[p - 1] = mod(row[p - 1] - 1);
    if (phase === 0) row[ORACLE_VARIABLES] = 1;
    else row[27 + phase] = mod(row[27 + phase] - 1);
    if (!addOracleRow(out, row)) return null;
    phase = (phase + 1) % 8;
  }
  return out;
}
function makeNativePlant(seed, key) {
  const rng = makeRng(seed);
  const chosen = [];
  const lengths = [...new Set(originalGroups.map(word => word.length))].sort((a, b) => a - b);
  for (const length of lengths) {
    const count = originalGroups.filter(word => word.length === length).length;
    const candidates = shuffle(poolByLength.get(length) || [], rng);
    if (candidates.length < count) throw new Error("Native pool shortage at length " + length);
    chosen.push(...candidates.slice(0, count).map(word => word.slice()));
  }
  const words = shuffle(chosen, rng).sort((a, b) => b.length - a.length);
  const cycleOrder = [0, ...shuffle(Array.from({ length: 28 }, (_, i) => i + 1), rng)];
  const pi = new Array(29), inversePi = new Array(29);
  cycleOrder.forEach((symbol, position) => {
    pi[symbol] = position;
    inversePi[position] = symbol;
  });
  const groups = words.map((plain, index) => {
    const start = index === 0 ? 0 : rng() % 8;
    let phase = start;
    const cipher = plain.map(symbol => {
      if (symbol === 0) return 0;
      const result = inversePi[mod(pi[symbol] + key[phase])];
      phase = (phase + 1) % 8;
      return result;
    });
    return { plain, cipher, start };
  });
  const heldIndices = new Set(shuffle(Array.from({ length: 65 }, (_, i) => i + 1), rng).slice(0, 16));
  const anchor = groups[0];
  const training = [anchor, ...groups.slice(1).filter((_, i) => !heldIndices.has(i + 1))]
    .sort((a, b) => b.plain.length - a.plain.length);
  training.splice(training.indexOf(anchor), 1);
  training.unshift(anchor);
  const holdout = groups.filter((_, i) => heldIndices.has(i));
  return { pi, inversePi, key, training, holdout };
}
function solveOracle(training, nodeLimit = 500000) {
  let nodes = 0, tests = 0, capped = false, maxRank = 0;
  const solutions = new Map();
  const first = addOracleGroup([], training[0], 0);
  if (!first) return { error: "Anchor inconsistent" };
  function visit(inputBasis, remaining, depth) {
    if (nodes++ >= nodeLimit) { capped = true; return; }
    let basis = inputBasis, rest = remaining.slice();
    while (true) {
      maxRank = Math.max(maxRank, basis.length);
      if (basis.length === ORACLE_VARIABLES) {
        const values = new Array(ORACLE_VARIABLES).fill(0);
        for (const entry of basis) values[entry.pivot] = entry.row[ORACLE_VARIABLES];
        const pi = [0, ...values.slice(0, 28)];
        const key = [1, ...values.slice(28)];
        if (new Set(pi).size !== 29 || !isPrimitiveQ8(key)) return;
        for (const group of rest) {
          let found = false;
          for (let start = 0; start < 8; start++) {
            tests++;
            if (addOracleGroup(basis, group, start)) { found = true; break; }
          }
          if (!found) return;
        }
        const signature = pi.join(",") + ";" + key.join(",");
        if (!solutions.has(signature)) solutions.set(signature, { pi, key, depth });
        return;
      }
      if (!rest.length) return;
      let best = null, bestIndex = -1;
      for (let gi = 0; gi < rest.length; gi++) {
        const byBasis = new Map();
        for (let start = 0; start < 8; start++) {
          tests++;
          const next = addOracleGroup(basis, rest[gi], start);
          if (!next) continue;
          const signature = next.map(e => e.pivot + ":" + e.row.join(",")).join("|");
          if (!byBasis.has(signature)) byBasis.set(signature, next);
        }
        const options = [...byBasis.values()];
        if (!options.length) return;
        if (options.length === 1) {
          basis = options[0];
          rest.splice(gi, 1);
          bestIndex = -2;
          break;
        }
        if (!best || options.length < best.length) {
          best = options;
          bestIndex = gi;
        }
      }
      if (bestIndex === -2) continue;
      if (bestIndex < 0) return;
      const nextRest = rest.slice(0, bestIndex).concat(rest.slice(bestIndex + 1));
      for (const option of best) {
        visit(option, nextRest, depth + 1);
        if (capped || solutions.size >= 3) return;
      }
      return;
    }
  }
  visit(first, training.slice(1), 0);
  return { nodes, tests, maxRank, capped, solutions: [...solutions.values()] };
}
function getOracleStarts(group, pi, key) {
  const inversePi = new Array(29);
  pi.forEach((value, symbol) => { inversePi[value] = symbol; });
  const starts = [];
  for (let start = 0; start < 8; start++) {
    let phase = start, valid = true;
    for (let i = 0; i < group.plain.length; i++) {
      const p = group.plain[i], c = group.cipher[i];
      if (p === 0) { if (c !== 0) valid = false; continue; }
      if (inversePi[mod(pi[p] + key[phase])] !== c) { valid = false; break; }
      phase = (phase + 1) % 8;
    }
    if (valid) starts.push(start);
  }
  return starts;
}
function decodeWithDictionary(cipher, pi, key) {
  const inversePi = new Array(29);
  pi.forEach((value, symbol) => { inversePi[value] = symbol; });
  const found = new Set();
  for (let start = 0; start < 8; start++) {
    function walk(index, phase, plain) {
      if (index === cipher.length) {
        const signature = String.fromCharCode(...plain);
        if (dictionarySet.has(signature)) found.add(signature);
        return;
      }
      const c = cipher[index];
      if (c === 0) {
        plain.push(0);
        walk(index + 1, phase, plain);
        plain.pop();
      }
      const p = inversePi[mod(pi[c] - key[phase])];
      if (p !== 0) {
        plain.push(p);
        walk(index + 1, (phase + 1) % 8, plain);
        plain.pop();
      }
    }
    walk(0, start, []);
  }
  return [...found];
}
function runOracleControls() {
  const specs = [
    { seed: 0x51a7, key: [1, 2, 4, 8, 16, 3, 6, 12] },
    { seed: 0x93d1, key: [1, 5, 13, 2, 19, 7, 24, 11] }
  ];
  return specs.map(spec => {
    if (!isPrimitiveQ8(spec.key) || spec.key[0] !== 1) throw new Error("Bad oracle key");
    const plant = makeNativePlant(spec.seed, spec.key);
    const fit = solveOracle(plant.training);
    const solution = fit.solutions[0];
    if (!solution) {
      return { seed: spec.seed, fit, recovered: false };
    }
    const exactPi = solution.pi.every((v, i) => v === plant.pi[i]);
    const exactKey = solution.key.every((v, i) => v === plant.key[i]);
    const trainingStarts = plant.training.map(group => {
      const possible = getOracleStarts(group, solution.pi, solution.key);
      return { exact: possible.length === 1 && possible[0] === group.start, possible: possible.length };
    });
    const holdout = plant.holdout.map(group => {
      const candidates = decodeWithDictionary(group.cipher, solution.pi, solution.key);
      const truth = String.fromCharCode(...group.plain);
      return {
        length: group.plain.length,
        candidates: candidates.length,
        truthIncluded: candidates.includes(truth),
        uniqueCorrect: candidates.length === 1 && candidates[0] === truth
      };
    });
    return {
      seed: spec.seed,
      fit: {
        nodes: fit.nodes,
        tests: fit.tests,
        maxRank: fit.maxRank,
        capped: fit.capped,
        solutions: fit.solutions.length
      },
      exactPi,
      exactKey,
      trainingGroups: plant.training.length,
      trainingStartsUniqueAndCorrect: trainingStarts.filter(x => x.exact).length,
      holdoutGroups: plant.holdout.length,
      holdoutTruthIncluded: holdout.filter(x => x.truthIncluded).length,
      holdoutUniqueCorrect: holdout.filter(x => x.uniqueCorrect).length,
      holdoutCandidateCounts: holdout.map(x => x.candidates)
    };
  });
}

/* Source-selected DIVINITY subcases on the original 66 groups. */
const divinity = [23, 10, 1, 10, 9, 10, 16, 26]; // D I U I N I T Y in published GP29 indices.
const CIPHER = originalGroups;

function makeLinearOps(variableCount) {
  function addRow(basis, input) {
    const rhsIndex = variableCount;
    const row = input.slice();
    for (const entry of basis) {
      const factor = row[entry.pivot];
      if (!factor) continue;
      for (let j = entry.pivot; j <= rhsIndex; j++) {
        row[j] = mod(row[j] - factor * entry.row[j]);
      }
    }
    let pivot = -1;
    for (let j = 0; j < variableCount; j++) {
      if (row[j]) { pivot = j; break; }
    }
    if (pivot < 0) return row[rhsIndex] === 0 ? basis : null;
    const inverse = pow29(row[pivot], 27);
    for (let j = pivot; j <= rhsIndex; j++) row[j] = mod(row[j] * inverse);
    for (const entry of basis) {
      const factor = entry.row[pivot];
      if (!factor) continue;
      for (let j = pivot; j <= rhsIndex; j++) {
        entry.row[j] = mod(entry.row[j] - factor * row[j]);
      }
    }
    const at = basis.findIndex(entry => entry.pivot > pivot);
    const next = { pivot, row };
    if (at < 0) basis.push(next);
    else basis.splice(at, 0, next);
    return basis;
  }
  function combine(a, b) {
    const out = a.map(entry => ({ pivot: entry.pivot, row: entry.row.slice() }));
    for (const entry of b) if (!addRow(out, entry.row)) return null;
    return out;
  }
  return { addRow, combine };
}
function samePhaseCompatible(plain, cipher, start, keySymbols) {
  let phase = start;
  const phases = [];
  for (const symbol of plain) {
    phases.push(phase);
    if (symbol !== 0) phase = (phase + 1) % 8;
  }
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0 && cipher[i] !== 0) return false;
    if (plain[i] === 0) continue;
    for (let j = i + 1; j < plain.length; j++) {
      if (plain[j] === 0) continue;
      const sameRow = keySymbols
        ? keySymbols[phases[i]] === keySymbols[phases[j]]
        : phases[i] === phases[j];
      if (sameRow && ((plain[i] === plain[j]) !== (cipher[i] === cipher[j]))) return false;
    }
  }
  return true;
}
function makeNumericKeyOptions(groupIndex) {
  const key = divinity, cipher = CIPHER[groupIndex], ops = makeLinearOps(28), out = [];
  const words = [...dictionary.values()].filter(x => x.encoded.length === cipher.length);
  for (const entry of words) {
    for (let start = 0; start < 8; start++) {
      if (!samePhaseCompatible(entry.encoded, cipher, start, null)) continue;
      const basis = [];
      let phase = start, valid = true;
      for (let i = 0; i < entry.encoded.length; i++) {
        const p = entry.encoded[i], c = cipher[i];
        if (p === 0) { if (c !== 0) valid = false; continue; }
        const row = new Array(29).fill(0);
        if (c !== 0) row[c - 1] = mod(row[c - 1] + 1);
        row[p - 1] = mod(row[p - 1] - 1);
        row[28] = key[phase];
        if (!ops.addRow(basis, row)) { valid = false; break; }
        phase = (phase + 1) % 8;
      }
      if (valid) out.push({ basis, word: entry.word, encoded: entry.encoded, start });
    }
  }
  return { out, ops };
}
function testNumericDivinity() {
  const a = makeNumericKeyOptions(59);
  const b = makeNumericKeyOptions(4);
  const c = makeNumericKeyOptions(11);
  let pairConsistent = 0, tripleConsistent = 0, fullRank = 0, permutations = 0;
  const pairs = [];
  for (const x of a.out) for (const y of b.out) {
    const merged = a.ops.combine(x.basis, y.basis);
    if (!merged) continue;
    pairConsistent++;
    pairs.push(merged);
  }
  for (const pair of pairs) for (const option of c.out) {
    const merged = a.ops.combine(pair, option.basis);
    if (!merged) continue;
    tripleConsistent++;
    if (merged.length !== 28) continue;
    fullRank++;
    const values = new Array(28).fill(0);
    for (const row of merged) values[row.pivot] = row.row[28];
    if (new Set([0, ...values]).size === 29) permutations++;
  }
  return {
    keyInterpretation: "k_j are the published GP29 numeric values of DIVINITY",
    key: divinity,
    groupIndices: [59, 4, 11],
    optionCounts: [a.out.length, b.out.length, c.out.length],
    pairConsistent,
    tripleConsistent,
    fullRank,
    validPermutations: permutations
  };
}
function makeMappedKeyOptions(groupIndex, limit = Infinity) {
  const cipher = CIPHER[groupIndex], ops = makeLinearOps(28), out = [];
  const allWords = [...dictionary.values()].filter(x => x.encoded.length === cipher.length);
  const eligible = allWords.filter(entry =>
    Array.from({ length: 8 }, (_, start) =>
      samePhaseCompatible(entry.encoded, cipher, start, divinity)
    ).some(Boolean)
  ).sort((a, b) => b.frequency - a.frequency).slice(0, limit);
  const base = [];
  const normalization = new Array(29).fill(0);
  normalization[22] = 1; // pi(D) = 1 fixes the multiplicative gauge.
  normalization[28] = 1;
  ops.addRow(base, normalization);
  for (const entry of eligible) {
    for (let start = 0; start < 8; start++) {
      if (!samePhaseCompatible(entry.encoded, cipher, start, divinity)) continue;
      const basis = base.map(row => ({ pivot: row.pivot, row: row.row.slice() }));
      let phase = start, valid = true;
      for (let i = 0; i < entry.encoded.length; i++) {
        const p = entry.encoded[i], c = cipher[i];
        if (p === 0) { if (c !== 0) valid = false; continue; }
        const row = new Array(29).fill(0);
        if (c !== 0) row[c - 1] = mod(row[c - 1] + 1);
        row[p - 1] = mod(row[p - 1] - 1);
        const keySymbol = divinity[phase];
        if (keySymbol !== 0) row[keySymbol - 1] = mod(row[keySymbol - 1] - 1);
        if (!ops.addRow(basis, row)) { valid = false; break; }
        phase = (phase + 1) % 8;
      }
      if (valid) out.push({ basis, word: entry.word, encoded: entry.encoded, start });
    }
  }
  return { out, ops, eligibleWords: eligible.length };
}
function solveFullPermutation(basis) {
  if (basis.length !== 28) return null;
  const values = new Array(28).fill(0);
  for (const row of basis) values[row.pivot] = row.row[28];
  const pi = [0, ...values];
  return new Set(pi).size === 29 ? pi : null;
}
function testMappedDivinity() {
  const A = makeMappedKeyOptions(59);
  const B = makeMappedKeyOptions(4);
  const D = makeMappedKeyOptions(11);
  const E = makeMappedKeyOptions(2, 30);
  const F = makeMappedKeyOptions(62, 30);
  const pairs = [];
  for (const a of A.out) for (const b of B.out) {
    const merged = A.ops.combine(a.basis, b.basis);
    if (merged) pairs.push(merged);
  }
  let triples = 0, quads = 0, quintupleChecks = 0;
  let fullRank4 = 0, validPi4 = 0, fullRank5 = 0, validPi5 = 0;
  const rank4 = {}, rank5 = {};
  const fourStates = [];
  for (const pair of pairs) for (const d of D.out) {
    const merged = A.ops.combine(pair, d.basis);
    if (!merged) continue;
    triples++;
    for (const e of E.out) {
      const next = A.ops.combine(merged, e.basis);
      if (!next) continue;
      quads++;
      rank4[next.length] = (rank4[next.length] || 0) + 1;
      if (next.length === 28) {
        fullRank4++;
        if (solveFullPermutation(next)) validPi4++;
      }
      fourStates.push(next);
    }
  }
  for (const state of fourStates) {
    for (const f of F.out) {
      const next = A.ops.combine(state, f.basis);
      if (!next) continue;
      quintupleChecks++;
      rank5[next.length] = (rank5[next.length] || 0) + 1;
      if (next.length === 28) {
        fullRank5++;
        if (solveFullPermutation(next)) validPi5++;
      }
    }
  }
  return {
    keyInterpretation: "k_j = pi(DIVINITY_j), with pi(D)=1",
    keySymbols: divinity,
    groupIndices: [59, 4, 11, 2, 62],
    optionCounts: [A.out.length, B.out.length, D.out.length, E.out.length, F.out.length],
    eligibleWordCounts: [A.eligibleWords, B.eligibleWords, D.eligibleWords, E.eligibleWords, F.eligibleWords],
    pairStates: pairs.length,
    tripleStates: triples,
    quadStates: quads,
    rank4,
    fullRank4,
    validPi4,
    quintupleChecks,
    rank5,
    fullRank5,
    validPi5,
    frequencyLimit: "All dictionary candidates for 14/11/13-letter groups; top 30 compatible distinct rune words for 10/8-letter groups"
  };
}

function testMappedDivinityLocalDomains() {
  const counts = CIPHER.map((cipher, index) => {
    const words = [...dictionary.values()].filter(entry => entry.encoded.length === cipher.length);
    const candidates = new Set();
    let phaseOptions = 0;
    for (const entry of words) {
      for (let start = 0; start < 8; start++) {
        if (!samePhaseCompatible(entry.encoded, cipher, start, divinity)) continue;
        phaseOptions++;
        candidates.add(String.fromCharCode(...entry.encoded));
      }
    }
    return { index, length: cipher.length, phaseOptions, candidateWords: candidates.size };
  });
  const sorted = counts.map(entry => entry.candidateWords).sort((a, b) => a - b);
  return {
    groups: counts.length,
    zeroCandidateGroups: counts.filter(entry => entry.candidateWords === 0).map(entry => entry.index),
    minimumCandidateWords: sorted[0],
    medianCandidateWords: sorted[Math.floor(sorted.length / 2)],
    maximumCandidateWords: sorted[sorted.length - 1],
    counts
  };
}

function cycleLengths(permutation) {
  const seen = new Set(), lengths = [];
  for (let i = 0; i < permutation.length; i++) {
    if (seen.has(i)) continue;
    let x = i, length = 0;
    while (!seen.has(x)) {
      seen.add(x);
      length++;
      x = permutation[x];
    }
    lengths.push(length);
  }
  return lengths.sort((a, b) => b - a);
}
const previousCycleFit = JSON.parse(read("im-results/lp2-nonlinear-common-cycle-q8-fhold-blind-fit.json"));

const report = {
  scope: "Strict shared GP29 cycle action: C = pi^-1(pi(P) + k_phase mod 29); plaintext F is transparent and does not advance phase; each printed word has an arbitrary start phase.",
  sourceFiles: repoFiles,
  sourceDimensions: {
    alphabetSize: gp.runes.length,
    originalGroups: originalGroups.length,
    originalRunes: originalGroups.reduce((n, word) => n + word.length, 0),
    nativeControlWords: nativePool.length,
    latinLexiconWordForms: latinWordForms,
    encodedDictionaryForms: dictionary.size
  },
  oracleControls: runOracleControls(),
  sourceSelectedDivinity: {
    numericKey: testNumericDivinity(),
    mappedKeyword: testMappedDivinity(),
    mappedKeywordLocalDomains: testMappedDivinityLocalDomains()
  },
  priorNonlinearCommonCycleFit: {
    originalOuterPermutationCycleLengths: cycleLengths(previousCycleFit.original.T),
    distinction: "The prior SFT uses eight independent phase permutations plus a separate evolving outer permutation. It is not the shared-pi model tested here."
  },
  conclusion: {
    verified: [
      "The strict model is recoverable from 50 known-plaintext native training groups in two deterministic synthetic plants; the recovered pi and q8 key are exact.",
      "A dictionary-based blind holdout recovered the correct rune word uniquely for 13/16 and 12/16 held-out groups in the two controls."
    ],
    rejected: [
      "Direct numeric reuse of the LP1 DIVINITY key in published GP29 indices has no compatible three-long-word assignment: one 14/11 pair survives, and no 13-letter option extends it."
    ],
    unresolved: [
      "The general unknown-q8 shared-cycle model has not been solved or excluded on the original 66 groups.",
      "The pi(DIVINITY) subcase is only frequency-limited on the 10/8-letter groups and did not produce a full-rank permutation in the tested five-group search."
    ]
  }
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
