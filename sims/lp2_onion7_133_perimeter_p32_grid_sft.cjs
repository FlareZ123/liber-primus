"use strict";
/**
 * Exact source-nominated "shed circumferences" 13x133 LP2 extraction:
 * 13x133 pp8-14 -> fifth shell of 256 and central 121.
 * 256 has a direct original printed grid; 121 has an original p32 tree page.
 * Tests fixed source GP29 additive consumers; no fitting to unknown text.
 * Run: node sims/lp2_onion7_133_perimeter_p32_grid_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const MOD=29, smooth=.005;
const m=x=>((x%MOD)+MOD)%MOD;
/** @param {string} text @returns {number[]} */
function toGP(text){
 const options=gp.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
 const raw=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
   .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
 const out=[];
 for(const word of raw.match(/[A-Z]+/g)||[])
   for(let i=0;i<word.length;){
     const s=options.find(x=>word.startsWith(x.v,i));
     if(s){out.push(s.i);i+=s.v.length;}else i++;
   }
 return out;
}
/**
 * Source-frozen smoothed trigram scoring, first 75% Shakespeare training.
 * @param {number[]} source
 * @returns {{score:(x:number[])=>number,train:number}}
 */
function language(source){
 const train=Math.floor(source.length*.75);
 const trigrams=new Float64Array(MOD**3).fill(smooth);
 const bigrams=new Float64Array(MOD**2).fill(MOD*smooth);
 for(let i=2;i<train;i++){
   const id=source[i-2]*MOD**2+source[i-1]*MOD+source[i];
   trigrams[id]++;bigrams[Math.floor(id/MOD)]++;
 }
 return {train,score(x){
   let ll=0;for(let i=2;i<x.length;i++){
     const id=x[i-2]*MOD**2+x[i-1]*MOD+x[i];
     ll+=Math.log(trigrams[id]/bigrams[Math.floor(id/MOD)]);
   }
   return ll/(x.length-2);
 }};
}
/**
 * Clockwise perimeter of the nested 13x133 rectangular chapter.
 * @param {number} depth 0..5, outermost zero
 * @returns {number[]}
 */
function shell(depth){
 const top=depth,bottom=12-depth,left=depth,right=132-depth;
 const out=[];
 for(let c=left;c<=right;c++)out.push(top*133+c);
 for(let r=top+1;r<=bottom;r++)out.push(r*133+right);
 for(let c=right-1;c>=left;c--)out.push(bottom*133+c);
 for(let r=bottom-1;r>top;r--)out.push(r*133+left);
 return out;
}
/**
 * Positionally transform the printed p32 11x11 runes by all D4 symmetries.
 * @param {number[]} original
 * @param {boolean} transpose
 * @param {boolean} reverseRows
 * @param {boolean} reverseCols
 * @returns {number[]}
 */
function orient11(original,transpose,reverseRows,reverseCols){
 const out=[];
 for(let r=0;r<11;r++)for(let c=0;c<11;c++){
   const rr=reverseRows?10-r:r,cc=reverseCols?10-c:c;
   out.push(original[transpose?cc*11+rr:rr*11+cc]);
 }
 return out;
}
/**
 * Source byte -> GP index mapping. These fixed public operators are hypothetical.
 * @param {number} byte
 * @param {"mod29"|"mod28"|"primeGP"} rule
 * @returns {number}
 */
function byteKey(byte,rule){
 if(rule==="mod29")return byte%29;
 if(rule==="mod28")return byte%28;
 return gp.prime[byte%29]%29;
}
const chapter=gp.pages.filter(p=>p.page>=8&&p.page<=14)
  .flatMap(p=>p.indices);
const p32=gp.pages.find(p=>p.page===32).indices;
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(chapter.length,1729);
assert.equal(p32.length,121);
assert.equal(bytes.length,256);
assert.equal(1729,13*133);
const shells=Array.from({length:6},(_,d)=>shell(d));
assert.deepEqual(shells.map(x=>x.length),[288,280,272,264,256,248]);
const centerIndices=Array.from({length:121},(_,i)=>6*133+6+i);
const allIndices=shells.flat().concat(centerIndices);
assert.equal(allIndices.length,1729);
assert.equal(new Set(allIndices).size,1729,"Exact whole-text circumference partition");
const ring=shells[4].map(i=>chapter[i]),central=centerIndices.map(i=>chapter[i]);

const native=toGP(shakespeare);
assert.equal(native.length,218800);
const {train,score}=language(native);
// An exact full-length positive encryption/decryption with real source key.
const positive121=native.slice(train,train+121);
const plant121=positive121.map((x,i)=>m(x+p32[i]));
assert.deepEqual(plant121.map((x,i)=>m(x-p32[i])),positive121);
const positive256=native.slice(train,train+256);
const plant256=positive256.map((x,i)=>m(x+bytes[i]%29));
assert.deepEqual(plant256.map((x,i)=>m(x-bytes[i]%29)),positive256);
assert(score(positive121)>-3);
assert(score(positive256)>-3);

const coreCandidates=[];
for(const transpose of [false,true])
 for(const reverseRows of [false,true])
  for(const reverseCols of [false,true]){
   const key=orient11(p32,transpose,reverseRows,reverseCols);
   for(const reverseCenter of [false,true])
    for(const sign of [-1,1]){
     const raw=reverseCenter?[...central].reverse():central;
     const output=raw.map((x,i)=>m(x+sign*key[i]));
     coreCandidates.push({transpose,reverseRows,reverseCols,
       reverseCenter,sign,score:score(output)});
    }
  }
coreCandidates.sort((a,b)=>b.score-a.score);
assert.equal(coreCandidates.length,32);
assert(coreCandidates[0].score < -5);

const ringCandidates=[];
for(const reverseRing of [false,true])
 for(const reverseBytes of [false,true])
  for(const rule of ["mod29","mod28","primeGP"])
   for(const sign of [-1,1]){
    const data=reverseRing?[...ring].reverse():ring;
    const key=reverseBytes?[...bytes].reverse():bytes;
    const output=data.map((x,i)=>m(x+sign*byteKey(key[i],rule)));
    ringCandidates.push({reverseRing,reverseBytes,rule,sign,
      score:score(output)});
   }
ringCandidates.sort((a,b)=>b.score-a.score);
assert.equal(ringCandidates.length,24);
assert(ringCandidates[0].score < -5.2);

/**
 * Binary-format branch: original table remains 8-bit bytes. The selected
 * 256-rune ring supplies either GP indices, GP primes, or translit initials.
 * Check literal XOR and +/- arithmetic for ASCII plaintext without fitting.
 */
const binary=[];
for(const runeEncoding of ["index","prime","ascii"])
 for(const op of ["xor","plus","minus"])
  for(const reverseRing of [false,true])
   for(const reverseTable of [false,true])
    for(const tableOrder of ["row","column"]){
     const rr=reverseRing?[...ring].reverse():ring;
     const bb=tableOrder==="row"?[...bytes]:
       Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]);
     if(reverseTable)bb.reverse();
     const payload=rr.map((x,i)=>{
       const y=runeEncoding==="index"?x:
         runeEncoding==="prime"?gp.prime[x]:gp.translit[x].charCodeAt(0);
       return op==="xor"?(bb[i]^y):
         op==="plus"?(bb[i]+y)%256:(bb[i]-y+256)%256;
     });
     const printable=payload.filter(x=>x>=32&&x<=126).length/256;
     binary.push({runeEncoding,op,reverseRing,reverseTable,
       tableOrder,printable});
    }
binary.sort((a,b)=>b.printable-a.printable);
assert.equal(binary.length,72);
assert(binary[0].printable < .45);
const asciiPlant=Array.from(shakespeare.slice(200000).replace(/\s/g," ")
  .slice(0,256),char=>char.charCodeAt(0));
assert.equal(asciiPlant.length,256);
assert(asciiPlant.every(x=>x>=32&&x<=126));
const xorPlant=asciiPlant.map((x,i)=>x^gp.prime[ring[i]]);
assert.deepEqual(xorPlant.map((x,i)=>x^gp.prime[ring[i]]),asciiPlant);

console.log(JSON.stringify({
  source:"Original LP2 pp8-14 13x133, 2014 title133, solved p57 circumference, p32 tree, p49-51 grid",
  partition:{outerToInner:shells.map(x=>x.length),center:centerIndices.length,
    total:allIndices.length,unique:1729},
  rawScores:{fifthRing256:score(ring),center121:score(central),p32:score(p32)},
  nativeControls:{plain121:score(positive121),plain256:score(positive256),
    p32KeyPlantRecovered:true,printedGridPlantRecovered:true},
  coreComparison:{tests:coreCandidates.length,best:coreCandidates[0]},
  ringComparison:{tests:ringCandidates.length,best:ringCandidates[0]},
  binaryASCIIComparison:{tests:binary.length,best:binary[0],xorPlantExact:true},
  conclusion:"Exact structural correspondence but no original ciphertext plaintext/key recovery under direct source-additive consumers."
},null,2));
