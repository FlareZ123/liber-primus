'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const mod = x => ((x % 29) + 29) % 29;
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 2);
assert.deepEqual(pages.map(p => p.page), [0,1,2]);
assert.deepEqual(pages.map(p => p.indices.length), [262,266,201]);
const C = pages.flatMap(p => p.indices);
assert.equal(C.length,729);
const header = C.slice(0,13);
assert.deepEqual(header,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const order = [8,0,1,9,2,3,10,4,5,11,6,7,12];
const K = order.map(i => header[i]);
assert.deepEqual(K,[15,15,8,26,18,3,18,6,19,21,27,0,5]);
function primes(n){const a=[];for(let x=2;a.length<n;x++){let q=true;for(let d=2;d*d<=x;d++)if(x%d===0){q=false;break;}if(q)a.push(x);}return a;}
const ps=primes(730);
function delta(c){let prev=mod(-ps[0]);return c.map((v,i)=>{const s=mod(v-ps[i+1]),d=mod(s-prev);prev=s;return d;});}
function forward(d){let prev=mod(-ps[0]);return d.map((v,i)=>{prev=mod(prev+v);return mod(prev+ps[i+1]);});}
function second(d){return d.map((v,i)=>i?mod(v-d[i-1]):v);}
function undoSecond(e){const d=[];for(let i=0;i<e.length;i++)d.push(i?mod(d[i-1]+e[i]):e[i]);return d;}
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const D=delta(C), E=second(D), p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(C.slice(1).filter((v,i)=>v===C[i]).length,4);
assert.equal(D.slice(1).filter((v,i)=>v===D[i]).length,40);
assert.equal(E.filter(v=>v===0).length,40);
const variants=[];
for(const [name,tape] of [['D',D],['E',E]]) for(const start of [0,13]) for(const sign of [-1,1]){
  const plain=tape.slice(start).map((v,i)=>mod(v+sign*K[i%13]));
  const restored=tape.slice();
  plain.forEach((v,i)=>{restored[start+i]=mod(v-sign*K[i%13]);});
  assert.deepEqual(restored,tape);
  assert.deepEqual(forward(name==='D'?restored:undoSecond(restored)),C);
  const plant=Array.from({length:plain.length},(_,i)=>p57[i%p57.length]);
  const plantTape=tape.slice(0,start).concat(plant.map((v,i)=>mod(v-sign*K[i%13])));
  const plantD=name==='D'?plantTape:undoSecond(plantTape);
  const plantedC=forward(plantD);
  const decodedD=delta(plantedC);
  const decodedTape=name==='D'?decodedD:second(decodedD);
  assert.deepEqual(decodedTape.slice(start).map((v,i)=>mod(v+sign*K[i%13])),plant);
  variants.push({register:name,start,sign,n:plain.length,ioc:ioc(plain),first40:plain.slice(0,40).map(x=>corpus.translit[x]).join(' ')});
}
console.log(JSON.stringify({
  page_lengths:pages.map(p=>p.indices.length),
  original_729_sha256:crypto.createHash('sha256').update(Buffer.from(C)).digest('hex'),
  header:header.map(x=>corpus.translit[x]).join(' '),
  key:K.map(x=>corpus.translit[x]).join(' '),
  key_indices:K,
  D_ioc:ioc(D),E_ioc:ioc(E),uniform_ioc:1/29,p57_ioc:ioc(p57),
  original_doublets:4,D_doublets:40,E_zeros:40,variants
},null,2));
