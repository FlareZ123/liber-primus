'use strict';

/**
 * Source-legal alternative radix59 interpretation of the original p49-51
 * numerals, with exactly the same zero-fit low-state PRNG necessary conditions.
 * No unknown ciphertext or language scores are used.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {ordered,xorshiftGate,glibc31Matches,lcg8CandidateCount}=
  require('./lp2_p50_weakstate_prng_source_sft.cjs');

function main(){
 const original=JSON.parse(fs.readFileSync(
   path.join(__dirname,'..','resources','liber-primus','lp2-grid-256.json'),'utf8'));
 const alphabet60=original.alphabet;
 assert.equal(alphabet60.length,60);
 const alphabet59=alphabet60.replace('f','');
 assert.equal(alphabet59.length,59);
 const tokens=original.pages.flatMap(p=>p.tokens);
 assert.equal(tokens.length,256);
 const radix=(a,base)=>tokens.map(t=>{
   assert.equal(t.length,2);
   assert.ok(!t.includes('f'));
   const h=a.indexOf(t[0]),l=a.indexOf(t[1]);
   assert.ok(h>=0&&l>=0);
   return base*h+l;
 });
 assert.deepEqual(radix(alphabet60,60),original.bytes);
 const bytes=radix(alphabet59,59);
 assert.ok(bytes.every(v=>v>=0&&v<=255));
 assert.deepEqual(bytes.slice(0,8),[200,227,164,183,96,233,124,180]);
 const rows=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));

 for(const orientation of /** @type {('row'|'column')[]} */ (['row','column'])){
   const b=ordered(rows,orientation);
   const xs=xorshiftGate(b),gl=glibc31Matches(b),lc=lcg8CandidateCount(b);
   console.log(`radix59 ${orientation}: xorshift ${xs.tests} cases, hits=${xs.hits.length}; glibc31/3 compatible=${gl}/225; low8 LCG full-pairs=${lc}`);
   assert.equal(xs.tests,119164);
   assert.deepEqual(xs.hits,[]);
   assert.equal(gl,orientation==='row'?3:2);
   assert.equal(lc,0);
 }
 console.log('Radix59 independent source-token reading excluded for these exact low-state families.');
}
if(require.main===module)main();
module.exports={main};
