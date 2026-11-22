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
 * Source A=8 is a previously reconstructed, NON-author-selected teaching
 * example of DH; it is a conditional navigation depth, not a proven opcode.
 *
 * Windows Node.js 22/CommonJS, read-only:
 *   node sims/lp2_1033_3299_3301_base59_p55_p56_convergence_sft.cjs
 */
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
// exactly after A=8 pointers, no free address, clock or alphabet fit.
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
  terminal,firstShed,
  independentlyEquivalentOriginal3301Base59:"55×59+56",
  receiverPages:{p55RuneCount:p55.indices.length,
    p56RuneCount:p56.indices.length},
  decision:directDestinationByKey,
  caveat:"The actual source does not authorize mixing radices or choosing DH A=8 as a pointer count; conditional navigation, no cipher decoder."
},null,2));
console.log("PASS: arithmetic convergence of three original numbers at p55/p56 dual-radix token");
