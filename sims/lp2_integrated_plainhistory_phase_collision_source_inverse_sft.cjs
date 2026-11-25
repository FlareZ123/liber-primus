'use strict';
const fs=require('node:fs');
const path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const run=function run(raw){
 const gp=JSON.parse(raw[0]),tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 function encode(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){if(w.startsWith("ING",j)){a.push(21);j+=3}else if(w.startsWith("IO",j)){a.push(27);j+=2}else{const t=tokens.find(x=>w.startsWith(x.s,j));assert(t,w);a.push(t.i);j+=t.s.length}}}return a}
 const P=raw.slice(1).map(encode),C=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices),N=C.length,mod=x=>(x%29+29)%29;
 assert(N===12956,"LP2 geometry");assert(P.map(p=>p.length).join()==="217106,62492,321327","native encoding");
 function grams(a,k){assert(29**k*29<Number.MAX_SAFE_INTEGER,"exact key");const pow=29**(k-1);let v=0;for(let i=0;i<k-1;i++)v=v*29+a[i];const out=new Float64Array(a.length-k+1);for(let i=k-1;i<a.length;i++){v=(v%pow)*29+a[i];out[i-k+1]=v}return out}
 function caps(a,q,lo,n){const map=new Map,pairs=new Float64Array(q);for(let i=0;i<n;i++){const phase=i%q,key=a[lo+i]*q+phase,z=map.get(key)||0;pairs[phase]+=z;map.set(key,z+1)}return [...pairs]}
 function scan(a,q,len,cap,mask){const map=new Map,pairs=new Float64Array(q);let s=0;for(let i=0;i<len;i++){const p=i%q,key=a[i]*q+p,z=map.get(key)||0;s+=z;pairs[p]+=z;map.set(key,z+1)}const lim=cap.reduce((x,y)=>x+y,0);let min=Infinity,max=0,aggregate=0,phasewise=0,joint=0,at=0;
 function record(start){if(s<min){min=s;at=start}max=Math.max(max,s);let ok=s<=lim;if(ok){aggregate++;for(let p=0;p<q;p++)if(pairs[(start+p)%q]>cap[p]){ok=false;break}}if(ok)phasewise++;if(!ok)mask[start]=0;if(mask[start])joint++}
 record(0);for(let j=len;j<a.length;j++){const i=j-len,p=i%q,t=j%q,x=a[i]*q+p,y=a[j]*q+t,z=map.get(x);s-=z-1;pairs[p]-=z-1;if(z===1)map.delete(x);else map.set(x,z-1);const w=map.get(y)||0;s+=w;pairs[t]+=w;map.set(y,w+1);record(i+1)}return {min,max,aggregate,phasewise,joint,at,total:a.length-len+1}}
 const G=Object.fromEntries(Array.from({length:7},(_,i)=>[i+3,P.map(p=>grams(p,i+3))]));
 const H=Object.fromEntries(Array.from({length:4},(_,i)=>[i+1,P.map(p=>grams(p,i+1))]));
 function consistency(Psrc,history,Cipher,start,q,m){const fwd=new Map,rev=new Map;let rows=0;for(let i=m;i<Cipher.length;i++){const h=history[start+i-m]*q+i%q,p=Psrc[start+i],d=mod(Cipher[i]-Cipher[i-1]),fk=h*29+p,rk=h*29+d;
 const f=fwd.get(fk),b=rev.get(rk);if(f!==undefined&&f!==d)return{ok:false,type:"determinism",at:i};if(b!==undefined&&b!==p)return{ok:false,type:"row-injectivity",at:i};if(f===undefined){fwd.set(fk,d);rev.set(rk,p);rows++}}
 return{ok:true,entries:rows,rev};
 }
 function check(cipher,models){const D=cipher.slice(1).map((v,i)=>mod(v-cipher[i])),out=[];
 for(const {q,m} of models){const masks=P.map(p=>new Uint8Array(p.length-N+1).fill(1)),ks=[];for(const k of [5,4,3]){const len=N-m-k+1,cap=caps(grams(D,k),q,m-1,len);const control=G[m+k].map((a,i)=>scan(a,q,len,cap,masks[i]));ks.push({k,capacity:cap.reduce((a,b)=>a+b,0),phaseCaps:cap,control})}
 const final=masks.map((mask,j)=>{let tested=0,maxFailure=-1,failures={determinism:0,"row-injectivity":0},survivors=[];for(let start=0;start<mask.length;start++)if(mask[start]){tested++;const v=consistency(P[j],H[m][j],cipher,start,q,m);if(v.ok){let reconstructed=P[j].slice(start,start+m),history=0;for(const p of reconstructed)history=history*29+p;const pow=29**(m-1);for(let i=m;i<N;i++){const d=mod(cipher[i]-cipher[i-1]),p=v.rev.get((history*q+i%q)*29+d);assert(p!==undefined,"missing observed row");reconstructed.push(p);history=(history%pow)*29+p}assert(reconstructed.every((p,i)=>p===P[j][start+i]),"source replay");survivors.push({start,entries:v.entries,decoded:N,first80:reconstructed.slice(0,80).map(i=>gp.translit[i]).join("")})}else{failures[v.type]++;maxFailure=Math.max(maxFailure,v.at)}}return{tested,failures,maxFailure,survivors}});
 out.push({q,m,ks,final})}return out}
 function plant(source,start,q,m){const p=P[source].slice(start,start+N),c=p.slice(0,m).map((_,i)=>mod(17+5*i)),hist=grams(p,m),key=(h,phase)=>{let v=(h*29+phase+0x330112)>>>0;v=Math.imul(v^(v>>>16),0x7feb352d);v=Math.imul(v^(v>>>15),0x846ca68b);v=(v^(v>>>16))>>>0;return{a:1+v%28,b:(v>>>8)%29}};for(let i=m;i<N;i++){const {a,b}=key(hist[i-m],i%q);c.push(mod(c[i-1]+a*p[i]+b))}return c}
 const models=[];for(const q of [8,13,29])for(const m of [1,2,3,4])models.push({q,m});
 const original=check(C,models);
 const fixture={source:2,start:20347,q:29,m:4},control=check(plant(fixture.source,fixture.start,fixture.q,fixture.m),[{q:fixture.q,m:fixture.m}]);
 assert(control[0].final[fixture.source].survivors.some(x=>x.start===fixture.start&&x.decoded===N),"true finite-source plant recovered");
 return{status:"no unknown plaintext unless original exact survivors identify it independently",N,sourceNames:["Shakespeare","Gibran","Emerson"],sourceLengths:P.map(p=>p.length),original,fixture,control}
};
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
