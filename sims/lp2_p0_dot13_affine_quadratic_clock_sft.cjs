'use strict';

/**
 * Original p0 red13 lexical receiver, broadening the earlier stationary
 * source-square additive screen to all affine and quadratic dot-position
 * clocks over GF(29), even with a secret arbitrary square-value codebook.
 *
 * Windows 11 / Node 22 CommonJS single runnable test:
 * node sims/lp2_p0_dot13_affine_quadratic_clock_sft.cjs
 *
 * This is a NECESSARY-condition screen; possible surviving pairs would
 * require an additional source-key consistency check.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher = corpus.pages.find(page => page.page === 0).indices.slice(0, 13);
assert.deepEqual(cipher, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const mod = x => ((x % 29) + 29) % 29;
const inverseTwo = 15; // 2 * 15 = 1 (mod 29).
const singles = new Map(corpus.translit.map((s,i) => [s,i]));
const tokens = corpus.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);

/**
 * @param {string} source
 * @param {'native'|'letter'} spelling
 * @returns {number[]}
 */
function encode(source, spelling) {
  const word = source.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (spelling === 'native' && word.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (spelling === 'native' && word.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else if (spelling === 'letter') {
      const value = singles.get(word[i]);
      assert.notEqual(value, undefined, word);
      out.push(value); i++;
    } else {
      const match = tokens.find(token => word.startsWith(token.s, i));
      assert.ok(match, word);
      out.push(match.i); i += match.s.length;
    }
  }
  return out;
}

/**
 * Key independent screen for k_i = f(v_i) + a*i + b*i*i mod 29.
 * The original source v_i = v_(12-i) implies
 * k_(12-i)-k_i=(12-2*i)*t, t=a+12*b mod 29.
 * First-word positions 5 and 7 determine t, unless a literal F is
 * passed through at either of those two positions.
 *
 * @param {number[]} input
 * @param {{name:string,s:number[]}[]} first
 * @param {{name:string,s:number[]}[]} second
 * @param {boolean} passF
 * @returns {{first:number,second:number,eligibleFirst:number,
 * phases:number,matchCount:number,matches:object[]}}
 */
function screen(input, first, second, passF) {
  assert.equal(input.length, 13);
  const bins = Array.from({length:5}, () =>
    Array.from({length:29}, () => []));
  for (const row of second)
    for (let j = 0; j < 5; j++) bins[j][row.s[j]].push(row);
  const matches = [];
  let eligibleFirst = 0, phases = 0;
  for (const row of first) {
    const p = row.s;
    if (passF && p.some((v,i) => v === 0 && input[i] !== 0)) continue;
    eligibleFirst++;
    const unknownSlope = passF && (p[5] === 0 || p[7] === 0);
    const slopes = unknownSlope
      ? Array.from({length:29}, (_,i) => i)
      : [mod((input[7]-p[7]-input[5]+p[5])*inverseTwo)];
    for (const t of slopes) {
      phases++;
      const allowed = Array(5);
      for (let i = 0; i < 5; i++) {
        const j = 12-i, position = 4-i;
        if (passF && p[i] === 0) {
          allowed[position] = Array.from({length:29}, (_,v) => v)
            .filter(v => v !== 0 || input[j] === 0);
        } else {
          const predicted = mod(input[j]-input[i]+p[i]-t*(j-i));
          allowed[position] = passF && input[j] === 0 && predicted !== 0
            ? [predicted, 0] : [predicted];
        }
      }
      let best = 0, smallest = Number.POSITIVE_INFINITY;
      const accepted = allowed.map(values => new Set(values));
      for (let pos = 0; pos < 5; pos++) {
        const count = allowed[pos].reduce((n,v) => n+bins[pos][v].length, 0);
        if (count < smallest) { smallest = count; best = pos; }
      }
      for (const value of allowed[best]) {
        for (const candidate of bins[best][value]) {
          if (candidate.s.every((symbol,i) => accepted[i].has(symbol)))
            matches.push({first:row.name, second:candidate.name, t});
        }
      }
    }
  }
  return {
    first:first.length, second:second.length,
    eligibleFirst, phases, matchCount:matches.length,
    matches
  };
}

/** @param {'native'|'letter'} spelling */
function english(spelling) {
  const raw = read('resources/control/english_wordfreq_textblob.txt')
    .match(/^[a-z]+/gmi) || [];
  const eights = new Map(), fives = new Map();
  for (const name of raw) {
    const s = encode(name, spelling);
    const chosen = s.length === 8 ? eights : s.length === 5 ? fives : null;
    if (chosen && !chosen.has(s.join(',')))
      chosen.set(s.join(','), {name, s});
  }
  return [[...eights.values()], [...fives.values()]];
}

function latin() {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  const eights = new Map(), fives = new Map();
  for (const name of read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/)) {
    if (!(/^[0-9A-S]{5}$|^[0-9A-S]{8}$/.test(name))) continue;
    const s = [...name].map(c => alphabet.indexOf(c));
    const chosen = s.length === 8 ? eights : fives;
    if (!chosen.has(s.join(','))) chosen.set(s.join(','), {name,s});
  }
  return [[...eights.values()], [...fives.values()]];
}

/** @returns {number[][]} */
function sourceBands() {
  const matrices = read('resources/cicada2014-openpuff-magic-squares.txt')
    .trim().split(/\r?\n\s*\r?\n/).map(block => block.trim()
      .split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(matrices.map(m => m.length), [5,7,5]);
  return [matrices[0], matrices[2]].map(matrix => {
    const band = [];
    for (const delta of [1,0,-1])
      for (let r = 0; r < 5; r++) {
        const c = r - delta;
        if (c >= 0 && c < 5) band.push(matrix[r][c]);
      }
    assert.equal(band.length, 13);
    for (let i = 0; i < 6; i++) assert.equal(band[i],band[12-i]);
    return band;
  });
}

/** @param {number[]} sourceKey @param {number[]} plain
 * @param {number} a @param {number} b @param {boolean} passF */
function plant(sourceKey, plain, a, b, passF) {
  return plain.map((v,i) => passF && v === 0 ? 0 :
    mod(v + sourceKey[i] % 29 + a*i + b*i*i));
}

function main() {
  const bands = sourceBands();
  const result = {};
  for (const spelling of ['native','letter']) {
    const [first,second] = english(spelling);
    const simple = screen(cipher,first,second,false);
    const passF = screen(cipher,first,second,true);
    assert.equal(simple.matchCount,0);
    assert.equal(passF.matchCount,0);
    assert.deepEqual([first.length,second.length],
      spelling === 'native' ? [4325,3613] : [4472,2940]);

    // Source-native positive phrase with genuinely non-palindromic key.
    const phrase = ['epiphany','seeks'].flatMap(w => encode(w,spelling));
    assert.equal(phrase.length,13);
    let positives=0;
    for (const band of bands) for (const [a,b] of [[5,7],[9,11]]) {
      for (const bypass of [false,true]) {
        const generated = plant(band,phrase,a,b,bypass);
        const recognized = screen(generated,first,second,bypass);
        assert(recognized.matches.some(x =>
          x.first === 'epiphany' && x.second === 'seeks' &&
          x.t === mod(a+12*b)));
        positives++;
      }
    }
    result[spelling] = {normal:simple, literalF:passF, positives};
  }
  const [first, second] = latin();
  const normal = screen(cipher,first,second,false);
  const literalF = screen(cipher,first,second,true);
  for (const item of [normal,literalF]) {
    assert.equal(item.matchCount,1);
    assert.equal(item.matches[0].first,'5I41A5IF');
    assert.equal(item.matches[0].second,'JO42O');
    assert.equal(item.matches[0].t,0);
  }
  result.latin = {normal,literalF};
  console.log(JSON.stringify({
    status:'PASS',
    source:'2014 5x5 source squares; original 13-rune p0 red title; pinned English and Latin lexicons',
    class:'all additive k[i]=arbitrary_f(sourceBand[i])+a*i+b*i*i modulo29',
    result,
    conclusion:'No GP-English 8|5 plaintext in the pinned wholeword corpus, even with arbitrary affine or quadratic dot-position clocks; Latin admits only the previous unattested CERVICES MARTHA pair.'
  },null,2));
}
if (require.main === module) main();
module.exports = {encode,screen,sourceBands,plant};
