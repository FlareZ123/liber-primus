'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const bytes=Buffer.from(read('resources/historical/cicada2013-twitter-decoded.png.b64'),'base64');
const all=c.pages.slice(0,56).flatMap(p=>p.indices).slice(13),p=c.pages[57].indices;
assert.equal(bytes.length,15330);assert.equal(all.length,12943);assert.equal(p.length,95);
/** Each position yields the next five key bits, with explicit byte and symbol bit order. */
function makeKey(bl,sl){const bit=[];for(const b of bytes)for(let j=0;j<8;j++)bit.push((b>>(bl?j:7-j))&1);const k=new Uint8Array(bit.length-4);for(let i=0;i<k.length;i++)for(let j=0;j<5;j++)k[i]|=bit[i+j]<<(sl?j:4-j);return k;}
/** Exact latent-F support; no language score, mask selection or beam pruning. */
function reach(a,o,k,h){let js=[o],n=0;for(const v of a){const next=new Set();for(const j of js){if(h&&v===0)next.add(j);if(j<k.length){const x=v^k[j];if(x<29&&(!h||x!==0))next.add(j+5);}}if(!next.size)break;js=[...next];n++;}return n;}
const out=[];
for(const bl of [false,true])for(const sl of [false,true])for(const h of [false,true]){
  const k=makeKey(bl,sl),a=all.slice(0,716);let max=0,best=[],live249=0;
  for(let o=0;o<k.length;o++){const n=reach(a,o,k,h);if(n>=249)live249++;if(n>max){max=n;best=[o];}else if(n===max)best.push(o);}
  let valid=0,plant=null;
  for(let o=0;o<k.length-p.length*5;o++){let j=o,ks=new Set(),q=[];for(const x of p){if(h&&x===0){q.push(0);continue;}ks.add(k[j]);q.push(x^k[j]);j+=5;if(q[q.length-1]>28)break;}if(q.length===p.length&&q[p.length-1]<=28){valid++;if(!plant||ks.size>plant.diversity)plant={o,diversity:ks.size,q};}}
  assert.ok(plant);assert.equal(reach(plant.q,plant.o,k,h),95);let j=plant.o;
  assert.ok(plant.q.every((v,i)=>{const x=p[i];if(h&&x===0)return v===0;return (v^k[(j+=5)-5])===x;}));
  out.push({bl,sl,h,starts:k.length,max,best,live249,control:{valid,o:plant.o,diversity:plant.diversity,reach:95}});
}
assert.deepEqual(out.map(x=>x.max),[158,129,141,134,153,143,152,117]);
assert.ok(out.every(x=>x.live249===0));
assert.deepEqual(out.map(x=>x.control.o),[112910,112233,65997,98521,53184,7563,59006,101241]);
console.log(JSON.stringify(out,null,2));
