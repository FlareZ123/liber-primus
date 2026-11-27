'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,literary){
const assert=(x,m)=>{if(!x)throw Error(m)},n=29,all=(1<<n)-1,low=k=>(1<<k)-1,range=()=>Array.from({length:n},(_,i)=>i);
const R=corpus.prime.map(p=>(p-1)%29),C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const start=corpus.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),end=corpus.pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0),chapter=C.slice(start,end);
assert(C.length===12956&&chapter.length===3008,"source size");
let lit=literary.toUpperCase(),a=lit.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)lit=lit.slice(a);let b=lit.indexOf("END OF THE PROJECT GUTENBERG");if(b>=0)lit=lit.slice(0,b);
let gMap=new Map(corpus.translit.map((x,i)=>[x,i])),D=[];
for(let w of lit.match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(gMap.has(q)){D.push(gMap.get(q));i+=2}else{assert(gMap.has(w[i]),"unmapped");D.push(gMap.get(w[i++]));}}}
assert(D.length===48084,"donor");
const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const encode=(P,S,A,kind="cipher",hold=false)=>{A=A.slice();let out=[];for(let p of P){if(hold&&p===0){out.push(0);continue}let j=S[p],c=A[j];out.push(c);A.splice(j,1);A.splice(R[kind==="cipher"?c:p],0,c)}return out};
const decode=(C,S,A,kind="cipher")=>{A=A.slice();let inv=range();S.forEach((r,p)=>inv[r]=p);let P=[];for(let c of C){let j=A.indexOf(c),p=inv[j];P.push(p);A.splice(j,1);A.splice(R[kind==="cipher"?c:p],0,c)}return P};
const bound=(C,begin,end)=>{
let dom=Array(n).fill(all),h=Array(n).fill(0),sync=-1,amb=0;
for(let i=0;i<end;i++){let c=C[i],r=R[c],m=dom[c];if(i>=begin){if(m&(m-1))amb++;for(let x=m;x;x&=x-1)h[31-Math.clz32(x&-x)]++}
let mn=31-Math.clz32(m&-m),mx=31-Math.clz32(m),lr=low(r),lm=low(mn+1),lx=low(mx);
for(let g=0;g<n;g++){if(g===c)continue;let x=dom[g],rm=((x&~lm)>>>1)|(x&lx);dom[g]=(rm&lr)|((rm&~lr)<<1);assert(dom[g],"empty domain")}
dom[c]=1<<r;if(sync<0&&dom.every(x=>(x&(x-1))===0))sync=i;
}let top=h.slice().sort((a,b)=>b-a);return {n:end-begin,sync,amb,top2:top[0]+top[1],hist:h};
};
const scan=(C,D,kind)=>{
let reps=[];for(let i=1;i<C.length;i++)if(C[i]===C[i-1])reps.push(i);
let wins=D.length-C.length+1,posPass=0,negPass=0,complete=0,unknown=0,examples=[];
const f=new Int16Array(n),g=new Int16Array(n),sf=new Int32Array(n),sg=new Int32Array(n);
for(let s=0;s<wins;s++){let stamp=s+1,ok=true,mapped=0;
for(let i of reps){let p=D[s+i],r=R[kind==="cipher"?C[i-1]:D[s+i-1]];if(sf[p]===stamp&&f[p]!==r||sg[r]===stamp&&g[r]!==p){ok=false;break}
if(sf[p]!==stamp){sf[p]=stamp;f[p]=r;sg[r]=stamp;g[r]=p;mapped++}}
if(!ok)continue;posPass++;let forbidden=Array(n).fill(0);
for(let i=1;i<C.length;i++){if(C[i]===C[i-1])continue;let p=D[s+i],r=R[kind==="cipher"?C[i-1]:D[s+i-1]];if(sf[p]===stamp&&f[p]===r){ok=false;break}forbidden[p]|=1<<r}
if(!ok)continue;negPass++;
// Proposed donor fixes the insertion schedule in both roles. Propagate
// possible initial-list ranks and intersect each plaintext's static rank
// domain with every observed occurrence, without guessing an initial order.
let sd=range().map(p=>(sf[p]===stamp?1<<f[p]:all)&~forbidden[p]),dom=Array(n).fill(all);
for(let i=0;i<C.length;i++){let p=D[s+i],c=C[i],r=R[kind==="cipher"?c:p],a=dom[c]&sd[p];sd[p]=a;if(!a){ok=false;break}
let mn=31-Math.clz32(a&-a),mx=31-Math.clz32(a),lr=low(r),lm=low(mn+1),lx=low(mx);
for(let g=0;g<n;g++){if(g===c)continue;let x=dom[g],rm=((x&~lm)>>>1)|(x&lx);dom[g]=(rm&lr)|((rm&~lr)<<1);if(!dom[g])ok=false}
dom[c]=1<<r;if(!ok)break;
}
if(!ok)continue;
let S=range().map(p=>-1),free=range(),rs=range();
free.sort((p,q)=>{let count=x=>{let k=0;for(;x;x&=x-1)k++;return k};return count(sd[p])-count(sd[q])});
let nodes=0,capped=false,solutions=0;
const visit=(k,used)=>{if(++nodes>200000){capped=true;return}if(k<free.length){let p=free[k];for(let r of rs){if((used&(1<<r))||!(sd[p]&(1<<r)))continue;S[p]=r;visit(k+1,used|(1<<r));if(capped)break}S[p]=-1;return}
let slots=range(),bind=Array(n).fill(-1),rev=Array(n).fill(-1);for(let i=0;i<C.length;i++){let p=D[s+i],j=S[p],slot=slots[j],c=C[i],r=R[kind==="cipher"?c:p];if(bind[slot]>=0&&bind[slot]!==c||rev[c]>=0&&rev[c]!==slot)return;bind[slot]=c;rev[c]=slot;slots.splice(j,1);slots.splice(r,0,slot)}
let unseen=range().filter(c=>rev[c]<0);for(let j=0;j<n;j++)if(bind[j]<0)bind[j]=unseen.shift();assert(eq(encode(D.slice(s,s+C.length),S,bind,kind),C),"replay");solutions++;if(examples.length<10)examples.push({s,mapped,S:S.slice(),A:bind});
};visit(0,0);if(solutions)complete++;if(capped)unknown++;
}return {n:C.length,wins,repeats:reps.length,posPass,negPass,complete,unknown,examples};
};
let seed=0xa1087329;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32},perm=()=>{let a=range();for(let i=n-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let controls=[];
for(let kind of ["cipher","plain"])for(let s of [1001,20001]){let P=D.slice(s,s+C.length),S=perm(),A=perm(),ct=encode(P,S,A,kind);assert(eq(decode(ct,S,A,kind),P),"plant inverse");let q=scan(ct,D,kind),hit=q.examples.find(x=>x.s===s&&eq(x.S,S)&&eq(x.A,A));controls.push({kind,s,...q,exactKey:!!hit})}
let sm=new Map(corpus.runes.map((r,i)=>[r,i])),sets=native.sections.map(s=>[...s.source_text].filter(x=>sm.has(x)).map(x=>sm.get(x)));
let u=Array(n).fill(1),B=Array.from({length:n},()=>Array(n).fill(0)),T=Array.from({length:n*n},()=>Array(n).fill(0));for(let P of sets)for(let i=0;i<P.length;i++){u[P[i]]++;if(i)B[P[i-1]][P[i]]++;if(i>1)T[n*P[i-2]+P[i-1]][P[i]]++}
let U=u.reduce((a,b)=>a+b,0),p1=u.map(x=>x/U),p2=B.map(row=>{let s=row.reduce((a,b)=>a+b,0);return row.map((x,j)=>(x+10*p1[j])/(s+10))}),p3=T.map((row,k)=>{let s=row.reduce((a,b)=>a+b,0);return row.map((x,j)=>Math.log((x+10*p2[k%n][j])/(s+10)))});
const score=(P,a,b)=>{let z=0;for(let i=Math.max(2,a);i<b;i++)z+=p3[n*P[i-2]+P[i-1]][P[i]];return z/(b-Math.max(2,a))};
const canonical=[];for(let kind of ["cipher","plain"]){let best={fit:-Infinity};for(let m=1;m<n;m++)for(let k=0;k<n;k++){let S=range().map(p=>(m*p+k)%n),P=decode(C,S,range(),kind),fit=score(P,0,729);if(fit>best.fit)best={m,k,fit,held:score(P,start,end),preview:P.slice(start,start+140).map(x=>corpus.translit[x]).join(""),replay:eq(encode(P,S,range(),kind),C)}}canonical.push({kind,...best})}
return {R,source:{N:C.length,start,end,donor:D.length},bounds:{whole:bound(C,0,C.length),carried:bound(C,start,end),chapter:bound(chapter,0,chapter.length)},original:["cipher","plain"].map(kind=>({kind,whole:scan(C,D,kind),chapter:scan(chapter,D,kind)})),controls,canonical};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),fs.readFileSync(paths[2],'utf8')),null,2));
