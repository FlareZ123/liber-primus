'use strict';

/**
 * Source-selected 2014 GEB direct copied-passage/known-plaintext attack.
 * Compare all original LP2 2,896 printed GP29 word lengths against the
 * complete historically selected Gödel, Escher, Bach OCR in both fixed
 * Cicada spellings. Windows Node.js 22, read-only, no copyright redistribution.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const orig = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const source = transcript.replace(/\/\r?\n/g, '').replace(/[\r\n%&$]/g, '');
const words = [];
let total = 0;
for (const token of source.split(/[-.]+/)) {
  if (total === orig.length) break;
  const runes = [...token].filter(g => alphabet.has(g)).map(g => alphabet.get(g));
  if (runes.length) { words.push(runes); total += runes.length; }
}
assert.equal(total, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), orig);
const target = words.map(w => w.length);
const GP = new Map(corpus.translit.map((v, i) => [v, i]));
const digraphs = new Set(['TH','NG','EO','OE','AE','IA','EA']);

/** @param {string} text @returns {Promise<string>} */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('GEB pinned source HTTP ' + response.statusCode));
        return;
      }
      let text = '';
      response.setEncoding('utf8');
      response.on('data', part => { text += part; });
      response.on('end', () => resolve(text));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {string} word @param {boolean} splitNg @returns {number} */
function runicLength(word, splitNg) {
  const w = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
  let n = 0;
  for (let i = 0; i < w.length;) {
    const t = w.slice(i, i+2);
    if (digraphs.has(t) && (t !== 'NG' || !splitNg)) {
      i += 2;
    } else {
      assert.ok(GP.has(w[i]));
      i++;
    }
    n++;
  }
  return n;
}

/**
 * A length-L exact seed match is extended to its full maximal exact
 * contiguous run. This computes the true global longest run if the
 * strongest match has length at least seedWidth.
 * @param {number[]} target
 * @param {number[]} donor
 * @param {number} seedWidth
 * @returns {{atOriginal:number,atDonor:number,length:number}[]}
 */
function matches(target, donor, seedWidth) {
  const index = new Map();
  for (let i = 0; i + seedWidth <= target.length; i++) {
    const k = target.slice(i, i + seedWidth).join(',');
    const list = index.get(k) ?? [];
    list.push(i);
    index.set(k, list);
  }
  let longest = 0;
  const best = [];
  for (let j = 0; j + seedWidth <= donor.length; j++) {
    const k = donor.slice(j, j + seedWidth).join(',');
    for (const i of index.get(k) ?? []) {
      let first = i, last = j;
      while (first > 0 && last > 0 && target[first-1] === donor[last-1]) {
        first--; last--;
      }
      let n = seedWidth + i - first;
      while (first + n < target.length && last + n < donor.length
        && target[first+n] === donor[last+n]) n++;
      if (n > longest) { longest = n; best.length = 0; best.push({atOriginal:first,atDonor:last,length:n}); }
      else if (n === longest && !best.some(x=>x.atOriginal===first&&x.atDonor===last)) {
        best.push({atOriginal:first,atDonor:last,length:n});
      }
    }
  }
  return best;
}

async function main() {
  const url = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt';
  const book = await fetchText(url);
  assert.equal(book.length, 1951562);
  assert.equal(book.indexOf('TORTOISE: Your argument is persuasive'), 87816);
  const englishWords = book.match(/[A-Za-z]+/g);
  assert.ok(englishWords && englishWords.length > target.length);
  for (const splitNg of [false,true]) {
    const donor = englishWords.map(w => runicLength(w,splitNg));
    const best = matches(target, donor, 8);
    const widest = best[0]?.length ?? 0;
    // A real published-page source copied verbatim would preserve at least
    // 16 consecutive word lengths, even under a secret length-preserving key.
    const planted = target.slice();
    planted.splice(1000, 16, ...donor.slice(29000, 29016));
    const plantedBest = matches(planted, donor, 8);
    assert.ok(plantedBest.some(m => m.atOriginal === 1000 && m.atDonor === 29000 && m.length >= 16));
    console.log(JSON.stringify({ donor:'2014 historically selected GEB', sourceWords:donor.length,
      originalWords:target.length, originalRunes:orig.length, splitNg, longestMatches:best.slice(0,12),
      totalLongestTies:best.length, longestLength:widest, copied16WordPositive: true,
      confirmedCopiedOriginalPassage: widest >= 16 }));
  }
  console.log('PASS: original source 2014 GEB complete word-length copied-passage search, both tokenizations, 16-word planted source positive.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
