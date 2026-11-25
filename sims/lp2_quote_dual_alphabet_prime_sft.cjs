'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");


 const primes=[];for(let n=2;primes.length<240;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const shifts=primes.map(p=>mod(p-1)),range=n=>Array.from({length:n},(_,i)=>i);
 function edge(s,p,c,k){
  const a=s.c[p],b=s.c[c],d=mod(k+s.v[p]-s.v[c]);
  if(a===b)return d===0?s:null;
  const used=[0,0];
  for(let i=0;i<58;i++)if(s.c[i]===a)used[+(i>=29)]|=1<<s.v[i];
  for(let i=0;i<58;i++)if(s.c[i]===b){const t=+(i>=29),bit=1<<mod(s.v[i]+d);if(used[t]&bit)return null;used[t]|=bit}
  const t={c:s.c.slice(),v:s.v.slice()};
  for(let i=0;i<58;i++)if(s.c[i]===b){t.c[i]=a;t.v[i]=mod(s.v[i]+d)}
  return t;
 }
 const identity=()=>edge({c:range(58),v:Array(58).fill(0)},0,29,0);
 const factorial=n=>{let v=1n;for(let i=2;i<=n;i++)v*=BigInt(i);return v};
 function groups(s){const g=new Map();for(let i=0;i<58;i++){if(!g.has(s.c[i]))g.set(s.c[i],[]);g.get(s.c[i]).push(i)}return [...g.values()]}
 function masks(s,g,z){const a=[0,0];for(const i of g)a[+(i>=29)]|=1<<mod(s.v[i]+z);return a}
 function cover(s,needWitness=false){
  const all=groups(s),anchor=all.find(g=>g.includes(0)),multi=all.filter(g=>g!==anchor&&g.length>1).sort((a,b)=>b.length-a.length),singles=all.filter(g=>g.length===1).flat(),start=mod(-s.v[0]),initial=masks(s,anchor,start),memo=new Map(),option=multi.map(g=>range(29).map(z=>({z,m:masks(s,g,z)}))),chosen=[];
  const factor=factorial(singles.filter(i=>i<29).length)*factorial(singles.filter(i=>i>=29).length);
  function dfs(i,a,b){if(i===multi.length)return factor;const k=i+":"+a+":"+b;if(!needWitness&&memo.has(k))return memo.get(k);let total=0n;
   for(const {z,m} of option[i])if(!(a&m[0])&&!(b&m[1])){const v=dfs(i+1,a|m[0],b|m[1]);if(needWitness&&v){chosen[i]=z;return v}total+=v}
   memo.set(k,total);return total
  }
  const count=dfs(0,initial[0],initial[1]);if(!needWitness)return count;if(!count)return null;
  const key=Array(58).fill(-1),install=(g,z)=>{for(const i of g)key[i]=mod(s.v[i]+z)};
  install(anchor,start);multi.forEach((g,i)=>install(g,chosen[i]));
  for(const i of singles){const j=i<29?0:29;key[i]=range(29).find(v=>!key.slice(j,j+29).includes(v))}
  const S=key.slice(0,29),Y=key.slice(29);check(belongs(s,S,Y),"witness");return {S,Y};
 }
 function belongs(s,S,Y){const a=S.concat(Y);return S[0]===0&&Y[0]===0&&new Set(S).size===29&&new Set(Y).size===29&&range(58).every(i=>mod(a[i]-a[s.c[i]])===s.v[i])}
 function enc(P,S,Y){const I=Array(29);Y.forEach((v,i)=>I[v]=i);let j=0;return P.map(p=>p===0?0:I[mod(S[p]+shifts[j++])])}
 function countPaths(g,p,n,memo=new Map()){if(!n)return 1n;if(g.rem[p]<n)return 0n;const k=p+":"+n;if(memo.has(k))return memo.get(k);let v=0n;for(const [,np] of g.f[p])v+=countPaths(g,np,n-1,memo);memo.set(k,v);return v}
 function forward(g,C,start,end,pos,j,s,cb){
  const P=[];
  function rec(i,p,h,t){if(g.rem[p]<N-i)return;if(i===end){cb(p,h,t,P.slice());return}
   for(const [v,np] of g.f[p]){if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,np,h,t);P.pop()}else{const u=edge(t,v,29+C[i],shifts[h]);if(u){P.push(v);rec(i+1,np,h+1,u);P.pop()}}}
  }rec(start,pos,j,s);
 }
 function scan(C){const out=[];let leftPass=0,nodes=0;const min=A-C.slice(0,A).filter(v=>v===0).length;
  for(const pair of pairs)for(let active=min;active<=A;active++){
   const R=[];
   function rec(i,p,h,s){nodes++;if(h<0||h>i+1)return;if(i<0){if(h!==0)return;leftPass++;const L=R.slice().reverse();forward(pair.right,C,A,S,0,active,s,(pos,j,t,P)=>{const count=cover(t);if(count)out.push({pair,pos,j,s:t,plain:L.concat(P),count:String(count)})});return}
    for(const [v,np] of pair.left.b[p]){if(v===0){if(C[i]!==0)continue;R.push(v);rec(i-1,np,h,s);R.pop()}else if(h>0){const t=edge(s,v,29+C[i],shifts[h-1]);if(t){R.push(v);rec(i-1,np,h-1,t);R.pop()}}}
   }rec(A-1,pair.left.L,active,identity());
  }return {out,leftPass,nodes};
 }
 function run(C,truth=null){
  const {out,leftPass,nodes}=scan(C.slice(0,S)),full=[];
  const T=truth?out.filter(o=>o.pair.source===truth.source&&o.pair.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&belongs(o.s,truth.S,truth.Y)):[];
  let forced=null,allowed=null;
  if(T.length){forced=0;allowed=0;const o=T[0];let j=o.j;
   for(let i=S;i<N;i++){const p=truth.plain[i];if(!p){forced++;allowed+=+(C[i]===0);continue}
    let options=[];for(let c=0;c<29;c++){const t=edge(o.s,p,29+c,shifts[j]);if(t&&cover(t))options.push(c)}forced+=+(options.length===1);allowed+=+options.includes(C[i]);j++;
   }
  }
  for(const o of out)forward(o.pair.right,C,S,N,o.pos,o.j,o.s,(pos,j,t,P)=>{const count=cover(t);if(count){const plain=o.plain.concat(P),key=cover(t,true);check(enc(plain,key.S,key.Y).join()===C.join(),"replay");full.push({source:o.pair.source,stop:o.pair.stop,plain,key,prefixCount:o.count,fullCount:String(count),consumed:j,trueKey:truth?belongs(t,truth.S,truth.Y):null})}});
  const correct=truth?full.some(f=>f.source===truth.source&&f.stop===truth.stop&&f.plain.join()===truth.plain.join()&&f.trueKey):null;
  return {leftPass,nodes,prefixPaths:out.length,prefixSources:new Set(out.map(o=>o.pair.source+":"+o.pair.stop)).size,prefixClasses:out.map(o=>({source:o.pair.source,stop:o.pair.stop,count:o.count,components:new Set(o.s.c).size,graph:o.s,spellingPaths:String(countPaths(o.pair.right,o.pos,N-S))})),fullPaths:full.length,correct,forced,allowed,full};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){const t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 function perm(r){const a=range(29);for(let i=28;i>1;i--){const j=1+Math.floor(r()*i);[a[i],a[j]]=[a[j],a[i]]}return a}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x270118^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<A||R.length<N-A);
  const plain=L.slice(-A).concat(R.slice(0,N-A)),S=perm(r),Y=perm(r),truth={source:pair.source,stop:pair.stop,plain,S,Y},C=enc(plain,S,Y);
  controls.push({truth,...run(C,truth)});nulls.push(run(plain.map(p=>p===0?0:Math.floor(r()*29))));
 }
 const gate=controls.every(c=>c.correct&&c.allowed===80);
 let result=null;if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"corpus");result=run(U.slice(10279,10439));if(result.full.length===1&&result.full[0].fullCount==="1"){const f=result.full[0],I=Array(29);f.key.S.forEach((v,i)=>I[v]=i);let j=f.consumed;result.adjacent=[];for(const c of U.slice(10439,10479)){if(c===0){result.adjacent.push(null);break}const p=I[mod(f.key.Y[c]-shifts[j++])];if(p===0){result.adjacent.push(null);break}result.adjacent.push(p)}}}
 return {pairs:pairs.length,gate,controls,nulls,original:result};

}

module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
