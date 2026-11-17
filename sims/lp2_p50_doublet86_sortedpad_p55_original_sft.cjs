"use strict";
/**
 * Literal p50 base60 byte-sorted 86 repeated-rune glyphs as a one-use GP29
 * additive key for the 76-rune original p55 tree page. Exact source input,
 * F-transparent encrypted GP29, and source-native forward positive controls.
 * Node 22 / Windows 11 / CommonJS / no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens=grid.pages.flatMap(p=>p.tokens);
const bytes=tokens.map(t=>grid.alphabet.indexOf(t[0])*60+grid.alphabet.indexOf(t[1]));
assert.equal(tokens.length,256);
assert.deepEqual(tokens.flatMap((x,i)=>x==="00"?[i]:[]),[192,229]);
const events=[];
let global=0;
for(const page of gp.pages.slice(0,56)){
 for(let i=0;i+1<page.indices.length;i++)if(page.indices[i]===page.indices[i+1])
  events.push({rune:page.indices[i],phase:(global+i)%256,global:global+i});
 global+=page.indices.length;
}
assert.equal(global,12956);
assert.equal(events.length,86);
const key=events.slice().sort((a,b)=>bytes[a.phase]-bytes[b.phase]
 ||a.phase-b.phase||a.global-b.global).map(x=>x.rune);
assert.equal(key.slice(0,5).map(i=>gp.translit[i]).join(""),"YOUAX");
const mod=x=>((x%29)+29)%29;
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
 const f=Array(29).fill(0);
 runes.forEach(x=>f[x]++);
 return f.reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}
/** @param {number[]} plain @param {number} sign @returns {number[]} */
function encrypt(plain,sign){
 let clock=0;
 return plain.map(x=>x===0?0:mod(x-sign*key[clock++]));
}
/**
 * Exact authentic transparent-F inverse. Every ciphertext F may be literal
 * (no key advancement) or an encrypted non-F. A decrypted nonliteral F
 * would contradict the solved LP2 rule.
 * @param {number[]} ciphertext @param {number} sign
 */
function decrypt(ciphertext,sign) {
 const fs=ciphertext.flatMap((v,i)=>v===0?[i]:[]);
 const results=[];
 for(let mask=0;mask<2**fs.length;mask++){
  const literal=new Set(fs.filter((_,i)=>(mask&(1<<i))!==0));
  const plain=[];
  let clock=0,valid=true;
  for(let i=0;i<ciphertext.length;i++){
   if(literal.has(i)){plain.push(0);continue;}
   const x=mod(ciphertext[i]+sign*key[clock++]);
   if(x===0){valid=false;break;}
   plain.push(x);
  }
  if(valid){
   assert.deepEqual(encrypt(plain,sign),ciphertext);
   results.push({sign,mask,clock,ioc:ioc(plain),plain});
  }
 }
 return results;
}
const original=gp.pages[55].indices;
assert.equal(original.length,76);
assert.deepEqual(original.flatMap((x,i)=>x===0?[i]:[]),[15,25,41]);
const all=[...decrypt(original,-1),...decrypt(original,1)];
assert.deepEqual(all.map(x=>[x.sign,x.mask,x.clock]),
 [[-1,4,75],[1,1,75],[1,2,75]]);
assert.ok(all.every(x=>x.ioc<0.04));
const clear=gp.pages[57].indices.slice(0,76);
assert.equal(clear.length,76);
for(const sign of [-1,1]){
 const c=encrypt(clear,sign);
 assert.ok(decrypt(c,sign).some(x=>x.plain.every((v,i)=>v===clear[i])));
}
console.log(JSON.stringify({
 source:"untouched original p0-55 doublet events and 32x8 p50 byte table",
 originalEvents:events.length,keyPrefix:key.slice(0,22).map(i=>gp.translit[i]).join(""),
 target:"original 76-rune p55",testedSigns:[-1,1],literalFSites:[15,25,41],
 nativeP57PlantIoC:ioc(clear),
 legalOriginalPaths:all.map(x=>({sign:x.sign,mask:x.mask,clock:x.clock,ioc:x.ioc,
  prefix:x.plain.slice(0,36).map(i=>gp.translit[i]).join("")})),
 sourceNativePlants:"positive full76 recovered under both authentic signs",
 decision:"The natural byte-sorted 86-event one-use pad gives 3 syntactically legal original p55 inversions, all IoC < 0.04 and nonlinguistic. No unknown plaintext or key."
},null,2));