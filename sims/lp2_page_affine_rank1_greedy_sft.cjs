'use strict';
const fs=require('node:fs');
function run(g,donors,t){
const q=29,Q=q*q,mod=x=>((x%q)+q)%q;
const am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
const streams=donors.map(norm),f=Array(q).fill(0.5),bcounts=Array.from({length:q},()=>Array(q).fill(0));
for(let j=0;j<streams[2].length;j++){let x=streams[2][j];f[x]++;if(j)bcounts[streams[2][j-1]][x]++}
let sum=f.reduce((a,b)=>a+b);for(let i=0;i<q;i++)f[i]/=sum;const log=f.map(Math.log),h=Array.from({length:q},(_,d)=>Math.log(q*f.reduce((s,x,i)=>s+x*f[(i+d)%q],0)));
const bi=bcounts.map(row=>{let s=row.reduce((a,b)=>a+b);return row.map((n,i)=>Math.log((n+20*f[i])/(s+20)))});
const pages=g.pages.filter(x=>x.page<56&&x.indices.length),lens=pages.map(p=>p.indices.length),m=Math.max(...lens),fit=pages.map((p,i)=>p.page%5!==4?i:-1).filter(i=>i>=0),hold=pages.map((p,i)=>p.page%5===4?i:-1).filter(i=>i>=0),maxFit=Math.max(...fit.map(i=>lens[i]));
const shift=Array.from({length:q},(_,u)=>Uint8Array.from({length:Q},(_,x)=>mod(u*Math.floor(x/q)+x%q)));
const lk=Array.from({length:q},(_,c)=>Float64Array.from({length:q},(_,k)=>f[mod(c-k)])),llk=lk.map(row=>Float64Array.from(row,Math.log));
const logp=(P,start=0)=>{let s=0;for(let j=start;j<P.length;j++)s+=j?bi[P[j-1]][P[j]]:log[P[j]];return s};
const encoding="0123456789ABCDEFGHIJKLMNOPQRS";
function enc(P){return P.map(x=>encoding[x]).join("")}
function makeRng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}}
function solve(C){const pairs=[];for(let i of fit)for(let k of fit)if(k>i){let s=0;for(let j=0;j<Math.min(lens[i],lens[k]);j++)s+=h[mod(C[i][j]-C[k][j])];pairs.push({i,k,s})}pairs.sort((a,b)=>b.s-a.s);
const a=pairs[0],b=pairs.find(x=>x.i!==a.i&&x.k!==a.i&&x.i!==a.k&&x.k!==a.k),u=Array(lens.length).fill(-1),post=Array.from({length:m},()=>Float64Array.from({length:Q},()=>1/Q));
function multiply(i,z,remove=false){const sh=shift[z];for(let j=0;j<lens[i];j++){const p=post[j],l=lk[C[i][j]];let s=0;for(let k=0;k<Q;k++){p[k]=remove?p[k]/l[sh[k]]:p[k]*l[sh[k]];s+=p[k]}for(let k=0;k<Q;k++)p[k]/=s}}
function add(i,z){u[i]=z;multiply(i,z)}
function activeStates(p){let a=[];for(let k=0;k<Q;k++)if(p[k]>1e-14)a.push(k);return a}
add(a.i,0);add(a.k,0);add(b.i,1);add(b.k,1);const order=[];
for(let step=4;step<fit.length;step++){
let pending=fit.filter(i=>u[i]<0),scores=pending.map(()=>new Float64Array(q)),maxPending=Math.max(...pending.map(i=>lens[i]));
let tmp=new Float64Array(q),pred=new Float64Array(Q),seen=new Uint8Array(q);
for(let j=0;j<maxPending;j++){
const p=post[j],active=activeStates(p);seen.fill(0);for(let i of pending)if(j<lens[i])seen[C[i][j]]=1;
for(let z=0;z<q;z++){const sh=shift[z],base=z*q;
if(active.length===1){const k=sh[active[0]];for(let c=0;c<q;c++)if(seen[c])pred[base+c]=llk[c][k]}
else{tmp.fill(0);for(let k of active)tmp[sh[k]]+=p[k];let nonzero=[];for(let k=0;k<q;k++)if(tmp[k])nonzero.push(k);for(let c=0;c<q;c++)if(seen[c]){let v=0,l=lk[c];for(let k of nonzero)v+=tmp[k]*l[k];pred[base+c]=Math.log(v)}}}
for(let i=0;i<pending.length;i++)if(j<lens[pending[i]]){let c=C[pending[i]][j],s=scores[i];for(let z=0;z<q;z++)s[z]+=pred[z*q+c]}}
let best=null;for(let i=0;i<pending.length;i++){let s=scores[i],ix=Array.from({length:q},(_,i)=>i).sort((a,b)=>s[b]-s[a]);let gap=s[ix[0]]-s[ix[1]];if(!best||gap>best.gap)best={i:pending[i],z:ix[0],gap}}add(best.i,best.z);order.push(best)}
const refined=[];
for(let pass=0;pass<5;pass++){let changes=0,gain=0;for(let i of fit){let old=u[i];multiply(i,old,true);let scores=Array(q).fill(0);for(let j=0;j<lens[i];j++){let p=post[j],active=activeStates(p),l=lk[C[i][j]];if(active.length===1){let k=active[0];for(let z=0;z<q;z++)scores[z]+=llk[C[i][j]][shift[z][k]]}else for(let z=0;z<q;z++){let sh=shift[z],s=0;for(let k of active)s+=p[k]*l[sh[k]];scores[z]+=Math.log(s)}}let z=old;for(let k=0;k<q;k++)if(scores[k]>scores[z]+1e-7)z=k;if(z!==old){changes++;gain+=scores[z]-scores[old]}add(i,z)}refined.push({changes,gain});if(!changes)break}
const mono=[],cand=[];for(let j=0;j<m;j++){let p=post[j],ix=Array.from({length:Q},(_,k)=>k).sort((a,b)=>p[b]-p[a]);mono.push(ix[0]);cand.push(ix.slice(0,32))}
function mapState(k,i,j){return mod(C[i][j]-shift[u[i]][k])}
let score=cand[0].map(k=>fit.reduce((s,i)=>s+log[mapState(k,i,0)],0)),back=[null];
for(let j=1;j<maxFit;j++){let rows=fit.filter(i=>lens[i]>j),prev=cand[j-1],cur=cand[j],prevP=prev.map(k=>rows.map(i=>mapState(k,i,j-1))),curP=cur.map(k=>rows.map(i=>mapState(k,i,j))),ns=[],bp=[];for(let b=0;b<cur.length;b++){let best=-Infinity,bestA=0;for(let a=0;a<prev.length;a++){let s=score[a];for(let k=0;k<rows.length;k++)s+=bi[prevP[a][k]][curP[b][k]];if(s>best){best=s;bestA=a}}ns.push(best);bp.push(bestA)}score=ns;back.push(bp)}
let idx=score.indexOf(Math.max(...score)),key=Array(m).fill(0);for(let j=maxFit-1;j>=0;j--){key[j]=cand[j][idx];if(j)idx=back[j][idx]}
function decode(row,z,K){return row.map((c,j)=>mod(c-shift[z][K[j]]))}
function infer(row,K){let best=-Infinity,zbest=0,second=-Infinity;for(let z=0;z<q;z++){let s=logp(decode(row.slice(0,48),z,K));if(s>best){second=best;best=s;zbest=z}else if(s>second)second=s}return{z:zbest,gap:best-second,P:decode(row,zbest,K)}}
const held=hold.map(i=>({i,...infer(C[i],key)})),monoHeld=hold.map(i=>({i,...infer(C[i],mono)}));
const all=fit.map(i=>({i,z:u[i],P:decode(C[i],u[i],key)})).concat(held);if(all.some(x=>x.P.some((p,j)=>mod(p+shift[x.z][key[j]])!==C[x.i][j])))throw Error("replay");
return{u,key,mono,held,monoHeld,all,a,b,order,refined,topPair:pairs[0].s,fitScore:all.filter(x=>fit.includes(x.i)).reduce((s,x)=>s+logp(x.P),0)/fit.reduce((s,i)=>s+lens[i],0),infer}}
function baseline(C){let k=[];for(let j=0;j<q;j++){let s=Array(q).fill(0);for(let i of fit)for(let z=j;z<lens[i];z+=q)for(let x=0;x<q;x++)s[x]+=log[mod(C[i][z]-x)];k.push(s.indexOf(Math.max(...s)))}let held=hold.map(i=>({i,P:C[i].map((x,j)=>mod(x-k[j%q]))}));return{held,k}}
function stats(held,P){let N=0,score=0,correct=0,n200=0,c200=0;for(let x of held){N+=x.P.length-48;score+=logp(x.P,48);for(let j=48;j<x.P.length;j++){if(P&&x.P[j]===P[x.i][j])correct++;if(j<200){n200++;if(P&&x.P[j]===P[x.i][j])c200++}}}return{N,score:score/N,correct:P?correct:null,n200,c200:P?c200:null}}
function gauge(U,u){let best={n:0,a:0,b:0};for(let a=1;a<q;a++)for(let b=0;b<q;b++){let n=fit.filter(i=>U[i]===mod(a*u[i]+b)).length;if(n>best.n)best={n,a,b}}return best}
const p56=g.pages.find(p=>p.page===56).indices,prime=[];for(let n=2;prime.length<85;n++){let ok=true;for(let p of prime){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)prime.push(n)}let clock=0;const A56=p56.map((c,i)=>i===56?0:mod(c-prime[clock++]+1));if(A56.map(x=>g.translit[x]).join("")!=="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE"||clock!==84)throw Error("p56 control");const A57=g.pages.find(p=>p.page===57).indices;
const rnd=makeRng(3243+t*7919),offset0=18000+Math.floor(t%4/2)*13000;let offset=offset0,P=lens.map(n=>{let a=streams[t%2].slice(offset,offset+n);offset+=n;return a}),u=lens.map(()=>rnd(q)),v=Array.from({length:m},()=>rnd(q)),w=Array.from({length:m},()=>rnd(q)),Kper=Array.from({length:q},()=>rnd(q)),C=t===6?pages.map(p=>p.indices):P.map((p,i)=>p.map((x,j)=>mod(x+(t<4?u[i]*v[j]+w[j]:t===4?rnd(q):Kper[j%q]))));const result=solve(C),base=baseline(C),truth=t===6?null:P,ga=t<4?gauge(result.u,u):null,truthKey=t<4?Array.from({length:m},(_,j)=>{let k=0;while(mod(ga.a*k)!==v[j])k++;return q*k+mod(w[j]-ga.b*k)}):null;
let auth=[];if(t<4)for(let [page,p] of [[56,A56],[57,A57]]){let z=rnd(q),c=p.map((x,j)=>mod(x+z*v[j]+w[j])),d=result.infer(c,result.key);auth.push({page,coef:d.z===mod(ga.a*z+ga.b),correct:d.P.slice(48).filter((x,j)=>x===p[j+48]).length,n:p.length-48,preview:d.P.slice(48).map(x=>g.translit[x]).join("")})}
const out={t,kind:["rank1-gibran-A","rank1-emerson-A","rank1-gibran-B","rank1-emerson-B","iid-pad","period29-page-reset","original"][t],seed:3243+t*7919,offset:offset0,anchorPages:[result.a.i,result.a.k,result.b.i,result.b.k].map(i=>pages[i].page),anchorTruth:t<4?[u[result.a.i],u[result.a.k],u[result.b.i],u[result.b.k]]:null,topPair:result.topPair,refined:result.refined,gauge:ga,exactCols:truthKey?result.key.filter((x,j)=>x===truthKey[j]).length:null,exactColsFirst200:truthKey?result.key.slice(0,200).filter((x,j)=>x===truthKey[j]).length:null,fitCorrect:truth?result.all.filter(x=>fit.includes(x.i)).reduce((s,x)=>s+x.P.filter((p,j)=>p===P[x.i][j]).length,0):null,fitN:fit.reduce((s,i)=>s+lens[i],0),fitScore:result.fitScore,held:stats(result.held,truth),monoHeld:stats(result.monoHeld,truth),baseline:stats(base.held,truth),heldCoef:t<4?result.held.filter(x=>x.z===mod(ga.a*u[x.i]+ga.b)).length:null,auth,repeat:C.reduce((s,row)=>s+row.slice(1).filter((x,i)=>x===row[i]).length,0),heldPreview:result.held[0].P.slice(48,120).map(x=>g.translit[x]).join(""),replay:true};
if(t===6)out.originalCandidate={pages:pages.map(p=>p.page),u:result.u.map((z,i)=>z<0?result.held.find(x=>x.i===i).z:z),v:result.key.map(k=>Math.floor(k/q)),w:result.key.map(k=>k%q),held:result.held.map(x=>({page:pages[x.i].page,gap:x.gap,decoded:enc(x.P)})),baselineKey:base.k};
return{fit:fit.map(i=>pages[i].page),hold:hold.map(i=>pages[i].page),maxFit,m,uncoveredHold:hold.reduce((s,i)=>s+Math.max(0,lens[i]-maxFit),0),fitN:fit.reduce((s,i)=>s+lens[i],0),holdN:hold.reduce((s,i)=>s+lens[i]-48,0),trial:out}}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const data=paths.map(x=>fs.readFileSync(x,'utf8'));
const g=JSON.parse(data[0]),donors=data.slice(1);
const cases=process.argv[2]===undefined?[0,1,2,3,4,5,6]:[Number(process.argv[2])];
for(const t of cases)console.log(JSON.stringify(run(g,donors,t)));
