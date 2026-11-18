#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const annotations = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const translit = corpus.translit;
const gpIndex = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11,
  L:20, M:19, N:9, O:3, P:13, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26
};
const gpPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const latinWords = ['HAEREDIBVS','MEIS','MANDO','ETIAM','CINERE','VT','MEO','VOLITET','EBRIVS','PAPILIO','OSSA','IPSA','TEGANT','MEA'];
const latinLetters = latinWords.join('');
const p55 = corpus.pages.find(p => p.page === 55);
const p53 = corpus.pages.find(p => p.page === 53);
const p53Ann = annotations.pages.find(p => p.page === 53);
const redSpan = p53Ann.red_spans[0];
const p53Red = p53.indices.slice(redSpan.start, redSpan.start + redSpan.length);
const fPositions55 = p55.indices.map((v,i) => v === 0 ? i : -1).filter(i => i >= 0);
const skip55 = new Set([0, ...fPositions55]);
const p55Core = p55.indices.filter((_,i) => !skip55.has(i));

function mod(n, m) { return ((n % m) + m) % m; }
function render(indices) { return indices.map(i => translit[i]).join(''); }
function keyFor(mode) {
  return [...latinLetters].map((ch,i) => {
    if (mode === 'phonetic' && ch === 'V' && i === 35) return gpIndex.W;
    return gpIndex[ch];
  });
}
function vigenere(sign, key) {
  return p55Core.map((c,i) => mod(c + sign * key[i], 29));
}
function primesUpToCount(count) {
  const out = [];
  for (let n=2; out.length<count; n++) {
    let prime = true;
    for (let d=2; d*d<=n; d++) if (n%d===0) { prime=false; break; }
    if (prime) out.push(n);
  }
  return out;
}
function phiPrimeDecode(startPrimeIndex, sign, skipF) {
  const primes = primesUpToCount(startPrimeIndex + p53Red.length + 10);
  let k = startPrimeIndex;
  const out = [];
  let invalidAt = null;
  for (let i=0; i<p53Red.length; i++) {
    const c = p53Red[i];
    if (c === 0 && skipF) { out.push(0); continue; }
    const p = mod(c + sign * (primes[k] - 1), 29);
    if (p === 0 && c !== 0) { invalidAt = i; break; }
    out.push(p);
    k++;
  }
  return { invalidAt, consumed: k-startPrimeIndex, text: render(out) };
}

const wordData = latinWords.map((word,i) => {
  const vals = [...word].map((ch,j) => ch === 'V' && word === 'VOLITET' && j === 0 ? gpIndex.W : gpIndex[ch]);
  return { word, length: word.length, primeSum: vals.reduce((s,v) => s + gpPrimes[v], 0) };
});
let offset = 0;
const blocks = wordData.map(w => {
  const block = p55Core.slice(offset, offset+w.length);
  offset += w.length;
  return block;
});
function blockRead(order, reverseEach=false) {
  return order.flatMap(i => reverseEach ? [...blocks[i]].reverse() : blocks[i]);
}
const asc = wordData.map((_,i) => i).sort((a,b) => wordData[a].primeSum - wordData[b].primeSum);
const desc = [...asc].reverse();
const row7 = grid.byte_rows[6];
const fiveCells = row7.slice(3,8);
const b64 = Buffer.from(fiveCells).toString('base64').replace(/=/g,'').replace(/\+/g,'~').replace(/\//g,'-');
const p53First = p53Red[0];
const p53FirstPrime = gpPrimes[p53First];
const primes = primesUpToCount(100);
const prime59Index = primes.indexOf(59);
const fiftyNinthPrimeIndex = 58;

const result = {
  source: 'Jacob Spon, Miscellanea eruditae antiquitatis (1685), Art. III, p.7, Table IV',
  page_table_address_hypothesis: { page:7, table:4, concatenated_archive_index:74, next_table_archive_index:75 },
  p55: {
    runeCount: p55.indices.length,
    firstRuneIndex: p55.indices[0],
    fPositionsZeroBased: fPositions55,
    filteredCoreLength: p55Core.length,
    latinEpitaphLetters: latinLetters.length,
    vigenere: {
      vu_minus: render(vigenere(-1, keyFor('vu'))),
      vu_plus: render(vigenere(1, keyFor('vu'))),
      phonetic_minus: render(vigenere(-1, keyFor('phonetic'))),
      phonetic_plus: render(vigenere(1, keyFor('phonetic')))
    },
    blockTransposition: {
      wordLengths: wordData.map(w => w.length),
      wordPrimeSums: wordData.map(w => w.primeSum),
      ascending: render(blockRead(asc)),
      descending: render(blockRead(desc)),
      ascendingReverseEach: render(blockRead(asc, true))
    }
  },
  p50_coordinate: {
    row7Bytes: row7,
    row7Columns4to8: fiveCells,
    modifiedBase64: b64,
    chkExtraSecondByteValid: [2,3].includes(fiveCells[1]),
    firstCellEqualsTPrime: fiveCells[0] === 59
  },
  p53: {
    redSpanStart: redSpan.start,
    redSpanLength: redSpan.length,
    firstFiveRunes: render(p53Red.slice(0,5)),
    firstRunePrimeWeight: p53FirstPrime,
    startsWithTPrime59: p53First === 16 && p53FirstPrime === 59,
    fPositionsInRedSpan: p53Red.map((v,i) => v === 0 ? i : -1).filter(i => i >= 0),
    phiPrimeStart59: {
      minus_skipF: phiPrimeDecode(prime59Index,-1,true),
      plus_skipF: phiPrimeDecode(prime59Index,1,true),
      minus_consumeF: phiPrimeDecode(prime59Index,-1,false),
      plus_consumeF: phiPrimeDecode(prime59Index,1,false)
    },
    phiPrimeStart59thPrime277: {
      minus_skipF: phiPrimeDecode(fiftyNinthPrimeIndex,-1,true),
      plus_skipF: phiPrimeDecode(fiftyNinthPrimeIndex,1,true)
    }
  }
};
if (latinLetters.length !== 72 || p55.indices.length !== 76 || p55Core.length !== 72 || p53Red.length !== 51) {
  throw new Error('Source-count gate failed; inspect the canonical corpus/annotation versions.');
}
console.log(JSON.stringify(result, null, 2));
