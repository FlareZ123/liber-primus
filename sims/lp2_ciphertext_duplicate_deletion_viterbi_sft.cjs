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
function inverse(c,key,supp){
 const q=key.length,logd=Math.log(supp),logkeep=Math.log1p(-supp),id=(s,a,b)=>(s*30+a)*30+b;
 const images=Array.from({length:q},(_,s)=>Array.from({length:29},(_,c)=>{let out=[];if(c===0)out.push([0,s]);let p=mod(c-key[s]);if(p!==0)out.push([p,(s+1)%q]);return out;}));
 let frontier=new Map();
 for(let s=0;s<q;s++)frontier.set(id(s,29,29),{s,a:29,b:29,v:-Math.log(q),p:null,prev:null,h:false,start:s});
 let maxStates=q,steps=0;
 function transition(n,p,s,h,cost){return {s,a:n.b,b:p,v:n.v+ll[(n.a*30+n.b)*29+p]+cost,p,prev:n,h,start:n.start};}
 function insert(map,n){const k=id(n.s,n.a,n.b),old=map.get(k);if(old&&old.v>=n.v-1e-12)return false;map.set(k,n);return true;}
 function push(heap,n){let i=heap.length;heap.push(n);while(i){let p=(i-1)>>1;if(heap[p].v>=n.v)break;heap[i]=heap[p];i=p;}heap[i]=n;}
 function pop(heap){let top=heap[0],n=heap.pop();if(heap.length){let i=0;for(;;){let l=i*2+1;if(l>=heap.length)break;let r=l+1,j=r<heap.length&&heap[r].v>heap[l].v?r:l;if(heap[j].v<=n.v)break;heap[i]=heap[j];i=j;}heap[i]=n;}return top;}
 for(let i=0;i<c.length;i++){
  const last=c[i-1];
  if(i&&supp>0){const heap=[];for(const n of frontier.values())push(heap,n);
   while(heap.length){const n=pop(heap);if(frontier.get(id(n.s,n.a,n.b))!==n)continue;
    for(const [p,s] of images[n.s][last]){const z=transition(n,p,s,true,logd);if(insert(frontier,z))push(heap,z);steps++;}
   }
  }
  maxStates=Math.max(maxStates,frontier.size);
  const out=new Map();for(const n of frontier.values())for(const [p,s] of images[n.s][c[i]]){const z=transition(n,p,s,false,i&&last===c[i]?logkeep:0);insert(out,z);steps++;}
  frontier=out;if(!frontier.size)return {noPathAt:i,maxStates,steps};
 }
 let best=null;for(const n of frontier.values())if(!best||n.v>best.v)best=n;
 const path=[];for(let n=best;n.prev;n=n.prev)path.push({p:n.p,h:n.h});path.reverse();
 let s=best.start,last=null,emit=[],legal=true;
 for(const {p,h} of path){const x=p===0?0:mod(p+key[s]);if(p!==0)s=(s+1)%q;if(h){if(x!==last)legal=false;}else{emit.push(x);last=x;}}
 if(!legal||emit.length!==c.length||emit.some((x,i)=>x!==c[i]))throw Error("invalid replay");
 const p=path.map(x=>x.p);
 return {p,hidden:path.filter(x=>x.h).length,start:best.start,end:best.s,v:best.v/c.length,lm:score(p),maxStates,steps,preview:p.slice(0,110).map(x=>translit[x]).join("")};
}
return {inverse,controls,score,mod};
}
function experiment(solved,corpus){
const {inverse,controls,score,mod}=buildDecoder(solved,corpus);
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const z=[i+1];for(let j=0;j<b.length;j++)z.push(Math.min(d[j]+(a[i]!==b[j]),d[j+1]+1,z[j]+1));d=z;}return d[b.length];}
let seed=0x3301;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32;}
const keys={WELCOME:[23,10,1,10,9,10,16,26],KOAN:[0,10,4,0,1,19,0,18,4,18,9,0,18]};
const supp=.81,orig={opening:corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13),terminal:corpus.pages.slice(54,56).flatMap(x=>x.indices),full:corpus.pages.slice(0,56).flatMap(x=>x.indices)};
const results={};
for(const [name,key] of Object.entries(keys)){
 const plants=[];
 for(const {name:donor,p:plain} of controls.slice(5)){let phase=3%key.length,last=null,c=[],lastEmitted=-1;for(let i=0;i<plain.length;i++){const p=plain[i],x=p===0?0:mod(p+key[phase]);if(p!==0)phase=(phase+1)%key.length;if(x===last&&rand()<supp)continue;c.push(x);last=x;lastEmitted=i;}
 const p=plain.slice(0,lastEmitted+1),hidden=p.length-c.length;const r=inverse(c,key,supp);plants.push({donor,n:p.length,emitted:c.length,actualHidden:hidden,recoveredHidden:r.hidden,edit:edit(r.p,p),trueLM:score(p),...r,p:undefined});}
 const originals={};for(const [scope,c] of Object.entries(orig)){const r=inverse(c,key,supp);originals[scope]={n:c.length,...r,p:undefined};}
 results[name]={plants,originals};
}
return results;
}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"))),null,2));
module.exports={experiment,buildDecoder};
