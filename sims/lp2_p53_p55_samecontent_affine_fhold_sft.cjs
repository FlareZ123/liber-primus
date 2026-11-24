"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,gold){
 const mod=x=>(x%29+29)%29;
 const inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>b).find(b=>a*b%29===1)||0);
 function solve(A,B,q,r,mask){
  const n=2*(q+r),rows=[],active=[];let j=0;
  for(let i=0;i<B.length;i++){
   if(mask.has(i))continue;
   const x=A[i],y=B[i],p=j%q,t=q+j%r;const row=Array(n).fill(0);row[2*p]=x;row[2*p+1]=1;row[2*t]=mod(-y);row[2*t+1]=28;rows.push(row);active.push([i,p,x]);j++;
  }
  let rank=0;const piv=[];
  for(let c=0;c<n&&rank<rows.length;c++){
   let k=rank;while(k<rows.length&&!rows[k][c])k++;if(k===rows.length)continue;
   [rows[k],rows[rank]]=[rows[rank],rows[k]];const u=inv[rows[rank][c]];
   for(let d=c;d<n;d++)rows[rank][d]=mod(rows[rank][d]*u);
   for(let s=0;s<rows.length;s++)if(s!==rank&&rows[s][c]){const m=rows[s][c];for(let d=c;d<n;d++)rows[s][d]=mod(rows[s][d]-m*rows[rank][d]);}
   piv.push(c);rank++;
  }
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!piv.includes(i));
  const basis=free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let i=0;i<rank;i++)v[piv[i]]=mod(-rows[i][f]);return v});
  const zeroSlopes=Array.from({length:q+r},(_,i)=>2*i).filter(c=>basis.every(v=>v[c]===0));
  if(zeroSlopes.length)return {rank,zeroSlopes,accepted:false};
  // Only dimension-two kernels are fully enumerated; higher dimensions
  // are relaxed survivors, not claims of exact nonzero-plaintext feasibility.
  let paths=0;
  if(basis.length===2){
   for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const v=basis[0].map((x,c)=>mod(a*x+b*basis[1][c]));
    if(Array.from({length:q+r},(_,i)=>v[2*i]).some(x=>x===0))continue;
    if(active.some(([i,p,x])=>mod(v[2*p]*x+v[2*p+1])===0))continue;
    paths++;
   }
  }
  return {rank,zeroSlopes,accepted:basis.length!==2||paths>0,paths,nullity:basis.length};
 }
 function scan(A,B,q,r){
  let tests=0,allZero=0,partialZero=0,nonzero=0;const ranks={},hits=[];
  for(let offset=0;offset+B.length<=A.length;offset++){
   const a=A.slice(offset,offset+B.length),zeros=[];
   for(let i=0;i<B.length;i++)if(a[i]===0&&B[i]===0)zeros.push(i);
   for(let m=0;m<2**zeros.length;m++){
    const mask=new Set(zeros.filter((_,j)=>m&(1<<j)));
    const z=solve(a,B,q,r,mask);tests++;ranks[z.rank]=(ranks[z.rank]||0)+1;
    if(z.zeroSlopes.length===q+r)allZero++;else if(z.zeroSlopes.length)partialZero++;else nonzero++;
    if(z.accepted)hits.push({offset,mask:[...mask],rank:z.rank,nullity:z.nullity,paths:z.paths});
   }
  }
  return {q,r,placements:A.length-B.length+1,tests,allZero,partialZero,nonzero,ranks,hits};
 }
 let seed=0x5313af55;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const native=s=>[...s.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
 const controls=[];
 for(const [q,r] of [[8,8],[13,13],[8,13],[13,8]]){
  for(const [s,i] of [[gold.sections.find(s=>s.name==="0_welcome"),0],[gold.sections.find(s=>s.name==="0_koan_1"),1]]){
   const donor=native(s),P=donor.slice(20+i,96+i),off=13+19*i;
   const A=donor.slice(100,100+off).concat(P,donor.slice(200,200+103-off));
   const k=Array.from({length:q},()=>[1+random()%28,random()%29]),l=Array.from({length:r},()=>[1+random()%28,random()%29]);
   const enc=(p,K,start)=>{let t=start;return p.map(x=>{if(x===0)return 0;const [a,b]=K[t++%K.length];return mod(a*x+b)})};
   const X=enc(A,k,random()%q),Y=enc(P,l,random()%r),z=scan(X,Y,q,r),mask=P.map((x,j)=>x===0?j:-1).filter(j=>j>=0);
   const trueHit=z.hits.find(h=>h.offset===off&&h.mask.join(",")===mask.join(","));
   if(!trueHit||z.hits.length!==1)throw Error("lost unique native control");
   controls.push({q,r,donor:s.name,offset:off,holds:mask.length,rank:trueHit.rank,paths:trueHit.paths,hits:z.hits.length});
  }
 }
 const A=corpus.pages.find(x=>x.page===53).indices,B=corpus.pages.find(x=>x.page===55).indices;
 if(A.length!==179||B.length!==76)throw Error("source lengths");
 const original=[];
 for(const [q,r] of [[8,8],[13,13],[8,13],[13,8]])for(const [scope,b] of [["physical76",B],["body75",B.slice(1)]]){
  const z=scan(A,b,q,r);if(z.allZero!==z.tests||z.hits.length)throw Error("original slope obstruction changed");original.push({scope,...z});
 }
 return {controls,original};
}
if(require.main===module){
 const root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
 console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
}
module.exports={run};
