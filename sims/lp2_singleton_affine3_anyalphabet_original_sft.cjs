#!/usr/bin/env node
"use strict";

/**
 * Exact source-original affine third-order GP29 key exclusion.
 * Node 22/CommonJS, Windows-compatible, read-only.
 *
 * Hypothesis: C[i] = P'[i] + K[i] (mod 29);
 * K[i+3] = a*K[i+2] + b*K[i+1] + c*K[i] + d (mod 29),
 * with arbitrary a,b,c,d and seeds K[0..2] in GF(29).
 * P' may be any fixed secret permutation of GP29 plaintext runes.
 *
 * Thus the printed one-rune English words A/I, generously also O, must
 * give at most three distinct pre-substitution plaintext symbols. An
 * incremental GF(29) linear system enumerates every partition of the
 * original 83 one-rune words into up to three labels, with no restriction
 * on the labels or on K's initial values.
 *
 * The first 13 authentic one-rune positions already contradict all
 * 29^3 choices of (a,b,c), and therefore all 29^7 secret key choices,
 * even with an unknown arbitrary stationary GP29 substitution.
 * Includes a full-length 12,956-rune native-word planted positive.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { encodeWords } = require("./lp2_difference_allletter_capacity_sft.cjs");

const MOD = 29;
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseSharedCorpus();
const cipher = gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const byRune = new Map(gp.runes.map((rune, i) => [rune, i]));
assert.deepEqual([cipher.length, parsed.runeCount, parsed.words.length], [12956, 12956, 2896]);

/** @param {number} x @returns {number} */
function mod(x) { return (x % MOD + MOD) % MOD; }

const inverse = new Int8Array(MOD);
for (let x = 1; x < MOD; x++) {
  for (let y = 1; y < MOD; y++) {
    if ((x * y) % MOD === 1) { inverse[x] = y; break; }
  }
  assert.ok(inverse[x] !== 0);
}

const singleton = [];
let offset = 0;
for (const word of parsed.words) {
  if (word.length === 1) {
    singleton.push({ position: offset, value: byRune.get(word.runes) });
  }
  offset += word.length;
}
assert.equal(offset, 12956);
assert.equal(singleton.length, 83);
assert.deepEqual([singleton[0].position, singleton[0].value], [176, 28]);
assert.deepEqual([singleton[12].position, singleton[12].value], [1814, 8]);
assert.deepEqual([singleton[82].position, singleton[82].value], [12770, 21]);
for (const item of singleton) assert.equal(cipher[item.position], item.value);

/**
 * Four coefficient basis vectors for K[i] under the unknown seeds and d:
 * K[i] = row[i] dot [K0,K1,K2,d] (mod 29).
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {{position:number,value:number}[]} sites
 * @returns {number[][]}
 */
function rowsFor(a, b, c, sites) {
  let x0 = 1, x1 = 0, x2 = 0, x3 = 0;
  let y0 = 0, y1 = 1, y2 = 0, y3 = 0;
  let z0 = 0, z1 = 0, z2 = 1, z3 = 0;
  const rows = [];
  let j = 0;
  for (let i = 3; i <= sites[sites.length - 1].position; i++) {
    const n0 = (a*z0 + b*y0 + c*x0) % MOD;
    const n1 = (a*z1 + b*y1 + c*x1) % MOD;
    const n2 = (a*z2 + b*y2 + c*x2) % MOD;
    const n3 = (a*z3 + b*y3 + c*x3 + 1) % MOD;
    x0 = y0; x1 = y1; x2 = y2; x3 = y3;
    y0 = z0; y1 = z1; y2 = z2; y3 = z3;
    z0 = n0; z1 = n1; z2 = n2; z3 = n3;
    if (i === sites[j].position) {
      rows.push([z0, z1, z2, z3]);
      j++;
      if (j === sites.length) break;
    }
  }
  assert.equal(rows.length, sites.length);
  return rows;
}

/**
 * Add row dot unknownKey + unknownLabel[label] = ciphertextRune.
 * Store echelon rows keyed by their leading nonzero column. A consistent
 * rank-deficient system is retained exactly: every free secret parameter
 * remains possible rather than being replaced by a guessed value.
 *
 * @param {(number[]|null)[]} state
 * @param {number[]} row
 * @param {number} label
 * @param {number} observed
 * @returns {(number[]|null)[]|null}
 */
function extend(state, row, label, observed) {
  const eq = [row[0], row[1], row[2], row[3], 0, 0, 0, observed];
  eq[4 + label] = 1;
  for (let col = 0; col < 7; col++) {
    if (!eq[col]) continue;
    const basis = state[col];
    if (basis) {
      const factor = eq[col];
      for (let k = col; k <= 7; k++) eq[k] = mod(eq[k] - factor * basis[k]);
    } else {
      const factor = inverse[eq[col]];
      for (let k = col; k <= 7; k++) eq[k] = (eq[k] * factor) % MOD;
      const next = state.slice();
      next[col] = eq;
      return next;
    }
  }
  return eq[7] === 0 ? state : null;
}

/**
 * Canonical set partitions enumerate all <=3 secret plaintext identities
 * without triple-counting label renamings. Each branch is a linear system.
 *
 * @param {number[][]} rows
 * @param {{position:number,value:number}[]} sites
 * @returns {{survivors:number,maxPrefix:number,nodes:number}}
 */
function exhaustLabels(rows, sites) {
  let survivors = 0, maxPrefix = 0, nodes = 0;
  /** @param {number} i @param {number} labels @param {(number[]|null)[]} state */
  function visit(i, labels, state) {
    nodes++;
    if (i > maxPrefix) maxPrefix = i;
    if (i === sites.length) { survivors++; return; }
    for (let label = 0; label <= labels && label < 3; label++) {
      const next = extend(state, rows[i], label, sites[i].value);
      if (next) visit(i + 1, Math.max(labels, label + 1), next);
    }
  }
  visit(0, 0, Array(7).fill(null));
  return { survivors, maxPrefix, nodes };
}

/** Produce a genuine GP-native reference plaintext using exact original word lengths. */
function plantNativeWords() {
  const source = encodeWords(read("resources/control/gibran_prophet_58585.txt"));
  const groups = new Map();
  for (const word of source) {
    if (!groups.has(word.length)) groups.set(word.length, []);
    groups.get(word.length).push(word);
  }
  const used = new Map();
  const words = parsed.words.map((original) => {
    const choices = groups.get(original.length);
    assert.ok(choices && choices.length, "Missing native word length " + original.length);
    const n = used.get(original.length) || 0;
    used.set(original.length, n + 1);
    return choices[n % choices.length];
  });
  const plain = words.flat();
  assert.equal(plain.length, 12956);
  return plain;
}

/**
 * Encrypt all 12,956 planted symbols under one third-order generator and
 * an arbitrary stationary permutation of all 29 plaintext rune identities.
 * @param {number[]} plain
 * @returns {{encrypted:number[],decoded:number[]}}
 */
function plantEncrypted(plain) {
  const perm = Array.from({length: MOD}, (_, i) => i);
  for (const [from, to] of [[24,17], [10,4], [3,12]]) {
    const tmp = perm[from]; perm[from] = perm[to]; perm[to] = tmp;
  }
  assert.equal(new Set(perm).size, 29);
  const a = 2, b = 7, c = 4, d = 6;
  const key = [1, 13, 8], encrypted = [], decoded = [];
  for (let i = 0; i < plain.length; i++) {
    if (i >= 3) key[i] = (a*key[i-1] + b*key[i-2] + c*key[i-3] + d) % MOD;
    encrypted[i] = (perm[plain[i]] + key[i]) % MOD;
    decoded[i] = mod(encrypted[i] - key[i]);
    assert.equal(decoded[i], perm[plain[i]]);
  }
  assert.deepEqual(decoded, plain.map((letter) => perm[letter]));
  return { encrypted, decoded };
}

function main() {
  const sourceSites = singleton.slice(0, 13);
  let coefficientTriples = 0, survivorTriples = 0, maxPrefix = 0;
  let nodes = 0;
  const histogram = new Array(14).fill(0);
  for (let a = 0; a < MOD; a++) for (let b = 0; b < MOD; b++)
    for (let c = 0; c < MOD; c++) {
      const result = exhaustLabels(rowsFor(a, b, c, sourceSites), sourceSites);
      coefficientTriples++;
      nodes += result.nodes;
      histogram[result.maxPrefix]++;
      if (result.maxPrefix > maxPrefix) maxPrefix = result.maxPrefix;
      if (result.survivors) survivorTriples++;
    }
  assert.equal(coefficientTriples, 29 ** 3);
  assert.equal(survivorTriples, 0);
  assert.equal(maxPrefix, 12);
  // Original visible illustrated chapters independently restart all seven
  // secret model parameters. These two chapters have enough singletons to
  // invalidate any complete nine-chapter affine3 reset scheme by themselves.
  const chapterChecks = [];
  const windows = [
    {name:"p15-22",start:3603,end:5506,n:18,max:13,nodes:3810676},
    {name:"p40-53",start:9640,end:12648,n:13,max:12,nodes:3829294}
  ];
  for (const scope of windows) {
    const local = singleton.filter(s=>s.position>=scope.start &&
      s.position<scope.end).map(s=>({
        position:s.position-scope.start,value:s.value}));
    assert.equal(local.length,scope.n);
    let feasible=0,top=0,count=0,allNodes=0;
    for(let a=0;a<MOD;a++)for(let b=0;b<MOD;b++)for(let c=0;c<MOD;c++){
      const result=exhaustLabels(rowsFor(a,b,c,local),local);
      count++;
      allNodes+=result.nodes;
      feasible+=result.survivors;
      if(result.maxPrefix>top)top=result.maxPrefix;
    }
    assert.equal(count,29**3);
    assert.equal(feasible,0);
    assert.equal(top,scope.max);
    assert.equal(allNodes,scope.nodes);
    chapterChecks.push({chapter:scope.name,singletonWords:scope.n,
      coefficientTriples:count,feasible,maxPrefix:top,nodes:allNodes});
  }
  const native = plantNativeWords();
  const planted = plantEncrypted(native);
  const plantedSites = singleton.slice(0, 13).map(({position}) =>
    ({ position, value: planted.encrypted[position] }));
  const positive = exhaustLabels(rowsFor(2, 7, 4, plantedSites), plantedSites);
  assert.ok(positive.survivors > 0);
  assert.equal(positive.maxPrefix, 13);
  const out = {
    source: {cipherRunes:12956,words:2896,singletons:83,
      prefixSites:sourceSites.map((s)=>s.position),coefficientTriples,
      survivorTriples,maxPrefix,nodes,byMaxPrefix:histogram},
    hypothesis: "arbitrary degree-3 affine GF29 recurrence + unknown stationary GP29 relabeling",
    independentChapterResets:chapterChecks,
    planted: {runes:planted.encrypted.length,
      originalWordLengthsPreserved:true,exactRoundTrip:true,
      originalSingletonSites:83,allSecretRecoveryTestSites:13,
      positiveSurvivors:positive.survivors}
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  return out;
}
if (require.main === module) main();
module.exports = { main, rowsFor, extend, exhaustLabels };
