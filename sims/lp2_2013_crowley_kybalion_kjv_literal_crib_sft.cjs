'use strict';

/**
 * First-party Cicada-era literary-crib negative on original LP2 word lengths.
 * Tests the authentic 2013 Crowley register, Hermetic Kybalion source, and
 * KJV Passion/Resurrection verses grouped within each Gospel.
 * Node 22/CommonJS; read-only; Windows-compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const load = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const runeSet = new Set(corpus.runes);
const sourceCrowley = JSON.parse(load('resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json'));
const compounds = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA', 'IO'];

/** @param {string} term @returns {number} */
function gpLength(term) {
  const normalized = term.toUpperCase()
    .replaceAll('QU', 'CW').replaceAll('V', 'U')
    .replaceAll('K', 'C').replaceAll('Z', 'S');
  let length = 0;
  for (let i = 0; i < normalized.length;) {
    const compound = compounds.find((item) => normalized.startsWith(item, i));
    i += compound ? compound.length : 1;
    length++;
  }
  return length;
}

/** @returns {number[]} */
function originalWordLengths() {
  const words = [];
  let length = 0;
  for (const ch of load('resources/liber-primus/lp2-transcription.txt')) {
    if (runeSet.has(ch)) length++;
    else if ("-.'".includes(ch) && length !== 0) {
      words.push(length);
      length = 0;
    }
  }
  const result = words.slice(0, 2896);
  assert.equal(result.length, 2896);
  assert.equal(result.reduce((a, b) => a + b, 0), 12956);
  assert.equal(corpus.pages.slice(0, 56).reduce((sum, page) => sum + page.indices.length, 0), 12956);
  return result;
}

/** @param {string} raw @returns {string} */
function stripGutenberg(raw) {
  const start = /(?:\*\*\*\s*)?START OF (?:THE )?PROJECT GUTENBERG[^\r\n]*\r?\n/i.exec(raw);
  const end = /(?:\*\*\*\s*)?END OF (?:THE )?PROJECT GUTENBERG/i.exec(raw);
  return raw.slice(start ? start.index + start[0].length : 0, end ? end.index : raw.length);
}

/**
 * Complete seven-word seed lookup and maximal bidirectional extension.
 * @param {number[]} original
 * @param {{name:string,lengths:number[]}[]} sections
 * @returns {{sourceWords:number,seeds:number,uniqueMatches:number,max:number,top:Array<{length:number,source:string,sourceWord:number,lpWord:number,shape:number[]}>}}
 */
function screen(original, sections) {
  const hits = new Map();
  let seeds = 0;
  for (const section of sections) {
    const src = section.lengths;
    const index = new Map();
    for (let s = 0; s + 7 <= src.length; s++) {
      const key = src.slice(s, s + 7).join(',');
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(s);
    }
    for (let t = 0; t + 7 <= original.length; t++) {
      const key = original.slice(t, t + 7).join(',');
      for (const sourceStart of index.get(key) || []) {
        seeds++;
        let i = sourceStart;
        let j = t;
        let len = 7;
        while (i + len < src.length && j + len < original.length && src[i + len] === original[j + len]) len++;
        while (i > 0 && j > 0 && src[i - 1] === original[j - 1]) {
          i--;
          j--;
          len++;
        }
        const hit = {length:len, source:section.name, sourceWord:i + 1,
          lpWord:j + 1, shape:original.slice(j, j + len)};
        hits.set(section.name + ':' + i + ':' + j, hit);
      }
    }
  }
  const ranked = [...hits.values()].sort((a, b) =>
    b.length - a.length || a.lpWord - b.lpWord || a.sourceWord - b.sourceWord);
  return {sourceWords:sections.reduce((total, x) => total + x.lengths.length, 0),
    seeds, uniqueMatches:ranked.length, max:ranked[0]?.length || 0, top:ranked.slice(0, 5)};
}

const original = originalWordLengths();
const crowley = sourceCrowley.chapters.map((chapter) => ({
  name:'chapter' + chapter.chapter, lengths:chapter.word_lengths
}));
const kybalion = [{
  name:'Gutenberg body',
  lengths:(stripGutenberg(load('resources/external/kybalion-gitenberg-14209.txt')).match(/[A-Za-z]+/g) || []).map(gpLength)
}];
const gospels = new Map();
for (const line of load('resources/external/kjv-passion-gospels-2014.txt').split(/\r?\n/)) {
  const parts = line.split('\t');
  if (parts.length !== 2) continue;
  const book = parts[0].split(' ')[0];
  if (!gospels.has(book)) gospels.set(book, []);
  gospels.get(book).push(...(parts[1].match(/[A-Za-z]+/g) || []).map(gpLength));
}
const cases = [
  {label:'2013 Book of the Law',sections:crowley,expected:8},
  {label:'The Kybalion',sections:kybalion,expected:8},
  {label:'KJV Passion Gospels',sections:[...gospels].map(([name, lengths]) => ({name,lengths})),expected:10}
];
for (const test of cases) {
  const result = screen(original, test.sections);
  assert.equal(result.max, test.expected);
  process.stdout.write(JSON.stringify({title:test.label, ...result}) + '\n');
}
// Source-native long-excerpt plant tests sensitivity to authentic contiguous text.
const planted = original.slice();
planted.splice(500, 20, ...crowley[1].lengths.slice(260, 280));
assert.ok(screen(planted, crowley).max >= 20);
process.stdout.write('source-native planted 20-word control: PASS\n');
