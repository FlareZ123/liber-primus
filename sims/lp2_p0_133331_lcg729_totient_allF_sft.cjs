"use strict";
/** Original pp0-2 source-conditional LCG traversal and exact F-mask DP. Node/CommonJS, stdlib only. */
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
function experiment(d,html,ref){
 const assert=(x,s)=>{if(!x)throw Error(s)};
 const a=+html.match(/<title>(\d+)<\/title>/)[1],b=+html.match(/id="(\d+)"/)[1],c=d.pages.filter(p=>p.page<=2).flatMap(p=>p.indices),n=c.length;
 assert(a===133&&b===331&&n===729,"original source");
 const mod=(x,m=29)=>(x%m+m)%m;
 const primes=[];for(let k=2;primes.length<n;k++)if(primes.every(p=>p*p>k||k%p))primes.push(k);
 const shifts=primes.map(p=>mod(p-1));
 const walk=(a,b)=>{const p=[];let x=0;do{p.push(x);x=mod(a*x+b,n)}while(x!==0&&p.length<=n);return p};
 const ioc=p=>{const f=Array(29).fill(0);for(const x of p)f[x]++;return f.reduce((s,k)=>s+k*(k-1),0)/(p.length*(p.length-1))};
 const native=d.pages.find(p=>p.page===57).indices;
 const tokens=d.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function encodeGp(s){const out=[];for(let w of s.match(/[A-Z]+/g)||[]){w=w.replace(/V/g,"U").replace(/K/g,"C").replace(/Q/g,"C");while(w.length){const v=tokens.find(([s])=>w.startsWith(s));assert(v,"GP token "+w);out.push(v[1]);w=w.slice(v[0].length)}}return out}
 const train=ref.split("### 56")[0].split(/\r?\n/).filter(l=>/^[A-Z][A-Z ,;.!?"':\-]+$/.test(l)&&!/\[[^\]]*\]/.test(l)).flatMap(encodeGp);
 assert(train.length===2397,"LP1 train");
 const counts=Array.from({length:29},()=>Array(29).fill(.5)),total=Array(29).fill(14.5);
 for(let i=1;i<train.length;i++){counts[train[i-1]][train[i]]++;total[train[i-1]]++}
 const log=counts.map((row,i)=>row.map(v=>Math.log(v/total[i])));
 const score=p=>p.slice(1).reduce((s,x,i)=>s+log[p[i]][x],0)/(p.length-1);
 const expected=encodeGp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
 const c56=d.pages.find(p=>p.page===56).indices;
 const decode=(C,mask)=>{let k=0;return C.map((v,i)=>mask.has(i)?0:mod(v-shifts[k++]))};
 const encode=(P,mask)=>{let k=0;return P.map((v,i)=>{if(mask.has(i)){assert(v===0,"literal F");return 0}return mod(v+shifts[k++])})};
 const dec56=decode(c56,new Set([56]));assert(dec56.join()===expected.join(),"p56 control");
 function bestMask(C){
  let states=new Map([["0,-1",{key:0,last:-1,sum:0,prev:null,skip:false}]]);
  for(const v of C){const next=new Map();for(const s of states.values()){for(const skip of v===0?[false,true]:[false]){
    const p=skip?0:mod(v-shifts[s.key]),key=s.key+(skip?0:1),sum=s.sum+(s.last<0?0:log[s.last][p]),id=key+","+p;
    if(!next.has(id)||sum>next.get(id).sum)next.set(id,{key,last:p,sum,prev:s,skip});
  }}states=next}
  let best=[...states.values()].reduce((a,b)=>a.sum>=b.sum?a:b),node=best;const out=[],mask=[];
  for(let i=C.length-1;i>=0;i--){out.push(node.last);if(node.skip)mask.push(i);node=node.prev}
  out.reverse();mask.reverse();assert(encode(out,new Set(mask)).join()===C.join(),"mask replay");
  return {out,mask,score:best.sum/(C.length-1),finalStates:states.size};
 }
 const best56=bestMask(c56);
 const plant=Array.from({length:n},(_,i)=>native[i%native.length]),plantMask=new Set(plant.flatMap((x,i)=>x===0?[i]:[])),plantCipher=encode(plant,plantMask),plantBest=bestMask(plantCipher);
 const rows=[];
 for(const [name,p] of [['title then div',walk(a,b)],['div then title',walk(b,a)],['printed order',Array.from({length:n},(_,i)=>i)]]){
  assert(p.length===n&&new Set(p).size===n,"orbit");const rev=Array(n);for(let j=0;j<n;j++)rev[p[j]]=j;
  const phaseEquivalence=[3,9,27,81,243,729].map(q=>{const f=p.slice(0,q).map(x=>x%q);return [q,new Set(f).size===q&&p.every((x,j)=>x%q===f[j%q])]});
  assert(phaseEquivalence.every(x=>x[1]),"phase relation");
  const C=p.map(i=>c[i]),best=bestMask(C),out=decode(C,new Set());assert(rev.map(j=>encode(best.out,new Set(best.mask))[j]).join()===c.join(),"grid replay");
  const placed=rev.map(j=>plantCipher[j]);assert(decode(p.map(i=>placed[i]),plantMask).join()===plant.join(),"grid plant");
  rows.push({name,firstCells:p.slice(0,8),phaseEquivalence,fCount:C.filter(x=>x===0).length,maskCount:2**C.filter(x=>x===0).length,noSkipScore:score(out),noSkipIoC:ioc(out),bestScore:best.score,bestIoC:ioc(best.out),bestFirstHalfScore:score(best.out.slice(0,365)),bestLastHalfScore:score(best.out.slice(365)),bestSkipPositions:best.mask,bestHead:best.out.slice(0,80).map(x=>d.translit[x]).join(' '),bestFull:best.out.map(x=>d.translit[x]).join(' ')});
 }
 return {a,b,n,train:train.length,p56Matches:dec56.length,p56Score:score(dec56),p56BestScore:best56.score,p56BestMask:best56.mask,p56BestMatches:best56.out.filter((x,i)=>x===expected[i]).length,nativeIoC:ioc(native),plantScore:score(plant),plantBestScore:plantBest.score,plantBestMatches:plantBest.out.filter((x,i)=>x===plant[i]).length,rawIoC:ioc(c),rows};
}
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const out=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/external/cicada2014-stage11-onion7-original-index.html"),read("resources/liber-primus/lp1-plaintext-reference.txt"));
console.log(JSON.stringify(out,null,2));
