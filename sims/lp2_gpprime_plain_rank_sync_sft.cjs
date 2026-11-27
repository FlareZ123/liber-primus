'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,gibran,shakespeare,emerson){
const n=29,all=(1<<n)-1,range=()=>Array.from({length:n},(_,i)=>i),low=k=>(1<<k)-1,R=corpus.prime.map(x=>(x-1)%n),eq=(a,b)=>a.every((x,i)=>x===b[i]);
let seed=0xc031a137;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32},perm=()=>{let a=range();for(let i=n-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gm=new Map(corpus.translit.map((s,i)=>[s,i])),rm=new Map(corpus.runes.map((s,i)=>[s,i])),norm=lit=>{let D=[];for(let w of lit.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(gm.has(q)){D.push(gm.get(q));i+=2}else D.push(gm.get(w[i++]));}}return D};
gibran=gibran.toUpperCase();let a=gibran.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)gibran=gibran.slice(a);let b=gibran.indexOf("END OF THE PROJECT GUTENBERG");if(b>=0)gibran=gibran.slice(0,b);
const D=norm(gibran),train=[norm(shakespeare),norm(emerson),...native.sections.map(s=>[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x)))],C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),start=corpus.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),end=corpus.pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0);
if(D.length!==48084||C.length!==12956)throw Error("source");
const model=()=>{let u=new Float64Array(n).fill(1),b=new Float64Array(n*n),t=new Float64Array(n*n*n);for(let a of train)for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[n*a[i-1]+a[i]]++;if(i>1)t[n*n*a[i-2]+n*a[i-1]+a[i]]++;}let sum=u.reduce((x,y)=>x+y);for(let i=0;i<n;i++)u[i]/=sum;for(let i=0;i<n;i++){let s=0;for(let j=0;j<n;j++)s+=b[n*i+j];for(let j=0;j<n;j++)b[n*i+j]=(b[n*i+j]+10*u[j])/(s+10)}for(let i=0;i<n*n;i++){let s=0;for(let j=0;j<n;j++)s+=t[n*i+j];for(let j=0;j<n;j++)t[n*i+j]=Math.log((t[n*i+j]+10*b[n*(i%n)+j])/(s+10))}return t};
const T=model(),score=(P,a,b)=>{let s=0;for(let i=Math.max(2,a);i<b;i++)s+=T[n*n*P[i-2]+n*P[i-1]+P[i]];return s/(b-Math.max(2,a))};
const chart=(m,k)=>range().map(p=>(m*p+k)%n),inverse=S=>{let I=range();S.forEach((j,p)=>I[j]=p);return I};
const encode=(P,S,A)=>{A=A.slice();let C=[];for(let p of P){let j=S[p],c=A[j];C.push(c);A.splice(j,1);A.splice(R[p],0,c)}return C};
const decode=(C,S,A)=>{A=A.slice();let I=inverse(S),P=[];for(let c of C){let j=A.indexOf(c),p=I[j];P.push(p);A.splice(j,1);A.splice(R[p],0,c)}return {P,A}};
const sync=(C,S,tries)=>{let I=inverse(S),move=I.map(p=>R[p]),base=range(),as=Array.from({length:tries},perm),times=Array(tries).fill(-1),active=tries;
for(let i=0;i<C.length;i++){let c=C[i],j=base.indexOf(c);base.splice(j,1);base.splice(move[j],0,c);for(let k=0;k<tries;k++){if(times[k]>=0)continue;let a=as[k],j=a.indexOf(c);a.splice(j,1);a.splice(move[j],0,c);if(eq(a,base)){times[k]=i;active--}}if(!active)break}
return {matched:tries-active,tries,max:Math.max(...times),times}};
const domains=(C,S,truthA=null)=>{let I=inverse(S),move=I.map(p=>R[p]),d=Array(n).fill(all),next=Array(n).fill(0),h=Array(n).fill(0),sync=-1,maxAmb=0,lastAmb=0,checks=0,A=truthA?truthA.slice():null;
let traces=[];for(let i=0;i<C.length;i++){let c=C[i],js=d[c],njs=0;for(let x=js;x;x&=x-1)njs++;if(njs>1){maxAmb++;lastAmb=i}
next.fill(0);for(let x=js;x;x&=x-1){let j=31-Math.clz32(x&-x),r=move[j],lj=low(j),lr=low(r);next[c]|=1<<r;
for(let g=0;g<n;g++){if(g===c)continue;let z=d[g],rm=(z&lj)|((z&~low(j+1))>>>1);next[g]|=(rm&lr)|((rm&~lr)<<1)}}
for(;;){let single=0;for(let x of next)if(!(x&(x-1))){if(!x||single&x)throw Error("invalid domain");single|=x}
let changed=false;for(let g=0;g<n;g++){let x=next[g];if(x&(x-1)){let y=x&~single;if(!y)throw Error("empty domain");if(y!==x){next[g]=y;changed=true}}}if(!changed)break}
[d,next]=[next,d];if(A){let j=A.indexOf(c);A.splice(j,1);A.splice(move[j],0,c);for(let k=0;k<n;k++){if(!(d[A[k]]&(1<<k)))throw Error("lost state");checks++}}
if(sync<0&&d.every(x=>!(x&(x-1))))sync=i;
if(i===63||i===255||i===1023||i===C.length-1){let sizes=d.map(x=>{let k=0;for(;x;x&=x-1)k++;return k});traces.push({i,mean:sizes.reduce((a,b)=>a+b,0)/n,single:sizes.filter(x=>x===1).length})}
}
return {sync,ambiguousSelections:maxAmb,lastAmb,checks,traces}};
let controls=[];for(let k=0;k<3;k++){let P=D.slice(1001+k*10000,1001+k*10000+3008),S=chart([1,7,17][k],[0,13,4][k]),A=perm(),ct=encode(P,S,A);let q=decode(ct,S,range()).P,errors=q.reduce((s,p,i)=>s+(p!==P[i]),0);controls.push({k,m:[1,7,17][k],k0:[0,13,4][k],errors,lastError:q.findLastIndex((p,i)=>p!==P[i]),sync:sync(ct,S,32),domains:domains(ct,S,A)})}
let original=[];for(let [m,k] of [[1,0],[28,28],[7,13],[17,4]]){let S=chart(m,k);original.push({m,k,sync:sync(C,S,32),domains:domains(C,S,perm())})}
return {R,controls,original};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(...paths.map((p,i)=>i<2?JSON.parse(fs.readFileSync(p,'utf8')):fs.readFileSync(p,'utf8'))),null,2));
