/**
 * Exhaustive all-secret 8/13-symbol GP29 keys under the 23 physically fixed
 * signed-2016 page/line/position rules; exact native-unigram optimum.
 * Run: node sims/lp2_layout_23rules_allsecret_8_13_sft.cjs
 *
 * Inputs are the committed original source-layout transcription and canonical
 * independently checked 12,956-rune physical-page corpus. No writes.
 * @typedef {{pa:number,ps:number,ln:number,ls:number,po:number,rp:number,nr:number,nl:number}} Feature
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Q = 29;
const RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const LATIN = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','ING','OE','D','A','AE','Y','IA','EA'];
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const canonical = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const input = read('resources/transcriptions/liber_primus_master.txt').replace(/\r\n/g, '\n');
const body = input.substring(input.indexOf('\n\n') + 2).split('§')[0];
const chunks = body.split('$');

/** @type {{runes:number[],features:Feature[]}[]} */
const sections = [];
let page = 1;
let line = 1;
let pos = 0;
for (const part of chunks) {
  let sectionPage = 1;
  let sectionLine = 1;
  const runes = [];
  const features = [];
  for (const glyph of part) {
    const code = RUNES.indexOf(glyph);
    if (code >= 0) {
      pos += 1;
      runes.push(code);
      features.push({pa: page, ps: sectionPage, ln: line, ls: sectionLine,
        po: pos, rp: 0, nr: 0, nl: 0});
    } else if (glyph === '%') {
      page += 1;
      sectionPage += 1;
      line = 1;
      pos = 0;
    } else if (glyph === '/') {
      line += 1;
      sectionLine += 1;
      pos = 0;
    }
  }
  if (runes.length) sections.push({runes, features});
}
assert.equal(sections.length, 18, 'physical source segment count');
const sizes = sections.slice(7, 16).map(s => s.runes.length);
assert.deepEqual(sizes, [729,1145,1729,9,1894,1021,1524,1589,3316]);
const original = sections.slice(7,16).flatMap(x => x.runes);
assert.deepEqual(original, canonical.pages.slice(0,56).flatMap(p => p.indices),
  'use the exact 12,956 canonical source rune values');
const pageRunes = new Map();
const pageLines = new Map();
const pagePosition = new Map();
for (const section of sections) {
  for (const f of section.features) {
    pageRunes.set(f.pa, (pageRunes.get(f.pa) || 0) + 1);
    pageLines.set(f.pa, Math.max(pageLines.get(f.pa) || 0, f.ln));
  }
}
for (const section of sections) {
  for (const f of section.features) {
    f.rp = (pagePosition.get(f.pa) || 0) + 1;
    pagePosition.set(f.pa, f.rp);
    f.nr = pageRunes.get(f.pa);
    f.nl = pageLines.get(f.pa);
  }
}
const par = v => v % 2 === 0 ? 1 : -1;
const mod3 = (v, phase) => (v + phase) % 3 <= 1 ? 1 : -1;
/** @type {Record<string, (f:Feature)=>number>} */
const rules = {
  Pa_par: f => par(f.pa),
  Ps_par: f => par(f.ps),
  Ln_par: f => par(f.ln),
  Ls_par: f => par(f.ls),
  Po_par: f => par(f.po),
  PL_xor: f => par(f.pa + f.ln),
  Pg_half_runes: f => 2 * f.rp <= f.nr ? 1 : -1,
  Pg_half_lines: f => 2 * f.ln <= f.nl ? 1 : -1
};
for (const [p, key] of Object.entries({Pa:'pa',Ps:'ps',Ln:'ln',Ls:'ls',Po:'po'})) {
  for (let phase = 0; phase < 3; phase += 1) {
    rules[p + '_m3_' + phase] = f => mod3(f[key], phase);
  }
}
assert.equal(Object.keys(rules).length, 23);
const windows = sections.slice(7,16).filter(x => x.runes.length >= 100);

const windows = sections.slice(7, 16).filter(s => s.runes.length >= 100);
assert.deepEqual(windows.map(w => w.runes.length),
  [729,1145,1729,1894,1021,1524,1589,3316]);
const glyphs = ['ING','TH','EO','NG','OE','AE','IA','EA',
  ...LATIN.filter(name => name.length === 1)];
const translits = new Map([...LATIN.map((name, i) => [name, i]), ['NG',21]]);
/**
 * Map independent English reference text to Gematria Primus runes.
 * Source-compatible contractions: V->U, K->C, QU->CW, Z->S, ING->NG.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeRunes(raw) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const ans = [];
  for (let p = 0; p < text.length;) {
    const match = glyphs.find(g => text.startsWith(g, p));
    if (match) {
      ans.push(translits.get(match === 'ING' ? 'ING' : match));
      p += match.length;
    } else {
      p += 1;
    }
  }
  return ans;
}
const training = nativeRunes(read('resources/control/gibran_prophet_58585.txt'));
const heldout = nativeRunes(read('resources/control/shakespeare_first300k.txt'));
assert.equal(training.length, 62696);
assert.equal(heldout.length, 217644);
const counts = Array(Q).fill(1);
for (const v of training) counts[v] += 1;
const total = counts.reduce((a, b) => a + b, 0);
const logLR = counts.map(n => Math.log(Q * n / total));
/**
 * Average native-GP log likelihood ratio against uniform GP29.
 * @param {number[]} symbols
 * @returns {number}
 */
function score(symbols) {
  return symbols.reduce((a, v) => a + logLR[v], 0) / symbols.length;
}
/** @param {number} x @returns {number} */
function mod(x) { return (x % Q + Q) % Q; }
/**
 * Compute the EXACT all-secret maximum independently for each key residue.
 * The objective is separable by i mod period; the global +/- sign and
 * unknown initial phase are absorbed by unrestricted secret key values.
 * @param {number[]} ciphertext
 * @param {number[]} signs
 * @param {number} period
 * @returns {{score:number,key:number[]}}
 */
function maximize(ciphertext, signs, period) {
  assert.equal(ciphertext.length, signs.length);
  const key = [];
  let maximum = 0;
  for (let phase = 0; phase < period; phase += 1) {
    const positive = Array(Q).fill(0);
    const negative = Array(Q).fill(0);
    for (let i = phase; i < ciphertext.length; i += period) {
      (signs[i] === 1 ? positive : negative)[ciphertext[i]] += 1;
    }
    let bestScore = -Infinity;
    let bestKey = -1;
    for (let k = 0; k < Q; k += 1) {
      let localScore = 0;
      for (let c = 0; c < Q; c += 1) {
        localScore += positive[c] * logLR[mod(c - k)];
        localScore += negative[c] * logLR[mod(c + k)];
      }
      if (localScore > bestScore) {
        bestScore = localScore;
        bestKey = k;
      }
    }
    maximum += bestScore;
    key.push(bestKey);
  }
  return {score: maximum / ciphertext.length, key};
}
/** @param {number[]} plain @param {number[]} signs @param {number[]} key */
function encrypt(plain, signs, key) {
  return plain.map((p, i) => mod(p + signs[i] * key[i % key.length]));
}
/** @param {number[]} cipher @param {number[]} signs @param {number[]} key */
function decrypt(cipher, signs, key) {
  return cipher.map((c, i) => mod(c - signs[i] * key[i % key.length]));
}
const historicalLengths = {
  8: [23,10,1,10,9,10,16,26],
  13: [0,10,4,0,1,19,0,18,4,18,9,0,18]
};
const sourceClearP57 = canonical.pages[57].indices;
const sourceCipherP56 = canonical.pages[56].indices;
assert.equal(sourceClearP57.length, 95);
assert.equal(sourceCipherP56.length, 85);
const sourceClearScore = score(sourceClearP57);
const sourceCipherScore = score(sourceCipherP56);
assert.ok(sourceClearScore > 0.40, 'real clear original p57 must register as GP English');
assert.ok(sourceCipherScore < -0.50, 'still-encrypted p56 original is not clear GP English');
console.log('INDEPENDENT REAL SOURCE p57 clear GP native score:', sourceClearScore.toFixed(9),
  'p56 encrypted rune score:', sourceCipherScore.toFixed(9));
console.log('SOURCE original GP runes:', original.length,
  'rune-bearing original windows:', windows.length,
  'native training:', training.length, 'heldout:', heldout.length);
assert.ok(score(heldout.slice(0, 12000)) > 0.35, 'independent GP-English source quality');
for (let wi = 0; wi < windows.length; wi += 1) {
  const {runes, features} = windows[wi];
  for (const len of [8, 13]) {
    const candidates = Object.entries(rules).map(([name, rule]) => {
      const signs = features.map(rule);
      return {name, ...maximize(runes, signs, len)};
    }).sort((a, b) => b.score - a.score);
    const best = candidates[0];
    assert.ok(best.score < -0.30,
      'the native-GP all-secret upper bound is unexpectedly high on window ' + wi);
    const sourceKey = historicalLengths[len];
    const native = heldout.slice(2000 + 4000 * wi,
      2000 + 4000 * wi + runes.length);
    assert.equal(native.length, runes.length);
    // A source-original physical line sign, native English wholly held out
    // from training, and a secret historical-length key planted blindly.
    const signs = features.map(rules.Ln_m3_1);
    const plant = encrypt(native, signs, sourceKey);
    const recovered = maximize(plant, signs, len);
    assert.ok(score(native) > 0.30,
      'held-out native-GP English remains distinguishable');
    assert.deepEqual(recovered.key, sourceKey,
      'blind all-secret inverse recovered the wrong planted key');
    assert.deepEqual(decrypt(plant, signs, recovered.key), native,
      'blind all-secret inverse did not recover exact native plaintext');
    assert.ok(recovered.score > 0.30);
    console.log('ORIGINAL window', wi, 'runes', runes.length, 'secret period',
      len, 'best of all 23 original signs:', best.name,
      'upper bound logLR/rune:', best.score.toFixed(9),
      'plant logLR/rune:', recovered.score.toFixed(9),
      'secret key recovered:', recovered.key.join(','));
  }
}
console.log('PASS: all 16 planted, source-layout GP-English controls recover');
console.log('their complete hidden keys and plaintext exactly, with no fitting of');
console.log('the layout rule or original ciphertext.');
console.log('BOUNDED EXCLUSION: all 29^8 and 29^13 secret additive keys,');
console.log('all 23 fixed original-layout signs, all eight original long sections.');
console.log('Scope: no skip/coin, plaintext-F transparency, nonperiodic key,');
console.log('nonadditive layer, or unmodeled plaintext register.');
