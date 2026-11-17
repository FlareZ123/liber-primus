/**
 * Original LP2 physical layout signs: exact two historically solved keys,
 * both signs and every periodic phase, with NO skip/coin/F-bypass.
 * Run: node sims/lp2_layout_23rules_two_historical_keys_noskip_sft.cjs
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
const orient = vectors => vectors.map(v => v.map(x => x * v[0]).join(',')).join('|');
for (const size of [300, Number.POSITIVE_INFINITY]) {
  const equivalence = new Map();
  for (const [name, fn] of Object.entries(rules)) {
    const signature = orient(windows.map(s => s.features.slice(0, size).map(fn)));
    equivalence.set(signature, [...(equivalence.get(signature) || []), name]);
  }
  const duplicates = [...equivalence.values()].filter(g => g.length > 1);
  if (size === 300) {
    assert.deepEqual(duplicates, [['Pa_par','Ps_par','Ps_m3_0']]);
    assert.equal(equivalence.size, 21);
  } else {
    assert.deepEqual(duplicates, [['Pa_par','Ps_par']]);
    assert.equal(equivalence.size, 22);
  }
}
console.log('PASS: 12,956 original ciphertext runes match canonical source; 23 printed layout rules.');
console.log('PASS: 23 historical rules reduce to 22 distinct full-window signs, 21 distinct first-300 signs.');
/** @param {number[]} v @returns {number} */
function ioc(v) {
  const bins = Array(Q).fill(0);
  for (const symbol of v) bins[symbol] += 1;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0) / (v.length * (v.length - 1));
}
/** @param {number} v @returns {number} */
function modulo(v) { return (v % Q + Q) % Q; }
/**
 * @param {number[]} cipher
 * @param {number[]} signs
 * @param {number[]} key
 * @param {number} phase
 * @param {number} direction
 * @returns {number[]}
 */
function inverse(cipher, signs, key, phase, direction) {
  return cipher.map((c, i) => modulo(c - direction * signs[i] * key[(phase + i) % key.length]));
}
/** @type {Record<string,number[]>} */
const keys = {
  DIVINITY: [23,10,1,10,9,10,16,26],
  FIRFUMFERENFE: [0,10,4,0,1,19,0,18,4,18,9,0,18]
};
for (const [name, key] of Object.entries(keys)) {
  const actual = key.map(i => LATIN[i]).join('').replaceAll('U', 'U');
  assert.equal(actual, name === 'DIVINITY' ? 'DIUINITY' : name);
}
// A native GP29 positive plant using real, clear p57 runes, extended to 380 runes.
const native = canonical.pages[57].indices;
assert.equal(native.length, 95);
const positive = Array.from({length: 380}, (_, i) => native[i % native.length]);
const plantSigns = windows[0].features.slice(0, 380).map(rules.Ln_par);
const key = keys.DIVINITY;
const plantCipher = positive.map((p, i) => modulo(p + plantSigns[i] * key[(i + 5) % key.length]));
assert.deepEqual(inverse(plantCipher, plantSigns, key, 5, 1), positive);
assert.ok(ioc(positive) > 0.06);
const winner = {};
for (const [name, material] of Object.entries(keys)) {
  winner[name] = [];
  for (let wi = 0; wi < windows.length; wi += 1) {
    const w = windows[wi];
    let best = {ioc: -1,rule:'',direction:0,phase:0,plain:[]};
    for (const [rule, fn] of Object.entries(rules)) {
      const signs = w.features.map(fn);
      for (const direction of [-1, 1]) {
        for (let phase = 0; phase < material.length; phase += 1) {
          const plain = inverse(w.runes, signs, material, phase, direction);
          const score = ioc(plain);
          if (score > best.ioc) best = {ioc:score,rule,direction,phase,plain};
        }
      }
    }
    // Individual variants were selected from many, so this is a generous maximum,
    // not a statistical p-value; interpret against actual solved GP29 prose.
    assert.ok(best.ioc < 0.0356, 'no original full-window linguistic IoC for ' + name + ' window ' + wi);
    const peek = best.plain.slice(0, 45).map(j => LATIN[j]).join('');
    console.log(name, 'window', wi, 'runes', w.runes.length, 'raw', ioc(w.runes).toFixed(8),
      'best', best.ioc.toFixed(8), 'rule', best.rule, 'sign', best.direction,
      'key_phase', best.phase, 'preview', peek);
    winner[name].push(best.ioc);
  }
}
console.log('PASS: authentic p57 native GP positive encrypts and decrypts exactly under layout signs.');
console.log('NEGATIVE bounded model: both literal 2014 keys, every phase/sign/layout rule,');
console.log('8 original full windows, direct periodic GP29 additive inverse without skip or F bypass.');
