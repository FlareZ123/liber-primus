#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),mod=(x,n)=>((x%n)+n)%n;
const powmod=(a,n,m)=>{let r=1;while(n){if(n&1)r=mod(r*a,m);a=mod(a*a,m);n=Math.floor(n/2)}return r};
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/lp2-transcription.txt"),english=read("resources/control/shakespeare_first300k.txt");
const runeToIndex=new Map(corpus.runes.map((r,i)=>[r,i])),RUNIC=/[\u16A0-\u16FF]/u;
const p27=[...transcription.split("$")[5]].filter(x=>RUNIC.test(x)).map(x=>runeToIndex.get(x));
assert.equal(p27.length,1433);assert.equal(p27[0],19);
const A=x=>mod(31*x+13,1433),starts=Array.from({length:8},(_,c)=>mod(525+powmod(19,c,1433),1433));
assert.deepEqual(starts,[526,544,886,219,443,400,1016,1256]);assert.equal(A(525),525);
const bytes=grid.pages.flatMap(p=>p.bytes),table=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));
assert.equal(bytes.length,256);assert(table.every(r=>r.length===8));
const positions=table.map(row=>row.map((b,c)=>{let x=starts[c];for(let i=0;i<b;i++)x=A(x);return x}));
const keys=positions.map(row=>row.map(x=>p27[x]));
const byPage=new Map(corpus.pages.map(p=>[p.page,p])),pageStarts=[];let total=0;
for(let p=0;p<58;p++){pageStarts[p]=total;total+=byPage.get(p).indices.length}
const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);assert.equal(C.length,12956);
const marks=[];for(const p of ink.pages)for(const m of p.large_punctuation||[])if(m[1]===13)marks.push({page:p.page,offset:m[0],global:pageStarts[p.page]+m[0],color:m[2]});
marks.sort((a,b)=>a.page-b.page||a.offset-b.offset||((a.color==="black"?0:1)-(b.color==="black"?0:1)));
const bounds=[0,...marks.map(m=>m.global),total],lengths=Array.from({length:32},(_,i)=>bounds[i+1]-bounds[i]);
assert.equal(marks.length,31);assert.equal(new Set(marks.map(m=>m.global)).size,29);
assert.equal(lengths.filter(n=>n===0).length,2);assert.equal(bounds[28],C.length);
const orders={natural:[0,1,2,3,4,5,6,7],PATIENCE:[6,5,3,0,2,4,7,1]};
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpEnglish(s){const n=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];
 for(const w of n.match(/[A-Z]+/g)||[]){const q=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t.s,i));if(!t){q.length=0;break}q.push(t.i);i+=t.s.length}out.push(...q)}return out}
const native=gpEnglish(english),train=native.slice(0,100000),held=native.slice(100000,100000+C.length);assert.equal(held.length,C.length);
const tri=new Uint32Array(29**3),ctx=new Uint32Array(29**2);
for(let i=2;i<train.length;i++){const k=train[i-2]*29+train[i-1];tri[k*29+train[i]]++;ctx[k]++}
const score=a=>{let s=0;for(let i=2;i<a.length;i++){const k=a[i-2]*29+a[i-1];s+=Math.log((tri[k*29+a[i]]+.1)/(ctx[k]+2.9))}return s/(a.length-2)};
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
function transform(input,order,dir,enc=false){const out=Array(input.length);for(let f=0;f<28;f++){const key=order.map(c=>keys[f][c]);for(let i=bounds[f];i<bounds[f+1];i++){const k=key[(i-bounds[f])%8],v=input[i];out[i]=enc?(dir==="sub"?mod(v+k,29):dir==="add"?mod(v-k,29):mod(k-v,29)):(dir==="sub"?mod(v-k,29):dir==="add"?mod(v+k,29):mod(k-v,29))}}return out}
const raw={ioc:ioc(C),trigram:score(C)},nativeMetrics={ioc:ioc(held),trigram:score(held)},results=[];
for(const [orderName,order] of Object.entries(orders))for(const dir of ["sub","add","beaufort"]){const d=transform(C,order,dir),r=transform(d,order,dir,true),e=transform(held,order,dir,true),b=transform(e,order,dir);assert.deepEqual(r,C);assert.deepEqual(b,held);results.push({columnOrder:orderName,direction:dir,ioc:ioc(d),trigram:score(d),prefix:d.slice(0,80).map(v=>corpus.translit[v]).join(""),exactOriginalRoundtrip:true,positiveControlExact:true})}
console.log(JSON.stringify({classification:"bounded negative for table-byte-as-affine-step / p27-rune repeating fragment key",source:{p27Length:p27.length,firstRune:p27[0],map:"A(x)=31x+13 mod1433",fixedPoint:525,cosetStarts:starts,tableDimensions:[32,8],markerLayers:marks.length,uniqueOffsets:new Set(marks.map(m=>m.global)).size,emptyFragments:lengths.filter(n=>n===0).length,nonemptyFragments:lengths.filter(n=>n>0).length,unknownFragments:28,positions,keyRuneIndices:keys},raw,nativePositiveControl:nativeMetrics,results},null,2));
