'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,allowOriginal=false){
 const check=(x,m)=>{if(!x)throw Error(m)},A=41,S=80,N=160;
 const mod=x=>(x+29)%29,T=gp.translit,idx=new Map(T.map((s,i)=>[s,i]));
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 const names=["Shakespeare","Emerson","Gibran"],texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")];
 function parse(s){
  const chunks=[],all=[];let words=[],prev=0;
  for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){
   if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){chunks.push(words.join(" "));words=[]}
   const w=norm(m[0]);words.push(w);all.push(w);prev=m.index+m[0].length;
  }
  if(words.length)chunks.push(words.join(" "));
  const flat=all.join(""),cut=new Uint8Array(flat.length+1);let p=0;
  for(const w of all){p+=w.length;cut[p]=1}
  return {chunks,flat,cut};
 }
 function graph(s){
  const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);
  for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}
  for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}
  const rem=Array(L+1).fill(0);for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");
  return {s,L,f,b,rem}
 }
 const sources=texts.map(parse),pairs=[];
 for(let j=0;j<3;j++)for(let i=0;i+1<sources[j].chunks.length;i++){
  const l=sources[j].chunks[i],r=sources[j].chunks[i+1];
  if(l.replace(/ /g,"").length<A||r.replace(/ /g,"").length<N-A)continue;
  pairs.push({source:names[j],stop:i+1,left:graph(l),right:graph(r)});
 }
 const pk=[],primes=[];for(let n=2;pk.length<3301+N;n++){let yes=true;for(const p of primes){if(p*p>n)break;if(n%p===0){yes=false;break}}if(yes){primes.push(n);pk.push((n-1)%29)}}
 const streams=[{kind:"prime",name:"prime",digits:pk},...sources.map((x,i)=>({kind:"source",name:names[i],flat:x.flat,cut:x.cut}))];
 function getOpts(stream,p){
  if(stream.kind==="prime")return p<pk.length?[[pk[p],p+1]]:[];
  const r=[];for(let d=1;d<=2&&p+d<=stream.flat.length;d++){
   if(d===2&&stream.cut[p+1])continue;
   const v=idx.get(stream.flat.slice(p,p+d));if(v!==undefined)r.push([v,p+d]);
  }return r;
 }
 function take(stream,p,v){
  if(stream.kind==="prime")return pk[p]===v?p+1:-1;
  const t=T[v];return stream.flat.startsWith(t,p)&&(t.length===1||!stream.cut[p+1])?p+t.length:-1;
 }
 function consume(stream,p,K){for(const v of K){p=take(stream,p,v);if(p<0)return -1}return p}
 const pindex=new Map(),lindex=new Map(),Q=10;
 function add(map,k,v){const a=map.get(k);if(a)a.push(v);else map.set(k,[v])}
 for(let i=0;i<=3300;i++)add(pindex,pk.slice(i,i+Q).join(","),i);
 // Compact position encoding: high two bits identify a source.
 for(let j=1;j<=3;j++){const s=streams[j].flat;check(s.length<2**29,"index size");for(let p=0;p+Q<=s.length;p++)add(lindex,s.slice(p,p+Q),j*2**29+p)}
 function match(g,C,begin,end,stream,pos,kpos,cb){
  const P=[],K=[];
  function rec(i,p,k){
   if(i===end){cb(p,k,P.slice(),K.slice());return}
   if(g.rem[p]<end-i)return;
   for(const [v,np] of g.f[p]){
    if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,np,k);P.pop()}
    else {const x=mod(C[i]-v),nk=take(stream,k,x);if(nk<0)continue;P.push(v);K.push(x);rec(i+1,np,nk);P.pop();K.pop()}
   }
  }
  rec(begin,pos,kpos);
 }
 function scan(C){
  check(C.length===S,"prefix only");const out=[];let leftSpellings=0,primeHits=0,sourceHits=0;
  for(const pair of pairs){
   const R=[],KR=[];
   function hit(streamId,start,kpos,K){
    if(streamId===0)primeHits++;else sourceHits++;
    const stream=streams[streamId],L=R.slice().reverse();
    match(pair.right,C,A,S,stream,0,kpos,(pos,k,P,K2)=>{
     if(pair.right.rem[pos]>=N-S)out.push({pair,streamId,start,pos,kpos:k,plain:L.concat(P),key:K.concat(K2)});
    });
   }
   function rec(i,p){
    if(i<0){
     leftSpellings++;const K=KR.slice().reverse();
     if(K.length<Q)throw Error("key prefix too short");
     for(const start of pindex.get(K.slice(0,Q).join(","))||[]){
      const kpos=consume(streams[0],start,K);if(kpos>=0)hit(0,start,kpos,K);
     }
     const letters=K.map(v=>T[v]).join("");
     for(const code of lindex.get(letters.slice(0,Q))||[]){
      const j=Math.floor(code/2**29),start=code-j*2**29,stream=streams[j];
      if(!stream.flat.startsWith(letters,start))continue;
      const kpos=consume(stream,start,K);if(kpos>=0)hit(j,start,kpos,K);
     }
     return;
    }
    for(const [v,np] of pair.left.b[p]){
     if(v===0){if(C[i]!==0)continue;R.push(v);rec(i-1,np);R.pop()}
     else{R.push(v);KR.push(mod(C[i]-v));rec(i-1,np);KR.pop();R.pop()}
    }
   }
   rec(A-1,pair.left.L);
  }
  return {out,leftSpellings,primeHits,sourceHits};
 }
 function count(g,stream,p,k,n,memo=new Map()){
  if(!n)return 1n;if(g.rem[p]<n)return 0n;
  const id=[p,k,n].join(":");if(memo.has(id))return memo.get(id);
  let sum=0n;
  for(const [v,np] of g.f[p]){
   if(v===0)sum+=count(g,stream,np,k,n-1,memo);
   else for(const [,nk] of getOpts(stream,k))sum+=count(g,stream,np,nk,n-1,memo);
  }
  memo.set(id,sum);return sum;
 }
 function enc(P,K){let j=0;return P.map(v=>v===0?0:(v+K[j++])%29)}
 function run(C,truth=null){
  const {out,leftSpellings,primeHits,sourceHits}=scan(C.slice(0,S));
  const unique=new Set(out.map(o=>[o.pair.source,o.pair.stop,o.streamId,o.start].join(":")));
  let predictionPaths=0n;for(const o of out)predictionPaths+=count(o.pair.right,streams[o.streamId],o.pos,o.kpos,N-S);
  const full=[];
  for(const o of out){
   const stream=streams[o.streamId];
   match(o.pair.right,C,S,N,stream,o.pos,o.kpos,(pos,k,P,K)=>{
    const plain=o.plain.concat(P),key=o.key.concat(K);
    check(consume(stream,o.start,key)===k,"key replay");
    check(enc(plain,key).join()===C.join(),"cipher replay");
    full.push({source:o.pair.source,stop:o.pair.stop,kind:stream.kind,keySource:stream.name,streamId:o.streamId,start:o.start,plain,key,sourceEnd:pos,keyEnd:k});
   });
  }
  return {leftSpellings,primeHits,sourceHits,prefixPaths:out.length,prefixSourceKeys:unique.size,predictionPaths:predictionPaths.toString(),suffixMatches:full.length,
   recovered:truth?full.some(o=>o.source===truth.source&&o.stop===truth.stop&&o.streamId===truth.streamId&&o.start===truth.start&&o.plain.join()===truth.plain.join()&&o.key.join()===truth.key.join()):null,
   prefixCandidates:out.slice(0,20).map(o=>({source:o.pair.source,stop:o.pair.stop,streamId:o.streamId,start:o.start,pos:o.pos,kpos:o.kpos,plain:o.plain,key:o.key})),fullCandidates:full.slice(0,20)};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spell(g,random){let p=0;const out=[],splits=[];while(g.rem[p]){const a=g.f[p];check(a.length,"spell");const [v,np]=a[Math.floor(random()*a.length)];if(a.length>1&&T[v].length===1)splits.push(out.length);out.push(v);p=np}return {out,splits}}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let k=0;k<2;k++){
  const random=rng((0x49a231cd^Math.imul(j*2+k+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]);
  let pair,L,R;
  for(let tries=0;tries<pool.length;tries++){
   pair=pool[Math.floor(random()*pool.length)];L=spell(pair.left,random);R=spell(pair.right,random);
   if(L.out.length>=A&&R.out.length>=N-A&&(L.splits.some(i=>i>=L.out.length-A)||R.splits.some(i=>i<N-A)))break;
  }
  check(L.out.length>=A&&R.out.length>=N-A,"plant");
  const plain=L.out.slice(-A).concat(R.out.slice(0,N-A)),need=plain.filter(v=>v!==0).length;
  const nonGreedy=L.splits.some(i=>i>=L.out.length-A)||R.splits.some(i=>i<N-A);
  const literalId=(j+1)%3+1;
  for(const streamId of [0,literalId]){
   const stream=streams[streamId],start=Math.floor(random()*(streamId===0?3301:stream.flat.length-2*N)),key=[];let p=start,keySplits=0;
   for(let i=0;i<need;i++){const a=getOpts(stream,p);check(a.length,"key plant");const [v,np]=a[Math.floor(random()*a.length)];if(streamId&&a.length>1&&T[v].length===1)keySplits++;key.push(v);p=np}
   const truth={source:pair.source,stop:pair.stop,streamId,start,plain,key};
   controls.push({id:j*2+k,kind:stream.kind,nonGreedy,keySplits,truth,...run(enc(plain,key),truth)});
  }
  const pad=Array.from({length:need},()=>Math.floor(random()*29));
  nulls.push({id:j*2+k,...run(enc(plain,pad))});
 }
 const gate={correct:controls.filter(x=>x.recovered).length,uniquePrefix:controls.filter(x=>x.prefixSourceKeys===1).length,nonGreedy:controls.filter(x=>x.nonGreedy).length,ambiguousSourceKeys:controls.filter(x=>x.kind==="source"&&x.keySplits>0).length,falsePrefix:nulls.filter(x=>x.prefixPaths).length,falseFull:nulls.filter(x=>x.suffixMatches).length};
 gate.pass=gate.correct===controls.length&&gate.uniquePrefix===controls.length&&gate.nonGreedy===controls.length&&gate.ambiguousSourceKeys>=4&&gate.falsePrefix===0;
 let original=null;
 if(gate.pass&&allowOriginal){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"LP2 size");original=run(U.slice(10279,10439))}
 return {method:{target:"p42–43 [10279,10439)",prefix:S,stop:A,total:N,pairs:pairs.length,primeOrigins:[0,3300],literalKeySources:names,sourceLetterPositions:sources.map(x=>x.flat.length),keyIndexEntries:lindex.size},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));
