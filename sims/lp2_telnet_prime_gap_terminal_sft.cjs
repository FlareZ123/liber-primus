"use strict";

/**
 * Original-source test of the 2013 telnet prime-gap hypothesis against LP2
 * terminal ciphertext. No unknown plaintext or cipher is assumed.
 *
 * GP indices and physical-page offsets are read from the canonical corpus.
 * The historical source reported a consecutive gap of 180 primes between
 * 71 (20th prime) and 1229 (201st prime). The first 256 primes split into
 * that missing interior and a 76-prime visible complement.
 *
 * Run: node sims/lp2_telnet_prime_gap_terminal_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
}

/** @param {number} count */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) if (isPrime(n)) primes.push(n);
  return primes;
}

/** @param {number} v */
function mod29(v) { return ((v % 29) + 29) % 29; }

/** @param {number[]} a */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} a */
function runicTranslit(a) { return a.map(i => corpus.translit[i]).join(""); }

/**
 * A simple, reversible direct GP29 key subtraction/addition.
 * These specific keys are source-derived; the choice of this operation is
 * a hypothesis and does not follow from the telnet transcript alone.
 *
 * @param {number[]} ciphertext
 * @param {number[]} sourcePrimes
 * @param {"prime" | "totient"} reducer
 * @param {boolean} reversed
 * @param {-1 | 1} sign
 * @param {number[]} plant
 */
function test(ciphertext, sourcePrimes, reducer, reversed, sign, plant) {
  const key = sourcePrimes.map(p => mod29(reducer === "prime" ? p : p - 1));
  if (reversed) key.reverse();
  const decode = text => text.map((v, i) => mod29(v + sign * key[i]));
  const encode = text => text.map((v, i) => mod29(v - sign * key[i]));
  const recovered = decode(ciphertext);
  assert.deepEqual(encode(recovered), ciphertext, "Original exact reencryption");
  assert.deepEqual(decode(encode(plant)), plant, "Native-GP positive control");
  return {reducer, reversed, sign, ioc: ioc(recovered),
          runeIndices: recovered, transliteration: runicTranslit(recovered)};
}

const byPage = new Map(corpus.pages.map(p => [p.page, p]));
const interior = [...byPage.get(53).indices, byPage.get(54).indices[0]];
const exterior = byPage.get(55).indices;
const native = byPage.get(57).indices;
assert.equal(byPage.get(53).indices.length, 179);
assert.equal(byPage.get(54).indices[0], 24);
assert.equal(interior.length, 180);
assert.equal(exterior.length, 76);
assert.equal(native.length, 95);

const primes = firstPrimes(464);
assert.equal(primes[19], 71);
assert.equal(primes[200], 1229);
assert.equal(primes[463], 3301);
const missing = primes.slice(20, 200); // ordinals 21–200 inclusive
const visible = [...primes.slice(0, 20), ...primes.slice(200, 256)];
assert.equal(missing.length, interior.length);
assert.equal(visible.length, exterior.length);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);
assert.equal(visible.at(-1), 1619);

// Independent pre-LP2 historical anchor. The solved PARABLE p57 body
// clause sums multiply to the 2013 MP3's archived "Parable" ID3 number.
// Check how the three factors and the red heading align with the telnet
// missing interval without fitting a ciphertext key.
const runePrime = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
const p57Text = require("node:fs").readFileSync(
  require("node:path").join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8"
).split("%")[56];
const primeClauses = p57Text.split(".")
  .map(clause => [...clause].filter(r => runePrime.has(r)))
  .filter(clause => clause.length)
  .map(clause => clause.reduce((sum, r) => sum + runePrime.get(r), 0));
assert.deepEqual(primeClauses, [449, 1259, 1031, 1229]);
assert.equal(primeClauses[1] * primeClauses[2] * primeClauses[3], 1595277641);
const primeOrdinal = value => primes.indexOf(value) + 1;
assert.deepEqual(primeClauses.map(primeOrdinal), [87, 205, 173, 201]);
assert.deepEqual(primeClauses.map(value => missing.includes(value)),
  [true, false, true, false]);
assert.equal(primes[200], primeClauses[3]); // first prime after missing interval
console.log(JSON.stringify({
  independentHistoricalSource: "2013 AUDIO/761.MP3 Parable metadata",
  solvedP57ClausePrimeSums: primeClauses,
  2013AudioParableTagNumber: 1595277641,
  sourcePrimeOrdinals: primeClauses.map(primeOrdinal),
  omittedInTelnetInterval: primeClauses.map(value => missing.includes(value)),
  firstVisibleAfterTelnetGap: 1229,
  causalStatus: "Source overlap only; no cipher key or decryption selected"
}));

console.log(JSON.stringify({
  check: "unaltered source and 2013 gap",
  primeOrdinals: "21–200", missingPrimeEndpoints: [73, 1223],
  beforeAfter: [71, 1229], tableShape: [32, 8],
  tableInterior: 180, tablePerimeter: 76,
  sourceLengths: [179, 1, 76],
  nativeControlPage: 57, nativeControlIoC: ioc(native),
  originalInteriorIoC: ioc(interior), originalExteriorIoC: ioc(exterior)
}));


// A competing 180-rune source framing is *already known plaintext*:
// p56 has 85 published solved runes and clear p57 has 95. A direct prime
// key on those 180 positions has an exact known-plaintext test independent
// of any English statistical model.
const known56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const letterTokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text */
function encodeKnownGP(text) {
  const out = [];
  for (const word of text.split(" ")) {
    for (let pos = 0; pos < word.length;) {
      const found = letterTokens.find(({token}) => word.startsWith(token, pos));
      assert.ok(found, "Cannot spell GP text " + word.slice(pos));
      out.push(found.i);
      pos += found.token.length;
    }
  }
  return out;
}
const plain56 = encodeKnownGP(known56);
assert.equal(plain56.length, 85);
const solvedShifts = [
  ...byPage.get(56).indices.map((v, i) => mod29(v - plain56[i])),
  ...byPage.get(57).indices.map(() => 0)
];
assert.equal(solvedShifts.length, 180);
for (const reducer of ["prime", "totient"]) {
  for (const reversed of [false, true]) {
    for (const sign of [-1, 1]) {
      const key = missing.map(p => mod29(reducer === "prime" ? p : p - 1));
      if (reversed) key.reverse();
      const exact = solvedShifts.map((v, i) => v === mod29(-sign * key[i]));
      const match56 = exact.slice(0, 85).filter(Boolean).length;
      const match57 = exact.slice(85).filter(Boolean).length;
      assert.ok(match56 < 85 || match57 < 95);
      console.log(JSON.stringify({
        knownPlaintextAlternative: "p56+p57 as 180 grid interior",
        reducer, reversed, sign, match56, match57,
        originalPositions: 180
      }));
    }
  }
}


// Literal historical 2013 XOR mechanism on the printed byte table. Cicada
// demonstrably used XOR with a source-supplied file during the 2013 puzzle.
// Align the omitted 180 primes to the 30x6 interior (row-major) and the
// visible first-256-prime complement to the 76-cell perimeter (clockwise
// starting upper-left). This one fully specified native-byte interpretation
// needs no runic transcription, key fitting, phase search, or English score.
const tableRows = require("../resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(tableRows.length, 32);
for (const row of tableRows) assert.equal(row.length, 8);
const primeGridKey = Array.from({length: 32}, () => Array(8).fill(null));
let primeInterior = 0;
for (let y = 1; y < 31; y++) for (let x = 1; x < 7; x++) {
  primeGridKey[y][x] = missing[primeInterior++];
}
assert.equal(primeInterior, 180);
const primeBorder = [];
for (let x = 0; x < 8; x++) primeBorder.push([0, x]);
for (let y = 1; y < 32; y++) primeBorder.push([y, 7]);
for (let x = 6; x >= 0; x--) primeBorder.push([31, x]);
for (let y = 30; y >= 1; y--) primeBorder.push([y, 0]);
assert.equal(primeBorder.length, 76);
primeBorder.forEach(([y, x], i) => primeGridKey[y][x] = visible[i]);
const gridBytes = tableRows.flat();
const keyBytes = primeGridKey.flat().map(k => k & 255);
assert.equal(keyBytes.length, 256);
assert.ok(primeGridKey.flat().every(k => Number.isInteger(k)));
/** @param {number[]} bytes */
const printableCount = bytes => bytes.filter(v => v >= 32 && v <= 126).length;
/** @param {number[]} a @param {number[]} b */
const xorBytes = (a, b) => a.map((v, i) => v ^ b[i]);
const primeXorOutput = xorBytes(gridBytes, keyBytes);
assert.deepEqual(xorBytes(primeXorOutput, keyBytes), gridBytes);
const asciiPlant = Buffer.from("LIKE THE INSTAR TUNNELING TO THE SURFACE. ".repeat(7)).subarray(0, 256);
const plantedCipher = xorBytes([...asciiPlant], keyBytes);
assert.deepEqual(xorBytes(plantedCipher, keyBytes), [...asciiPlant]);
assert.equal(printableCount(gridBytes), 103);
assert.equal(printableCount(primeXorOutput), 89);
console.log(JSON.stringify({
  originalTableByteXorGate: "2013 prime-gap native XOR, original 32x8 positions",
  primeAssignment: "180 inside row-major + 76 clockwise perimeter",
  originalPrintable: printableCount(gridBytes),
  recoveredPrintable: printableCount(primeXorOutput),
  recoveredAsciiPreview: primeXorOutput.map(v => v >= 32 && v <= 126 ?
      String.fromCharCode(v) : ".").join("").slice(0, 128),
  recoveredHex: Buffer.from(primeXorOutput).toString("hex"),
  recoveredOriginalByExactReXor: true,
  plantedAsciiRecoveredExactly: true
}));


/** @param {number} n */
const reversePrimeDigits = n => Number(String(n).split("").reverse().join(""));
// The only two documented double spaces in the 2013 telnet prime output
// immediately precede prime31 and prime3259. Applying the 2013 NUMBER
// decimal-reversal-and-factor operation selects the GP primes13 and
// 89*107, with 89/107 giving adjacent D/IA runes in exactly two red
// original LP2 spans. This is source-only pointer material, not plaintext.
const markedNextPrimes = [31, 3259];
assert.equal(reversePrimeDigits(markedNextPrimes[0]), 13);
assert.equal(reversePrimeDigits(markedNextPrimes[1]), 9523);
assert.equal(89 * 107, 9523);
assert.equal(corpus.prime.indexOf(13), 5);
assert.equal(corpus.prime.indexOf(89), 23);
assert.equal(corpus.prime.indexOf(107), 27);
const ink = require("../resources/liber-primus/lp2-ink-annotations.json");
const selectedRunes = [corpus.runes[23], corpus.runes[27]];
const redHits = [];
for (const page of ink.pages) for (const span of page.red_spans || []) {
  const spanRunes = [...span.runes];
  for (let i = 0; i + 1 < spanRunes.length; i++) {
    if (spanRunes[i] === selectedRunes[0] && spanRunes[i + 1] === selectedRunes[1]) {
      redHits.push({
        page: page.page, localRuneOffset: span.start + i,
        followingRune: spanRunes[i + 2] || null
      });
    }
  }
}
assert.deepEqual(redHits, [
  {page: 53, localRuneOffset: 143, followingRune: corpus.runes[2]},
  {page: 54, localRuneOffset: 3, followingRune: corpus.runes[2]}
]);
// Preserve every occurrence of the source-selected D/IA pair in the three
// page-image-linked terminal members, including the black occurrences. The
// two black continuation runes (p54 then p55) visibly spell L/P, which are
// also the established GP-prime-difference center readout from 2014 squares.
// This is an extraction from ciphertext glyphs, not a deciphered message.
const terminalPairHits = [];
for (const page of corpus.pages.filter(page => [53,54,55].includes(page.page))) {
  for (let i = 0; i + 2 < page.indices.length; i++) {
    if (page.indices[i] === 23 && page.indices[i+1] === 27) {
      terminalPairHits.push({
        page: page.page, offset: i,
        followingIndex: page.indices[i+2],
        followingPrime: corpus.prime[page.indices[i+2]]
      });
    }
  }
}
assert.deepEqual(terminalPairHits, [
  {page: 53, offset: 143, followingIndex: 2, followingPrime: 5},
  {page: 54, offset: 3, followingIndex: 2, followingPrime: 5},
  {page: 54, offset: 90, followingIndex: 20, followingPrime: 73},
  {page: 55, offset: 38, followingIndex: 13, followingPrime: 43}
]);
// The unique p55 D/IA pair starts at the exact 76-rune midpoint.
assert.equal(terminalPairHits[3].offset, exterior.length / 2);
const selectedBlack = terminalPairHits.slice(2);
assert.equal(selectedBlack.map(p => corpus.translit[p.followingIndex]).join(""), "LP");
console.log(JSON.stringify({
  sourceSelector: "2013 NUMBER(3259)=89*107 => GP red D/IA",
  completeTerminalPairHits: terminalPairHits,
  twoRedContinuations: "TH TH",
  twoBlackContinuations: "LP",
  comparison: "2014 square-center GP-prime differences 73,43 => LP",
  status: "source-selected possible signpost, not a recovered plaintext/key"
}));

const originalTriadHits = [];
for (const page of corpus.pages.filter(page => page.page <= 55)) {
  for (let i = 0; i + 2 < page.indices.length; i++) {
    if (page.indices[i] === 23 && page.indices[i+1] === 27 &&
        page.indices[i+2] === 2) {
      originalTriadHits.push({page: page.page, offset: i});
    }
  }
}
assert.deepEqual(originalTriadHits, [
  {page: 53, offset: 143}, {page: 54, offset: 3}
]);
console.log(JSON.stringify({
  historicalInput: "two 2013 telnet doubled spaces before 31 and 3259",
  documentedNumberOperation: "reverse decimal, factor if composite",
  number31: 13, number3259: {reversed: 9523, primeFactors: [89,107]},
  GPselected: ["C", "D", "IA"], redRunePair: ["D", "IA"],
  redPairHits: redHits, completeUnknownTriadHits: originalTriadHits,
  interpretation: "Source-motivated red motif, not a plaintext/key"
}));

// A second historically documented 2013 operator, NUMBER, reverses decimal
// digits of prime inputs before factorizing the reversed number. This is a
// separate *single-rule* gate: decimal reversal of each source prime before
// source-index-preserving GP29 subtraction or whole-table byte XOR. Freeze
// forward order, minus for GP, direct native byte XOR, and no new offsets.

for (const [region, ciphertext, historical] of [
  ["interior", interior, missing],
  ["perimeter", exterior, visible]
]) {
  const reversedPrimeKey = historical.map(p => mod29(reversePrimeDigits(p)));
  const out = ciphertext.map((v, i) => mod29(v - reversedPrimeKey[i]));
  const reenc = out.map((v, i) => mod29(v + reversedPrimeKey[i]));
  assert.deepEqual(reenc, ciphertext);
  console.log(JSON.stringify({
    historicallySelectedNumberOperator: "reverse each missing/visible prime in decimal",
    region, direction: "original prime order, GP29 subtraction",
    decodedIoC: ioc(out), recoveredTransliteration: runicTranslit(out),
    exactRoundtrip: true
  }));
}
const reversedPrimeByteKey = primeGridKey.flat().map(p => reversePrimeDigits(p) & 255);
const reversedPrimeOutput = xorBytes(gridBytes, reversedPrimeByteKey);
assert.deepEqual(xorBytes(reversedPrimeOutput, reversedPrimeByteKey), gridBytes);
assert.equal(printableCount(reversedPrimeOutput), 101);
console.log(JSON.stringify({
  historicallySelectedNumberOperator: "decimal reversal, original table XOR",
  decodedPrintable: printableCount(reversedPrimeOutput),
  decodedHex: Buffer.from(reversedPrimeOutput).toString("hex"),
  exactRoundtrip: true
}));

for (const [region, ciphertext, sourceKey] of [
  ["interior-p53-plus-p54-A", interior, missing],
  ["perimeter-p55", exterior, visible]
]) {
  const plant = Array.from({length: ciphertext.length}, (_, i) => native[i % native.length]);
  for (const reducer of ["prime", "totient"]) {
    for (const reversed of [false, true]) {
      for (const sign of [-1, 1]) {
        const result = test(ciphertext, sourceKey, reducer, reversed, sign, plant);
        console.log(JSON.stringify({
          region, reducer, reversed, sign,
          ioc: result.ioc, runeIndices: result.runeIndices,
          transliteration: result.transliteration,
          plantRecoveredExactly: true, originalReencryptedExactly: true
        }));
      }
    }
  }
}
