'use strict';
/**
 * Original source-only Parable GP-prime-ordinal -> p50 col-major
 * byte%29 -> base29 3301 exact cross-artifact route.
 * This is an original-byte mathematical alignment, not decoded ciphertext
 * and not proof that the creator intended this choice of table orientation.
 * Run: node sims/parable_prime_ordinal_grid3301_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row=>row.length===8));
const source=read('resources/lp2-transcription.txt').split('%');
assert.equal(source.length,57);
const weight=new Map(corpus.runes.map((v,i)=>[v,corpus.prime[i]]));
const clauses=source[56].split('.').map(clause=>[...clause].filter(c=>weight.has(c)))
 .filter(clause=>clause.length);
const sums=clauses.map(clause=>clause.reduce((s,c)=>s+weight.get(c),0));
assert.deepEqual(sums,[449,1259,1031,1229]);
const n=sums.slice(1).reduce((a,b)=>a*b,1);
assert.equal(n,1595277641);
function primeOrdinal(prime){
 let rank=0;
 for(let x=2;x<=prime;x++){
  let isPrime=true;
  for(let d=2;d*d<=x;d++)if(x%d===0){isPrime=false;break;}
  if(isPrime)rank++;
 }
 let isPrime=true;
 for(let d=2;d*d<=prime;d++)if(prime%d===0)isPrime=false;
 assert(isPrime);
 return rank;
}
const ordinals=sums.slice(1).map(primeOrdinal);
assert.deepEqual(ordinals,[205,173,201]);
// Assert the exact original base-60 token, not only normalized bytes.
const base60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(grid.alphabet,base60);
for(let row=0;row<32;row++)for(let col=0;col<8;col++){
 const token=grid.rows[row][col];
 const byte=base60.indexOf(token[0])*60+base60.indexOf(token[1]);
 assert.equal(byte,grid.byte_rows[row][col]);
}
function readTriple(columnMajor,oneBased){
 return ordinals.map(ordinal=>{
  const i=ordinal-(oneBased?1:0);
  const row=columnMajor?i%32:Math.floor(i/8);
  const col=columnMajor?Math.floor(i/32):i%8;
  return {ordinal,row:row+1,col:col+1,token:grid.rows[row][col],
    byte:grid.byte_rows[row][col]};
 });
}
const variants=[];
for(const columnMajor of [false,true])for(const oneBased of [false,true]){
 const entries=readTriple(columnMajor,oneBased);
 const digits=entries.map(e=>e.byte%29);
 const value=digits.reduce((a,b)=>29*a+b,0);
 variants.push({columnMajor,oneBased,entries,digits,value});
}
const hit=variants.filter(v=>v.value===3301);
assert.equal(hit.length,1);
assert.equal(hit[0].columnMajor,true);
assert.equal(hit[0].oneBased,true);
assert.deepEqual(hit[0].digits,[3,26,24]);
assert.deepEqual(hit[0].entries.map(x=>x.token),['0W','3n','2n']);
assert.deepEqual(hit[0].entries.map(x=>x.byte),[32,229,169]);
// Distinct source reading, not a second independent prediction:
const quotients=hit[0].entries.map(x=>Math.floor(x.byte/29));
assert.deepEqual(quotients,[1,7,5]);
const quotientBase9=quotients.reduce((a,b)=>9*a+b,0);
assert.equal(quotientBase9,149);
console.log(JSON.stringify({claim:'exact original-source cross-artifact 3301 match; intended use unproven',
  parablePrimeWeightSums:sums,threePrimeProduct:n,oneBasedPrimeOrdinals:ordinals,
  testedOrientationAndIndexAlternatives:variants,
  soleMatch:{columnMajor:true,oneBased:true,
    values:hit[0].entries.map(x=>x.byte),
    modulo29Digits:hit[0].digits,base29Value:3301,
    quotientDigits:quotients,quotientBase9Postnoticed:quotientBase9},
  unknownPlaintextRecovered:false},null,2));
