"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),g=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const printedP=c.pages.find(p=>p.page===29).indices,cells=g.rows.flat();
assert.equal(printedP.length,277);assert.equal(cells.length,256);assert.equal(cells[0],"3N");
const mod=x=>((x%29)+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error("inverse");};
const trim=a=>{while(a.length&&a[a.length-1]===0)a.pop();return a;};
function divrem(A,B){const a=trim(A.slice()),b=trim(B.slice()),q=Array(Math.max(0,a.length-b.length+1)).fill(0);while(a.length>=b.length){const k=a.length-b.length,f=mod(a[a.length-1]*inv(b[b.length-1]));q[k]=f;for(let j=0;j<b.length;j++)a[k+j]=mod(a[k+j]-f*b[j]);trim(a);}return{q:trim(q),r:a};}
function gcd(A,B){let a=trim(A.slice()),b=trim(B.slice());while(b.length){const r=divrem(a,b).r;a=b;b=r;}if(!a.length)return[];const k=inv(a[a.length-1]);return a.map(v=>mod(v*k));}
function ioc(a){const f=Array(29).fill(0);for(const v of a)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const translit=a=>a.map(v=>c.translit[v]).join(""),letters=a=>translit(a).replace(/[^A-Z]/g,""),round=x=>Number(x.toFixed(12));
function model(s){const m=new Map();for(let i=0;i<s.length-2;i++){const k=s.slice(i,i+3);m.set(k,(m.get(k)||0)+1);}return{m,n:s.length-2,V:26**3};}
function score(s,M){let z=0;for(let i=0;i<s.length-2;i++)z+=Math.log(((M.m.get(s.slice(i,i+3))||0)+.1)/(M.n+.1*M.V));return z/(s.length-2);}
function assess(a,models){const t=letters(a);return{runes:a.length,ioc:round(ioc(a)),latin:round(score(t,models.latin)),english:round(score(t,models.english)),prefix:t.slice(0,140)};}
const P=printedP.slice().reverse(),base60=cells.map(s=>g.alphabet.indexOf(s[0])*60+g.alphabet.indexOf(s[1]));
const R=trim(base60.map(v=>mod(v)).reverse());
assert.equal(base60[0],203);assert.equal(R.length-1,254);
const common=gcd(P,R);assert.deepEqual(common,[25,10,1]);
const d=divrem(P,R),key=d.q.slice().reverse();assert.equal(key.length,23);assert.equal(d.r.length,254);
assert.deepEqual(key,[27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]);
const latin=read("resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt").split(/\r?\n/).filter(x=>!x.startsWith("#")).join(" ").toUpperCase().replace(/[^A-Z]/g,"");
const english=read("resources/control/shakespeare_first300k.txt").toUpperCase().replace(/[^A-Z]/g,"");
const models={latin:model(latin),english:model(english)};
const p0=c.pages.find(p=>p.page===0).indices,receiver=p0.slice(80,103);
const p0to2=c.pages.filter(p=>p.page>=0&&p.page<=2),body=p0to2.flatMap(p=>p.indices).slice(13);
const pages=c.pages.filter(p=>p.page>=1&&p.page<=55),target=pages.flatMap(p=>p.indices);
assert.equal(receiver.length,23);assert.equal(body.length,716);assert.equal(target.length,12694);
const add=(a,s)=>a.map((v,i)=>mod(v+s*key[i%key.length]));
const reset=s=>pages.flatMap(p=>p.indices.map((v,i)=>mod(v+s*key[i%key.length])));
const transfers=[];
for(const s of [-1,1])transfers.push({sign:s<0?"subtract":"add",p0Receiver:translit(add(receiver,s)),p0Body:assess(add(body,s),models),p1to55Continuous:assess(add(target,s),models),p1to55PageReset:assess(reset(s),models)});
console.log(JSON.stringify({status:"exact shared polynomial gcd; 23-rune quotient key does not decrypt tested targets",convention:"printed first coefficient is highest degree; p50 row-major base60 cells reduced mod29",p50:{cells:cells.length,firstCell:cells[0],firstCellBase60:base60[0],leadingCoefficientMod29:mod(base60[0]),effectiveDegree:R.length-1},p29:{degree:P.length-1},gcdAscending:common,quotient:{degree:d.q.length-1,length:key.length,indices:key,transliteration:translit(key),remainderDegree:d.r.length-1},transfers},null,2));
