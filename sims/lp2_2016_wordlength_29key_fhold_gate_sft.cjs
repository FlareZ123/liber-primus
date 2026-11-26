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

function gpRuneTokens(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/[KV]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    let token = null;
    for (const d of ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']) {
      if (s.slice(i, i + d.length) === d) { token = d; break; }
    }
    if (!token) token = s[i];
    const index = corpus.translit.indexOf(token);
    assert.notEqual(index, -1, `GP29 token missing: ${token}`);
    out.push(index);
    i += token.length;
  }
  return out;
}
const latinKey = core.map(w => w.length);
const gpTokenLists = core.map(gpRuneTokens);
const gpKey = gpTokenLists.map(tokens => tokens.length);
const rawGpKey = gpTokenLists.flat();
assert.equal(rawGpKey.length, 115);
const dhPowers = [];
let dhValue = 1;
for (let k = 0; k < 22; k++) { dhPowers.push(dhValue); dhValue = dhValue * 5 % 23; }
assert.equal(dhValue, 1); // 5 has order 22 modulo 23 in the signed DH example.
const dhColumnOrder = [...dhPowers, 0]; // zero is outside the multiplicative group; append it.
const dhMatrix = Array.from({ length: 5 }, (_, r) => rawGpKey.slice(r * 23, (r + 1) * 23));
const dhOrderedKey = dhColumnOrder.flatMap(col => Array.from({ length: 5 }, (_, r) => dhMatrix[r][col]));
assert.equal(dhOrderedKey.length, 115);
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
    const K = key[(clock + offset) % key.length];
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
  for (const sign of [-1, 1]) for (let offset = 0; offset < key.length; offset++) {
    rows.push({ sign, offset, ...score(key, sign, offset) });
  }
  const values = rows.map(x => x.hits).sort((a, b) => a - b);
  const best = [...rows].sort((a, b) => b.hits - a.hits || a.offset - b.offset)[0];
  return {
    min: values[0], median: values[Math.floor(values.length / 2)],
    mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    max: values.at(-1), best
  };
}
const unkeyed = score(null, 0, 0).hits;
const latin = sweep(latinKey);
const gp29 = sweep(gpKey);
const rawGp = sweep(rawGpKey);
const dh23 = sweep(dhOrderedKey);
assert.equal(unkeyed, 88);
assert.deepEqual({ min: latin.min, median: latin.median, mean: latin.mean, max: latin.max, sign: latin.best.sign, offset: latin.best.offset },
  { min: 71, median: 93, mean: 93.47, max: 117, sign: 1, offset: 18 });
assert.deepEqual({ min: gp29.min, median: gp29.median, mean: gp29.mean, max: gp29.max, sign: gp29.best.sign, offset: gp29.best.offset },
  { min: 78, median: 94, mean: 94.41, max: 115, sign: -1, offset: 10 });
assert.deepEqual({ min: rawGp.min, median: rawGp.median, mean: rawGp.mean, max: rawGp.max, sign: rawGp.best.sign, offset: rawGp.best.offset },
  { min: 73, median: 93, mean: 94.23, max: 118, sign: 1, offset: 49 });
assert.deepEqual({ min: dh23.min, median: dh23.median, mean: dh23.mean, max: dh23.max, sign: dh23.best.sign, offset: dh23.best.offset },
  { min: 75, median: 94, mean: 93.67, max: 119, sign: -1, offset: 82 });

console.log(JSON.stringify({
  sourceCore: core,
  latinLetterLengths: latinKey,
  gp29RuneLengths: gpKey,
  rawGp29CoreKeyLength: rawGpKey.length,
  rawGp29CoreKey: rawGp,
  dh23ColumnOrder: dhColumnOrder,
  dh23OrderedCoreKey: dh23,
  originalGroups: groups.length,
  controlDictionarySize: dictionary.size,
  unkeyedHits: unkeyed,
  latinLengthKey: latin,
  gp29RuneLengthKey: gp29,
  decision: 'Direct word-length keys and the raw/DH23-ordered 115-symbol GP29 core fail the continuous F-hold additive receiver; best coverage remains about 4.1%.'
}, null, 2));
