"use strict";

/**
 * Narrow literary-operator hypothesis: Carroll's Through the Looking-Glass
 * actually prints Jabberwocky as mirror writing. A separate solved Cicada LP1
 * instruction says "DO FOUR UNREASONABLE THINGS EACH DAY"; comparison with
 * the White Queen's "six impossible things" is conjectural, not a verified
 * Cicada attribution.
 *
 * Use fixed source phrases as small GP29 repeating keys after five exactly
 * reversible source-layout mirror operations, optional Atbash, both additive
 * signs and both literal-ciphertext-F interpretations. No learned key,
 * phase, ciphertext tweak or selected word reconstruction.
 *
 * Standalone on Windows: node sims/lp2_caroll_lookingglass_mirror_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const master = fs.readFileSync(path.join(ROOT,
  "resources/transcriptions/liber_primus_master.txt"), "utf8").replace(/\r\n/g, "\n");
const pageTape = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(pageTape.length, 12956);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const lp2 = master.slice(master.indexOf("\n\n") + 2)
  .split("$").slice(7, 16).join("$");

/** @param {string} text @returns {number[]} */
function glyphs(text) {
  return Array.from(text).filter(r => runeIndex.has(r)).map(r => runeIndex.get(r));
}
assert.deepEqual(glyphs(lp2), pageTape);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a @param {number[]} lengths @returns {number[]} */
function mirrorGroups(a, lengths) {
  let offset = 0;
  const out = [];
  for (const n of lengths) {
    for (let k = n - 1; k >= 0; k--) out.push(a[offset + k]);
    offset += n;
  }
  assert.equal(offset, a.length);
  return out;
}
const mirrorLengths = {
  original: [pageTape.length],
  full: [pageTape.length],
  lines: lp2.split(/[\/%]/u).map(s => glyphs(s).length),
  printedWords: lp2.split(/[-.&§$]/u).map(s => glyphs(s).length),
  printedPages: lp2.split(/%/u).map(s => glyphs(s).length)
};
for (const [name, lengths] of Object.entries(mirrorLengths)) {
  assert.equal(lengths.reduce((s, n) => s + n, 0), pageTape.length, name);
}
const variants = {
  original: pageTape,
  full: pageTape.slice().reverse(),
  lines: mirrorGroups(pageTape, mirrorLengths.lines),
  printedWords: mirrorGroups(pageTape, mirrorLengths.printedWords),
  printedPages: mirrorGroups(pageTape, mirrorLengths.printedPages)
};
for (const [name, seq] of Object.entries(variants)) {
  if (name !== "original") {
    assert.deepEqual(mirrorGroups(seq, mirrorLengths[name]), pageTape, name);
  }
}

const gp = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function keyRunes(text) {
  let s = text.toUpperCase().replace(/[^A-Z]/g, "")
    .replace(/[KVQZ]/g, x => ({K:"C", V:"U", Q:"C", Z:"S"})[x]);
  const out = [];
  while (s) {
    const match = gp.find(x => s.startsWith(x.token));
    assert.ok(match, "Unencodable literal key at " + s);
    out.push(match.i);
    s = s.slice(match.token.length);
  }
  return out;
}
const keys = {
  whiteQueen: keyRunes("SIX IMPOSSIBLE THINGS BEFORE BREAKFAST"),
  lookingGlass: keyRunes("THROUGH THE LOOKING GLASS AND WHAT ALICE FOUND THERE"),
  jabberwocky: keyRunes("JABBERWOCKY")
};
assert.deepEqual(Object.fromEntries(Object.entries(keys).map(([n,k])=>[n,k.length])),
  {whiteQueen:31,lookingGlass:40,jabberwocky:11});

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} transparentLiteralF
 * @returns {number[]}
 */
function additiveInverse(cipher, key, sign, transparentLiteralF) {
  let tick = 0;
  return cipher.map(x => {
    if (transparentLiteralF && x === 0) return 0;
    const y = ((x + sign * key[tick % key.length]) % 29 + 29) % 29;
    tick++;
    return y;
  });
}

// Native original solved page p57 is a positive plaintext reference. A
// planted additive ciphertext made from it must decode exactly with no skip.
const genuineClear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(genuineClear.length, 95);
assert.ok(Math.abs(ioc(genuineClear) - 0.06270996640537514) < 1e-12);
for (const [name, key] of Object.entries(keys)) {
  for (const sign of [-1,1]) {
    const planted = genuineClear.map((p, j) => (p - sign * key[j % key.length] + 29) % 29);
    assert.deepEqual(additiveInverse(planted, key, sign, false),
      genuineClear, name + " plant " + sign);
  }
}

const boundaries = corpus.pages.filter(p => p.page <= 55)
  .reduce((a, p) => (a.push(a[a.length - 1] + p.indices.length), a), [0]);
/** @param {number} start @param {number} end @returns {[number,number]} */
function extent(start, end) { return [boundaries[start], boundaries[end + 1]]; }
const regions = {
  p0_2: extent(0,2),
  p3_7: extent(3,7),
  p40_53: extent(40,53),
  p54_55: extent(54,55)
};
assert.deepEqual(Object.fromEntries(Object.entries(regions).map(([name,[lo,hi]]) => [name, hi - lo])),
  {p0_2:729,p3_7:1145,p40_53:3008,p54_55:308});

const stats = {};
let tested = 0;
for (const [name, [lo, hi]] of Object.entries(regions)) {
  const original = pageTape.slice(lo,hi);
  let best = null;
  for (const [mirror, source] of Object.entries(variants)) {
    for (const atbash of [false, true]) {
      const c = source.slice(lo,hi).map(x => atbash ? 28 - x : x);
      for (const [keyName, key] of Object.entries(keys)) {
        for (const sign of [-1,1]) {
          for (const transparentLiteralF of [false,true]) {
            const p = additiveInverse(c,key,sign,transparentLiteralF);
            const score = ioc(p);
            tested++;
            if (!best || score > best.ioc) {
              best = {mirror,atbash,keyName,sign,transparentLiteralF,
                ioc:score,prefix:p.slice(0,35).map(x=>corpus.translit[x]).join("")};
            }
          }
        }
      }
    }
  }
  assert.ok(best.ioc < 0.041, name + " unexpectedly high IoC");
  stats[name] = {runes:original.length,cipherIoC:ioc(original),best};
}
assert.equal(tested, 4 * 5 * 2 * 3 * 2 * 2);
process.stdout.write(JSON.stringify({
  hypothesis:"literal Carroll book/phrase key and mirror transformations",
  attribution:"speculative, NOT a first-party Cicada cipher instruction",
  unknownOriginalRunes:pageTape.length,
  originalWordAndLineMirrors:true,
  tested,
  nativeClearP57IoC:ioc(genuineClear),
  positivePlants:6,
  regions:stats,
  recoveredPlaintext:false
}, null, 2) + "\n");
