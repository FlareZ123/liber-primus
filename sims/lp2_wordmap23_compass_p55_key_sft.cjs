"use strict";

/**
 * Bounded downstream test of the LP2 opening 23-word pointer cycle.
 *
 * Reproduces the 13x12 source map, then:
 *   1. tests the selected 119-rune cycle stream under the solved p56
 *      prime-totient/F-transparent cipher; and
 *   2. tests the 23-rune p32 compass-path output as a periodic GP-index key
 *      on original p55, with the same F-transparent clock.
 *
 * The p32 compass conventions are provisional and inherited from the
 * existing p57/2016 word-map bridge. This is not an authenticated cipher.
 *
 * Run: node sims/lp2_wordmap23_compass_p55_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const opening = parseLP2Words(read("resources/lp2-transcription.txt"), 3);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x, n) => ((x % n) + n) % n;
const page = n => corpus.pages.find(p => p.page === n);
const gpSum = word => [...word.runes].reduce(
  (sum, rune) => sum + corpus.prime[runeIndex.get(rune)], 0);
const ioc = values => {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
};
const runeText = values => values.map(i => corpus.translit[i]).join("");
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

assert.equal(opening.words.length, 158);
assert.equal(opening.runeCount, 729);
const heading = opening.words.slice(0, 2);
const body = opening.words.slice(2);
assert.equal(body.length, 156);
const headingSums = heading.map(gpSum);
assert.deepEqual(headingSums, [347, 315]);
const bodySums = body.map(gpSum);
const nextWord = bodySums.map(value => value % 156);

function orbit(seed) {
  const seen = new Map();
  const sequence = [];
  let at = seed;
  while (!seen.has(at)) {
    seen.set(at, sequence.length);
    sequence.push(at);
    at = nextWord[at];
  }
  const split = seen.get(at);
  return { before: sequence.slice(0, split), cycle: sequence.slice(split) };
}

const selected = orbit(headingSums[0] % 156);
assert.deepEqual(selected.before.map(i => i + 1), [36, 56, 113]);
assert.deepEqual(selected.cycle.map(i => i + 1), [
  6, 65, 112, 35, 25, 120, 4, 96, 15, 68, 54, 152,
  109, 89, 102, 129, 82, 12, 151, 122, 108, 140, 144,
]);
assert.equal(selected.cycle.length, 23);

const cycleWords = selected.cycle.map(i => body[i]);
const cycleLengths = cycleWords.map(w => w.length);
const cycleCipher = cycleWords.flatMap(w => [...w.runes])
  .map(r => runeIndex.get(r));
assert.equal(cycleCipher.length, 119);
assert.equal(cycleLengths.reduce((a, b) => a + b, 0), 119);

/*
 * The p32 121-rune stream is reflowed row-major as an 11x11 grid, and the
 * original p50 256-byte table is read in its checked-in order. This compass
 * convention is provisional: low 3 bits = 8-way direction; high 5 bits =
 * distance. The start is the H at p32 zero-based cell 33.
 */
const p32 = page(32).indices;
assert.equal(p32.length, 121);
assert.equal(table.bytes.length, 256);
assert.equal(runeText(p32.slice(33, 38)), "HOMEX");
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
let row = 3;
let col = 0;
const pathCells = [];
const pathRunes = [];
for (const wordIndex of selected.cycle) {
  const byte = table.bytes[bodySums[wordIndex] % 256];
  const direction = byte & 7;
  const distance = byte >> 3;
  const [dr, dc] = directions[direction];
  row = mod(row + dr * distance, 11);
  col = mod(col + dc * distance, 11);
  const cell = row * 11 + col;
  pathCells.push(cell);
  pathRunes.push(p32[cell]);
}
assert.equal(pathCells.length, 23);
assert.equal(pathCells[11], 54); // one-based cell 55
assert.equal(pathRunes[11], 14); // GP rune X; not the X in HOMEX
const pathKey = pathRunes.slice();
assert.equal(pathKey.length, 23);

function firstPrimes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(candidate);
  }
  return result;
}

/*
 * Solved p56 key family: K_i = (p_i - 1) mod 29, p_i consecutive primes
 * from 2. The p56 transparent-F rule allows plaintext F to pass without
 * consuming a key symbol. Both arithmetic signs are tested.
 */
const p56Key = firstPrimes(300).map(p => (p - 1) % 29);

/**
 * Enumerate every full inverse under the known plaintext-F bypass.
 * sign=-1 means P=C-K; sign=+1 means P=C+K.
 */
function decodeFTransparent(cipher, key, sign, repeat) {
  let states = new Map([[0, [[]]]]);
  for (const c of cipher) {
    const later = new Map();
    const add = (used, plain) => {
      if (!later.has(used)) later.set(used, []);
      later.get(used).push(plain);
    };
    for (const [used, candidates] of states) {
      for (const plain of candidates) {
        if (c === 0) add(used, [...plain, 0]);
        const keyAt = repeat ? used % key.length : used;
        const k = key[keyAt];
        if (k === undefined) continue;
        const p = mod(c + sign * k, 29);
        if (p !== 0) add(used + 1, [...plain, p]);
      }
    }
    states = later;
    if (states.size === 0) break;
  }
  const result = [];
  for (const [used, candidates] of states) {
    for (const plain of candidates) result.push({ used, plain });
  }
  return result;
}

function encryptFTransparent(plain, key, sign, repeat) {
  let used = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const keyAt = repeat ? used % key.length : used;
    const k = key[keyAt];
    assert.notEqual(k, undefined);
    const c = mod(p - sign * k, 29);
    used++;
    return c;
  });
}

function summarize(candidates, wordLengths = null) {
  return candidates.map(candidate => {
    let text;
    if (wordLengths) {
      let offset = 0;
      text = wordLengths.map(length => {
        const token = candidate.plain.slice(offset, offset + length);
        offset += length;
        return runeText(token);
      }).join(" ");
    } else {
      text = runeText(candidate.plain);
    }
    return {
      consumed: candidate.used,
      ioc: ioc(candidate.plain),
      plaintext: text,
    };
  });
}

const solvedP57 = page(57).indices;
assert.equal(solvedP57.length, 95);

const cycleDecryptions = [-1, 1].map(sign => {
  const planted = encryptFTransparent(solvedP57, p56Key, sign, false);
  const plantedInverse = decodeFTransparent(planted, p56Key, sign, false);
  assert.ok(plantedInverse.some(x => same(x.plain, solvedP57)));
  const candidates = decodeFTransparent(cycleCipher, p56Key, sign, false);
  for (const candidate of candidates) {
    assert.deepEqual(
      encryptFTransparent(candidate.plain, p56Key, sign, false),
      cycleCipher,
    );
  }
  return { sign, candidates: summarize(candidates, cycleLengths) };
});
assert.deepEqual(cycleDecryptions.map(x => x.candidates.length), [0, 8]);

/*
 * Candidate receiver: use the 23 selected p32 runes as a repeating GP-index
 * key on original p55. This is a natural downstream test of the 23-cycle,
 * but no source explicitly says that the path is a Vigenere key.
 */
const p55 = page(55).indices;
assert.equal(p55.length, 76);
assert.equal(p55.filter(x => x === 0).length, 3);
const p55Decryptions = [-1, 1].map(sign => {
  const planted = encryptFTransparent(solvedP57, pathKey, sign, true);
  const plantedInverse = decodeFTransparent(planted, pathKey, sign, true);
  assert.ok(plantedInverse.some(x => same(x.plain, solvedP57)));
  const candidates = decodeFTransparent(p55, pathKey, sign, true);
  for (const candidate of candidates) {
    assert.deepEqual(
      encryptFTransparent(candidate.plain, pathKey, sign, true),
      p55,
    );
  }
  return { sign, candidates: summarize(candidates) };
});
assert.deepEqual(p55Decryptions.map(x => x.candidates.length), [4, 1]);

console.log(JSON.stringify({
  model: "LP2 opening 13x12 word-pointer 23-cycle -> p50 byte compass -> p32 path",
  source: {
    openingRunes: opening.runeCount,
    openingWords: opening.words.length,
    headingPrimeSums: headingSums,
    bodyWords: body.length,
    pointerTransientCells1Based: selected.before.map(i => i + 1),
    cycleCells1Based: selected.cycle.map(i => i + 1),
    cycleWords: cycleWords.map(w => runeText([...w.runes].map(r => runeIndex.get(r)))),
    cycleRuneCount: cycleCipher.length,
  },
  compass: {
    startCell1Based: 34,
    startRune: "H",
    pathCells1Based: pathCells.map(x => x + 1),
    pathRunes: pathRunes.map(i => corpus.translit[i]),
    midpointCell1Based: pathCells[11] + 1,
    midpointRune: corpus.translit[pathRunes[11]],
    midpointPage55Pointer: pathCells[11] + 1 === 55,
    endpointCell1Based: pathCells.at(-1) + 1,
  },
  p56TotientCipherOnCycleWords: cycleDecryptions,
  periodicPathKeyOnOriginalP55: p55Decryptions,
  positiveControls: "Solved p57 plaintext re-encrypts and is recovered for all four key/sign combinations.",
  decision: "The exact path reaches an X at cell 55 halfway through, but neither the 119-rune selected cycle stream under the solved p56 cipher nor the 23-rune path as a periodic p55 key yields GP plaintext. This is a navigation observation and two bounded negative readouts, not a decryption.",
}, null, 2));
