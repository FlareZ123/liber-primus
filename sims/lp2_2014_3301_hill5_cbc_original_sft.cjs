'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const d=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const mod=x=>(x%29+29)%29;
const S=read('resources/cicada2014-openpuff-magic-squares.txt').trim().split(/\r?\n/).slice(0,5).map(l=>l.trim().split(/\s+/).map(Number));
assert(S.every(r=>r.reduce((a,b)=>a+b,0)===3301));
const A=S.map(r=>r.map(mod));
const aug=A.map((r,i)=>[...r,...Array.from({length:5},(_,j)=>+(i===j))]);
let det=1;
for(let i=0;i<5;i++){
 const k=aug.findIndex((r,j)=>j>=i&&r[i]);assert(k>=i);
 if(k!==i){[aug[k],aug[i]]=[aug[i],aug[k]];det=mod(-det)}
 const p=aug[i][i];det=mod(det*p);
 const q=Array.from({length:29},(_,i)=>i).find(x=>mod(x*p)===1);
 aug[i]=aug[i].map(x=>mod(x*q));
 for(let j=0;j<5;j++)if(j!==i){const z=aug[j][i];aug[j]=aug[j].map((x,k)=>mod(x-z*aug[i][k]))}
}
assert.equal(det,10);const I=aug.map(r=>r.slice(5));
const mv=(a,b)=>a.map(r=>mod(r.reduce((s,x,i)=>s+x*b[i],0)));
const blocks=x=>{assert.equal(x.length%5,0);return Array.from({length:x.length/5},(_,i)=>x.slice(5*i,5*i+5))};
function dec(C,prev){const out=[];for(const b of blocks(C)){out.push(...mv(I,b).map((x,i)=>mod(x-prev[i])));prev=b}return out}
function enc(P,prev){const out=[];for(const b of blocks(P)){prev=mv(A,b.map((x,i)=>mod(x+prev[i])));out.push(...prev)}return out}
const stat=x=>{let h=Array(29).fill(0);x.forEach(y=>h[y]++);return {n:x.length,ioc:h.reduce((a,b)=>a+b*(b-1),0)/(x.length*(x.length-1)),adj:x.slice(1).filter((v,i)=>v===x[i]).length}};
const P=native.sections.flatMap(s=>[...s.source_text].filter(x=>d.runes.includes(x)).map(x=>d.runes.indexOf(x)));
for(const [off,n] of [[0,1140],[1140,1675]]){
 const p=P.slice(off,off+n),iv=[3,26,24,13,23];assert.equal(p.length,n);const c=enc(p,iv);assert.deepEqual(dec(c,iv),p);
 console.log({plant:[off,n],plain:stat(p),cipher:stat(c),unchained:stat(blocks(c).flatMap(b=>mv(I,b)))});
}
for(const [i,j,n] of [[3,7,1145],[33,39,1680]]){
 const c=d.pages.slice(i,j+1).flatMap(p=>p.indices);assert.equal(c.length,n);
 const iv=c.slice(0,5),tail=c.slice(5),p=dec(tail,iv);
 assert.deepEqual(enc(p,iv),tail);
 console.log({pages:[i,j],chain:stat(p),unchained:stat(blocks(tail).flatMap(b=>mv(I,b))),indices:p,translit:p.map(x=>d.translit[x]).join(' ')});
}
