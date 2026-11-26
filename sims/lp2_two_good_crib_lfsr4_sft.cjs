'use strict';
// Agent9 — see workplace/agent9-two-good-crib-lfsr4-precommit.md
const fs=require('node:fs');
const path=require('node:path');
function experiment(d){
 const mod=n=>((n%29)+29)%29;
 const assert=(v,msg)=>{if(!v)throw Error(msg)};
 const chapter=d.pages.slice(0,3).flatMap(p=>p.indices);
 const start=49, end=d.pages[0].indices.length+d.pages[1].indices.length+36, dist=end-start;
 const P=[6,3,3,23], K0=[18,18,23,20], K1=[24,28,5,3];
 const original=chapter.slice(start), p57=d.pages[57].indices;
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 assert(same(original.slice(0,4),P.map((x,i)=>mod(x+K0[i]))),"first crib");
 assert(same(original.slice(dist,dist+4),P.map((x,i)=>mod(x+K1[i]))),"second crib");
 function gen(K,t,N){
  const a=new Uint8Array(N);a.set(K);
  for(let i=4;i<N;i++)a[i]=(t[0]*a[i-1]+t[1]*a[i-2]+t[2]*a[i-3]+t[3]*a[i-4])%29;
  return a;
 }
 // Retain exact number of paths as BigInt, per next consuming key index.
 function dp(C,key,gap,trainOnly=false){
  let s=new Map([[4,1n]]);
  for(let i=4;i<C.length;i++){
   const z=C[i],next=new Map();
   // The second known plaintext is GOOD, containing no F.
   for(const [j,n] of s){
    if(i>=dist&&i<dist+4&&j!==gap+i-dist)continue;
    if(trainOnly&&i===dist)return s.get(gap)||0n;
    if(z===0&&(i<dist||i>=dist+4))next.set(j,(next.get(j)||0n)+n);
    if(z!==key[j]&&(i<dist||i>=dist+4||mod(z-key[j])===P[i-dist]))next.set(j+1,(next.get(j+1)||0n)+n);
   }
   s=next;if(!s.size)break;
  }
  return [...s.values()].reduce((a,b)=>a+b,0n);
 }
 function enumerate(C,mode){
  const first=C.slice(0,4).map((x,i)=>mod(x-P[i]));
  const second=C.slice(dist,dist+4).map((x,i)=>mod(x-P[i]));
  const zeros=C.slice(4,dist).filter(x=>x===0).length;
  const min=dist-zeros,max=dist;
  const result={zeroCount:zeros,taps:29**4,ordinary:[],fhold:[],candidateGapPairs:0,ordinaryMatches:0};
  const key=new Uint8Array(C.length+1);key.set(first);
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++)for(let e=0;e<29;e++){
   for(let i=4;i<dist+4;i++)key[i]=(a*key[i-1]+b*key[i-2]+c*key[i-3]+e*key[i-4])%29;
   let gaps=[];
   for(let j=mode==="ordinary"?max:min;j<=max;j++)if(key[j]===second[0]&&key[j+1]===second[1]&&key[j+2]===second[2]&&key[j+3]===second[3])gaps.push(j);
   if(!gaps.length)continue;
   for(let i=dist+4;i<C.length+1;i++)key[i]=(a*key[i-1]+b*key[i-2]+c*key[i-3]+e*key[i-4])%29;
   const t=[a,b,c,e];
   if(gaps.includes(max)){
    result.ordinaryMatches++;
    const plain=C.map((x,i)=>mod(x-key[i]));
    const suffix=plain.slice(dist+4),h=Array(29).fill(0);suffix.forEach(x=>h[x]++);
    result.ordinary.push({taps:t,holdout:suffix.map(x=>d.translit[x]).join(" "),ic:h.reduce((s,x)=>s+x*(x-1),0)/(suffix.length*(suffix.length-1)),replay:plain.every((p,i)=>mod(p+key[i])===C[i])});
   }
   if(mode!=="ordinary")for(const gap of gaps){
    result.candidateGapPairs++;
    // Training reachability only until the start of the second crib; next four digits are matched.
    const n=dp(C,key,gap,true);
    if(n===0n)continue;
    const m=dp(C,key,gap,false);
    result.fhold.push({taps:t,gap,trainPaths:String(n),fullPaths:String(m)});
   }
  }
  return result;
 }
 function makePlant(mode,t,seed){
  const plain=Array.from({length:original.length},(_,i)=>p57[i%p57.length]);
  plain.splice(0,4,...P);plain.splice(dist,4,...P);
  const key=gen(seed,t,plain.length+1);let j=0;
  const cipher=plain.map(p=>mode==="fhold"&&p===0?0:mod(p+key[j++]));
  const r=enumerate(cipher,mode);
  const hit=mode==="ordinary"?r.ordinary.find(x=>same(x.taps,t)):r.fhold.find(x=>same(x.taps,t)&&BigInt(x.fullPaths)>0n);
  assert(hit,"blind control missing");
  return {mode,taps:t,seed,match:hit,ordinaryMatches:r.ordinaryMatches,candidateGapPairs:r.candidateGapPairs,legalFhold:r.fhold.length,fullLegal:r.fhold.filter(x=>BigInt(x.fullPaths)>0n).length};
 }
 const control1=makePlant("ordinary",[3,8,14,19],[4,2,7,16]);
 const control2=makePlant("fhold",[2,5,11,21],[9,17,1,23]);
 const result=enumerate(original,"both");
 return {source:{chapterLength:chapter.length,start,secondGlobal:end,distance:dist,suffixLength:original.length-dist-4,first:original.slice(0,4),second:original.slice(dist,dist+4)},control1,control2,original:result};
}
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(experiment(d),null,2));
