"use strict";
/**
 * Does the exact source-marked 99-rune LP2 p36 prelude carry the key for the
 * FIVE independent numbered commands (139/91/98/96/129 GP29 runes)?
 *
 * The original 2014 Interconnectedness MP3 genuinely contained 99 numeric
 * magic-square cells in a 5x5/7x7/5x5 sequence. Exactly 99 GP29 runes occur
 * on p36 ABOVE the original red ten-dot separator and subsequent item1.
 *
 * Source-directed candidate 99-rune keys: physical intro itself; authentic
 * historical 99 cells mod29; intro plus/minus historical cells; or the eight
 * directly invertible historical 5x5/7x7/5x5 matrix images of the intro.
 * Fixed GP29 additive/inverse key reuse, with key clock reset at each red
 * ordinal OR continuous across all five original instructions, and free
 * global 29-choice additive constant. All true 122 word breaks are retained.
 *
 * Decode all 553 source runes. Score exact GP-native dictionary words per
 * entire sentence plus each numbered item. A planted five-unit all-native
 * positive from real source-specific words must recover every original
 * rune and all 122 words under an unknown Caesar constant.
 *
 * Node22 CommonJS read-only SFT. No tuned rearrangement, cipher-specific
 * extra stage, source-time guessed password, artificial shortening, or
 * invented plaintext. Not a proof against other variable-length ciphers.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeWords}=require("./lp2_difference_allletter_capacity_sft.cjs");
const {run:magicMatrix}=require("./lp2_p36_prelude99_2014_magic_square_exact_matrix_sft.cjs");
const ROOT=path.join(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rows=read("resources/liber-primus/lp2-transcription.txt")
 .split(/\r?\n%\r?\n/);
const [p36,p37,p38]=[36,37,38].map(x=>rows[x]);
const original=corpus.pages, orig36=original.find(x=>x.page===36).indices,
  orig37=original.find(x=>x.page===37).indices,
  orig38=original.find(x=>x.page===38).indices;
const cut=(s,marker,next)=>{
 const i=s.indexOf("\n"+marker+"-");
 assert.ok(i>=0);
 const after=s.slice(i+marker.length+2);
 if(!next)return after;
 const k=after.indexOf("\n"+next+"-");
 assert.ok(k>=0);
 return after.slice(0,k);
};
const wordSource=[
 cut(p36,"1",null),
 p37.slice(2,p37.indexOf("\n3-")),
 cut(p37,"3","4"),
 cut(p37,"4",null)+p38.slice(0,p38.indexOf("\n5-")),
 cut(p38,"5",null).split(/\r?\n&\r?\n/)[0]
];
const letters=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=wordSource.map(s=>s.replace(/[\/\r\n]/g,"")
  .split(/[-.]/).filter(Boolean));
const symbols=words.map(w=>w.flatMap(s=>
 Array.from(s).map(r=>letters.get(r))));
const expected=[
 orig36.slice(99),
 orig37.slice(0,91),
 orig37.slice(91,189),
 orig37.slice(189).concat(orig38.slice(0,57)),
 orig38.slice(57,186)
];
assert.deepEqual(symbols,expected);
assert.deepEqual(symbols.map(s=>s.length),[139,91,98,96,129]);
assert.deepEqual(words.map(w=>w.length),[30,20,25,19,28]);
const originalPrelude=orig36.slice(0,99);
const historical=read("resources/cicada2014-openpuff-magic-squares.txt")
 .match(/\d+/g).map(Number).map(x=>x%29);
assert.equal(originalPrelude.length,99);
assert.equal(historical.length,99);
const mod=n=>(n%29+29)%29;
const keys=[
 ["intro",originalPrelude],
 ["historical99",historical],
 ["intro_plus_historical99",originalPrelude.map((v,i)=>mod(v+historical[i]))],
 ["intro_minus_historical99",originalPrelude.map((v,i)=>mod(v-historical[i]))]
];
for(const side of ["left","right"])
for(const order of ["forward","inverse"])
for(const reflected of [false,true]){
 keys.push([side+"_"+order+"_"+(reflected?"mirrored":"source"),
   magicMatrix(originalPrelude,side,order,reflected)]);
}
assert.equal(keys.length,12);
assert.ok(keys.every(x=>x[1].length===99));
const vocab=new Map();
for(const f of [
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/shakespeare_first300k.txt"
]){
 for(const w of encodeWords(read(f))){
   if(!w.length)continue;
   if(!vocab.has(w.length))vocab.set(w.length,new Set());
   vocab.get(w.length).add(w.join(","));
 }
}
/**
 * @param {number[][]} expectedUnits
 * @param {number[]} key
 * @param {1|-1} sign
 * @param {boolean} reset
 * @param {number} bias
 * @returns {number[][]}
 */
function transform(expectedUnits,key,sign,reset,bias){
 let consumed=0,at=0;
 return expectedUnits.map((v,i)=>{
   if(reset)consumed=0;
   return v.map(c=>{
     const p=mod(c+sign*key[consumed%99]+bias);
     consumed++;at++;
     return p;
   });
 });
}
/** @param {number[][]} v @returns {object} */
function score(v){
 const items=[];let total=0,covered=0;
 for(let i=0;i<5;i++){
   let at=0,n=0,r=0;
   const text=[];
   for(const w of words[i]){
     const a=v[i].slice(at,at+w.length);
     if(vocab.get(w.length)?.has(a.join(","))){n++;r+=w.length;}
     text.push(a.map(x=>corpus.translit[x]).join(""));
     at+=w.length;
   }
   assert.equal(at,v[i].length);
   total+=n;covered+=r;
   items.push({words:n,runes:r,text:text.join(" ")});
 }
 return{items,totalWords:total,totalRunes:covered};
}
/** @param {number[][]} input @returns {object} */
function scan(input){
 const results=[],best=[];
 for(const [keyName,key] of keys)
 for(const sign of [1,-1])
 for(const reset of [true,false])
 for(let bias=0;bias<29;bias++){
   const v=transform(input,key,sign,reset,bias);
   const scored=score(v);
   const itemMax=Math.max(...scored.items.map(x=>x.words));
   results.push({keyName,sign,reset,bias,totalWords:scored.totalWords,
     totalRunes:scored.totalRunes,itemWords:scored.items.map(x=>x.words)});
   best.push({...results[results.length-1],items:scored.items});
   best.sort((a,b)=>b.totalWords-a.totalWords||
     b.totalRunes-a.totalRunes||
     b.itemWords[0]-a.itemWords[0]);
   if(best.length>15)best.pop();
 }
 return{testedModels:results.length,
    bestTotalNativeWords:Math.max(...results.map(x=>x.totalWords)),
    bestFirstItemNativeWords:Math.max(...results.map(x=>x.itemWords[0])),
    bestSecondItemNativeWords:Math.max(...results.map(x=>x.itemWords[1])),
    top:best};
}
/** @returns {number[][]} */
function nativePlain(){
 let seed=17;
 return words.map(list=>list.flatMap(w=>{
   const dict=[...vocab.get(w.length)].map(x=>x.split(",").map(Number));
   assert.ok(dict.length,"no positive native word of source length "+w.length);
   seed=(seed+47)%dict.length;
   return dict[seed];
 }));
}
/** @returns {object} */
function plant(){
 const plain=nativePlain();
 const keyName="left_inverse_mirrored";
 const key=keys.find(x=>x[0]===keyName)[1];
 const sign=-1, reset=true,bias=13;
 const ciphertext=plain.map(p=>p.map((v,j)=>mod(
   v-sign*key[j%99]-bias)));
 const actual=scan(ciphertext);
 const hit=actual.top.find(x=>x.keyName===keyName&&x.sign===sign&&
   x.reset===reset&&x.bias===bias&&x.totalWords===122);
 assert.ok(hit,"source-native 122-word recovered-key plant failed");
 assert.deepEqual(plain.map(v=>v.length),[139,91,98,96,129]);
 return{originalRunesRecovered:553,allOriginalWordsRecovered:122,
   sourceIndexCount:key.length,selected:{keyName,sign,reset,bias}};
}
function main(){
 const planted=plant(),tested=scan(symbols);
 const allWords=words.flat().length;
 assert.equal(allWords,122);
 const out={source:{originalSourcePreludeRunes:99,
     originalFiveItemLengths:symbols.map(x=>x.length),
     originalFiveItemWords:words.map(w=>w.length),
     allOriginalCiphertextRunes:553,originalPrintedWords:allWords,
     genuine2014MagicSquareCells:99},
   hypothesis:"red ten-dot separates 99-rune source-derived key from five numbered messages; GP29 additive with any unknown global bias and two source-clocks",
   exhausted:{keys:keys.map(x=>x[0]),variants:tested.testedModels,
     bestAllNativeWords:tested.bestTotalNativeWords,
     bestFirstNativeWords:tested.bestFirstItemNativeWords,
     bestSecondNativeWords:tested.bestSecondItemNativeWords,
     top:tested.top.slice(0,12)},
   authenticShapePositive:planted,
   decision:tested.top.some(x=>x.totalWords>=60&&
     x.itemWords[0]>=15&&x.itemWords[1]>=9)
    ?"Possible complete five-instruction GP29 text. Independently check textual coherence and source key"
    :"No readable five-instruction plaintext under these twelve source-defined 99-symbol keys and direct GP29 additive protocols"
 };
 console.log(JSON.stringify(out,null,2));
 return out;
}
if(require.main===module)main();
module.exports={main,scan,plant};
