#!/usr/bin/env node
"use strict";

// Reproduce the provisional 2016-message -> LP2 base-58 word-address hypothesis.
// Run from the repository root:
//   node sims/lp2_2016_message_base58_word_map.cjs
//
// This is an experiment, not an established decryption. It uses the canonical
// corpus transliteration and the original 58 LP2 page slots (including p50).

const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");

assert.equal(corpus.pages.length, 58, "LP2 corpus should retain original pages 0..57");

const masterScans = master.split("%").map((page) =>
  [...page.matchAll(/[ᚠ-᛿]+/gu)].map((m) => m[0])
);
assert.equal(masterScans.length, 75, "canonical master transcription scan count changed");

// A physical linebreak can split one printed word. The canonical master rune
// scanner counts each line fragment separately, shifting later word addresses.
// Rejoin explicitly marked line wraps and use printed word delimiters instead.
const printedSource = read("resources/lp2-transcription.txt").split("%");
assert.equal(printedSource.length, 57); // p50's table has no rune text.
/** @param {string} page */
function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const lp2Pages = Array.from({length: 58}, (_, p) =>
  p === 50 ? [] : printedWords(printedSource[p > 50 ? p - 1 : p]));
assert.equal(lp2Pages.length, 58);
assert.equal(lp2Pages.reduce((n, page) => n + page.length, 0), 2973);
const fragmentedPages = masterScans.slice(16, 74);
assert.equal(fragmentedPages.reduce((n, page) => n + page.length, 0), 3367);


const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error(`No GP token at ${word}:${source.slice(i)}`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

function decodeRunes(word) {
  return [...word].map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1, `Unknown rune ${rune}`);
    return corpus.translit[index];
  }).join("");
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const messageWords = [
  "Its", "words", "are", "the", "map", "their", "meaning", "is",
  "the", "road", "and", "their", "numbers", "are", "the", "direction"
];

const rows = messageWords.map((word, sourceIndex) => {
  const gpIndices = encodeWord(word);
  const primeSum = gpIndices.reduce((sum, index) => sum + corpus.prime[index], 0);
  const page = primeSum % 58;
  const wordIndex = Math.floor(primeSum / 58);
  const selected = lp2Pages[page]?.[wordIndex] ?? null;
  return {
    sourceIndex,
    sourceWord: word,
    gp: gpIndices.map((index) => corpus.translit[index]).join(""),
    runeCount: gpIndices.length,
    primeSum,
    page,
    wordIndex,
    selected,
    selectedGp: selected ? decodeRunes(selected) : null
  };
});

assert.equal(rows.length, 16);
assert(rows.every((row) => row.selected !== null), "all 16 page/word addresses must be in bounds");
assert.deepEqual(rows.map((row) => row.primeSum), [
  143, 179, 175, 72, 211, 114, 319, 84,
  72, 204, 215, 114, 295, 175, 72, 337
]);
assert.deepEqual(rows.map(({ page, wordIndex }) => [page, wordIndex]), [
  [27, 2], [5, 3], [1, 3], [14, 1], [37, 3], [56, 1], [29, 5], [26, 1],
  [14, 1], [30, 3], [41, 3], [56, 1], [5, 5], [1, 3], [14, 1], [47, 5]
]);

// The repeated message word "the" maps to the unique complete FOLD token
// in the 56 unsolved LP2 pages.
const fold = encodeWord("FOLD").map((index) => corpus.runes[index]).join("");
const foldHits = [];
for (let page = 0; page < 56; page++) {
  lp2Pages[page].forEach((word, wordIndex) => {
    if (word === fold) foldHits.push({ page, wordIndex });
  });
}
assert.deepEqual(foldHits, [{ page: 14, wordIndex: 1 }]);
assert.equal(rows[3].selected, fold);
assert.equal(rows[8].selected, fold);
assert.equal(rows[14].selected, fold);

// The repeated message word "their" maps to p56 word 1. Verify that this
// ciphertext word is END under the established p56 totient-prime rule.
const p56Word = lp2Pages[56][1];
assert.equal(p56Word, "ᛟᛋᚱ");
const p56Start = lp2Pages[56].slice(0, 1).reduce((n, word) => n + [...word].length, 0);
assert.equal(p56Start, 2);
const primeStream = firstPrimes(p56Start + [...p56Word].length);
const p56PlainIndices = [...p56Word].map((rune, i) => {
  const cipherIndex = corpus.runes.indexOf(rune);
  const phi = primeStream[p56Start + i] - 1;
  return mod(cipherIndex - phi, 29);
});
assert.deepEqual(p56PlainIndices, encodeWord("END"));
assert.equal(rows[5].selected, p56Word);
assert.equal(rows[11].selected, p56Word);

// Frozen base-58 addressing applied to all authentic 2016 signed-message words.
const signedPayload = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedMessage = signedPayload.slice(
  signedPayload.indexOf("Hello."),
  signedPayload.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedAllWords = signedMessage.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedAllWords.length, 43); // excludes A,F inside the PGP hex fingerprint

/** @param {string} word @param {number} index */
function mapMessageWord(word, index) {
  const sum = encodeWord(word).reduce((n, glyph) => n + corpus.prime[glyph], 0);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  return {word, index, sum, page, wordIndex,
    runeWord: lp2Pages[page]?.[wordIndex] ?? null};
}
const fullMap = signedAllWords.map(mapMessageWord);
const exceptions = fullMap.filter(row => row.runeWord === null);
// All signed-message word indices are tiny compared with every rune-bearing
// page's printed-word count. Therefore 42/43 valid addresses are automatic,
// except when a word points to the deliberately rune-free numerical page 50.
const minRunePageWords = Math.min(...lp2Pages.filter((_, p) => p !== 50).map(p => p.length));
const maxMessageWordIndex = Math.max(...fullMap.map(r => r.wordIndex));
assert.equal(minRunePageWords, 17);
assert.equal(maxMessageWordIndex, 7);
assert(fullMap.every(r => r.page === 50 || r.wordIndex < lp2Pages[r.page].length));
// Finite 58-shift null: preserve each actual word's prime sum and duplicate
// structure, but shift the base-58 page phase. Test both quotient and residue.
const shiftedMissingCounts = Array.from({length: 58}, (_, shift) =>
  fullMap.filter(r => {
    const sum = r.sum + shift;
    return !lp2Pages[sum % 58][Math.floor(sum / 58)];
  }).length);
const shiftedMissingHistogram = Object.fromEntries(
  [...new Set(shiftedMissingCounts)].sort((a, b) => a - b)
    .map(count => [count, shiftedMissingCounts.filter(x => x === count).length]));
assert.deepEqual(shiftedMissingHistogram, {0: 30, 1: 19, 2: 7, 3: 1, 7: 1});
assert.equal(shiftedMissingCounts[0], 1);
assert.deepEqual(exceptions.map(({word, sum, page, wordIndex}) =>
  [word, sum, page, wordIndex]), [["lies", 224, 50, 3]]);
assert.equal(lp2Pages[50].length, 0);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const page50Table = grid.pages.find(p => p.page === 50);
assert(page50Table && page50Table.tokens.length === 104);
assert.deepEqual([page50Table.tokens[3], page50Table.bytes[3]], ["3D", 193]);
const locate = word => fullMap.filter(row => row.word.toLowerCase() === word);
assert(locate("the").every(row => row.page === 14 && row.wordIndex === 1));
assert(locate("their").every(row => row.page === 56 && row.wordIndex === 1));
assert.deepEqual(locate("found").map(row => [row.page, row.wordIndex]), [[14, 2]]);
assert.deepEqual(locate("beware").map(row => [row.page, row.wordIndex]), [[32, 5]]);

// Literal index-preserving book walk, independently fixed by the same 58-page
// prime-sum pointer rule: FOLD -> the last unsolved page -> solved END.
function nextWord(page, index) {
  const word = lp2Pages[page]?.[index];
  assert(word);
  const sum = [...word].reduce((n, rune) =>
    n + corpus.prime[corpus.runes.indexOf(rune)], 0);
  return {sum, page: sum % 58, index: Math.floor(sum / 58)};
}
const firstHop = nextWord(14, 1);
const secondHop = nextWord(firstHop.page, firstHop.index);
assert.deepEqual(firstHop, {sum: 171, page: 55, index: 2});
assert.equal(decodeRunes(lp2Pages[55][2]), "SB");
assert.deepEqual(secondHop, {sum: 114, page: 56, index: 1});
assert.equal(decodeRunes(lp2Pages[56][1]), "OESR");


// Recursion has no source-defined stopping rule. Measure its actual behavior
// from every authenticated signed-message origin, retaining duplicate words.
function walkToRepeatOrMissing(page, index) {
  const visited = new Set();
  let passedSolvedEnd = false;
  while (lp2Pages[page]?.[index]) {
    const key = page + ":" + index;
    if (visited.has(key)) return {kind: "cycle", passedSolvedEnd};
    visited.add(key);
    if (page === 56 && index === 1) passedSolvedEnd = true;
    const next = nextWord(page, index);
    page = next.page;
    index = next.index;
  }
  return {kind: "missing", page, index, passedSolvedEnd};
}
const walks = fullMap.map(row => walkToRepeatOrMissing(row.page, row.wordIndex));
const missing = walks.filter(row => row.kind === "missing");
const cycles = walks.filter(row => row.kind === "cycle");
const visitsEnd = walks.filter(row => row.passedSolvedEnd);
assert.deepEqual([missing.length, cycles.length, visitsEnd.length], [15, 28, 9]);
assert(missing.every(row => row.page === 50));
// Cross-check the 2016 clue phrase against the p32 11x11 GP-prime square.
const p32Page = corpus.pages.find((page) => page.page === 32);
assert(p32Page);
const p32 = p32Page.indices.map((index) => corpus.prime[index]);
assert.equal(p32.length, 121);
const p32TopRow = p32.slice(0, 11).reduce((a, b) => a + b, 0);
const p32LeftColumn = p32.filter((_, index) => index % 11 === 0).reduce((a, b) => a + b, 0);
const firstFourWordSum = rows.slice(0, 4).reduce((sum, row) => sum + row.primeSum, 0);
assert.deepEqual([p32TopRow, p32LeftColumn, firstFourWordSum], [563, 569, 569]);


const first201 = firstPrimes(201);
assert.equal(first201[19], 71);
assert.equal(first201[200], 1229);
const skipped2013 = first201.slice(20,200);
assert.equal(skipped2013.length, 180);
assert.equal(skipped2013[23], 193);
assert.equal(first201.indexOf(193)+1, 44);
assert.equal(3301%29,24);
assert.equal(3*59+13,190);
const selectorGlobalIndex = grid.pages.filter(p=>p.page<50).reduce((n,p)=>n+p.bytes.length,0)+3;
assert.equal(selectorGlobalIndex,83);
assert.equal(grid.bytes.length,256);
const hits = value => grid.bytes.flatMap((byte,i)=>byte===value?[i]:[]);
assert.deepEqual(hits(193),[83,127]);
assert.deepEqual(hits(201),[82,128]);
assert.equal(127-83,first201.indexOf(193)+1);
assert.equal(first201[22],83);
assert.equal(first201[30],127);
assert.equal(224-193,31);
// Source-input-only two-route fixed point: both proposed destinations are equal,
// and the 256 possible byte inputs have exactly one feasible solution.
const all224Primes=firstPrimes(224);
const twoRouteCandidates=[];
for(let byte=0;byte<=223;byte++){
 const primeOrdinal=all224Primes.filter(p=>p<=byte).length;
 const residualRank=224-byte;
 const destByStep=selectorGlobalIndex+primeOrdinal;
 const destByResidual=all224Primes[residualRank-1];
 if(destByStep===destByResidual&&destByStep<grid.bytes.length){
  twoRouteCandidates.push({byte,destination:destByStep,residualRank});
 }
}
assert.deepEqual(twoRouteCandidates,[{byte:193,destination:127,residualRank:31}]);
assert.equal(page50Table.bytes[47],193);
const signedInterior = grid.bytes.slice(84,127);
assert.equal(signedInterior.length,signedAllWords.length);
assert.equal(signedInterior.length,43);
const reverseDigramMatches=[];
for(let i=0;i<grid.bytes.length-1;i++){
 for(let k=i+2;k<grid.bytes.length-1;k++){
  if(grid.bytes[i]===grid.bytes[k+1]&&grid.bytes[i+1]===grid.bytes[k])reverseDigramMatches.push([i,k]);
 }
}
assert.deepEqual(reverseDigramMatches,[[82,127]]);
const sourceWordBytes=fullMap.map(r=>r.sum&255);
const decodedSignedBytes=signedInterior.map((b,i)=>b^sourceWordBytes[i]);
const asciiPrintable=decodedSignedBytes.filter(n=>n>=32&&n<=126).length;
assert.equal(asciiPrintable,16);
const clearControl=Array.from(Buffer.from("SOURCE INDEX HELDOUT PLAINTEXT ASSERTION OK","ascii"));
assert.equal(clearControl.length,43);
const encryptedControl=clearControl.map((b,i)=>b^sourceWordBytes[i]);
assert.deepEqual(encryptedControl.map((b,i)=>b^sourceWordBytes[i]),clearControl);

const signedLiesWalk=[selectorGlobalIndex];
for (let t=0;t<messageWords.length;t++) signedLiesWalk.push(grid.bytes[signedLiesWalk[t]]);
assert.deepEqual(signedLiesWalk,[83,193,155,112,73,79,82,201,74,205,76,114,197,115,247,192,0]);
assert.equal(messageWords.length,16);
const zeroCycle=[];const visitedZero=new Set();let node=0;
while(!visitedZero.has(node)){zeroCycle.push(node);visitedZero.add(node);node=grid.bytes[node];}
assert.deepEqual(zeroCycle,[0,203,68,199,47,76,114,197,115,247,192]);
assert.equal(node,0);
function stepsToZero(start){
 let i=start;const visited=new Set();
 for(let t=0;t<256;t++){if(i===0)return t;if(visited.has(i))return -1;visited.add(i);i=grid.bytes[i];}
 return -1;
}
const sixteenStarts=grid.bytes.flatMap((_,i)=>stepsToZero(i)===16?[i]:[]);
assert.deepEqual(sixteenStarts,[63,65,83,127,179,181,209,217,222,231,244]);
const threeAnchorStarts=sixteenStarts.filter(start=>{
 let p=start;const route=[p];
 for(let t=0;t<16;t++){p=grid.bytes[p];route.push(p);}
 return [112,114,115].every(x=>route.includes(x));
});
assert.deepEqual(threeAnchorStarts,[83,127]);
assert.equal(signedLiesWalk.includes(113),false);
const finalPageAddresses=[112,113,114,115].map(value=>{
 const page=value%58,wordIndex=Math.floor(value/58);
 return {value,page,wordIndex,gp:decodeRunes(lp2Pages[page][wordIndex])};
});
assert.deepEqual(finalPageAddresses.map(x=>[x.page,x.wordIndex]),[[54,1],[55,1],[56,1],[57,1]]);
assert.equal(finalPageAddresses[2].gp,"OESR");
assert.equal(finalPageAddresses[3].gp,"LICE");
assert.deepEqual(locate("you").map(x=>[x.sum,x.page,x.wordIndex]),[[113,55,1]]);



console.log(JSON.stringify({
  status: "provisional source-constrained book-map hypothesis; not a decryption",
  modulus: 58,
  indexing: "page = primeSum mod 58; zero-based wordIndex = floor(primeSum / 58)",
  messageRuneCount: rows.reduce((sum, row) => sum + row.runeCount, 0),
  messagePrimeSum: rows.reduce((sum, row) => sum + row.primeSum, 0),
  firstFourWordSum,
  p32TopRow,
  p32LeftColumn,
  foldHits,
  signedPrime193: {
    signedWords:signedAllWords.length,selector:193,primeOrdinal:44,omittedOrdinal:24,
    bytePositions:hits(193),bracketPositions:hits(201),
    twoRouteCandidates,
    selectedPointerRoute: {signedLiesWalk,zeroCycle,sixteenStarts,
      threeAnchorStarts,finalPageAddresses},
    interiorBytes:signedInterior.length,printableXor:asciiPrintable,
    xorHex:Buffer.from(decodedSignedBytes).toString("hex")
  },
  p56Word1Cipher: p56Word,
  p56Word1Plain: "END",
  rows,
  fullMessage: {words: signedAllWords.length, runeWordAddresses: fullMap.length - exceptions.length,
    exception: {word: "lies", sum: 224, page: 50, index: 3,
      tableToken: page50Table.tokens[3], tableByte: page50Table.bytes[3]},
    unfittedAddresses: {found: [14, 2], beware: [32, 5]},
    pointerRoute: {fold: [14, 1], lastUnsolved: [55, 2], solvedEnd: [56, 1]},
    addressBaseRate: {minRunePageWords,maxMessageWordIndex,
      shiftedMissingHistogram,exactlyOneMissingShifts: 19,shiftCount: 58},
    printedWordCount: 2973, lineFragmentCount: 3367,
    completePointerWalk: {missingOnPage50: missing.length,
      convergeToCycles: cycles.length, visitSolvedEND: visitsEnd.length}}
}, null, 2));
