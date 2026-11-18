"use strict";
/**
 * LP2 terminal pages 76+85+95=256: exact original p50 32x8 byte table.
 * Test arbitrary secret stationary byte->GP29 key lookup using authentic
 * p56 85-rune known plaintext, preserving one historical literal-F bypass.
 * Four source-shaped table read orders and both position/keyskip clocks.
 * Windows Node22 CommonJS, read only. No optimizers or brute key fitting.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const c=read("resources/liber-primus/lp2-corpus.json");
const g=read("resources/liber-primus/base60-grid.json");
assert.deepEqual([c.pages[55].indices.length,c.pages[56].indices.length,c.pages[57].indices.length],[76,85,95]);
const raw=g.byte_rows.flat();assert.equal(raw.length,256);
const shell=[];
for(let l=0;l<4;l++){for(let j=l;j<8-l;j++)shell.push(l*8+j);for(let i=l+1;i<32-l;i++)shell.push(8*i+7-l);for(let j=6-l;j>=l;j--)shell.push(8*(31-l)+j);for(let i=30-l;i>l;i--)shell.push(8*i+l);}
assert.deepEqual([76,68,60,52],Array.from({length:4},(_,i)=>(shell.slice(0,[0,76,144,204,256][i+1]).length-[0,76,144,204][i])));
assert.equal(new Set(shell).size,256);
const parse=c.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const phrase="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const plaintext=[];
for(const word of phrase.split(" ")){for(let i=0;i<word.length;){const x=parse.find(z=>word.startsWith(z.token,i));assert.ok(x);plaintext.push(x.index);i+=x.token.length;}}
const cipher=c.pages[56].indices;
assert.equal(cipher.length,85);assert.equal(plaintext.length,85);
const transparent=cipher.map((s,i)=>s===0&&plaintext[i]===0?i:-1).filter(i=>i>=0);
assert.deepEqual(transparent,[56]);
const orders={printed:raw,printedReverse:raw.slice().reverse(),peelClockwise:shell.map(i=>raw[i]),peelReverse:shell.slice().reverse().map(i=>raw[i])};
const results=[];
for(const [name,bytes] of Object.entries(orders)){
 for(const skipTransparent of [false,true]){
  const lookup=new Map();
  let observedRepeatedByteEvents=0,conflicting=0,first=null,cursor=76;
  for(let i=0;i<85;i++){
   if(i===56){if(!skipTransparent)cursor++;continue;}
   const byte=bytes[skipTransparent?cursor++:76+i];
   const needed=(cipher[i]-plaintext[i]+29)%29;
   if(lookup.has(byte)){
    observedRepeatedByteEvents++;
    if(lookup.get(byte)!==needed){conflicting++;if(first===null)first=i;}
   } else lookup.set(byte,needed);
  }
  assert.ok(conflicting>0);
  results.push({name,skipTransparent,uniqueKeyBytes:lookup.size,
   repeatedSourceByteEvents:observedRepeatedByteEvents,
   conflictingRequiredGPKeyValues:conflicting,
   firstContradictionAtP56Offset:first,
   p55SlotsInLookup:bytes.slice(0,76).filter(b=>lookup.has(b)).length});
 }
}
assert.equal(results.length,8);
console.log(JSON.stringify({
 source:"original LP2 p55 76 / p56 85 / p57 95 and p50 256 bytes",
 tableRingLengths:[76,68,60,52],
 plaintext:"authentic known solved p56 85 GP29 runes",
 claim:"any one stationary lookup of raw p50 byte to additive GP29 key symbol fails",
 tested:results
},null,2));
console.log("PASS: eight exact original known-text contradictions; no presumed unknown plaintext");