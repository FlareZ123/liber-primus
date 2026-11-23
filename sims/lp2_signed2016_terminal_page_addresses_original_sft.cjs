"use strict";

/**
 * An original-source-only navigation decision for signed 2016 THE followers.
 * It compares one prospective zero-based whole-word GP-index-sum page grammar
 * with the 2014 physical terminal-page inventory and a fixed seeded
 * alphabet-relabeling control. This reports a conditional screen, NOT a
 * discovery-adjusted significance test or an original LP2 decipherment.
 *
 * Windows Node.js 22, read-only CommonJS, no third-party modules.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = (s) => fs.readFileSync(path.join(ROOT, s), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens = table.pages.flatMap((p) => p.tokens);
const names = corpus.translit
  .map((name, i) => ({name:name.toLowerCase(), i}))
  .sort((a,b) => b.name.length - a.name.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  let rest = word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  const arr = [];
  while (rest) {
    const entry = names.find((v) => rest.startsWith(v.name));
    assert(entry !== undefined, "unrecognized GP word segment: " + rest);
    arr.push(entry.i);
    rest = rest.slice(entry.name.length);
  }
  return arr;
}
const clean = source.slice(source.indexOf("Hello."),source.indexOf("-----BEGIN PGP SIGNATURE-----"))
 .replace(/\b7A35090F\b/g,"");
const words = clean.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
assert(words !== null);
assert.equal(words.length,43);
const theAt = words.map((w,i) => w.toUpperCase()==="THE"?i+1:null).filter((v) => v!==null);
assert.deepEqual(theAt,[2,8,13,18,23,29]);
const followers = theAt.map((p) => words[p].toUpperCase());
assert.deepEqual(followers,["PATH","DEVOTED","WAY","MAP","ROAD","DIRECTION"]);
const spell = followers.map(gp);
const sums = spell.map((w) => w.reduce((sum,v) => sum+v,0));
assert.deepEqual(sums,[39,102,57,56,54,98]);
assert.deepEqual(spell.slice(2,5),[[7,24,26],[19,24,13],[4,3,24,23]]);
assert.equal(corpus.pages.length,58);
assert.deepEqual([54,55,56,57].map((p) => corpus.pages[p].indices.length),[232,76,85,95]);
assert.equal(tokens[57],"1w"); // Literal one west on an 8-column grid is page/address 56.
assert.equal(57%8,1);
assert.equal(56%8,0);
const addressed = sums.map((v,i) => ({word:followers[i],gp0:v,
  inBook:v>=0&&v<58,pageRuneCount:v>=0&&v<58?corpus.pages[v].indices.length:null}));
assert.deepEqual(addressed.filter((v)=>v.inBook).map((v)=>[v.word,v.gp0]),
 [["PATH",39],["WAY",57],["MAP",56],["ROAD",54]]);
// PATH also has an in-book page address, and must be charged as a competing
// address. The selected terminal triple is therefore 3 of 4 valid addresses.

/** Mulberry32 seeded permutation stream. @param {number} seed */
function randomFactory(seed) {
  let x = seed>>>0;
  return () => {
    x = (x + 0x6D2B79F5)>>>0;
    let t = x;
    t = Math.imul(t^(t>>>15),t|1);
    t ^= t + Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
const seed = 0x4ea7f137;
const random = randomFactory(seed);
const runs=1000000;
let selectedExact=0, allTriplesExact=0, allTriplesDescendingTerminal=0, allTriplesTerminal=0;
for(let sample=0;sample<runs;sample++){
  const pi = Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
    const k=Math.floor(random()*(j+1));
    [pi[j],pi[k]]=[pi[k],pi[j]];
  }
  const totals=spell.map((item)=>item.reduce((sum,v)=>sum+pi[v],0));
  if(totals[2]===57&&totals[3]===56&&totals[4]===54)selectedExact++;
  let hitExact=false,hitDescending=false,hitTerminal=false;
  for(let i=0;i+2<totals.length;i++){
    const q=totals.slice(i,i+3);
    if(q[0]===57&&q[1]===56&&q[2]===54)hitExact=true;
    if(q.every(v=>v>=54&&v<=57)){
      hitTerminal=true;
      if(q[0]>q[1]&&q[1]>q[2])hitDescending=true;
    }
  }
  if(hitExact)allTriplesExact++;
  if(hitDescending)allTriplesDescendingTerminal++;
  if(hitTerminal)allTriplesTerminal++;
}
assert.deepEqual([selectedExact,allTriplesExact,allTriplesDescendingTerminal,allTriplesTerminal],
 [8,17,67,915]);

// A distinct, broader discriminator: apply precisely the same GP0→physical
// page proposal to ALL 43 signed words, counting invalid addresses and the
// clustered terminal addresses. This avoids hiding the other source words.
const wholeWordIndices = words.map(gp);
const wholeSums = wholeWordIndices.map((item) => item.reduce((a,b) => a+b,0));
const wholeInBook = wholeSums.filter((v) => v>=0&&v<58).length;
const sourceTerminal = wholeSums.map((v,i) => ({word:words[i].toUpperCase(),page:v}))
 .filter(({page}) => page===54||page===56||page===57);
assert.equal(wholeInBook,28);
assert.deepEqual(sourceTerminal.map((v)=>v.page),[57,56,54,56,56,56,57,54]);
assert.equal(wholeSums.filter((v)=>v===55).length,0);

const broadSeed=0x37f90bca, broadRandom=randomFactory(broadSeed), broadRuns=250000;
let terminalAtLeast8=0, terminalAtLeast8AndNo55=0, anyValidTotal=0;
for(let sample=0; sample<broadRuns; sample++){
  const pi=Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
    const k=Math.floor(broadRandom()*(j+1));
    [pi[j],pi[k]]=[pi[k],pi[j]];
  }
  let terminal=0, at55=0;
  for(const word of wholeWordIndices){
    let sum=0;
    for(const index of word)sum+=pi[index];
    if(sum===54||sum===56||sum===57)terminal++;
    if(sum===55)at55++;
    if(sum>=0&&sum<58)anyValidTotal++;
  }
  if(terminal>=8){
    terminalAtLeast8++;
    if(at55===0)terminalAtLeast8AndNo55++;
  }
}
assert.equal(terminalAtLeast8,372);
assert.equal(terminalAtLeast8AndNo55,260);
assert.equal(anyValidTotal/broadRuns,24.032748);


// Follow the individually named signed word PATH through its source GP0 page
// address, and read that page's actual first *printed* GP word. The missing
// p50 rune-free table shifts the text-transcription index after p49.
const originalTextPages = read("resources/lp2-transcription.txt").split("%");
const realRuneAlphabet = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")).runes;
const runeMap = new Map(realRuneAlphabet.map((rune,i)=>[rune,corpus.translit[i]]));
const firstPageWords=[];
for(let number=0;number<58;number++){
  if(number===50)continue;
  const textNumber = number<=49?number:number-1;
  const first=originalTextPages[textNumber].match(/[\u16a0-\u16ff]+/u);
  assert(first!==null);
  firstPageWords.push({page:number,word:Array.from(first[0]).map((x)=>runeMap.get(x)).join("")});
}
assert.equal(firstPageWords.length,57);
const compass=new Set(["N","E","S","W","NE","NW","SE","SW"]);
const compassFirstWords=firstPageWords.filter((item)=>compass.has(item.word));
assert.deepEqual(compassFirstWords,[{page:39,word:"SW"}]);
assert.equal(followers[0],"PATH");
assert.equal(sums[0],39);
assert.equal(firstPageWords.find((item)=>item.page===39).word,"SW");
// A source-compatible diagonal map route exists, but no original source
// commands using the *first word of a page* as a p50-table movement opcode.
const start39={row:Math.floor(39/8),col:39%8};
const southwest={row:start39.row+1,col:start39.col-1};
assert.deepEqual(southwest,{row:5,col:6});
const southwestCell=southwest.row*8+southwest.col;
assert.equal(southwestCell,46);
assert.equal(gp("ARE").reduce((a,b)=>a+b,0),46);
// Full source-fixed radix60 continuation test after SW and address46.
// Both the historically used prime-value convention and the p33 1033/3301
// sexagesimal stamp are source-visible rivals, so we print the B59 alternative.
const numeralAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
assert.equal(tokens[46],"3J");
const tableValues = tokens.map((token) =>
 numeralAlphabet.indexOf(token[0])*60 + numeralAlphabet.indexOf(token[1]));
assert.equal(tableValues[46],199);
const primeNumbers=[];
for(let n=2;primeNumbers.length<256;n++){
  let prime=true;
  for(let factor=2;factor*factor<=n;factor++)if(n%factor===0){prime=false;break;}
  if(prime)primeNumbers.push(n);
}
assert.equal(primeNumbers[45],199); // unique index46 one-based prime-rank fixed point
const oneBasedPrimeFixedPoints=tableValues
 .map((value,index)=> ({index,value}))
 .filter(({index,value})=>index>0&&value===primeNumbers[index-1]);
assert.deepEqual(oneBasedPrimeFixedPoints,[{index:46,value:199}]);

const p39Indices=corpus.pages[39].indices;
assert.equal(p39Indices.length,240);
const originalR39=(k)=>corpus.translit[p39Indices[k]];
const candidateMoves=[
 {cell:39,firstPageWord:"SW",target:46,token:tokens[46],byte:tableValues[46],next:originalR39(199)},
 {cell:46,firstPageWord:"N",target:38,token:tokens[38],byte:tableValues[38],next:originalR39(133)},
 {cell:38,firstPageWord:"W",target:37,token:tokens[37],byte:tableValues[37],next:originalR39(80)}
];
assert.deepEqual(candidateMoves,[
 {cell:39,firstPageWord:"SW",target:46,token:"3J",byte:199,next:"N"},
 {cell:46,firstPageWord:"N",target:38,token:"2D",byte:133,next:"W"},
 {cell:38,firstPageWord:"W",target:37,token:"1K",byte:80,next:"M"}
]);
// In the alternative B59 no-f alphabet, the first dereference is
// cell46=196→p39 glyph W, then cell45=105→p39 glyph H (halts earlier).
const digits59=numeralAlphabet.replace("f","");
const v59=(token)=>digits59.indexOf(token[0])*59+digits59.indexOf(token[1]);
assert.equal(v59(tokens[46]),196);
assert.equal(originalR39(196),"W");
assert.equal(v59(tokens[45]),105);
assert.equal(originalR39(105),"H");

// Stronger, source-typed movement: the STARTING grid token at PATH's exact
// source address 39 is the LITERAL 05, furnishing the five SW steps. The
// destination is fixed before any p57 clause is opened.
assert.equal(tokens[39],"05");
assert.equal(tableValues[39],5);
const routeFive=[];
const initialRow=Math.floor(39/8), initialColumn=39%8;
for(let step=1;step<=tableValues[39];step++){
  const row=initialRow+step, col=initialColumn-step;
  assert(row>=0&&row<32&&col>=0&&col<8);
  routeFive.push({step,row,col,cell:row*8+col});
}
assert.deepEqual(routeFive.map(x=>x.cell),[46,53,60,67,74]);
const endpoint=routeFive[routeFive.length-1].cell;
assert.equal(endpoint,74);
assert.equal(tokens[74],"3P");
// Independent second 2016-signed source route. Both successive grid
// commands are literal printed magnitude + compass; no ASCII/hex mode switch.
assert.equal(tokens[57],"1w");
assert.equal(tokens[56],"4E");
const wayCell=57,wayToMap=57-1,mapToCrossing=56+4;
assert.equal(wayToMap,56);
assert.equal(mapToCrossing,60);
assert.deepEqual(routeFive[2],{step:3,row:7,col:4,cell:60});
assert.equal(tableValues[60],106);
assert.equal(tokens[60],"1k");
// This exact intersection is observed source geometry, not unknown plaintext.
const wayMapIntersection={
  start:"GP0(WAY)=57",
  first: {from:57,command:tokens[57],to:56},
  second:{from:56,command:tokens[56],to:60},
  crossing:{cell:60,path39SouthwestStep:3},
  nextOriginalToken:tokens[60]
};

assert.equal(tableValues[74],205);
assert.equal(primeNumbers[204],1259);
// A second, distinct source-compatible *target-type* interpretation of
// the same selected rank205: take 205 as a table ADDRESS, whose literal
// base60 value is76, exactly the full original p55 rune count. Source p55
// is the UNIQUE 76-rune physical manuscript page. Under base59 the same
// token is75, requiring an unsourced loss of one glyph.
assert.equal(tokens[205],"1G");
assert.equal(tableValues[205],76);
assert.deepEqual(corpus.pages.filter((page)=>page.indices.length===76).map((p)=>p.page),[55]);
assert.equal(59+numeralAlphabet.indexOf("G"),75);

const p57Source=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))
 .sections.find((section)=>section.name==="p57_parable").source_text;
const p57AfterTitle=p57Source.split("⁜")[1];
const p57Clauses=p57AfterTitle.split("⁘")
 .filter((part)=>Array.from(part).some((rune)=>runeMap.has(rune)));
const runeNums=new Map(realRuneAlphabet.map((rune,i)=>[rune,i]));
const p57PrimeSums=p57Clauses.map((clause)=>Array.from(clause)
 .filter((rune)=>runeNums.has(rune))
 .reduce((sum,rune)=>sum+primeNumbers[runeNums.get(rune)],0));
assert.deepEqual(p57PrimeSums,[1259,1031,1229]);
const p57PrimeRanks=p57PrimeSums.map((sum)=>primeNumbers.indexOf(sum)+1);
assert.deepEqual(p57PrimeRanks,[205,173,201]);
assert.equal(tableValues[endpoint],p57PrimeRanks[0]);
assert.equal(p57PrimeSums.reduce((product,n)=>product*n,1),1595277641);
// Prospective exact returning loop from the genuine FIRST p57 sentence,
// which literally says "LIKE THE INSTAR TUNNELING TO THE SURFACE".
// A straight vertical rise in the original 32x8 table from end cell74,
// row9/col2, reaches the visible SURFACE row0 at the same column, cell2.
const endRow=Math.floor(endpoint/8),endColumn=endpoint%8;
assert.deepEqual([endRow,endColumn],[9,2]);
const upperSurfaceCell=endColumn;
assert.equal(upperSurfaceCell,2);
assert.equal(tokens[upperSurfaceCell],"2l");
assert.equal(tableValues[upperSurfaceCell],167);
assert.equal(primeNumbers[38],167);
assert.equal(primeNumbers.indexOf(tableValues[upperSurfaceCell])+1,39);
assert.equal(gp("PATH").reduce((total,x)=>total+x,0),39);
const surfaceClosedLoop={
  sourceFirstSentence:"LIKE THE INSTAR TUNNELING TO THE SURFACE",
  fromOriginalCell:74,straightUpNineRowsToCell:2,
  originalSurfaceToken:tokens[2],base60SurfaceByte:tableValues[2],
  oneBasedOrdinaryPrimeRank:primeNumbers.indexOf(tableValues[2])+1,
  returnsToSignedWord:"PATH",returnsToOriginalAddress:39,
  alternateOtherCellWithSameByte:tableValues.map((v,i)=>v===167?i:null).filter((v)=>v!==null),
  caveat:"The p57 metaphor is not an explicit authenticated straight-up-grid instruction."
};
assert.deepEqual(surfaceClosedLoop.alternateOtherCellWithSameByte,[2,182]);
assert.equal(tokens.filter((v)=>v==="05").length,1);
assert.equal(tokens.filter((v)=>v==="3P").length,1);
assert.deepEqual(tableValues.map((value,i)=>value===205?i:null).filter(x=>x!==null),[74]);
// One finite direct complete-original cipher inverse for #2243: the FIVE
// source-selected intermediate p50 grid bytes are GP29 shift keys for the
// five genuine numbered passages. Test both signs with sectionwise fixed
// shifts, and the standard historically available continuous 5-key stream.
// No free seeds or phase tuning. Any other opcode needs first-party syntax.
const fiveKey=routeFive.map(({cell})=>tableValues[cell]%29);
assert.deepEqual(fiveKey,[25,26,19,18,2]);
const numberedPages=originalTextPages.slice(36,39).join("\n");
const itemRaw=numberedPages.slice(numberedPages.indexOf("1-"),numberedPages.indexOf("&",numberedPages.indexOf("5-")));
const numberedUnits=itemRaw.split(/[1-5]-/).slice(1).map((part)=>
  Array.from(part).filter((rune)=>runeNums.has(rune)).map((rune)=>runeNums.get(rune)));
assert.deepEqual(numberedUnits.map((unit)=>unit.length),[139,91,98,96,129]);
/** @param {number[]} input */
function ioc(input){
  const frequencies=Array(29).fill(0);
  for(const value of input)frequencies[value]++;
  return frequencies.reduce((sum,n)=>sum+n*(n-1),0)/(input.length*(input.length-1));
}
const sourceFiveShiftTests=[];
for(const mode of ["sectionShift","periodic5"])for(const sign of [-1,1]){
  let offset=0;
  const decoded=numberedUnits.map((unit,section)=>{
    const first=offset;
    offset+=unit.length;
    return unit.map((value,i)=>{
      const key=fiveKey[mode==="sectionShift"?section:(first+i)%5];
      return (value+sign*key+29)%29;
    });
  });
  const original=numberedUnits.flat();
  const reencoded=decoded.flat().map((value,i)=>{
    const section=numberedUnits.findIndex((unit,j)=>i< numberedUnits.slice(0,j+1).reduce((sum,v)=>sum+v.length,0));
    const key=fiveKey[mode==="sectionShift"?section:i%5];
    return (value-sign*key+29)%29;
  });
  assert.deepEqual(reencoded,original);
  const decodedIoc=ioc(decoded.flat());
  assert(decodedIoc<0.045, "source-selected five-runic direct additive inverse remains nonlinguistic");
  sourceFiveShiftTests.push({mode,sign,decodedIoc,perSection:decoded.map(ioc)});
}
assert.deepEqual(sourceFiveShiftTests.map(x=>Number(x.decodedIoc.toFixed(6))),
 [0.034908,0.034627,0.034673,0.03426]);

// If BOTH already-selected fixed source addresses are held and the 256
// source token instances are randomly permuted, the two exact singleton
// token assignments have joint probability (1/256)*(1/255), CONDITIONAL
// on the source word/page, first-runic direction, movement grammar, radix
// and the newly noticed first-clause target.
const conditionalTwoTokenProbability=1/(256*255);


// Exact labelled-P,A,TH index permutation null for PATH's sum=39.
let tripletCount=0,tripletTarget=0;
for(let i=0;i<29;i++)for(let j=0;j<29;j++)for(let k=0;k<29;k++){
  if(i===j||j===k||i===k)continue;
  tripletCount++;
  if(i+j+k===39)tripletTarget++;
}
assert.deepEqual([tripletTarget,tripletCount],[582,21924]);

console.log(JSON.stringify({
 source:"Cicada 2016 original clearsigned LP2 words/numbers instruction",
 observedFollowers:addressed,
 terminalSelection:["WAY→clear p57","MAP→cipher-solved p56","ROAD→unsolved p54, beginning of p54–55"],
 paragraphNumbering:"zero-based physical LP2 image indices and zero-based official GP29 rune indices",
 extraValidFollowerAddress:"PATH→p39, explicitly retained as competing mapping",
 sourceVisibleCorroboration:"p50 grid token at GP0(WAY)=57 is 1w, physically west one column→56",
 nullModel:"1m common random 29-symbol GP-index permutations, fixed six follower spellings; conditional only",
 seed, runs, selectedExact, allTriplesExact, allTriplesDescendingTerminal, allTriplesTerminal,
 empiricalSelectedExact:selectedExact/runs,
 empiricalFourTriplesExact:allTriplesExact/runs,
 empiricalFourTriplesDescendingTerminal:allTriplesDescendingTerminal/runs,
 path39: {
  sourceSignedWord:"PATH",sourcePage:39,firstOriginalPrintedWord:"SW",
  uniqueCompassHeadwordAcrossRunePages:compassFirstWords,
  exactIndependentAlphabetShuffleProbabilityPATH39:tripletTarget/tripletCount,
  possibleSWGridStep:"39(row4,col7) -> 46(row5,col6) = GP0(ARE)",
  sourceTypedFiveStep: {
  sourceStart:"signed THE follower PATH GP0=39 → first p39 word SW",
  originalTokenAt39:tokens[39],move:"SW",steps:tableValues[39],
  intermediateCells:routeFive,
  destination:74,originalTokenAt74:tokens[74],destinationBase60:tableValues[74],
  p57PrimeClauseSums:p57PrimeSums,p57PrimeClauseOneBasedRanks:p57PrimeRanks,
  sourceSelectedSurfaceCandidate:surfaceClosedLoop,
  exact2013ParableID3Product:p57PrimeSums.reduce((a,b)=>a*b,1),
  p50Byte205Address:74,
  alternateFullP55TypedRecipient:{sourceRank:205,tableCell205:tokens[205],base60Byte:tableValues[205],unique76RunePage:55,base59Byte:75,warning:"No source instruction directs rank-as-address or a complete 76-rune decoder."},
  signedWayMapLiteralIntersection:wayMapIntersection,
  sourceFiveByteMod29Key:fiveKey,
  completeOriginal553RuneShiftTests:sourceFiveShiftTests,
  conditionalMultisetNullTwoTokenProbability:conditionalTwoTokenProbability,
  caveat:"Observation after wider search; no original-source instruction formally selects cross-page GP0→page-first-word→p50 compass and prime-ranking."
 },
 sourcePrimeSelfIndex:oneBasedPrimeFixedPoints,
  sourceB60PointerTrace:candidateMoves,
  alternativeB59PointerTrace:"SW:39→46(token 3J=196 rune W)→45(token1l=105 rune H), halt",

  caveat:"The page-start-word→table-compass grammar and target ARE are not source-authenticated."
 },
 fullMessage: {
  validPageAddresses:wholeInBook, invalidPageAddresses:words.length-wholeInBook,
  sourceTerminal, sourcePage55WordCount:0,
  broadNullSeed:broadSeed, broadNullRuns:broadRuns,
  broadNullExpectedValid: anyValidTotal/broadRuns,
  terminalAtLeast8, terminalAtLeast8AndNo55,
  pTerminalAtLeast8:terminalAtLeast8/broadRuns,
  pTerminalAtLeast8AndNo55:terminalAtLeast8AndNo55/broadRuns
 },
 verdict:"Candidate signed-source navigation across known and unsolved terminal pages; no source-selected decryption opcode and no unknown plaintext."
},null,2));
