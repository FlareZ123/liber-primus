"use strict";
const fs=require("node:fs");
function buildDecoder(solved,corpus){
const Q=29,{runes,translit}=corpus,mod=x=>(x+Q)%Q;
const parse=s=>Array.from(s).map(x=>runes.indexOf(x)).filter(x=>x>=0);
const controls=solved.sections.map(s=>({name:s.name,p:parse(s.source_text)}));
const u=new Uint32Array(Q),b=new Uint32Array(Q*Q),t=new Uint32Array(Q**3),bc=new Uint32Array(Q),tc=new Uint32Array(Q*Q);let total=0;
for(const {p} of controls.slice(0,5))for(let i=0;i<p.length;i++){u[p[i]]++;total++;if(i){b[p[i-1]*Q+p[i]]++;bc[p[i-1]]++;}if(i>1){t[(p[i-2]*Q+p[i-1])*Q+p[i]]++;tc[p[i-2]*Q+p[i-1]]++;}}
const ll=new Float64Array(30*30*29);
for(let a=0;a<30;a++)for(let z=0;z<30;z++)for(let p=0;p<29;p++){let prob=(u[p]+.5)/(total+14.5);if(z<29)prob=(b[z*29+p]+10*prob)/(bc[z]+10);if(a<29&&z<29){const x=a*29+z;prob=(t[x*29+p]+10*prob)/(tc[x]+10);}ll[(a*30+z)*29+p]=Math.log(prob);}
const score=p=>p.reduce((s,x,i)=>s+ll[((p[i-2]??29)*30+(p[i-1]??29))*29+x],0)/p.length;
function inverse(c,key,supp,extra){
 const q=key.length,logd=Math.log(supp),logkeep=Math.log1p(-supp),id=(s,a,b)=>(s*30+a)*30+b;
 const images=Array.from({length:q},(_,s)=>Array.from({length:29},(_,c)=>{let out=[];if(c===0)out.push([0,s]);let p=mod(c-key[s]);if(p!==0)out.push([p,s+1]);return out;}));
 let frontier=new Map();
 frontier.set(id(0,29,29),{s:0,a:29,b:29,v:0,p:null,prev:null,h:false,start:0});
 let maxStates=1,steps=0;
 function transition(n,p,s,h,cost){return {s,a:n.b,b:p,v:n.v+ll[(n.a*30+n.b)*29+p]+cost,p,prev:n,h,start:n.start};}
 function insert(map,n){const k=id(n.s,n.a,n.b),old=map.get(k);if(old&&old.v>=n.v-1e-12)return false;map.set(k,n);return true;}
 function push(heap,n){let i=heap.length;heap.push(n);while(i){let p=(i-1)>>1;if(heap[p].v>=n.v)break;heap[i]=heap[p];i=p;}heap[i]=n;}
 function pop(heap){let top=heap[0],n=heap.pop();if(heap.length){let i=0;for(;;){let l=i*2+1;if(l>=heap.length)break;let r=l+1,j=r<heap.length&&heap[r].v>heap[l].v?r:l;if(heap[j].v<=n.v)break;heap[i]=heap[j];i=j;}heap[i]=n;}return top;}
 for(let i=0;i<c.length;i++){
  const last=c[i-1];
  if(i&&supp>0){const heap=[];for(const n of frontier.values())push(heap,n);
   while(heap.length){const n=pop(heap);if(frontier.get(id(n.s,n.a,n.b))!==n)continue;
    for(const [p,s] of images[n.s][last]){if(s>=q||s>i+extra)continue;const z=transition(n,p,s,true,logd);if(insert(frontier,z))push(heap,z);steps++;}
   }
  }
  maxStates=Math.max(maxStates,frontier.size);
  const out=new Map();for(const n of frontier.values())for(const [p,s] of images[n.s][c[i]]){if(s>=q||s>i+1+extra)continue;const z=transition(n,p,s,false,i&&last===c[i]?logkeep:0);insert(out,z);steps++;}
  frontier=out;if(!frontier.size)return {noPathAt:i,maxStates,steps};
 }
 let best=null;for(const n of frontier.values())if(!best||n.v>best.v)best=n;
 const path=[];for(let n=best;n.prev;n=n.prev)path.push({p:n.p,h:n.h});path.reverse();
 let s=best.start,last=null,emit=[],legal=true;
 for(const {p,h} of path){const x=p===0?0:mod(p+key[s]);if(p!==0)s=s+1;if(h){if(x!==last)legal=false;}else{emit.push(x);last=x;}}
 if(!legal||emit.length!==c.length||emit.some((x,i)=>x!==c[i]))throw Error("invalid replay");
 const p=path.map(x=>x.p);
 return {p,hidden:path.filter(x=>x.h).length,start:best.start,end:best.s,v:best.v/c.length,lm:score(p),maxStates,steps,preview:p.slice(0,110).map(x=>translit[x]).join("")};
}
return {inverse,controls,score,mod};
}

function experiment(solved,corpus){
const {inverse,controls,mod}=buildDecoder(solved,corpus);
const primes=[];for(let i=2;primes.length<1500;i++){if(primes.every(p=>p*p>i||i%p))primes.push(i);}
const key=primes.map(p=>(p-1)%29), supp=.81;
let seed=0x3301;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32;}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const z=[i+1];for(let j=0;j<b.length;j++)z.push(Math.min(d[j]+(a[i]!==b[j]),d[j+1]+1,z[j]+1));d=z;}return d[b.length];}
function encrypt(p,prob){let s=0,last=null,c=[],lastIndex=-1;for(let i=0;i<p.length;i++){const x=p[i]===0?0:mod(p[i]+key[s++]);if(x===last&&rand()<prob)continue;c.push(x);last=x;lastIndex=i;}return {c,p:p.slice(0,lastIndex+1),s};}
const control=controls.find(x=>x.name==="p56_an_end"),actual=corpus.pages[56].indices;
const enc=encrypt(control.p,0);
if(enc.s!==84||enc.c.some((x,i)=>x!==actual[i])||enc.c.length!==actual.length)throw Error("p56 replay");
const genuine=inverse(actual,key,0,0);
const plants=controls.slice(5).map(({name,p})=>{const e=encrypt(p,supp),r=inverse(e.c,key,supp,Math.ceil(e.c.length*.25));return {name,n:e.p.length,observed:e.c.length,actualHidden:e.p.length-e.c.length,edit:edit(e.p,r.p),...r,p:undefined};});
const originals={};for(const [name,c] of Object.entries({opening:corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13),terminal:corpus.pages.slice(54,56).flatMap(x=>x.indices)})){const r=inverse(c,key,supp,Math.ceil(c.length*.25));originals[name]={n:c.length,...r,p:undefined};}
return {genuine:{edit:edit(genuine.p,control.p),...genuine,p:undefined},plants,originals};}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"))),null,2));
module.exports={experiment};
