"use strict";
const fs=require("node:fs");
function experiment(c,n,lit){
 const O=3302,mod=x=>(x%29+29)%29,sh=[],id=Array.from({length:29},(_,i)=>i);for(let x=2;sh.length<O+1000;x++){let ok=true;for(let p=2;p*p<=x;p++)if(x%p===0){ok=false;break}if(ok)sh.push((x-1)%29)}
 const bits=sh.map((_,i)=>1n<<BigInt(i)),M=Array(29).fill(0n);for(let j=0;j<sh.length;j++)M[sh[j]]|=bits[j];
 const init=(1n<<BigInt(O))-1n,all=(1n<<BigInt(sh.length))-1n,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),assert=(x,m)=>{if(!x)throw Error(m)};
 const idx=new Map(c.runes.map((r,i)=>[r,i])),sources=n.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const excluded=["0_welcome","jpg107-167","p56_an_end"];
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function latin(raw){const P=[];for(const w of raw.toUpperCase().match(/[A-Z]+/g)||[]){const text=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<text.length;){if(text.startsWith("ING",i)){P.push(21);i+=3}else if(text.startsWith("IO",i)){P.push(27);i+=2}else{const t=tokens.find(x=>text.startsWith(x.s,i));if(!t){i++;continue}P.push(t.i);i+=t.s.length}}}return P}
 const u=new Float64Array(29).fill(.5),bi=new Float64Array(841),tri=new Float64Array(29**3),quad=new Float64Array(29**4),bt=new Float64Array(29),tt=new Float64Array(841),qt=new Float64Array(29**3);
 function train(P,w){for(let i=0;i<P.length;i++){const p=P[i];u[p]+=w;if(i){const a=P[i-1];bi[a*29+p]+=w;bt[a]+=w}if(i>1){const h=P[i-2]*29+P[i-1];tri[h*29+p]+=w;tt[h]+=w}if(i>2){const h=(P[i-3]*29+P[i-2])*29+P[i-1];quad[h*29+p]+=w;qt[h]+=w}}}
 for(const raw of lit)train(latin(raw),1);for(const s of sources)if(!excluded.includes(s.name))train(s.P,24);
 const total=u.reduce((a,b)=>a+b);for(let i=0;i<29;i++)u[i]/=total;
 for(let h=0;h<29;h++)for(let p=0;p<29;p++)bi[h*29+p]=(bi[h*29+p]+20*u[p])/(bt[h]+20);
 for(let h=0;h<841;h++)for(let p=0;p<29;p++)tri[h*29+p]=(tri[h*29+p]+15*bi[(h%29)*29+p])/(tt[h]+15);
 for(let h=0;h<29**3;h++)for(let p=0;p<29;p++)quad[h*29+p]=(quad[h*29+p]+12*tri[(h%841)*29+p])/(qt[h]+12);
 const L=[null,...[u,bi,tri,quad].map(a=>Float64Array.from(a,Math.log))];
 function score(P,context=[]){const q=context.concat(P);let v=0;for(let i=context.length;i<q.length;i++){let k=q[i],pow=29,len=1;for(let j=i-1;j>=0&&j>=i-3;j--){k+=q[j]*pow;pow*=29;len++}v+=L[len][k]}return v}
 function enc(P,S,j,sign){return P.map(p=>p===0?0:mod(S[p]+sign*sh[j++]));}
 const auth=sources.find(x=>x.name==="p56_an_end").P;assert(eq(enc(auth,id,0,1),c.pages[56].indices),"authentic p56");
 function perm(seed){let x=seed,S=id.slice();for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[S[i],S[j]]=[S[j],S[i]]}return S}
 function inds(v){const s=v.toString(2),a=[];for(let i=s.length-1;i>=0;i--)if(s[i]==="1")a.push(s.length-1-i);return a}
 function back(C,m,sign){const B=Array(C.length+1);B[C.length]=all;for(let i=C.length-1;i>=0;i--){const a=C[i],v=B[i+1];B[i]=((v>>1n)&~M[mod(sign*(a-m))])|(a===0?v:0n)}return B}
 const plainRank=id.filter(x=>x!==0).sort((a,b)=>L[1][b]-L[1][a]);
 function rank(Z,m){const count=new Uint16Array(29);for(const x of Z)count[x]++;const r=id.filter(x=>x!==m).sort((a,b)=>count[b]-count[a]||a-b),key=new Array(29);key[m]=0;let s=count[m]*L[1][0];for(let i=0;i<28;i++){key[r[i]]=plainRank[i];s+=count[r[i]]*L[1][plainRank[i]]}return {s,key}}
 function enumerate(C,callback){let paths=0,models=0;for(const sign of [1,-1])for(let m=0;m<29;m++){const B=back(C,m,sign),starts=inds(B[0]&init);models+=starts.length;if(!starts.length)continue;const Z=new Int8Array(C.length);function walk(i,j,start){while(i<C.length){const a=C[i],v=B[i+1],z=mod(a-sign*sh[j]),hold=a===0&&(v&bits[j]),take=z!==m&&(v&bits[j+1]);if(hold&&take){Z[i]=m;walk(i+1,j,start);Z[i]=z;j++;i++;continue}if(hold){Z[i]=m;i++;continue}if(take){Z[i]=z;j++;i++;continue}throw Error("inconsistent reachability")}paths++;callback(Z,m,sign,start,j)}for(const start of starts)walk(0,start,start)}return {paths,models}}
 function fitPaths(C,truth){
  const K=32,top=[],trueZ=truth?.P.slice(0,C.length).map(p=>truth.S[p]),trueRank=trueZ?rank(trueZ,truth.S[0]).s:null;let truePath=false,better=0;
  const stats=enumerate(C,(Z,m,sign,start,j)=>{const a=rank(Z,m);if(trueRank!==null&&a.s>trueRank+1e-9)better++;if(truth&&m===truth.S[0]&&sign===truth.sign&&start===truth.start&&eq(Z,trueZ))truePath=true;if(top.length<K||a.s>top.at(-1).s+1e-9){top.push({...a,Z:Array.from(Z),m,sign,start,j});top.sort((a,b)=>b.s-a.s);if(top.length>K)top.pop()}});
  return {top,...stats,truePath,trueUnigramRank:truth?better+1:null,trueInShortlist:truth?top.some(x=>x.m===truth.S[0]&&x.sign===truth.sign&&x.start===truth.start&&eq(x.Z,trueZ)):null};
 }
 function optimize(cand,seed){
  const {Z,m}=cand,N=Z.length,free=id.filter(x=>x!==m),affected=Array.from({length:841},()=>[]);for(let i=0;i<N;i++){const seen=new Uint8Array(29);for(let j=Math.max(0,i-3);j<=i;j++)seen[Z[j]]=1;for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)if(seen[a]||seen[b])affected[a*29+b].push(i)}
  function value(i,k){let x=k[Z[i]],pow=29,len=1;for(let j=i-1;j>=0&&j>=i-3;j--){x+=k[Z[j]]*pow;pow*=29;len++}return L[len][x]}
  function swapDelta(k,a,b){if(a>b)[a,b]=[b,a];const A=affected[a*29+b];let d=0;for(const i of A)d-=value(i,k);[k[a],k[b]]=[k[b],k[a]];for(const i of A)d+=value(i,k);return d}
  let rng=seed>>>0;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296}
  let best=null;
  for(let restart=0;restart<3;restart++){
   const k=cand.key.slice();if(restart)for(let j=0;j<5*restart;j++){const a=free[Math.floor(rand()*28)],b=free[Math.floor(rand()*28)];[k[a],k[b]]=[k[b],k[a]]}
   let s=score(Z.map(x=>k[x])),bk=k.slice(),bs=s;
   for(let iter=0;iter<9000;iter++){const a=free[Math.floor(rand()*28)],b=free[Math.floor(rand()*28)];if(a===b)continue;const T=5*Math.pow(.025,iter/8999),d=swapDelta(k,a,b);if(d>=0||rand()<Math.exp(d/T)){s+=d;if(s>bs){bs=s;bk=k.slice()}}else [k[a],k[b]]=[k[b],k[a]]}
   const k2=bk.slice();let s2=score(Z.map(x=>k2[x]));for(let step=0;step<20;step++){let bestD=1e-8,ab=null;for(let i=0;i<28;i++)for(let j=i+1;j<28;j++){const a=free[i],b=free[j],d=swapDelta(k2,a,b);[k2[a],k2[b]]=[k2[b],k2[a]];if(d>bestD){bestD=d;ab=[a,b]}}if(!ab)break;const [a,b]=ab;[k2[a],k2[b]]=[k2[b],k2[a]];s2+=bestD}
   const P=Z.map(z=>k2[z]),s3=score(P);assert(Math.abs(s3-s2)<1e-5,"score delta");if(!best||s3>best.score)best={key:k2,P,score:s3}
  }
  return {...cand,...best}
 }
 function predict(C,best){let count=0,winner=null;const P=new Array(C.length);function walk(i,j){if(i===C.length){count++;const s=score(P,best.P.slice(-3));if(!winner||s>winner.s)winner={s,P:P.slice(),j};return}const a=C[i];if(a===0){P[i]=0;walk(i+1,j)}const z=mod(a-best.sign*sh[j]),p=best.key[z];if(p!==0){P[i]=p;walk(i+1,j+1)}}walk(0,best.j);return {count,best:winner}}
 function trial(name,C,truth=null){const cut=232,F=fitPaths(C.slice(0,cut),truth);let winner=null,trueOptimized=null;for(let i=0;i<F.top.length;i++){const cand=F.top[i],q=optimize(cand,(0x5eed3301^((i+1)*2654435761))>>>0);if(!winner||q.score>winner.score)winner=q;if(truth&&cand.m===truth.S[0]&&cand.sign===truth.sign&&cand.start===truth.start&&eq(cand.Z,truth.P.slice(0,cut).map(p=>truth.S[p])))trueOptimized=q}
  const H=predict(C.slice(cut),winner),S=id.map(p=>winner.key.indexOf(p));assert(eq(enc(winner.P,S,winner.start,winner.sign),C.slice(0,cut)),"prefix replay");if(H.best)assert(eq(enc(winner.P.concat(H.best.P),S,winner.start,winner.sign),C),"full replay");
  const readout=P=>P.map(x=>c.translit[x]).join(" ");
  return {name,paths:F.paths,models:F.models,shortlist:F.top.length,truePath:F.truePath,trueUnigramRank:F.trueUnigramRank,trueInShortlist:F.trueInShortlist,fit:{origin:winner.start,sign:winner.sign,m:winner.m,clock:winner.j,key:winner.key,nats:winner.score/cut,readout:readout(winner.P)},held:{paths:H.count,nats:H.best?H.best.s/(C.length-cut):null,readout:H.best?readout(H.best.P):null},replay:cut+(H.best?C.length-cut:0),truth:truth?{origin:truth.start,sign:truth.sign,m:truth.S[0],trueKey:id.map(p=>truth.S.indexOf(p)),prefixMatched:winner.P.filter((x,i)=>x===truth.P[i]).length,withheldMatched:H.best?H.best.P.filter((x,i)=>x===truth.P[cut+i]).length:0,keyMatched:winner.key.filter((x,i)=>x===truth.S.indexOf(i)).length,truePathOptimizedMatched:trueOptimized?trueOptimized.P.filter((x,i)=>x===truth.P[i]).length:null,nativePrefixNats:score(truth.P.slice(0,cut))/cut,nativeHeldNats:score(truth.P.slice(cut),truth.P.slice(cut-3,cut))/(C.length-cut)}:null};
 }
 const controls=[];for(const [name,off,start,sign,seed]of [["0_welcome",161,137,1,0x715a],["jpg107-167",0,911,-1,0x226b]]){const P=sources.find(x=>x.name===name).P.slice(off,off+308),S=perm(seed);controls.push(trial(name,enc(P,S,start,sign),{P,S,start,sign}))}
 const original=trial("original-p54-55",c.pages.slice(54,56).flatMap(p=>p.indices));
 return {method:"spacing-free all-prefix path unigram rank; top32 quadgram monoalphabetic optimization; freeze key/cursor before suffix",authenticReplay:85,trainingExcluded:excluded,controls,original}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];const f=paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),JSON.parse(f[1]),f.slice(2)),null,2));
