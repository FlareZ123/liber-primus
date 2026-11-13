"use strict";
/**
 * Historical 2013 DATA/560.13 byte pad at p15 red-numeral quotient 8952964:
 * Exact all-mask feasibility for the authentic solved-page plaintext-F bypass.
 * Original GP29 p15 rune9 through p22 (1894), no omitted symbols.
 * Node 22 CommonJS, Windows 11: node <this-file> <historical-DATA-file>
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const p15=corpus.pages[15];
assert.equal(p15.page,15);
assert.deepEqual(p15.indices.slice(0,9),[0,1,20,19,24,28,26,22,24]);
const number=p15.indices.slice(0,9).reduce((n,x)=>29n*n+BigInt(x),0n);
assert.equal(number,29553734724n);
assert.equal(number%3301n,560n);
const offset=Number(number/3301n);
assert.equal(offset,8952964);
const pages=corpus.pages.slice(15,23).map((page,i)=>i===0?page.indices.slice(9):page.indices);
const original=pages.flat();
assert.equal(original.length,1894);
const file=process.argv[2];
assert.ok(file,"Historical DATA/560.13 path required");
const raw=fs.readFileSync(file);
assert.equal(raw.length,118818811);
const sha=crypto.createHash("sha256").update(raw).digest("hex");
assert.equal(sha,"db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
const tape=raw.subarray(offset,offset+original.length+100);
/** @param {number} v @returns {number} */
const mod29=v=>((v%29)+29)%29;
/** @param {string} quant @returns {(i:number)=>number} */
const key=quant=>i=>{
  assert.ok(i>=0&&i<tape.length);
  const b=tape[i];
  return quant==="mod29"?b%29:Math.floor(29*b/256);
};
/**
 * Check every possible original plaintext-F bypass mask by a complete
 * set of consumed-pad indices, without plaintext language assumptions.
 * @param {number[]} ciphertext
 * @param {(j:number)=>number} getKey
 * @param {number} sign
 * @returns {{possible:boolean,firstFailure:number,possibleFinalStates:number,peakStates:number}}
 */
function exactMaskFeasible(ciphertext,getKey,sign) {
  let states=new Set([0]),peakStates=1;
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set();
    for(const used of states){
      if(ciphertext[i]===0)next.add(used);
      if(mod29(ciphertext[i]-sign*getKey(used))!==0)next.add(used+1);
    }
    if(!next.size)return {possible:false,firstFailure:i,possibleFinalStates:0,peakStates};
    states=next;
    peakStates=Math.max(peakStates,states.size);
  }
  return {possible:true,firstFailure:-1,possibleFinalStates:states.size,peakStates};
}
/**
 * Authentic literal-plaintext-F transducer; non-F consumes pad, F emits 0
 * and does not consume pad. Valid for arbitrary native-GP plaintext.
 * @param {number[]} plaintext @param {(j:number)=>number} getKey @param {number} sign
 * @returns {number[]}
 */
function encrypt(plaintext,getKey,sign){
  let used=0;
  return plaintext.map(p=>p===0?0:mod29(p+sign*getKey(used++)));
}
const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const testNative=Array.from({length:original.length},(_,i)=>solved[i%solved.length]);
assert.ok(testNative.includes(0));
const variants=[];
for(const quant of ["mod29","floor29"])for(const sign of [-1,1]){
  const shift=key(quant);
  const full=exactMaskFeasible(original,shift,sign);
  const perPage=pages.map(page=>exactMaskFeasible(page,shift,sign));
  const wholePlant=encrypt(testNative,shift,sign);
  assert.equal(exactMaskFeasible(wholePlant,shift,sign).possible,true);
  const plantSplit=pages.map((p,i)=>testNative.slice(pages.slice(0,i).flat().length,pages.slice(0,i+1).flat().length));
  assert.deepEqual(plantSplit.map(p=>p.length),pages.map(p=>p.length));
  for(const plant of plantSplit){
    assert.ok(exactMaskFeasible(encrypt(plant,shift,sign),shift,sign).possible);
  }
  // Ensure native original source ciphertext can be exactly recreated
  // when a genuine F-transparent plaintext and its clock are supplied.
  let used=0;
  for(let i=0;i<wholePlant.length;i++){
    assert.equal(wholePlant[i],testNative[i]===0?0:mod29(testNative[i]+sign*shift(used++)));
  }
  variants.push({quant,sign,full,perPage,
    possibleWithFixedPerPageReset:perPage.every(x=>x.possible),
    positivePlantedWhole:true,positivePlantedPageReset:true});
}
const allImpossible=variants.every(x=>!x.full.possible&&!x.possibleWithFixedPerPageReset);
const independentPageOptions=pages.map((page,i)=>({
  physicalPage:i+15,runes:page.length,
  possibleVariants:variants.filter(v=>v.perPage[i].possible).map(v=>v.quant+":"+v.sign)
}));
console.log(JSON.stringify({
  status:"PASS",result:allImpossible?"EXCLUDED_EXACT_F_MASK":"SOME_SURVIVOR_REQUIRES_FURTHER_WORK",
  input:{red9N:number.toString(),sourceFile:"DATA/560.13",offset,sha256:sha,
    originalRunes:original.length,actualFCount:original.filter(x=>x===0).length,
    pages:pages.map(x=>x.length)},
  variants,independentPageOptions,
  completePlantedNativeGPControls:8,
  scope:"Byte-aligned source quotient, 1 pad byte per ordinary rune, two GP29 mappings, both additive signs; every literal plaintext-F skip mask on original 1894 rune chapter. No extra phase or hidden key."
},null,2));
