'use strict';

/**
 * Agent24 original-cipher complete inverse and all-key event-clock gate.
 * Run: node sims/lp2_terminal86_echo85_original_sft.cjs
 * Windows Node.js 22; read-only, source-dependent, deterministic.
 *
 * Hypothesis: p54 last10 + p55 76 runes = 86 footer symbols,
 * serving one initial 28-way pad and one new pad per one of the 85
 * adjacent equality (echo) events in the preceding 12,870 runes.
 * An echo encodes EA (GP ordinal28); non-echo positive predecessor
 * differences encode a rank in 0..27 under a footer-selected key.
 *
 * No first-party Cicada instruction authenticates this compound model.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const C = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = C.pages.filter((p) => p.page <= 55 && p.indices.length);
const all = pages.flatMap((p) => p.indices);
assert.equal(all.length, 12956);
const p54 = C.pages.find((p) => p.page === 54).indices;
const p55 = C.pages.find((p) => p.page === 55).indices;
const carry = p54.slice(-10);
const footer = carry.concat(p55);
const body = all.slice(0, -footer.length);
assert.equal(footer.length, 86);
assert.equal(body.length, 12870);
assert.deepEqual(all.slice(-86), footer);

// Fixed source-native physical p55 word lengths and 10-rune page54 carry.
// They were image-and-transcription-adjudicated in the existing source gate.
const wordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.reduce((s, n) => s + n, 0), 76);
const outer = [...carry];
const inner = [];
for (let at = 0, w = 0; w < wordLengths.length; at += wordLengths[w], w++) {
  const length = wordLengths[w];
  for (let j = 0; j < length; j++) {
    (j > 0 && j < length - 1 ? inner : outer).push(p55[at + j]);
  }
}
assert.equal(outer.length, 43);
assert.equal(inner.length, 43);
const interleave = (a, b) => a.flatMap((v, i) => [v, b[i]]);
const orders = {
  physical: footer,
  outerThenInner: outer.concat(inner),
  innerThenOuter: inner.concat(outer),
  outerInnerInterleave: interleave(outer, inner),
  innerOuterInterleave: interleave(inner, outer)
};
for (const value of Object.values(orders)) assert.equal(value.length, 86);

/** @param {number[]} c */
function fromCipher(c) {
  const markers = [], zones = [[]];
  let previous = 0;
  for (let i = 0; i < c.length; i++) {
    const d = (c[i] - previous + 29) % 29;
    if (d === 0) {
      markers.push(i);
      zones.push([]);
    } else {
      zones[zones.length - 1].push(d - 1);
    }
    previous = c[i];
  }
  return { markers, zones };
}
const source = fromCipher(body);
assert.equal(source.markers.length, 85);
assert.equal(source.zones.length, 86);
const lengths = source.zones.map((a) => a.length);
const nonmarkerLength = lengths.reduce((s, n) => s + n, 0);
assert.equal(nonmarkerLength, 12785);
assert.equal(Math.min(...lengths), 5);
assert.equal(Math.max(...lengths), 711);

/**
 * Conditional permutation in each echo-to-echo interval.
 * A marker uses literal EA, advances to the next footer token, and
 * does not consume a 28-way rank. The byte source is GP ordinal.
 *
 * @param {number[]} ciphertext
 * @param {number[]} pads
 * @param {number} sign
 */
function decrypt(ciphertext, pads, sign) {
  const out = [];
  let last = 0, key = 0;
  for (const c of ciphertext) {
    const d = (c - last + 29) % 29;
    if (d === 0) {
      out.push(28);
      key++;
    } else {
      assert(key < pads.length);
      out.push((d - 1 + sign * pads[key] % 28 + 28) % 28);
    }
    last = c;
  }
  assert.equal(key + 1, pads.length);
  return out;
}

/** @param {number[]} plaintext @param {number[]} pads @param {number} sign */
function encrypt(plaintext, pads, sign) {
  const out = [];
  let last = 0, key = 0;
  for (const rune of plaintext) {
    let c;
    if (rune === 28) {
      c = last;
      key++;
    } else {
      assert(rune >= 0 && rune < 28);
      assert(key < pads.length);
      const rank = (rune - sign * (pads[key] % 28) + 28) % 28;
      c = (last + rank + 1) % 29;
    }
    out.push(c);
    last = c;
  }
  assert.equal(key + 1, pads.length);
  return out;
}

/** @param {number[]} a */
function ioc(a) {
  const hist = new Uint32Array(29);
  for (const v of a) hist[v]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * Equal-pair count among non-echo symbols, only within one interval.
 * Invariant under *any* secret 28! bijection independently chosen
 * for each of the 86 intervals. This all-key theorem does not
 * assume the five printed footer orders or a Caesar-shift key.
 *
 * @param {number[][]} zones
 */
function collisionPairs(zones) {
  let pairs = 0, total = 0;
  for (const runes of zones) {
    const hist = new Uint16Array(28);
    for (const x of runes) hist[x]++;
    for (const n of hist) pairs += n * (n - 1) / 2;
    total += runes.length * (runes.length - 1) / 2;
  }
  return { pairs, total, ratio: pairs / total };
}
const original = collisionPairs(source.zones);
assert.equal(original.pairs, 64832);
assert.equal(original.total, 1810104);

const outputs = [];
for (const [name, pad] of Object.entries(orders)) {
  for (const sign of [-1, 1]) {
    const plain = decrypt(body, pad, sign);
    assert.deepEqual(encrypt(plain, pad, sign), body);
    assert.equal(plain.filter((x) => x === 28).length, 85);
    const plainZones = [];
    let zone = [];
    for (const symbol of plain) {
      if (symbol === 28) { plainZones.push(zone); zone = []; }
      else zone.push(symbol);
    }
    plainZones.push(zone);
    assert.deepEqual(collisionPairs(plainZones), original);
    outputs.push({
      order: name, sign, fullRoundtrip: true,
      GP29IoC: Number(ioc(plain).toFixed(12)),
      first45: plain.slice(0, 45).map((x) => C.translit[x]).join('')
    });
  }
}
assert(outputs.every((x) => x.GP29IoC < 0.04));

// A GP-native 28-rune control register, using the identical historic
// transcription convention as the established original-source control.
const ordered = C.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} input */
function native28(input) {
  const result = [];
  for (const token of input.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = token.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const match = ordered.find((x) => word.startsWith(x.s, i));
      assert(match, 'Unmapped source-native digraph near ' + word.slice(i));
      if (match.i !== 28) result.push(match.i);
      i += match.s.length;
    }
  }
  return result;
}

/**
 * Exhaustive contiguous original-geometry window scan in O(86 * n).
 * A shift of the entire native template by one drops one rune and
 * gains one rune in each of the 86 independently alphabeted intervals.
 * 28-symbol frequency updates give the *exact* collision count.
 *
 * @param {number[]} donor
 */
function exhaustiveNative(donor) {
  assert(donor.length >= nonmarkerLength);
  let pairCount = 0;
  const frequencies = lengths.map(() => new Uint16Array(28));
  const offsets = [];
  let at = 0;
  for (let z = 0; z < lengths.length; z++) {
    offsets.push(at);
    const h = frequencies[z];
    for (let j = 0; j < lengths[z]; j++) h[donor[at + j]]++;
    for (const n of h) pairCount += n * (n - 1) / 2;
    at += lengths[z];
  }
  assert.equal(at, nonmarkerLength);
  let min = pairCount, max = pairCount, minAt = 0;
  const windows = donor.length - nonmarkerLength + 1;
  for (let start = 1; start < windows; start++) {
    const previousStart = start - 1;
    for (let z = 0; z < lengths.length; z++) {
      const f = frequencies[z];
      const outgoing = donor[previousStart + offsets[z]];
      const incoming = donor[previousStart + offsets[z] + lengths[z]];
      pairCount -= f[outgoing] - 1;
      f[outgoing]--;
      pairCount += f[incoming];
      f[incoming]++;
    }
    if (pairCount < min) { min = pairCount; minAt = start; }
    if (pairCount > max) max = pairCount;
  }
  // Verify the window-increment algebra at the actual minimum.
  const minimumZones = [];
  let offset = minAt;
  for (const len of lengths) {
    minimumZones.push(donor.slice(offset, offset + len));
    offset += len;
  }
  assert.equal(collisionPairs(minimumZones).pairs, min);
  return { windows, minimum: min, maximum: max, minAt,
    minRatio: min / original.total };
}

const donors = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const nativeControls = [];
for (const [name, file] of donors) {
  const donor = native28(read(file));
  const result = exhaustiveNative(donor);
  assert(result.minimum > original.pairs);
  nativeControls.push({ name, GP28Length: donor.length, ...result });
}

// Full source-length planted GP-native prose. Set the source's 85
// exact EA/echo locations, supply all other runes from an independent
// native English corpus, and preserve all 86 source-footer keys.
const plantDonor = native28(read(donors[0][1]));
const plant = [];
let donorAt = 0;
const echoSet = new Set(source.markers);
for (let i = 0; i < body.length; i++) {
  plant.push(echoSet.has(i) ? 28 : plantDonor[donorAt++]);
}
assert.equal(donorAt, nonmarkerLength);
const plantedCipher = encrypt(plant, orders.outerInnerInterleave, 1);
assert.deepEqual(decrypt(plantedCipher, orders.outerInnerInterleave, 1), plant);
assert.deepEqual(fromCipher(plantedCipher).markers, source.markers);
const plantPairs = collisionPairs(fromCipher(plantedCipher).zones);
assert.equal(plantPairs.pairs, collisionPairs(
  lengths.reduce((arr, length, j) => {
    const start = lengths.slice(0, j).reduce((s, n) => s + n, 0);
    arr.push(plantDonor.slice(start, start + length));
    return arr;
  }, [])).pairs);
assert(plantPairs.pairs > original.pairs);

console.log(JSON.stringify({
  title: 'Terminal 86 GP rune footer / preceding 85 echo source gate',
  original: {
    totalRunes: all.length, bodyRunes: body.length, footerRunes: footer.length,
    bodyEqualNeighborEvents: source.markers.length,
    sourceTerminal43x2: [outer.length, inner.length],
    inferredKeyEpochs: source.zones.length,
    nonEchoRunes: nonmarkerLength,
    minimumEpochLength: Math.min(...lengths),
    maximumEpochLength: Math.max(...lengths)
  },
  exactSourceFooterInverses: outputs,
  allSecret86IndependentRank28Substitutions: original,
  exhaustiveNativeGP28ControlWindows: nativeControls,
  fullyReversibleNativeGPPlant: {
    runes: plant.length, matchedExact85OriginalEchoSites: true,
    recoveredAll: true, equalPairInvariant: plantPairs.pairs
  },
  conclusion: 'The 86=85+1 footer/echo count is exact and admits complete invertible conditional models, but none of ten typed literal footer orders/signs yields original prose. Every tested source-native complete-length register has drastically more same-zone GP28 collisions than the original under every secret fixed alphabet per echo epoch. Evolving within-epoch state and non-native plaintext remain open. No unknown original plaintext or Cicada-authored opcode.'
}, null, 2));
