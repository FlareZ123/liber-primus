"use strict";

/**
 * Literal original-source number → p50 table → terminal page receiver.
 * Explicit arithmetic path; no cipher key, plaintext or permutation fitted.
 * Original candidate numeric sources:
 * 1033 (LP1 original 5x5 magic-square row sum);
 * 3299 (LP2 p15 marked number);
 * 3301 (Cicada's signed/public puzzle emblem).
 *
 * Source numeric addresses use n mod 256 for the original 256-cell grid.
 * Source base59 omits digit f, absent from p50's alphabet.
 * The 2016 signed words NUMBERS (7 native GP runes) and DIRECTION
 * (8 native GP runes) offer a second, still-conditional 7/8-hop clue.
 * Source DH A=8 was only a participant-selected teaching example.
 *
 * Windows Node.js 22/CommonJS, read-only:
 *   node sims/lp2_1033_3299_3301_base59_p55_p56_convergence_sft.cjs
 */
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cells=grid.rows.flat();
assert.equal(cells.length,256);
assert.equal(grid.alphabet.length,60);
assert(cells.every(token=>token.length===2&&!token.includes("f")));
const base59Alphabet=grid.alphabet.replace("f","");
assert.equal(base59Alphabet.length,59);
const numeral=(token,alphabet)=>{
 const high=alphabet.indexOf(token[0]),low=alphabet.indexOf(token[1]);
 assert(high>=0&&low>=0);
 return high*alphabet.length+low;
};
const pointer=address=>numeral(cells[address],base59Alphabet);
const sourceNumbers=[1033,3299,3301];
const seeds=sourceNumbers.map(number=>({
 number,address:number%256,token:cells[number%256],
 base59:pointer(number%256),
 base60:numeral(cells[number%256],grid.alphabet)
}));
assert.deepEqual(seeds,[
 {number:1033,address:9,token:"49",base59:245,base60:249},
 {number:3299,address:227,token:"49",base59:245,base60:249},
 {number:3301,address:229,token:"00",base59:0,base60:0}
]);
// The 3301 branch reaches the already source-selected target 245
// after eight pointers, with a conditional signed-word length selector.
let state=seeds[2].address;
const trace=[{address:state,token:cells[state]}];
for(let hop=1;hop<=8;hop++){
 state=pointer(state);
 trace.push({hop,address:state,token:cells[state]});
}
assert.deepEqual(trace.map(item=>item.address),
 [229,0,200,108,14,180,142,158,245]);
assert.deepEqual(trace.map(item=>item.token),
 ["00","3N","1o","0E","33","2O","2e","49","0u"]);
assert.equal(state,245);
assert.equal(seeds[0].base59,state);
assert.equal(seeds[1].base59,state);

// The terminal artifact is a two-radix p55/p56 address, and the
// original 3301 itself has the same digits in base59.
const terminal=Object.freeze({
 cell:state,token:cells[state],
 base59:numeral(cells[state],base59Alphabet),
 base60:numeral(cells[state],grid.alphabet)
});
assert.deepEqual(terminal,{cell:245,token:"0u",base59:55,base60:56});
assert.equal(3301,55*59+56);
const p55=gp.pages.find(x=>x.page===55);
const p56=gp.pages.find(x=>x.page===56);
assert.equal(p55.indices.length,76);
assert.equal(p56.indices.length,85);

// Explicit opportunity costs: each target token occurs twice, and
// no manuscript instruction definitively selects A8 or a radix switch.
const positions=token=>cells.flatMap((value,i)=>value===token?[i]:[]);
assert.deepEqual(positions("49"),[9,158,227]);
assert.deepEqual(positions("00"),[192,229]);
assert.deepEqual(positions("0u"),[94,245]);

// Stronger historically authored *suggestion* for the seven/eight hop
// positions: the PGP-signed 2016 sentence literally says
// "their numbers are the direction". The native-GP forms of the two
// nouns have seven and eight original alphabet symbols respectively.
// On the unchanged 3301 route, seven steps reach the THIRD literal
// 49 cell, index158; eight steps reach its base59 successor245.
// Thus all THREE literal 49 cells are reached by the independent
// original 1033, 3299 and signed-word-7/3301 branches. There is still
// no Cicada instruction to use GP word length as number of pointer hops.
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
assert(signed2016.includes("their numbers are the direction"));
const signedNumbersLength=encodeSourceNativeGP("NUMBERS").length;
const signedDirectionLength=encodeSourceNativeGP("DIRECTION").length;
assert.deepEqual([signedNumbersLength,signedDirectionLength],[7,8]);
assert.deepEqual(
 [trace[signedNumbersLength].address,trace[signedDirectionLength].address],
 [158,245]);
assert.equal(trace[signedNumbersLength].token,"49");
assert.equal(trace[signedDirectionLength].token,"0u");
const source49Addresses=[
 sourceNumbers[0]%256,sourceNumbers[1]%256,
 trace[signedNumbersLength].address
].sort((a,b)=>a-b);
assert.deepEqual(source49Addresses,positions("49"));
const signedWordHopSelector={
 signedLiteral:"their numbers are the direction",
 nativeWordLengths:{NUMBERS:signedNumbersLength,
  DIRECTION:signedDirectionLength},
 selectedRouteNodes:[trace[7].address,trace[8].address],
 all49CellsAccountedFor:source49Addresses,
 operationSelectorAuthenticated:false
};


// The two literal "0u" cells reside precisely on the second 32x8
// concentric ring, exposed after one perimeter peel. This is compatible
// with the authenticated p57 instruction to shed circumferences.
const layer=index=>{
 const row=Math.floor(index/8),column=index%8;
 return Math.min(row,31-row,column,7-column);
};
assert.deepEqual(positions("0u").map(layer),[1,1]);
assert.equal(layer(state),1);
const outerPerimeter=cells.flatMap((_,i)=>layer(i)===0?[i]:[]);
assert.equal(outerPerimeter.length,76);
assert.equal(outerPerimeter.length,p55.indices.length);
const firstShed=Object.freeze({
 fullGrid:"32x8",
 outerPerimeterLength:outerPerimeter.length,
 p55RuneCount:p55.indices.length,
 originalP57Instruction:"WE MUST SHED OUR OWN CIRCUMFERENCES",
 exposedIdenticalTokens:"0u",
 exposedCells:positions("0u"),
 exposedRingDepth:1
});


// A fully source-selected *candidate* p55 key receiver: start at the
// convergent second-ring source cell245, walk the literal peeled ring,
// convert cells to GP29 residues, subtract as in solved-p56. Both natural
// ring directions and the table's two published radix conventions are
// charged before inspecting any plaintext. This tests the actual first
// two words on all 76 p55 source runes without fitting a cipher phase.
const secondRing=[];
for(let column=1;column<=6;column++)secondRing.push(8+column);
for(let row=2;row<=30;row++)secondRing.push(8*row+6);
for(let column=5;column>=1;column--)secondRing.push(240+column);
for(let row=29;row>=2;row--)secondRing.push(8*row+1);
assert.equal(secondRing.length,68);
assert.equal(new Set(secondRing).size,68);
const secondRingOffset=secondRing.indexOf(245);
assert.equal(secondRingOffset,35);
const secondRingTests=[];
for(const radix of [59,60]){
 const digits=radix===59?base59Alphabet:grid.alphabet;
 for(const direction of [1,-1]){
  const pad=p55.indices.map((_,j)=>{
   const at=((secondRingOffset+direction*j)%68+68)%68;
   return numeral(cells[secondRing[at]],digits)%29;
  });
  const plaintext=p55.indices.map((c,i)=>
   ((c-pad[i])%29+29)%29);
  const reencrypted=plaintext.map((p,i)=>(p+pad[i])%29);
  assert.deepEqual(reencrypted,p55.indices);
  secondRingTests.push({radix,direction,first32:plaintext.slice(0,32)
   .map(v=>gp.translit[v]).join(""),
   fullTransliterated:plaintext.map(v=>gp.translit[v]).join("")});
 }
}
assert.deepEqual(secondRingTests.map(x=>x.first32),[
 "NGTHRBIANAEIAYENOBTEOTNGJOTHJXBRMXOGPUJIA",
 "NGMSEANGGRIAYAENNGIAEEOTEOEXTHRXBAEOELNGAAEUEAN",
 "LFTHXAEWOEYABNOBPJXMWEAEAHJSFBIEAGIFNAE",
 "LTSABRFAEDOEGBGDISNEXTHOEOTOELEEOEDFAEN"
]);

const directDestinationByKey={
  base59Page:p55.page,
  base60Page:p56.page,
  unknownPlaintextRecovered:false,
  sourceSelectedKey:false
};
console.log(JSON.stringify({
  sources:seeds,
  conditionalDhDepth:8,
  source3301PointerTrace:trace,
  commonNode:245,
  originalTokenMultiplicity:{
    "49":positions("49"),"00":positions("00"),"0u":positions("0u")
  },
  terminal,firstShed,secondRingTests,signedWordHopSelector,
  independentlyEquivalentOriginal3301Base59:"55×59+56",
  receiverPages:{p55RuneCount:p55.indices.length,
    p56RuneCount:p56.indices.length},
  decision:directDestinationByKey,
  caveat:"The actual source does not authorize mixing radices or choosing DH A=8 as a pointer count; conditional navigation, no cipher decoder."
},null,2));
console.log("PASS: arithmetic convergence of three original numbers at p55/p56 dual-radix token");
