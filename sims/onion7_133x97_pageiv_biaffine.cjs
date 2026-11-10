'use strict';
/**
 * Original onion7 title 133 and exact LP2 55-page IV register: 12901=133*97.
 * Finite source-geometry challenge: C[r,c]=P[r,c]+rowKey[r]+colKey[c] (mod29).
 * Search all 29 exact row/column key choices by deterministic coordinate descent,
 * seeded independently from original LP2, with blinded native-plaintext plants.
 * This tests a conditional direct-GP29 architecture; it does not recover any key.
 *
 * Execute: node sims/onion7_133x97_pageiv_biaffine.cjs
 * @module onion7_133x97_pageiv_biaffine
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const html = read('resources/cicada2014-onion7-index.html');
const title = Number(/<title>(\d+)<\/title>/u.exec(html)?.[1]);
const divId = Number(/<div id="(\d+)">/u.exec(html)?.[1]);
assert.deepEqual([title, divId], [133, 331]);
const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length);
const ivs = pages.map(p => p.indices[0]);
const raw = [];
const delta = [];
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) {
    raw.push(page.indices[i]);
    delta.push((page.indices[i] - page.indices[i - 1] + 29) % 29);
  }
}
const N = raw.length;
assert.equal(pages.length, 55);
assert.equal(ivs.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(N, 12901);
assert.equal(title * 97, N);
assert.equal((title + divId), 464);
assert.equal(corpus.prime[24], 97);
assert.equal(delta.filter(d => d === 0).length, 86);

/** @param {number} initial @returns {() => number} */
function seededRandom(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {string} original @returns {number[]} */
function gpEncode(original) {
  const tokens = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const input = original.toUpperCase().replace(/V/gu, 'U')
    .replace(/K/gu, 'C').replace(/Q/gu, 'C')
    .replace(/Z/gu, 'S').replace(/[^A-Z]/gu, '');
  const output = [];
  for (let i = 0; i < input.length;) {
    const match = tokens.find(t => input.startsWith(t.token, i));
    assert.ok(match, 'unmapped Shakespeare character at ' + i);
    output.push(match.index);
    i += match.token.length;
  }
  return output;
}
/** @returns {{name:string, runes:number[]}[]} */
function references() {
  const latinLetters = '0123456789ABCDEFGHIJKLMNOPQRS';
  const latin = read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/u).filter(w => /^[0-9A-S]+$/u.test(w)).join('')
    .split('').map(g => latinLetters.indexOf(g));
  const english = gpEncode(read('resources/control/shakespeare_first300k.txt'));
  for (const source of [english, latin]) assert.ok(source.length > 120000);
  return [{name:'Shakespeare GP English', runes:english},
    {name:'Vulgate GP Latin', runes:latin}];
}
/** @param {number[]} runes @returns {number[]} */
function trainUnigram(runes) {
  const counts = new Array(29).fill(0);
  for (const r of runes.slice(0, 100000)) counts[r]++;
  return counts.map(n => Math.log((n + 0.01) / (100000 + 0.29)));
}
/**
 * @param {number[]} ciphertext
 * @param {number} width One exact factor of 12901: 133 or 97.
 * @param {number[]} logp Independent GP29 unigram log frequencies.
 * @param {number} [restarts]
 * @param {number} [iterations]
 * @returns {{meanLog:number,score:number,recovered:number[],row:number[],col:number[],start:number}}
 */
function fit(ciphertext, width, logp, restarts=5, iterations=30) {
  assert.equal(ciphertext.length, N);
  assert.ok([97, 133].includes(width));
  const rows = N / width;
  const draw = seededRandom(0x133331 ^ width);
  let champion = {score:-Infinity};
  for (let start = 0; start < restarts; start++) {
    const row = Array.from({length:rows}, () => draw() % 29);
    const col = Array.from({length:width}, () => draw() % 29);
    for (let round = 0; round < iterations; round++) {
      let changes = 0;
      for (let r = 0; r < rows; r++) {
        let best = -Infinity, bestShift = row[r];
        for (let shift = 0; shift < 29; shift++) {
          let score = 0;
          for (let j = 0; j < width; j++) {
            score += logp[(ciphertext[r * width + j] - shift - col[j] + 58) % 29];
          }
          if (score > best) {
            best = score;
            bestShift = shift;
          }
        }
        if (bestShift !== row[r]) changes++;
        row[r] = bestShift;
      }
      for (let j = 0; j < width; j++) {
        let best = -Infinity, bestShift = col[j];
        for (let shift = 0; shift < 29; shift++) {
          let score = 0;
          for (let r = 0; r < rows; r++) {
            score += logp[(ciphertext[r * width + j] - row[r] - shift + 58) % 29];
          }
          if (score > best) {
            best = score;
            bestShift = shift;
          }
        }
        if (bestShift !== col[j]) changes++;
        col[j] = bestShift;
      }
      if (!changes) break;
    }
    const recovered = new Array(N);
    let score = 0;
    for (let i = 0; i < N; i++) {
      const plaintext = (ciphertext[i] -
        row[Math.floor(i / width)] - col[i % width] + 58) % 29;
      recovered[i] = plaintext;
      score += logp[plaintext];
    }
    if (score > champion.score) champion = {
      meanLog:score / N, score, recovered, row:row.slice(), col:col.slice(), start
    };
  }
  return champion;
}
/**
 * @param {number[]} plain
 * @param {number[]} row
 * @param {number[]} col
 * @param {number} width
 * @returns {number[]}
 */
function encrypt(plain,row,col,width) {
  return plain.map((r,i) =>
    (r + row[Math.floor(i / width)] + col[i % width]) % 29);
}
/** @param {number[]} original @returns {string} */
function transliterate(original) {
  return original.slice(0, 90).map(i => corpus.translit[i]).join('');
}
/** @returns {object} */
function run() {
  const languageResults = [];
  for (const reference of references()) {
    const model = trainUnigram(reference.runes);
    const plain = reference.runes.slice(105000, 105000 + N);
    assert.equal(plain.length,N);
    const nativeScore = plain.reduce((sum,r) => sum + model[r], 0) / N;
    const tests = [];
    for (const width of [133, 97]) {
      const draw = seededRandom(0x133133 ^ width);
      const row = Array.from({length:N/width}, () => draw() % 29);
      const col = Array.from({length:width}, () => draw() % 29);
      const plant = encrypt(plain,row,col,width);
      const positive = fit(plant,width,model);
      assert.deepEqual(positive.recovered,plain);
      assert.deepEqual(encrypt(positive.recovered,positive.row,positive.col,width),plant);
      const original = [];
      for (const [register,stream] of [['printed rune',raw],['page-local difference',delta]]) {
        const inversion = fit(stream,width,model);
        assert.deepEqual(encrypt(inversion.recovered,inversion.row,inversion.col,width),stream);
        original.push({register,meanLog:inversion.meanLog,
          first90Translit:transliterate(inversion.recovered),
          trainedRestart:inversion.start,
          originalRuneTransitionsRoundtrip:N});
      }
      tests.push({width,rows:N/width,plantedNativeExact:N,
        plantedNativeMeanLog:positive.meanLog,
        nativeIndependentMeanLog:nativeScore,original});
    }
    languageResults.push({language:reference.name,
      trainingRunes:100000,blindedSampleStart:105000,
      availableRunes:reference.runes.length,tests});
  }
  return {source:'original-onion7 HTML 133/331 and canonical 55 page-first runes',
    sourceCheck:{title,divId,photos:58,unsolvedRunePages:55,
      unsolvedRunes:12956,keptPageInitialRunes:55,
      reversibleOriginalTransitions:N,rectangle:'133 x 97',
      primeThrough3301:464,GP_A_prime:97,doubletMarkers:86},
    model:'per physical page first rune stored as IV; each other rune or page-local difference is one GP29 payload cell; additive row and column GP29 shifts across 133x97 or 97x133; all source row/col shifts are unknown and fitted by exact 29-way coordinate ascent',
    limitations:'Conditional direct-GP29 stationary row/column additive model; no recovered original key/plaintext, changing tables and other registers untested',
    languageResults};
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports = {run,fit,encrypt,gpEncode,references};
