/**
 * Source-only SFT for Rune-Poem artwork ordinal navigation arithmetic.
 *
 * Verifies the fixed Dickins 1915 stanza positions and the corpus-wide
 * page-length checksum family N = GP0(rune) + GPprime(rune).
 *
 * Run from repository root:
 *   node sims/lp2_rune_poem_art_ordinal_navigation_sft.cjs
 */
"use strict";

const fs = require("fs");
const assert = require("assert");

const corpus = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8")
);
const poem = fs.readFileSync(
  "resources/external/dickins1915-rune-poem-old-english.txt",
  "utf8"
);

const stanzas = poem.trim().split(/\n\s*\n/);
assert.strictEqual(stanzas.length, 29, "expected 29 Rune-Poem stanzas");
assert.match(stanzas[24], /^Ac\b/, "stanza25 must be Ac");
assert.match(stanzas[28], /^Ear\b/, "stanza29 must be Ear");

assert.strictEqual(corpus.prime[24], 97, "Ac GP prime weight");
assert.strictEqual(corpus.prime[28], 109, "Ear GP prime weight");
assert.strictEqual(corpus.translit[24], "A", "Ac/GP index24 rune translit");
assert.strictEqual(corpus.translit[28], "EA", "Ear/GP index28 rune translit");

const unsolved = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
assert.strictEqual(unsolved.length, 56, "expected p0..p55");

const hits = [];
for (const page of unsolved) {
  for (let i = 0; i < corpus.prime.length; i += 1) {
    if (page.runic_count === corpus.prime[i] + i) {
      hits.push({
        page: page.page,
        runicCount: page.runic_count,
        runeIndex: i,
        prime: corpus.prime[i],
        translit: corpus.translit[i],
      });
    }
  }
}

assert.deepStrictEqual(hits, [
  { page: 14, runicCount: 137, runeIndex: 28, prime: 109, translit: "EA" },
  { page: 32, runicCount: 121, runeIndex: 24, prime: 97, translit: "A" },
]);

const p32 = unsolved.find((p) => p.page === 32);
const p55 = unsolved.find((p) => p.page === 55);
assert.strictEqual(p32.runic_count, 121);
assert.strictEqual(corpus.prime[24] + 24, 121);
assert.strictEqual(121 - corpus.prime[24], 24);
assert.strictEqual(p55.runic_count, 76);
assert.ok(
  !corpus.prime.some((prime, i) => prime + i === p55.runic_count),
  "p55 must not satisfy the same prime+GP0 checksum"
);

const hrawHits = stanzas
  .map((stanza, i) => ({ ordinal: i + 1, head: stanza.split(/\s+/)[0], stanza }))
  .filter(({ stanza }) => /\bhraw\b/i.test(stanza))
  .map(({ ordinal, head }) => ({ ordinal, head }));
assert.deepStrictEqual(hrawHits, [{ ordinal: 29, head: "Ear" }]);

console.log("PASS lp2_rune_poem_art_ordinal_navigation_sft");
console.log("prime+GP0 page-length hits:", JSON.stringify(hits));
console.log("Ac checksum: 97 + 24 = 121 (p32 rune count); p55 count = 76");
console.log("hraw stanza hits:", JSON.stringify(hrawHits));
