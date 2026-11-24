'use strict';
/** Original GF841 exponent-feedback pair decoder; 2013 BASE29 field H. */
const fs=require('node:fs'),path=require('node:path');
function experiment(g,native,bodyMode=false){
 const mod=(v,q=29)=>((v%q)+q)%q, pack=(a,b)=>a+29*b;
 const mul=(x,y)=>{const a=x%29,b=x/29|0,c=y%29,d=y/29|0;return pack(mod(a*c+18*b*d),mod(a*d+b*c+11*b*d));};
 const pow=[1],log=new Int16Array(841).fill(-1);
 for(let i=1;i<840;i++)pow.push(mul(pow[i-1],29));
 if(new Set(pow).size!==840||mul(pow[839],29)!==1)throw Error("not primitive");
 pow.forEach((v,i)=>log[v]=i);
 const keylog=x=>x===0?0:log[x];
 const pairs=a=>{if(a.length%2)throw Error("odd input");return Array.from({length:a.length/2},(_,i)=>pack(a[2*i],a[2*i+1]));};
 const unpack=a=>a.flatMap(x=>[x%29,x/29|0]);
 const encode=(p,e,k,prev=1)=>p.map(x=>{const y=mul(x,pow[mod(k+e*keylog(prev),840)]);prev=y;return y;});
 const decode=(c,e,k,prev=1)=>c.map(x=>{const y=mul(x,pow[mod(-k-e*keylog(prev),840)]);prev=x;return y;});
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const ioc=(a,q)=>{const h=new Uint32Array(q);for(const x of a)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));};
 const id=new Map(g.runes.map((v,i)=>[v,i]));
 const sections=native.sections.map(s=>[...s.source_text].filter(x=>id.has(x)).map(x=>id.get(x)));
 const tr=sections.slice(0,4).flat(), te=sections.slice(4).flat();
 const training=pairs(tr.slice(0,tr.length-tr.length%2)), test=pairs(te.slice(0,te.length-te.length%2));
 const counts=new Uint32Array(841), m=new Uint32Array(29);for(const p of training){counts[p]++;m[p%29]++;m[p/29|0]++;}
 const score=Array.from({length:841},(_,x)=>Math.log((counts[x]+20*(m[x%29]+1)*(m[x/29|0]+1)/(2*training.length+29)**2+0.02)/(training.length+20+841*.02)));
 const pairScore=a=>a.reduce((s,x)=>s+score[x],0)/a.length;
 const scan=(c,prev=1)=>{
   const exps=[];
   for(let e=0;e<840;e++){const h=new Uint32Array(841);let s=prev;for(const x of c){const y=x===0?840:mod(log[x]-e*keylog(s),840);h[y]++;s=x;}const n=h.reduce((a,v)=>a+v*(v-1),0);exps.push({e,collisions:n,h});}
   exps.sort((a,b)=>b.collisions-a.collisions||a.e-b.e);
   let best=null;
   for(const {e,h} of exps.slice(0,32)){
     const nz=[];for(let j=0;j<840;j++)if(h[j])nz.push([j,h[j]]);
     for(let k=0;k<840;k++){
       let s=h[840]*score[0];for(const [j,v] of nz)s+=v*score[pow[(j-k+840)%840]];
       if(!best||s>best.sum)best={e,k,sum:s};
     }
   }
   const output=decode(c,best.e,best.k,prev);
   if(!equal(c,encode(output,best.e,best.k,prev)))throw Error("replay failure");
   return {best:{e:best.e,k:best.k,meanLog:best.sum/c.length},maxPairIoC:exps[0].collisions/(c.length*(c.length-1)),outputPairIoC:ioc(output,841),outputRuneIoC:ioc(unpack(output),29),head:unpack(output).slice(0,90).map(x=>g.translit[x]).join(""),topExponent:exps[0].e,top32:exps.slice(0,32).map(x=>x.e)};
 };
 const tests=[];
 for(const [e,k] of [[17,237],[331,103],[839,56]]){
   const split=500, c=encode(test,e,k),a=scan(c.slice(0,split)),held=decode(c.slice(split),a.best.e,a.best.k,c[split-1]);
   tests.push({key:{e,k},recovered:a.best,heldoutExact:equal(held,test.slice(split)),nativeTrainPairIoC:ioc(test.slice(0,split),841),maxPairIoC:a.maxPairIoC,exponentInTop32:a.top32.includes(e)});
 }
 const src=(a,b)=>g.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
 const body=src(33,39).slice(91,-121);if(body.length!==1468)throw Error('source body size');const c=bodyMode?pairs(body.slice(0,734)):pairs(src(33,39)),h=bodyMode?pairs(body.slice(734)):pairs(src(40,53));if(c.length!==(bodyMode?367:840)||h.length!==(bodyMode?367:1504))throw Error('register length');
 const a=scan(c), held=decode(h,a.best.e,a.best.k,c.at(-1));
 if(!equal(h,encode(held,a.best.e,a.best.k,c.at(-1))))throw Error("holdout replay");
 return {trainingPairs:training.length,controlPairs:test.length,tests,original:{...a,rawPairIoC:ioc(c,841),holdout:{meanLog:pairScore(held),pairIoC:ioc(held,841),runeIoC:ioc(unpack(held),29),head:unpack(held).slice(0,90).map(x=>g.translit[x]).join("")}},native:{trainingMeanLog:pairScore(training),testMeanLog:pairScore(test),testRuneIoC:ioc(unpack(test),29),testPairIoC:ioc(test,841)}};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const g=read('resources/liber-primus/lp2-corpus.json'),n=read('resources/external/relikd-solved-gp29-native-v1.json');
/** Finite source-native control windows; each window keeps its own pair alignment. */
function pairWindows(n,runes){
 const ix=new Map(n.runes.map((x,i)=>[x,i]));
 const data=n.sections.flatMap(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)));
 const k=runes/2, count=data.length-runes+1;let min=Infinity,max=0;
 for(let j=0;j<count;j++){
  const h=new Uint16Array(841);
  for(let i=0;i<k;i++)h[data[j+2*i]+29*data[j+2*i+1]]++;
  const v=h.reduce((s,x)=>s+x*(x-1),0)/(k*(k-1));
  min=Math.min(min,v);max=Math.max(max,v);
 }
 return {count,min,max};
}
console.log(JSON.stringify({physicalSpan:experiment(g,n),exactBody:experiment(g,n,true),native734RuneWindows:pairWindows(n,734),native1680RuneWindows:pairWindows(n,1680)},null,2));
