'use strict';
/**
 * Original LP2 pp49-51 base60 table: highest GF29 quotient hotspot.
 * Exploratory source-conditional permutation scan. Node.js 22 CJS SFT.
 * Uses fixed seed; preserves 256 authentic source GF29 remainders,
 * exact high-quotient count, and tests eight window sizes familywise.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} file */
function load(file){return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));}
const table=load('resources/liber-primus/lp2-grid-256.json');
const bytes=table.bytes;
assert.equal(bytes.length,256);
assert.equal(table.byte_count,256);
const hash=crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(hash,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const q=bytes.map(n=>Math.floor(n/29));
const eligible=Array.from({length:256},(_,i)=>i).filter(i=>bytes[i]%29<=23);
const positions=Array.from({length:256},(_,i)=>i).filter(i=>q[i]===8);
assert.equal(eligible.length,193);
assert.deepEqual(positions,[5,9,12,48,56,65,92,115,121,138,140,148,157,158,159,160,166,167,168,170,176,214,227,233,236]);
const widths=[8,12,16,20,24,32,40,64];
/** @param {Uint8Array} bitmask @param {number} width */
function maxWindow(bitmask,width){
 let count=0;
 for(let i=0;i<width;i++)count+=bitmask[i];
 let best=count;
 for(let i=width;i<256;i++){
  count+=bitmask[i]-bitmask[i-width];
  if(count>best)best=count;
 }
 return best;
}
const sourceMask=new Uint8Array(256);
for(const i of positions)sourceMask[i]=1;
const observed=widths.map(w=>maxWindow(sourceMask,w));
assert.deepEqual(observed,[4,7,8,9,9,10,12,14]);
const hotspot=sourceMask.slice(157,177).reduce((s,v)=>s+v,0);
assert.equal(hotspot,9);
/** 32-bit seeded PRNG; only for Monte Carlo. */
let seed=0xA3811F4D;
/** @returns {number} uniform on [0,1), to 32-bit finite resolution */
function random(){
 seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
 return (seed>>>0)/4294967296;
}
const N=200000;
const k=positions.length;
const maxima=widths.map(()=>new Uint8Array(N));
const permutation=new Uint16Array(eligible.length);
const bitmask=new Uint8Array(256);
for(let trial=0;trial<N;trial++){
 for(let j=0;j<eligible.length;j++)permutation[j]=eligible[j];
 bitmask.fill(0);
 for(let j=0;j<k;j++){
  const swap=j+Math.floor(random()*(eligible.length-j));
  const temp=permutation[j];
  permutation[j]=permutation[swap];
  permutation[swap]=temp;
  bitmask[permutation[j]]=1;
 }
 for(let j=0;j<widths.length;j++)maxima[j][trial]=maxWindow(bitmask,widths[j]);
}
const upperTails=widths.map((w,j)=>{
 const freq=new Uint32Array(k+2);
 for(const n of maxima[j])freq[n]++;
 const tail=new Uint32Array(k+2);
 for(let v=k;v>=0;v--)tail[v]=tail[v+1]+freq[v];
 assert.equal(tail[0],N);
 return tail;
});
const sourceTailCounts=observed.map((x,j)=>upperTails[j][x]);
const minSourceTail=Math.min(...sourceTailCounts);
let familywiseHits=0;
for(let i=0;i<N;i++){
 let smallest=N;
 for(let j=0;j<widths.length;j++){
  const tail=upperTails[j][maxima[j][i]];
  if(tail<smallest)smallest=tail;
 }
 if(smallest<=minSourceTail)familywiseHits++;
}
const perWidthP=sourceTailCounts.map(n=>(n+1)/(N+1));
const fwerP=(familywiseHits+1)/(N+1);
assert.ok(perWidthP[3]<0.005);
assert.ok(fwerP<0.01);
const other=load('resources/cicada-hiddenservice-256-candidates.json');
const controls=other.sourceServices.map(source=>{
 const data=source.hex.match(/../g).map(x=>Number.parseInt(x,16));
 assert.equal(data.length,256);
 const mask=Uint8Array.from(data,n=>Number(n>=232));
 return {id:source.id,highestQuotientCount:mask.reduce((s,v)=>s+v,0),
         max20:maxWindow(mask,20)};
});
assert.deepEqual(controls.map(x=>x.max20),[4,6,5]);
console.log(JSON.stringify({
 status:'exploratory local structural lead; no plaintext, key, or opcode recovered',
 source:'original pp49-51 conventional-base60 table, source-GF29 remainders fixed',
 tableSha256:hash,
 highestQuotientQ8Count:k, eligiblePositions:eligible.length,
 hotspot:{startIndex:157,endExclusive:177,count:hotspot,
          originalSourcePages:'global table rows19-22, physical LP2 p50'},
 windowWidths:widths,observedMaxima:observed,scanWindowP:perWidthP,
 multiscaleFamilywiseP:fwerP,draws:N,seed:'0xA3811F4D',
 independent256ByteHistoricalControls:controls,
 caveat:'Exploratory post-selected threshold and window family; this is not a cryptographic key or independently authenticated author mark'
},null,2));
