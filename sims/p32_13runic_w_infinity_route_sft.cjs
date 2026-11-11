#!/usr/bin/env node
"use strict";

// Source-asserting test of a provisional p32 word-address / 13-rune W / M7
// infinity route. It is navigation evidence, not an LP2 decryption.
// Run from the repository root:
//   node sims/p32_13runic_w_infinity_route_sft.cjs

const fs = require("node:fs");
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const read = p => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const mod = (n, m = 29) => ((n % m) + m) % m;
const inverse = n => {
  for (let x = 1; x < 29; x++) if (mod(n * x) === 1) return x;
  throw new Error("No inverse mod 29");
};
function phi(n) {
  let out = n;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) {
    while (n % p === 0) n /= p;
    out -= out / p;
  }
  if (n > 1) out -= out / n;
  return out;
}
function sumWord(word) {
  return [...word.runes].reduce((sum, rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1);
    return sum + corpus.prime[index];
  }, 0);
}
const tokens = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);
function sumLatin(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  let total = 0;
  for (let i = 0; i < source.length;) {
    const hit = tokens.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error("No GP token in " + word);
    total += corpus.prime[hit.index];
    i += hit.token.length;
  }
  return total;
}
const address = sum => ({ page: sum % 58, wordIndex: Math.floor(sum / 58) });
const parsed = parseLP2Words(transcription, 57);
assert.equal(parsed.runeCount, 13136);
assert.equal(parsed.words.length, 2941);
let global = 0;
const words = parsed.words.map(word => {
  const out = { ...word, globalStart: global };
  global += word.length;
  return out;
});
assert.equal(global, parsed.runeCount);
const physicalToRunePage = page => page >= 51 ? page - 1 : page;
const pageWords = physical => {
  const p = physicalToRunePage(physical);
  return words.filter(word => word.startPage <= p && word.endPage >= p);
};
const p32 = pageWords(32), p36 = pageWords(36), p55 = pageWords(55), p57 = pageWords(57);
assert.deepEqual([p32.length, p36.length, p55.length, p57.length], [22, 50, 17, 20]);

const bewareSum = sumLatin("Beware");
assert.equal(bewareSum, 322);
assert.deepEqual(address(bewareSum), { page: 32, wordIndex: 5 });
const startWord = p32[5];
assert.equal([...startWord.runes].map(r => corpus.translit[corpus.runes.indexOf(r)]).join(""), "IARTTHF");
assert.equal(sumWord(startWord), 184);
assert.equal(sumWord(p57[1]), 184);
const unknownOnly = parseLP2Words(transcription, 55);
const sum184UnknownWordCount = unknownOnly.words.filter(word => sumWord(word) === 184).length;
assert.equal(sum184UnknownWordCount, 10);
const p32Start = corpus.pages.filter(p => p.page < 32).reduce((n, p) => n + p.runic_count, 0);
assert.equal(p32Start, 7839);
const startOffset = startWord.globalStart - p32Start;
assert.equal(startOffset, 25);
assert.equal([...transcription.split("%")[32].split("/")[0]]
  .filter(r => corpus.runes.includes(r)).length, 25);

const p32Ink = ink.pages.find(p => p.page === 32);
assert.deepEqual(p32Ink.large_punctuation, [[121, 13, "red"]]);
const p32Indices = corpus.pages.find(p => p.page === 32).indices;
assert.equal(p32Indices.length, 121);
const window13 = p32Indices.slice(startOffset, startOffset + 13);
const windowSum = window13.reduce((n, i) => n + corpus.prime[i], 0);
assert.equal(window13.length, 13);
assert.equal(windowSum, 413);
assert.equal(windowSum % 29, 7);
const homeX = p32Indices.slice(33, 38).map(index => corpus.translit[index]).join("");
const windowTail = p32Indices.slice(startOffset + 8, startOffset + 13)
  .map(index => corpus.translit[index]).join("");
assert.equal(homeX, "HOMEX");
assert.equal(startOffset + 12, 37);
assert.equal(windowTail, "HOMEX");

const eligibleStarts = p32.map((word, index) => ({
  index, offset: word.globalStart - p32Start
})).filter(row => row.offset >= 0 && row.offset + 13 <= 121);
assert.equal(eligibleStarts.length, 19);
const wordStartHits = eligibleStarts.filter(row =>
  p32Indices.slice(row.offset, row.offset + 13)
    .reduce((n, i) => n + corpus.prime[i], 0) % 29 === 7);
assert.deepEqual(wordStartHits, [{ index: 5, offset: 25 }]);
const allOffsetHits = Array.from({ length: 109 }, (_, i) => i).filter(offset =>
  p32Indices.slice(offset, offset + 13)
    .reduce((n, i) => n + corpus.prime[i], 0) % 29 === 7);
assert.deepEqual(allOffsetHits, [11, 25, 49, 92]);

// Reconstruct the horizontal-corner, single-count central-ring M7 candidate.
const grid = p32Indices.map(i => corpus.prime[i]);
const at = (r, c) => grid[r * 11 + c];
const N = [0,1,2,3,4].reduce((s,c) => s + at(3,c+3), 0);
const E = [1,2,3].reduce((s,r) => s + at(r+3,7), 0);
const S = [0,1,2,3,4].reduce((s,c) => s + at(7,c+3), 0);
const W = [1,2,3].reduce((s,r) => s + at(r+3,3), 0);
assert.deepEqual([N,E,S,W], [275,257,373,231]);
assert.equal(N+E+S+W, 1136);
const M = [[mod(N),mod(E)],[mod(S),mod(W)]];
assert.deepEqual(M, [[14,25],[25,28]]);
const f = x => {
  const den = mod(25*x+28);
  return den === 0 ? null : mod((14*x+25)*inverse(den));
};
const fInv = x => {
  if (x === null) return inverse(25);
  const den = mod(25*x+15);
  return den === 0 ? null : mod((x+25)*inverse(den));
};
const fixed = Array.from({length:29},(_,x)=>x).filter(x=>f(x)===x);
assert.deepEqual(fixed, [22,25]);
assert.equal(corpus.prime[22]+corpus.prime[25], 184);
assert.equal(mod(M[0][0]+M[1][1]), 13);
assert.equal(mod(M[0][0]*M[1][1]-M[0][1]*M[1][0]), 28);
assert.deepEqual(Array.from({length:29},(_,x)=>x).filter(x=>mod(25*x+28)===0), [7]);
assert.equal(f(7), null);
const forward = [10]; let state = 10;
for (let i=0; i<4 && state!==null; i++) { state=f(state); forward.push(state); }
assert.deepEqual(forward, [10,8,2,7,null]);
const reverse = [10]; state=10;
for (let i=0; i<4 && state!==7; i++) { state=fInv(state); reverse.push(state); }
assert.deepEqual(reverse, [10,16,11,null,7]);

const stats = p32.map((word,index)=>({
  index, sum:sumWord(word), residue:sumWord(word)%29,
  offset:word.globalStart-p32Start,
  word:[...word.runes].map(r=>corpus.translit[corpus.runes.indexOf(r)]).join("")
}));
const counts = {};
for (const row of stats) counts[row.residue]=(counts[row.residue]||0)+1;
const at10=stats.filter(x=>x.residue===10), at7=stats.filter(x=>x.residue===7);
assert.equal(at10.length,1);
assert.equal(at7.length,1);
assert.deepEqual([at10[0].index,at10[0].offset,at10[0].word],[5,25,"IARTTHF"]);
assert.deepEqual([at7[0].index,at7[0].offset,at7[0].word,at7[0].sum],[11,64,"WBSRXIAXA",442]);
assert.equal(at7[0].offset-at10[0].offset,39);
assert.equal(39,3*13);
assert.equal(counts[8]||0,0);
assert.equal(counts[2]||0,0);
assert.equal(counts[16]||0,0);
assert.equal(counts[11],2);

// Independent 2013 Wisdom-square direction controls.
const p55Triple=p55.slice(9,12).map(sumWord);
const p36Triple=p36.slice(6,9).map(sumWord);
assert.deepEqual(p55Triple,[138,108,341]);
assert.deepEqual(p36Triple,[320,386,130]);
assert.equal(phi(108),36);
assert.equal(phi(108)%29,7);
assert.equal(corpus.translit[7],"W");
assert.equal(phi(386),192);
assert.equal(phi(386)%29,18);
assert.equal(corpus.translit[18],"E");

const endAddress=address(at7[0].sum);
assert.deepEqual(endAddress,{page:36,wordIndex:7});
assert.equal(sumWord(p36[7]),386);
assert(signed2016.includes("The path lies empty;"));
const grid256 = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const emptyPages = corpus.pages.filter(page => page.runic_count === 0).map(page => page.page);
assert.deepEqual(emptyPages, [50]);
const liesSum = sumLatin("lies");
assert.equal(liesSum, 224);
const liesAddress = address(liesSum);
assert.deepEqual(liesAddress, { page: 50, wordIndex: 3 });
const p50Cell3 = grid256.pages.find(page => page.page === 50).tokens[3];
assert.equal(p50Cell3, "3D");
const base60_3D = 3 * 60 + 13;
assert.equal(base60_3D, 193);
assert.equal(2 * base60_3D, 386);
assert.equal(phi(193), 192);
assert.equal(phi(386), 192);
assert.equal(mod(phi(193)), 18);
assert.equal(mod(phi(386)), 18);
const p32Foth=p32Indices.slice(startOffset+5,startOffset+8);
const p32Home=p32Indices.slice(startOffset+8,startOffset+13);
const p32Suffix8=p32Indices.slice(startOffset+5,startOffset+13);
const p32FothSum=p32Foth.reduce((z,i)=>z+corpus.prime[i],0);
const p32HomeSum=p32Home.reduce((z,i)=>z+corpus.prime[i],0);
const p32Suffix8Sum=p32Suffix8.reduce((z,i)=>z+corpus.prime[i],0);
const p32Suffix8Text=p32Suffix8.map(i=>corpus.translit[i]).join("");
assert.equal(p32Foth.map(i=>corpus.translit[i]).join(""),"FOTH");
assert.equal(p32FothSum,14);
assert.equal(p32Home.map(i=>corpus.translit[i]).join(""),"HOMEX");
assert.equal(p32HomeSum,215);
assert.equal(p32Suffix8Text,"FOTHHOMEX");
assert.equal(p32Suffix8Sum,229);
assert.equal(p32Suffix8Sum,base60_3D+phi(108));
assert.equal(windowSum,sumWord(startWord)+p32Suffix8Sum);
assert.equal(windowSum,184+193+36);
const p32Suffix229Hits=eligibleStarts.filter(row=>{
 const word=p32[row.index];
 const suffix=p32Indices.slice(row.offset+word.length,row.offset+13);
 return suffix.reduce((z,i)=>z+corpus.prime[i],0)===229;
});
assert.deepEqual(p32Suffix229Hits,[{index:5,offset:25}]);
function primeOrdinal(n){let count=0;for(let v=2;v<=n;v++){let prime=true;for(let d=2;d*d<=v;d++)if(v%d===0){prime=false;break;}if(prime)count++;}return count;}
assert.equal(primeOrdinal(229),50);


console.log(JSON.stringify({
  status:"provisional navigation hypothesis; not a decryption",
  beware:{sum:bewareSum,address:address(bewareSum)},
  p32:{wordCount:p32.length,word5:"IARTTHF",word5Sum:184,word5Offset:25,
    p57LikeSum:sumWord(p57[1]),m7FixedPointPrimeSum:184,sum184OccurrencesAmongUnknownWords:sum184UnknownWordCount,
    redDotCount:13,homeXMarker:{start:33,end:37,text:homeX,windowEndsAt:startOffset+12,windowTail},window13:{sum:windowSum,residue:7,eligibleWordStarts:19,
      matchingWordStarts:wordStartHits,allOffsetMatches:allOffsetHits},
    M7:{matrix:M,fixedPoints:fixed,pole:7,forward,inverse:reverse,literalWordTraversal:false,negativeGate:"sims/p32_m7_pole_wordmap_gate.cjs"},
    residueCounts:counts,
    endpoint:{word:"WBSRXIAXA",sum:442,offset:64,gap:39,address:endAddress,p36Word7Sum:386}},
  independentDirections:{p55Triple,phi108:36,directionW:"W",p36Triple,phi386:192,directionE:"E"},
  emptyPageBridge:{m7Pole:7,emptyPages,liesSum,liesAddress,p50Cell3,base60_3D,twice193:386,phi193:192,p36Word7Sum:386,phi386:192},
  p32Checksum:{selectedWord:"IARTTHF",selectedWordSum:184,suffix8:p32Suffix8Text,suffix8Sum:p32Suffix8Sum,p50Base60:base60_3D,p55Phi108:phi(108),window13Sum:windowSum,identity:"413=184+193+36",suffixPrimeOrdinal:primeOrdinal(229),uniqueSuffix229WordStarts:p32Suffix229Hits},
  conclusion:"Selector/pole correspondence only; the existing M7 gate rejects a total word-to-word traversal. No plaintext, key, or reversible cipher operation recovered."
},null,2));
