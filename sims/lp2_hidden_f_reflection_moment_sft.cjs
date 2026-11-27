'use strict';
const fs=require('node:fs');
function run(g,donors,t){
const q=29,Q=q*q,M=Q*q,H=58,mod=x=>((x%q)+q)%q,sign=s=>s?-1:1;
const am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
const train=norm(donors[2]),counts=Array.from({length:q},()=>new Float64Array(q).fill(.2));
for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;
const T=counts.map(a=>{let sum=a.reduce((x,y)=>x+y,0);return Float64Array.from(a,x=>x/sum)});
let pi=new Float64Array(q).fill(1/q);
for(let i=0;i<200;i++){const a=new Float64Array(q);for(let x=0;x<q;x++)for(let y=0;y<q;y++)a[y]+=pi[x]*T[x][y];pi=a}
const logT=T.map(a=>Float64Array.from(a,Math.log));
const pages=g.pages.filter(x=>x.page<56&&x.indices.length),C0=pages.flatMap(x=>x.indices),fit=pages.filter(x=>x.page<40).reduce((s,p)=>s+p.indices.length,0);
if(C0.length!==12956||fit!==9640)throw Error("canonical source mismatch");
const D0=C0.slice(1).map((c,i)=>mod(c-C0[i]));
const rev=Array.from({length:q},(_,x)=>Float64Array.from(pi,(p,y)=>p*T[y][x]/pi[x]));
const target=D0.filter(d=>!d).length/D0.length;
function makeRng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}}
const rng=makeRng(3248+7919*t);
function uni(b){let h=Array.from({length:2},()=>new Float64Array(q));for(let s=0;s<2;s++)for(let x=0;x<q;x++)for(let y=0;y<q;y++)h[s][mod(sign(s)*y+b*x)]+=.5*pi[x]*T[x][y];return h}
let all=[];
for(let b=1;b<q;b++){const h=uni(b);for(let k0=0;k0<q;k0++)for(let k1=0;k1<q;k1++){let z=h[0][mod(-k0)]+h[1][mod(-k1)];all.push({b,k:[k0,k1],repeat:z})}}
const low=all.slice().sort((a,b)=>a.repeat-b.repeat),near=all.slice().sort((a,b)=>Math.abs(a.repeat-target)-Math.abs(b.repeat-target));
const plant=t%2===0?near[Math.min(31,near.length-1)]:low[0];
const source=t===0||t===2?norm(donors[0]):norm(donors[1]);
const offset=18000+Math.floor(t/2)*16000,P=source.slice(offset,offset+C0.length).concat(g.pages.find(p=>p.page===57).indices);
const s0=rng(2),c0=rng(q);
function encode(P,key,s0,c0){let s=s0,C=[c0];for(let i=1;i<P.length;i++){let d=mod(sign(s)*P[i]+key.b*P[i-1]+key.k[s]);C.push(mod(C[C.length-1]+d));s^=P[i]===0?1:0}return C}
let C=t===4?C0.slice():encode(P,plant,s0,c0),D=C.slice(1).map((c,i)=>mod(c-C[i]));
if(t===3){const nz=D.filter(Boolean);for(let i=nz.length-1;i>0;i--){const j=rng(i+1);[nz[i],nz[j]]=[nz[j],nz[i]]}let j=0;D=D.map(x=>x?nz[j++]:0);C=[c0];for(let d of D)C.push(mod(C[C.length-1]+d))}
const nfit=fit-1,du=new Uint32Array(q),db=new Uint32Array(Q),dt=new Uint32Array(M);
for(let i=0;i<nfit;i++){let d=D[i];du[d]++;if(i)db[D[i-1]*q+d]++;if(i>1)dt[(D[i-2]*q+D[i-1])*q+d]++}
const obs2=[],obs3=[];for(let j=0;j<Q;j++)if(db[j])obs2.push([Math.floor(j/q),j%q,db[j]]);for(let j=0;j<M;j++)if(dt[j])obs3.push([Math.floor(j/Q),Math.floor(j/q)%q,j%q,dt[j]]);
const keyeq=(a,b)=>a.b===b.b&&a.k[0]===b.k[0]&&a.k[1]===b.k[1];
const reflection={b:mod(-plant.b),k:plant.k.slice().reverse()};
function moment2(b){const h=Array.from({length:4},()=>new Float64Array(Q));for(let s=0;s<2;s++)for(let x=0;x<q;x++)for(let y=0;y<q;y++){let z=s^(y===0?1:0),d=mod(sign(s)*y+b*x),w=.5*pi[x]*T[x][y],a=h[s*2+z];for(let p=0;p<q;p++)a[d*q+mod(sign(z)*p+b*y)]+=w*T[y][p]}return h}
function moment3(b){const h=Array.from({length:8},()=>new Float64Array(M));for(let s=0;s<2;s++)for(let x=0;x<q;x++)for(let y=0;y<q;y++){let z=s^(y===0?1:0),d=mod(sign(s)*y+b*x),w=.5*pi[x]*T[x][y];for(let p=0;p<q;p++){let u=z^(p===0?1:0),e=mod(sign(z)*p+b*y),v=w*T[y][p],a=h[(s*2+z)*2+u],base=(d*q+e)*q;for(let j=0;j<q;j++)a[base+mod(sign(u)*j+b*p)]+=v*T[p][j]}}return h}
const shifts=Array.from({length:q},(_,k)=>Uint8Array.from({length:q},(_,d)=>mod(d-k)));
function score2(h,k){let score=0,a=shifts[k[0]],b=shifts[k[1]];for(const [d,e,n] of obs2){let p=h[0][a[d]*q+a[e]]+h[1][a[d]*q+b[e]]+h[2][b[d]*q+a[e]]+h[3][b[d]*q+b[e]];score+=n*Math.log(p)}return score}
function score3(h,k){let score=0,a=shifts[k[0]],b=shifts[k[1]];for(const [d,e,f,n] of obs3){let p=0;for(let s=0;s<2;s++)for(let z=0;z<2;z++)for(let u=0;u<2;u++){let i=(s?b:a)[d],j=(z?b:a)[e],l=(u?b:a)[f];p+=h[(s*2+z)*2+u][(i*q+j)*q+l]}score+=n*Math.log(p)}return score}
for(let b=1;b<q;b++){const h=moment2(b);for(let k0=0;k0<q;k0++)for(let k1=0;k1<q;k1++){let a=all[(b-1)*Q+k0*q+k1];a.pair=score2(h,a.k)}}
const pair=all.slice().sort((a,b)=>b.pair-a.pair),top=pair.slice(0,128),cache=new Map();
for(let a of top){if(!cache.has(a.b))cache.set(a.b,moment3(a.b));a.triple=score3(cache.get(a.b),a.k)}
const triples=top.slice().sort((a,b)=>b.triple-a.triple);
function compile(key){let next=new Uint8Array(H*q),score=new Float64Array(H*q);for(let s=0;s<2;s++)for(let x=0;x<q;x++)for(let d=0;d<q;d++){let y=mod(sign(s)*(d-key.b*x-key.k[s])),z=s^(y===0?1:0),i=(s*q+x)*q+d;next[i]=z*q+y;score[i]=logT[x][y]}
for(let d=0;d<q;d++){let z=new Set();for(let i=0;i<H;i++)z.add(next[i*q+d]);if(z.size!==H)throw Error("nonbijective state update")}
return {next,score}}
function fitkey(key){let {next,score}=compile(key),paths=[];for(let init=0;init<H;init++){let st=init,z=Math.log(pi[init%q]/2);for(let i=0;i<nfit;i++){let j=st*q+D[i];z+=score[j];st=next[j]}paths.push({init,score:z,st})}paths.sort((a,b)=>b.score-a.score);return {...key,best:paths[0],second:paths[1]}}
const full=triples.slice(0,64).map(fitkey).sort((a,b)=>b.best.score-a.best.score),best=full[0],compiled=compile(best);let st=best.best.init,decoded=[st%q],scores=[];
for(let d of D){const j=st*q+d;scores.push(compiled.score[j]);st=compiled.next[j];decoded.push(st%q)}
const replay=encode(decoded,best,Math.floor(best.best.init/q),C[0]);if(!replay.every((x,i)=>x===C[i]))throw Error("replay");
function rank(rows){let basis=[];for(let row of rows){let v=Float64Array.from(row),initial=Math.sqrt(v.reduce((s,x)=>s+x*x,0));for(let pass=0;pass<2;pass++)for(let u of basis){let a=0;for(let j=0;j<v.length;j++)a+=v[j]*u[j];for(let j=0;j<v.length;j++)v[j]-=a*u[j]}let n=Math.sqrt(v.reduce((s,x)=>s+x*x,0));if(n>1e-9*initial){for(let j=0;j<v.length;j++)v[j]/=n;basis.push(v)}}return basis.length}
function views(key){let L=[],R=[];for(let s=0;s<2;s++)for(let x=0;x<q;x++){let l=new Float64Array(Q),r=new Float64Array(Q);for(let y=0;y<q;y++)for(let z=0;z<q;z++){
let a=mod(sign(s)*y+key.b*x+key.k[s]),ns=s^(y===0?1:0),b=mod(sign(ns)*z+key.b*y+key.k[ns]);r[a*q+b]+=T[x][y]*T[y][z];
let prevs=s^(x===0?1:0),prevprevs=prevs^(y===0?1:0),e=mod(sign(prevs)*x+key.b*y+key.k[prevs]),d=mod(sign(prevprevs)*y+key.b*z+key.k[prevprevs]);l[d*q+e]+=rev[x][y]*rev[y][z]}
L.push(l);R.push(r)}
return {left2rank:rank(L),right2rank:rank(R),left1rank:rank(L.map(row=>Float64Array.from({length:q},(_,j)=>{let z=0;for(let i=0;i<q;i++)z+=row[i*q+j];return z}))),right1rank:rank(R.map(row=>Float64Array.from({length:q},(_,i)=>row.slice(i*q,(i+1)*q).reduce((s,x)=>s+x,0))))}}
const native=t<3,match=(a,b,start,end)=>a.slice(start,end).reduce((s,x,i)=>s+(x===b[start+i]),0),avg=(a,i,j)=>a.slice(i,j).reduce((x,y)=>x+y,0)/(j-i);
return {trial:t,native,fit,held: C0.length-fit,sourceRepeatCount:D0.filter(d=>!d).length,repeatCount:D.slice(0,C0.length-1).filter(d=>!d).length,expectedRepeat:plant.repeat,minimumExpectedRepeat:low[0].repeat,target,plant:native?{...plant,s0,seed:P[0]}:null,plantPairRank:native?pair.findIndex(a=>keyeq(a,plant))+1:null,plantTripleRank:native?triples.findIndex(a=>keyeq(a,plant))+1:null,reflectionRank:native?pair.findIndex(a=>keyeq(a,reflection))+1:null,best:{b:best.b,k:best.k,init:best.best.init,fitScore:best.best.score/nfit,initGap:best.best.score-best.second.score,keyGap:best.best.score-full[1].best.score},exactFit:native?match(decoded,P,0,fit):null,exactHeld:native?match(decoded,P,fit,C0.length):null,authentic57:native?match(decoded,P,C0.length,P.length):null,heldScore:avg(scores,nfit,C0.length-1),heldHead:decoded.slice(fit,fit+140).map(x=>g.translit[x]).join(""),viewRanks:views(best),replay:true,modelTop:full.slice(0,4).map(a=>({b:a.b,k:a.k,score:a.best.score,init:a.best.init}))}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const g=JSON.parse(fs.readFileSync(paths[0],'utf8')), donors=paths.slice(1).map(p=>fs.readFileSync(p,'utf8'));
const ts=process.argv.length>2?[Number(process.argv[2])]:[0,1,2,3,4];
for(const t of ts) console.log(JSON.stringify(run(g,donors,t)));
