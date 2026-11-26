'use strict';
// Run from repository root: node sims/lp2_gp_spelling_channel_calibration_sft.cjs
// Source replay setup reused from lp2_latin_renderer_collision_sft.cjs.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const n=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const a=c.runes,t=c.translit,map=new Map(a.map((x,i)=>[x,i])),back=new Map(t.map((x,i)=>[x,i]));
const tape=s=>[...s].filter(x=>map.has(x)).map(x=>map.get(x));
const groups=s=>s.replace(/[\/\s]/gu,'').match(new RegExp('['+a.join('')+']+','gu'))||[];
const p=read('resources/transcriptions/lp1_wulfic_canonical.txt').trim().split('%');
const q=read('resources/transcriptions/lp2-image-corrected.txt').trim().split('%');
const native=n.sections.map(s=>tape(s.source_text));
const mod=x=>(x%29+29)%29;
const lat=s=>tape(s).map(i=>t[i]).join('');
const encode=(p,k)=>{let j=0;return p.map(x=>x===0?0:mod(x+k[j++%k.length]));};
const key=s=>[...s].map(x=>t.indexOf(x));
const primes=[];for(let i=2;primes.length<85;i++)if(primes.every(p=>i%p))primes.push(i);
const paint=(s,plain)=>{let j=0;const out=[...s].map(x=>map.has(x)?a[plain[j++]]:x).join('');assert.equal(j,plain.length);return out;};
const check=(s,plain,k)=>{assert.deepEqual(encode(plain,k),tape(s));return paint(s,plain);};
const train=[paint(p[0],tape(p[0]).map(x=>28-x)),check(p.slice(1,3).join(''),native[1],key('DIUINITY')),p[3],paint(p.slice(4,8).join(''),tape(p.slice(4,8).join('')).map(x=>mod(2-x))),p.slice(8,12).join(''),check(p.slice(12,14).join(''),native[5],key('FIRFUMFERENFE')),p[14]];
const held=[check(q[55],native[7],primes.map(x=>x-1)),q[56]];
assert.deepEqual(tape(train[0]),native[0]);

const aliases=t.map((x,i)=>[x,...({1:["V"],5:["K"],15:["Z"],21:["ING"],27:["IO"]}[i]||[])]);
const opts=aliases.flatMap((ls,i)=>ls.map(x=>({x,i}))).sort((a,b)=>b.x.length-a.x.length||a.i-b.i);
function parse(s) {
  const memo=new Map();
  function rec(j) {
    if(j===s.length)return [[]];
    if(memo.has(j))return memo.get(j);
    const out=[];
    for(const {x,i} of opts)if(s.startsWith(x,j))for(const z of rec(j+x.length))out.push([i,...z]);
    memo.set(j,out);return out;
  }
  return rec(0);
}
const sum=x=>x.reduce((s,i)=>s+c.prime[i],0);
const ordinal=x=>x.reduce((s,i)=>s+i,0);
const sort=x=>x.slice().sort((a,b)=>a-b).join();
const fmt=x=>x.map(i=>t[i]).join("|");
function row(w,latin,index) {
  const ids=tape(w);latin??=ids.map(i=>t[i]).join("");
  const alternatives=parse(latin);
  assert(alternatives.some(x=>x.join()===ids.join()),"missing actual "+latin);
  const same=alternatives.filter(x=>x.length===ids.length);
  const sameSum=same.filter(x=>sum(x)===sum(ids));
  const min=Math.min(...alternatives.map(x=>x.length));
  return {index,latin,actual:fmt(ids),greedy:alternatives[0].join()===ids.join(),
    count:alternatives.length,same:same.length,sameSum:sameSum.length,shorter:min<ids.length,
    minTies:alternatives.filter(x=>x.length===min).length,
    sameSumAlt:sameSum.filter(x=>x.join()!==ids.join()).map(x=>({
      spelling:fmt(x),sameMultiset:sort(x)===sort(ids),sameOrdinalSum:ordinal(x)===ordinal(ids)
    }))};
}
function summarize(rows) {
  return {groups:rows.length,ambiguous:rows.filter(r=>r.count>1).length,
    sameWidth:rows.filter(r=>r.same>1).length,sameWidthSum:rows.filter(r=>r.sameSum>1).length,
    nonGreedy:rows.filter(r=>!r.greedy).length,shorter:rows.filter(r=>r.shorter).length,
    minimumTies:rows.filter(r=>r.minTies>1).length,
    capacityBits:rows.reduce((s,r)=>s+Math.log2(r.same),0),
    sumConditionedBits:rows.reduce((s,r)=>s+Math.log2(r.sameSum),0)};
}
const from=s=>groups(s).map((w,i)=>row(w,undefined,i));
const historical=read("resources/external/2013-instar-xor-source.md");
const hist=historical.match(/TXXX metadata value `([^`]+)`/)[1].replace(/\\n/g," ").toUpperCase().match(/[A-Z]+/g);
const h57=groups(held[1]).slice(1);
assert.equal(hist.length,h57.length);
const hr=h57.map((w,i)=>row(w,hist[i],i));
const ref=read("resources/liber-primus/lp1-plaintext-reference.txt");
const refwords=ref.split(/^### /m).filter(s=>/^(10|11|12|13)\n/.test(s)).join("\n")
  .replace(/^\d{2}$/gm,"").replace(/\[[^\]]*\]/g,"").match(/[A-Z]+/g)
  .map(w=>w.replace(/QU/g,"CW").replace(/Q/g,"C"));
const l10=groups(train[4]);assert.equal(refwords.length,l10.length);
const lr=l10.map((w,i)=>row(w,refwords[i],i));
const unknown=groups(q.slice(0,55).join("")).map((w,i)=>row(w,undefined,i));
const result={training:summarize(train.flatMap(from)),heldout:summarize(held.flatMap(from)),
 historicalP57:summarize(hr),lp1ReferenceP10to13:summarize(lr),original:summarize(unknown),
 sumWitnesses:unknown.filter(r=>r.sameSum>1).map(r=>({index:r.index,latin:r.latin,actual:r.actual,alternatives:r.sameSumAlt}))};
assert.equal(result.training.groups,694);
assert.equal(result.heldout.groups,45);
for(const r of [result.training,result.heldout,result.historicalP57,result.lp1ReferenceP10to13]){
  assert.equal(r.sameWidth,0);assert.equal(r.nonGreedy,0);assert.equal(r.minimumTies,0);
}
assert.equal(result.original.groups,2896);assert.equal(result.original.sameWidth,230);
assert.equal(result.original.sameWidthSum,11);assert.equal(result.original.sumConditionedBits,11);
assert(result.sumWitnesses.every(w=>w.alternatives.every(a=>a.sameOrdinalSum)));
console.log(JSON.stringify(result,null,2));
