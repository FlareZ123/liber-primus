"use strict";

/**
 * SFT: full 31-of-256 thirteen-dot rank selected by original title133.
 *
 * Uses the already frozen zero-based forward lexicographic convention.
 * The full type-consistent 13-dot tape is a held-out object relative to the
 * later red-only 30-of-255 factor route. This test records its exact rank
 * factorization and source-route labels.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const wrapper = read("resources/historical/stage11-2014-index.html");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find(item =>
      normalized.startsWith(item.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling");
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let out = 1n;
  for (let i = 1; i <= kk; i += 1) {
    out = out * BigInt(n - kk + i) / BigInt(i);
  }
  return out;
}

/** @param {number} n @param {number} k @param {number[]} positions */
function lexRank(n, k, positions) {
  let rank = 0n;
  let previous = -1;
  for (let i = 0; i < k; i += 1) {
    for (
      let candidate = previous + 1;
      candidate < positions[i];
      candidate += 1
    ) {
      rank += choose(n - candidate - 1, k - i - 1);
    }
    previous = positions[i];
  }
  return rank;
}

/** @param {number[]} positions */
const colexRank = positions =>
  positions.reduce(
    (rank, position, index) => rank + choose(position, index + 1),
    0n
  );

/** @param {number} n @param {number[]} positions */
const reversePositions = (n, positions) =>
  positions.map(position => n - 1 - position).sort((a, b) => a - b);

/** @param {bigint} value */
const bitLength = value => value.toString(2).length;

/** @param {bigint} n */
function strongProbablePrime(n) {
  if (n < 2n) return false;
  const bases = [
    2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,
  ];
  for (const p of bases) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1;
  }
  const powMod = (base, exponent, modulus) => {
    let out = 1n;
    let value = base % modulus;
    let power = exponent;
    while (power) {
      if (power & 1n) out = out * value % modulus;
      value = value * value % modulus;
      power >>= 1n;
    }
    return out;
  };
  for (const base of bases) {
    if (base >= n) continue;
    let x = powMod(base, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let round = 1; round < s; round += 1) {
      x = x * x % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/** @param {bigint} n */
function torV2Base32(n) {
  assert.ok(n >= 0n && n < (1n << 80n));
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let out = "";
  for (let shift = 75n; shift >= 0n; shift -= 5n) {
    out += alphabet[Number((n >> shift) & 31n)];
  }
  return out;
}

/** @param {{page:number,offset:number,dots:number,color:string}} mark */
const markSignature = mark =>
  `${mark.page}:${mark.offset}:${mark.dots}:${mark.color}`;

/** @param {number} value */
function isSmallPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const physicalMarks = ink.pages.flatMap(page =>
  (page.large_punctuation || []).map(([offset,dots,color]) => ({
    page:page.page, offset, dots, color,
  }))
);
const classA = physicalMarks.filter(mark => mark.dots === 13);
const classB = physicalMarks.filter(mark =>
  mark.color === "red" && isSmallPrime(mark.dots)
);
const classC = punctuation.events
  .filter(event => event.symbol === "⁜" && event.large_mark)
  .map(event => ({
    page:event.page,
    offset:event.local_rune_offset,
    dots:event.large_mark.dot_count,
    color:event.large_mark.color,
  }));
assert.deepEqual([classA.length,classB.length,classC.length],[31,31,31]);

/** @param {{page:number,offset:number,dots:number,color:string}[]} selected */
function eventTape(selected) {
  const selectedSet = new Set(selected.map(markSignature));
  const events = [];
  let serial = 0;
  for (const page of [...ink.pages].sort((a, b) => a.page - b.page)) {
    for (const span of page.red_spans || []) {
      const runes = Array.from(span.runes);
      for (let i = 0; i < runes.length; i += 1) {
        events.push({
          page:page.page,
          offset:span.start + i + 0.5,
          bit:0,
          kind:"red",
          serial:serial++,
        });
      }
    }
    for (const [offset, dots, color] of page.large_punctuation || []) {
      const mark = {page:page.page,offset,dots,color};
      if (!selectedSet.has(markSignature(mark))) continue;
      events.push({
        ...mark,
        bit:1,
        kind:"mark",
        serial:serial++,
      });
    }
  }
  events.sort((left, right) =>
    left.page - right.page ||
    left.offset - right.offset ||
    ((left.bit ? 0 : 1) - (right.bit ? 0 : 1)) ||
    left.serial - right.serial
  );
  const positions = events
    .map((event, index) => event.bit ? index : null)
    .filter(index => index !== null);
  return {events, positions};
}

assert.match(wrapper, /<title>133<\/title>/u);

const full = eventTape(classA);
assert.equal(full.events.length, 256);
assert.equal(full.positions.length, 31);
assert.deepEqual(full.positions, [
  13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,
  141,142,153,154,163,164,168,169,229,239,240,246,247,255,
]);
assert.equal(bitLength(choose(256,31) - 1n), 133);

// The convention was selected independently by the existing rank-convention
// route. Open the full type-consistent object under that fixed convention.
const rank = lexRank(256, 31, full.positions);
assert.equal(rank, 6823208894503251143167281798760439560912n);
assert.equal(bitLength(rank), 133);

// Exact held-out factorization.
const q13 = 5051n;
const q32 = 3435600587n;
const q79 = 571505208178548184347727n;
const sourceWordCount = 43n;
const q = BigInt(gp0("EMPTY") / 23);
assert.equal(q, 4n);

assert.equal(
  rank,
  (2n ** q) * sourceWordCount * q13 * q32 * q79
);
for (const factor of [43n, q13, q32, q79]) {
  assert.equal(strongProbablePrime(factor), true);
}
assert.equal(bitLength(q13), 13);
assert.equal(bitLength(q32), 32);
assert.equal(bitLength(q79), 79);

// Reconstruct the authenticated 2016 source count rather than hard-coding its
// role solely from the factorization.
const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const signedWords = clear[1].match(/\b[A-Za-z]+\b/gu) || [];
assert.equal(signedWords.length, Number(sourceWordCount));

// Existing independently selected route labels. The p32 page selector and
// p27 carrier start were established before this factorization was opened.
const selectedPage = 32;
const p27CarrierStart = 79;
assert.equal(gp0("EMPTY") / 23, 4);
assert.equal(bitLength(q13), 13); // literal thirteen-dot event type
assert.equal(bitLength(q32), selectedPage);
assert.equal(bitLength(q79), p27CarrierStart);

// Canonical convention controls for the same full object.
const reversed = reversePositions(256, full.positions);
const ranks = {
  lex_forward:lexRank(256,31,full.positions),
  lex_reverse:lexRank(256,31,reversed),
  colex_forward:colexRank(full.positions),
  colex_reverse:colexRank(reversed),
};
const variants = [];
for (const [name, raw] of Object.entries(ranks)) {
  for (const base of [0,1]) {
    const value = raw + BigInt(base);
    variants.push({
      name,
      base,
      bits:bitLength(value),
      exactHeldoutFactorization:
        value === (2n ** q) * sourceWordCount * q13 * q32 * q79,
    });
  }
}
assert.deepEqual(
  variants
    .filter(row => row.exactHeldoutFactorization)
    .map(({name,base}) => ({name,base})),
  [{name:"lex_forward",base:0}]
);

// The authoritative title133 audit froze three natural 31-of-256
// event predicates before this factorization was opened. Only class A
// survives the independently available leading factor 2^q * 43.
const classTapes = [
  ["A_all_physical_13dot", classA],
  ["B_red_prime_dot", classB],
  ["C_chapter_marks", classC],
].map(([name, selected]) => {
  const tape = eventTape(selected);
  assert.equal(tape.events.length, 256);
  assert.equal(tape.positions.length, 31);
  const value = lexRank(256,31,tape.positions);
  return {
    name,
    positions:tape.positions,
    rank:value,
    bits:bitLength(value),
    prefix688:value % ((2n ** q) * sourceWordCount) === 0n,
    exactHeldoutFactorization:
      value === (2n ** q) * sourceWordCount * q13 * q32 * q79,
  };
});
assert.deepEqual(
  classTapes.filter(row => row.prefix688).map(row => row.name),
  ["A_all_physical_13dot"]
);
assert.deepEqual(
  classTapes.filter(row => row.exactHeldoutFactorization).map(row => row.name),
  ["A_all_physical_13dot"]
);

const label = torV2Base32(q79);
assert.equal(label, "pecvyau2ayqym5cp");

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "held-out factorization of the title133-selected full 31-of-256 rank",
  fullState:{
    events:full.events.length,
    marks:full.positions.length,
    positions:full.positions,
    stateSpaceBits:bitLength(choose(256,31) - 1n),
    rank:rank.toString(),
    rankBits:bitLength(rank),
  },
  exactFactorization:{
    expression:"2^4 * 43 * 5051 * 3435600587 * 571505208178548184347727",
    routeLabels:{
      exponent4:"q = GP0(EMPTY)/p",
      factor43:"authenticated signed-2016 word count",
      factor5051Bits:bitLength(q13),
      factor3435600587Bits:bitLength(q32),
      selectedReceiverPage:selectedPage,
      factor571505208178548184347727Bits:bitLength(q79),
      selectedP27CarrierStart:p27CarrierStart,
    },
    factorProbablePrimes:[43n,q13,q32,q79].map(value => ({
      value:value.toString(),
      bits:bitLength(value),
      probablePrime:strongProbablePrime(value),
    })),
  },
  canonicalVariants:variants,
  title133EventClassControl:classTapes.map(row => ({
    name:row.name,
    rank:row.rank.toString(),
    bits:row.bits,
    divisibleBy2pow4Times43:row.prefix688,
    exactHeldoutFactorization:row.exactHeldoutFactorization,
  })),
  torV2Formatting:{
    q79:q79.toString(),
    label,
    onion:label + ".onion",
    caveat:"80-bit formatting is syntactic only; no historical occurrence or p56 page hash is authenticated.",
  },
}, null, 2));
