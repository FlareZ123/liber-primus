"use strict";
/**
 * Original LP2 four-rune page-private substitution identifiability SFT.
 *
 * One arbitrary reversible 29^4-symbol alphabet per physical page, with an
 * independently selected packet phase per page. The source-visible four-rune
 * packets are taken exactly; incomplete fringe packets are copied unchanged.
 *
 * Native English word-length matched candidates are drawn independently from
 * checked-in Gibran, Shakespeare and Emerson GP29 source encodings.
 * This script proves a complete orbit theorem by constructive extension:
 * two lists of packets are related by some 29^4! permutation iff their
 * positional packet-equality partitions agree. A sparse cycle completion
 * implements a full permutation, fixing every unmentioned packet type.
 *
 * SFT: node sims/lp2_pageprivate_fourblock_orbit_witness_sft.cjs
 * Node.js 22, CommonJS, read-only; no external dependencies or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ps = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const lengths = ps.map(p => p.indices.length);
const cipher = ps.flatMap(p => p.indices);
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const wordLengths = parsed.words.map(w => w.length);
const K = 4;
const ALPHABET = 29 ** K;
assert.equal(ps.length, 55);
assert.equal(cipher.length, 12956);
assert.equal(wordLengths.length, 2896);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), cipher.length);
assert.equal(parsed.crossPageWords, 32);

/** @param {number[]} a @param {number} at @returns {number} */
function packet(a, at) {
  return (((a[at] * 29 + a[at + 1]) * 29 + a[at + 2]) * 29 + a[at + 3]);
}
/** @param {number[]} a @param {number} at @param {number} v */
function writePacket(a, at, v) {
  for (let j = 3; j >= 0; j--) { a[at + j] = v % 29; v = Math.floor(v / 29); }
  assert.equal(v, 0);
}
/**
 * @param {number[]} a
 * @param {number} phase
 * @returns {{ packets:number[], sites:number[], duplicates:number }}
 */
function packets(a, phase) {
  const occurrences = new Set();
  const values = [], sites = [];
  let duplicates = 0;
  for (let at = phase; at + K <= a.length; at += K) {
    const v = packet(a, at);
    if (occurrences.has(v)) duplicates++;
    occurrences.add(v); values.push(v); sites.push(at);
  }
  return { packets: values, sites, duplicates };
}
/**
 * Any injective map f:A→B between equally sized subsets of [0,29^4)
 * extends to a permutation. Complete each maximal directed path
 * from A\B to B\A into a cycle; leave all other states fixed.
 * @param {number[]} from Distinct packet identities, in position order
 * @param {number[]} to Distinct target packet identities, in position order
 */
function extendPermutation(from, to) {
  assert.equal(from.length, to.length);
  assert.equal(new Set(from).size, from.length);
  assert.equal(new Set(to).size, to.length);
  const f = new Map(), inverse = new Map();
  for (let i = 0; i < from.length; i++) {
    const x = from[i], y = to[i];
    assert(x >= 0 && x < ALPHABET && y >= 0 && y < ALPHABET);
    f.set(x, y); inverse.set(y, x);
  }
  const original = from.length;
  const starts = from.filter(x => !inverse.has(x));
  for (const start of starts) {
    let end = f.get(start);
    let count = 0;
    while (f.has(end)) {
      end = f.get(end);
      count++;
      assert(count <= original, "partial permutation path must terminate");
    }
    assert(!inverse.has(start));
    assert(inverse.has(end));
    f.set(end, start);
    inverse.set(start, end);
  }
  assert.equal(f.size, original + starts.length);
  assert.equal(inverse.size, f.size);
  for (const [x, y] of f) assert.equal(inverse.get(y), x);
  const forward = x => f.has(x) ? f.get(x) : x;
  const backward = x => inverse.has(x) ? inverse.get(x) : x;
  // Every other state is fixed, so this sparse map is a complete permutation.
  for (const x of new Set([...f.keys(), ...f.values()])) {
    assert.equal(backward(forward(x)), x);
    assert.equal(forward(backward(x)), x);
  }
  return { forward, backward, nontrivialStates: f.size, pathsClosed: starts.length };
}
// Independent orbit positive control, including overlapping domain/range,
// fixed points, directed cycles and open paths.
for (const [a, b] of [
  [[1, 2, 3], [2, 4, 5]],
  [[1, 2, 3], [2, 3, 1]],
  [[1, 2, 3], [1, 3, 7]],
  [[5], [5]]
]) {
  const p = extendPermutation(a, b);
  for (let i = 0; i < a.length; i++) {
    assert.equal(p.forward(a[i]), b[i]);
    assert.equal(p.backward(b[i]), a[i]);
  }
}
/** Find a phase on this page producing no repeated output packets. */
function zeroPhase(a) {
  for (let phase = 0; phase < K; phase++) {
    if (!packets(a, phase).duplicates) return phase;
  }
  return -1;
}
assert(ps.every(p => [0, 1, 2, 3].every(ph => packets(p.indices, ph).duplicates === 0)));
let seed = 0x33012026;
/** Identical seeded donor sampling as the prior original-block gate. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const output = { k: K, radix: 29, packetAlphabet: ALPHABET, runes: cipher.length,
  physicalTextPages: ps.length, printedWords: wordLengths.length,
  samplesPerSource: 96, seed: "0x33012026", originalPagePhaseCollisions: [0,0,0,0],
  donorCounts: {}, witnesses: [], exactOriginalReplays: 0, nativeRuneTargetCoverage: [] };
let donorNumber = 0;
for (const [name, file] of controls) {
  const pools = Array.from({ length: 30 }, () => []);
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const w = encodeSourceNativeGP(word);
    pools[w.length].push(w);
  }
  assert(wordLengths.every(n => pools[n].length > 0));
  let survivors = 0;
  for (let trial = 0; trial < 96; trial++, donorNumber++) {
    const donor = [];
    for (const n of wordLengths) {
      const pool = pools[n];
      donor.push(...pool[random() % pool.length]);
    }
    assert.equal(donor.length, cipher.length);
    let offset = 0, possible = true;
    const phases = [];
    for (const n of lengths) {
      const phase = zeroPhase(donor.slice(offset, offset + n));
      phases.push(phase);
      if (phase < 0) possible = false;
      offset += n;
    }
    assert.equal(offset, cipher.length);
    if (!possible) continue;
    survivors++;
    // Compute an explicit original-cipher -> donor packet S-box for every
    // physical page and exact original replay through its full permutation.
    const decoded = cipher.slice();
    let completed = 0, touched = 0, pathsClosed = 0;
    offset = 0;
    for (let page = 0; page < lengths.length; page++) {
      const n = lengths[page], ph = phases[page];
      const c = cipher.slice(offset, offset + n);
      const p = donor.slice(offset, offset + n);
      const cb = packets(c, ph), pb = packets(p, ph);
      assert.equal(cb.duplicates, 0);
      assert.equal(pb.duplicates, 0);
      assert.deepEqual(cb.sites, pb.sites);
      const map = extendPermutation(cb.packets, pb.packets);
      pathsClosed += map.pathsClosed;
      for (let i = 0; i < cb.sites.length; i++) {
        const at = cb.sites[i];
        const y = map.forward(cb.packets[i]);
        assert.equal(y, pb.packets[i]);
        assert.equal(map.backward(y), cb.packets[i]);
        writePacket(decoded, offset + at, y);
        completed++;
        touched += K;
      }
      offset += n;
    }
    const recipher = decoded.slice();
    offset = 0;
    for (let page = 0; page < lengths.length; page++) {
      const n = lengths[page], ph = phases[page];
      const original = cipher.slice(offset, offset + n);
      const target = donor.slice(offset, offset + n);
      const cb = packets(original, ph), pb = packets(target, ph);
      const map = extendPermutation(cb.packets, pb.packets);
      for (const at of cb.sites) writePacket(recipher, offset + at, map.backward(packet(decoded, offset + at)));
      offset += n;
    }
    assert.deepEqual(recipher, cipher);
    let count = 0;
    for (let i = 0; i < donor.length; i++) if (donor[i] === decoded[i]) count++;
    assert(count >= touched);
    output.exactOriginalReplays++;
    output.nativeRuneTargetCoverage.push(touched);
    if (output.witnesses.length < 3) output.witnesses.push({
      source: name, trial, packetBlocks: completed, matchedNativeRunes: touched,
      fringeRunesCopiedOriginal: cipher.length - touched,
      pathsClosed, originalReplay: true, pages: ps.length,
      phasesFirst12: phases.slice(0,12)
    });
  }
  output.donorCounts[name] = survivors;
}
assert.equal(Object.values(output.donorCounts).reduce((a,b)=>a+b,0),13);
assert.equal(output.exactOriginalReplays,13);
assert(output.nativeRuneTargetCoverage.every(x=>x>12000));
output.conditionalConclusion =
  "For all complete page-private 4-rune packets, equality partition is the COMPLETE invariant under arbitrary pagewise 29^4! bijections. Source has no collisions at ANY phase; 13 of 288 source-native exact-layout prose candidates share some phase per page and admit explicit sparse full 29^4-state permutation completions with exact original replay. Untransformed leading/trailing partial packets are not native plaintext; no authored key/phase/fringe rule or unknown LP2 plaintext is recovered.";
process.stdout.write(JSON.stringify(output, null, 2)+"\n");
