'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const get64 = p => Buffer.from(read(p).replace(/\s/g, ''), 'base64');
const clean = get64('resources/historical/cicada2013-twitter-decoded.png.b64');
const mirror = get64('resources/historical/cicada2013-twitter-outt-mirror.png.b64');
assert.equal(clean.length,15330);
assert.equal(mirror.length,28922);
assert.ok(mirror.subarray(0,clean.length).equals(clean));
const tail = mirror.subarray(clean.length);
const pattern = Buffer.from('33010'.repeat(Math.ceil(Math.ceil(tail.length/3)*4/5)), 'base64');
let cut=0;
while(cut<tail.length && tail[cut]===pattern[cut]) cut++;
assert.equal(cut,13579);
const raw=Array.from(tail.subarray(cut));
const expected=Array.from(pattern.subarray(cut,tail.length));
const delta=raw.map((v,i)=>v^expected[i]);
const hex=a=>Buffer.from(a).toString('hex');
assert.equal(hex(raw),'7101f04fdc61fd247513e235a2');
assert.equal(hex(expected),'7df4d74df7d35d37df4d74df7d');
assert.equal(hex(delta),'0cf527022bb2a013aa5e96eadf');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const all=corpus.pages.slice(0,56).flatMap(p=>p.indices);
const P=corpus.pages[57].indices;
assert.equal(all.length,12956);
assert.equal(P.length,95);
const m=x=>((x%29)+29)%29;
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));};
/** Exact legal phase reachability: C=0 can be a literal F hold or an ordinary non-F encoding. */
function reach(a,k,sign){
  let state=new Set([0]), n=0;
  for(const c of a){
    const next=new Set();
    for(const j of state){
      if(c===0) next.add(j);
      if(m(c-sign*k[j])!==0) next.add((j+1)%k.length);
    }
    if(!next.size) break;
    state=next;n++;
  }
  return {prefix:n,states:[...state]};
}
function enc(p,k,sign,hold){
  let j=0;
  return p.map(x=>{if(hold&&x===0)return 0;const c=m(x+sign*k[j]);j=(j+1)%k.length;return c;});
}
const start=13, holdout=corpus.pages.slice(0,16).reduce((s,p)=>s+p.indices.length,0);
assert.equal(holdout,3762);
const out=[];
for(const [name,v] of Object.entries({raw,delta})){
  const k=v.map(m);
  for(const sign of [1,-1]){
    const q=all.slice(start).map((x,i)=>m(x-sign*k[i%13]));
    assert.ok(q.every((v,i)=>m(v+sign*k[i%13])===all[i+start]));
    const plant=enc(P,k,sign,false);
    assert.ok(plant.every((x,i)=>m(x-sign*k[i%13])===P[i]));
    const hp=enc(P,k,sign,true);
    let j=0;
    assert.ok(P.every((p,i)=>{if(!p)return hp[i]===0;const q=m(hp[i]-sign*k[j]);j=(j+1)%13;return q===p;}));
    assert.equal(reach(hp,k,sign).prefix,95);
    out.push({name,sign,k,ordinary:{p0body:ioc(q.slice(0,249)),all:ioc(q),p16to21:ioc(q.slice(holdout-start,holdout-start+1613)),opening:q.slice(0,35).map(x=>corpus.translit[x]).join(' ')},fhold:reach(all.slice(start),k,sign)});
  }
}
assert.deepEqual(out.map(x=>x.fhold.prefix),[18,72,70,27]);
console.log(JSON.stringify({raw:hex(raw),expected:hex(expected),delta:hex(delta),controlIoc:ioc(P),out},null,2));
