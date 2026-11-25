"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,native){
 const N=29,M=30,MAX=3300,mod=x=>(x%N+N)%N,signs=[1,-1];
 const ps=[],sieve=new Uint8Array(60000);for(let i=2;i<sieve.length;i++)if(!sieve[i]){ps.push((i-1)%N);if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1;}
 const ids=new Map(corpus.runes.map((x,i)=>[x,i])),donors=native.sections.map(x=>({name:x.name,p:[...x.source_text].filter(y=>ids.has(y)).map(y=>ids.get(y))}));
 function lm(excluded){const u=new Float64Array(N),b=new Float64Array(M*N),t=new Float64Array(M*M*N),tot=new Float64Array(M),tb=new Float64Array(M*M);let n=0;for(const s of donors){if(s.name===excluded)continue;let a=N,c=N;for(const p of s.p){u[p]++;n++;b[c*N+p]++;tot[c]++;t[(a*M+c)*N+p]++;tb[a*M+c]++;a=c;c=p;}}const uni=Float64Array.from(u,x=>(x+.5)/(n+.5*N)),tri=new Float64Array(t.length);for(let a=0;a<M;a++)for(let c=0;c<M;c++)for(let p=0;p<N;p++){const q=(b[c*N+p]+8*uni[p])/(tot[c]+8);tri[(a*M+c)*N+p]=Math.log((t[(a*M+c)*N+p]+12*q)/(tb[a*M+c]+12));}return tri;}
 function lanes(C,prev){return C.map(c=>{const v=prev%2;prev=c;return v;});}
 function encrypt(P,offs,prev){const k=offs.slice(),C=[];for(const p of P){const l=prev%2,c=p===0?0:mod(p+signs[l]*ps[k[l]++]);C.push(c);prev=c;}return C;}
 function surviving(C,l){const out=[];for(let o=0;o<=MAX;o++){let hs=new Set([0]);for(let i=0;i<C.length&&hs.size;i++){const next=new Set();for(const h of hs){if(mod(C[i]-signs[l]*ps[o+i-h])!==0)next.add(h);if(C[i]===0)next.add(h+1);}hs=next;}if(hs.size)out.push(o);}return out;}
 function solve(C,L,offsets,tri,backtrace=false){let states=new Map([[0,{h0:0,h1:0,a:N,b:N,s:0,prev:null,p:null}]]),seen=[0,0],peak=1;
  for(let i=0;i<C.length;i++){const c=C[i],l=L[i],next=new Map();for(const old of states.values()){
   const h=l===0?old.h0:old.h1,p=mod(c-signs[l]*ps[offsets[l]+seen[l]-h]);
   function add(p,hold){const h0=old.h0+(hold&&l===0?1:0),h1=old.h1+(hold&&l===1?1:0),a=old.b,b=p,s=old.s+tri[(old.a*M+old.b)*N+p],key=((h0*512+h1)*M+a)*M+b;const o=next.get(key);if(!o||o.s<s)next.set(key,{h0,h1,a,b,s,prev:backtrace?old:null,p});}
   if(p!==0)add(p,false);if(c===0)add(0,true);
  }seen[l]++;states=next;peak=Math.max(peak,states.size);if(!states.size)return null;}
  let best=null;for(const s of states.values())if(!best||s.s>best.s)best=s;
  const plain=[];if(backtrace){for(let s=best;s.prev!==null;s=s.prev)plain.push(s.p);plain.reverse();}
  return {score:best.s/C.length,peak,plain};
 }
 const p0=corpus.pages[0].indices,p1=corpus.pages[1].indices,p2=corpus.pages[2].indices,C=p0.slice(13).concat(p1,p2),prev=p0[12],L=lanes(C,prev),tri=lm(null);
 const allowed=[0,1].map(l=>surviving(C.filter((c,i)=>L[i]===l),l));
 const rows=[];let peak=0;
 for(const a of allowed[0])for(const b of allowed[1]){const o=[a,b],z=solve(C,L,o,tri);if(!z)throw Error("independence failed");peak=Math.max(peak,z.peak);rows.push({offsets:o,score:z.score});}
 rows.sort((a,b)=>b.score-a.score);
 const best=rows[0],recovered=solve(C,L,best.offsets,tri,true);if(encrypt(recovered.plain,best.offsets,prev).some((c,i)=>c!==C[i]))throw Error("replay failed");
 const controls=[];
 // Same exact legality pruning and Viterbi on 716 native runes; hold out the entire donor.
 for(const [name,offsets] of [["0_koan_1",[1033,3300]],["0_loss_of_divinity",[3300,761]]]){
  const P=donors.find(x=>x.name===name).p.slice(0,C.length);
  if(P.length!==C.length)throw Error("short donor");
  const Q=encrypt(P,offsets,prev),LL=lanes(Q,prev),T=lm(name);
  const ss=[0,1].map(l=>surviving(Q.filter((c,i)=>LL[i]===l),l));
  let bestControl={score:-Infinity},pairs=0;
  for(const a of ss[0])for(const b of ss[1]){const v=solve(Q,LL,[a,b],T);pairs++;if(v.score>bestControl.score)bestControl={offsets:[a,b],score:v.score};}
  const z=solve(Q,LL,bestControl.offsets,T,true);
  if(encrypt(z.plain,bestControl.offsets,prev).some((c,i)=>c!==Q[i]))throw Error("control replay");
  controls.push({name,offsets,recovered:bestControl.offsets,score:z.score,legal:[ss[0].length,ss[1].length],pairs,correct:z.plain.filter((p,i)=>p===P[i]).length,length:P.length});
 }
 return {length:C.length,possiblePairs:(MAX+1)**2,legalOffsets:allowed,legalPairs:rows.length,peak,best,top20:rows.slice(0,20),plaintext:recovered.plain.map(x=>corpus.translit[x]).join(""),controls};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
