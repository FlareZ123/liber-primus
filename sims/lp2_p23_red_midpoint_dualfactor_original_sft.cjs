'use strict';

/**
 * LP2 original-source SFT: p23 red center + p39 red triad divide table p49–51.
 * Node.js 22 CommonJS, Windows-compatible; run from repository root.
 * Read-only, no dependencies and no inferred plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = (name) => path.join(process.cwd(), 'resources', 'liber-primus', name);
const json = (name) => JSON.parse(fs.readFileSync(source(name), 'utf8'));
const digest = (x) => crypto.createHash('sha256').update(x).digest('hex');
const mod = (x) => (x % 29 + 29) % 29;
const originalH = [3, 26, 24]; // Signed 2013 BASE29 3301 -> 3QO.
const originalG = [27, 5, 15]; // Physical p39 isolated red triad.

for (const [name, sha] of [
  ['25.jpg', '6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00'],
  ['40.jpg', 'd31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee'],
  ['56.jpg', 'd1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00'],
  ['66.jpg', 'aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335'],
  ['67.jpg', 'bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776'],
  ['68.jpg', '2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b'],
  ['53.jpg', '3b54a31a9e796e2c01b4e80d46e1092dee2e1142a7c61873e282078e2c776cb9'],
]) assert.equal(digest(fs.readFileSync(source(name))), sha, name);

const ink = json('lp2-ink-annotations.json');
const corpus = json('lp2-corpus.json');
const grid = json('lp2-grid-256.json');
const pages = fs.readFileSync(source('lp2-transcription.txt'), 'utf8').split('%');
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const bytes = grid.pages.flatMap((p) => p.bytes);
assert.equal(pages.length, 57); // Runeless p50 is absent from this transcription.
assert.equal(bytes.length, 256);
assert.equal(digest(Buffer.from(bytes)), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) inverse[a] = b;
}

/** @param {number[]} stream @param {number[]} polynomial @returns {number[] | null} */
function remainderQuadratic(stream, polynomial) {
  const [a, b, c] = polynomial;
  if (c === 0) return null;
  const ic = inverse[c];
  let r0 = 0, r1 = 0;
  for (const value of stream) {
    const next = mod(value - r1 * a * ic);
    r1 = mod(r0 - r1 * b * ic);
    r0 = next;
  }
  return [r0, r1];
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
  return result;
}

/** @param {number[]} stream @param {number[]} polynomial */
function divideDescending(stream, polynomial) {
  const a = stream.map(mod), degree = polynomial.length - 1, q = [];
  const leadingInverse = inverse[polynomial[degree]];
  for (let i = 0; i < stream.length - degree; i++) {
    const value = mod(a[i] * leadingInverse);
    q.push(value);
    for (let j = 0; j <= degree; j++)
      a[i + j] = mod(a[i + j] - value * polynomial[degree - j]);
  }
  return { quotient: q, remainder: a.slice(-degree) };
}

const spans = [];
for (const page of ink.pages) {
  const raw = pages[page.page > 50 ? page.page - 1 : page.page];
  let cursor = 0;
  const values = [], separators = [];
  for (const rune of raw) {
    if (index.has(rune)) {
      values.push(index.get(rune));
      cursor++;
    }
    if ('-.$&§'.includes(rune)) separators.push(cursor);
  }
  assert.equal(values.length, page.rune_count);
  for (const marked of page.red_spans || []) {
    const digits = [...marked.runes].map((rune) => index.get(rune));
    assert.deepEqual(values.slice(marked.start, marked.start + marked.length), digits);
    const bounds = separators
      .filter((n) => n > marked.start && n < marked.start + marked.length)
      .map((n) => n - marked.start);
    const starts = [];
    for (const n of bounds) {
      if (n >= 2 && n + 1 <= digits.length) starts.push(n - 2);
      if (n >= 1 && n + 2 <= digits.length) starts.push(n - 1);
    }
    spans.push({
      page: page.page, offset: marked.start, digits, bounds, starts,
      centered: digits.length % 2 === 0 && bounds.includes(digits.length / 2),
    });
  }
}
assert.equal(spans.length, 18);
const central = spans.filter((span) => span.centered);
assert.deepEqual(central.map((span) => span.page), [23]);
assert.deepEqual(central[0].bounds, [2, 8, 11]);
assert.deepEqual(central[0].digits,
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const redH = central[0].digits.slice(6, 9);
assert.deepEqual(redH, [23, 6, 10]);
assert.deepEqual(redH, originalH.map((digit) => mod(27 * digit)));
assert.deepEqual(spans.find((span) => span.page === 39).digits, originalG);
assert.deepEqual(remainderQuadratic(bytes, redH), [0, 0]);
assert.deepEqual(remainderQuadratic(bytes, originalG), [0, 0]);
assert.deepEqual(remainderQuadratic(bytes, central[0].digits.slice(7, 10)), [25, 25]);

const crossing = spans.flatMap((span) => span.starts.map((i) => ({
  page: span.page, offset: span.offset + i, digits: span.digits.slice(i, i + 3),
})));
assert.equal(crossing.length, 69);
const matches = crossing.filter((row) => {
  const r = remainderQuadratic(bytes, row.digits);
  return r && r.every((digit) => digit === 0);
});
assert.deepEqual(matches, [{ page: 23, offset: 6, digits: [23, 6, 10] }]);

const rg = multiply(redH, originalG);
assert.deepEqual(rg, [12, 16, 7, 24, 5]);
const { quotient: q, remainder } = divideDescending(bytes, rg);
assert.equal(q.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.deepEqual(q.slice(0, 12), [0, 23, 10, 15, 28, 2, 3, 4, 20, 15, 4, 6]);
const oldQ = divideDescending(bytes, multiply(originalH, originalG)).quotient;
assert.deepEqual(q, oldQ.map((digit) => mod(14 * digit))); // No independent new key entropy.
const damaged = bytes.slice();
damaged[0] = (damaged[0] + 1) % 256;
assert.ok(divideDescending(damaged, rg).remainder.some((n) => n !== 0));

// Exhaustive monic quadratic factor list for the exact unchanged 256-byte table.
const factors = [];
for (let a = 0; a < 29; a++)
  for (let b = 0; b < 29; b++)
    if (remainderQuadratic(bytes, [a, b, 1]).every((n) => n === 0))
      factors.push([a, b]);
assert.deepEqual(factors, [[11, 18], [25, 10]]);

function isFactor(a, b, c) {
  if (c === 0) return false;
  const aa = a * inverse[c] % 29, bb = b * inverse[c] % 29;
  return factors.some(([x, y]) => x === aa && y === bb);
}

// Null: shuffle each true red span's original rune multiset independently,
// retaining all 35 original within-red word breaks and both 2|1,1|2 reads.
let seed = 0x25eed157;
function randomInt(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const runs = 200000;
let anyHit = 0, centerHit = 0, literalAnyHit = 0, literalCenterHit = 0;
const histogram = [0, 0, 0, 0, 0, 0];
for (let t = 0; t < runs; t++) {
  let hits = 0, centralHit = false, literalHits = 0, literalCenter = false;
  for (const span of spans) {
    const permuted = span.digits.slice();
    for (let j = permuted.length - 1; j > 0; j--) {
      const k = randomInt(j + 1);
      [permuted[j], permuted[k]] = [permuted[k], permuted[j]];
    }
    for (const i of span.starts) {
      if (permuted[i] === 23 && permuted[i + 1] === 6 && permuted[i + 2] === 10) {
        literalHits++;
        if (span.page === 23 && (i === 6 || i === 7)) literalCenter = true;
      }
      if (isFactor(permuted[i], permuted[i + 1], permuted[i + 2])) {
        hits++;
        if (span.page === 23 && (i === 6 || i === 7)) centralHit = true;
      }
    }
  }
  if (hits >= 1) anyHit++;
  if (centralHit) centerHit++;
  if (literalHits >= 1) literalAnyHit++;
  if (literalCenter) literalCenterHit++;
  histogram[Math.min(hits, 5)]++;
}
assert.equal(anyHit, 25122);
assert.equal(centerHit, 824);
assert.equal(literalAnyHit, 2883);
assert.equal(literalCenterHit, 713);
assert.deepEqual(histogram, [174878, 23533, 1528, 61, 0, 0]);

// The five-dot p23–26 body is five source-length 201-rune strands.
// Direct H/G codeword use on these original lanes is excluded before any key fit.
const originalBody = corpus.pages
  .filter((p) => p.page >= 23 && p.page <= 26)
  .flatMap((p) => p.indices).slice(16);
assert.equal(originalBody.length, 1005);
assert.deepEqual(remainderQuadratic(originalBody, originalH), [14, 28]); // ascending constant, linear
assert.deepEqual(remainderQuadratic(originalBody, originalG), [2, 17]); // ascending constant, linear
assert.deepEqual(divideDescending(originalBody, rg).remainder, [12, 4, 27, 2]);
const layouts = [
  Array.from({ length: 5 }, (_, lane) => originalBody.slice(lane * 201, lane * 201 + 201)),
  Array.from({ length: 5 }, (_, lane) => originalBody.filter((_, offset) => offset % 5 === lane)),
];
for (const layout of layouts) {
  for (const reverse of [false, true]) {
    for (const lane of layout) {
      const digits = reverse ? lane.slice().reverse() : lane;
      assert.ok(remainderQuadratic(digits, originalH).some((x) => x !== 0));
      assert.ok(remainderQuadratic(digits, originalG).some((x) => x !== 0));
    }
  }
}
// Positive: construct a valid length-201 H-codeword from 199 known clear p57
// symbols and recover its complete source payload through the same division.
const clear = corpus.pages.find((p) => p.page === 57).indices;
const message = Array.from({ length: 199 }, (_, i) => clear[i % clear.length]);
const encoded = Array(201).fill(0), descendingH = originalH.slice().reverse();
for (let i = 0; i < message.length; i++)
  for (let j = 0; j < descendingH.length; j++)
    encoded[i + j] = mod(encoded[i + j] + message[i] * descendingH[j]);
const positive = divideDescending(encoded, originalH);
assert.deepEqual(positive.remainder, [0, 0]);
assert.deepEqual(positive.quotient, message);

// Two uniquely centered red selectors yield a separate source-length identity:
// p23's red heading has 16 runes and p39's complete page has 240, 16+240=256.
// The p39 red triad begins at119 and crosses the page midpoint120.
const red16 = corpus.pages.find((p) => p.page === 23).indices.slice(0, 16);
const p39Whole = corpus.pages.find((p) => p.page === 39).indices;
assert.equal(red16.length, 16);
assert.equal(p39Whole.length, 240);
assert.deepEqual(spans.find((span) => span.page === 39).digits, p39Whole.slice(119, 122));
for (const [order, composite, expected] of [
  ['p23red16+p39page240', [...red16, ...p39Whole], [26, 3, 27, 10]],
  ['p39page240+p23red16', [...p39Whole, ...red16], [13, 1, 16, 21]],
]) {
  assert.equal(composite.length, 256);
  assert.deepEqual(divideDescending(composite, rg).remainder, expected, order);
}
for (const [order, candidate16, expectedRemainder, nonzero] of [
  ['source 16 ascending', red16, [23, 25, 0, 6, 9, 24, 4, 27, 24, 0, 25, 3, 13, 9, 18, 7], 14],
  ['source 16 descending', red16.slice().reverse(), [6, 22, 14, 3, 8, 28, 18, 13, 22, 17, 9, 7, 15, 14, 10, 15], 16],
]) {
  const degree16 = [...candidate16, 1]; // implicit monic coefficient.
  const trial = divideDescending(bytes, degree16);
  assert.equal(trial.quotient.length, 240);
  assert.deepEqual(trial.remainder, expectedRemainder, order);
  assert.equal(trial.remainder.filter((digit) => digit !== 0).length, nonzero);
  assert.equal(trial.quotient.filter((digit, pos) => digit === p39Whole[pos]).length, 7);
}
// Plant the entire source p39 240-rune passage as an exact degree16-codeword
// under p23's 16 red coefficients; the inverse must recover all 240 exactly.
const degree16Positive = [...red16, 1];
const positive256 = Array(256).fill(0), descending16 = degree16Positive.slice().reverse();
for (let i = 0; i < p39Whole.length; i++)
  for (let j = 0; j < descending16.length; j++)
    positive256[i + j] = mod(positive256[i + j] + p39Whole[i] * descending16[j]);
const recovered240 = divideDescending(positive256, degree16Positive);
assert.deepEqual(recovered240.remainder, Array(16).fill(0));
assert.deepEqual(recovered240.quotient, p39Whole);

// A distinct candidate full receiver uses the quartic's own recurrence,
// seeded by the first four p23 printed word lengths [K,a,e,g]=[2,6,3,5].
// Test the actual solved-p56 F-transparent consumption rule with BOTH signs.
const recurrence = rg.slice(0, 4).map((digit) => mod(digit * inverse[rg[4]]));
assert.deepEqual(recurrence, [14, 9, 13, 28]);
const key = [2, 6, 3, 5], maxKey = 18000;
for (let i = 0; key.length < maxKey; i++)
  key.push(mod(-recurrence[0] * key[i] - recurrence[1] * key[i + 1]
    - recurrence[2] * key[i + 2] - recurrence[3] * key[i + 3]));
assert.deepEqual(key.slice(0, 16), [2,6,3,5,0,27,27,12,27,4,8,9,13,0,15,4]);
/** Exhaust all legal key-clock paths under plaintext F transparency. */
function firstImpossible(cipher, sign) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const j of states) {
      if (cipher[i] === 0) next.add(j); // Literal plaintext F did not consume.
      if (mod(cipher[i] + sign * key[j]) !== 0) next.add(j + 1);
    }
    states = next;
    if (states.size === 0) return i;
  }
  return null;
}
const chapter23 = corpus.pages.filter((p) => p.page >= 23 && p.page <= 26)
  .flatMap((p) => p.indices);
const posttable = [...corpus.pages.find((p) => p.page === 51).indices,
  ...corpus.pages.find((p) => p.page === 52).indices];
for (const [cipher, minusIndex, plusIndex] of [
  [chapter23, 22, 12],
  [p39Whole, 26, 7],
  [corpus.pages.find((p) => p.page === 55).indices, 59, 21],
  [posttable, 24, 16],
]) {
  assert.equal(firstImpossible(cipher, -1), minusIndex);
  assert.equal(firstImpossible(cipher, 1), plusIndex);
}
// Real solved p57 plaintext positive: exact F-bypass encoding must retain
// a full inverse key path at the correct source consumption count.
const realClear57 = corpus.pages.find((p) => p.page === 57).indices;
for (const sign of [-1, 1]) {
  let j = 0;
  const encoded57 = realClear57.map((digit) => {
    if (digit === 0) return 0;
    return mod(digit - sign * key[j++]);
  });
  assert.equal(firstImpossible(encoded57, sign), null);
}

// Distinct original-shaped AES receiver: p23 red16 as one literal AES-128
// key; the 256-byte table as a 16-byte IV plus 240 ciphertext bytes,
// matching the exact p39 page length. No KDF, key search or fitted IV.
// Also test direct ECB and zero-IV CBC as the two simplest alternatives.
{
  const ciphertext = Buffer.from(bytes);
  const keyForms = [
    ['p23 GP indices', Buffer.from(red16), [[68,25],[75,25],[99,24]]],
    ['p23 GP primes', Buffer.from(red16.map((r) => corpus.prime[r])),
      [[79,33],[84,37],[105,29]]],
  ];
  const modes = [
    ['aes-128-cbc', ciphertext.subarray(16), ciphertext.subarray(0, 16)],
    ['aes-128-cbc', ciphertext, Buffer.alloc(16)],
    ['aes-128-ecb', ciphertext, null],
  ];
  for (const [keyName, keyBytes, metrics] of keyForms) {
    assert.equal(keyBytes.length, 16);
    for (let i = 0; i < modes.length; i++) {
      const [algorithm, input, iv] = modes[i];
      const decipher = crypto.createDecipheriv(algorithm, keyBytes, iv);
      decipher.setAutoPadding(false);
      const plain = Buffer.concat([decipher.update(input), decipher.final()]);
      const countASCII = [...plain].filter((b) => b >= 32 && b <= 126).length;
      const countGP = [...plain].filter((b) => b <= 28).length;
      assert.deepEqual([countASCII, countGP], metrics[i], keyName + ' / ' + algorithm);
      console.log('AES p23 16-byte ' + keyName + ' ' + algorithm
        + ' printable=' + countASCII + '/' + plain.length
        + ' GPbyte=' + countGP + '/' + plain.length);
    }
  }
  const known = crypto.createDecipheriv('aes-128-ecb', Buffer.alloc(16), null);
  known.setAutoPadding(false);
  assert.deepEqual(Buffer.concat([known.update(Buffer.from(
    '66e94bd4ef8a2c3b884cfa59ca342b2e', 'hex')), known.final()]), Buffer.alloc(16));
}

// Original-cipher polynomial multiplication/inversion is a genuinely
// different receiver from an additive LFSR keystream: C(X)=F(X)P(X) mod X^N.
// Each source-selected polynomial has invertible nonzero constant term.
function truncateConvolution(plain, factor) {
  const out = Array(plain.length).fill(0);
  for (let i = 0; i < plain.length; i++)
    for (let j = 0; j < factor.length && i + j < out.length; j++)
      out[i + j] = mod(out[i + j] + plain[i] * factor[j]);
  return out;
}
function invertConvolution(cipher, factor) {
  const out = [];
  const scale = inverse[factor[0]];
  for (let i = 0; i < cipher.length; i++) {
    let v = cipher[i];
    for (let j = 1; j < factor.length; j++)
      if (i >= j) v -= factor[j] * out[i - j];
    out.push(mod(v * scale));
  }
  return out;
}
const complete = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(complete.length, 12956);
const native = corpus.pages.find((p) => p.page === 57).indices;
const planted = Array.from({ length: 729 }, (_, i) => native[i % native.length]);
const directInverseExpectations = [
  ['F', rg, [0.034469675530361406, 0.034467780924994]],
  ['H', originalH, [0.034495032261316366, 0.034467101726843426]],
  ['G', originalG, [0.03446591015114065, 0.0345067454504746]],
];
function checkFullStreamConvolution() {
  const count = Array(29).fill(0);
  for (const [name, factor, expected] of directInverseExpectations) {
    for (const reverse of [false, true]) {
      const input = reverse ? complete.slice().reverse() : complete;
      const decoded = invertConvolution(input, factor);
      assert.deepEqual(truncateConvolution(decoded, factor), input);
      const restored = reverse ? decoded.slice().reverse() : decoded;
      count.fill(0);
      for (const digit of restored) count[digit]++;
      const ic = count.reduce((sum, n) => sum + n * (n - 1), 0)
        / (complete.length * (complete.length - 1));
      assert.ok(Math.abs(ic - expected[Number(reverse)]) < 1e-12);
      const synthetic = truncateConvolution(planted, factor);
      assert.deepEqual(invertConvolution(synthetic, factor), planted);
      console.log('POLYNOMIAL C=F*P original inverse ' + name
        + ' reversed=' + reverse + ' full-book IoC=' + ic.toFixed(10));
    }
  }
}
checkFullStreamConvolution();

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
for (const [name, original] of [
  ['p23', page(23)], ['p55', page(55)], ['posttable p51+p52', [...page(51), ...page(52)]],
]) {
  const minus = original.map((digit, i) => mod(digit - q[i % 252]));
  const plus = original.map((digit, i) => mod(digit + q[i % 252]));
  console.log(name + ': length=' + original.length + ', IoC original=' + ioc(original).toFixed(9)
    + ', C-Q=' + ioc(minus).toFixed(9) + ', C+Q=' + ioc(plus).toFixed(9));
}

const p36Values = page(36);
const p8FirstRed = page(8).slice(0, 4);
assert.deepEqual(p8FirstRed, [14, 10, 14, 19]);
const p8FirstRedPrimeSum = p8FirstRed.reduce((sum, digit) => sum + corpus.prime[digit], 0);
assert.equal(p8FirstRedPrimeSum, 196);
assert.equal(q.length, 252);
assert.equal(p36Values.length, 238);
assert.equal(q.length - p36Values.length, 14);

function originalPageWords(raw) {
  const result = [];
  let current = [];
  for (const character of raw) {
    if (index.has(character)) current.push(index.get(character));
    else if (character === '/' || /\s/u.test(character)) continue;
    else if ('-.$§'.includes(character)) {
      if (current.length) { result.push(current); current = []; }
    }
  }
  if (current.length) result.push(current);
  return result;
}
const p36Words = originalPageWords(pages[36]);
assert.equal(p36Words.length, 50);
assert.equal(p36Words.reduce((sum, word) => sum + word.length, 0), 238);
const wordListPath = path.join(process.cwd(), 'resources', 'control', 'english_wordfreq_textblob.txt');
const dictionary = new Set(fs.readFileSync(wordListPath, 'utf8').split(/\r?\n/)
  .filter((line) => line && !line.startsWith(';'))
  .map((line) => line.split(/\s+/)[0].toUpperCase()));
assert.equal(dictionary.size, 29157);

const q238Candidates = [
  ['Q[0:238]', q.slice(0, 238)],
  ['Q[14:252]', q.slice(14)],
  ['reverse(Q[14:252])', q.slice(14).slice().reverse()],
  ['reverse(Q[0:238])', q.slice(0, 238).slice().reverse()],
];
const expectedDictionaryHits = [1, 2, 3, 5, 2, 2, 3, 1];
const p36QResults = [];
let expectedIndex = 0;
for (const [windowName, key] of q238Candidates) {
  assert.equal(key.length, 238);
  for (const sign of [-1, 1]) {
    const plain = p36Values.map((digit, i) => mod(digit + sign * key[i]));
    const restored = plain.map((digit, i) => mod(digit - sign * key[i]));
    assert.deepEqual(restored, p36Values);
    let offset = 0;
    const decodedWords = p36Words.map((word) => {
      const decoded = plain.slice(offset, offset + word.length)
        .map((digit) => corpus.translit[digit]).join('');
      offset += word.length;
      return decoded;
    });
    assert.equal(offset, p36Values.length);
    const dictionaryHits = decodedWords.filter((word) => dictionary.has(word)).length;
    assert.equal(dictionaryHits, expectedDictionaryHits[expectedIndex++]);
    p36QResults.push({
      window: windowName,
      operation: sign < 0 ? 'C-Q' : 'C+Q',
      ioc: Number(ioc(plain).toFixed(6)),
      dictionaryHits: dictionaryHits + '/50',
      head: plain.slice(0, 36).map((digit) => corpus.translit[digit]).join(' '),
    });
  }
}
assert.equal(expectedIndex, 8);
assert.equal(ioc(p36Values).toFixed(6), '0.035989');
assert.equal(ioc(page(57)).toFixed(6), '0.062710');
assert.ok(Math.max(...p36QResults.map((row) => row.ioc)) < 0.036);
console.log('p36 Q252-to-238 source-motivated receiver:', JSON.stringify(p36QResults));
console.log('p36 native IoC=' + ioc(p36Values).toFixed(9)
  + '; solved p57 native IoC=' + ioc(page(57)).toFixed(9));

const fullP23Red16 = central[0].digits;
const fullFactorRemainders = [];
for (const reverseP23 of [false, true]) {
  for (const reverseP39 of [false, true]) {
    const p23Polynomial = reverseP23 ? fullP23Red16.slice().reverse() : fullP23Red16;
    const p39Polynomial = reverseP39 ? originalG.slice().reverse() : originalG;
    const product = multiply(p23Polynomial, p39Polynomial);
    const division = divideDescending(bytes, product);
    assert.equal(product.length, 18);
    assert.equal(division.quotient.length, 239);
    assert.equal(division.quotient[0], 0);
    assert.ok(division.remainder.some((value) => value !== 0));
    fullFactorRemainders.push(division.remainder);
  }
}
assert.deepEqual(fullFactorRemainders, [
  [17, 3, 8, 7, 14, 13, 14, 23, 24, 0, 14, 10, 11, 10, 18, 22, 27],
  [5, 23, 17, 20, 14, 17, 23, 12, 18, 16, 1, 21, 19, 4, 6, 12, 24],
  [7, 27, 3, 14, 2, 10, 20, 18, 14, 26, 20, 21, 15, 18, 12, 18, 22],
  [18, 0, 27, 6, 18, 13, 27, 3, 2, 0, 26, 27, 5, 15, 18, 4, 25],
]);
console.log('p23 full-red16 × p39-red3 factor remainders (all orientations):',
  JSON.stringify(fullFactorRemainders));

console.log('PASS: 18 source red spans, unique p23 midpoint, 69 boundary candidates');
console.log('PASS: p23 red H (scalar27), p39 red G, 256-byte four-zero syndrome, Q length252');
console.log('NULL: ' + anyHit + '/' + runs + ' any factor; ' + centerHit + '/' + runs + ' p23 center');
console.log('NULL fixed -K H: ' + literalAnyHit + '/' + runs + ' any exact source triple; '
  + literalCenterHit + '/' + runs + ' p23 center');
console.log('PASS: five original 201-rune p23–26 lanes not direct red H/G codewords; positive plant recovered');
console.log('PASS: p23 red16 + p39 whole240 composites are not source H/G codewords');
console.log('PASS: both source p23 monic degree16 factors fail, 240-rune positive plant succeeds');
console.log('PASS: source-DH-seeded quartic recurrence fails p56-style F-transparent necessary path');
console.log('PASS: p23 original red16 source bytes are not an AES128 plaintext receiver for the table');
console.log('PASS: original source H/G/FG direct polynomial inverses recover no native prose');
console.log('NO PLAINTEXT: reversible quotient key reads remain ciphertext-like');
