'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,literary){
const assert=(x,m)=>{if(!x)throw Error(m)}, n=29,range=()=>Array.from({length:n},(_,i)=>i);
const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices), N=C.length;assert(N===12956,"corpus");
const prime=[];for(let k=2;prime.length<N+464;k++){let ok=true;for(let d of prime){if(d*d>k)break;if(k%d===0){ok=false;break}}if(ok)prime.push(k)}
const origins=prime.filter(x=>x<=3301).length;assert(origins===464,"origins");
const R=prime.map(p=>(p-1)%29);
let lit=literary.toUpperCase(),a=lit.indexOf("ALMUSTAFA, THE CHOSEN"),b=lit.indexOf("END OF THE PROJECT GUTENBERG");if(a>=0)lit=lit.slice(a);b=lit.indexOf("END OF THE PROJECT GUTENBERG");if(b>=0)lit=lit.slice(0,b);
const gpmap=new Map(corpus.translit.map((x,i)=>[x,i])),D=[];for(let w of lit.match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let d=w.slice(i,i+2);if(gpmap.has(d)){D.push(gpmap.get(d));i+=2}else{assert(gpmap.has(w[i]),"glyph");D.push(gpmap.get(w[i++]));}}}assert(D.length===48084,"donor length");
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const encode=(P,o,S,A)=>{A=A.slice();let out=[];for(let i=0;i<P.length;i++){let j=S[P[i]],c=A[j];out.push(c);A.splice(j,1);A.splice(R[o+i],0,c)}return out};
const decode=(C,o,S,A)=>{A=A.slice();let inv=range();S.forEach((v,k)=>inv[v]=k);let out=[];for(let i=0;i<C.length;i++){let c=C[i],j=A.indexOf(c);out.push(inv[j]);A.splice(j,1);A.splice(R[o+i],0,c)}return out};
const scan=(C,D,os)=>{
 const reps=[];for(let i=1;i<C.length;i++)if(C[i]===C[i-1])reps.push(i);
 const wins=D.length-C.length+1;let posPass=0,negPass=0,completePass=0,partialPass=0,checked=0,examples=[];
 const f=new Int16Array(n),g=new Int16Array(n),stampF=new Int32Array(n),stampG=new Int32Array(n);let stamp=0;
 for(const o of os){const rr=reps.map(i=>R[o+i-1]);for(let s=0;s<wins;s++){checked++;stamp++;let ok=true,mapped=0;for(let k=0;k<reps.length;k++){let p=D[s+reps[k]],r=rr[k];if(stampF[p]===stamp&&f[p]!==r||stampG[r]===stamp&&g[r]!==p){ok=false;break}if(stampF[p]!==stamp){stampF[p]=stamp;f[p]=r;stampG[r]=stamp;g[r]=p;mapped++}}if(!ok)continue;posPass++;
 for(let i=1;i<C.length;i++){let p=D[s+i],r=R[o+i-1];if(C[i]!==C[i-1]&&stampF[p]===stamp&&f[p]===r){ok=false;break}}if(!ok)continue;negPass++;
 const S=Array.from(f,(v,p)=>stampF[p]===stamp?v:-1),free=range().filter(p=>S[p]<0),freeRanks=range().filter(r=>stampG[r]!==stamp);
 const forbidden=Array(n).fill(0);for(let i=1;i<C.length;i++)if(C[i]!==C[i-1])forbidden[D[s+i]]|=1<<R[o+i-1];
 let completions=0, nodes=0, capped=false;
 const visit=(k,used)=>{if(++nodes>200000){capped=true;return}if(k<free.length){let p=free[k];for(let r of freeRanks){if((used|forbidden[p])&(1<<r))continue;S[p]=r;visit(k+1,used|(1<<r));if(capped)break}S[p]=-1;return}
 const slots=range(),bind=Array(n).fill(-1),rev=Array(n).fill(-1);
 for(let i=0;i<C.length;i++){let j=S[D[s+i]],slot=slots[j],c=C[i];if(bind[slot]>=0&&bind[slot]!==c||rev[c]>=0&&rev[c]!==slot)return;bind[slot]=c;rev[c]=slot;slots.splice(j,1);slots.splice(R[o+i],0,slot)}
 const unseen=range().filter(c=>rev[c]<0);for(let j=0;j<n;j++)if(bind[j]<0)bind[j]=unseen.shift();
 assert(equal(encode(D.slice(s,s+C.length),o,S,bind),C),"candidate replay");
 completions++;if(examples.length<10)examples.push({o,s,mapped,kind:"complete",S:S.slice(),A:bind,exact:true});
 };free.sort((p,q)=>freeRanks.filter(r=>!(forbidden[p]&(1<<r))).length-freeRanks.filter(r=>!(forbidden[q]&(1<<r))).length);visit(0,0);
 if(completions)completePass++;if(capped)partialPass++;
 }}
 return {n:C.length,repeats:reps.length,windows:wins,origins:os.length,checked,posPass,negPass,completePass,partialPass,examples}
};
let seed=0x91de15a1;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};const perm=()=>{let a=range();for(let i=n-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const controls=[];for(const [s,o] of [[1001,37],[20001,229]]){let P=D.slice(s,s+N),S=perm(),A=perm(),cp=encode(P,o,S,A);assert(equal(decode(cp,o,S,A),P),"plant invert");let q=scan(cp,D,Array.from({length:origins},(_,i)=>i));let hit=q.examples.find(x=>x.s===s&&x.kind==="complete");controls.push({s,o,truthS:S,truthA:A,...q,exactKey:q.examples.some(x=>x.s===s&&x.o===o&&equal(x.S,S)&&equal(x.A,A)),exactPlain:!!hit&&hit.exact})}
const os=Array.from({length:origins},(_,i)=>i);
const start=corpus.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),end=corpus.pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0);
const whole=scan(C,D,os),chapter=scan(C.slice(start,end),D,os);
const symbol=new Map(corpus.runes.map((r,i)=>[r,i])),sets=native.sections.map(s=>[...s.source_text].filter(c=>symbol.has(c)).map(c=>symbol.get(c)));
const u=Array(n).fill(1),B=Array.from({length:n},()=>Array(n).fill(0)),T=Array.from({length:n*n},()=>Array(n).fill(0));for(const P of sets)for(let i=0;i<P.length;i++){u[P[i]]++;if(i)B[P[i-1]][P[i]]++;if(i>1)T[n*P[i-2]+P[i-1]][P[i]]++}
const U=u.reduce((x,y)=>x+y,0),p1=u.map(x=>x/U),p2=B.map(row=>{let s=row.reduce((x,y)=>x+y,0);return row.map((x,j)=>(x+10*p1[j])/(s+10))}),p3=T.map((row,k)=>{let s=row.reduce((x,y)=>x+y,0);return row.map((x,j)=>Math.log((x+10*p2[k%n][j])/(s+10)))});
const score=(P,a,b)=>{let z=0;for(let i=Math.max(2,a);i<b;i++)z+=p3[n*P[i-2]+P[i-1]][P[i]];return z/(b-Math.max(2,a))};
let best={fit:-Infinity},maxTop2=0;for(let o of os){const P=decode(C,o,range(),range()),fit=score(P,0,729);if(fit>best.fit)best={o,fit,held:score(P,start,end),preview:P.slice(start,start+140).map(x=>corpus.translit[x]).join(""),replay:equal(encode(P,o,range(),range()),C)};const hist=Array(n).fill(0);P.slice(start,end).forEach(x=>hist[x]++);hist.sort((x,y)=>y-x);maxTop2=Math.max(maxTop2,hist[0]+hist[1])}

// A domain mask for each glyph tracks every possible initial permutation.
// Selected old rank a and other glyph rank b must be distinct. The union
// over a<b and a>b requires only the smallest and largest possible a.
const all=(1<<29)-1, low=k=>((1<<k)-1), masks=Array.from({length:29},(_,i)=>1<<i);
const step=(domains,c,r)=>{
 const selected=domains[c],mn=31-Math.clz32(selected&-selected),mx=31-Math.clz32(selected);
 for(let g=0;g<n;g++){if(g===c)continue;let x=domains[g];
 const removed=((x&~low(mn+1))>>>1)|(x&low(mx));
 domains[g]=(removed&low(r))|((removed&~low(r))<<1);
 assert(domains[g]!==0,"empty position domain");
 }
 domains[c]=1<<r;return selected;
};
const cap=(C,origins,begin,end)=>{
 let best={top2:0},maxSingletonLoss=0,minSync=Infinity,maxSync=0,unsynced=0;
 for(let o of origins){let dom=Array(n).fill(all),hist=Array(n).fill(0),amb=0,sync=-1;
 for(let i=0;i<end;i++){const m=step(dom,C[i],R[o+i]);if(sync<0&&dom.every(x=>(x&(x-1))===0))sync=i;
 if(i>=begin){if((m&(m-1))!==0)amb++;for(let x=m;x;x&=x-1)hist[31-Math.clz32(x&-x)]++}}
 let h=hist.slice().sort((a,b)=>b-a);if(h[0]+h[1]>best.top2)best={o,top2:h[0]+h[1],hist,amb,sync};
 maxSingletonLoss=Math.max(maxSingletonLoss,amb);
 if(sync<0)unsynced++;else{minSync=Math.min(minSync,sync);maxSync=Math.max(maxSync,sync)}
 }return {best,maxSingletonLoss,minSync:Number.isFinite(minSync)?minSync:null,maxSync,unsynced};
};
// Check abstract-domain containment using independently generated initial lists.
let domainChecks=0;for(let k=0;k<12;k++){const o=(k*37)%464,A=perm(),dom=Array(n).fill(all);for(let i=0;i<500;i++){let c=C[k*500+i],j=A.indexOf(c);const m=step(dom,c,R[o+i]);assert((m&(1<<j))!==0,"actual selected rank lost");A.splice(j,1);A.splice(R[o+i],0,c);for(let l=0;l<n;l++){assert((dom[A[l]]&(1<<l))!==0,"actual alphabet rank lost");domainChecks++}}}
const windowMin=len=>{let h=Array(n).fill(0),minTop2=Infinity;for(let i=0;i<D.length;i++){h[D[i]]++;if(i>=len)h[D[i-len]]--;if(i>=len-1){let a=0,b=0;for(let x of h){if(x>a){b=a;a=x}else if(x>b)b=x}minTop2=Math.min(minTop2,a+b)}}return {len,windows:D.length-len+1,minTop2}};
const privateAlphabet={domainChecks,whole:cap(C,os,0,N),carriedChapter:cap(C,os,start,end),resetChapter:cap(C.slice(start,end),os,0,end-start),literary:[windowMin(N),windowMin(end-start)]};

return {source:{N,donor:D.length,start,end,origins},controls,whole,chapter,canonical:{best,maxTop2},privateAlphabet}
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),fs.readFileSync(paths[2],'utf8')),null,2));
