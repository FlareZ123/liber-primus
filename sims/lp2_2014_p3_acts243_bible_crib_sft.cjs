'use strict';
/**
 * Source-frozen Acts 24:3 original p3 rubric crib gate.
 * The historical 16 May 2014 participant reported "WE ACKNOWLEDGE THIS"
 * while mentioning the Bible; Acts 24:3 (NASB 1995) uses those exact words.
 * This test distinguishes a length-compatible crib from a continuing verse.
 * @module lp2_2014_p3_acts243_bible_crib_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = read('lp2-corpus.json');
const ink = read('lp2-ink-annotations.json');
const page = corpus.pages.find(p => p.page === 3);
const annotation = ink.pages.find(p => p.page === 3);
const red = annotation.red_spans.find(s => s.start === 0);
assert.deepEqual({start:red.start, length:red.length}, {start:0, length:16});
const title = ['WE', 'ACKNOWLEDGE', 'THIS'];
const gp = new Map(corpus.translit.map((s, i) => [s, i]));
/** Convert the only source-frozen 16-rune title using conventional GP spellings. */
const tokens = [['W','E'],['A','C','C','N','O','W','L','E','D','G','E'],['TH','I','S']];
const candidate = tokens.flat().map(t => {
  assert(gp.has(t), t);
  return gp.get(t);
});
const lengths = tokens.map(w => w.length);
assert.deepEqual(lengths, [2,11,3]);
assert.equal(candidate.length, red.length);
const cipher = page.indices.slice(0,red.length);
assert.equal(cipher.length,red.length);
assert.deepEqual(cipher.map(x => corpus.runes[x]).join(''), red.runes);
const fixedCribShifts = cipher.map((x,i) => (x - candidate[i] + 29) % 29);
const repeated = Array.from({length:8}, (_,i) => i+1)
 .filter(period => fixedCribShifts.every((v,i) => v===fixedCribShifts[i%period]));
assert.deepEqual(repeated,[]);
const transcription = fs.readFileSync(path.join(root,'resources','liber-primus','lp2-transcription.txt'),'utf8');
const parts = transcription.split(/\r?\n%\r?\n/);
assert(parts.length > 3);
const p3text = parts[3];
const firstDot = p3text.indexOf('.');
assert(firstDot > 0 && p3text.includes(red.runes.slice(0,2)));
const afterTitle = p3text.slice(firstDot+1).replace(/\//g,'').replace(/\r?\n/g,'');
const afterWords = afterTitle.split(/[.\-]/).filter(Boolean).slice(0,5);
const observed = afterWords.map(word => [...word].length);
assert.deepEqual(observed, [4,7,7,7,4]);
// NASB 1995 Acts 24:3 continuation after WE ACKNOWLEDGE THIS is
// IN EVERY WAY AND EVERYWHERE. No optional GP digraph affects "IN".
const bibleNext = [2,5,3,3,10];
assert.notEqual(observed[0],bibleNext[0]);
console.log('SOURCE ORTHOGRAPHY p3 title',title.join(' / '),'GP lengths',lengths.join('-'));
console.log('SOURCE CIPHER first16', cipher.join(','));
console.log('SOURCE GUESS conditioned key residues', fixedCribShifts.join(','));
console.log('SOURCE original next five words', observed.join('-'));
console.log('ACTS 24:3 exact verse continuation GP lengths',bibleNext.join('-'));
console.log('PASS: length-compatible p3 rubric crib; source-native contiguous Acts24:3 continuation fails first original word; no period<=8 key, no recovered plaintext');
