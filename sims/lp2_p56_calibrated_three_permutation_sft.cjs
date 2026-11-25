"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(c){
const mod=x=>(x%29+29)%29,id=Array.from({length:29},(_,i)=>i),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const P=[];for(const w of "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" "))for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t.s,i));P.push(t.i);i+=t.s.length}
const sh=[];for(let x=2;sh.length<15000;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)sh.push((x-1)%29)}
function enc(P,S,K,Y){let j=0;return P.map(p=>{if(!p)return 0;return Y.indexOf(mod(S[p]+K[sh[j++]]))})}
const C=c.pages[56].indices;
if(P.length!==85||!eq(enc(P,id,id,id),C))throw Error("authentic control");
function solve(P,C){
 const A=[],used=new Set(),usedK=new Set(),usedY=new Set();let j=0;
 for(let i=0;i<P.length;i++){if(P[i]===0){if(C[i]!==0)throw Error("bad hold");continue}let k=sh[j++],r=Array(88).fill(0);r[P[i]]=28;r[29+k]=28;r[58+C[i]]=1;A.push(r);used.add(P[i]);usedK.add(k);usedY.add(C[i])}
 if(usedK.size!==29||usedY.size!==29)throw Error("incomplete outer or shift coverage");
 function eliminate(A){let rank=0,piv=[];for(let col=0;col<87;col++){let i=A.findIndex((r,i)=>i>=rank&&r[col]);if(i<0)continue;[A[rank],A[i]]=[A[i],A[rank]];let inv=id.find(i=>mod(i*A[rank][col])===1);A[rank]=A[rank].map(x=>mod(x*inv));for(let j=0;j<A.length;j++)if(j!==rank&&A[j][col]){let k=A[j][col];A[j]=A[j].map((x,i)=>mod(x-k*A[rank][i]))}piv.push(col);rank++}if(A.slice(rank).some(r=>r[87]))throw Error("inconsistent");return {rank,piv,A}}
 const raw=eliminate(A.map(r=>r.slice()));
 for(const [i,v] of [[57,28],[85,27],[86,28]]){const r=Array(88).fill(0);r[i]=1;r[87]=v;A.push(r)}
 const rr=eliminate(A),free=id.map(i=>i).filter(i=>!used.has(i)),freeObserved=Array.from({length:87},(_,i)=>i).filter(i=>!rr.piv.includes(i)&&!free.includes(i));
 if(freeObserved.length>3)throw Error("outside enumeration scope");
 const stats={tested:0,inner:0,shift:0,outer:0},models=[];
 function rec(k,v){
 if(k<freeObserved.length){for(let x=0;x<29;x++){v[freeObserved[k]]=x;rec(k+1,v)}return}
 stats.tested++;
 for(let i=0;i<rr.rank;i++)v[rr.piv[i]]=mod(rr.A[i][87]-freeObserved.reduce((s,f)=>s+rr.A[i][f]*v[f],0));
 const S=v.slice(0,29),K=v.slice(29,58),Y=v.slice(58),x=[...used].map(i=>S[i]);
 if(new Set(x).size!==x.length){stats.inner++;return}if(new Set(K).size!==29){stats.shift++;}if(new Set(Y).size!==29){stats.outer++;return}
 const remaining=id.filter(i=>!x.includes(i));free.forEach((f,i)=>S[f]=remaining[i]);if(!eq(enc(P,S,K,Y),C))throw Error("replay");
 free.forEach(i=>S[i]=null);models.push({S,K,Y,free,remaining});
 }
 rec(0,Array(87).fill(0));
 return {consumed:j,observed:[used.size,usedK.size,usedY.size],rank:raw.rank,normalizedRank:rr.rank,freeObserved,stats,models};
}
const auth=solve(P,C);if(auth.models.length!==1)throw Error("auth model count");const M=auth.models[0];
if(!eq(M.K,id)||!eq(M.Y,id)||!M.S.every((v,i)=>v===null||v===i))throw Error("auth normalized maps");
function legal(C,f,K=M.K,Y=M.Y){let states=new Map([[0,1n]]),i=0;for(;i<C.length;i++){let next=new Map;function add(k,v){next.set(k,(next.get(k)||0n)+v)}for(const [h,v] of states){if(C[i]===0)add(h+1,v);if(mod(Y[C[i]]-K[sh[i-h]])!==f)add(h,v)}if(!next.size)break;states=next}return {end:i,paths:i===C.length?String([...states.values()].reduce((a,b)=>a+b,0n)):"0",terminalHolds:i===C.length?[...states.keys()]:[]}}
const p=c.pages.map(x=>x.indices),ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],summary=C=>M.remaining.map(f=>({f,...legal(C,f)}));
const chapters=ranges.map(([a,b])=>({a,b,len:p.slice(a,b+1).flat().length,markers:summary(p.slice(a,b+1).flat())})),physical=p.slice(0,56).map((C,p)=>({p,len:C.length,markers:C.length?summary(C):[]})),continuous=summary(p.slice(0,56).flat());
const survivors=physical[55].markers.filter(x=>x.paths!=="0");if(survivors.length!==1||survivors[0].paths!=="1"||!eq(survivors[0].terminalHolds,[0]))throw Error("p55 expected unique hold path");
const f=survivors[0].f,R=p[55].map((x,i)=>mod(x-sh[i]));
const rest=M.remaining.filter(x=>x!==f),labels=M.free.filter(x=>x!==0);let completions=0;
function perm(a,fn){if(!a.length){fn([]);return}for(let i=0;i<a.length;i++)perm(a.slice(0,i).concat(a.slice(i+1)),p=>fn([a[i],...p]))}
perm(labels,v=>{let inv=id.slice();inv[f]=0;rest.forEach((x,i)=>inv[x]=v[i]);const S=id.map(i=>inv.indexOf(i));if(!eq(enc(R.map(x=>inv[x]),S,id,id),p[55]))throw Error("p55 replay");completions++});
function shuffle(seed){let a=id.slice(),x=seed>>>0;for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function norm(S,K,Y){let a=id.find(i=>mod(i*(Y[28]-Y[27]))===1),b=mod(28-a*Y[28]),d=mod(28-a*K[28]);return{S:S.map(x=>mod(a*x+b-d)),K:K.map(x=>mod(a*x+d)),Y:Y.map(x=>mod(a*x+b))}}
const controls=[0x3301,0x2014].map(seed=>{let text=Array.from({length:12},(_,i)=>P.slice(i%4).concat(P.slice(0,i%4))).flat(),S=shuffle(seed),K=shuffle(seed^0x111111),Y=shuffle(seed^0x999999),cipher=enc(text,S,K,Y),truth=norm(S,K,Y),res=solve(text,cipher),found=res.models.filter(m=>eq(m.K,truth.K)&&eq(m.Y,truth.Y)&&m.S.every((v,i)=>v===null||v===truth.S[i]));if(found.length!==1||legal(cipher,truth.S[0],truth.K,truth.Y).end!==cipher.length)throw Error("plant");return {seed,length:text.length,observed:res.observed,rank:res.rank,freeObserved:res.freeObserved,models:res.models.length,truePartialRecovered:true}});
return {auth,chapters,physical,continuous,p55:{marker:f,completions,R,fixedCount:R.filter(r=>M.S[r]!==null).length,template:R.map(r=>M.S[r]===null?"["+r+"]":c.translit[r]).join(" ")},controls};
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"))),null,2));
