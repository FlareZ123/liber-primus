"use strict";
/**
 * Source-anchored 2014 onion7 title/id roots and direct GP29 two-rune inverse.
 *
 * The archived HTML title=133 and div id=331 obey 133*331=1 (mod58),
 * with roots 17,12 of -1 in GF29. A natural 2-rune mixing hypothesis is
 * [C0,C1] = [17(P0+P1), 17(P1-P0)] (mod29), inverted exactly by
 * [P0,P1] = [6(C0-C1), 6(C0+C1)] (mod29).
 *
 * An exact, key-independent E-frequency bound permits arbitrary secret
 * 29-symbol output permutations, one independently per inverse channel.
 * This is an original-source conditional exclusion, not a decryption.
 *
 * Node.js 22 CommonJS, no third-party dependencies or file writes.
 * @module onion7_133331_pair_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const html = read("resources/cicada2014-onion7-index.html");
const transcript = read("resources/lp2-transcription.txt");
const english = read("resources/control/shakespeare_first300k.txt");
const pages = gp.pages.filter(page => page.page < 56 && page.indices.length);
const flat = pages.flatMap(page => page.indices);
const glyphIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const runic = transcript.split("%").slice(0, 55).join("")
  .replace(/\/\s*\n/gu, "");
const words = runic.split(/[$.\-&\s]+/u)
  .map(token => [...token].filter(rune => glyphIndex.has(rune))
    .map(rune => glyphIndex.get(rune)))
  .filter(word => word.length);

assert.equal(pages.length, 55);
assert.equal(flat.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), flat);

/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;
const title = Number(/<title>(\d+)<\/title>/u.exec(html)?.[1]);
const elementId = Number(/<div id="(\d+)">/u.exec(html)?.[1]);
const photos = [...html.matchAll(/<img src="(\d+)\.jpg"/gu)]
  .map(match => Number(match[1]));
assert.deepEqual(photos, Array.from({ length: 58 }, (_, i) => i));
assert.equal(title, 133);
assert.equal(elementId, 331);
assert.equal(title * elementId % 58, 1);
assert.equal((title + elementId) % 58, 0);
assert.equal(mod(title), 17);
assert.equal(mod(elementId), 12);
assert.equal(mod(17 * 17), 28);
assert.equal(mod(12 * 12), 28);
assert.equal(mod(17 * 12), 1);
assert.equal(mod(17 * 17 + 12 * 12), 27);

/**
 * Four direct inverse sign/order forms derived from both source roots.
 * Each form is an invertible signed swap of the canonical Hadamard inverse.
 * @param {number} x
 * @param {number} y
 * @param {number} form
 * @returns {[number,number]}
 */
function inversePair(x, y, form) {
  const difference = mod(6 * (x - y));
  const sum = mod(6 * (x + y));
  if (form === 0) return [difference, sum];
  if (form === 1) return [sum, difference];
  if (form === 2) return [mod(-difference), sum];
  if (form === 3) return [sum, mod(-difference)];
  throw new RangeError("Unknown pair orientation");
}

/**
 * A canonical, exact source-root forward transform.
 * @param {number} p
 * @param {number} q
 * @returns {[number,number]}
 */
function forwardPair(p, q) {
  return [mod(17 * (p + q)), mod(17 * (q - p))];
}

/**
 * Apply a source-root pair inverse within independently reset streams.
 * @param {number[][]} streams
 * @param {number} phase
 * @param {number} form
 */
function decode(streams, phase, form) {
  const output = [], channels = [[], []];
  for (const stream of streams) {
    const row = stream.slice();
    for (let i = phase; i + 1 < row.length; i += 2) {
      const [a, b] = inversePair(row[i], row[i + 1], form);
      row[i] = a; row[i + 1] = b;
      channels[0].push(a); channels[1].push(b);
    }
    output.push(...row);
  }
  return { output, channels };
}

/**
 * The largest number of any chosen GP rune attainable after two
 * independently secret bijections on the two inverse output channels.
 * The unmatched runes are conservatively credited as all desired rune.
 * @param {number[][]} streams
 * @param {number} phase
 * @param {number} form
 */
function capacity(streams, phase, form) {
  const result = decode(streams, phase, form);
  const maxes = result.channels.map(channel => {
    const bins = Array(29).fill(0);
    for (const x of channel) bins[x]++;
    return Math.max(...bins);
  });
  const spare = streams.flat().length - 2 * result.channels[0].length;
  return { bound: maxes[0] + maxes[1] + spare,
    channelMaxima: maxes, spare, pairs: result.channels[0].length };
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const bins = Array(29).fill(0);
  for (const x of input) bins[x]++;
  return bins.reduce((total, n) => total + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {string} raw @returns {number[]} */
function tokenize(raw) {
  const source = raw.toUpperCase()
    .replace(/QU/gu, "CW").replace(/V/gu, "U")
    .replace(/K/gu, "C").replace(/Z/gu, "S")
    .replace(/ING/gu, "NG");
  const tokens = gp.translit.map((symbol, i) => ({ symbol, i }))
    .sort((a, b) => b.symbol.length - a.symbol.length);
  const out = [];
  for (const word of source.match(/[A-Z]+/gu) || []) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(token => word.startsWith(token.symbol, i));
      assert.ok(match, "Unencodable GP control word: " + word);
      out.push(match.i);
      i += match.symbol.length;
    }
  }
  return out;
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Encrypt native source exactly and optionally apply the previously
 * proposed 81% collision repair, with the manuscript's word lengths.
 * @param {number[]} plaintext
 * @param {boolean} repair
 */
function plant(plaintext, repair) {
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i += 2) {
    const [a, b] = forwardPair(plaintext[i], plaintext[i + 1]);
    ciphertext.push(a, b);
  }
  if (!repair) return { ciphertext, repairs: 0 };
  const wordPositions = words.flatMap(word => word.map((_, i) => i));
  assert.equal(wordPositions.length, ciphertext.length);
  const random = rng(0x133331), emitted = [];
  let repairs = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    let candidate = ciphertext[i];
    const previous = emitted.at(-1);
    if (i && candidate === previous && random() < 0.81) {
      if (wordPositions[i] >= 6) {
        candidate = mod(24 - 2 * emitted[i - 6]);
        if (candidate === previous)
          candidate = mod(previous + 1 + Math.floor(random() * 28));
      } else {
        candidate = mod(previous + 1 + Math.floor(random() * 28));
      }
      repairs++;
    }
    emitted.push(candidate);
  }
  return { ciphertext: emitted, repairs };
}

/**
 * Source page-cycling candidate, evaluated descriptively against the
 * already-selected 12-17 page-turn arc. No independent significance claim.
 * @param {number} multiplier
 */
function pageWalk(multiplier) {
  const known = new Map(pages.map(page => [page.page, page.indices]));
  const order = Array.from({ length: 58 }, (_, i) =>
    i * multiplier % 58).filter(page => known.has(page));
  let arc = 0, doublets = 0;
  for (let i = 1; i < order.length; i++) {
    const left = known.get(order[i - 1]);
    const right = known.get(order[i]);
    const step = mod(right[0] - left.at(-1));
    arc += Number(step >= 12 && step <= 17);
    doublets += Number(step === 0);
  }
  return { multiplier, joins: order.length - 1, arc, doublets };
}

/** Reproducible complete source-original challenge with positive controls. */
function run() {
  const layouts = {
    book: [flat],
    page: pages.map(page => page.indices),
    word: words,
  };
  const all = [];
  for (const [layout, streams] of Object.entries(layouts))
    for (let phase = 0; phase < 2; phase++)
      for (let form = 0; form < 4; form++) {
        const result = decode(streams, phase, form);
        all.push({ layout, phase, form, pairs: result.channels[0].length,
          pairedIoC: ioc(result.channels.flat()),
          completeIoC: ioc(result.output) });
      }
  all.sort((a, b) => b.pairedIoC - a.pairedIoC);
  const native = tokenize(english).slice(-flat.length);
  assert.equal(native.length, flat.length);
  const nativeE = native.filter(x => x === 18).length;
  const planted = plant(native, false);
  const recovered = decode([planted.ciphertext], 0, 0);
  assert.deepEqual(recovered.output, native);
  const repairedPlant = plant(native, true);
  const repaired = decode([repairedPlant.ciphertext], 0, 0);
  const repairedHits = repaired.output.filter((x, i) => x === native[i]).length;
  assert.equal(repairedPlant.repairs, 266);
  assert.equal(repairedHits, 12432);

  const caps = [];
  for (const [layout, streams] of Object.entries(layouts))
    for (let phase = 0; phase < 2; phase++) {
      const row = capacity(streams, phase, 0);
      caps.push({ layout, phase, ...row,
        nativeE, editsNeededLowerBound:
          Math.max(0, Math.ceil((nativeE - row.bound) / 2)) });
    }
  const pageSecrets = [0, 1].map(phase => {
    const perPage = pages.map(page => capacity([page.indices], phase, 0));
    const bound = perPage.reduce((sum, row) => sum + row.bound, 0);
    return { phase, bound, nativeE, pages: perPage.length,
      editsNeededLowerBound: Math.max(0, Math.ceil((nativeE - bound) / 2)) };
  });
  const result = {
    source: "2014 onion7 HTML title/id, 58 LP2 page images, 29 GP runes",
    exactArithmetic: {
      title, elementId, imageTags: photos.length,
      productMod58: title * elementId % 58,
      residuesGP29: [mod(title), mod(elementId)],
      rootsSquareMod29: [mod(17 * 17), mod(12 * 12)],
      rootDeterminantMod29: mod(17 * 17 + 12 * 12),
      inverse: "[6(C0-C1), 6(C0+C1)] mod29",
    },
    original: {
      pages: pages.length, wholeWords: words.length, runes: flat.length,
      modelsTested: all.length, ranked: all.slice(0, 8),
      canonical: all.find(row =>
        row.layout === "book" && row.phase === 0 && row.form === 0),
      nativeControls: {
        corpus: "Shakespeare last 12956 source GP runes",
        runeCount: native.length, ioc: ioc(native), gpE: nativeE,
      },
      globalSecretChannelCapacity: caps,
      independentPageSecretChannelCapacity: pageSecrets,
      sourcePagePermutation: [pageWalk(1), pageWalk(17), pageWalk(41)],
    },
    positive: {
      exactGPSourceInverse: recovered.output.length,
      syntheticCipherIoC: ioc(planted.ciphertext),
      collisionRepairs: repairedPlant.repairs,
      recoveredAfterRepairs: repairedHits,
      repairedInverseIoC: ioc(repaired.output),
    },
    conclusion: "Source-number pair Hill with direct GP plaintext and even arbitrary secret per-channel output permutations fails on original; changing state, non-GP intermediate, and independently keyed transformations remain open. No unknown LP2 plaintext/key recovered.",
  };
  assert.equal(result.original.ranked[0].layout, "page");
  assert.equal(result.original.ranked[0].phase, 0);
  assert.equal(result.original.ranked[0].form, 0);
  assert.equal(caps.find(x => x.layout === "book" && x.phase === 0).bound, 512);
  assert.equal(caps.find(x => x.layout === "page" && x.phase === 0).bound, 543);
  assert.equal(pageSecrets[0].bound, 1006);
  assert.equal(pageSecrets[1].bound, 1032);
  return result;
}
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + "\n");
module.exports = { run, inversePair, forwardPair, decode, capacity, plant, pageWalk };
