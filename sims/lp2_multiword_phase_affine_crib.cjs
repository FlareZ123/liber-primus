'use strict';
/** Exact common-cycle aligned known-plaintext inverse with arbitrary word phases,
 * no full-period anchor. Phase representatives are discovered incrementally.
 * GF(29) + partial bijection + relative-phase constraint propagation.
 */
const Q=29,N=28,S="0123456789abcdefghijklmnopqrs",mod=x=>(x%29+29)%29,seq=n=>Array.from({length:n},(_,i)=>i);
const inv=seq(Q).map(x=>seq(Q).find(y=>x*y%Q===1));
const rot=(a,i)=>a.slice(i).concat(a.slice(0,i));
function canonical(pi,k){const v=inv[pi[1]];return pi.map(x=>mod(x*v)).join(",")+":"+seq(k.length).map(i=>rot(k,i).map(x=>mod(x*v)).join(",")).sort()[0]}
function primitive(k){return !seq(k.length).slice(1).some(d=>k.length%d===0&&k.every((v,i)=>v===k[i%d]))}
function encrypt(p,pi,k,j){const I=[];pi.forEach((x,i)=>I[x]=i);let c="";for(const s of p){const x=S.indexOf(s);if(!x){c+="0";continue}c+=S[I[mod(pi[x]+k[j])]];j=(j+1)%k.length}return c}
function matches(w,pi,k){return seq(k.length).some(j=>encrypt(w.p,pi,k,j)===w.c)}
function align(w){if(w.p.length!==w.c.length)throw Error("length");const out=[];for(let i=0;i<w.p.length;i++){const x=S.indexOf(w.p[i]),y=S.indexOf(w.c[i]);if(x<0||y<0)throw Error("symbol");if(!x){if(y)return null}else out.push([x,y])}return out}
function row(a,b){const v=new Int8Array(N+1);for(const [e,s] of [[a,1],[b,-1]]){if(e[1])v[e[1]-1]+=s;if(e[0])v[e[0]-1]-=s}for(let i=0;i<N;i++)v[i]=mod(v[i]);return v}
function add(B,r){for(let i=0;i<N;i++)if(r[i]&&B[i]){const a=r[i],b=B[i];for(let j=i;j<=N;j++)r[j]=mod(r[j]-a*b[j])}
 let i=0;while(i<N&&!r[i])i++;if(i===N)return r[N]===0;
 const a=inv[r[i]];for(let j=i;j<=N;j++)r[j]=mod(r[j]*a);
 for(let l=0;l<N;l++)if(B[l]?.[i]){const b=B[l].slice(),v=b[i];for(let j=i;j<=N;j++)b[j]=mod(b[j]-v*r[j]);B[l]=b}
 B[i]=r;return true}
function compatible(a,b){return (a[0]===a[1])===(b[0]===b[1])&&(a[0]!==b[0]||a[1]===b[1])&&(a[1]!==b[1]||a[0]===b[0])}
function phases(a,q){const d=Array.from({length:q},()=>[]);a.forEach((e,i)=>d[i%q].push(e));return d}
function forms(B){const free=seq(N).filter(i=>!B[i]);return {free,F:[[0,...free.map(()=>0)],...seq(N).map(i=>B[i]?[B[i][N],...free.map(j=>mod(-B[i][j]))]:[0,...free.map(j=>+(i===j))])]}}
function duplicate(F){const s=new Set(F.map(x=>x.join(",")));return s.size!==Q}
function pop(x){let n=0;for(;x;x&=x-1)n++;return n}
function solve(q,words,{nodeCap=300000,enumCap=2000000,actionCap=1000}={}){
 if(q<2||q>29)throw Error("period");
 const G=words.map((w,i)=>({i,e:align(w)}));if(G.some(g=>g.e===null))return {complete:true,reason:"literal F",actions:[]};
 const A=G.filter(g=>g.e.length).sort((a,b)=>b.e.length-a.e.length||a.i-b.i).map(g=>({...g,ph:phases(g.e,q)})),L=A.length;
 if(!L)return {complete:false,reason:"no consuming edge",actions:[]};
 for(const g of A)for(const p of g.ph)for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(!compatible(p[i],p[j]))return {complete:true,reason:"within-word phase contradiction",actions:[]};
 const full=(1<<q)-1,R=Array.from({length:L},()=>new Int32Array(L));
 for(let i=0;i<L;i++)for(let j=i+1;j<L;j++){
  let mask=0,rev=0;for(let d=0;d<q;d++){let ok=true;for(let p=0;p<q&&ok;p++)for(const a of A[i].ph[(p+d)%q])for(const b of A[j].ph[p])if(!compatible(a,b))ok=false;if(ok){mask|=1<<d;rev|=1<<((q-d)%q)}}
  R[i][j]=mask;R[j][i]=rev;if(!mask)return {complete:true,reason:"word-pair phase contradiction",actions:[]};
 }
 const shiftMask=(mask,j)=>((mask<<j)|(mask>>>(q-j)))&full;
 let complete=true,stop=false;const actions=new Map(),counts={nodes:0,joins:0,pairPrune:0,linearPrune:0,forcedCollision:0,enumNodes:0,completedVectors:0,caps:0,fullRank:0};
 function cap(){complete=false;stop=true;counts.caps++}
 function test(pi,k){counts.completedVectors++;if(!primitive(k))return;if(words.every(w=>matches(w,pi,k))){actions.set(canonical(pi,k),{pi,k:k.slice()});if(actions.size>=actionCap)cap()}}
 function finish(F,free,reps){
  if(stop)return;
  const d=free.length,unknown=seq(q).filter(j=>!reps[j]);
  if(!d&&!unknown.length)counts.fullRank++;
  const order=seq(d).sort((a,b)=>F.filter(f=>f[a+1]).length-F.filter(f=>f[b+1]).length||a-b);
  const buckets=Array.from({length:d+1},()=>[]);
  F.forEach((f,i)=>{let last=-1;for(let j=0;j<d;j++)if(f[order[j]+1])last=j;buckets[last+1].push(i)});
  const x=new Int8Array(d),pi=new Array(Q);
  function assignBucket(level,mask){for(const i of buckets[level]){const f=F[i];let y=f[0];for(let j=0;j<d;j++)y+=f[j+1]*x[j];y%=29;if(mask&(1<<y))return -1;mask|=1<<y;pi[i]=y}return mask}
  function keys(k,t){if(stop)return;if(++counts.enumNodes>enumCap){cap();return}if(t===unknown.length){test(pi.slice(),k);return}for(let v=0;v<Q&&!stop;v++){k[unknown[t]]=v;keys(k,t+1)}}
  function visit(level,mask){if(stop)return;if(++counts.enumNodes>enumCap){cap();return}if(level===d){const k=reps.map(e=>e?mod(pi[e[1]]-pi[e[0]]):0);keys(k,0);return}
   for(let v=0;v<Q&&!stop;v++){if(mask&(1<<v))continue;x[order[level]]=v;const m=assignBucket(level+1,mask);if(m>=0)visit(level+1,m)}
  }
  const m=assignBucket(0,0);if(m>=0)visit(0,m)
 }
 function walk(B,reps,domains,left){
  if(stop)return;if(++counts.nodes>nodeCap){cap();return}
  const {free,F}=forms(B);if(duplicate(F)){counts.forcedCollision++;return}
  if(!left||(reps.every(Boolean)&&free.length<=1)){finish(F,free,reps);return}
  let i=-1,best=Infinity;for(let j=0;j<L;j++)if(domains[j]){const v=pop(domains[j]);if(v<best||(v===best&&A[j].e.length>A[i].e.length)){best=v;i=j}}
  if(i<0)throw Error("no phase variable");
  for(let m=domains[i];m&&!stop;m&=m-1){const bit=m&-m,j=31-Math.clz32(bit);counts.joins++;
   const D=domains.slice();D[i]=0;let ok=true;for(let t=0;t<L;t++)if(D[t]){D[t]&=shiftMask(R[i][t],j);if(!D[t]){ok=false;break}}if(!ok){counts.pairPrune++;continue}
   const b=B.slice(),r=reps.slice();
   for(let k=0;k<A[i].e.length&&ok;k++){const p=(j+k)%q,e=A[i].e[k];if(!r[p])r[p]=e;else if(!compatible(e,r[p])||!add(b,row(e,r[p])))ok=false}
   if(!ok){counts.linearPrune++;continue}walk(b,r,D,left-1)
  }
 }
 const B=Array(N).fill(null),g=new Int8Array(N+1);g[0]=g[N]=1;add(B,g);
 const D=new Int32Array(L).fill(full);D[0]=1;walk(B,Array(q).fill(null),D,L);
 return {complete,actions:[...actions.values()],groups:L,anchor:A[0].e.length,...counts};
}
function trial(words,q,seed){
 let s=seed>>>0;function rng(n){s^=s<<13;s^=s>>>17;s^=s<<5;return Math.floor((s>>>0)/4294967296*n)}
 const pi=seq(Q);for(let i=28;i>1;i--){const j=1+rng(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
 let k;do{k=seq(q).map(()=>rng(Q))}while(!primitive(k));
 const fit=words.map(p=>({p,c:encrypt(p,pi,k,rng(q))})),truth=canonical(pi,k);
 const r=solve(q,fit);return {q,seed,fitRunes:words.join("").length,maxConsuming:Math.max(...words.map(p=>p.replace(/0/g,"").length)),truth,truthRetained:r.actions.some(a=>canonical(a.pi,a.k)===truth),...r};
}
module.exports={solve,trial,encrypt,canonical,matches,S};
