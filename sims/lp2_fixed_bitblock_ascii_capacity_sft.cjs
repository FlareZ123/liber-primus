'use strict';
/*
 * Exact fixed-bit-block capacity test, ordinary ASCII.
 * node sims/lp2_fixed_bitblock_ascii_capacity_sft.cjs
 * No key fitting or language score.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const N = 29;
const FULL = (1 << N) - 1;
const tape = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(tape.length, 12956);

/** @param {number} x */
function popcount(x) {
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
/** @param {number[]} v @param {number} n */
function low(v, n) {
  return [...v].sort((a,b) => a-b).slice(0,n).reduce((a,b) => a+b,0);
}
/**
 * Exact decision: does the row-mask bipartite graph contain K(k,k)?
 * Every core deletion is necessary; DFS exhausts increasing row selections.
 * @param {number[]} M @param {number} k
 */
function rectangle(M,k) {
  const n = M.length;
  let rows = Array.from({length:n},(_,i)=>i), cols = (1 << n)-1;
  for (;;) {
    const oldN=rows.length, oldCols=cols;
    rows=rows.filter(i=>popcount(M[i]&cols)>=k);
    if(rows.length<k)return {yes:false,nodes:0};
    cols=0;
    for(let c=0;c<n;c++) {
      if(!(oldCols&(1<<c)))continue;
      let d=0;
      for(const i of rows)d+=Number(Boolean(M[i]&(1<<c)));
      if(d>=k)cols|=1<<c;
    }
    if(popcount(cols)<k)return {yes:false,nodes:0};
    if(oldN===rows.length&&oldCols===cols)break;
  }
  rows.sort((a,b)=>popcount(M[a]&cols)-popcount(M[b]&cols));
  let nodes=0;
  function dfs(rs,mask,need) {
    nodes++;
    if(need===0)return true;
    if(rs.length<need)return false;
    for(let t=0;t<=rs.length-need;t++){
      const mm=mask&M[rs[t]];
      if(popcount(mm)<k)continue;
      const next=[];
      for(let u=t+1;u<rs.length;u++)
        if(popcount(mm&M[rs[u]])>=k)next.push(rs[u]);
      if(next.length>=need-1&&dfs(next,mm,need-1))return true;
    }
    return false;
  }
  return {yes:dfs(rows,cols,k),nodes};
}
/** Independent small-mask brute decision. */
function brute(M,k) {
  for(let r=1;r<(1<<M.length);r++){
    if(popcount(r)!==k)continue;
    let m=(1<<M.length)-1;
    for(let i=0;i<M.length;i++)if(r&(1<<i))m&=M[i];
    if(popcount(m)>=k)return true;
  }
  return false;
}
let rng=0x25a5c117;
function random() {
  rng^=rng<<13; rng^=rng>>>17; rng^=rng<<5;
  return rng>>>0;
}
let positive=0,negative=0;
for(let i=0;i<256;i++){
  const n=3+random()%7,k=1+random()%n;
  const M=Array.from({length:n},()=>random()&((1<<n)-1));
  // Ensure a mixture including sparse, dense, and deliberately planted cases.
  if(i%3===0)for(let a=0;a<k;a++)M[a]|=(1<<k)-1;
  const truth=brute(M,k);
  assert.equal(rectangle(M,k).yes,truth);
  if(truth)positive++;else negative++;
}
assert(positive>0&&negative>0);
/** @param {number[]} v @param {number} res @param {number} a @param {number} b */
function tripleCertificate(v,res,a,b) {
  const T=Array.from({length:N},()=>Array(N).fill(0));
  for(let i=7+res;i+a+b<v.length-7;i+=7)
    T[v[i]][v[i+a]]|=1<<v[i+a+b];
  const groups=[7,7,7,8].map((n,g)=>Array.from({length:n},(_,i)=>i+7*g));
  let tests=0,nodes=0,failures=0;
  for(const g of groups)
    for(let i=0;i<g.length;i++)
    for(let j=i+1;j<g.length;j++)
    for(let k=j+1;k<g.length;k++)
    for(let l=k+1;l<g.length;l++) {
      const M=Array.from({length:N},(_,x)=>FULL&~(
        T[g[i]][x]|T[g[j]][x]|T[g[k]][x]|T[g[l]][x]));
      const result=rectangle(M,13);
      tests++;nodes+=result.nodes;failures+=Number(result.yes);
    }
  return {res,a,b,tests,nodes,failures};
}
/** Relaxed exact lower bound on every x-by-y Cartesian submatrix sum. */
function lowerRectangle(M,x,y){
  const tr=M[0].map((_,i)=>M.map(row=>row[i]));
  return Math.max(low(M.map(row=>low(row,y)),x),
                  low(tr.map(row=>low(row,x)),y));
}
/** @param {number[]} v @param {number} width */
function phaseHistogram(v,width) {
  return Array.from({length:width},(_,res)=>{
    const a=Array(N).fill(0);
    for(let i=width+res;i<v.length-width;i+=width)a[v[i]]++;
    return a;
  });
}
const single7=phaseHistogram(tape,7);
const minSingle7=Math.min(...single7.flat());
const minSamePair=Math.min(...single7.map(v=>low(v,5)));
const pairs=[];
for(let res=0;res<7;res++)for(let d=1;d<=6;d++){
  const M=Array.from({length:N},()=>Array(N).fill(0));
  for(let i=7+res;i+d<tape.length-7;i+=7)M[tape[i]][tape[i+d]]++;
  pairs.push({res,d,b513:lowerRectangle(M,5,13),
    b135:lowerRectangle(M,13,5),b1313:lowerRectangle(M,13,13)});
}
const triples=[];
for(let res=0;res<7;res++)
  for(let a=1;a<6;a++)for(let b=1;a+b<=6;b++)
    triples.push(tripleCertificate(tape,res,a,b));
const min513=Math.min(...pairs.map(x=>x.b513));
const min135=Math.min(...pairs.map(x=>x.b135));
const min1313=Math.min(...pairs.map(x=>x.b1313));
const minEight=Math.min(...phaseHistogram(tape,8).map(v=>low(v,13)));
assert.equal(triples.length,105);
assert.equal(triples.reduce((a,x)=>a+x.tests,0),18375);
assert.equal(triples.reduce((a,x)=>a+x.failures,0),0);
assert(minSingle7>0&&min513>0&&min135>0&&min1313>0&&minEight>0);

/*
 * Native-source positive plants: take literal GP transliteration of p57,
 * preserve newline separation between copies, pack ASCII at width 7 or 8,
 * use a fixed random permutation of block bits, and per-lane secret maps
 * of observed 5-bit codes into GP29.  Select a permutation only if all
 * lanes fit 29 symbols, so the plant is actually in the model.
 */
const native=corpus.pages.find(p=>p.page===57).indices.map(i=>corpus.translit[i]).join('');
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function plant(width){
  const text=(native+'\n').repeat(100);
  const plain=text.slice(0,Math.floor(text.length/5)*5);
  const blockBits=5*width;
  let order,raw,attempts=0;
  for(;;){
    attempts++;
    assert(attempts<1000);
    order=shuffle(Array.from({length:blockBits},(_,i)=>i));
    raw=[];
    for(let off=0;off<plain.length;off+=5){
      const bits=[];
      for(let j=0;j<5;j++)for(let k=width-1;k>=0;k--)
        bits.push((plain.charCodeAt(off+j)>>>k)&1);
      const inverse=Array(blockBits);
      for(let i=0;i<blockBits;i++)inverse[order[i]]=bits[i];
      for(let i=0;i<width;i++){
        let v=0;
        for(let k=0;k<5;k++)v=2*v+inverse[5*i+k];
        raw.push(v);
      }
    }
    if(Array.from({length:width},(_,i)=>new Set(raw.filter((_,j)=>j%width===i)).size)
      .every(n=>n<=29))break;
  }
  const maps=Array.from({length:width},(_,i)=>{
    const seen=[...new Set(raw.filter((_,j)=>j%width===i))];
    const more=shuffle(Array.from({length:32},(_,k)=>k).filter(k=>!seen.includes(k)));
    return shuffle([...seen,...more.slice(0,29-seen.length)]);
  });
  const encoded=raw.map((x,i)=>maps[i%width].indexOf(x));
  assert(encoded.every(x=>x>=0));
  let recovered='';
  for(let off=0;off<encoded.length;off+=width){
    const bits=[];
    for(let i=0;i<width;i++)for(let k=4;k>=0;k--)
      bits.push((maps[i][encoded[off+i]]>>>k)&1);
    const output=order.map(i=>bits[i]);
    for(let i=0;i<5;i++){
      let v=0;
      for(let j=0;j<width;j++)v=2*v+output[i*width+j];
      recovered+=String.fromCharCode(v);
    }
  }
  assert.equal(recovered,plain);
  const forbidden=width===7?0b001:1;
  const k=width===7?3:1;
  let forbiddenOccurrences=0;
  for(let i=0;i<recovered.length;i++)
    if((recovered.charCodeAt(i) >>> (width-k))===forbidden)forbiddenOccurrences++;
  assert.equal(forbiddenOccurrences,0);
  // On a real valid plant, the actual output high-bit coordinates yield
  // an absent pattern.  Show that the capacity certificate cannot assert
  // the opposite at those coordinates.
  const high=order.slice(0,k).map(i=>({lane:Math.floor(i/5),bit:4-i%5}));
  let controlGate;
  if(width===8){
    const hist=phaseHistogram(encoded,8)[high[0].lane];
    controlGate=low(hist,13);
    assert.equal(controlGate,0);
  }else{
    const lanes=[...new Set(high.map(x=>x.lane))].sort((a,b)=>a-b);
    if(lanes.length===3){
      const t=tripleCertificate(encoded,lanes[0],lanes[1]-lanes[0],lanes[2]-lanes[1]);
      controlGate=t.failures;
      assert(controlGate>0);
    }else if(lanes.length===2){
      const M=Array.from({length:N},()=>Array(N).fill(0));
      const d=lanes[1]-lanes[0];
      for(let i=7+lanes[0];i+d<encoded.length-7;i+=7)
        M[encoded[i]][encoded[i+d]]++;
      const n=high.filter(x=>x.lane===lanes[0]).length;
      controlGate=lowerRectangle(M,n===2?5:13,n===2?13:5);
      assert.equal(controlGate,0);
    }else{
      controlGate=Math.min(...phaseHistogram(encoded,7)[lanes[0]]);
      assert.equal(controlGate,0);
    }
  }
  return {width,attempts,characters:plain.length,carrierRunes:encoded.length,
    highBitLanes:high.map(x=>x.lane),forbiddenOccurrences,controlGate};
}
const controls=[plant(7),plant(8)];
console.log(JSON.stringify({
  source:'canonical LP2 physical p0..55; continuous rune tape; interior margin',
  runes:tape.length,smallRectangleControls:{positive,negative},
  minSingle7,minSamePair,min513,min135,min1313,minEight,
  minimumControlChars7:5*Math.min(minSamePair,min1313),
  minimumHighBitOneChars8:5*minEight,
  tripleCases:triples.length,tripleTests:triples.reduce((a,x)=>a+x.tests,0),
  tripleNodes:triples.reduce((a,x)=>a+x.nodes,0),
  tripleFailures:triples.reduce((a,x)=>a+x.failures,0),
  controls,rng,triples,pairs
},null,2));
