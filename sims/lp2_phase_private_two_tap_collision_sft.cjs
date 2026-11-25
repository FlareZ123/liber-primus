'use strict';
const fs=require('node:fs'),path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function encode(gp,s){const out=[];const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function experiment(orig,docs){
const n=orig.length,rows=[];
for(const q of [8,13,29,76,180,256])for(const lag of [[1,2],[5,6]]){
const m=lag[1],groups=Array.from({length:q},()=>[]);for(let i=m;i<n;i++)groups[i%q].push([orig[i],orig[i-lag[0]],orig[i-lag[1]]]);
let max=0,den=0;const arg=[];for(const g of groups){let best=-1,ab;const h=new Uint16Array(29);for(let a=0;a<29;a++)for(let b=0;b<29;b++){h.fill(0);for(const [c,x,y] of g)h[(c-a*x-b*y+1624)%29]++;let s=0;for(const v of h)s+=v*(v-1);if(s>best){best=s;ab=[a,b]}}max+=best;den+=g.length*(g.length-1);arg.push(ab)}
// Grant all initial m values freely: every ordered pair involving initial position may match within its phase.
const fullDen=Array.from({length:q},(_,t)=>Math.floor((n+q-1-t)/q)).reduce((s,v)=>s+v*(v-1),0);
const cap=max+fullDen-den;
const controls=docs.map(d=>{const h=Array.from({length:q},()=>new Uint32Array(29));let s=0;for(let i=0;i<n;i++){const b=h[i%q],v=d[i];s+=2*b[v]++}let min=s,max=s,pass=s<=cap?1:0;for(let j=n;j<d.length;j++){const a=h[(j-n)%q],u=d[j-n];s-=2*--a[u];const b=h[j%q],v=d[j];s+=2*b[v]++;min=Math.min(min,s);max=Math.max(max,s);if(s<=cap)pass++}return {min,max,pass,windows:d.length-n+1}});
rows.push({q,lag,cap,fullDen,ratio:cap/fullDen,controls,arg});}
return rows}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));const docs=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>encode(gp,read(p)));const orig=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);console.log(JSON.stringify(experiment(orig,docs),null,2));
