"use strict";
/** Original-source delimiter audit for the published 27x27 opening.
 * Node.js 22, CommonJS, single runnable test, read-only.
 * Usage: node sims/lp2_27x27_opening_wordboundaries_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** Match the canonical parser: page/line wraps do not end a word.
 * @returns {Array<{start:number,end:number,indices:number[]}>}
 */
function parseWords() {
  const text = source.split("%").slice(0, 55).join("%");
  const words = [];
  let pos = 0;
  let start = 0;
  let token = [];
  function flush(separator = "") {
    if (!token.length) return;
    words.push({start, end: pos - 1, indices: token, separator});
    token = [];
  }
  for (const ch of text) {
    if (index.has(ch)) {
      if (!token.length) start = pos;
      token.push(index.get(ch));
      pos++;
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      flush(ch);
    }
  }
  flush();
  assert.equal(pos, 12956);
  assert.equal(words.length, 2896);
  return words;
}
/** Euler totient for source-specified positive index. @param {number} n */
function phi(n) {
  let value=n, remainder=n;
  for(let f=2;f*f<=remainder;f++) if(remainder%f===0) {
    while(remainder%f===0) remainder/=f;
    value-=value/f;
  }
  if(remainder>1) value-=value/remainder;
  return value;
}
/** Squarefree sign for positive index. @param {number} n */
function mobius(n) {
  let remainder=n,sign=1;
  for(let f=2;f*f<=remainder;f++) if(remainder%f===0) {
    remainder/=f;sign=-sign;
    if(remainder%f===0) return 0;
  }
  return remainder>1 ? -sign : sign;
}

const words = parseWords();
const first = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(first.length, 729);
const pattern = [2, 1, 2, 2];
const matches = [];
for (let i = 0; i <= words.length - pattern.length; i++) {
  const four = words.slice(i, i + 4);
  if (four.every((w, j) => w.indices.length === pattern[j])) matches.push(four);
}
assert.equal(matches.length, 1);
const only = matches[0];
assert.deepEqual(only.map(w => w.separator), [".", "-", "-", "-"]);
assert.deepEqual(only.map(w => [w.start, w.end]),
  [[348, 349], [350, 350], [351, 352], [353, 354]]);

// Candidate source-only locator. The source's typeset line break and the
// inferred 27x27 row break are distinct clocks. The conjunction below was
// formulated retrospectively after block01 was published, so it tests a
// possible human-visible selector, not a preregistered decryption.
const openingThreePages = source.split("%").slice(0, 3).join("%");
const lineEnds = new Set();
let runesBefore = 0;
for (const ch of openingThreePages) {
  if (index.has(ch)) runesBefore++;
  else if (ch === "/") lineEnds.add(runesBefore - 1);
}
assert.equal(runesBefore, 729);
const firstThreeWords = words.filter(w => w.end < 729);
const gridAndPrintCandidates = [];
for (let j = 0; j < firstThreeWords.length - 2; j++) {
  const three = firstThreeWords.slice(j, j + 3);
  if (three[0].separator !== ".") continue;
  if ((three[1].end + 1) % 27 !== 0) continue;
  if (!lineEnds.has(three[2].end)) continue;
  gridAndPrintCandidates.push(three);
}
assert.equal(gridAndPrintCandidates.length, 1);
assert.deepEqual(gridAndPrintCandidates[0].map(w => [w.start, w.end]),
  [[348,349],[350,350],[351,352]]);
assert.equal(lineEnds.has(352), true);
const phaseControls = [];
for (let phase = 0; phase < 27; phase++) {
  let hits = 0;
  for (let j = 0; j < firstThreeWords.length - 2; j++) {
    const three = firstThreeWords.slice(j, j + 3);
    if (three[0].separator === "." &&
      (three[1].end + 1 + phase) % 27 === 0 &&
      lineEnds.has(three[2].end)) hits++;
  }
  if (hits) phaseControls.push({phase, hits});
}
assert.deepEqual(phaseControls, [{phase:0,hits:1},{phase:10,hits:1}]);

// Independently original-visible header and black-line counts.
assert.deepEqual(words.slice(0,2).map(w=>w.indices.length),[8,5]);
assert.equal(words[1].separator,".");
const redLen=words[0].indices.length+words[1].indices.length;
assert.equal(redLen,13);
const redPrimeSum=first.slice(0,redLen).reduce((s,k)=>s+corpus.prime[k],0);
assert.equal(redPrimeSum,662);
assert.equal(phi(redPrimeSum)%29,11);
// Optional mirror-name source selector: the authentic GP labels include AE/EA
// and EO/OE. Enumerate all *adjacent* 3-rune axes in the complete 27x27 grid.
// This label-reversal choice was recognized retrospectively.
const dirs=[[0,1,"horizontal"],[1,0,"vertical"],[1,1,"diagonal-se"],[1,-1,"diagonal-sw"]];
const mirrorNodes=[];
for(let row=0;row<27;row++)for(let col=0;col<27;col++)
 for(const [dy,dx,direction] of dirs) {
  if(row-dy<0||row+dy>26||col-dx<0||col+dx>26) continue;
  const sourcePositions=[(row-dy)*27+col-dx,row*27+col,(row+dy)*27+col+dx];
  const [left,middle,right]=sourcePositions.map(p=>first[p]);
  const lhs=corpus.translit[left],rhs=corpus.translit[right];
  if(lhs.length>1 && lhs===rhs.split("").reverse().join(""))
    mirrorNodes.push({row:row+1,col:col+1,direction,positions:sourcePositions,centerSymbol:middle});
 }
assert.equal(mirrorNodes.length,10);
const mirroredCenterCandidates=mirrorNodes.filter(n=>n.centerSymbol===phi(redPrimeSum)%29);
assert.equal(mirroredCenterCandidates.length,1);
assert.deepEqual(mirroredCenterCandidates[0].positions,[334,335,336]);
assert.equal(mirroredCenterCandidates[0].direction,"horizontal");

const center=(redLen-1)*27+(phi(redLen)-1);
assert.equal(center,335);
const originalNode=first.slice(center-1,center+2);
assert.deepEqual(originalNode,[25,11,28]); // AE J EA
const key=originalNode.slice();
key[1]=phi(key[1]);
assert.deepEqual(key,[25,10,28]); // AE I EA
const firstPhase=((key.reduce((s,k)=>s+mobius(phi(k)),0)%3)+3)%3;
assert.equal(firstPhase,0);
const firstPhysicalLine=source.split("%")[0].split("/")[0];
const blackCount=[...firstPhysicalLine].filter(ch=>index.has(ch)).length-redLen;
assert.equal(blackCount,7);
const firstStart=gridAndPrintCandidates[0][0].start;
const firstEnd=firstStart+blackCount;
assert.equal(firstStart,348);
assert.equal(firstEnd,355);
const plain=first.slice(firstStart,firstEnd).map((v,i)=>
  corpus.translit[(v-key[i%3]+29)%29]).join("");
assert.equal(plain,"ASIGOTHE");
const cipherWords=only.map(w=>
  w.indices.map(v=>corpus.translit[v]).join(""));
// Conditional source-only second step: carry three cells from final cipher
// glyph, totient-transform their center, rotate by Mobius sum; read from
// the exact square center for the length of the source's second red word.
// Each choice was identified after the external WEATHER path was published.
const originalSecondNode=first.slice(firstEnd-1,firstEnd+2);
assert.deepEqual(originalSecondNode,[14,22,14]); // X OE X
const secondKey=originalSecondNode.slice();
secondKey[1]=phi(secondKey[1]);
assert.deepEqual(secondKey,[14,10,14]);
const secondPhase=((secondKey.reduce((s,k)=>s+mobius(phi(k)),0)%3)+3)%3;
assert.equal(secondPhase,2);
const k2=secondKey.slice(secondPhase).concat(secondKey.slice(0,secondPhase));
assert.deepEqual(k2,[14,14,10]); // X X I
const secondStart=(first.length-1)/2;
assert.equal(secondStart,364);
const secondLength=words[1].indices.length;
assert.equal(secondLength,5);
const weather=first.slice(secondStart,secondStart+secondLength).map((v,i)=>
  corpus.translit[(v-k2[i%3]+29)%29]).join("");
assert.equal(weather,"WEATHER");
const sourceNext=words.find(w=>w.start===secondStart);
assert.ok(sourceNext);
assert.equal(sourceNext.end,369);
// Preserve the complete native six-rune printed word rather than silently
// dropping its last symbol to match the published five-rune WEATHER block.
const fullPrintedSecondWord=first.slice(sourceNext.start,sourceNext.end+1)
  .map((v,i)=>corpus.translit[(v-k2[i%3]+29)%29]).join("");
assert.equal(fullPrintedSecondWord,"WEATHERX");
// The published block03 starts at cell 369, within the source six-rune
// word that supplied WEATHER; the first alignment is not universal.
assert.equal(sourceNext.indices.length, 6);

// Additional *conditional* two-step geometry. These precise transformations
// were identified only after the external TURNS/COLD blocks had been published.
// They are not authentic author-specified rules and MUST NOT be extrapolated
// without a genuinely independent selector.
const flat = (row,col) => (row-1)*27+(col-1);
const secondSourceCenter=[14,5];
assert.equal(first[flat(...secondSourceCenter)],22); // OE
const thirdMirrorColumn=28-secondSourceCenter[1]; // D4 horizontal reflection
const thirdRadius=phi(first[flat(...secondSourceCenter)]); // phi(OE22)=10
assert.equal(thirdMirrorColumn,23);
assert.equal(thirdRadius,10);
const thirdSource=[flat(14-thirdRadius,thirdMirrorColumn),
  flat(14,thirdMirrorColumn),flat(14+thirdRadius,thirdMirrorColumn)];
assert.deepEqual(thirdSource,[103,373,643]);
const thirdKey=thirdSource.map(i=>first[i]); // H NG C without center totient
assert.deepEqual(thirdKey,[8,21,5]);
assert.equal((thirdKey.reduce((s,k)=>s+mobius(phi(k)),0)+30)%3,0);
const thirdCipherStart=secondStart+secondLength; // original cell369, next after WEATHER
assert.equal(thirdCipherStart,369);
const thirdPath=Array.from({length:secondLength},(_,i)=>thirdCipherStart-27*i);
assert.deepEqual(thirdPath,[369,342,315,288,261]);
const thirdPlain=thirdPath.map((where,i)=>
  corpus.translit[(first[where]-thirdKey[i%3]+29)%29]).join("");
assert.equal(thirdPlain,"TURNS");
const thirdCenterRune=thirdKey[1]; // NG21
const moveOuter=phi(thirdCenterRune),moveInner=phi(moveOuter);
assert.deepEqual([moveOuter,moveInner],[12,4]);
// Next source centre: move phi(NG) downward, phi(phi(NG)) leftward.
// Next reading start: from old ciphertext end, move those same amounts
// in interchanged axes, four rows down and twelve columns left.
const fourthCenter=[14+moveOuter,thirdMirrorColumn-moveInner];
assert.deepEqual(fourthCenter,[26,19]);
const fourthSource=[flat(fourthCenter[0]-1,fourthCenter[1]),
  flat(...fourthCenter),flat(fourthCenter[0]+1,fourthCenter[1])];
assert.deepEqual(fourthSource,[666,693,720]);
const fourthRawKey=fourthSource.map(i=>first[i]); // H TH H
assert.deepEqual(fourthRawKey,[8,2,8]);
const fourthDerived=fourthRawKey.slice();
fourthDerived[1]=phi(fourthDerived[1]); // H U H
const fourthPhase=((fourthDerived.reduce((s,k)=>s+mobius(phi(k)),0)%3)+3)%3;
assert.equal(fourthPhase,1);
const fourthKey=fourthDerived.slice(fourthPhase).concat(fourthDerived.slice(0,fourthPhase));
assert.deepEqual(fourthKey,[1,8,8]); // U H H
const priorEnd=thirdPath.at(-1),priorEndRow=Math.floor(priorEnd/27)+1,priorEndColumn=priorEnd%27+1;
const fourthStart=flat(priorEndRow+moveInner,priorEndColumn-moveOuter);
assert.equal(fourthStart,357);
const fourthPath=Array.from({length:moveInner},(_,i)=>fourthStart-27*i);
assert.deepEqual(fourthPath,[357,330,303,276]);
const fourthPlain=fourthPath.map((where,i)=>
  corpus.translit[(first[where]-fourthKey[i%3]+29)%29]).join("");
assert.equal(fourthPlain,"COLD");
// A literal repeated centre-shift rule fails immediately on published
// block05. This explicit negative forbids claiming a general decoder.
const fifthPredictedCenter=[fourthCenter[0]+phi(fourthRawKey[1]),
  fourthCenter[1]-phi(phi(fourthRawKey[1]))];
const fifthPublishedCenter=[15,8]; // source cells331,385,439, centre index385
assert.deepEqual(fifthPredictedCenter,[27,18]);
assert.notDeepEqual(fifthPredictedCenter,fifthPublishedCenter);

console.log(JSON.stringify({
  unsolvedWords: words.length,
  matchingPatternCount: matches.length,
  matchingPositions: only.map(w => [w.start, w.end]),
  sourceCipherWords: cipherWords,
  sourceLengthPattern: pattern,
  originalDelimiters: only.map(w => w.separator),
  gridAndPrintStart: gridAndPrintCandidates[0][0].start,
  sourceLineBoundaryAfterRune: 352,
  squareRowBoundaryAfterRune: 350,
  shiftedSquarePhaseHits: phaseControls,
  punctuationPreservedReading: "AS. I GO THE",
  headerPrimeSum: redPrimeSum,
  firstKeySourceCenter: center,
  GP29ReversedNameNodes: mirrorNodes.length,
  uniqueRedDerivedJMirrorNode: mirroredCenterCandidates[0],
  originalKeyNode: originalNode.map(i=>corpus.translit[i]),
  derivedFirstKey: key.map(i=>corpus.translit[i]),
  firstBlackLineLength: blackCount,
  derivedRuneOutput: plain,
  originalSecondKeyNode: originalSecondNode.map(i=>corpus.translit[i]),
  secondKeyPhase: secondPhase,
  derivedSecondKey: k2.map(i=>corpus.translit[i]),
  sourceSquareCenter: secondStart,
  interpretedSourceAlignedWords: ["AS", "I", "GO", "THE"],
  nextSourceWord: [sourceNext.start, sourceNext.end],
  nextProposedBlock: "WEATHER",
  fullPrintedSecondWord,
  conditionalThird:{source:thirdSource,center:[14,thirdMirrorColumn],radius:thirdRadius,reading:thirdPath,key:thirdKey.map(k=>corpus.translit[k]),plain:thirdPlain},
  conditionalFourth:{source:fourthSource,center:fourthCenter,offsets:[moveOuter,moveInner],reading:fourthPath,key:fourthKey.map(k=>corpus.translit[k]),plain:fourthPlain},
  fifthPredictedCenter,fifthPublishedCenter,
  nextProposedBlockPath: [364, 365, 366, 367, 368],
  followingProposedBlockStartsAt: 369,
}, null, 2));
console.log("PASS: unique original delimiter alignment, but no authenticated LP2 plaintext.");
