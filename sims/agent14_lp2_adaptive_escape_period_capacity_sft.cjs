"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,shas){
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(raw){let s=raw.toUpperCase();let j=s.search(/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(s.indexOf("\n",j)+1);j=s.search(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(0,j);
s=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(const w of s.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("native mapping");a.push(t.i);i+=t.s.length}return Uint8Array.from(a)}
const donors=raw.map(native),pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([l,h])=>pages.filter(p=>p.page>=l&&p.page<=h));
const scopes=[pages,...chapters];
function floor(p,n){const h=new Int32Array(29);for(let i=0;i<n;i++)h[p[i]]++;let min=Infinity;for(let o=0;o+n<=p.length;o++){if(o){h[p[o-1]]--;h[p[o+n-1]]++}let m=0;for(let j=1;j<28;j++)m=Math.max(m,h[j]);min=Math.min(min,m)}return min}
const variants=[];for(const reset of ["page","scope"])for(const clock of ["all","nonrepeat"])for(const rank of ["circular","linear"])variants.push({reset,clock,rank});
function capacity(ps,q,v){const h=new Uint32Array(q*28);let t=0,free=0;for(const {indices:a} of ps){free++;if(v.reset==="page")t=0;for(let i=1;i<a.length;i++){let x=a[i-1],y=a[i];if(x===y){free++;if(v.clock==="all")t++;continue}let z=v.rank==="circular"?(y-x+29)%29-1:y-(y>x?1:0);h[(t%q)*28+z]++;t++}}
let cap=free;for(let i=0;i<q;i++){let a=0,b=0;for(let j=0;j<28;j++){let x=h[i*28+j];if(x>=a){b=a;a=x}else if(x>b)b=x}cap+=a+b}return cap}
const results=scopes.map(ps=>{const n=ps.reduce((s,p)=>s+p.indices.length,0),floors=donors.map(p=>floor(p,n));const caps=Array.from({length:256},(_,i)=>variants.map(v=>capacity(ps,i+1,v)));const maxs=caps.map(a=>Math.max(...a));return {range:[ps[0].page,ps.at(-1).page],n,floors,firstPossible:floors.map(f=>{let j=maxs.findIndex(c=>c>=f);return j<0?null:j+1}),caps}});
const chapterPrivate=Array.from({length:256},(_,i)=>results.slice(1).reduce((s,r)=>s+Math.max(...r.caps[i]),0));return {shas,variants,results,chapterPrivate,chapterPrivateFirstPossible:results[0].floors.map(f=>{let j=chapterPrivate.findIndex(c=>c>=f);return j<0?null:j+1})}}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
