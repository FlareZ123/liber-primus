'use strict';

/**
 * One-file source-only test of 2016 Cicada signed-message cribs against
 * physical LP2 pages and the p50 table.
 * Node.js 22 CommonJS, Windows-compatible, no external dependencies.
 *
 * Claims:
 *  - Literal signed source word-length six-grams are nonselective.
 *  - EPIPHANY SEEKS is a pre-existing conditional p0 title, NOT known plaintext.
 *  - Its 13-symbol additive-pad hypothesis admits a six-tap linear predictor
 *    on its first 12 symbols, but extrapolation fails on the untouched body.
 *  - Natural direct p50 table projections / table walks do not supply this pad.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const textFile = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(textFile('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(textFile('resources/liber-primus/lp2-grid-256.json'));
const signed = textFile('resources/historical/cicada2016-4gq25-outguess.asc');
const transcript = textFile('resources/liber-primus/lp2-transcription.txt');

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function inv29(n) {
  for (let x = 1; x < 29; x++) if (n * x % 29 === 1) return x;
  throw new Error('Noninvertible GF29 element: ' + n);
}

/** @param {number[]} seq @returns {{degree:number, polynomial:number[]}} */
function berlekampMassey(seq) {
  let c = [1], b = [1], degree = 0, step = 1, last = 1;
  for (let n = 0; n < seq.length; n++) {
    let discrepancy = seq[n];
    for (let j = 1; j <= degree; j++)
      discrepancy = mod29(discrepancy + c[j] * seq[n - j]);
    if (discrepancy === 0) {
      step++;
      continue;
    }
    const previous = c.slice();
    while (c.length < b.length + step) c.push(0);
    const scale = mod29(discrepancy * inv29(last));
    for (let j = 0; j < b.length; j++)
      c[j + step] = mod29(c[j + step] - scale * b[j]);
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      b = previous;
      last = discrepancy;
      step = 1;
    } else step++;
  }
  return {degree, polynomial: c.slice(0, degree + 1)};
}

/**
 * @param {number[]} prefix
 * @param {number[]} polynomial
 * @param {number} total
 * @returns {number[]}
 */
function extrapolate(prefix, polynomial, total) {
  const out = prefix.slice();
  for (let n = out.length; n < total; n++) {
    let next = 0;
    for (let j = 1; j < polynomial.length; j++)
      next += polynomial[j] * out[n - j];
    out.push(mod29(-next));
  }
  return out;
}

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) /
    (seq.length * (seq.length - 1));
}

/** @param {string} word @param {boolean} ingRune @returns {number} */
function gpLength(word, ingRune) {
  let normalized = word.replaceAll('K', 'C').replaceAll('V', 'U');
  if (ingRune) normalized = normalized.replaceAll('ING', '\u014b');
  return (normalized.match(/TH|NG|EA|EO|OE|AE|IA|./g) || []).length;
}

const originalWords = signed.replace(/\r\n?/g, '\n')
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .split('\n\n').slice(1).join(' ')
  .replace(/3301|7A35090F/gi, ' ')
  .match(/[A-Za-z]+/g).map(x => x.toUpperCase());
assert.equal(originalWords.length, 43);
assert.equal(originalWords[5], 'EPIPHANY');
assert.equal(originalWords[6], 'SEEKS');

/** @type {{page:number,lengths:number[]}[]} */
const physical = transcript.replace(/[\r\n/]/g, '').replace(/[&$§]/g, '-')
  .split('%')
  .map(page => page.split(/[.-]/)
    .map(word => [...word].filter(ch => /[\u16a0-\u16ff]/u.test(ch)).length)
    .filter(Boolean))
  .filter(page => page.length > 0)
  .map((lengths, i) => ({page: i < 50 ? i : i + 1, lengths}))
  .filter(page => page.page <= 55);
assert.equal(physical.length, 55);
assert.equal(physical.reduce((n, page) => n + page.lengths.length, 0), 2928);
const knownRunes = corpus.pages.filter(x => x.page <= 55)
  .reduce((n, page) => n + page.indices.length, 0);
assert.equal(knownRunes, 12956);

const variants = [
  {name:'Latin letters', lengths:originalWords.map(w => w.length)},
  {name:'GP graphemes', lengths:originalWords.map(w => gpLength(w, false))},
  {name:'GP with ING rune', lengths:originalWords.map(w => gpLength(w, true))}
];
/** @param {number[]} values @param {number} size @returns {string[]} */
function grams(values, size) {
  const out = [];
  for (let i = 0; i <= values.length - size; i++)
    out.push(values.slice(i, i + size).join(','));
  return out;
}
/** @param {number[]} values @param {Set<string>} keys @param {number} n @returns {boolean} */
function hasGram(values, keys, n) {
  for (const gram of grams(values, n)) if (keys.has(gram)) return true;
  return false;
}
const pageGrams = new Map([6,7].map(n => [n,
  new Set(physical.flatMap(page => grams(page.lengths, n)))]));

const observed = variants.map(variant => {
  let best = 0;
  const hits = [];
  for (const page of physical)
    for (let a = 0; a < variant.lengths.length; a++)
      for (let b = 0; b < page.lengths.length; b++) {
        let len = 0;
        while (a + len < variant.lengths.length
          && b + len < page.lengths.length
          && variant.lengths[a + len] === page.lengths[b + len]) len++;
        best = Math.max(best, len);
        if (len >= 6 && (a === 0 || b === 0 ||
            variant.lengths[a - 1] !== page.lengths[b - 1]))
          hits.push({sourceWord:a,physicalPage:page.page,fragment:b,length:len});
      }
  return {variant:variant.name,maxCommonWords:best,hits};
});
assert.deepEqual(observed.map(x => x.maxCommonWords), [5,6,6]);

// Deterministic permutations preserve source word lengths and repeats.
// Used only as a conditional selectivity calibration, not a discovery-wide p-value.
let state = 3301;
/** @returns {number} */
function nextRandom32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 100000;
const hits6 = [0,0,0], hits7 = [0,0,0];
let any6 = 0;
for (let trial = 0; trial < trials; trial++) {
  const order = Array.from({length:originalWords.length}, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    // Unbiased rejection sampling in a 32-bit integer range.
    const range = i + 1;
    const limit = Math.floor(4294967296 / range) * range;
    let random = nextRandom32();
    while (random >= limit) random = nextRandom32();
    const j = random % range;
    [order[i], order[j]] = [order[j], order[i]];
  }
  let any = false;
  variants.forEach((variant, i) => {
    const permuted = order.map(index => variant.lengths[index]);
    const h6 = hasGram(permuted, pageGrams.get(6), 6);
    const h7 = hasGram(permuted, pageGrams.get(7), 7);
    if (h6) hits6[i]++;
    if (h7) hits7[i]++;
    any ||= h6;
  });
  if (any) any6++;
}
const shuffled = variants.map((variant, i) =>
  ({variant:variant.name,randomAtLeastSix:hits6[i],
    randomAtLeastSeven:hits7[i],trials}));
assert.ok(hits6.every(x => x > 50000)); // Observed six-gram matches are weak.

const p0 = corpus.pages.find(p => p.page === 0).indices;
assert.equal(p0.length, 262);
const candidate = 'EPIPHANYSEECS';
const candidateIndices = [...candidate].map(ch => corpus.translit.indexOf(ch));
assert.ok(candidateIndices.every(index => index >= 0));
const key = candidateIndices.map((p, i) => mod29(p0[i] - p));
assert.deepEqual(key, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
const fitted = berlekampMassey(key.slice(0, 12));
assert.deepEqual(fitted, {degree:6,polynomial:[1,9,13,23,22,17,23]});
const predicted = extrapolate(key.slice(0, 12), fitted.polynomial, p0.length);
assert.equal(predicted[12], key[12]);
const decrypted = p0.map((v, i) => mod29(v - predicted[i]));
assert.deepEqual(decrypted.slice(0,13), candidateIndices);
const bodyIoc = ioc(decrypted.slice(13));
assert.ok(bodyIoc < 0.045);
const p57Ioc = ioc(corpus.pages.find(p => p.page === 57).indices);
assert.ok(p57Ioc > 0.055);

// Independent synthetic control: construct 95 known p57 runes with the exact
// recovered recurrence and confirm recovery of the entire planted body.
const controlPlain = corpus.pages.find(p => p.page === 57).indices;
const planted = controlPlain.map((plain, i) =>
  mod29(plain + predicted[i]));
const recovered = planted.map((cipher, i) =>
  mod29(cipher - extrapolate(key.slice(0,12), fitted.polynomial, controlPlain.length)[i]));
assert.deepEqual(recovered, controlPlain);

// Source-motivated continuation of the same p0 13-dot key/title clue:
// classical fixed-primer Vigenere and plaintext/ciphertext autokey, unchanged
// GP29 source clock from the first post-title rune, both additive signs.
const conventional = [];
for (const primer of [
  {name:'inferred-title-plaintext',values:candidateIndices},
  {name:'original-red-ciphertext',values:p0.slice(0, 13)},
  {name:'inferred-title-pad',values:key}
]) for (const sign of [1,-1]) {
  const body = p0.slice(13).map((v,i) => mod29(v + sign * primer.values[i%13]));
  conventional.push({mode:'repeating-primer',primer:primer.name,
    sign,bodyIoc:ioc(body)});
}
for (const kind of ['plaintext','ciphertext']) for (const sign of [1,-1]) {
  const decoded = candidateIndices.slice();
  for (let i = 13; i < p0.length; i++) {
    const step = kind === 'plaintext' ? decoded[i-13] : p0[i-13];
    decoded.push(mod29(p0[i] + sign * step));
  }
  conventional.push({mode:kind+'-autokey',primer:'known-title',sign,
    bodyIoc:ioc(decoded.slice(13))});
}
assert.equal(conventional.length, 10);
assert.ok(conventional.every(x => x.bodyIoc < .045)); // All fail native GP29 prose IoC.

// Direct use of the visually exact thirteen original p50 table rows as key
// material: each of 8 columns and four natural row summaries.
const mid = grid.pages.find(p => p.page === 50);
assert.equal(mid.rows, 13);
assert.equal(mid.cols, 8);
const rows = Array.from({length:13}, (_, i) => mid.bytes.slice(i*8, i*8+8));
/** @type {{name:string,values:number[]}[]} */
const direct = [];
for (let col = 0; col < 8; col++) {
  direct.push({name:'byte mod29 col'+col,values:rows.map(r => r[col] % 29)});
  direct.push({name:'hi digit mod29 col'+col,values:rows.map(r => Math.floor(r[col]/60) % 29)});
  direct.push({name:'lo digit mod29 col'+col,values:rows.map(r => (r[col]%60)%29)});
}
direct.push({name:'row byte sum',values:rows.map(r => r.reduce((a,b)=>a+b,0)%29)});
direct.push({name:'row byte xor',values:rows.map(r => r.reduce((a,b)=>a^b,0)%29)});
direct.push({name:'row first digit sum',values:rows.map(r =>
  r.reduce((a,b)=>a+Math.floor(b/60),0)%29)});
direct.push({name:'row second digit sum',values:rows.map(r =>
  r.reduce((a,b)=>a+b%60,0)%29)});
const scored = direct.map(v => ({name:v.name,
  matches:v.values.reduce((n,x,i)=>n+(x===key[i]),0)}))
  .sort((a,b)=>b.matches-a.matches);
assert.equal(scored.length, 28);
assert.equal(scored[0].matches, 2);

// Direct graph successors from all 256 original cells, both documented digit
// conventions, four unchanged output channels. No fitted phase/key.
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const alphabet = grid.alphabet;
let walks = 0, bestWalkMatch = 0;
for (const radix of [59,60]) {
  const successor = tokens.map(t =>
    alphabet.indexOf(t[0])*radix + alphabet.indexOf(t[1]));
  for (let start = 0; start < 256; start++) {
    const cells = [];
    let x = start;
    for (let i = 0; i < 13; i++) {
      if (x < 0 || x > 255) break;
      cells.push(x);
      x = successor[x];
    }
    if (cells.length !== 13) continue;
    const channels = [
      cells.map(i => successor[i]%29),
      cells.map(i => i%29),
      cells.map(i => alphabet.indexOf(tokens[i][0])%29),
      cells.map(i => alphabet.indexOf(tokens[i][1])%29)
    ];
    for (const readout of channels) {
      walks++;
      const matches = readout.reduce((n,val,i)=>n+(val===key[i]),0);
      bestWalkMatch = Math.max(bestWalkMatch, matches);
    }
  }
}
assert.equal(walks, 2048);
assert.equal(bestWalkMatch, 3);

console.log(JSON.stringify({
  original:{runes:knownRunes,physicalPages:physical.length,
    physicalWordFragments:2928,signedWords:originalWords.length},
  literalCrib:{observed,shuffled,permutations:trials,anySixInRandom:any6},
  headerKey:{hypothesis:'EPIPHANY SEEKS',pad:key,recurrence:fitted,
    predicted13:predicted[12],observed13:key[12],
    bodyIoc,knownClearP57Ioc:p57Ioc,
    bodyPrefixGP:decrypted.slice(13,93).map(i=>corpus.translit[i]).join(''),
    planted95RunesRecovered:true,
    conventionalTitleConsumers:conventional},
  p50:{middleRows:rows.length,directProjections:direct.length,
    bestProjection:scored[0],originalTableGraphWalks:walks,
    bestOriginalWalkMatches:bestWalkMatch},
  status:'No authenticated unknown-page plaintext, creator key, or general inverse.'
}, null, 2));
