'use strict';

/**
 * Source-selected FIND=151, rival radix59/radix60 concentric-ring inverse SFT.
 * Node.js 22 CommonJS, deterministic and read-only.
 *
 * Historical GP prime rule and authentic clear p57 word FIND yield 151.
 * The original 32x8 two-character table contains exactly one 151 under each
 * candidate alphabet, but at geometrically different locations:
 * radix60: row27/col7 (ring0), radix59: row18/col6 (ring1).
 *
 * Freeze the source-defined 76+68+60+52 perimeter decomposition and the
 * independently known 85-rune decrypted p56 + 95-rune clear p57 terminal
 * plaintext. Both directions of continuous adjacent-ring spiral, raw cell
 * modulo29 or Euler-totient modulo29, and both additive inverse signs are
 * tested without fitting source phases. A source-native plant checks each
 * direct shift exactly; no key or plaintext is claimed from original p55.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'lp2-transcription.txt'), 'utf8');
const MOD = 29;
const columns = 8, rows = 32;
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.translit.length, MOD);
assert.equal(corpus.pages.find(p => p.page === 55).indices.length, 76);
assert.equal(corpus.pages.find(p => p.page === 56).indices.length, 85);
assert.equal(corpus.pages.find(p => p.page === 57).indices.length, 95);

// Confirm that the target comes from an actual *printed solved GP word*,
// not a string reconstructed from guessed LP2 plaintext.
const finalSource = transcription.split('%').at(-1);
const finalWords = finalSource.replace(/[/\r\n§]/g, '')
  .split(/[-.]/).filter(Boolean);
const findGlyphs = 'ᚠᛁᚾᛞ';
assert.equal(finalWords.filter(w => w === findGlyphs).length, 1);
assert.equal(finalWords.length, 20);
const gpFind = Array.from(findGlyphs, r => corpus.runes.indexOf(r));
assert.deepEqual(gpFind, [0, 10, 9, 23]);
const findPrimeSum = gpFind.reduce((s, i) => s + corpus.prime[i], 0);
assert.equal(findPrimeSum, 151);

// The full conventional alphabet includes lower-case f. None of 256
// original tokens contains that character; excluding it defines a second
// integer-valued interpretation with a different radix.
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert(tokens.every(t => t.length === 2 && !t.includes('f')));
function numeralBytes(alphabet) {
  const base = alphabet.length;
  return tokens.map(t => {
    const high = alphabet.indexOf(t[0]);
    const low = alphabet.indexOf(t[1]);
    assert(high >= 0 && low >= 0);
    return high * base + low;
  });
}
const bytes60 = numeralBytes(alphabet60);
const bytes59 = numeralBytes(alphabet59);
assert.deepEqual(bytes60, grid.bytes);
assert(bytes59.every(v => v >= 0 && v <= 255));
const src151 = [];
for (const [radix, bytes] of [[59, bytes59], [60, bytes60]]) {
  const positions = bytes.map((v, i) => v === 151 ? i : -1)
    .filter(i => i >= 0);
  assert.equal(positions.length, 1);
  const index = positions[0], row = Math.floor(index / columns);
  const column = index % columns;
  const ring = Math.min(row, rows - 1 - row, column, columns - 1 - column);
  src151.push({radix, index, row, column, ring, token: tokens[index]});
}
assert.deepEqual(src151, [
  {radix: 59, index: 150, row: 18, column: 6, ring: 1, token: '2X'},
  {radix: 60, index: 223, row: 27, column: 7, ring: 0, token: '2V'}
]);

function ring(depth) {
  const top = depth, bottom = rows - 1 - depth;
  const left = depth, right = columns - 1 - depth;
  const result = [];
  for (let col = left; col <= right; col++) result.push(top * columns + col);
  for (let row = top + 1; row <= bottom; row++)
    result.push(row * columns + right);
  for (let col = right - 1; col >= left; col--)
    result.push(bottom * columns + col);
  for (let row = bottom - 1; row > top; row--)
    result.push(row * columns + left);
  return result;
}
const allRings = Array.from({length: 4}, (_, i) => ring(i));
assert.deepEqual(allRings.map(r => r.length), [76, 68, 60, 52]);
assert.equal(allRings.flat().length, 256);
assert.equal(new Set(allRings.flat()).size, 256);

function inward(index, depth) {
  let row = Math.floor(index / columns), col = index % columns;
  if (col === columns - 1 - depth) col--;
  else if (col === depth) col++;
  else if (row === depth) row++;
  else if (row === rows - 1 - depth) row--;
  return row * columns + col;
}

/**
 * Continuous physical spiral: enter at unique 151 and wind its entire
 * perimeter. Advance one adjacent cell toward center after completing
 * the current ring. The two signs of winding are independent hypotheses.
 */
function spiral(firstIndex, firstDepth, direction) {
  const output = [];
  let start = firstIndex;
  for (let depth = firstDepth; depth < 4; depth++) {
    const perimeter = allRings[depth];
    const index = perimeter.indexOf(start);
    assert(index >= 0);
    const run = Array.from({length: perimeter.length}, (_, j) =>
      perimeter[(index + direction * j + perimeter.length * 2) %
        perimeter.length]);
    output.push(...run);
    if (depth < 3) {
      start = inward(run.at(-1), depth);
      assert(allRings[depth + 1].includes(start));
    }
  }
  assert.equal(output.length, firstDepth === 0 ? 256 : 180);
  assert.equal(new Set(output).size, output.length);
  return output;
}

function totient(input) {
  if (input === 0) return 0; // fixed downstream numerical convention
  let n = input, value = input;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) {
      while (n % divisor === 0) n /= divisor;
      value -= value / divisor;
    }
  }
  if (n > 1) value -= value / n;
  return Math.round(value);
}
assert.equal(totient(151), 150);
assert.equal(totient(59), 58);

// Positive reference: recover the genuinely solved p56 using its historically
// established first-prime-2 sequential-totient cipher and transparent F at 56.
function primes(n) {
  const found = [];
  for (let x = 2; found.length < n; x++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= x; divisor++)
      if (x % divisor === 0) {prime = false; break;}
    if (prime) found.push(x);
  }
  return found;
}
const c56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(c56[56], 0);
const primeSeries = primes(84);
let keyPosition = 0;
const p56 = c56.map((c, j) => {
  if (j === 56) return 0;
  const key = (primeSeries[keyPosition++] - 1) % MOD;
  const plain = (c - key + MOD) % MOD;
  assert.notEqual(plain, 0, 'Nonliteral F violates solved source method');
  return plain;
});
assert.equal(keyPosition, 84);
assert(p56.map(x => corpus.translit[x]).join('').startsWith(
  'ANENDWITHINTHEDEEPWEB'));
const terminal = p56.concat(p57);
assert.equal(terminal.length, 180);
const symbolIc = letters => {
  const f = Array(MOD).fill(0);
  for (const s of letters) f[s]++;
  return f.reduce((sum, x) => sum + x * (x - 1), 0) /
    (letters.length * (letters.length - 1));
};
function mod29(value) {return ((value % MOD) + MOD) % MOD;}

// Every run tests a finite original-cipher/known-text candidate with no
// parameter fitted from its output.
const knownReadout = [];
for (const clue of src151) {
  const cells = clue.radix === 59 ? bytes59 : bytes60;
  for (const direction of [1, -1]) {
    const all = spiral(clue.index, clue.ring, direction);
    const inner = clue.ring === 0 ? all.slice(76) : all;
    assert.equal(inner.length, 180);
    for (const map of ['raw', 'totient']) {
      const key = inner.map(i => mod29(
        map === 'raw' ? cells[i] : totient(cells[i])
      ));
      const directPlainMatches = key.filter((x, j) => x === terminal[j]).length;
      const genuine56Shifts = c56.map((c, i) => mod29(c - p56[i]));
      const p56KeyMatches = key.slice(0, 85)
        .filter((x, i) => x === genuine56Shifts[i]).length;
      for (const sign of [-1, 1]) {
        const trial = terminal.map((x, i) => mod29(x + sign * key[i]));
        const plant = terminal.map((x, i) => mod29(x - sign * key[i]));
        assert.deepEqual(plant.map((x, i) => mod29(x + sign * key[i])),
          terminal);
        knownReadout.push({radix: clue.radix, sourceCell: clue.index,
          direction, map, sign, directPlainMatches, p56KeyMatches,
          transformedIc: symbolIc(trial)});
      }
    }
  }
}
assert.equal(knownReadout.length, 16);
assert.equal(Math.max(...knownReadout.map(x => x.directPlainMatches)), 11);
assert.equal(Math.max(...knownReadout.map(x => x.p56KeyMatches)), 6);
assert(Math.max(...knownReadout.map(x => x.transformedIc)) < .04);

// Separate eight preselected original unknown-p55 direct-key consumers:
// base60 unique 151 is the outer 76-cell circumference, read from 151.
const c55 = corpus.pages.find(p => p.page === 55).indices;
const p55Original = [];
const edge = allRings[0], start = edge.indexOf(223);
assert(start >= 0);
for (const direction of [1, -1]) {
  const originalOuter = Array.from({length: 76}, (_, j) =>
    bytes60[edge[(start + direction * j + 2 * edge.length) % edge.length]]);
  for (const map of ['raw', 'totient']) {
    const key = originalOuter.map(x => mod29(map === 'raw' ? x : totient(x)));
    for (const sign of [-1, 1]) {
      const decoded = c55.map((c, i) => mod29(c + sign * key[i]));
      assert.deepEqual(decoded.map((x, i) => mod29(x - sign * key[i])), c55);
      // Exact known solved LP2 native GP29 plant: decoder must recover it.
      const plantPlain = p57.slice(0, 76);
      const plantCipher = plantPlain.map((x, i) => mod29(x - sign * key[i]));
      assert.deepEqual(plantCipher.map((x, i) =>
        mod29(x + sign * key[i])), plantPlain);
      p55Original.push({direction, map, sign, transformedIc: symbolIc(decoded),
        clearPositiveIc: symbolIc(plantPlain),
        prefix: decoded.slice(0, 28).map(x => corpus.translit[x]).join('')});
    }
  }
}
assert.equal(p55Original.length, 8);
assert(Math.max(...p55Original.map(x => x.transformedIc)) < .04);

// The solved FIND prime sum 151 is also the *one-based index* of the
// unique base59 cell bearing value151 (table position150). This gives
// an exact self-indexing source address, rather than a free key guess.
assert.equal(bytes59[findPrimeSum - 1], findPrimeSum);
assert.equal(tokens[findPrimeSum - 1], '2X');

// The authored word EMERGE permits a sharply frozen competing consumer:
// from base59's *interior* value151, move exactly one adjacent cell
// outward to its outer perimeter, then follow that 76-cell circumference.
// For the right-side inner cell (row18,col6), the outward cell is
// row18,col7, linear index151. No table start is searched or fitted.
const interiorFind = src151.find(s => s.radix === 59);
assert.equal(interiorFind.index, 150);
const emergeCell = interiorFind.index + 1;
assert.equal(emergeCell, 151);
assert.equal(Math.floor(emergeCell / columns), interiorFind.row);
assert.equal(emergeCell % columns, interiorFind.column + 1);
assert(allRings[0].includes(emergeCell));

const outwardP55 = [];
const outerRing = allRings[0];
const emergeStart = outerRing.indexOf(emergeCell);
for (const direction of [1, -1]) {
  const walked = Array.from({length: 76}, (_, j) =>
    outerRing[(emergeStart + direction * j + outerRing.length * 2) %
      outerRing.length]);
  const values = walked.map(i => bytes59[i]);
  for (const map of ['raw', 'totient']) {
    const key = values.map(x => mod29(map === 'raw' ? x : totient(x)));
    for (const sign of [-1, 1]) {
      const output = c55.map((x, j) => mod29(x + sign * key[j]));
      assert.deepEqual(output.map((x, j) => mod29(x - sign * key[j])),
        c55);
      const planted = p57.slice(0, 76).map((x, j) =>
        mod29(x - sign * key[j]));
      assert.deepEqual(planted.map((x, j) => mod29(x + sign * key[j])),
        p57.slice(0, 76));
      outwardP55.push({direction, map, sign, transformedIc: symbolIc(output),
        prefix: output.slice(0, 28).map(x => corpus.translit[x]).join('')});
    }
  }
}
assert.equal(outwardP55.length, 8);
assert(Math.max(...outwardP55.map(x => x.transformedIc)) < .04);


// Narrow independent historical consumer: p57 FIND=151 as the first prime
// of the *actual p56* prime-totient, plaintext-F-transparent Vigenere clock,
// transferred directly to the preceding original 76-rune p55. No guessed
// prime ordinal, key period, phase or language target is involved.
const longPrimes = primes(180);
const prime151Ordinal = longPrimes.indexOf(findPrimeSum);
assert.equal(prime151Ordinal, 35); // ordinary prime151 has one-based rank36
assert.equal(longPrimes[prime151Ordinal + 14], 229);
assert.equal(c55[14], 25); // original AE rune, GP29 index25
assert.equal(mod29(229 - 1), 25); // would falsely force plaintext F at pos14

/**
 * Given GP ciphertext and a fixed first prime, invert the authenticated
 * Cicada p56 literal-F rule. Every 0 ciphertext has both legal branches:
 * an unencrypted F with no key consumption, and a non-F produced by a
 * key-consuming encryption step. A nonzero ciphertext that inverts to
 * plaintext F is impossible.
 *
 * @param {number[]} cipher
 * @param {number} firstOrd zero-based ordinary-prime index
 * @param {1|-1} sign encryption direction, C=(P+sign*shift)%29
 * @returns {{deadAt:number|null, candidates:Array<{plain:number[], skips:number[]}>}}
 */
function invertTransparentF(cipher, firstOrd, sign) {
  let states = [{offset: 0, plain: [], skips: []}];
  let deadAt = null;
  for (let j = 0; j < cipher.length; j++) {
    const next = [];
    for (const state of states) {
      const prime = longPrimes[firstOrd + state.offset];
      assert(prime !== undefined);
      const shift = mod29(prime - 1);
      const decoded = mod29(cipher[j] - sign * shift);
      if (cipher[j] === 0) {
        next.push({offset: state.offset, plain: state.plain.concat(0),
          skips: state.skips.concat(j)});
        if (decoded !== 0) next.push({
          offset: state.offset + 1, plain: state.plain.concat(decoded),
          skips: state.skips});
      } else if (decoded !== 0) {
        next.push({offset: state.offset + 1,
          plain: state.plain.concat(decoded), skips: state.skips});
      }
    }
    states = next;
    if (!states.length) { deadAt = j; break; }
  }
  return {deadAt, candidates: states};
}

const original151Historical = invertTransparentF(c55, prime151Ordinal, 1);
assert.equal(original151Historical.deadAt, 14);
assert.equal(original151Historical.candidates.length, 0);
const opposite151 = invertTransparentF(c55, prime151Ordinal, -1);
assert.equal(opposite151.deadAt, null);
assert.equal(opposite151.candidates.length, 2);
const opposite151Stats = opposite151.candidates.map(state => ({
  skips: state.skips, ic: symbolIc(state.plain),
  preview: state.plain.slice(0, 32).map(x => corpus.translit[x]).join('')
}));
assert(Math.max(...opposite151Stats.map(x => x.ic)) < .04);

// Exact source-native plant with GP F copied literally, using the same
// first-prime151 key and the correct historical positive direction.
const sourcePositive = p57.slice(0, 76);
let advance = 0;
const prime151Plant = sourcePositive.map(p => p === 0 ? 0 :
  mod29(p + longPrimes[prime151Ordinal + advance++] - 1));
const positiveInverse = invertTransparentF(prime151Plant, prime151Ordinal, 1);
assert.equal(positiveInverse.deadAt, null);
assert(positiveInverse.candidates.some(x =>
  x.plain.length === sourcePositive.length &&
  x.plain.every((v, i) => v === sourcePositive[i])));
const authentic56 = invertTransparentF(c56, 0, 1);
assert.equal(authentic56.deadAt, null);
assert(authentic56.candidates.some(x =>
  x.plain.length === p56.length && x.plain.every((v, i) => v === p56[i])));

console.log(JSON.stringify({
  corpus: 'resources/liber-primus/lp2-corpus.json',
  table: 'resources/liber-primus/lp2-grid-256.json',
  sourceText: 'resources/liber-primus/lp2-transcription.txt',
  findPrimeSum, gpFind, src151,
  selfIndex59: {oneBasedIndex: findPrimeSum, token: tokens[150],
    numericValue: bytes59[150], outwardNeighborIndex: emergeCell},
  ringLengths: allRings.map(x => x.length),
  terminalKnownPlaintext: {p56: 85, p57: 95, total: terminal.length,
    scaledIc: symbolIc(terminal)},
  knownReadout, p55Original, outwardP55,
  prime151HistoricalTransfer: {firstPrimeOrdinal: prime151Ordinal + 1,
    originalHistoricalDirectionDeadAt: original151Historical.deadAt,
    oppositeDirection: opposite151Stats,
    positiveRecovered: true, authentic56Recovered: true},
  outcome: 'No direct p55 plaintext or native known-terminal 180-rune key found'
}, null, 2));
console.log('PASS: source-selected FIND151 rival-radix ring gates and plants');
