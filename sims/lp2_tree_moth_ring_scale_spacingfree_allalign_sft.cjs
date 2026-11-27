"use strict";
const fs=require("node:fs"),path=require("node:path");
function ringScale(raw,mode="controls"){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[4]),grid=JSON.parse(raw[5]),Q=29,K=28,L=76,H=48,K2=K*K,K3=K2*K;
 const mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)},inv=Array.from({length:Q},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(x=>a*x%Q===1):0);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"encode");out.push(q.i);j+=q.t.length;}}return out;}
 function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
 const lit=raw.slice(1,4).map(s=>encode(body(s)));
 const train=[...lit.map(p=>p.slice(0,Math.floor(p.length*.65))),...gold.sections.filter(s=>s.name!=="p57_parable").map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)))];
 const n1=new Float64Array(Q),n2=new Float64Array(Q*Q),n3=new Float64Array(Q**3),n4=new Float64Array(Q**4),d2=new Float64Array(Q),d3=new Float64Array(Q*Q),d4=new Float64Array(Q**3);let total=0;
 for(const p of train)for(let i=0;i<p.length;i++){const c=p[i];n1[c]++;total++;if(i){const a=p[i-1];n2[a*Q+c]++;d2[a]++;if(i>1){const ab=p[i-2]*Q+a;n3[ab*Q+c]++;d3[ab]++;if(i>2){const abc=p[i-3]*Q*Q+ab;n4[abc*Q+c]++;d4[abc]++;}}}}
 const U=Float64Array.from(n1,n=>(n+.5)/(total+14.5)),B=Float64Array.from(n2,(n,i)=>(n+12*U[i%Q])/(d2[Math.floor(i/Q)]+12)),T=Float64Array.from(n3,(n,i)=>(n+9*B[i%(Q*Q)])/(d3[Math.floor(i/Q)]+9)),F=Float64Array.from(n4,(n,i)=>(n+7*T[i%(Q**3)])/(d4[Math.floor(i/Q)]+7));
 const lu=U.map(Math.log),lb=B.map(Math.log),lt=T.map(Math.log),lf=F.map(Math.log),logK=Math.log(K);
 const ring=[...Array.from({length:8},(_,i)=>i),...Array.from({length:31},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>31*8+6-i),...Array.from({length:30},(_,i)=>(30-i)*8)];
 const gridT=grid.pages.flatMap(p=>p.tokens),schedules=[];check(ring.length===L&&gridT.length===256,"grid");
 for(const radix of [59,60]){const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet;const b=ring.map(i=>{const t=gridT[i];return (alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]))%Q;});for(const reversed of [false,true])for(const sign of [1,-1])schedules.push({radix,reversed,sign,b:(reversed?b.slice().reverse():b).map(x=>mod(sign*x))});}
 function center(c,b){return c.map((x,i)=>mod(x-b[i]));}
 function maps(c){return Array.from({length:L},(_,i)=>c.map(p=>Uint8Array.from({length:K},(_,t)=>(p[i]*(t+1))%Q)));}
 // Exact scaled forward order-two triple probability, integrating independent uniform common inverse multipliers.
 function forward3(c,end=L){const M=maps(c);let prev=new Float64Array(K2),next=new Float64Array(K2),ll=0,prefix=0;
  for(let x=0;x<K;x++)for(let y=0;y<K;y++){let v=1;for(let j=0;j<3;j++){const a=M[0][j][x],b=M[1][j][y];v*=U[a]*B[a*Q+b];}prev[x*K+y]=v;}
  let norm=prev.reduce((a,b)=>a+b,0);for(let i=0;i<K2;i++)prev[i]/=norm;ll=Math.log(norm)-2*logK;
  for(let i=2;i<end;i++){next.fill(0);const m0=M[i-2],m1=M[i-1],m2=M[i];for(let x=0;x<K;x++)for(let y=0;y<K;y++){const v=prev[x*K+y],a0=(m0[0][x]*Q+m1[0][y])*Q,a1=(m0[1][x]*Q+m1[1][y])*Q,a2=(m0[2][x]*Q+m1[2][y])*Q,d=y*K;
    for(let z=0;z<K;z++)next[d+z]+=v*T[a0+m2[0][z]]*T[a1+m2[1][z]]*T[a2+m2[2][z]];}
   norm=next.reduce((a,b)=>a+b,0);check(norm>0,"forward norm");for(let i=0;i<K2;i++)next[i]/=norm;ll+=Math.log(norm)-logK;[prev,next]=[next,prev];if(i===H-1)prefix=ll;}
  return [prefix,ll];
 }
 // Exact independent-track zero-pattern marginal, then uniform nonzero ciphertext factor.
 function independent3(c,end=L){let prefix=0,ll=0;
  for(const p of c){let prev=new Float64Array(Q*Q),next=new Float64Array(Q*Q),s=0,pre=0;const ok=(i,x)=>(p[i]===0)===(x===0);
   for(let x=0;x<Q;x++)if(ok(0,x))for(let y=0;y<Q;y++)if(ok(1,y))prev[x*Q+y]=U[x]*B[x*Q+y];
   let norm=prev.reduce((a,b)=>a+b,0);for(let i=0;i<prev.length;i++)prev[i]/=norm;s=Math.log(norm)-(Number(p[0]!==0)+Number(p[1]!==0))*logK;
   for(let i=2;i<end;i++){next.fill(0);for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const v=prev[x*Q+y],a=(x*Q+y)*Q;for(let z=0;z<Q;z++)if(ok(i,z))next[y*Q+z]+=v*T[a+z];}
    norm=next.reduce((a,b)=>a+b,0);check(norm>0,"independent norm");for(let k=0;k<prev.length;k++)next[k]/=norm;s+=Math.log(norm)-Number(p[i]!==0)*logK;[prev,next]=[next,prev];if(i===H-1)pre=s;}
   prefix+=pre;ll+=s;
  }return [prefix,ll];
 }
 function viterbi4(c){const M=maps(c);let prev=new Float64Array(K3),next=new Float64Array(K3);const back=new Int8Array(L*K3);
  for(let x=0;x<K;x++)for(let y=0;y<K;y++)for(let z=0;z<K;z++){let v=0;for(let j=0;j<3;j++){const a=M[0][j][x],b=M[1][j][y],e=M[2][j][z];v+=lu[a]+lb[a*Q+b]+lt[(a*Q+b)*Q+e];}prev[(x*K+y)*K+z]=v;}
  for(let i=3;i<L;i++){next.fill(-Infinity);const m0=M[i-3],m1=M[i-2],m2=M[i-1],m3=M[i];for(let x=0;x<K;x++)for(let y=0;y<K;y++)for(let z=0;z<K;z++){const k=(x*K+y)*K+z,prior=prev[k],row0=((m0[0][x]*Q+m1[0][y])*Q+m2[0][z])*Q,row1=((m0[1][x]*Q+m1[1][y])*Q+m2[1][z])*Q,row2=((m0[2][x]*Q+m1[2][y])*Q+m2[2][z])*Q,dst=(y*K+z)*K;
    for(let w=0;w<K;w++){const val=prior+lf[row0+m3[0][w]]+lf[row1+m3[1][w]]+lf[row2+m3[2][w]],d=dst+w;if(val>next[d]){next[d]=val;back[i*K3+d]=x;}}}[prev,next]=[next,prev];}
  let k=0;for(let i=1;i<K3;i++)if(prev[i]>prev[k])k=i;const score=prev[k],p=new Array(L);p[L-1]=k%K;p[L-2]=Math.floor(k/K)%K;p[L-3]=Math.floor(k/K2);for(let i=L-1;i>=3;i--)p[i-3]=back[i*K3+(p[i-2]*K+p[i-1])*K+p[i]];
  const key=p.map(x=>inv[x+1]),plain=c.map(s=>s.map((v,i)=>v*(p[i]+1)%Q));check(plain.every((s,j)=>s.every((v,i)=>v*key[i]%Q===c[j][i])),"replay");return {score,key,plain,latin:plain.map(s=>s.map(x=>gp.translit[x]).join(""))};
 }
 function bf(c){const a=forward3(c),b=independent3(c);return {prefix:a[0]-b[0],full:a[1]-b[1],held:a[1]-b[1]-a[0]+b[0]};}

 // Unknown source schedule/offset selector. First 48 only; held 28 are sealed until selection.
 const original=[32,53,55].map(i=>gp.pages[i].indices);check(original.map(x=>x.length).join()==="121,179,76","geometry");
 const Utab=Array.from({length:Q},(_,x)=>Float64Array.from({length:K},(_,t)=>U[x*(t+1)%Q]));
 const indU=Float64Array.from({length:Q},(_,x)=>x===0?U[0]:(1-U[0])/K);
 const unig=new Float64Array(Q**3);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++){let sum=0;for(let t=0;t<K;t++)sum+=Utab[a][t]*Utab[b][t]*Utab[c][t];unig[(a*Q+b)*Q+c]=Math.log(sum/K/(indU[a]*indU[b]*indU[c]));}
 const Btab=new Float64Array(Q*Q*K2);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let x=0;x<K;x++)for(let y=0;y<K;y++)Btab[(a*Q+b)*K2+x*K+y]=B[(a*(x+1)%Q)*Q+b*(y+1)%Q];
 const cache2=new Map();
 function independent2(p,end=H){const mask=p.slice(0,end).map(x=>x===0?"1":"0").join("");const cached=cache2.get(mask);if(cached!==undefined)return cached;
  let prev=Float64Array.from(U,(v,x)=>((x===0)===(p[0]===0))?v:0),next=new Float64Array(Q),norm=prev.reduce((a,b)=>a+b,0),ll=Math.log(norm)-Number(p[0]!==0)*logK;
  for(let x=0;x<Q;x++)prev[x]/=norm;
  for(let i=1;i<end;i++){next.fill(0);if(p[i]===0){for(let x=0;x<Q;x++)next[0]+=prev[x]*B[x*Q];}else for(let x=0;x<Q;x++){const v=prev[x],row=x*Q;for(let y=1;y<Q;y++)next[y]+=v*B[row+y];}
   norm=next.reduce((a,b)=>a+b,0);check(norm>0,"ind2 norm");for(let x=0;x<Q;x++)next[x]/=norm;ll+=Math.log(norm)-Number(p[i]!==0)*logK;[prev,next]=[next,prev];}
  cache2.set(mask,ll);return ll;
 }
 function bigram(c){let prev=new Float64Array(K),next=new Float64Array(K),ll=0;const c0=c[0],c1=c[1],c2=c[2];
  for(let x=0;x<K;x++)prev[x]=Utab[c0[0]][x]*Utab[c1[0]][x]*Utab[c2[0]][x];
  let norm=prev.reduce((a,b)=>a+b,0);for(let x=0;x<K;x++)prev[x]/=norm;ll=Math.log(norm)-logK;
  for(let i=1;i<H;i++){next.fill(0);const a=(c0[i-1]*Q+c0[i])*K2,b=(c1[i-1]*Q+c1[i])*K2,c=(c2[i-1]*Q+c2[i])*K2;
   for(let x=0;x<K;x++){const v=prev[x],j=x*K,aa=a+j,bb=b+j,cc=c+j;for(let y=0;y<K;y++)next[y]+=v*Btab[aa+y]*Btab[bb+y]*Btab[cc+y];}
   norm=next.reduce((a,b)=>a+b,0);check(norm>0,"bigram norm");for(let x=0;x<K;x++)next[x]/=norm;ll+=Math.log(norm)-logK;[prev,next]=[next,prev];}
  return ll-c.reduce((s,p)=>s+independent2(p),0);
 }
 function pre3(c){return forward3(c,H)[0]-independent3(c,H)[0];}
 function select(A,Bb,C,truth=null,doDecode=true){
  const cache=schedules.map(s=>[A,Bb,C].map(p=>Array.from({length:p.length-L+1},(_,off)=>center(p.slice(off,off+L),s.b))));
  const all=[];for(let s=0;s<schedules.length;s++){const [aa,bb,cc]=cache[s],c=cc[0];for(let a=0;a<aa.length;a++)for(let b=0;b<bb.length;b++){let score=0;const x=aa[a],y=bb[b];for(let i=0;i<H;i++)score+=unig[(x[i]*Q+y[i])*Q+c[i]];all.push({s,a,b,u:score});}}
  const eq=x=>truth&&x.s===truth.s&&x.a===truth.a&&x.b===truth.b;
  const get=x=>[cache[x.s][0][x.a],cache[x.s][1][x.b],cache[x.s][2][0]];
  all.sort((x,y)=>y.u-x.u||x.s-y.s||x.a-y.a||x.b-y.b);
  const uRank=truth?all.findIndex(eq)+1:0,level2=all.slice(0,4096).map(x=>({...x,v:bigram(get(x))})).sort((x,y)=>y.v-x.v);
  const bRank=truth?level2.findIndex(eq)+1:0,level3=level2.slice(0,128).map(x=>({...x,w:pre3(get(x))})).sort((x,y)=>y.w-x.w);
  const tRank=truth?level3.findIndex(eq)+1:0,best=level3[0],c=get(best),e=bf(c),dec=doDecode?viterbi4(c):null;
  const out={candidates:all.length,shortlists:[level2.length,level3.length],top:level3.slice(0,5),selected:best,schedule:schedules[best.s],scores:e,margin:best.w-level3[1].w,decode:dec};
  if(truth){out.truth={s:truth.s,a:truth.a,b:truth.b,ranks:[uRank,bRank,tRank],selected:!!eq(best)};if(dec&&eq(best)){const observable=truth.key.filter((_,i)=>truth.P.some(p=>p[i]!==0)).length;out.truth.observable=observable;out.truth.correct=truth.key.filter((v,i)=>truth.P.some(p=>p[i]!==0)&&v===dec.key[i]).length;out.truth.plainCorrect=dec.plain.map((p,j)=>p.filter((v,i)=>v===truth.P[j][i]).length);}}
  return out;
 }
 if(mode==="original"){return {trainRunes:total,actual:select(...original)};}
 const m=/^control([0-5])$/.exec(mode);check(m,"mode must be control0..5 or original");const trial=Number(m[1]);let rng=(0x274a9813+trial*0x19ab705d)>>>0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const s=rand(8),sch=schedules[s],a=rand(46),b=rand(104),offsets=lit.map(p=>Math.floor(p.length*.70)+rand(Math.floor(p.length*.24))),P=offsets.map((v,i)=>lit[i].slice(v,v+L)),key=Array.from({length:L},()=>1+rand(K));
 const base=[Array.from({length:121},()=>rand(Q)),Array.from({length:179},()=>rand(Q)),Array(L).fill(0)];
 function plant(shared){const arrays=base.map(x=>x.slice()),offs=[a,b,0];for(let j=0;j<3;j++)for(let i=0;i<L;i++)arrays[j][offs[j]+i]=mod(P[j][i]*(shared?key[i]:1+rand(K))+sch.b[i]);return arrays;}
 const positive=select(...plant(true),{s,a,b,key,P}),negative=select(...plant(false),null,false);
 return {trainRunes:total,trial,offsets,positive,negative,passed:positive.truth.selected&&positive.scores.full>0&&positive.scores.held>0&&positive.truth.correct>=Math.ceil(.7*positive.truth.observable)&&negative.scores.held<0};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-grid-256.json"];
if(require.main===module)console.log(JSON.stringify(ringScale(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]??"control0"),null,2));
module.exports={ringScale,paths};
