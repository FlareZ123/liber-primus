"use strict";
function linear(){
const q=29,L=13,D=28,mod=x=>(x%q+q)%q;
const inv=Array.from({length:q},(_,i)=>{for(let j=1;j<q;j++)if(i*j%q===1)return j;return 0});
function row(p,c,t){return [p[t],1,...Array.from({length:L},(_,i)=>c[t-i-1]),...Array.from({length:L},(_,i)=>p[t-i-1])]}
function reduce(a,basis){for(let i=0;i<D;i++)if(a[i]&&basis[i]){const k=a[i],b=basis[i];for(let j=i;j<=D;j++)a[j]=mod(a[j]-k*b[j]);}return a}
function forced(x,basis){const r=reduce([...x,0],basis);return r.slice(0,D).some(Boolean)?null:mod(-r[D])}
function fit(P,C,hold){const p=[],c=[],basis=Array(D).fill(null);let rank=0;for(let i=0;i<C.length;i++){if(hold&&P[i]===0){if(C[i]!==0)return {reason:"F"};continue}p.push(P[i]);c.push(C[i]);const t=p.length-1;if(t<L)continue;const a=reduce([...row(p,c,t),c[t]],basis),k=a.slice(0,D).findIndex(Boolean);if(k<0){if(a[D])return {reason:"inconsistent"};continue}const z=inv[a[k]];for(let j=k;j<=D;j++)a[j]=mod(a[j]*z);basis[k]=a;rank++}if(forced([1,...Array(D-1).fill(0)],basis)===0)return {reason:"singular"};return {basis,rank,p,c}}
function predict(P,C,hold,f){const p=[...f.p],c=[...f.c],out=[];for(let i=C.length;i<P.length;i++){if(hold&&P[i]===0){out.push(0);continue}p.push(P[i]);const y=forced(row(p,c,p.length-1),f.basis);if(y===null)return {out,ambiguousAt:i};out.push(y);c.push(y)}return {out}}
function scan(candidates,C,split=80){const counts={},survivors=[];for(const x of candidates)for(const hold of [false,true]){const f=fit(x.P,C.slice(0,split),hold);if(f.reason){counts[f.reason]=(counts[f.reason]||0)+1;continue}const pred=predict(x.P,C.slice(0,split),hold,f);survivors.push({name:x.name,start:x.start,hold,rank:f.rank,predicted:pred.out.length,exact:pred.out.length===C.length-split&&pred.out.every((v,i)=>v===C[split+i]),ambiguousAt:pred.ambiguousAt,continuation:pred.out})}return {counts,survivors}}
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function plant(P,hold,order,seed){const random=rng(seed),r=()=>Math.floor(random()*q),k=[1+Math.floor(random()*28),r(),...Array.from({length:L},(_,i)=>i<order?r():0),...Array.from({length:L},(_,i)=>i<order?r():0)],p=[],c=[];const C=P.map(x=>{if(hold&&x===0)return 0;p.push(x);const t=p.length-1,y=t<L?r():mod(row(p,c,t).reduce((s,v,j)=>s+v*k[j],0));c.push(y);return y});return {P,C,k,hold,order}}
function controls(sources){const cases=[],random=rng(0x8e87e9f1);for(let j=0;j<sources.length;j++){const s=sources[j];for(let h=0;h<2;h++){const pool=s.candidates.filter(x=>(x.start<s.runes/2)===(h===0)&&x.P.slice(0,80).includes(0)&&x.P.slice(80).includes(0));const x=pool[Math.floor(random()*pool.length)];for(const hold of [false,true]){const a=plant(x.P,hold,[3,8,13][j],Math.floor(random()*2**32));cases.push({name:x.name,start:x.start,...a})}cases.push({name:"null",C:Array.from({length:160},()=>Math.floor(random()*q))})}}return cases}
return {fit,predict,scan,plant,controls}
}
module.exports={linear};
