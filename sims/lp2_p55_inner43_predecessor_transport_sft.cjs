"use strict";

/**
 * Original LP2 / p55-inner43 reversible predecessor transport.
 * Node.js 22, no dependencies. Uses the unchanged source corpus.
 * A perfect ciphertext round-trip is an implementation check, never key evidence.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const original = pages.flatMap((p) => p.indices);
const glyphs = corpus.runes;
const runeIndex = new Map(glyphs.map((g, i) => [g, i]));
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);

/* In the canonical 57 nonempty physical-page transcription segments, p55
   is segment 54, since the numeric-only physical p50 is omitted. */
const segments = read("resources/lp2-transcription.txt").split("%");
const words = segments[54].replace(/[\s/]/g, "").split(/[.\-&$§]+/).filter(Boolean);
assert.equal(words.length, 17); // p55 begins with a page-crossing singleton.
const key = words.flatMap((w) => Array.from(w).slice(1, -1)).map((r) => {
  assert.ok(runeIndex.has(r), "unexpected GP rune in p55 source");
  return runeIndex.get(r);
});
assert.equal(key.length, 43);
assert.deepEqual(key.slice(0, 8), [19, 10, 12, 6, 23, 2, 27, 24]);

function transform(groups, invert) {
  let clock = 0;
  const out = [];
  for (const pg of groups) {
    const input = pg.indices;
    const block = [input[0]]; // page initial rune is transmitted as-is.
    for (let j = 1; j < input.length; j++) {
      const special = key[(clock + j) % 43];
      const previous = invert ? input[j - 1] : block[j - 1];
      let v;
      if (invert) {
        const c = input[j];
        if (c === previous) v = special;
        else {
          const rank = (c - previous - 1 + 29) % 29;
          v = rank + (rank >= special ? 1 : 0);
        }
      } else {
        const p = input[j];
        if (p === special) v = previous;
        else {
          const rank = p - (p > special ? 1 : 0);
          v = (previous + 1 + rank) % 29;
        }
      }
      block.push(v);
    }
    out.push({page: pg.page, indices: block});
    clock += input.length;
  }
  return out;
}
const decryptedPages = transform(pages, true);
assert.deepEqual(transform(decryptedPages, false).flatMap((p) => p.indices), original);
const decoded = decryptedPages.flatMap((p) => p.indices);

function transliterate(plain) {
  const table = new Map(corpus.translit.map((name, i) => [name, i]));
  const normalized = plain.toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (const match of normalized.matchAll(/[A-Z]+/g)) {
    const word = match[0];
    for (let j = 0; j < word.length;) {
      const digraph = word.slice(j, j + 2);
      if (table.has(digraph)) {
        result.push(table.get(digraph));
        j += 2;
      } else {
        assert.ok(table.has(word[j]), "unmapped native letter");
        result.push(table.get(word[j]));
        j++;
      }
    }
  }
  return result;
}
const english = transliterate(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(english.length, 63114);
const native = english.slice(0, original.length);
let nativeOff = 0;
const nativePages = pages.map((p) => {
  const indices = native.slice(nativeOff, nativeOff + p.indices.length);
  nativeOff += indices.length;
  return {page: p.page, indices};
});
const plant = transform(nativePages, false);
assert.deepEqual(transform(plant, true).flatMap((p) => p.indices), native);
assert.deepEqual(transform(plant, true).map((p) => p.indices.length), pages.map((p) => p.indices.length));

function repeats(groups) {
  const eventPositions = [];
  let off = 0;
  for (const pg of groups) {
    for (let j = 1; j < pg.indices.length; j++) {
      if (pg.indices[j] === pg.indices[j - 1]) {
        eventPositions.push({page: pg.page, local: j, global: off + j});
      }
    }
    off += pg.indices.length;
  }
  return eventPositions;
}
const events = repeats(pages);
const plantedEvents = repeats(plant);
assert.equal(events.length, 86);
assert.equal(plantedEvents.length, 433);
assert.equal(repeats(transform(decryptedPages, false)).length, 86);

function ioc(data) {
  const h = new Array(29).fill(0);
  for (const rune of data) h[rune]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
}
const io = {cipher: ioc(original), originalInverse: ioc(decoded), nativePositive: ioc(native)};
assert.ok(Math.abs(io.cipher - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(io.originalInverse - 0.034530910605726786) < 1e-12);
assert.ok(Math.abs(io.nativePositive - 0.06042070486707437) < 1e-12);

function holdoutScore(ev, period) {
  const freq = new Uint16Array(period);
  const train = ev.filter((e) => e.page <= 27);
  const held = ev.filter((e) => e.page > 27);
  for (const e of train) freq[e.global % period]++;
  const top = Array.from(freq.keys()).sort((a, b) => freq[b] - freq[a] || a - b).slice(0, 3);
  const matches = held.filter((e) => top.includes(e.global % period)).length;
  let ll = 0;
  for (const e of held) {
    const q = (freq[e.global % period] + 0.5) / (train.length + 0.5 * period);
    ll += Math.log(q * period);
  }
  return {period, top, train: train.length, held: held.length, matches, ll};
}
const phase43 = holdoutScore(events, 43);
const phase256 = holdoutScore(events, 256);
assert.deepEqual(phase43.top, [1, 6, 0]);
assert.equal(phase43.matches, 7);
assert.deepEqual(phase256.top, [141, 193, 211]);
assert.equal(phase256.matches, 1);

// A page-specific circular event-mask null retains event counts and the
// cyclic interevent gaps in every original page.
let seed = 0x43c3301;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
function rotateMask() {
  const out = [];
  let off = 0;
  for (const page of pages) {
    const len = page.indices.length - 1;
    const shift = Math.floor(rand() * len);
    for (const j of page.indices.keys()) {
      if (j > 0 && page.indices[j] === page.indices[j - 1]) {
        const local = 1 + ((j - 1 + shift) % len);
        out.push({page: page.page, local, global: off + local});
      }
    }
    off += page.indices.length;
  }
  return out;
}
const B = 20000;
const nulls = {43: {matches: 0, ll: 0}, 256: {matches: 0, ll: 0}};
for (let t = 0; t < B; t++) {
  const e = rotateMask();
  for (const m of [43, 256]) {
    const v = holdoutScore(e, m);
    const ref = m === 43 ? phase43 : phase256;
    if (v.matches >= ref.matches) nulls[m].matches++;
    if (v.ll >= ref.ll) nulls[m].ll++;
  }
}
for (const m of [43, 256]) {
  nulls[m].matchesP = (nulls[m].matches + 1) / (B + 1);
  nulls[m].llP = (nulls[m].ll + 1) / (B + 1);
}
const short = decoded.slice(0, 100).map((i) => corpus.translit[i]).join(".");
console.log(JSON.stringify({pages: pages.length, runes: original.length, doublets: events.length,
  sourceP55Inner43: key, phase43, phase256, nulls, ioc: io,
  nativePlaintextRepeatedOutput: plantedEvents.length, candidatePrefix: short}, null, 2));
if (process.argv.includes("--full")) {
  console.log("CANDIDATE_FULL_GP_INDEXES=" + decoded.join(","));
  console.log("CANDIDATE_FULL_GP_RUNES=" + decoded.map((i) => corpus.runes[i]).join(""));
}
