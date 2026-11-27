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
 function forward3(c){const M=maps(c);let prev=new Float64Array(K2),next=new Float64Array(K2),ll=0,prefix=0;
  for(let x=0;x<K;x++)for(let y=0;y<K;y++){let v=1;for(let j=0;j<3;j++){const a=M[0][j][x],b=M[1][j][y];v*=U[a]*B[a*Q+b];}prev[x*K+y]=v;}
  let norm=prev.reduce((a,b)=>a+b,0);for(let i=0;i<K2;i++)prev[i]/=norm;ll=Math.log(norm)-2*logK;
  for(let i=2;i<L;i++){next.fill(0);const m0=M[i-2],m1=M[i-1],m2=M[i];for(let x=0;x<K;x++)for(let y=0;y<K;y++){const v=prev[x*K+y],a0=(m0[0][x]*Q+m1[0][y])*Q,a1=(m0[1][x]*Q+m1[1][y])*Q,a2=(m0[2][x]*Q+m1[2][y])*Q,d=y*K;
    for(let z=0;z<K;z++)next[d+z]+=v*T[a0+m2[0][z]]*T[a1+m2[1][z]]*T[a2+m2[2][z]];}
   norm=next.reduce((a,b)=>a+b,0);check(norm>0,"forward norm");for(let i=0;i<K2;i++)next[i]/=norm;ll+=Math.log(norm)-logK;[prev,next]=[next,prev];if(i===H-1)prefix=ll;}
  return [prefix,ll];
 }
 // Exact independent-track zero-pattern marginal, then uniform nonzero ciphertext factor.
 function independent3(c){let prefix=0,ll=0;
  for(const p of c){let prev=new Float64Array(Q*Q),next=new Float64Array(Q*Q),s=0,pre=0;const ok=(i,x)=>(p[i]===0)===(x===0);
   for(let x=0;x<Q;x++)if(ok(0,x))for(let y=0;y<Q;y++)if(ok(1,y))prev[x*Q+y]=U[x]*B[x*Q+y];
   let norm=prev.reduce((a,b)=>a+b,0);for(let i=0;i<prev.length;i++)prev[i]/=norm;s=Math.log(norm)-(Number(p[0]!==0)+Number(p[1]!==0))*logK;
   for(let i=2;i<L;i++){next.fill(0);for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const v=prev[x*Q+y],a=(x*Q+y)*Q;for(let z=0;z<Q;z++)if(ok(i,z))next[y*Q+z]+=v*T[a+z];}
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
 const original=[32,53,55].map(i=>gp.pages[i].indices);check(original.map(x=>x.length).join()==="121,179,76","geometry");
 if(mode!=="controls")throw Error("only fixed alignment control gate implemented");
 let records=[];
 for(let trial=0;trial<6;trial++){let rng=(0x746d5231+trial*0x1f123bb5)>>>0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
  const sch=schedules[rand(8)],offsets=lit.map(p=>Math.floor(p.length*.70)+rand(Math.floor(p.length*.24))),P=offsets.map((v,i)=>lit[i].slice(v,v+L)),key=Array.from({length:L},()=>1+rand(K)),C=P.map(p=>p.map((x,i)=>mod(x*key[i]+sch.b[i]))),D=P.map(p=>p.map((x,i)=>mod(x*(1+rand(K))+sch.b[i]))),c=C.map(p=>center(p,sch.b)),d=D.map(p=>center(p,sch.b));
  const pos=bf(c),neg=bf(d),dec=viterbi4(c),observable=key.filter((_,i)=>P.some(p=>p[i]!==0)).length,correct=key.filter((v,i)=>P.some(p=>p[i]!==0)&&v===dec.key[i]).length;
  records.push({trial,schedule:{radix:sch.radix,reversed:sch.reversed,sign:sch.sign},offsets,pos,neg,observable,correct,plainCorrect:dec.plain.map((p,j)=>p.filter((v,i)=>v===P[j][i]).length)});
 }
 const pass={positive:records.filter(x=>x.pos.full>0&&x.pos.held>0).length,negative:records.filter(x=>x.neg.full<0).length,recovery:records.filter(x=>x.correct>=Math.ceil(.7*x.observable)).length};
 return {trainRunes:total,records,pass,passed:pass.positive>=5&&pass.negative>=5&&pass.recovery>=4};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-grid-256.json"];
if(require.main===module)console.log(JSON.stringify(ringScale(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]??"controls"),null,2));
module.exports={ringScale,paths};
