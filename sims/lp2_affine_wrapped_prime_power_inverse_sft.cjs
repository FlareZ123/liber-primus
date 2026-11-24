'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = p => fs.readFileSync(p, 'utf8');
const j = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const idx = new Map(j.runes.map((r,i)=>[r,i]));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections.map(s=>s.source_text.split(/[^ᚠ-ᛠ]+/u).map(w=>[...w].filter(c=>idx.has(c)).map(c=>idx.get(c))).filter(w=>w.length));
/** @type {number[][]} */
const words = [];
let w = [];
for(const x of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%')){
  if(idx.has(x)) w.push(idx.get(x));
  else if(!' %/\n\r\t'.includes(x)&&w.length){words.push(w);w=[]}
}
if(w.length)words.push(w);
const all = words.flat();
assert.deepEqual(all,j.pages.slice(0,56).flatMap(p=>p.indices));
assert.equal(all.length,12956);
assert.equal(words.length,2896);
/** @param {number[][]} ws @returns {number[]} */
function anchors(ws){let at=0,r=[];for(const w of ws){if(w.length===1)r.push(at);at+=w.length}return r}
const aaAll = anchors(words);
assert.equal(aaAll.length,83);
const counts=Array(29).fill(0);
for(const i of aaAll)counts[all[i]]++;
assert.equal(counts.filter(Boolean).length,28);
const classSizes=[12,6,6,2,1,1,1];
const caps=classSizes.map((_,i)=>classSizes.slice(0,i+1).reduce((a,b)=>a+b,0));
const sorted=[...counts].sort((a,b)=>b-a);
const oovLower=caps.map(k=>sorted.slice(k).reduce((a,b)=>a+b,0));
assert.deepEqual(caps,[12,18,24,26,27,28,29]);
assert.deepEqual(oovLower,[33,15,4,2,1,0,0]);
console.log(JSON.stringify({globalClassInvariant:{counts,caps,oovLower}}));

const allowed=[24,10,3,16,9],mod=x=>((x%29)+29)%29;
const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
/** @param {number} x @param {number} e */
function pow(x,e){let r=1;for(;e;e>>=1,x=x*x%29)if(e&1)r=r*x%29;return r}
const primes=[];
for(let p=11;primes.length<6500;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)primes.push(p)}
const powers=Array.from({length:28},(_,e)=>Array.from({length:29},(_,x)=>pow(x,e)));
const expInv=primes.map(p=>Array.from({length:28},(_,e)=>e).find(e=>e*p%28===1));
assert(expInv.every(e=>e!==undefined));
const pre=[],post=[];
for(let a=1;a<29;a++)for(let b=0;b<29;b++){
  const v={a,b,rev:Array.from({length:29},(_,y)=>mod((y-b)*inv[a]))};
  // The sign-related input/output slopes encode the same cipher for every odd exponent.
  if(a<=14)pre.push({...v,mask:allowed.reduce((m,x)=>m|(1<<mod(a*x+b)),0)});
  post.push(v);
}
const pair=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>pre.filter(k=>(k.mask&(1<<a))&&(k.mask&(1<<b)))));
/** @typedef {{s:number,a:number,b:number,d:number,e:number}} Key */
/** @param {number[]} p @param {Key} k */
function enc(p,k){return p.map((x,i)=>mod(k.d*powers[primes[k.s+i]%28][mod(k.a*x+k.b)]+k.e))}
/** @param {number[]} c @param {Key} k */
function dec(c,k){return c.map((x,i)=>mod((powers[expInv[k.s+i]][mod((x-k.e)*inv[k.d])]-k.b)*inv[k.a]))}
/** @param {number[]} c @param {number[]} aa @param {number} cut */
function search(c,aa,cut){
  const fits=[];let tested=0,firstDistinct=0;
  const pos=aa.filter(i=>i<cut);
  assert(pos.length>=2);
  const v=new Uint8Array(pos.length);
  for(let s=0;s<=3300;s++){
    const tables=pos.map(i=>powers[expInv[s+i]]);
    for(const k of post){
      for(let z=0;z<pos.length;z++)v[z]=tables[z][k.rev[c[pos[z]]]];
      let other=1;while(other<v.length&&v[other]===v[0])other++;
      if(other<v.length)firstDistinct++;
      // The degenerate all-identical case retains every compatible single-anchor map.
      const cand=pair[v[0]][v[other<v.length?other:0]];
      for(const p of cand){
        tested++;let yes=true;
        for(let z=1;z<v.length;z++)if(!(p.mask&(1<<v[z]))){yes=false;break}
        if(yes)fits.push({s,a:p.a,b:p.b,d:k.a,e:k.b});
      }
    }
  }
  return {fits,tested,firstDistinct,pos};
}
/** @param {number} exclude */
function lm(exclude){
  const u=Array(29).fill(.5),b=new Float64Array(30*29),t=new Float64Array(900*29);
  for(let k=0;k<native.length;k++)if(k!==exclude){let x=29,y=29;for(const p of native[k].flat()){u[p]++;b[y*29+p]++;t[(x*30+y)*29+p]++;x=y;y=p}}
  const us=u.reduce((a,b)=>a+b),L=new Float64Array(900*29);
  for(let x=0;x<30;x++)for(let y=0;y<30;y++){
    let bs=0,ts=0;for(let p=0;p<29;p++){bs+=b[y*29+p];ts+=t[(x*30+y)*29+p]}
    for(let p=0;p<29;p++){const pb=(b[y*29+p]+3*u[p]/us)/(bs+3);L[(x*30+y)*29+p]=Math.log((t[(x*30+y)*29+p]+5*pb)/(ts+5))}
  }
  return L;
}
/** @param {number[]} p @param {Float64Array} L @param {number} cut */
function score(p,L,cut){let x=29,y=29,total=0,fit=0;for(let i=0;i<p.length;i++){const v=p[i];total+=L[(x*30+y)*29+v];if(i<cut)fit=total;x=y;y=v}return [fit/cut,(total-fit)/(p.length-cut)]}
/** @param {number[]} c @param {number[]} aa @param {number} cut @param {number} exclude @param {number[]|null} p @param {Key|null} k */
function test(c,aa,cut,exclude,p=null,k=null){
  const r=search(c,aa,cut),L=lm(exclude),rank=r.fits.map(key=>{const q=dec(c.slice(0,cut),key);return {key,fit:score(q,L,cut)[0]}}).sort((a,b)=>b.fit-a.fit);
  const winner=rank[0];
  const base={length:c.length,cut,anchors:r.pos.length,tested:r.tested,firstDistinct:r.firstDistinct,fits:r.fits.length};
  if(!winner)return base;
  const q=dec(c,winner.key),sc=score(q,L,cut);
  assert.deepEqual(enc(q,winner.key),c);
  return {...base,planted:k,selected:winner.key,fit:sc[0],held:sc[1],runner:rank[1]?.fit,
    fitExact:p?q.slice(0,cut).filter((x,i)=>x===p[i]).length:null,
    heldExact:p?q.slice(cut).filter((x,i)=>x===p[cut+i]).length:null,
    head:q.slice(0,40).map(x=>j.translit[x]).join(' '),
    tail:q.slice(cut,cut+40).map(x=>j.translit[x]).join(' ')};
}
for(const [i,k]of [[3,{s:137,a:9,b:11,d:7,e:18}],[5,{s:1033,a:13,b:4,d:21,e:8}]]){
  const ws=native[i],p=ws.flat(),c=enc(p,k),cut=Math.floor(p.length*.8),aa=anchors(ws);
  assert(aa.every(i=>allowed.includes(p[i])));
  const r=test(c,aa,cut,i,p,k);
  assert.deepEqual(r.selected,k);assert.equal(r.fitExact,cut);assert.equal(r.heldExact,p.length-cut);
  assert.equal(r.fits,i===3?36:116);
  console.log(JSON.stringify({control:i,...r}));
}
const start=j.pages.slice(0,15).reduce((n,p)=>n+p.indices.length,0);
const end=j.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0);
const cut=j.pages.slice(15,22).reduce((n,p)=>n+p.indices.length,0);
const aa=aaAll.filter(i=>i>=start&&i<end).map(i=>i-start);
const r=test(all.slice(start,end),aa,cut,-1);
assert.equal(r.length,1903);assert.equal(r.cut,1772);assert.equal(r.anchors,18);assert.equal(r.fits,0);
console.log(JSON.stringify({original:'p15-22',...r}));
