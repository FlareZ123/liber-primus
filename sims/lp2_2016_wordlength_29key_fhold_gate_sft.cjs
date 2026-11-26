'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/transcriptions/lp2_krisyotam_2017.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const controls = [
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/emerson_essays_2944.txt'),
  read('resources/control/gibran_prophet_58585.txt')
];

const N = 12956;
const body = signed.slice(signed.indexOf('Hash: SHA1') + 'Hash: SHA1'.length,
  signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
const signedWords = body.match(/[A-Za-z]+/g) || [];
const core = signedWords.slice(1, 30);
assert.equal(core.length, 29);
assert.equal(core[0].toLowerCase(), 'the');
assert.equal(core[28].toLowerCase(), 'direction');

function gpRuneLength(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/[KV]/g, 'C').replace(/Z/g, 'S');
  let count = 0;
  for (let i = 0; i < s.length;) {
    let token = null;
    for (const d of ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']) {
      if (s.slice(i, i + d.length) === d) { token = d; break; }
    }
    if (!token) token = s[i];
    i += token.length;
    count++;
  }
  return count;
}
const latinKey = core.map(w => w.length);
const gpKey = core.map(gpRuneLength);
assert.deepEqual(latinKey, [3,4,4,5,8,5,3,7,5,6,2,3,3,3,5,3,3,3,5,7,2,3,4,3,5,7,3,3,9]);
assert.deepEqual(gpKey, [2,3,4,5,8,5,2,7,5,6,2,2,3,3,5,3,2,3,4,5,2,2,4,3,4,7,3,2,9]);

const runeChars = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const runeIndex = new Map([...runeChars].map((r, i) => [r, i]));
const breaks = new Set('-.&$§');
const records = [];
let current = null, runePosition = 0;
function closeWord() {
  if (current && current.values.length) records.push(current);
  current = null;
}
for (const ch of transcription) {
  if (runeIndex.has(ch)) {
    if (!current) current = { start: runePosition, values: [] };
    current.values.push(runeIndex.get(ch));
    runePosition++;
  } else if (breaks.has(ch) || /[0-9]/.test(ch)) closeWord();
}
closeWord();
const tape = corpus.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices);
assert.equal(tape.length, N);
const groups = records.filter(g => g.start + g.values.length <= N);
assert.equal(groups.length, 2896);
assert.equal(groups.reduce((n, g) => n + g.values.length, 0), N);

const dictionary = new Set(controls.flatMap(text => text.match(/[A-Za-z]+/g) || []).map(w => w.toLowerCase()));
assert.equal(dictionary.size, 12244);

function score(key, sign, offset) {
  let clock = 0;
  const plain = tape.map(C => {
    if (C === 0) return 0; // p56 transparent F: do not consume a key symbol.
    if (key === null) return C;
    const K = key[(clock + offset) % 29];
    clock++;
    return ((C - sign * K) % 29 + 29) % 29;
  });
  let hits = 0;
  const sample = [];
  for (const g of groups) {
    const word = g.values.map((_, i) => corpus.translit[plain[g.start + i]]).join('').toLowerCase();
    if (dictionary.has(word)) hits++;
    if (sample.length < 8) sample.push(word);
  }
  return { hits, sample };
}
function sweep(key) {
  const rows = [];
  for (const sign of [-1, 1]) for (let offset = 0; offset < 29; offset++) {
    rows.push({ sign, offset, ...score(key, sign, offset) });
  }
  const values = rows.map(x => x.hits).sort((a, b) => a - b);
  const best = [...rows].sort((a, b) => b.hits - a.hits || a.offset - b.offset)[0];
  return {
    min: values[0], median: values[29],
    mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    max: values.at(-1), best
  };
}
const unkeyed = score(null, 0, 0).hits;
const latin = sweep(latinKey);
const gp29 = sweep(gpKey);
assert.equal(unkeyed, 88);
assert.deepEqual({ min: latin.min, median: latin.median, mean: latin.mean, max: latin.max, sign: latin.best.sign, offset: latin.best.offset },
  { min: 71, median: 93, mean: 93.47, max: 117, sign: 1, offset: 18 });
assert.deepEqual({ min: gp29.min, median: gp29.median, mean: gp29.mean, max: gp29.max, sign: gp29.best.sign, offset: gp29.best.offset },
  { min: 78, median: 94, mean: 94.41, max: 115, sign: -1, offset: 10 });

console.log(JSON.stringify({
  sourceCore: core,
  latinLetterLengths: latinKey,
  gp29RuneLengths: gpKey,
  originalGroups: groups.length,
  controlDictionarySize: dictionary.size,
  unkeyedHits: unkeyed,
  latinLengthKey: latin,
  gp29RuneLengthKey: gp29,
  decision: 'Neither direct 29-word length key yields ordinary English under the continuous F-hold additive receiver; best coverage is 4.04% and 3.97%.'
}, null, 2));
