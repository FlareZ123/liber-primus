"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(data){
 const c=JSON.parse(data[0]),native=JSON.parse(data[1]),N=29**3;
 const ord=[6,7,8,9,5,0,1,10,4,3,2,11,15,14,13,12], gather=ord.map((_,i)=>ord.indexOf(i));
 const assert=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 const pack=(a,i,rev)=>rev?a[i]+29*a[i+1]+841*a[i+2]:841*a[i]+29*a[i+1]+a[i+2];
 const unpack=(x,rev)=>{const a=[Math.floor(x/841),Math.floor(x/29)%29,x%29];return rev?a.reverse():a};
 const configs=[];
 for(const [dir,p,q] of [["gather",gather,ord],["scatter",ord,gather]])for(const lsb of [false,true]){
  const perm=(x,v)=>{let z=0;for(let j=0;j<16;j++)z|=((x>>(lsb?v[j]:15-v[j]))&1)<<(lsb?j:15-j);return z};
  const direct=Uint32Array.from({length:N},(_,x)=>perm(x,p)),walk=new Uint32Array(N),inv=new Uint32Array(N),hist=Array(19).fill(0);
  for(let x=0;x<N;x++){let y=x,k=0;do{y=perm(y,p);assert(++k<=18,"order")}while(y>=N);walk[x]=y;inv[y]=x;hist[k]++;assert(pop(x)===pop(y),"weight")}
  for(let x=0;x<N;x++){assert(inv[walk[x]]===x,"bijection");let y=walk[x],k=0;do{y=perm(y,q);assert(++k<=18,"inverse order")}while(y>=N);assert(y===x,"inverse first return")}
  configs.push({dir,lsb,direct,walk,inv,hist,legal:Array.from(direct).filter(x=>x<N).length,fixed:Array.from(walk).filter((x,i)=>x===i).length});
 }
 const sections=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,a:[...s.source_text].map(x=>c.runes.indexOf(x)).filter(x=>x>=0)}));
 function lm(secs){const u=new Float64Array(29).fill(1),b=new Float64Array(841),t=new Float64Array(29**3),bs=new Float64Array(29),ts=new Float64Array(841);for(const a of secs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i){b[a[i-1]*29+a[i]]++;bs[a[i-1]]++}if(i>1){const j=a[i-2]*29+a[i-1];t[j*29+a[i]]++;ts[j]++}}const tot=u.reduce((a,b)=>a+b,0);return (a,s=0,e=a.length)=>{let z=0;for(let i=s;i<e;i++){let p=u[a[i]]/tot;if(i>s)p=(b[a[i-1]*29+a[i]]+10*p)/(bs[a[i-1]]+10);if(i>s+1){let j=a[i-2]*29+a[i-1];p=(t[j*29+a[i]]+10*p)/(ts[j]+10)}z+=Math.log(p)}return z/(e-s)}}
 function transform(a,map,rev,phase){const out=a.slice();let bad=0;for(let i=phase;i+2<a.length;i+=3){let y=map[pack(a,i,rev)];if(y>=N){bad++;continue}const v=unpack(y,rev);out.splice(i,3,...v)}return {out,bad}}
 const C=c.pages.slice(15,23).flatMap(p=>p.indices).slice(20),cut=C.length-c.pages[22].indices.length;assert(C.length===1883&&cut===1752,"source framing");
 const score=lm(sections.map(s=>s.a)),original=[],control=[];
 for(const cfg of configs)for(const rev of [false,true])for(let phase=0;phase<3;phase++){
  const d=transform(C,cfg.direct,rev,phase),w=transform(C,cfg.walk,rev,phase);assert(eq(transform(w.out,cfg.inv,rev,phase).out,C),"original replay");
  let trainEnd=cut;while((trainEnd-phase)%3)trainEnd--; // exclude crossing packet from model selection and holdout
  let heldStart=trainEnd===cut?cut:trainEnd+3;
  original.push({dir:cfg.dir,lsb:cfg.lsb,rev,phase,directInvalid:d.bad,trainEnd,heldStart,fit:score(w.out,0,trainEnd),held:score(w.out,heldStart),decoded:w.out});
  for(const s of sections){const dec=transform(transform(s.a,cfg.inv,rev,phase).out,cfg.walk,rev,phase);assert(eq(dec.out,s.a),"native control replay")}
 }
 for(const s of sections){const f=lm(sections.filter(t=>t!==s).map(t=>t.a));control.push({name:s.name,n:s.a.length,plainScore:f(s.a),aggregateRecovered:24*s.a.length})}
 original.sort((a,b)=>b.fit-a.fit);
 // Exact invariant: every 16-position permutation, including first-return cycle walking,
 // preserves the packed integer's Hamming weight. Compare every contiguous donor window
 // at the source packet count, allowing an independent permutation for every packet.
 const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));assert(t,"normalization "+w);out.push(t.i);i+=t.s.length}}return out}
 const donors=[encode(data[2]),encode(data[3])],invariant=[];
 for(const rev of [false,true])for(let phase=0;phase<3;phase++){
  const target=[];for(let i=phase;i+2<C.length;i+=3)target.push(pop(pack(C,i,rev)));
  for(let k=0;k<donors.length;k++){const p=donors[k],w=Array.from({length:p.length-2},(_,i)=>pop(pack(p,i,rev)));let exact=0,best=Infinity,loc=-1;
   for(let i=0;i+target.length*3<=p.length;i++){let dif=0;for(let j=0;j<target.length;j++){dif+=w[i+j*3]!==target[j];if(dif>best)break}if(dif<best){best=dif;loc=i}if(!dif)exact++}
   invariant.push({rev,phase,donor:k,packets:target.length,windows:p.length-target.length*3+1,exact,minMismatches:best,bestStart:loc});
   // Planted weight-preserving encodings pass the exact matcher.
   const plain=p.slice(100,100+target.length*3),enc=transform(plain,configs[0].walk,rev,0).out;
   for(let i=0;i<plain.length;i+=3)assert(pop(pack(plain,i,rev))===pop(pack(enc,i,rev)),"planted weight invariant")
  }
 }
 return {domain:N,configs:configs.map(({dir,lsb,hist,legal,fixed})=>({dir,lsb,hist,legal,fixed})),source:{n:C.length,cut,fitRaw:score(C,0,cut),heldRaw:score(C,cut)},original,control,invariant};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const root=path.resolve(__dirname,'..');
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
