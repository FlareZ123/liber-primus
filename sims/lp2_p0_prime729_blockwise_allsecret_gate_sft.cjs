"use strict";
/** GP29 prime729 block-by-block arbitrary-key substitution rejection.
 * Native original ciphertext vs solved LP1 controls; Windows Node22 CJS SFT.
 * The source crib EPIPHANY SEEKS and 13-block interpretation are hypotheses.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/liber-primus/lp1-plaintext-reference.txt");
const seed=[26,24,8,19,27,24,18,3,0,8,0,16,19];
const lengths=seed.map(i=>data.prime[i]),original=data.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(data.pages.slice(0,3).map(p=>p.runic_count),[262,266,201]);
assert.equal(lengths.reduce((a,b)=>a+b,0),729);
const parts=text.split(/### \d+\s*\n/u);
const tokens=data.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]} */
function encode(raw){
 const words=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C").replaceAll("Q","C").replaceAll("Z","S").match(/[A-Z]+/gu)||[];
 const out=[];
 for(const word of words)for(let i=0;i<word.length;){
  const t=tokens.find(x=>word.startsWith(x.s,i));
  assert.ok(t,"unmappable native word");
  out.push(t.i);i+=t.s.length;
 }
 return out;
}
/** Pair collisions invariant to any independent per-block GP29 permutation.
 * @param {number[]} data @param {number[]} plan
 * @param {number} start @param {boolean} circular
 * @returns {{total:number,byBlock:number[]}}
 */
function score(data,plan,start=0,circular=false){
 let total=0,pos=start;const byBlock=[];
 for(const size of plan){
  const h=Array(29).fill(0);
  for(let j=0;j<size;j++){
   const i=circular?(pos+j)%data.length:pos+j;
   assert.ok(i>=0&&i<data.length);
   const v=data[i];assert.ok(Number.isInteger(v)&&v>=0&&v<29);h[v]++;
  }
  const sum=h.reduce((a,n)=>a+n*(n-1),0);
  byBlock.push(sum);total+=sum;pos+=size;
 }
 return {total,byBlock};
}
const real=score(original,lengths);
assert.deepEqual(real.byBlock,[396,316,22,204,392,362,162,0,0,20,0,106,160]);
assert.equal(real.total,2140);
const phases=[];
for(let i=0;i<729;i++){
 phases.push(score(original,lengths,i,true).total);
 phases.push(score(original,[...lengths].reverse(),i,true).total);
}
assert.deepEqual([Math.min(...phases),Math.max(...phases)],[1944,2196]);
const koan=encode(parts[5]);
assert.equal(koan.length,745);
const pure=Array.from({length:koan.length-728},(_,i)=>score(koan,lengths,i).total);
assert.equal(Math.min(...pure),3762);
const native=encode([2,3,5,6,10,11,12,13,14].map(i=>parts[i]).join(" "));
assert.equal(native.length,2519);
const controls=Array.from({length:native.length-728},(_,i)=>score(native,lengths,i).total).sort((a,b)=>a-b);
assert.deepEqual([controls.length,controls[0],controls[Math.floor(controls.length/2)],controls.at(-1)],[1791,3428,3658,3920]);
assert.ok(Math.max(...phases)<Math.min(...pure,controls[0]));
// 85/85 authentic solved-p56 positive proves digraphs never cross a word.
const p56Text=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
assert.equal(p56Text.length,85);
const prime=[];
for(let n=2;prime.length<85;n++){
 let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}
 if(ok)prime.push(n);
}
const p56Original=data.pages.find(p=>p.page===56).indices;
const recoveredP56=p56Original.map((c,i)=>{
 if(i===56)return 0;
 const x=(c-prime[i-(i>56?1:0)]+1)%29;
 return (x+29)%29;
});
assert.deepEqual(recoveredP56,p56Text);
// Positive with 13 different secret permutation tables and true inverse.
let state=0x330113;
const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
const clear=native.slice(0,729),encrypt=[],decrypt=[],maps=[];
for(let b=0,offset=0;b<13;b++){
 const p=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=next()%(i+1);[p[i],p[j]]=[p[j],p[i]];}
 const inv=Array(29);for(let i=0;i<29;i++)inv[p[i]]=i;
 maps.push(p.join(","));
 for(let j=0;j<lengths[b];j++){const c=p[clear[offset++]];encrypt.push(c);decrypt.push(inv[c]);}
}
assert.equal(new Set(maps).size,13);
assert.deepEqual(decrypt,clear);
assert.equal(score(encrypt,lengths).total,score(clear,lengths).total);
console.log(JSON.stringify({sourcePrimeLength: lengths,originalPairs:real.byBlock,originalTotal:real.total,phaseMin:Math.min(...phases),phaseMax:Math.max(...phases),koanWindows:pure,otherNativeWindowCount:controls.length,otherNativeMin:controls[0],otherNativeMedian:controls[Math.floor(controls.length/2)],otherNativeMax:controls.at(-1),secretTables:maps.length,positiveInverse:decrypt.length,status:"PASS: conditional all-secret block substitution exclusion"},null,2));
