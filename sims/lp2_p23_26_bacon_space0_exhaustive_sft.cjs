"use strict";

/**
 * Original LP2 p23-26 201x5 all-key test: 5-bit SPACE=0, A=1,...,Z=26.
 *
 * The five-dot source mark and 16-rune red heading fix exactly 201
 * consecutive five-rune cipher groups. Every original GP rune identity
 * receives one permanent secret bit. All 27 plaintext symbols are
 * source-independent and one-to-one; five-bit codes 27..31 are invalid.
 *
 * Enumerate every 29-bit key under both printed/mirrored quintet orders;
 * score each full passage in both forward/backward orders with a space-aware
 * heldout English quadgram model. An independent 201-character native plant
 * tests exact inversion and full keyspace search.
 *
 * SFT: node sims/lp2_p23_26_bacon_space0_exhaustive_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(root, filename), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = corpus.pages.slice(23, 27);
assert.deepEqual(physical.map((p) => p.page), [23, 24, 25, 26]);
assert.deepEqual(physical.map((p) => p.indices.length), [213, 270, 273, 265]);
assert.deepEqual(physical[0].indices.slice(0, 16),
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const body = physical.flatMap((p) => p.indices).slice(16);
assert.equal(body.length, 1005);
const original = Array.from({length: 201},
  (_, i) => body.slice(5 * i, 5 * i + 5));

/** @param {string} s @returns {string} */
function normalize(s) {
  return s.toUpperCase().replace(/[^A-Z]+/g, " ").trim();
}

/** @param {string} s @returns {number[]} */
function toCodes(s) {
  return [...s].map((x) => x === " " ? 0 : x.charCodeAt(0) - 64);
}

/** @param {number[]} codes @returns {string} */
function toText(codes) {
  return codes.map((x) => x === 0 ? " " : String.fromCharCode(64 + x)).join("");
}

const documents = [
  ["Gibran", normalize(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson", normalize(read("resources/control/emerson_essays_2944.txt"))],
  ["Shakespeare", normalize(read("resources/control/shakespeare_first300k.txt"))]
];

/**
 * Smoothed 27-symbol quadgram model. Each source's 201-character
 * window at offset 5000 is held out (plus its three overlapping flanks).
 * @param {Array<[string,string]>} sources
 * @returns {Float64Array}
 */
function quadgrams(sources) {
  const n = 27 ** 4;
  const counts = new Uint32Array(n);
  let total = 0;
  for (const [, s] of sources) {
    const codes = toCodes(s);
    for (let i = 3; i < codes.length; i++) {
      if (i >= 5000 && i < 5204) continue;
      const idx = ((codes[i - 3] * 27 + codes[i - 2]) * 27 +
        codes[i - 1]) * 27 + codes[i];
      counts[idx]++;
      total++;
    }
  }
  const denom = total + n * 0.04;
  return Float64Array.from(counts, (x) => Math.log((x + 0.04) / denom));
}

/**
 * @param {number[]} input
 * @param {Float64Array} model
 * @returns {number}
 */
function score(input, model) {
  let total = 0;
  for (let i = 0; i + 3 < input.length; i++) {
    const idx = ((input[i] * 27 + input[i + 1]) * 27 +
      input[i + 2]) * 27 + input[i + 3];
    total += model[idx];
  }
  return total;
}

/** @param {number} mask @param {number[][]} groups @returns {number[]} */
function decode(mask, groups) {
  return groups.map((g) =>
    16 * ((mask >>> g[0]) & 1) + 8 * ((mask >>> g[1]) & 1) +
    4 * ((mask >>> g[2]) & 1) + 2 * ((mask >>> g[3]) & 1) +
    ((mask >>> g[4]) & 1));
}

/**
 * 27..31 forbidden iff:
 *   g0=g1=g2=1 (28..31), OR
 *   g0=g1=g3=g4=1 and g2=0 (27).
 * Each condition is a positive and negative bitmask pair; collision
 * of a rune's required-0/required-1 makes that clause impossible.
 *
 * @param {number[][]} groups
 * @returns {{incident: Array<Array<[number,number]>>, clauses:number}}
 */
function forbiddenConstraints(groups) {
  const map = new Map();
  for (const g of groups) {
    let positive = (1 << g[0]) | (1 << g[1]) | (1 << g[2]);
    map.set(String(positive) + ":0", [positive, 0]);
    positive = (1 << g[0]) | (1 << g[1]) |
      (1 << g[3]) | (1 << g[4]);
    const negative = 1 << g[2];
    if (!(positive & negative)) {
      map.set(String(positive) + ":" + String(negative),
        [positive, negative]);
    }
  }
  const incident = Array.from({length: 29}, () => []);
  for (const rule of map.values()) {
    for (let j = 0; j < 29; j++) {
      if ((rule[0] | rule[1]) & (1 << j)) incident[j].push(rule);
    }
  }
  return {incident, clauses: map.size};
}

/**
 * Exact and complete original 29-bit key enumeration. A forbidden
 * condition fires as soon as all its positive and negative assignments
 * are set; no remaining bit can repair the violation.
 * @param {number[][]} groups
 * @param {Float64Array} model
 * @returns {{keys:number, clauses:number, best:{score:number,mask:number,reversed:boolean,text:string,spaces:number}}}
 */
function exhaustive(groups, model) {
  const {incident, clauses} = forbiddenConstraints(groups);
  const order = Array.from({length: 29}, (_, i) => i).sort((a, b) =>
    incident[b].length - incident[a].length || a - b);
  let keys = 0;
  let best = {score: -Infinity, mask: 0, reversed: false, text: "", spaces: 0};

  /** @param {number} depth @param {number} one @param {number} zero */
  function dfs(depth, one, zero) {
    if (depth === 29) {
      keys++;
      const codes = decode(one, groups);
      for (const x of codes) assert.ok(x >= 0 && x <= 26);
      let value = score(codes, model);
      codes.reverse();
      const backwards = score(codes, model);
      const reversed = backwards > value;
      if (reversed) value = backwards;
      if (value > best.score) {
        if (!reversed) codes.reverse();
        best = {
          score: value,
          mask: one,
          reversed,
          text: toText(codes),
          spaces: codes.filter((x) => x === 0).length
        };
      }
      return;
    }

    const bit = 1 << order[depth];
    for (const [nextOne, nextZero] of
      [[one, zero | bit], [one | bit, zero]]) {
      let forbidden = false;
      for (const [p, n] of incident[order[depth]]) {
        if ((nextOne & p) === p && (nextZero & n) === n) {
          forbidden = true;
          break;
        }
      }
      if (!forbidden) dfs(depth + 1, nextOne, nextZero);
    }
  }
  dfs(0, 0, 0);
  return {keys, clauses, best};
}

/**
 * Encode 201 actual natural-language characters under a separate,
 * seeded static 29-bit key. Each produced rune specifies exactly the
 * desired 0/1 digit. This is a source-native non-identity plant.
 * @param {number[]} plaintext
 * @returns {{mask:number, groups:number[][]}}
 */
function plant(plaintext) {
  const ones = new Set([1, 3, 4, 9, 12, 14, 15, 16, 21, 24, 27]);
  const mask = [...ones].reduce((s, i) => s | (1 << i), 0);
  const pool = [
    Array.from({length:29}, (_, i) => i).filter((i) => !ones.has(i)),
    [...ones]
  ];
  let seed = 0x3301c1ca;
  /** @returns {number} */
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const groups = plaintext.map((value) =>
    [16, 8, 4, 2, 1].map((bit) => {
      const choice = pool[(value & bit) ? 1 : 0];
      return choice[random() % choice.length];
    }));
  assert.equal(groups.length, 201);
  assert.deepEqual(decode(mask, groups), plaintext);
  return {mask, groups};
}


/**
 * Ordinary-language necessary condition even when all 26 nonspace output
 * symbols are relabeled by an arbitrary unknown global substitution:
 * - no leading, doubled, or trailing word spaces;
 * - at most two distinct one-letter word symbols (A/I in ordinary English);
 * - every decoded word has a repetition pattern attained by at least one
 * attested source word. These source-word patterns do not depend on any
 * choice of the hidden letter permutation.
 *
 * @param {number[]|string} source
 * @returns {string}
 */
function wordPattern(source) {
  const codes = [...source];
  const labels = new Map();
  let next = 0;
  return codes.map((x) => {
    if (!labels.has(x)) labels.set(x, next++);
    return labels.get(x);
  }).join(",");
}

const wordList = new Set([
  ...read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/).filter((x) => /^[a-z]+\s+\d+$/.test(x))
    .map((x) => x.split(" ")[0].toUpperCase()),
  ...(read("resources/liber-primus/lp1-plaintext-reference.txt")
    .toUpperCase().match(/[A-Z]+/g) || []),
  ...documents.flatMap(([, s]) => s.match(/[A-Z]+/g) || [])
]);
const wordPatterns = new Set([...wordList].map(wordPattern));
assert.equal(wordList.size, 32232);
assert.equal(wordPatterns.size, 6680);

/**
 * @param {number[]} codes
 * @returns {null | {words:number, singleTypes:number, allWordPatterns:boolean}}
 */
function evaluateWords(codes) {
  if (codes[0] === 0 || codes.at(-1) === 0) return null;
  const words = [];
  let current = [];
  for (const c of codes) {
    if (c === 0) {
      if (!current.length) return null;
      words.push(current);
      current = [];
    } else current.push(c);
  }
  words.push(current);
  const singleTypes = new Set(words.filter((w) => w.length === 1)
    .map((w) => w[0])).size;
  return {
    words: words.length,
    singleTypes,
    allWordPatterns: words.every((w) => wordPatterns.has(wordPattern(w)))
  };
}

/**
 * Enumerate all source-admissible stationary rune-bit keys AGAIN, now
 * checking only source-word-pattern conditions. No output letter labels
 * are assigned or fitted. Both output reading directions are checked.
 * @param {number[][]} groups
 * @returns {{validKeys:number, spacedReadings:number, atMostTwoSingletonReadings:number, allPatternReadings:number, fullyCompatibleReadings:number}}
 */
function allSecretOutputPatterns(groups) {
  const {incident} = forbiddenConstraints(groups);
  const order = Array.from({length:29}, (_, i) => i).sort((a,b) =>
    incident[b].length - incident[a].length || a - b);
  const out = {
    validKeys:0, spacedReadings:0, atMostTwoSingletonReadings:0,
    allPatternReadings:0, fullyCompatibleReadings:0
  };

  /** @param {number} depth @param {number} one @param {number} zero */
  function dfs(depth, one, zero) {
    if (depth === 29) {
      out.validKeys++;
      const coded = decode(one, groups);
      for (const direction of [coded, [...coded].reverse()]) {
        const shape = evaluateWords(direction);
        if (!shape) continue;
        out.spacedReadings++;
        if (shape.singleTypes <= 2) out.atMostTwoSingletonReadings++;
        if (shape.allWordPatterns) out.allPatternReadings++;
        if (shape.allWordPatterns && shape.singleTypes <= 2) {
          out.fullyCompatibleReadings++;
        }
      }
      return;
    }
    const bit = 1 << order[depth];
    for (const [o,z] of [[one,zero|bit],[one|bit,zero]]) {
      let rejected = false;
      for (const [p,n] of incident[order[depth]]) {
        if ((o & p) === p && (z & n) === n) {
          rejected = true;
          break;
        }
      }
      if (!rejected) dfs(depth + 1,o,z);
    }
  }
  dfs(0,0,0);
  return out;
}

const model = quadgrams(documents);
const heldout = documents.map(([name, s]) =>
  ({source: name, score: score(toCodes(s.slice(5000, 5201)), model)}));
const printed = exhaustive(original, model);
const mirrored = exhaustive(original.map((g) => [...g].reverse()), model);
assert.equal(printed.keys, 290417);
assert.equal(mirrored.keys, 246239);
assert.equal(printed.clauses, 374);
assert.equal(mirrored.clauses, 378);
assert.ok(Math.abs(printed.best.score - (-3013.325058454772)) < 1e-6);
assert.ok(Math.abs(mirrored.best.score - (-3030.92772181284)) < 1e-6);

const actualPlant = plant(toCodes(documents[0][1].slice(5000, 5201)));
const planted = exhaustive(actualPlant.groups, model);
assert.ok(planted.best.score >= heldout[0].score - 1e-8);
assert.ok(heldout.every((h) =>
  h.score > Math.max(printed.best.score, mirrored.best.score) + 1000));


const spacePermutationGate = {
  printed: allSecretOutputPatterns(original),
  mirrored: allSecretOutputPatterns(original.map((g) => [...g].reverse()))
};
assert.deepEqual(spacePermutationGate.printed, {
  validKeys:290417, spacedReadings:232, atMostTwoSingletonReadings:106,
  allPatternReadings:0, fullyCompatibleReadings:0
});
assert.deepEqual(spacePermutationGate.mirrored, {
  validKeys:246239, spacedReadings:214, atMostTwoSingletonReadings:80,
  allPatternReadings:1, fullyCompatibleReadings:0
});

// Positive control: a complete 201-character source-language phrase with
// word delimiters at BOTH ends, then an unknown global nonspace-letter
// permutation and a seeded stationary 29-rune binary ciphertext carrier.
const native = documents[0][1].slice(5011,5212);
assert.equal(native.length,201);
assert.equal(documents[0][1][5010], " ");
assert.equal(documents[0][1][5212], " ");
const secretAlphabet = Array.from({length:27},(_,i) =>
  i === 0 ? 0 : (((i - 1) * 7 + 5) % 26) + 1);
assert.equal(new Set(secretAlphabet).size,27);
const permuted = toCodes(native).map((i)=> secretAlphabet[i]);
const shapePlant = plant(permuted);
const decodedPlant = decode(shapePlant.mask, shapePlant.groups);
assert.deepEqual(decodedPlant,permuted);
assert.deepEqual(evaluateWords(decodedPlant),{
  words:42, singleTypes:1, allWordPatterns:true
});

console.log(JSON.stringify({
  result: "No GP-native English plaintext/key recovered under fixed 5-bit SPACE0 code",
  source: "Original LP2 pp23-26 red-16 heading, body201x5",
  allOriginalValidKeys: printed.keys + mirrored.keys,
  sourceHoldouts: heldout,
  printed,
  mirrored,
  plantedSource201Exact: true,
  outputPermutationWordPatternGate: spacePermutationGate,
  hiddenPermutationWordPatternPlant: native,
  plantKey: actualPlant.mask,
  plantKeyspace: planted.keys,
  plantedBestScore: planted.best.score
}, null, 2));
