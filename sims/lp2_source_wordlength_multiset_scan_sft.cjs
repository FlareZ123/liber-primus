'use strict';

/**
 * Source-text plaintext fingerprint scan on the 2014 LP2 original printed words.
 *
 * Premise: if source prose survives as whole printed words, but the publisher
 * permuted their order within a page, a page's multiset of GP29 word lengths
 * remains unchanged. A source passage matching two or more adjacent pages
 * exactly would supply a concrete plaintext candidate to attack directly.
 *
 * Execute: node sims/lp2_source_wordlength_multiset_scan_sft.cjs
 * Node 22 / CommonJS / built-ins. Read-only and deterministic.
 * The 2014 original physical p50 is a rune-free table; the source transcription
 * therefore contains 55 unknown rune-bearing physical pages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const original = read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%');
const rune = /[\u16A0-\u16FF]/u;
/** @type {{page:number,length:number}[]} */
const originalWords = [];
let page = 0;
let startPage = 0;
let runes = 0;
let wordLength = 0;
function finishWord() {
  if (wordLength > 0) {
    originalWords.push({page:startPage, length:Math.min(wordLength, 17)});
    wordLength = 0;
  }
}
for (const ch of original) {
  if (rune.test(ch)) {
    if (wordLength === 0) startPage = page;
    wordLength++;
    runes++;
  } else if (ch === '%') {
    page++;
  } else if (ch === '/' || /\s/u.test(ch)) {
    // Printed line and physical page wraps may bisect a word.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(runes, 12956);
assert.equal(originalWords.length, 2896);
assert.equal(page, 54);
const pageWords = Array.from({length:55}, (_, p) =>
  originalWords.filter(w => w.page === p).map(w => w.length));
assert.equal(pageWords.flat().length, 2896);

const sources = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/latin-vulgate-latin26-wholewords.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/blake-marriage-1906-gutenberg45315.txt',
  'resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt',
  'resources/external/kybalion-gitenberg-14209.txt',
  'resources/external/kjv-passion-gospels-2014.txt',
  'resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt'
];
const compounds = new Set(['TH','NG','EO','OE','AE','IA','EA','IO']);
/** @param {string} w @returns {number} */
function gpLength(w) {
  let n = 0;
  for (let i = 0; i < w.length; i++) {
    if (w.slice(i, i + 3) === 'ING') {
      i += 2;
      n++;
      continue;
    }
    if (compounds.has(w.slice(i, i + 2))) i++;
    n++;
  }
  return Math.min(n, 17);
}
/**
 * All windows are checked with no choice of page, direction or key after
 * observing a candidate. Half-L1 distance is the minimum number of source
 * word lengths that must change to agree with an original window's multiset.
 *
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{minimum:number|null, offset:number, exactWindows:number, wordCount:number}}
 */
function scan(source, target) {
  const m = target.length;
  if (source.length < m) {
    return {minimum:null, offset:-1, exactWindows:0, wordCount:m};
  }
  const want = new Int16Array(18);
  const have = new Int16Array(18);
  for (const x of target) want[x]++;
  for (let i = 0; i < m; i++) have[source[i]]++;
  let distance = 0;
  for (let j = 0; j < 18; j++) distance += Math.abs(want[j] - have[j]);
  let best = Number.POSITIVE_INFINITY;
  let bestOffset = -1;
  let exactWindows = 0;
  for (let first = 0; first <= source.length - m; first++) {
    if (distance < best) {
      best = distance;
      bestOffset = first;
    }
    if (distance === 0) exactWindows++;
    if (first < source.length - m) {
      const outgoing = source[first];
      const incoming = source[first + m];
      if (outgoing !== incoming) {
        distance -= Math.abs(have[outgoing] - want[outgoing]);
        have[outgoing]--;
        distance += Math.abs(have[outgoing] - want[outgoing]);
        distance -= Math.abs(have[incoming] - want[incoming]);
        have[incoming]++;
        distance += Math.abs(have[incoming] - want[incoming]);
      }
    }
  }
  assert.equal(best % 2, 0);
  return {minimum:best / 2, offset:bestOffset, exactWindows, wordCount:m};
}
const gibran = read(sources[0]).toUpperCase().match(/[A-Z]+/g) || [];
assert.ok(gibran.length > 290);
for (const [name, map] of [['GP', gpLength], ['LATIN', w => Math.min(w.length,17)]]) {
  const native = gibran.map(map);
  const planted = native.slice(170, 290);
  assert.equal(planted.length, 120);
  const shuffled = [
    planted.slice(0, 40).sort((a,b) => b-a),
    planted.slice(40,80).sort((a,b) => a-b),
    planted.slice(80).sort((a,b) => b-a)
  ].flat();
  const control = scan(native, shuffled);
  assert.equal(control.minimum, 0, name + ': failed true-plaintext planted control');
  assert.ok(control.exactWindows >= 1);
  console.log('POSITIVE ' + name + ' 120-word three-piece order-permuted source: exact=' + control.exactWindows);
}
/** @type {{begin:number,span:number,physical:number[],words:number[]}[]} */
const windows = [];
for (let begin = 0; begin < pageWords.length; begin++) {
  for (let span = 1; span <= 3 && begin + span <= pageWords.length; span++) {
    const physical = Array.from({length:span},(_,i) => {
      const p = begin + i;
      return p >= 50 ? p + 1 : p;
    });
    windows.push({begin,span,physical,words:pageWords.slice(begin,begin+span).flat()});
  }
}
assert.equal(windows.length, 162);
let totalExactMultisource = 0;
const summaries = [];
for (const file of sources) {
  const latin = read(file).toUpperCase().match(/[A-Z]+/g) || [];
  assert.ok(latin.length >= 100);
  for (const [scheme, map] of [['GP', gpLength],['LATIN', w=>Math.min(w.length,17)]]) {
    const encoded = latin.map(map);
    const findings = windows.map(w => ({...scan(encoded,w.words),physical:w.physical,span:w.span,begin:w.begin}));
    const exact = findings.filter(x=>x.exactWindows>0);
    const exactLong = exact.filter(x=>x.span>=2);
    totalExactMultisource += exactLong.reduce((s,x)=>s+x.exactWindows,0);
    const best1 = findings.filter(x=>x.span===1).sort((a,b)=>a.minimum-b.minimum)[0];
    const best2 = findings.filter(x=>x.span===2).sort((a,b)=>a.minimum-b.minimum)[0];
    const best3 = findings.filter(x=>x.span===3).sort((a,b)=>a.minimum-b.minimum)[0];
    const summary = {
      file, scheme, sourceWords:encoded.length,
      onePageExact:exact.filter(x=>x.span===1).reduce((s,x)=>s+x.exactWindows,0),
      twoPageExact:exact.filter(x=>x.span===2).reduce((s,x)=>s+x.exactWindows,0),
      threePageExact:exact.filter(x=>x.span===3).reduce((s,x)=>s+x.exactWindows,0),
      best1, best2, best3
    };
    summaries.push(summary);
    console.log('SOURCE ' + JSON.stringify(summary));
    if (exactLong.length) {
      console.log('PLAINTEXT_CANDIDATE ' + JSON.stringify({file,scheme,exactLong}));
    }
  }
}
console.log('SUMMARY ' + JSON.stringify({
  originalRunes:runes, originalWords:originalWords.length, physicalPages:55,
  printedPageWindows:windows.length, sourceFiles:sources.length,
  sourceEncodingConventions:2, noMultiPageExact:totalExactMultisource===0,
  totalMultiPageExact:totalExactMultisource
}));
if (totalExactMultisource > 0) {
  console.log('ACTION: independently authenticate matching passage and exact plaintext offsets; no cipher claim from histogram alone');
}
