'use strict';
/** NIST FIPS 197 (2023) 5.2 ordinary AES key-expansion recurrence.
 * Tests original p50 32x8 bytes for natural AES-128/192/256 full schedules.
 * Source-no-key, Windows Node22 read-only SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const tokens=grid.pages.flatMap(x=>x.tokens);
assert.equal(tokens.length,256);
const a60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(a60.length,60);
const alpha59=a60.replace('f','');
function read(radix){
 const alpha=radix===60?a60:alpha59;
 const bytes=tokens.map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
 assert(bytes.every(b=>Number.isInteger(b)&&b>=0&&b<=255));
 if(radix===60)assert.deepEqual(bytes,grid.pages.flatMap(x=>x.bytes));
 return bytes;
}
function order(b,mode){
 if(mode==='row')return b.slice();
 if(mode==='row-rev')return b.slice().reverse();
 if(mode==='col')return Array.from({length:256},(_,i)=>b[(i%32)*8+Math.floor(i/32)]);
 if(mode==='col-rev')return Array.from({length:256},(_,i)=>b[(31-i%32)*8+7-Math.floor(i/32)]);
 throw Error('mode');
}
function check(bytes,nk){
 const count={4:44,6:52,8:60}[nk], nbytes=count*4;
 assert(bytes.length>=nbytes);
 let ordinary=0,failed=0,first=null;
 for(let i=nk;i<count;i++){
   if(i%nk===0||(nk===8&&i%nk===4))continue;
   ordinary++;
   const expected=Array.from({length:4},(_,j)=>bytes[(i-nk)*4+j]^bytes[(i-1)*4+j]);
   const actual=bytes.slice(i*4,i*4+4);
   if(expected.some((b,j)=>b!==actual[j])){
      failed++;
      if(first===null)first={word:i,required:Buffer.from(expected).toString('hex'),actual:Buffer.from(actual).toString('hex')};
   }
 }
 return {ordinary,failed,first};
}
// Necessary-recurrence positive and one-bit-damage negative per AES size.
let controls=0;
for(const nk of [4,6,8]){
 const nwords={4:44,6:52,8:60}[nk];
 const synthetic=Array.from({length:nwords*4},(_,i)=>(i*73+19)%256);
 for(let i=nk;i<nwords;i++){
   if(i%nk===0||(nk===8&&i%nk===4))continue;
   for(let j=0;j<4;j++)synthetic[i*4+j]=synthetic[(i-nk)*4+j]^synthetic[(i-1)*4+j];
 }
 assert.equal(check(synthetic,nk).failed,0);controls++;
 const mutated=synthetic.slice();mutated[4*(nk+1)]^=1;
 assert(check(mutated,nk).failed>0);controls++;
}
const trials=[];
for(const radix of [60,59])for(const mode of ['row','col','row-rev','col-rev']){
 const b=order(read(radix),mode);
 for(const offset of [0,16])for(const nk of [4,6,8]){
   const result=check(b.slice(offset),nk);
   trials.push({radix,mode,offset,aesBits:32*nk,...result});
 }
}
assert.equal(trials.length,48);
assert(trials.every(x=>x.failed>0));
console.log(JSON.stringify({source:'original p50 256-cell numeral panel',
 premise:'Standard AES-128/192/256 complete expanded-key schedule, ordinary-word recurrence',
 sourceConfigurations:trials.length,necessaryIdentitySurvivors:0,
 plantedPositiveNegativeChecks:controls,
 nearest:trials.slice().sort((a,b)=>a.failed-b.failed).slice(0,8),
 limit:'Excludes only 48 natural original byte orientations and prefix/suffix schedules; does not exclude 8 raw AES256 keys or cryptographically transformed schedule.'},null,2));
