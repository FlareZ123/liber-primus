'use strict';

/**
 * Source-constrained original-LP2 inverse: the numbered item 1 (139 runes)
 * serves directly as a cyclic or unwrapped GP29 one-time-pad candidate for
 * items 2..5. Exhaust all 139 phases, two directions and both additive signs.
 *
 * The IoC of each recovered candidate is invariant to ANY fixed final
 * 29-rune alphabet relabeling. The 129-rune fifth item has no candidate with
 * as much repeated-symbol mass as any 129-rune contiguous Shakespeare,
 * Gibran or Latin Vulgate GP reference window. This is a finite
 * source-register exclusion, not a recovered LP2 cipher or plaintext.
 *
 * Node.js 22 CommonJS SFT:
 * node sims/numbered_five_anchor_key_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const section = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(36, 39).join('%');
const markers = [...section.matchAll(/[1-5]-/g)];
assert.deepEqual(markers.map(x => Number(x[0][0])), [1, 2, 3, 4, 5]);
const items = markers.map((mark, i) => {
  const end = i === 4 ? section.indexOf('&', mark.index) : markers[i + 1].index;
  assert.ok(end > mark.index);
  return [...section.slice(mark.index + 2, end)]
    .filter(ch => corpus.runes.includes(ch))
    .map(ch => corpus.runes.indexOf(ch));
});
assert.deepEqual(items.map(x => x.length), [139, 91, 98, 96, 129]);
const anchor = items[0];
const MOD = 29;

/** @param {number} value */
function mod(value) { return (value + MOD) % MOD; }

/**
 * @param {number[]} input
 * @returns {number}
 */
function orderedCollisions(input) {
  const counts = new Uint16Array(MOD);
  for (const x of input) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs;
}

/** @param {boolean} reverse @param {number} offset @param {number} index */
function keyAt(reverse, offset, index) {
  const at = (offset + index) % anchor.length;
  return anchor[reverse ? anchor.length - 1 - at : at];
}

/**
 * Given one shorter numbered original ciphertext, recover plaintext under
 * every literal anchor-as-pad candidate. Sign describes the inverse.
 * The only freely selected key parameters are orientation, +/- and phase;
 * every printed rune is preserved and none is learned from reference prose.
 * @param {number[]} ciphertext
 */
function scan(ciphertext) {
  const den = ciphertext.length * (ciphertext.length - 1);
  let best = {orderedPairs: -1}, bestUnwrapped = {orderedPairs: -1};
  for (const reverse of [false, true]) {
    for (const sign of [-1, 1]) {
      for (let offset = 0; offset < anchor.length; offset++) {
        const hist = new Uint16Array(MOD);
        for (let i = 0; i < ciphertext.length; i++) {
          hist[mod(ciphertext[i] + sign * keyAt(reverse, offset, i))]++;
        }
        let orderedPairs = 0;
        for (const n of hist) orderedPairs += n * (n - 1);
        const candidate = {
          reverse, sign, offset, orderedPairs, ioc: orderedPairs / den
        };
        if (orderedPairs > best.orderedPairs) best = candidate;
        if (offset + ciphertext.length <= anchor.length &&
            orderedPairs > bestUnwrapped.orderedPairs)
          bestUnwrapped = candidate;
      }
    }
  }
  return {
    runeCount: ciphertext.length, candidateKeys: anchor.length * 4,
    bestCircular: best, bestUnwrapped,
  };
}

/**
 * Greedy conventional GP transliteration for authentic external prose.
 * Deliberately preserves all 29 GP alphabet labels; no fitted mapping.
 * @param {string} raw
 */
function gpEncode(raw) {
  const order = corpus.translit.map((symbol, index) => ({symbol, index}))
    .sort((a, b) => b.symbol.length - a.symbol.length);
  const input = raw.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let at = 0; at < input.length;) {
    const token = order.find(x => input.startsWith(x.symbol, at));
    if (token === undefined) { at++; continue; }
    out.push(token.index);
    at += token.symbol.length;
  }
  return out;
}

/**
 * Scan EVERY contiguous source window using a rolling 29-bin histogram.
 * All windows have independent length but overlap; these are finite
 * control-set counts, not independently sampled statistical trials.
 * @param {number[]} input
 * @param {number} length
 * @param {number} observedPairs
 */
function sourceWindows(input, length, observedPairs) {
  const counts = new Uint16Array(MOD);
  for (let i = 0; i < length; i++) counts[input[i]]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  let minimum = pairs, minimumOffset = 0, atOrBelow = 0;
  const total = input.length - length + 1;
  for (let offset = 0; offset < total; offset++) {
    if (pairs < minimum) { minimum = pairs; minimumOffset = offset; }
    atOrBelow += Number(pairs <= observedPairs);
    if (offset + length === input.length) break;
    const outgoing = input[offset];
    pairs -= 2 * (counts[outgoing] - 1);
    counts[outgoing]--;
    const incoming = input[offset + length];
    pairs += 2 * counts[incoming];
    counts[incoming]++;
  }
  return {windows: total, minimumOrderedPairs: minimum,
    minimumIoC: minimum / (length * (length - 1)),
    minimumAtRune: minimumOffset,
    windowsAtOrBelowOriginalBest: atOrBelow};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Plant GP-native source symbols under a secret literal anchor pad and
 * recover the correct orientation/sign/phase with the same original scanner.
 * @param {number[]} source
 * @param {() => number} random
 * @param {number} realBound
 */
function positive(source, random, realBound) {
  const length = items[4].length;
  let exactRecovered = 0, clearerThanOriginal = 0;
  for (let trial = 0; trial < 50; trial++) {
    const sourceOffset = random() % (source.length - length);
    const plaintext = source.slice(sourceOffset, sourceOffset + length);
    const reverse = Boolean(random() % 2);
    const sign = random() % 2 ? -1 : 1;
    const offset = random() % anchor.length;
    const ciphertext = plaintext.map((p, i) =>
      mod(p - sign * keyAt(reverse, offset, i)));
    const discovered = scan(ciphertext).bestCircular;
    if (discovered.reverse === reverse && discovered.sign === sign &&
        discovered.offset === offset) exactRecovered++;
    if (discovered.orderedPairs > realBound) clearerThanOriginal++;
    // Verify the TRUE hidden key, independently of which key the scorer picked.
    const decoded = ciphertext.map((x, i) =>
      mod(x + sign * keyAt(reverse, offset, i)));
    assert.deepEqual(decoded, plaintext);
  }
  return {trials: 50, exactKeyRecovered: exactRecovered,
    plantsAboveOriginal: clearerThanOriginal,
    exactForwardAndInverse: true};
}

function main() {
  const original = items.slice(1).map((p, i) => ({
    printedItem: i + 2, ...scan(p)
  }));
  assert.equal(original[3].bestCircular.orderedPairs, 736);
  assert.equal(original[3].bestCircular.offset, 112);
  assert.equal(original[3].bestCircular.reverse, true);
  assert.equal(original[3].bestCircular.sign, -1);

  const latin = read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/)
    .filter(line => /^[0-9A-S]+$/.test(line))
    .flatMap(line => [...line].map(ch => parseInt(ch, 29)));
  const controls = {
    Shakespeare: gpEncode(read('resources/control/shakespeare_first300k.txt')),
    Gibran: gpEncode(read('resources/control/gibran_prophet_58585.txt')),
    LatinVulgate: latin,
  };
  assert.equal(controls.Shakespeare.length, 218800);
  assert.equal(controls.Gibran.length, 63114);
  assert.equal(controls.LatinVulgate.length, 204802);
  const bound = original[3].bestCircular.orderedPairs;
  const sourceWindowControls = Object.fromEntries(
    Object.entries(controls).map(([name, source]) =>
      [name, sourceWindows(source, 129, bound)]));
  for (const entry of Object.values(sourceWindowControls))
    assert.equal(entry.windowsAtOrBelowOriginalBest, 0);
  const random = rng(0x29af4501);
  const plants = Object.fromEntries(
    Object.entries(controls).map(([name, source]) =>
      [name, positive(source, random, bound)]));
  for (const entry of Object.values(plants)) {
    assert.equal(entry.exactKeyRecovered, 50);
    assert.equal(entry.plantsAboveOriginal, 50);
  }
  const result = {
    status: 'Finite source-register original-input exclusion; no plaintext or key recovered',
    source: 'LP2 physical pages 36-38 and original archive scans 53-55',
    itemRuneLengths: items.map(x => x.length),
    keyModel: 'P[i] = (C_item[i] +/- C_item1[(phase+i) mod 139]) mod29, with optional reversal, 139 phases',
    invariant: 'Ordered equal-symbol pairs (GP IoC) remain unchanged under arbitrary fixed final 29-rune output relabeling',
    original,
    fifthItem: {totalPairs:129*128, bestOrderedPairs:bound,
      bestIoC:bound/(129*128),
      exactSourceWindowControls:sourceWindowControls,
      independentHiddenKeyPlants:plants, seed:'0x29af4501'},
    interpretation: 'No original fifth-item inverse matches the exact repeated-rune mass of any contiguous length-129 GP window in the three specified authentic prose controls. Literal first-item GP pad with these native source registers is excluded. Other plaintext languages, source keys, pre-pad alphabet changes, hidden state and additional transformations remain unresolved.',
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = {scan, orderedCollisions, sourceWindows, main};
