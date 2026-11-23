'use strict';
/**
 * Distinct original-word ROLE dissection of the 3rd red-numbered LP2 unit.
 *
 * Solved p57: "SHED OUR OWN CIRCUMFERENCES ... FIND THE DIVINITY WITHIN".
 * Literal one-layer peel on original p37 item 3, 25 printed complete words,
 * yields exactly 49 interior and 49 exterior GP29 symbols. Thus both become
 * full 7x7 tiles beside the historically sourced 1033-sum 7x7 magic square.
 *
 * Finite source-visible first receiver: peel, then apply original unmodified
 * 7x7 GF29 square inverse on the interior with the 49 exterior symbols as a
 * fixed signed mask, either immediately before or after the inverse.
 * Never tune a phase, square, word pairing, direction, or native language.
 *
 * The geometry is source-supported; the cipher operation is a hypothesis.
 * A 49-symbol negative is only a finite test, not a proof of no cipher.
 *
 * Windows Node22 CommonJS; read-only original source; native positive plant.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
/** @param {string} file */
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
assert.deepEqual(native.runes,corpus.runes);
const M=new Map(corpus.runes.map((r,i)=>[r,i]));
const page37=read('resources/lp2-transcription.txt').split('%')[37];
assert(page37);
const words=[];
let current=[],offset=0,start=0;
/** Flush a complete printed word, ignoring source line wraps. */
function flush(){
  if(current.length){words.push({start,end:offset,values:current});current=[];}
}
for(const char of page37){
  if(M.has(char)){
    if(current.length===0)start=offset;
    current.push(M.get(char));offset++;
  }else if(char==='/'||/\s/u.test(char)){
    // Source slash marks a physical printed line wrap, not a word ending.
  }else flush();
}
flush();
assert.equal(offset,228);
const selected=words.filter(w=>w.start>=91&&w.end<=189);
assert.equal(selected.length,25);
assert.equal(selected.reduce((s,w)=>s+w.values.length,0),98);
const inside=selected.flatMap(({values:v})=>v.slice(1,-1));
const outside=selected.flatMap(({values:v})=>v.length===1?[v[0]]:[v[0],v[v.length-1]]);
assert.deepEqual([inside.length,outside.length],[49,49]);
const squareTexts=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/);
const B=squareTexts[1].split('\n').map(x=>x.trim().split(/\s+/).map(Number));
assert.deepEqual(B.map(x=>x.length),Array(7).fill(7));
for(const row of B)assert.equal(row.reduce((s,x)=>s+x,0),1033);
assert.equal(B[3][3],331);
const mod=x=>((x%29)+29)%29;
/** @param {number[][]} m */
const transpose=m=>m[0].map((_,i)=>m.map(r=>r[i]));
/** @param {number[][]} a @param {number[][]} b */
const matmul=(a,b)=>a.map(r=>b[0].map((_,j)=>mod(r.reduce((sum,v,k)=>sum+v*b[k][j],0))));
/** @param {number[][]} input */
function inverse(input){
  const n=input.length;
  const a=input.map((r,i)=>[...r.map(mod),...Array.from({length:n},(_,j)=>+(i===j))]);
  for(let col=0;col<n;col++){
    const pivot=a.findIndex((r,i)=>i>=col&&r[col]!==0);
    assert(pivot>=0);
    [a[col],a[pivot]]=[a[pivot],a[col]];
    const mul=Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*a[col][col])===1);
    assert(mul!==undefined);
    a[col]=a[col].map(x=>mod(x*mul));
    for(let i=0;i<n;i++)if(i!==col){
      const q=a[i][col];a[i]=a[i].map((x,j)=>mod(x-q*a[col][j]));
    }
  }
  return a.map(r=>r.slice(n));
}
const Bi=inverse(B);
assert.deepEqual(matmul(B,Bi),B.map((r,i)=>r.map((_,j)=>+(i===j))));
/** @param {number[]} flat */
const tile=flat=>Array.from({length:7},(_,i)=>flat.slice(i*7,(i+1)*7));
/** @param {number[][]} matrix */
const linear=matrix=>matmul(matmul(Bi,matrix),transpose(Bi)).flat();
/** @param {number[][]} matrix */
const inverseLinear=matrix=>matmul(matmul(B,matrix),transpose(B)).flat();
/** @param {number[]} x @param {number[]} y @param {number} sign */
const combine=(x,y,sign)=>x.map((v,i)=>mod(v+sign*y[i]));
/** @param {number[]} values */
const ioc=values=>{
  const h=Array(29).fill(0);
  for(const v of values)h[v]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
};
/** @param {number[]} values */
const spell=values=>values.map(v=>corpus.translit[v]).join('');
const gpPositive=corpus.pages.find(p=>p.page===57).indices.slice(0,49);
assert.equal(gpPositive.length,49);
const tests=[];
for(const order of ['direct','before','after'])
  for(const sign of [-1,1]){
    let decoded;
    if(order==='direct')decoded=combine(inside,outside,sign);
    if(order==='before')decoded=linear(tile(combine(inside,outside,sign)));
    if(order==='after')decoded=combine(linear(tile(inside)),outside,sign);
    assert.equal(decoded.length,49);
    let replay;
    if(order==='direct')replay=combine(decoded,outside,-sign);
    if(order==='before')replay=combine(inverseLinear(tile(decoded)),outside,-sign);
    if(order==='after')replay=inverseLinear(tile(combine(decoded,outside,-sign)));
    assert.deepEqual(replay,inside);
    let encrypted;
    if(order==='direct')encrypted=combine(gpPositive,outside,-sign);
    if(order==='before')encrypted=combine(inverseLinear(tile(gpPositive)),outside,-sign);
    if(order==='after')encrypted=inverseLinear(tile(combine(gpPositive,outside,-sign)));
    const plantDecoded=order==='direct'?combine(encrypted,outside,sign):
      order==='before'?linear(tile(combine(encrypted,outside,sign))):
      combine(linear(tile(encrypted)),outside,sign);
    assert.deepEqual(plantDecoded,gpPositive);
    tests.push({
      order,sign,original49Replayed:49,nativeP57PlantedRecovered:49,
      originalIoc:ioc(decoded),transliteration:spell(decoded)
    });
  }
assert.deepEqual(tests.map(x=>x.originalIoc),[
  0.03316326530612245,0.04081632653061224,
  0.041666666666666664,0.03741496598639456,
  0.0391156462585034,0.03231292517006803
]);
console.log(JSON.stringify({
  source:'LP2 original p37 red item3; solved p57 SHED; 2014 1033-sum 7x7 square',
  wordLengths:selected.map(w=>w.values.length),
  originalRuneCount:98,
  insideCount:49,outsideCount:49,
  insideIoc:ioc(inside),outsideIoc:ioc(outside),
  inside:spell(inside),outside:spell(outside),
  status:'six finite direct source-key receiver choices yield no recovered coherent unknown plaintext',
  interpretation:'no original author instruction selects a square/mask decoder or 49-symbol prose',
  tests
},null,2));
