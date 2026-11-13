"use strict";

/**
 * A key-independent necessary-condition inverse for the p15-p39
 * signed matrix source crosslink.
 *
 * If the unknown cipher adds ANY arbitrary GP29 key vector lying in
 * ker(Q(M)), then Q(M)*C = Q(M)*P for every four-rune block.
 * The p39 source red quadratic Q=27+5x+15x^2 and the sign-restored
 * p15 4x4 Fibonacci-prime matrix M specify the entire projection.
 * Evaluate heldout genuine native-GP English controls without fitting
 * a key, state, phase, alphabet or dictionary to original ciphertext.
 *
 * Node 22/CommonJS; standalone runnable test, no third-party packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod=x=>(x%29+29)%29;
const M=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [-4516,-1206,708,1820]
].map(row=>row.map(mod));
const quad=corpus.pages[39].indices.slice(119,122);
assert.deepEqual(quad,[27,5,15]);
/** @param {number[][]} A @param {number[][]} B */
const mmul=(A,B)=>A.map(row=>B[0].map((_,j)=>
  mod(row.reduce((sum,a,k)=>sum+a*B[k][j],0))));
const I=Array.from({length:4},(_,i)=>
  Array.from({length:4},(_,j)=>+(i===j)));
const M2=mmul(M,M);
const B=I.map((row,i)=>row.map((one,j)=>
  mod(quad[0]*one+quad[1]*M[i][j]+quad[2]*M2[i][j])));
assert.deepEqual(B,[
  [22,17,17,4],
  [19,13,14,20],
  [19,28,24,19],
  [8,3,19,21]
]);
const v=[27,3,13,1];
assert(B.every(row=>mod(row.reduce((s,x,j)=>s+x*v[j],0))===0));
// The top two rows are linearly independent over GF29. Since rank(B)=2,
// their two-coordinate image retains ALL information from the projector.
assert(mod(B[0][0]*B[1][1]-B[0][1]*B[1][0])!==0);

/** @param {number[]} symbols Four-symbol-aligned GP29 runes */
function project(symbols) {
  assert.equal(symbols.length%4,0);
  const out=[];
  for(let i=0;i<symbols.length;i+=4){
    let a=0,b=0;
    for(let j=0;j<4;j++){
      a+=B[0][j]*symbols[i+j];
      b+=B[1][j]*symbols[i+j];
    }
    out.push(mod(a)*29+mod(b));
  }
  return out;
}
const tokens=corpus.translit.map((label,i)=>({label,i}))
  .sort((a,b)=>b.label.length-a.label.length);
/** Source-native GP transcript using authenticated Cicada digraphs. */
function nativeGp(raw) {
  const result=[];
  const src=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(const match of src.matchAll(/[A-Z]+/g)){
    const word=match[0];
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){result.push(21);i+=3;continue;}
      if(word.startsWith("IO",i)){result.push(27);i+=2;continue;}
      const tok=tokens.find(t=>word.startsWith(t.label,i));
      assert(tok,"Unmapped native-GP source word "+word.slice(i));
      result.push(tok.i);
      i+=tok.label.length;
    }
  }
  return result;
}
const sources=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,file])=>({name,values:nativeGp(read(file))}));
const originals=[
  {name:"p16-22",runes:corpus.pages.slice(16,23).flatMap(p=>p.indices)},
  {name:"p40-53-black",runes:corpus.pages.slice(40,54)
    .flatMap(p=>p.indices).slice(8)}
];
assert.deepEqual(originals.map(x=>x.runes.length),[1744,3000]);

/** @param {number[][]} texts */
function model(texts){
  const counts=new Float64Array(841).fill(0.5);
  let total=841*0.5;
  for(const text of texts)for(const value of project(text)){
    counts[value]++;total++;
  }
  return Float64Array.from(counts,x=>Math.log(x/total));
}
/** @param {number[]} runes @param {Float64Array} lp */
function score(runes,lp){
  const projected=project(runes);
  return projected.reduce((sum,v)=>sum+lp[v],0)/projected.length;
}
const results=[];
for(const target of originals)for(let held=0;held<sources.length;held++){
  const logp=model(sources.filter((_,i)=>i!==held).map(s=>s.values));
  const actual=score(target.runes,logp);
  const N=target.runes.length;
  const windows=[];
  for(let at=0;at+N<=sources[held].values.length;at+=N/2)
    windows.push(score(sources[held].values.slice(at,at+N),logp));
  windows.sort((a,b)=>a-b);
  results.push({
    target:target.name,
    heldoutSource:sources[held].name,
    originals:target.runes.length,
    originalMeanLogPair:actual,
    nativeWindowCount:windows.length,
    nativeMedian:windows[Math.floor(windows.length/2)],
    nativeMinimum:windows[0],
    nativeNoBetterCount:windows.filter(value=>value<=actual).length,
    uniformProjectedMean:logp.reduce((sum,x)=>sum+x,0)/841
  });
}
assert.deepEqual(results.map(x=>x.nativeWindowCount),[247,70,367,143,40,213]);
assert(results.every(x=>x.nativeNoBetterCount===0));
assert(Math.abs(results[0].originalMeanLogPair-(-6.81071795109507))<1e-9);
assert(Math.abs(results[5].originalMeanLogPair-(-6.786403931953811))<1e-9);

// Positive: a completely unknown time-varying two-dimensional kernel pad
// survives the same projection exactly and can be inverted if its full
// vector is known; no language scoring is needed to locate the kernel.
const native=sources[0].values.slice(0,3000);
const planted=[];
for(let i=0;i<native.length;i+=4){
  const multiplier=((i/4)*7+3)%29;
  for(let j=0;j<4;j++)
    planted.push(mod(native[i+j]+multiplier*v[j]));
}
assert.deepEqual(project(planted),project(native));
const recovered=planted.map((x,i)=>
  mod(x-((Math.floor(i/4)*7+3)%29)*v[i%4]));
assert.deepEqual(recovered,native);
assert.equal(results.length,6);

console.log(JSON.stringify({
  hypothesis:"C=P+K per four GP runes, arbitrary K in rank-two ker(Q(M))",
  p39OriginalQuadratic:quad,
  projectionRank:2,
  originalTargetRunes:originals.map(x=>x.runes.length),
  heldoutCrossSourceDecisions:results,
  positiveKernelPad:"3000/3000 exact, 750/750 pair projections preserved",
  conclusion:"No native-GP-English heldout source window scores below either original target in any three-way source exclusion"
},null,2));
