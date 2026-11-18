'use strict';
/** Issue #1507 source-only reproduction. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const t = fs.readFileSync(path.join(root,'resources','liber-primus','lp2-transcription.txt'),'utf8');
const c = JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const parts=t.split(/^%$/m); assert.equal(parts.length,57);
/** @param {number} p */
function body(p){return parts[p<50?p:p-1];}
/** @param {number} p */
function meta(p){
  const b=body(p), ms=[...b.matchAll(/[ᚠ-ᛡ]+/gu)];
  const words=ms.map((m,i)=>{const x=b.slice(0,m.index),s=[...x].filter(r=>c.runes.includes(r)).length,l=[...m[0]].length;return {i:i+1,s,e:s+l-1,l,line:1+(x.match(/\//g)||[]).length,r:m[0]};});
  let q=0; const lines=[]; for(const [i,x] of b.split('/\n').entries()){const l=[...x].filter(r=>c.runes.includes(r)).length;if(l){lines.push({i:i+1,s:q,e:q+l-1});q+=l;}}
  return {r:c.pages[p].runic_count,words,lines};
}
/** @param {string} w */
function sum(w){return [...w].reduce((a,r)=>a+c.prime[c.runes.indexOf(r)],0);}
/** @param {number} p @param {number} x */
function at(p,x){const m=meta(p),w=m.words.find(z=>x>=z.s&&x<=z.e),l=m.lines.find(z=>x>=z.s&&x<=z.e),ri=c.pages[p].indices[x];assert(w&&l);return {tr:c.translit[ri],pageEnd:x===m.r-1,lineStart:x===l.s,lineEnd:x===l.e,wordStart:x===w.s,wordEnd:x===w.e};}
const ws=['ᚳᛉ','ᛞᛄᚢ','ᛒᛖᛁ']; assert.deepEqual(ws.map(sum),[60,129,159]);
const m=[{p:34,s:200,n:60},{p:27,s:28,n:129},{p:27,s:31,n:159}];
assert.deepEqual([27,34].map(p=>[meta(p).r,meta(p).words.length,meta(p).lines.length]),[[234,57,11],[261,71,12]]);
assert.equal(m.every(x=>x.n<=meta(x.p).words.length),false); assert.equal(m.every(x=>x.n<=meta(x.p).lines.length),false);
const a=m.map(x=>x.n-1); assert.deepEqual(a,[59,128,158]); assert.deepEqual(m.map((x,i)=>at(x.p,a[i]).tr),['S','F','EA']);
const f=m.map(x=>x.s+x.n), b=m.map(x=>x.s-x.n); assert.deepEqual(f,[260,157,190]); assert.deepEqual(b,[140,-101,-128]);
assert.equal(m.every((x,i)=>f[i]>=0&&f[i]<meta(x.p).r),true); assert.equal(m.every((x,i)=>b[i]>=0&&b[i]<meta(x.p).r),false);
const z=m.map((x,i)=>at(x.p,f[i])); assert.deepEqual(z.map(x=>x.tr),['P','W','AE']);
assert.deepEqual(z.map(x=>[x.pageEnd,x.lineStart,x.lineEnd,x.wordStart,x.wordEnd]),[[true,false,true,false,true],[false,false,false,true,false],[false,true,false,true,false]]);
console.log('A1: S/F/EA; B1 unique forward: P/W/AE; no shared boundary class.');
