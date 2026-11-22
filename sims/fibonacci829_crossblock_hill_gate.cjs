"use strict";
/**
 * LP2 last section 3316=4*829: source-fixed page15 4x4 Hill mixer across
 * four successive 829-rune blocks, allowing every ciphertext-block
 * assignment and all four canonical matrix orientations.
 *
 * A fixed 29-symbol outer relabelling preserves each output IoC.
 * No plaintext, key, or authentic LP2 encryption is claimed.
 * Node 22 / CommonJS; run from repo root:
 * node sims/fibonacci829_crossblock_hill_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source = fs.readFileSync(
  path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const WIDTH = 829;
const MOD = 29;
const ORIGINAL_SQUARE = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const mod = v => (v % MOD + MOD) % MOD;
const matrix = ORIGINAL_SQUARE.map(row=>row.map(mod));

/**
 * @param {number[][]} A
 * @returns {number[][]}
 */
function inverse(A) {
  const n=A.length;
  const B=A.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>+(i===j))));
  for(let j=0;j<n;j++){
    const pivot=B.findIndex((row,i)=>i>=j&&row[j]);
    assert.ok(pivot>=0,"invertible printed source matrix");
    [B[j],B[pivot]]=[B[pivot],B[j]];
    let f=1;while(mod(f*B[j][j])!==1)f++;
    B[j]=B[j].map(x=>mod(x*f));
    for(let i=0;i<n;i++)if(i!==j){
      const c=B[i][j];
      B[i]=B[i].map((x,k)=>mod(x-c*B[j][k]));
    }
  }
  return B.map(row=>row.slice(n));
}
/** @param {number[][]} A @returns {number[][]} */
const transpose = A=>A[0].map((_,j)=>A.map(row=>row[j]));
/** @param {number[][]} blocks @param {number[][]} A @param {number[]} order */
function mix(blocks,A,order) {
  assert.deepEqual(blocks.map(b=>b.length),[WIDTH,WIDTH,WIDTH,WIDTH]);
  const out=Array.from({length:4},()=>new Array(WIDTH));
  for(let t=0;t<WIDTH;t++)for(let i=0;i<4;i++){
    let value=0;
    for(let j=0;j<4;j++)value+=A[i][j]*blocks[order[j]][t];
    out[i][t]=mod(value);
  }
  return out;
}
/** @param {number[]} values */
function ioc(values) {
  const counts=new Uint32Array(MOD);
  for(const value of values)counts[value]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {string} text @returns {number[]} */
function nativeGP(text) {
  const tokens=corpus.translit.map((label,index)=>({label,index}))
    .sort((a,b)=>b.label.length-a.label.length);
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let at=0;at<word.length;){
      const t=tokens.find(entry=>word.startsWith(entry.label,at));
      assert.ok(t,"Source word is GP-encodable: "+word+" offset "+at);
      out.push(t.index);
      at+=t.label.length;
    }
  }
  return out;
}
/**
 * Exactly enumerate all 4! possible assignments of physical ciphertext
 * blocks to the rows of the square, retaining every observed original rune.
 * @returns {number[][]}
 */
function permutations() {
  const out=[];
  /** @param {number[]} previous @param {number[]} remaining */
  function build(previous,remaining){
    if(!remaining.length){out.push(previous);return;}
    for(let i=0;i<remaining.length;i++)build(
      previous.concat(remaining[i]),remaining.filter((_,j)=>j!==i));
  }
  build([],[0,1,2,3]);
  assert.equal(out.length,24);
  return out;
}
/** @param {number[]} sourceGP @returns {{minimum:number,windows:number}} */
function minimumReferenceIoC(sourceGP) {
  const hist=new Uint32Array(MOD);
  let min=Infinity, windows=0;
  for(let i=0;i<sourceGP.length;i++){
    hist[sourceGP[i]]++;
    if(i>=WIDTH)hist[sourceGP[i-WIDTH]]--;
    if(i>=WIDTH-1){
      const pair=hist.reduce((sum,v)=>sum+v*(v-1),0);
      min=Math.min(min,pair/(WIDTH*(WIDTH-1)));
      windows++;
    }
  }
  return {minimum:min,windows};
}
function main() {
  const original=corpus.pages.filter(p=>p.page>=40&&p.page<=55)
    .flatMap(p=>p.indices);
  assert.equal(original.length,4*WIDTH);
  assert.equal(3301-ORIGINAL_SQUARE[2][3],WIDTH);
  const blocks=Array.from({length:4},(_,i)=>
    original.slice(i*WIDTH,(i+1)*WIDTH));
  const plain=nativeGP(source);
  assert.equal(plain.length,218800);
  const reference=minimumReferenceIoC(plain);
  assert.equal(reference.windows,217972);
  const inv=inverse(matrix);
  const options=[
    ["matrix",matrix],["inverse",inv],
    ["transpose",transpose(matrix)],
    ["inverse-transpose",transpose(inv)]
  ];
  let maximum=-Infinity,maximumModel=null,minimum=Infinity,
    minPooled=Infinity,maxPooled=-Infinity,number=0,allOutside=true;
  for(const [name,A] of options)for(const perm of permutations()){
    const out=mix(blocks,A,perm), rates=out.map(ioc);
    const max=Math.max(...rates);
    const pool=ioc(out.flat());
    if(max>maximum){maximum=max;maximumModel={name,perm,rates};}
    minimum=Math.min(minimum,...rates);
    minPooled=Math.min(minPooled,pool);
    maxPooled=Math.max(maxPooled,pool);
    allOutside=allOutside&&rates.every(v=>v<reference.minimum);
    number++;
  }
  assert.equal(number,96);
  assert.equal(allOutside,true);
  assert.equal(maximum,0.03543061601487153);
  assert.equal(minimum,0.03371444555165119);
  assert.equal(reference.minimum,0.05303228964528592);
  // Plant exact native GP prose under the source matrix. The four hidden
  // ciphertext-block identities are published in scrambled source order.
  const plantPlain=Array.from({length:4},(_,i)=>
    plain.slice(i*WIDTH,(i+1)*WIDTH));
  const encrypted=mix(plantPlain,matrix,[0,1,2,3]);
  const hidden=[2,0,3,1];
  const scrambled=hidden.map(i=>encrypted[i]);
  const recovered=mix(scrambled,inv,[1,3,0,2]);
  assert.deepEqual(recovered,plantPlain);
  assert.ok(recovered.every(p=>ioc(p)>reference.minimum));
  return {
    classification:"Exact finite reference-specific no-go; no LP2 decryption",
    geometry:{finalPages:"40-55",runes:4*WIDTH,blocks:4,width:WIDTH,
      sourceSquareComplement:ORIGINAL_SQUARE[2][3]},
    modes:number,
    originalCipherIoC:blocks.map(ioc),
    originalDecodedMinBlockIoC:minimum,
    originalDecodedMaxBlockIoC:maximum,
    originalPooledIoCRange:[minPooled,maxPooled],
    strongestBlockModel:maximumModel,
    reference:{"name":"Shakespeare native-GP",
      sourceRunes:plain.length,length:WIDTH,...reference},
    positiveControl:{sourceGPRecovered:4*WIDTH,
      sourceBlockAssignment: hidden, exact:true,
      nativeEnglishIoC:plantPlain.map(ioc)},
    decision:"Every one of the 384 output blocks falls below every full-length source reference window; arbitrary fixed outer GP permutations cannot change this, but another cipher layer or non-GP intermediate remains open."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={inverse,mix,ioc,nativeGP,permutations,minimumReferenceIoC,main};
