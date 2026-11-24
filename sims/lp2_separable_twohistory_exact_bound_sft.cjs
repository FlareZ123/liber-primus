"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(gp,donors){
 const Q=29,FULL=(1<<Q)-1,mod=x=>(x%Q+Q)%Q,ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const p=Array(Q).fill(.5);for(const s of donors.sections)for(const c of s.source_text)if(ix.has(c))p[ix.get(c)]++;const N=p.reduce((a,b)=>a+b);for(let i=0;i<Q;i++)p[i]/=N;
 const X=gp.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices),Y=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 if(X.length!==1744||Y.length!==3008)throw Error("source");
 const count=new Uint32Array(Q**3),w=new Float64Array(Q**3),allowed=new Uint32Array(Q*Q),baseW=new Float64Array(Q*Q);
 for(const C of [X,Y])for(let i=2;i<C.length;i++)count[(C[i-1]*Q+C[i-2])*Q+C[i]]++;
 for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const k=(x*Q+y)*Q;let mask=FULL;for(let c=1;c<Q;c++)if(count[k+c])mask&=~(1<<c);allowed[x*Q+y]=mask;for(let s=0;s<Q;s++){let z=0;for(let c=0;c<Q;c++)if(count[k+c]){const p0=c===0?p[0]+(s?p[Q-s]:0):c===s?.002:p[mod(c-s)];z+=count[k+c]*Math.log(Q*p0)}w[k+s]=z;baseW[x*Q+s]+=z}}
 const rot=(m,b)=>b?((m>>>b)|(m<<(Q-b)))&FULL:m;
 const rotated=new Uint32Array(Q**3);for(let i=0;i<Q*Q;i++)for(let s=0;s<Q;s++)rotated[i*Q+s]=rot(allowed[i],s);
 const pop=v=>{v=v-((v>>>1)&0x55555555);v=(v&0x33333333)+((v>>>2)&0x33333333);return (((v+(v>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
 function upper(g,transpose){
  let total=0,blocks=[];for(let off=0;off<Q;off+=g){const m=Math.min(g,Q-off),shifts=new Int32Array(m),inds=Array.from({length:Q},(_,x)=>Array.from({length:m},(_,j)=>(transpose?(off+j)*Q+x:x*Q+off+j)*Q));let best=-Infinity,comb=Q**(m-1);
   for(let code=0;code<comb;code++){let z=code;for(let j=1;j<m;j++){shifts[j]=z%Q;z=Math.floor(z/Q)}let sum=0;for(let x=0;x<Q;x++){const k=inds[x];let mask=rotated[k[0]];for(let j=1;j<m;j++)mask&=rotated[k[j]+shifts[j]];if(!mask){sum=-Infinity;break}let hi=-Infinity;while(mask){const b=mask&-mask,a=31-Math.clz32(b);mask^=b;let v=w[k[0]+a];for(let j=1;j<m;j++)v+=w[k[j]+(a+shifts[j])%Q];if(v>hi)hi=v}sum+=hi}if(sum>best)best=sum}total+=best;blocks.push(best)
  }return{g,transpose,total,blocks}
 }
 const bounds=[upper(4,false),upper(4,true)];
 let keyCount=0n,bySupport=[0n,0n,0n],patterns=[0,0,0],best=-Infinity,bestA,bestB;
 function branch(ex){
  const rest=new Uint32Array(Q),B=new Int32Array(Q);for(let x=0;x<Q;x++){let mask=FULL;for(let y=0;y<Q;y++)if(!ex.includes(y))mask&=allowed[x*Q+y];rest[x]=mask}
  // For B=0, first two physical outputs also need a compatible origin. A
  // zero-forced row guarantees a possible first-output predecessor.
  if(!ex.length){if(!rest.some(m=>m===1))throw Error("no zero-forced row");for(const C of [X,Y])if(C[1])rest[C[0]]&=~(1<<C[1])}
  const comb=(Q-1)**ex.length;
  for(let code=0;code<comb;code++){let z=code;for(const y of ex){B[y]=1+z%(Q-1);z=Math.floor(z/(Q-1))}
   const masks=new Uint32Array(Q);let ok=true;for(let x=0;x<Q;x++){let m=rest[x];for(const y of ex)m&=rotated[(x*Q+y)*Q+B[y]];if(!m){ok=false;break}masks[x]=m}if(!ok)continue;
   let n=1n,score=0,A=new Int32Array(Q);for(let x=0;x<Q;x++){let m=masks[x];n*=BigInt(pop(m));let hi=-Infinity,arg=0;while(m){const b=m&-m,s=31-Math.clz32(b);m^=b;let v=baseW[x*Q+s];for(const y of ex){const k=(x*Q+y)*Q;v+=w[k+(s+B[y])%Q]-w[k+s]}if(v>hi){hi=v;arg=s}}score+=hi;A[x]=arg}
   keyCount+=n;bySupport[ex.length]+=n;patterns[ex.length]++;if(score>best){best=score;bestA=Array.from(A);bestB=Array.from(B)}
  }
 }
 branch([]);for(let i=1;i<Q;i++){branch([i]);for(let j=i+1;j<Q;j++)branch([i,j])}
 const check=bestA.every((s,x)=>bestB.every((b,y)=>allowed[x*Q+y]&(1<<((s+b)%Q))));if(!check)throw Error("best illegal");
 return {bounds,legalKeysSupportLE2:keyCount.toString(),bySupport:bySupport.map(x=>x.toString()),patterns,best:{score:best,A:bestA,B:bestB},sourceLengths:[X.length,Y.length],log2LowerBound:Math.log2(Number(keyCount))}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),JSON.parse(raw[1])),null,2));
