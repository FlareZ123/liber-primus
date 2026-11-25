'use strict';
// Agent 2: spacing-free prime-clock moving escape, exact phasewise rank assignment.
const fs=require('node:fs');
function experiment(c,n,g){
const mod=(x,m)=>(x%m+m)%m,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);const check=(x,msg)=>{if(!x)throw Error(msg)};
const ct=c.pages.slice(0,56).flatMap(p=>p.indices),N=ct.length;check(N===12956,"original size");
const native=n.sections.map(s=>Array.from(s.source_text).map(x=>c.runes.indexOf(x)).filter(x=>x>=0));const train=native.flat();const counts=Array(29).fill(.5);for(const p of train)counts[p]++;const lp=counts.map(x=>Math.log(x/(train.length+14.5)));
const bi=Array.from({length:29},()=>Array(29).fill(.25));for(const s of native)for(let i=1;i<s.length;i++)bi[s[i-1]][s[i]]++;for(const row of bi){const sum=row.reduce((a,b)=>a+b);for(let j=0;j<29;j++)row[j]=Math.log(row[j]/sum);}
const bodyStart=g.indexOf("|Almustafa"),bodyEnd=g.indexOf("*** END OF");check(bodyStart>0&&bodyEnd>bodyStart,"Gibran body");
const labels=c.translit;const map=Object.fromEntries(labels.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);const donor=[];for(let w of g.slice(bodyStart,bodyEnd).toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){const k=keys.find(x=>w.startsWith(x));check(k,"token "+w);donor.push(map[k]);w=w.slice(k.length);}}check(donor.length>=2*N,"donor size");
const prime=[];for(let x=2;prime.length<=N;x++){let ok=true;for(const p of prime){if(p*p>x)break;if(x%p===0){ok=false;break;}}if(ok)prime.push(x);}
const log=Array(29).fill(-1),pow=[];let a=1;for(let i=0;i<28;i++){pow.push(a);log[a]=i;a=a*15%29;}check(new Set(pow).size===28,"root");
function obs(cipher,q,hold,shift){let t=0,last=0;return cipher.map(y=>{const d=mod(y-last,29),e=prime[t]%29,z=d?mod(log[d]-(shift?(prime[t]-1):0),28):-1,ph=t%q;last=y;if(d||!hold)t++;return [ph,z,e];});}
function decode(o,K){return o.map(([p,z,e])=>z<0?e:K[p][z]+Number(K[p][z]>=e));}
function encode(P,K,hold,shift){let t=0,last=0;const C=[];for(const p of P){const e=prime[t]%29;if(p!==e){const rank=p-Number(p>e),z=K[t%K.length].indexOf(rank);check(z>=0,"map");last=mod(last+pow[mod(z+(shift?prime[t]-1:0),28)],29);t++;}else if(!hold)t++;C.push(last);}return C;}
function assignment(W){const n=W.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-W[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<d){d=min[j];j1=j;}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d;}else min[j]-=d;}j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}const ans=Array(n);for(let j=1;j<=n;j++)ans[p[j]-1]=j-1;return ans;}
function fit(o,q,weights){const W=Array.from({length:q},()=>Array.from({length:28},()=>Array(28).fill(0)));for(const [p,z,e] of o)if(z>=0)for(let rank=0;rank<28;rank++)W[p][z][rank]+=weights[rank+Number(rank>=e)];return W.map(assignment);}
const mean=(a)=>a.reduce((x,y)=>x+y,0)/a.length;
const score=P=>({unigram:mean(P.map(x=>lp[x])),bigram:mean(P.slice(1).map((x,i)=>bi[P[i]][x])),E:P.filter(x=>x===18).length});
let rng=123456789;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};function randomkey(q){return Array.from({length:q},()=>{const row=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){const j=rnd()%(i+1);[row[i],row[j]]=[row[j],row[i]];}return row;});}
const cut=Math.floor(N*.75),results=[],controls=[donor.slice(0,N),donor.slice(N,2*N)];
for(const q of [8,13])for(const hold of [false,true])for(const shift of [false,true]){
const o=obs(ct,q,hold,shift),full=fit(o,q,lp),fullP=decode(o,full),eKey=fit(o,q,Array.from({length:29},(_,i)=>Number(i===18))),eCap=decode(o,eKey).filter(x=>x===18).length;const k=fit(o.slice(0,cut),q,lp),P=decode(o,k);check(eq(encode(P,k,hold,shift),ct)&&eq(encode(fullP,full,hold,shift),ct),"original replay");
const plants=controls.map((target,i)=>{const secret=randomkey(q),C=encode(target,secret,hold,shift),O=obs(C,q,hold,shift);check(eq(decode(O,secret),target),"plant replay");const guess=fit(O.slice(0,cut),q,lp),gp=decode(O,guess);check(eq(encode(gp,guess,hold,shift),C),"guess replay");const fullGuess=decode(O,fit(O,q,lp)),maxE=decode(O,fit(O,q,Array.from({length:29},(_,i)=>Number(i===18)))).filter(x=>x===18).length;check(maxE>=score(target).E&&score(fullGuess).unigram>=score(target).unigram-1e-9,"assignment ceiling");return {i,real:score(target),maxUnigram:score(fullGuess).unigram,maxE,fit:score(gp.slice(0,cut)),holdout:score(gp.slice(cut)),trueHoldout:score(target.slice(cut)),accuracy:mean(gp.slice(cut).map((x,j)=>Number(x===target[cut+j]))),keyEntries:secret.flat().filter((x,j)=>x===guess.flat()[j]).length,repeat:C.filter((x,j)=>j&&x===C[j-1]).length};});
results.push({q,hold,shift,eCap,full:score(fullP),fit:score(P.slice(0,cut)),holdout:score(P.slice(cut)),prefix:P.slice(0,160).map(x=>labels[x]).join(""),key:k,fullKey:full,plants});}
return {N,cut,sourceNativeLength:train.length,donorLength:donor.length,controlScores:controls.map(score),results};
}
const data=experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')),fs.readFileSync('resources/control/gibran_prophet_58585.txt','utf8'));
console.log(JSON.stringify(data,null,2));
