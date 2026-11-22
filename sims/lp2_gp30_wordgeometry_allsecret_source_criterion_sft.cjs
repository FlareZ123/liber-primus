'use strict';

/**
 * Exact all-secret GP30 word-length/within-word-position substitution bound.
 *
 * Treat the 29 original rune glyphs and each authentic printed GP word
 * separator/period as a full 30-symbol ciphertext stream. Six dashes
 * immediately following Arabic list-heading numerals are source typography,
 * not the 30th cipher digit. Join all cross-page carried words physically.
 *
 * Every original word has length L=1..14 and rune positions j=0..L-1;
 * the printed terminal separator is source symbol29 at position j=L.
 * A source-visible key state may use (L,j), L alone, j alone, or (L,j mod k).
 * Give EACH such state a totally arbitrary independent secret 30! bijection.
 * It may therefore map any ciphertext class to plaintext SPACE and can
 * move printed boundaries. There is no static secret key search or fitting.
 *
 * The exact top-five native GP symbol bound is key-independent and is
 * proved independently by a solved-LP1 native-GP space-moving plant.
 * This is conditional on the decoded plaintext's native top-five rune
 * concentration, NOT a claim of a recovered author cipher.
 *
 * Windows 11, Node 22:
 *   node sims/lp2_gp30_wordgeometry_allsecret_source_criterion_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const LP2 = read('resources/lp2-transcription.txt').split('$');
const LP1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('$');
const symbols = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
assert.equal(LP2.length, 10);
assert.equal(LP1.length, 8);

/**
 * Parse the original original runes and punctuation from primary-source
 * text, excluding only the identifiable Arabic numbered-heading dashes.
 * @param {string} source
 * @returns {{digits:number[], headingDashes:number[]}}
 */
function tokenDigits(source) {
  const digits = [];
  const headingDashes = [];
  for (let i = 0; i < source.length; i++) {
    const glyph = source[i];
    const index = symbols.get(glyph);
    if (index !== undefined) {
      digits.push(index);
    } else if (glyph === '-' || glyph === '.') {
      if (glyph === '-' && i > 0 && /[0-9]/.test(source[i - 1])) {
        headingDashes.push(i);
        continue;
      }
      digits.push(29);
    }
  }
  return {digits, headingDashes};
}

/** @typedef {{v:number,L:number,pos:number}} WordToken */

/**
 * Group by actual CIPHERTEXT word geometry. Original printed separators
 * remain in this 30-digit input stream, and their ciphertext state is j=L.
 * A final unterminated word, if present in a positive plant, is valid.
 *
 * @param {number[]} digits
 * @returns {{rows:WordToken[], completeWords:number, maxLength:number}}
 */
function wordGeometry(digits) {
  /** @type {WordToken[]} */
  const rows = [];
  /** @type {number[]} */
  let word = [];
  let completeWords = 0;
  let maxLength = 0;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 30);
    if (digit === 29) {
      const L = word.length;
      for (let j = 0; j < L; j++) rows.push({v:word[j], L, pos:j});
      rows.push({v:29, L, pos:L});
      if (L > 0) completeWords++;
      maxLength = Math.max(maxLength, L);
      word = [];
    } else {
      word.push(digit);
    }
  }
  if (word.length) {
    const L = word.length;
    for (let j = 0; j < L; j++) rows.push({v:word[j], L, pos:j});
    maxLength = Math.max(maxLength, L);
  }
  assert.equal(rows.length, digits.length);
  return {rows, completeWords, maxLength};
}

/**
 * Capacity of an arbitrary 30! bijection per source-state.
 * Let S be decoded SPACE count and T5 decoded aggregate most-common-5
 * plaintext rune count. If T5/(N-S)>=a/b, then b*T5+a*S >= a*N.
 *
 * Every state must choose one of its input symbols as output SPACE. The
 * largest possible 5 plaintext rune counts for that state are the top 5
 * counts excluding that symbol. We unrealistically allow those five
 * classes to differ across states, so this bound is over-generous.
 *
 * @param {WordToken[]} rows
 * @param {(token:WordToken)=>string} state
 * @param {number} a target concentration numerator
 * @param {number} b target concentration denominator
 * @returns {{stateCount:number,upper:number,necessary:number,ratio:number,excluded:boolean}}
 */
function upperBound(rows, state, a, b) {
  /** @type {Map<string,number[]>} */
  const groups = new Map();
  for (const token of rows) {
    const id = state(token);
    if (!groups.has(id)) groups.set(id, Array(30).fill(0));
    groups.get(id)[token.v]++;
  }
  let upper = 0;
  for (const h of groups.values()) {
    const order = h.slice().sort((x, y) => y - x);
    const topFive = order.slice(0, 5).reduce((x, y) => x + y, 0);
    let best = -Infinity;
    for (const spacePreimageCount of h) {
      const topFiveNonspace = topFive -
        (spacePreimageCount >= order[4] ? spacePreimageCount - order[5] : 0);
      best = Math.max(best, b * topFiveNonspace + a * spacePreimageCount);
    }
    assert.ok(Number.isFinite(best));
    upper += best;
  }
  const necessary = a * rows.length;
  return {stateCount:groups.size, upper, necessary,
    ratio:upper / necessary, excluded:upper < necessary};
}

const originalText = LP2.slice(0, 8).join('$');
const parsedOriginal = tokenDigits(originalText);
const original = wordGeometry(parsedOriginal.digits);
const runes = corpus.pages.filter((p) => p.page <= 55)
  .sort((a, b) => a.page - b.page).flatMap((p) => p.indices);
assert.equal(runes.length, 12956);
assert.deepEqual(parsedOriginal.digits.filter((digit) => digit !== 29), runes);
assert.equal(parsedOriginal.headingDashes.length, 6);
assert.deepEqual(parsedOriginal.headingDashes.map((offset) => originalText[offset - 1]),
  ['7','1','2','3','4','5']);
assert.equal(parsedOriginal.digits.length, 15852);
assert.equal(parsedOriginal.digits.filter((digit) => digit === 29).length, 2896);
assert.equal(original.completeWords, 2896);
assert.equal(original.maxLength, 14);

/** @type {{name:string, state:(token:WordToken)=>string, longUpper:number, longStates:number, p57Upper:number, conservativeExcluded:boolean}[]} */
const models = [
  {name:'word length L',
    state:(t) => String(t.L),
    longUpper:4044055, longStates:14, p57Upper:511877,
    conservativeExcluded:true},
  {name:'within-word position j',
    state:(t) => String(t.pos),
    longUpper:4074650, longStates:15, p57Upper:515612,
    conservativeExcluded:true},
  {name:'(L, j mod 2)',
    state:(t) => t.L + ':' + (t.pos % 2),
    longUpper:4420315, longStates:28, p57Upper:559307,
    conservativeExcluded:true},
  {name:'(L, j mod 3)',
    state:(t) => t.L + ':' + (t.pos % 3),
    longUpper:4609360, longStates:41, p57Upper:583140,
    conservativeExcluded:true},
  {name:'(L, j mod 5)',
    state:(t) => t.L + ':' + (t.pos % 5),
    longUpper:4802885, longStates:64, p57Upper:607617,
    conservativeExcluded:false},
  {name:'(L, exact position j)',
    state:(t) => t.L + ':' + t.pos,
    longUpper:5024715, longStates:119, p57Upper:635581,
    conservativeExcluded:false}
];
const qLong = [320,755];
const qShort = [46,95];
const qConservative = [2,5];
const originalResults = [];
for (const model of models) {
  const a = upperBound(original.rows, model.state, ...qLong);
  const b = upperBound(original.rows, model.state, ...qShort);
  const c = upperBound(original.rows, model.state, ...qConservative);
  assert.equal(a.stateCount, model.longStates);
  assert.equal(a.upper, model.longUpper);
  assert.equal(a.necessary, 320 * 15852);
  assert.equal(a.excluded, true);
  assert.equal(b.upper, model.p57Upper);
  assert.equal(b.excluded, true);
  assert.equal(c.excluded, model.conservativeExcluded);
  originalResults.push({model:model.name, states:a.stateCount,
    longCapacityRatio:a.ratio, p57CapacityRatio:b.ratio,
    conservativeCapacityRatio:c.ratio,
    excludesLongNative:a.excluded});
}

// Genuine source-original positive controls: the 755-rune clear LP1
// THE LOSS OF DIVINITY and 95-rune clear p57 PARABLE. In each case both
// the native identity map and a deliberate global GP30 Caesar+1 mapping
// are legal *members* of every state-conditioned arbitrary-bijection family.
// The Caesar+1 operation moves source punctuation into runes and source
// rune index28 into a ciphertext SPACE, so it actually changes the spaces.
const controls = [
  {name:'native LP1 p10-13 755 runes', source:LP1[4],
    expectedRunes:755, expectedSpaces:181, a:320, b:755},
  {name:'native LP2 clear p57 95 runes', source:LP2[9],
    expectedRunes:95, expectedSpaces:20, a:46, b:95}
];
for (const sample of controls) {
  const clear = tokenDigits(sample.source).digits;
  assert.equal(clear.filter((x) => x < 29).length, sample.expectedRunes);
  assert.equal(clear.filter((x) => x === 29).length, sample.expectedSpaces);
  const variants = [
    {name:'source-identity', cipher:clear},
    {name:'real-space-changing Caesar+1',
      cipher:clear.map((x) => (x + 1) % 30)}
  ];
  for (const positive of variants) {
    if (positive.name.includes('Caesar')) {
      assert.deepEqual(positive.cipher.map((x) => (x + 29) % 30), clear);
      assert.notDeepEqual(
        positive.cipher.map((v) => v === 29),
        clear.map((v) => v === 29));
    }
    const geometry = wordGeometry(positive.cipher);
    for (const model of models) {
      const cap = upperBound(geometry.rows, model.state, sample.a, sample.b);
      assert.equal(cap.excluded, false,
        'Source-native positive incorrectly excluded: ' + sample.name +
          ' / ' + model.name + ' / ' + positive.name);
    }
  }
}

console.log('GP30 full word-geometry all-secret native concentration gate: PASS');
console.log('Original source: 12956 runes, 2896 GP separators, 6 Arabic-list dashes outside GP30, 32 cross-page carries preserved.');
console.log('Original complete printed words:', original.completeWords,
  ', max word length:', original.maxLength);
console.log('Every table state gets its own arbitrary 30! bijection; input SPACE can move.');
for (const row of originalResults) console.log(JSON.stringify(row));
console.log('Authentic clear LP1 p10-13 and p57 native GP identity and');
console.log('genuinely SPACE-moving full30 Caesar+1 plants accepted in EVERY state family.');
console.log('All 14-119 state word-geometry models fail at both original solved GP');
console.log('native q=320/755 and q=46/95. The 119-state model is inconclusive at q=2/5.');
console.log('No unknown original plaintext, source-selected key, or general no-go implied.');
