'use strict';
const fs=require('node:fs');
function experiment(A,B) {
 const same=(x,y)=>x.length===y.length&&x.every((z,i)=>z===y[i]),assert=(ok,msg)=>{if(!ok)throw Error(msg)},mod=x=>(x+29)%29;
 const original=A.pages.slice(0,3).flatMap(p=>p.indices);assert(original.length===729,"opening shape");
 const maxOrigin=3301,N=729,cut=400,primes=[];for(let n=2;primes.length<maxOrigin+N+1;n++){let yes=true;for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break}if(yes)primes.push((n-1)%29)}
 const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
 const enc=(p,o)=>{let j=o;return p.map(x=>x===0?0:mod(x+primes[j++]))};
 const p56=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(p56,0),A.pages[56].indices),"authentic p56");
 function perms(a){if(!a.length)return [[]];return a.flatMap((x,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[x,...p]))}
 const orders=perms([0,1,2,3,4,5]),digits=Array.from({length:N},(_,i)=>Array.from({length:6},(_,j)=>Math.floor(i/3**(5-j))%3));
 const variants=[];for(const order of orders){for(const turn of [0,1]){const map=digits.map(d=>order.reduce((n,j)=>3*n+(turn?2-d[j]:d[j]),0));assert(new Set(map).size===N,"permutation");variants.push({order,turn,map})}}
 assert(new Set(variants.map(v=>v.map.join(","))).size===1440,"distinct maps");
 // Each bit represents an exact possible number of transparent F holds.
 // Mask indexed by t=origin+i, v=cipher rune; bit h set iff consuming would decode F.
 const lo=new Uint32Array((maxOrigin+N+1)*29),hi=new Uint32Array(lo.length);
 for(let t=0;t<maxOrigin+N+1;t++)for(let h=0;h<64&&h<=t;h++){let at=t*29+primes[t-h];if(h<32)lo[at]|=1<<h;else hi[at]|=1<<(h-32)}
 function reach(c,origin){let l=1,u=0;for(let i=0;i<c.length;i++){const v=c[i],at=(origin+i)*29+v;const nl=l&~lo[at],nu=u&~hi[at];if(v===0){u=nu|(u<<1)|(l>>>31);l=nl|(l<<1)}else{u=nu;l=nl}if((l|u)===0)return i}return c.length}
 // Independent scalar exact check for every original candidate at origin zero and sampled offsets.
 function scalar(c,o){let h=new Set([0]);for(let i=0;i<c.length;i++){let t=new Set();for(const k of h){if(c[i]===0)t.add(k+1);if(c[i]!==primes[o+i-k])t.add(k)}if(!t.size)return i;h=t}return c.length}
 assert(reach(A.pages[56].indices,0)===85,"p56 reach");
 let prefix=0,full=0,max=0,best=null,origin0={prefix:0,full:0,max:0};const alive=[];
 for(let vi=0;vi<variants.length;vi++){const v=variants[vi],c=v.map.map(i=>original[i]);assert(reach(c,0)===scalar(c,0),"scalar exact origin0");for(let o=0;o<=maxOrigin;o++){let n=reach(c,o);if(o===0){if(n>=cut)origin0.prefix++;if(n===N)origin0.full++;origin0.max=Math.max(origin0.max,n)}if(n>=cut){prefix++;alive.push({vi,o,n})}if(n===N)full++;if(n>max){max=n;best={order:v.order,turn:v.turn,origin:o}}}let sampled=(vi*7919)%3302;assert(reach(c,sampled)===scalar(c,sampled),"scalar sampled origin")}
 const ordinary=Array.from({length:maxOrigin+1},(_,o)=>reach(original,o));const raw={max:Math.max(...ordinary),prefix:ordinary.filter(n=>n>=cut).length,full:ordinary.filter(n=>n===N).length};
 // Positive plants invert actual address permutation and native F encoder exactly.
 const nt=B.sections.filter(s=>s.name!=="p56_an_end"&&s.name!=="p57_parable").flatMap(native);
 const plants=[];for(const [start,vi,o] of [[0,337,0],[729,901,1033],[1458,1439,3301]]){const p=nt.slice(start,start+N);assert(p.length===N,"native plant length");const c=enc(p,o),v=variants[vi],physical=new Array(N);for(let j=0;j<N;j++)physical[v.map[j]]=c[j];const recovered=v.map.map(i=>physical[i]);assert(same(recovered,c)&&reach(recovered,o)===N&&scalar(recovered,o)===N,"native positive");plants.push({start,order:v.order,turn:v.turn,origin:o,exactCipherReplay:same(enc(p,o),recovered),literalF:p.filter(x=>x===0).length})}
 // Do not use suffix to choose a key. Rank all prefix survivors by exact bigram MAP if the set is tractable.
 const train=nt.slice(2187),counts=Array.from({length:29},()=>new Array(29).fill(0.25));for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;const lp=counts.map(r=>{let z=r.reduce((s,x)=>s+x,0);return r.map(x=>Math.log(x/z))});
 function decode(c,o,start=0,end=c.length,initialH=0,initialPrev=-1){
   let states=new Map([[initialH*30+initialPrev+1,{s:0,p:[],h:initialH,last:initialPrev}]]);
   for(let i=start;i<end;i++){let next=new Map();for(const st of states.values()){const h=st.h,last=st.last,v=c[i],k=primes[o+i-h];function add(x,hh){const s=st.s+(last<0? -Math.log(29):lp[last][x]),id=hh*30+x+1;const prior=next.get(id);if(!prior||s>prior.s)next.set(id,{s,p:[...st.p,x],h:hh,last:x})}if(v===0)add(0,h+1);if(v!==k)add(mod(v-k),h)}states=next;if(!states.size)return null}return [...states.values()].reduce((a,b)=>a.s>b.s?a:b);
 }
 // Exact two-lane MAP score. At fixed hold count h, the previous
 // plaintext is either literal F (H) or the uniquely consumed rune (C).
 function fastScore(c,o,end=cut) {
   let H=new Float64Array(64),C=new Float64Array(64),HH=new Float64Array(64),CC=new Float64Array(64);
   H.fill(-Infinity);C.fill(-Infinity);let z=0,v=c[0],k=primes[o],s=-Math.log(29);
   if(v===0){H[1]=s;z=1}if(v!==k)C[0]=s;
   for(let i=1;i<end;i++){
     v=c[i];const z2=z+(v===0?1:0);HH.fill(-Infinity,0,z2+1);CC.fill(-Infinity,0,z2+1);
     for(let h=0;h<=z;h++){
       const h0=H[h],c0=C[h];if(h0===-Infinity&&c0===-Infinity)continue;
       const last=c0===-Infinity?0:mod(c[i-1]-primes[o+i-1-h]);
       k=primes[o+i-h];
       if(v===0)HH[h+1]=Math.max(h0+lp[0][0],c0+lp[last][0]);
       if(v!==k){const x=mod(v-k);CC[h]=Math.max(h0+lp[0][x],c0+lp[last][x])}
     }
     [H,HH]=[HH,H];[C,CC]=[CC,C];z=z2;
   }
   let best=-Infinity;for(let h=0;h<=z;h++)best=Math.max(best,H[h],C[h]);return best;
 }
 function rankPrefix(tape,candidates) {
   const cc=variants.map(v=>v.map.map(i=>tape[i]));
   const top=[];for(const k of candidates){const c=cc[k.vi],score=fastScore(c,k.o);if(!Number.isFinite(score))throw Error("prefix reach and MAP disagree");if(top.length<10||score>top[top.length-1].score){top.push({...k,score});top.sort((a,b)=>b.score-a.score||a.vi-b.vi||a.o-b.o);if(top.length>10)top.pop()}}
   return top.map(k=>{const c=cc[k.vi],d=decode(c,k.o,0,cut);assert(Math.abs(d.s-k.score)<1e-8,"two-lane exact MAP check");const suffix=decode(c,k.o,cut,N,d.h,d.last);const p=suffix?[...d.p,...suffix.p]:null;return {vi:k.vi,order:variants[k.vi].order,turn:variants[k.vi].turn,origin:k.o,prefixScore:d.s/cut,prefixH:d.h,prefixLast:d.last,heldoutScore:suffix?suffix.s/(N-cut):null,heldoutLength:suffix?suffix.p.length:0,prefix:d.p.slice(0,70).map(x=>A.translit[x]).join(" "),heldout:suffix?suffix.p.slice(0,70).map(x=>A.translit[x]).join(" "):null,exactReplay:p?same(enc(p,k.o),c):false,plaintext:p}});
 }
 const ranked=rankPrefix(original,alive);
 const sourceZero=alive.filter(k=>k.o===0&&k.n===N).map(k=>({order:variants[k.vi].order,turn:variants[k.vi].turn,origin:k.o,score:fastScore(variants[k.vi].map.map(i=>original[i]),k.o,N)/N,readout:decode(variants[k.vi].map.map(i=>original[i]),k.o).p.map(x=>A.translit[x]).join(" ")}));
 const reference=plants.map((p,j)=>{const x=nt.slice(p.start,p.start+N);let s=-Math.log(29);for(let i=1;i<x.length;i++)s+=lp[x[i-1]][x[i]];return {start:p.start,mean:s/x.length}});
 return {n:N,cut,variants:variants.length,origins:maxOrigin+1,total:variants.length*(maxOrigin+1),original:{prefix,full,max,best,origin0,raw},plants,p56:p56.length,ranked,sourceZero,reference};
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
