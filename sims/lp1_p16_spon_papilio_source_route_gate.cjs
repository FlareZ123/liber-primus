#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const annotations = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const stage11Html = fs.readFileSync('resources/external/cicada2014-stage11-onion7-original-index.html', 'utf8');
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
const p48 = corpus.pages.find(p => p.page === 48);
const p49 = corpus.pages.find(p => p.page === 49);
const p51 = corpus.pages.find(p => p.page === 51);
const p52 = corpus.pages.find(p => p.page === 52);
const preTable = [...p48.indices.slice(-72), ...p49.indices];
const postTable = [...p51.indices, ...p52.indices.slice(0,78)];
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
function relativeWalk(start, values) {
  let cell = start;
  const seen = new Map();
  const path = [];
  while (!seen.has(cell)) {
    seen.set(cell, path.length);
    path.push(cell);
    const b = values[cell];
    const row = cell >> 3;
    const col = cell & 7;
    cell = ((((row + (b >> 3)) & 31) << 3) | ((col + (b & 7)) & 7));
  }
  return { path, transient: seen.get(cell), cycle: path.length-seen.get(cell), repeatCell: cell };
}
function decodeWithWalk(seq, walk, values, sign, start=0) {
  const {path, transient, cycle} = walk;
  return seq.map((c,i) => {
    const n = start + i;
    const at = n < path.length ? n : transient + ((n-transient) % cycle);
    return translit[mod(c + sign * (values[path[at]] % 29), 29)];
  }).join('');
}
function keypadWalk(start, values) {
  const dirs = {1:[1,-1],2:[1,0],3:[1,1],4:[0,-1],5:[0,0],6:[0,1],7:[-1,-1],8:[-1,0],9:[-1,1]};
  let cell = start;
  const seen = new Map();
  const path = [];
  while (cell >= 0 && cell < 256 && !seen.has(cell)) {
    seen.set(cell, path.length);
    const b = values[cell];
    const q = Math.floor(b / 29);
    const r = b % 29;
    const dir = q + 1;
    path.push({cell:cell+1,byte:b,q,r,dir});
    const [dr,dc] = dirs[dir];
    const nr = (cell >> 3) + dr;
    const nc = (cell & 7) + dc;
    if (nr < 0 || nr >= 32 || nc < 0 || nc >= 8) {
      return {path,boundary:true,cycleStart:null,cycleLength:0,repeatCell:null};
    }
    cell = nr * 8 + nc;
  }
  return {path,boundary:false,cycleStart:seen.get(cell),cycleLength:path.length-seen.get(cell),repeatCell:cell+1};
}
function directPointerWalk(start, values) {
  let cell = start;
  const seen = new Map();
  const path = [];
  while (!seen.has(cell)) {
    seen.set(cell, path.length);
    const b = values[cell];
    path.push({cell:cell+1,byte:b,key:b%29,rune:translit[b%29]});
    cell = b;
  }
  return {path,cycleStart:seen.get(cell),cycleLength:path.length-seen.get(cell),repeatCell:cell+1};
}
function decodeWithPointer(seq, walk, sign, start=0) {
  const {path,cycleStart,cycleLength} = walk;
  return seq.map((c,i) => {
    const n = start + i;
    const at = n < path.length ? n : cycleStart + ((n-cycleStart) % cycleLength);
    return translit[mod(c + sign * path[at].key, 29)];
  }).join('');
}

const wordData = latinWords.map((word) => {
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
function columnarRead(order) {
  const out = [];
  const maxHeight = Math.max(...blocks.map(b => b.length));
  for (let row=0; row<maxHeight; row++) {
    for (const col of order) if (row < blocks[col].length) out.push(blocks[col][row]);
  }
  return out;
}
const asc = wordData.map((_,i) => i).sort((a,b) => wordData[a].primeSum - wordData[b].primeSum);
const desc = [...asc].reverse();
const values = grid.byte_rows.flat();
const row7 = grid.byte_rows[6];
const fiveCells = row7.slice(3,8);
const b64 = Buffer.from(fiveCells).toString('base64').replace(/=/g,'').replace(/\+/g,'~').replace(/\//g,'-');
const stage11Numbers = [...stage11Html.matchAll(/(?:src|href)=["'][^"']*?(\d{1,2})\.jpg["']/gi)].map(m => Number(m[1]));
const stage11Unique = [...new Set(stage11Numbers)].sort((a,b) => a-b);
const sourceStartCell = 6*8+3; // one-based printed row 7, column 4
const sourceWalk = relativeWalk(sourceStartCell, values);
const sourceKeypadWalk = keypadWalk(sourceStartCell, values);
const sourcePointerWalk = directPointerWalk(sourceStartCell, values);
const primeList = primesUpToCount(100);
const prime59Index = primeList.indexOf(59);
const fiftyNinthPrimeIndex = 58;
const p53First = p53Red[0];

const result = {
  source: 'Jacob Spon, Miscellanea eruditae antiquitatis (1685), Art. III, p.7, Table IV',
  numbering: {
    naivePageTableConcatenation: 74,
    originalStage11ImageCount: stage11Unique.length,
    originalStage11Min: stage11Unique[0],
    originalStage11Max: stage11Unique.at(-1),
    nativeStage11Image74Exists: stage11Unique.includes(74),
    nativeStage11Image75Exists: stage11Unique.includes(75)
  },
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
      ascendingReverseEach: render(blockRead(asc, true)),
      columnarWordOrder: render(columnarRead(wordData.map((_,i) => i))),
      columnarReverseWordOrder: render(columnarRead([...wordData.map((_,i) => i)].reverse())),
      columnarPrimeSumAscending: render(columnarRead(asc)),
      columnarPrimeSumDescending: render(columnarRead(desc))
    }
  },
  p50Coordinate: {
    printedRow: 7,
    printedColumn: 4,
    flatCellZeroBased: sourceStartCell,
    byteAtStart: values[sourceStartCell],
    row7Bytes: row7,
    row7Columns4to8: fiveCells,
    modifiedBase64: b64,
    chkExtraSecondByteValid: [2,3].includes(fiveCells[1]),
    firstCellEqualsTPrime: fiveCells[0] === 59,
    relativeWalk: {
      transient: sourceWalk.transient,
      cycle: sourceWalk.cycle,
      distinctCells: sourceWalk.path.length,
      firstCells: sourceWalk.path.slice(0,20),
      p53RedMinus: decodeWithWalk(p53Red,sourceWalk,values,-1),
      p53RedPlus: decodeWithWalk(p53Red,sourceWalk,values,1),
      preTableMinus: decodeWithWalk(preTable,sourceWalk,values,-1),
      postTableMinusContinuous: decodeWithWalk(postTable,sourceWalk,values,-1,preTable.length)
    },
    keypadWalk: {
      path: sourceKeypadWalk.path,
      boundary: sourceKeypadWalk.boundary,
      cycleStart: sourceKeypadWalk.cycleStart,
      cycleLength: sourceKeypadWalk.cycleLength,
      repeatCell: sourceKeypadWalk.repeatCell,
      emittedRunes: sourceKeypadWalk.path.map(x => translit[x.r]).join('')
    },
    directPointerWalk: {
      path: sourcePointerWalk.path,
      transient: sourcePointerWalk.cycleStart,
      cycle: sourcePointerWalk.cycleLength,
      repeatCell: sourcePointerWalk.repeatCell,
      key: sourcePointerWalk.path.map(x => x.key),
      p53RedMinus: decodeWithPointer(p53Red,sourcePointerWalk,-1),
      p53RedPlus: decodeWithPointer(p53Red,sourcePointerWalk,1),
      p55Minus: decodeWithPointer(p55.indices,sourcePointerWalk,-1),
      preTableMinus: decodeWithPointer(preTable,sourcePointerWalk,-1),
      postTableMinusContinuous: decodeWithPointer(postTable,sourcePointerWalk,-1,preTable.length)
    }
  },
  p53: {
    redSpanStart: redSpan.start,
    redSpanLength: redSpan.length,
    firstFiveRunes: render(p53Red.slice(0,5)),
    firstRunePrimeWeight: gpPrimes[p53First],
    startsWithTPrime59: p53First === 16 && gpPrimes[p53First] === 59,
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
if (latinLetters.length !== 72 || p55.indices.length !== 76 || p55Core.length !== 72 || p53Red.length !== 51 || stage11Unique.length !== 58 || stage11Unique[0] !== 0 || stage11Unique.at(-1) !== 57) {
  throw new Error('Source-count gate failed; inspect canonical corpus, annotation, or Stage11 index versions.');
}
console.log(JSON.stringify(result, null, 2));
