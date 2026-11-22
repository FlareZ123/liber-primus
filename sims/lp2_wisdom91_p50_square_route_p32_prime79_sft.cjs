'use strict';

/**
 * SFT: original 2014 Wisdom centre91 -> LP2 table square-root route
 * -> p32 (11x11) coordinate -> p15 prime79 -> p55-size pointer.
 *
 * Windows 11 / Node.js 22: node sims/lp2_wisdom91_p50_square_route_p32_prime79_sft.cjs
 * Source-only navigation test. It claims no ciphertext decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));

const table = readJSON('resources/liber-primus/lp2-grid-256.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const cells = table.pages.flatMap((p) => p.tokens);
const values = table.pages.flatMap((p) => p.bytes);
assert.equal(cells.length, 256);
assert.equal(values.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(values)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number[]} next @param {number} start @param {number} edges */
function follow(next, start, edges) {
  const out = [start];
  for (let k = 0; k < edges; k++) out.push(next[out.at(-1)]);
  return out;
}

/** @param {number} x */
function squareRoot(x) {
  const n = Math.floor(Math.sqrt(x));
  return n > 0 && n * n === x ? n : -1;
}

/** @param {number[]} next */
function allAdditiveSquareTriples(next) {
  const found = [];
  for (let start = 0; start < next.length; start++) {
    const [a, b, c] = follow(next, start, 3).slice(1);
    const roots = [a, b, c].map(squareRoot);
    if (roots[0] > 0 && roots[1] > 0 && roots[0] + roots[1] === roots[2])
      found.push({ start, values: [a, b, c], roots });
  }
  return found;
}

const original2014WisdomSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
];
for (const row of original2014WisdomSquare)
  assert.equal(row.reduce((a, b) => a + b, 0), 1033);
assert.equal(original2014WisdomSquare[2][2], 91);
const original2014Stage10Centres = [809, 331, 91];
assert.deepEqual(original2014Stage10Centres.filter((n) => n >= 0 && n < 256), [91]);

const walk = follow(values, 91, 16);
assert.deepEqual(walk.slice(0, 6), [91, 49, 16, 121, 237, 32]);
assert.deepEqual(walk.slice(1, 4).map(squareRoot), [7, 4, 11]);

const globalHits = allAdditiveSquareTriples(values);
assert.deepEqual(globalHits, [{
  start: 91,
  values: [49, 16, 121],
  roots: [7, 4, 11],
}]);

const digits59 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');
assert.equal(digits59.length, 59);
const values59 = cells.map((v) => digits59.indexOf(v[0]) * 59 + digits59.indexOf(v[1]));
assert.deepEqual(follow(values59, 91, 3), [91, 48, 249, 156]);
assert.equal(allAdditiveSquareTriples(values59).length, 0);

const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
const side = squareRoot(p32.length);
assert.equal(side, 11);
const [row, col] = globalHits[0].roots;
assert.equal(row + col, side);
const sourceIndex = row * side + col;
const rune = p32[sourceIndex];
assert.equal(sourceIndex, 81);
assert.equal(corpus.translit[rune], 'NG');
assert.equal(corpus.prime[rune], 79);
assert.equal(3301 - 3222, 79); // p15 JPEG 32.jpg, top row second cell 3222
assert.deepEqual(follow(values, 79, 5), [79, 82, 201, 74, 205, 76]);

// Exact original-histogram random-table permutation null for a single,
// preselected non-square start 91. For positive distinct a,b and c=a+b,
// the three distinct lookups draw source values without replacement.
// The target p32 cell is fixed, not shuffled.
const mult = Array(256).fill(0);
for (const v of values) mult[v]++;
const denom = 256 * 255 * 254;
let anyTripleWeights = 0;
let thirdRoot11Weights = 0;
let root11Prime79Weights = 0;
for (let a = 1; a <= 15; a++) {
  for (let b = 1; a + b <= 15; b++) {
    if (a === b) continue; // repeated address cannot have two different outputs
    const c = a + b;
    const weight = mult[a * a] * mult[b * b] * mult[c * c];
    anyTripleWeights += weight;
    if (c === 11) {
      thirdRoot11Weights += weight;
      if (corpus.prime[p32[11 * a + b]] === 79)
        root11Prime79Weights += weight;
    }
  }
}
assert.equal(denom, 16581120);
assert.equal(anyTripleWeights, 106);
assert.equal(thirdRoot11Weights, 20);
assert.equal(root11Prime79Weights, 2);

const planted = values.slice();
planted[92] = 4;
planted[4] = 9;
planted[9] = 25;
assert(allAdditiveSquareTriples(planted).some((x) => x.start === 92 && x.roots.join(',') === '2,3,5'));


// Lowest-description direct ciphertext consumer: transfer the independently
// SOLVED p56 prime-totient cipher with initial prime79, the 22nd prime.
// The historical plaintext-F bypass does not consume the prime clock.
// Test ALL valid unknown bypass masks by propagating prime-index states.
const primes = [];
for (let n = 2; primes.length < 200; n++) {
  let ok = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { ok = false; break; }
  }
  if (ok) primes.push(n);
}
assert.equal(primes[21], 79);

/** @param {number[]} cipher @param {number} sign */
function strictTotientStates(cipher, sign) {
  let states = new Set([21]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const k of states) {
      const key = (primes[k] - 1) % 29;
      const plain = ((cipher[i] + sign * key) % 29 + 29) % 29;
      if (plain !== 0) next.add(k + 1);
      if (cipher[i] === 0) next.add(k); // possible literal plaintext-F bypass
    }
    states = next;
    if (states.size === 0) return { firstImpossible: i, survivors: 0 };
  }
  return { firstImpossible: -1, survivors: states.size };
}
assert.deepEqual(strictTotientStates(p55, -1), { firstImpossible: 5, survivors: 0 });
assert.deepEqual(strictTotientStates(p55, 1), { firstImpossible: 61, survivors: 0 });

// Genuine solved p57 native-GP material is a positive under each sign.
const clearPlant = corpus.pages.find((p) => p.page === 57).indices.slice(0, 76);
assert.equal(clearPlant.length, 76);
for (const sign of [-1, 1]) {
  let k = 21;
  const encrypted = clearPlant.map((plain) => {
    if (plain === 0) return 0;
    const cipher = ((plain - sign * ((primes[k] - 1) % 29)) % 29 + 29) % 29;
    k++;
    return cipher;
  });
  assert.equal(strictTotientStates(encrypted, sign).firstImpossible, -1);
}


// Secondary, source-defined 7+4=11 p32 torus stripe and solved-p57
// circumference selection. No fitted key phase, word order or language score.
// The solved PARABLE's "shed circumferences" also has a literal square
// interpretation: remove two outer rings from the p32 11x11 reflow, leaving
// the unique centered 7x7 = 49-rune object selected by table[91].
const inner7x7 = [];
for (let row = 2; row <= 8; row++) {
  for (let col = 2; col <= 8; col++) inner7x7.push(p32[11 * row + col]);
}
assert.equal(inner7x7.length, 49); // matches original table[91] output
assert.deepEqual(inner7x7.slice(-4), [17, 1, 23, 15]); // B-U-D-S
assert.equal(inner7x7.slice(-4).reduce((a, b) => a + b, 0), 56);
const ringLengths = [11 * 11 - 9 * 9, 9 * 9 - 7 * 7];
assert.deepEqual(ringLengths, [40, 32]);
assert.equal(121 - ringLengths[0] - ringLengths[1], 49);
console.log('CENTRAL49 source row-major ends with BUDS = GP0 56, original p32 offsets93..96');

const torusKey = Array.from({ length: 11 }, (_, i) => {
  const k = i + 1;
  return p32[((7 * k) % 11) * 11 + ((4 * k) % 11)];
});
assert.deepEqual(torusKey, [21, 20, 26, 24, 3, 22, 14, 7, 3, 23, 20]);
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const physicalP55Words = transcript.split('%')[54].replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu);
assert.equal(physicalP55Words.length, 17);
assert.equal(Array.from(physicalP55Words[0]).length, 1);
const gpByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const strictWordInteriors = physicalP55Words.flatMap(
  (word) => Array.from(word).slice(1, -1).map((rune) => gpByRune.get(rune))
);
assert.equal(strictWordInteriors.length, 43);
assert.deepEqual(strictWordInteriors.flatMap((x, i) => x === 0 ? [i] : []), [11]);
assert.deepEqual(strictTotientStates(strictWordInteriors, -1), {
  firstImpossible: -1,
  survivors: 1,
});
assert.deepEqual(strictTotientStates(strictWordInteriors, 1), {
  firstImpossible: 38,
  survivors: 0,
});

/** @param {number[]} seq */
function indexOfCoincidence(seq) {
  const counts = Array(29).fill(0);
  for (const value of seq) counts[value]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}

// Independently printed p55 word circumferences select 33 external runes;
// exact two-square difference 33 has one solution inside the 256-cell
// byte range (289-256 is inadmissible): 49-16.
// The square-chain defect 121-49-16 then selects table state56,
// previously used by the literal base60/ASCII-hex compass handoff.
const exteriors = p55.length - strictWordInteriors.length;
assert.equal(exteriors, 33);
// Two independently established p55 physical counts (33 exteriors,
// 76 whole page) have the SAME original numeric table token, and the shared
// value indexes an F rune of the independently p50-selected p32 receiver.
assert.deepEqual([cells[33], cells[76]], ['1s', '1s']);
assert.equal(values[33], 114);
assert.equal(values[76], 114);
assert.deepEqual(values.flatMap((n, i) => n === 114 ? [i] : []), [33, 76]);
assert.equal(corpus.translit[p32[114]], 'F');
assert.deepEqual(p32.flatMap((x, i) => x === 0 ? [i] : []), [29, 30, 42, 114]);
assert.equal(p32.length - 114, 7); // original source root7

// Count all equivalently parser-defined original physical p0..55 pages
// with both counts directly valid as byte addresses; only p55 collides.
// A cross-page word carry is counted as local source-fragment exteriors,
// exactly as the page55 33/43 count is defined.
const sourcePages = transcript.split('%');
const eligibleCountPairs = [];
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length === 0) continue;
  const originalPage = sourcePages[page.page >= 51 ? page.page - 1 : page.page];
  const runicFragments = originalPage.replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu) || [];
  const inside = runicFragments.reduce((sum, word) =>
    sum + Math.max(0, Array.from(word).length - 2), 0);
  const outer = page.indices.length - inside;
  if (outer >= 0 && outer < 256 && page.indices.length < 256)
    eligibleCountPairs.push({ page: page.page, outer, total: page.indices.length, inside });
}
assert.equal(eligibleCountPairs.length, 22);
assert.deepEqual(eligibleCountPairs.find((p) => p.page === 55), {
  page: 55, outer: 33, total: 76, inside: 43,
});
assert.deepEqual(eligibleCountPairs.filter((p) => values[p.outer] === values[p.total])
  .map((p) => p.page), [55]);
console.log('UNIQUE COUNT ALIAS: only eligible p55 gives p50[exterior33]=p50[total76]=114');
console.log('Original p32[114]=F (last7 start), genuine solved-p56 transparent-F symbol');

const squarePairs = [];
for (let a = 1; a * a <= 255; a++) {
  for (let b = 1; b * b <= 255; b++) {
    if (a * a - b * b === exteriors) squarePairs.push({ a, b });
  }
}
assert.deepEqual(squarePairs, [{ a: 7, b: 4 }]);
const [s7, s4, s11] = walk.slice(1, 4);
assert.equal(s7 - s4, exteriors);
// Independently solved p56 provides the genuine prime-totient operation:
// GP prime79 -> phi(79)=78. The p32 121-rune source minus phi(79) yields
// exactly p55's *separately counted* 43 strict printed-word interiors.
// Together with the exterior33, the entire p55 length76 closes.
const selectedPrime = corpus.prime[p32[7 * 11 + 4]];
assert.equal(selectedPrime, 79);
const selectedTotient = selectedPrime - 1; // 79 prime, so phi(79)=78
assert.equal(selectedTotient, 78);
assert.equal(p32.length - selectedTotient, strictWordInteriors.length);
assert.equal((s7 - s4) + (p32.length - selectedTotient), p55.length);
console.log('TOTAL PARTITION: exterior=(49-16)=33; interior=(121-phi(79))=43; sum=76 original p55');


// Two p55 physical counts become exact ORIGINAL p32 word-boundary addresses.
// Exterior count33 is the start of one 11-rune original printed word.
// Interior count43 is its inclusive final rune; its literal first 4 runes
// transliterate as HOME. The entire selected original word is a possible
// unambiguous 11-rune key, with direct GP29 additive uses tested below.
const originalP32Words = transcript.split('%')[32].replace(/\/\s*/g, '')
  .match(/[\u16A0-\u16FF]+/gu);
let wordStart = 0;
const p32WordBounds = originalP32Words.map((word) => {
  const length = Array.from(word).length;
  const record = { start: wordStart, end: wordStart + length - 1, word };
  wordStart += length;
  return record;
});
assert.equal(wordStart, p32.length);
const selectedWord = p32WordBounds.find((word) =>
  word.start === exteriors && word.end === strictWordInteriors.length);
assert(selectedWord);
assert.equal(selectedWord.end - selectedWord.start + 1, 11);
assert.equal(selectedWord.word.length, 11);
const selectedP32WordKey = Array.from(selectedWord.word).map((rune) => gpByRune.get(rune));
assert.deepEqual(selectedP32WordKey, p32.slice(33, 44));
assert.equal(selectedP32WordKey.slice(0, 4).map((x) => corpus.translit[x]).join(''), 'HOME');

// Shorter independent receiver: the very same authenticated 2014 center91
// addresses original p50[91]=49 and p32[91]=O, whose native GP prime7
// squared reproduces 49. Its original punctuation-delimited word is
// exactly the already source-selected eight-rune BUDS container.
const sameIndexRune = p32[91];
assert.equal(corpus.translit[sameIndexRune], 'O');
assert.equal(corpus.prime[sameIndexRune], 7);
assert.equal(corpus.prime[sameIndexRune] ** 2, values[91]);
const originalSameIndexWord = p32WordBounds.find((word) => word.start <= 91 && 91 <= word.end);
assert(originalSameIndexWord);
assert.deepEqual([originalSameIndexWord.start, originalSameIndexWord.end], [89, 96]);
const sameIndexedSquareHits = p32.flatMap((rune, address) =>
  corpus.prime[rune] ** 2 === values[address] ? [address] : []);
assert.deepEqual(sameIndexedSquareHits, [91]);
console.log('SAME INDEX: original 2014 91 selects table[91]=49 AND p32[91]=O, GPprime(O)^2=49; original word[89..96] contains BUDS');

const p32TerminalBudsWord = p32WordBounds.find((word) =>
  word.start === 89 && word.end === 96);
assert(p32TerminalBudsWord);
assert.equal(p32TerminalBudsWord.word.length, 8);
assert.deepEqual(Array.from(p32TerminalBudsWord.word).slice(-4).map((rune) => gpByRune.get(rune)), [17, 1, 23, 15]);
console.log('WORD BOUNDS: p55 33/43 select exact p32 11-rune original word HOMEXWDSLFD [33..43]');
console.log('BUDS is terminal 4/8 runes of original p32 word [89..96] at central49 boundary');

// Reuse Agent8's EXISTING p32 BUDS H-shell, not an invented decoder:
// original eight-rune word at [89..96] returns the authenticated 2016
// zero-based signed-word positions [7,8] = THE DEVOTED.
const budContainer = p32.slice(89, 97);
assert.deepEqual(budContainer, [22, 21, 3, 19, 17, 1, 23, 15]);
const outerH = (left, right) => [
  ((left - right) % 29 + 29) % 29,
  (left + right) % 29,
];
const dhShell = [];
for (let k = 0; k < 4; k++) dhShell.push(...outerH(budContainer[k], budContainer[7 - k]));
assert.deepEqual(dhShell, [7, 8, 27, 15, 2, 4, 2, 7]);
assert.deepEqual(outerH(budContainer[0], budContainer.at(-1)), [7, 8]);
console.log('KNOWN H-SHELL receiver BUDS word -> [7,8] = signed 2016 THE DEVOTED');


/** @param {number[]} ciphertext @param {number[]} key @param {number} sign */
function strictPeriodicKeyFirstFailure(ciphertext, key, sign) {
  let consumedStates = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const nextStates = new Set();
    for (const k of consumedStates) {
      const plain = ((ciphertext[i] + sign * key[k % key.length]) % 29 + 29) % 29;
      if (plain !== 0) nextStates.add(k + 1);
      if (ciphertext[i] === 0) nextStates.add(k); // plaintext-F literal bypass
    }
    consumedStates = nextStates;
    if (!consumedStates.size) return i;
  }
  return -1;
}
assert.equal(strictPeriodicKeyFirstFailure(strictWordInteriors, selectedP32WordKey, -1), 36);
assert.equal(strictPeriodicKeyFirstFailure(strictWordInteriors, selectedP32WordKey, 1), 29);
assert.equal(strictPeriodicKeyFirstFailure(p55, selectedP32WordKey, -1), 2);
assert.equal(strictPeriodicKeyFirstFailure(p55, selectedP32WordKey, 1), 0);
const clear43 = corpus.pages.find((p) => p.page === 57).indices.slice(0, 43);
for (const sign of [-1, 1]) {
  let k = 0;
  const planted = clear43.map((plain) => {
    if (plain === 0) return 0;
    const enc = ((plain - sign * selectedP32WordKey[k++ % 11]) % 29 + 29) % 29;
    return enc;
  });
  assert.equal(strictPeriodicKeyFirstFailure(planted, selectedP32WordKey, sign), -1);
}
console.log('CIPHER GATE: selected original 11-rune HOME-start word as additive key fails p55 all76/inner43 all strict-F masks');

const pythagoreanDefect = s11 - s7 - s4;
assert.equal(pythagoreanDefect, 2 * 7 * 4);
assert.equal(pythagoreanDefect, 56);
assert.equal(cells[56], '4E');
assert.equal(Number.parseInt(cells[56], 16), 'N'.charCodeAt(0));
const mapAddress = 56;
const nextNorthAddress = mapAddress - 8;
assert.equal(nextNorthAddress, 48);
assert.equal(corpus.translit[p32[33]], 'H');
assert.equal(p32.slice(33, 37).map((x) => corpus.translit[x]).join(''), 'HOME');
assert.equal(p32.slice(93, 97).map((x) => corpus.translit[x]).join(''), 'BUDS');
const gpSum = (word) => Array.from(word).reduce((sum, ch) =>
  sum + corpus.translit.indexOf(ch), 0);
assert.equal(gpSum('BUDS'), mapAddress);
assert.equal(gpSum('MAP'), mapAddress);
assert.equal(gpSum('HOME'), nextNorthAddress);
assert.equal(93 - 33, 5 * (11 + 1)); // DH g=5 southeast 11x11 translation
console.log('SQUARE DEFECT 121-49-16=56 = GP0(BUDS/MAP); cell56=hex4E=N -> 48=GP0(HOME)');
console.log('DIFFERENCE 49-16=33 = p55 outer-runecount (76-43), unique positive byte-square pair');

const decoderCases = [
  { name: 'p55 all76', cipher: p55, expectation: [[0.029473684210526315, 0.03508771929824561], [0.034035087719298245, 0.031578947368421054]] },
  { name: 'p55 strict inner43', cipher: strictWordInteriors, expectation: [[0.03433001107419712, 0.02547065337763012], [0.023255813953488372, 0.03322259136212625]] },
];
for (const sample of decoderCases) {
  for (let family = 0; family < 2; family++) {
    for (const sign of [-1, 1]) {
      const recovered = sample.cipher.map((value, i) => {
        const runeIndex = torusKey[i % torusKey.length];
        const shift = family === 0 ? runeIndex : (primes[runeIndex] - 1) % 29;
        return ((value + sign * shift) % 29 + 29) % 29;
      });
      const actual = indexOfCoincidence(recovered);
      assert(Math.abs(actual - sample.expectation[family][(sign + 1) / 2]) < 1e-12,
        sample.name + ' torus family ' + family + ' sign ' + sign);
      for (let i = 0; i < recovered.length; i++) {
        const runeIndex = torusKey[i % torusKey.length];
        const shift = family === 0 ? runeIndex : (primes[runeIndex] - 1) % 29;
        assert.equal((recovered[i] - sign * shift + 2900) % 29, sample.cipher[i]);
      }
      console.log('TORUS ' + sample.name + ' family=' + (family ? 'phi(prime)' : 'gpIndex') +
        ' sign=' + sign + ' IoC=' + actual.toFixed(8));
    }
  }
}

console.log('PASS: 256 original cells, source 2014 centre91, and unique base60 square-root route');
console.log('91 -> 49 -> 16 -> 121 -> 237 -> 32; roots 7+4=11');
console.log('p32[7,4] = NG (GP prime79); p15 3301-3222 =79');
console.log('79 -> 82 -> 201 -> 74 -> 205 -> 76 = p55 original rune count');
console.log('Base59: no additive-square-triple start among 256 addresses');
console.log('Exact fixed-start shuffle-null: any = ' + anyTripleWeights + '/' + denom);
console.log('Third root11 = ' + thirdRoot11Weights + '/' + denom);
console.log('Third root11 + source cell prime79 = ' + root11Prime79Weights + '/' + denom);
console.log('Direct p55 p56-style phi(prime) from initial prime79 fails all valid F masks at runes 5/61.');
console.log('No unknown-page plaintext or decryption is claimed.');
