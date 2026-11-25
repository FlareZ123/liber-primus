'use strict';
const fs=require('node:fs');
function experiment(c,n,gs,es,ss){
const mod=(x,m)=>(x%m+m)%m,check=(x,m)=>{if(!x)throw Error(m)},FULL29=(1<<29)-1,FULL28=(1<<28)-1,firstBit=x=>31-Math.clz32(x&-x);
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encode(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){const k=keys.find(x=>w.startsWith(x));check(k,"token "+w);out.push(map[k]);w=w.slice(k.length)}}return out}
const gs0=gs.indexOf("|Almustafa"),gs1=gs.indexOf("*** END OF"),es0=es.indexOf("THERE is one mind"),es1=es.indexOf("*** END OF");check(gs0>=0&&gs1>gs0&&es0>=0&&es1>es0,"body anchors");
const donors=[["Gibran",encode(gs.slice(gs0,gs1))],["Emerson",encode(es.slice(es0,es1))],["Shakespeare",encode(ss)],...n.sections.map((s,i)=>["native"+i,Array.from(s.source_text).map(x=>c.runes.indexOf(x)).filter(x=>x>=0)])].map(([name,P])=>({name,P:Uint8Array.from(P)}));
const C=c.pages.slice(0,56).flatMap(p=>p.indices);check(C.length===12956,"original length");const primes=[];for(let x=2;primes.length<=C.length;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
const log=Array(29).fill(-1),pow=[];let a=1;for(let i=0;i<28;i++){log[a]=i;pow.push(a);a=a*15%29}check(new Set(pow).size===28,"primitive root");
const bitMasks=Array.from({length:28},(_,k)=>Array.from({length:29},(_,p)=>(p<28?1<<mod(p+k,28):0)|(p>0?1<<mod(p-1+k,28):0)));
function trace(A,hold){let t=0,last=0;const O=[];for(const x of A){const d=mod(x-last,29);O.push({t,r:primes[t]%29,k:mod(primes[t]-1,28),z:log[d]});last=x;if(d||!hold)t++}return O}
function forward(P,F,K,hold,order){let t=0,last=0;const A=[];for(const p of P){const e=F[primes[t]%29],k=mod(primes[t]-1,28);if(p!==e){const r=p-Number(p>e),v=order==="after"?mod(r+k,28):r,x=K[t%K.length].indexOf(v),z=order==="before"?mod(x+k,28):x;check(x>=0,"map inverse");last=mod(last+pow[z],29);t++}else if(!hold)t++;A.push(last)}return A}
function prepare(O){
const anchors=Array(29).fill(-1),same=[],anchored=[],free=[];
for(let i=0;i<O.length;i++){const {r,z}=O[i];if(z<0){if(anchors[r]<0)anchors[r]=i;else same.push([anchors[r],i])}}
for(let i=0;i<O.length;i++){const {r,z}=O[i];if(z>=0){if(anchors[r]>=0)anchored.push([anchors[r],i]);else free.push([r,i])}}
const modes=[];for(const q of [8,13,28,29])for(const order of ["none","before","after"]){const idx=Array(O.length).fill(-1),shift=Array(O.length).fill(0),used=new Set(),first=Array(q*28).fill(-1),pairs=[];for(let i=0;i<O.length;i++){const {t,z,k}=O[i];if(z<0)continue;const v=(t%q)*28+(order==="before"?mod(z-k,28):z);idx[i]=v;shift[i]=order==="after"?k:0;used.add(v);if(first[v]===-1)first[v]=i;else pairs.push([first[v],i,shift[first[v]],shift[i]])}modes.push({q,order,idx,shift,pairs,used:[...used]})}
return {anchors,same,anchored,free,modes}
}
function fit(O,P,at,FD0,mode){
const {q,order,idx,shift,used}=mode,initialK=Array(q*28).fill(FULL28),constraints=[],degree=Array(q*28).fill(0);
for(let i=0;i<O.length;i++){if(idx[i]<0)continue;const p=P[at+i],k=shift[i],hi=p<28?1<<mod(p+k,28):0,lo=p>0?1<<mod(p-1+k,28):0,eLo=(1<<p)-1,eHi=FULL29^((1<<(p+1))-1),v=idx[i],r=O[i].r;initialK[v]&=hi|lo;if(!initialK[v])return null;constraints.push({v,r,hi,lo,eLo,eHi});degree[v]++}
const groups=Array.from({length:q},()=>[]);for(const v of used)groups[Math.floor(v/28)].push(v);
let nodes=0;
function dfs(FD,KD){nodes++;let changed=true;while(changed){changed=false;for(const x of constraints){const {v,r,hi,lo,eLo,eHi}=x;let km=0,em=0;if((KD[v]&hi)&&(FD[r]&eHi)){km|=hi;em|=eHi}if((KD[v]&lo)&&(FD[r]&eLo)){km|=lo;em|=eLo}if(!km||!em)return null;const nk=KD[v]&km,nf=FD[r]&em;if(!nk||!nf)return null;if(nk!==KD[v]){KD[v]=nk;changed=true}if(nf!==FD[r]){FD[r]=nf;changed=true}}
for(const group of groups){let singles=0;for(const v of group){const m=KD[v];if((m&(m-1))===0){if(singles&m)return null;singles|=m}}for(const v of group){const m=KD[v];if((m&(m-1))!==0){const next=m&~singles;if(!next)return null;if(next!==m){KD[v]=next;changed=true}}}}
}
let selected=-1;for(const v of used)if((KD[v]&(KD[v]-1))!==0&&(selected<0||degree[v]>degree[selected]))selected=v;
if(selected<0)return {FD,KD};
for(let m=KD[selected];m;m&=m-1){const copy=KD.slice();copy[selected]=m&-m;const x=dfs(FD.slice(),copy);if(x)return x}return null}
const answer=dfs(FD0.slice(),initialK);if(!answer)return null;const F=answer.FD.map(firstBit),K=Array.from({length:q},()=>Array(28).fill(-1));for(const v of used)K[Math.floor(v/28)][v%28]=firstBit(answer.KD[v]);for(const row of K){const free=[];for(let r=0;r<28;r++)if(!row.includes(r))free.push(r);for(let i=0;i<28;i++)if(row[i]<0)row[i]=free.shift()}return {F,K,nodes,observedEntries:used.length,escapeDomains:answer.FD};
}
function scan(A,hold,ds){const O=trace(A,hold),N=A.length,{anchors,same,anchored,free,modes}=prepare(O),reports=[],fits=[];
for(const {name,P} of ds){const W=Math.max(0,P.length-N+1);if(!W)continue;let positivePass=0,maskPass=0;const counts=modes.map(m=>({q:m.q,order:m.order,pairPass:0,jointPass:0}));outer:for(let at=0;at<W;at++){for(const [i,j] of same)if(P[at+i]!==P[at+j])continue outer;positivePass++;for(const [i,j] of anchored)if(P[at+i]===P[at+j])continue outer;const FD=Array(29).fill(FULL29);for(let r=0;r<29;r++)if(anchors[r]>=0)FD[r]=1<<P[at+anchors[r]];for(const [r,i] of free){FD[r]&=~(1<<P[at+i]);if(!FD[r])continue outer}maskPass++;modeLoop:for(let mi=0;mi<modes.length;mi++){const m=modes[mi];for(const [i,j,ki,kj] of m.pairs)if(!(bitMasks[ki][P[at+i]]&bitMasks[kj][P[at+j]]))continue modeLoop;counts[mi].pairPass++;const f=fit(O,P,at,FD,m);if(!f)continue;counts[mi].jointPass++;const target=P.slice(at,at+N),rec=forward(target,f.F,f.K,hold,m.order);check(rec.every((x,i)=>x===A[i]),"independent full replay");fits.push({name,at,q:m.q,order:m.order,...f,plaintext:Array.from(target,x=>c.translit[x]).join(" ")})}}
reports.push({name,W,positivePass,maskPass,counts})}
return {N,hold,repeats:O.filter(o=>o.z<0).length,anchoredResidues:anchors.filter(i=>i>=0).length,positiveEqualities:same.length,reports,fits}}
const scopes=[[0,55],[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],results=[];
for(const [lo,hi] of scopes){const A=c.pages.slice(lo,hi+1).flatMap(p=>p.indices);for(const hold of [false,true])results.push({lo,hi,...scan(A,hold,donors)})}
let rng=0x34283429;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};const plants=[];
for(const hold of [false,true]){const donor=donors[0],at=hold?15000:11000,N=308,P=donor.P.slice(at,at+N),q=8,order=hold?"after":"before",F=Array.from({length:29},()=>rnd()%29),K=Array.from({length:q},()=>{const row=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){const j=rnd()%(i+1);[row[i],row[j]]=[row[j],row[i]]}return row}),A=forward(P,F,K,hold,order),result=scan(A,hold,[donor]),trueCandidate=result.fits.find(x=>x.at===at&&x.q===q&&x.order===order);check(trueCandidate,"planted exact source and joint map recovered");plants.push({hold,N,at,q,order,F,K,...result,trueCandidate})}
return {results,plants,donors:donors.map(x=>({name:x.name,N:x.P.length}))};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),...paths.slice(2).map(p=>fs.readFileSync(p,'utf8'))),null,2));
