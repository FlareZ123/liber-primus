"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(data,grid,native,...literature){
 const assert=(p,m)=>{if(!p)throw Error(m)},all=data.pages.filter(p=>p.page<56).flatMap(p=>p.indices),bytes=grid.bytes,bit=i=>bytes[(i-1)%256]&1;
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];let offset=0;const chapters=ranges.map(([p,q])=>{let n=data.pages.filter(x=>x.page>=p&&x.page<=q).reduce((s,x)=>s+x.indices.length,0);let r={p,q,n,base:offset,cipher:all.slice(offset,offset+n)};offset+=n;return r;});
 assert(offset===12956&&bytes.length===256,"source");
 const tokens=data.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);function encodeText(text){let out=[];for(let w of text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,"token");out.push(t.i);i+=t.s.length;}}}return out;}
 const donor=native.sections.flatMap(x=>[...x.source_text].map(c=>data.runes.indexOf(c)).filter(x=>x>=0));
 const sources=[{name:"solvedNative",a:donor},{name:"Shakespeare",a:encodeText(literature[0])},{name:"Gibran",a:encodeText(literature[1])},{name:"Emerson",a:encodeText(literature[2])}];
 function env(rows){let h=Array(29).fill(0);for(const row of rows){let a=[...row.values()].sort((a,b)=>b-a);if(a.length>29)return null;a.forEach((v,j)=>h[j]+=v);}return h;}
 const metrics=h=>{const n=h.reduce((a,b)=>a+b),top=h[0]/n,ioc=h.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));return {n,top,ioc}};
 function exact(a,base){const rows=Array.from({length:58},()=>new Map());let escapes=0;for(let i=1;i<a.length;){const s=a[i-1],c=a[i],k=29*bit(base+i)+s,e=c===s;if(e&&i+1>=a.length)return {invalid:"truncated"};const tag=e?29+a[i+1]:c;rows[k].set(tag,(rows[k].get(tag)||0)+1);i+=e?2:1;escapes+=+e;}let h=env(rows);return h?{...metrics(h),h,escapes}: {invalid:"row capacity"};}
 function bounded(a,base,L){const rows=Array.from({length:58},()=>new Map());let prev=-Infinity,R=0;for(let i=1;i<a.length;i++){let s=a[i-1],c=a[i],k=29*bit(base+i)+s;if(i-prev>=L&&c!==s)rows[k].set(c,(rows[k].get(c)||0)+1);if(c===s){prev=i;R++;}}let h=env(rows),F=h.reduce((a,b)=>a+b),nMin=Math.max(F,a.length-1-(L-1)*R),nMax=a.length-1;let top=0,ioc=0;for(let n=nMin;n<=nMax;n++){const a=h.slice();a[0]+=n-F;const m=metrics(a);top=Math.max(top,m.top);ioc=Math.max(ioc,m.ioc);}return {L,F,R,nMin,nMax,top,ioc};}
 function sampleWindows(source,n,fn){let count=0;const a=source.a;if(source.name==="solvedNative"){for(let start=0;start<16;start++){let h=Array(29).fill(0);for(let i=0;i<n;i++)h[a[(start*177+i)%a.length]]++;fn(metrics(h.sort((a,b)=>b-a)));count++;}}else{for(let start=0;start+n<=a.length;start+=Math.floor(n/2)){let h=Array(29).fill(0);for(let i=start;i<start+n;i++)h[a[i]]++;fn(metrics(h.sort((a,b)=>b-a)));count++;}}return count;}
 function control(n){return sources.map(s=>{let minTop=Infinity,minIoc=Infinity;let count=sampleWindows(s,n,m=>{minTop=Math.min(minTop,m.top);minIoc=Math.min(minIoc,m.ioc)});return {name:s.name,count,minTop,minIoc}});}
 const original=chapters.map(ch=>{let x=exact(ch.cipher,ch.base);return {p:ch.p,q:ch.q,base:ch.base,...x,control:x.n?control(x.n):null};});
 const last=chapters[7],variable=Array.from({length:9},(_,j)=>{let x=bounded(last.cipher,last.base,j+2);const controls=[x.nMin,x.nMax].map(n=>({n,groups:control(n)}));return {...x,controls};});
 // Real variable-rate plants with independently permuted input labels in every bit/predecessor row.
 let seed=0x243f6a88;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function perm(){let p=Array.from({length:29},(_,i)=>i);for(let i=28;i;i--){const j=rng()%(i+1);[p[i],p[j]]=[p[j],p[i]];}return p;}
 function plant(p,base,L){const books=Array.from({length:58},perm),code=(s,b,x)=>{const t=books[29*b+s][x];return t<27?[(s+t+1)%29]:t===27?[s,(s+1+b)%29]:[s,...Array.from({length:L-1},(_,j)=>(s+3+b+j)%29)];};const c=[13];for(let x of p)c.push(...code(c.at(-1),bit(base+c.length),x));const z=[];for(let i=1;i<c.length;){let s=c[i-1],b=bit(base+i),opts=Array.from({length:29},(_,x)=>({x,a:code(s,b,x)})).filter(({a})=>a.every((v,j)=>v===c[i+j]));assert(opts.length===1,"prefix");z.push(opts[0].x);i+=opts[0].a.length;}assert(z.length===p.length&&z.every((x,i)=>x===p[i]),"exact recovery");let h=Array(29).fill(0);for(const x of p)h[x]++;let m=metrics(h.sort((a,b)=>b-a)),bound=L===2?exact(c,base):bounded(c,base,L);assert(bound.top>=m.top-1e-14&&bound.ioc>=m.ioc-1e-14,"valid envelope");return {L,n:p.length,cipher:c.length,plain:m,bound:{top:bound.top,ioc:bound.ioc},replay:z.length};}
 const plants=[2,3,4,8].map(L=>plant(donor,last.base,L));
 return {sourceLengths:sources.map(s=>({name:s.name,n:s.a.length})),original,variable,plants};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function rigorousLengthExtension(data,grid,native,...literature){
 const all=data.pages.filter(p=>p.page<56).flatMap(p=>p.indices),base=9640,a=all.slice(base,12648),bytes=grid.bytes,bit=i=>bytes[(i-1)%256]&1;
 const tokens=data.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function enc(text){const out=[];for(const w of text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error("GP token");out.push(t.i);i+=t.s.length;}}}return out;}
 const donor=native.sections.flatMap(x=>[...x.source_text].map(c=>data.runes.indexOf(c)).filter(x=>x>=0));
 const sources=[{name:"solvedNativeCircular",x:donor,wrap:true},...literature.map((t,i)=>({name:["Shakespeare","Gibran","Emerson"][i],x:enc(t),wrap:false}))];
 function minPairs(s,n){const {x,wrap}=s,h=new Int32Array(29);let pairs=0;for(let i=0;i<n;i++){const v=x[i%x.length];pairs+=2*h[v];h[v]++;}let min=pairs,offset=0,windows=wrap?x.length:x.length-n+1;for(let start=1;start<windows;start++){let old=x[(start-1)%x.length],fresh=x[(start+n-1)%x.length];pairs-=2*(--h[old]);pairs+=2*h[fresh];h[fresh]++;if(pairs<min){min=pairs;offset=start;}}return {name:s.name,min,offset,windows};}
 const cache=new Map();function reference(n){if(!cache.has(n)){let m=sources.map(s=>minPairs(s,n));cache.set(n,m);}return cache.get(n);}
 function bound(L){const rows=Array.from({length:58},()=>new Int32Array(29));let prev=-Infinity,R=0,forcedEscapes=0,F=0;
 for(let i=1;i<a.length;i++){let s=a[i-1],c=a[i];if(i-prev>=L){if(c===s)forcedEscapes++;else{rows[29*bit(base+i)+s][c]++;F++;}}if(c===s){prev=i;R++;}}
 const h=new Int32Array(29);for(let row of rows){const counts=[...row].sort((x,y)=>y-x);counts.forEach((v,j)=>h[j]+=v);}
 const nMin=Math.max(F,a.length-1-(L-1)*R),nMax=a.length-1-forcedEscapes;let minGap=Infinity,maxBound=0,minNative=1,witness=null,allLower=true,windows=0;
 for(let n=nMin;n<=nMax;n++){const u=Array.from(h);u[0]+=n-F;const cap=u.reduce((s,v)=>s+v*(v-1),0),ref=reference(n),low=Math.min(...ref.map(v=>v.min)),gap=(low-cap)/(n*(n-1));windows+=ref.reduce((s,v)=>s+v.windows,0);if(gap<minGap){minGap=gap;witness={n,cap,lowest:ref.find(v=>v.min===low),reference:ref}}if(gap<=0)allLower=false;maxBound=Math.max(maxBound,cap/(n*(n-1)));minNative=Math.min(minNative,low/(n*(n-1)));}
 return {L,R,F,forcedEscapes,nMin,nMax,allLower,minGap,maxBound,minNative,windows,witness};}
 return {chapter:[40,53],results:Array.from({length:9},(_,j)=>bound(j+2)),uniqueLengths:cache.size,uniqueReferenceWindows:[...cache.values()].flat().reduce((s,v)=>s+v.windows,0)};
}
const input=[JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")];
console.log(JSON.stringify({chapterExactAndPlants:experiment(...input),allLengthWindows:rigorousLengthExtension(...input)},null,2));
