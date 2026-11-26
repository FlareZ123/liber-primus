"use strict";
const fs=require("node:fs");const path=require("node:path");
function experiment(corpus,raw,g,s,e){
 const M=29,mod=x=>(x+M*2)%M,F=0;
 const idx=new Map(corpus.runes.map((v,i)=>[v,i])),profile=Array(40).fill(0);let wlen=0;
 const flush=()=>{if(wlen){profile[wlen]++;wlen=0}};
 for(const c of raw.split("%").slice(0,55).join("%")){if(idx.has(c))wlen++;else if(c!=="/"&&c!=="%"&&!/\s/u.test(c))flush()}flush();
 const alphabet=corpus.translit;
 const pool=text=>{let by=Array.from({length:40},()=>[]);for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
  let a=[];while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
  if(a.length&&a.length<40)by[a.length].push(a)
 }return by};
 const oracle=pool(s),train=pool(g+"\n"+e),contexts=[];
 for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length)for(let i=0;i<l;i++)contexts.push({l,i,n:profile[l]});
 const ci=Object.fromEntries(contexts.map((v,i)=>[`${v.l}:${v.i}`,i]));
 const X=by=>contexts.map(({l,i})=>{let h=Array(M).fill(0);for(const w of by[l])h[w[i]]++;return h.map(n=>n/by[l].length)});
 let st=0x2f6ab183;
 const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return st>>>0};
 const perm=()=>{let p=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>1;i--){let j=1+rng()%i;[p[i],p[j]]=[p[j],p[i]]}return p};
 const ord=perm(),pi=[];ord.forEach((v,i)=>pi[v]=i);
 const k=[2,6,9,12,17,19,23,27],Y=contexts.map(()=>new Float64Array(M));
 for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length){
  const by=oracle[l];for(let j=0;j<profile[l];j++){let w=by[rng()%by.length],phase=rng()%8;
   for(let i=0;i<l;i++){let p=w[i],c=F;if(p!==F){c=ord[mod(pi[p]+k[phase])];phase=(phase+1)%8}Y[ci[`${l}:${i}`]][c]++}
  }
 }
 const trueRows=Array.from({length:M},(_,c)=>k.map(d=>ord[mod(pi[c]-d)]).sort((a,b)=>a-b));
 function allRows(X){
  const G=Array.from({length:M},()=>new Float64Array(M)),L=Array.from({length:M},()=>new Float64Array(M));
  for(let t=0;t<contexts.length;t++){
   const n=contexts[t].n,x=X[t],y=Y[t];
   for(let p=1;p<M;p++){
    for(let q=1;q<M;q++)G[p][q]+=n*x[p]*x[q]/64;
    for(let c=0;c<M;c++)L[p][c]+=-2*(x[p]/8)*(y[c]-(c===F?n*x[F]:0))
   }
  }
  const rowScore=(set,c)=>{let z=0;for(let p of set){z+=L[p][c];for(let q of set)z+=G[p][q]}return z};
  const threshold=trueRows.map((s,c)=>rowScore(s,c)),rank=new Uint32Array(M),best=new Float64Array(M).fill(Infinity),bestMasks=new Uint32Array(M),ties=new Uint32Array(M);
  const stack=new Int32Array(8),linear=new Float64Array(M);
  let leaves=0;
  function rec(start,depth,quad,mask){
   if(depth===8){
    leaves++;
    for(let c=0;c<M;c++){
     const z=quad+linear[c];if(z<threshold[c]-1e-10)rank[c]++;else if(Math.abs(z-threshold[c])<=1e-10)ties[c]++;
     if(z<best[c]){best[c]=z;bestMasks[c]=mask}
    }return;
   }
   for(let p=start;p<=M-(8-depth);p++){
    let add=G[p][p];for(let j=0;j<depth;j++)add+=2*G[p][stack[j]];
    const lp=L[p];for(let c=0;c<M;c++)linear[c]+=lp[c];stack[depth]=p;
    rec(p+1,depth+1,quad+add,mask|(1<<p));
    for(let c=0;c<M;c++)linear[c]-=lp[c];
   }
  }rec(0,0,0,0);
  if(leaves!==4292145)throw Error("subset coverage");
  let bestRows=Array.from(bestMasks,m=>Array.from({length:M},(_,i)=>i).filter(i=>(m>>i)&1));
  let edges=0;for(let c=0;c<M;c++)edges+=bestRows[c].filter(p=>trueRows[c].includes(p)).length;
  let colCounts=Array(M).fill(0);for(let row of bestRows)for(let p of row)colCounts[p]++;
  return {leaves,trueRows,bestRows,edges,exactRows:bestRows.filter((row,c)=>row.every((p,i)=>p===trueRows[c][i])).length,ranks:Array.from(rank,x=>x+1),ties:Array.from(ties),columnCounts:colCounts,bestScore:Array.from(best),trueScore:threshold};
 }
 return {key:k,ord,contexts:contexts.length,sourceGroups:profile.reduce((a,b)=>a+b,0),sourceRunes:profile.reduce((a,b,i)=>a+i*b,0),oracle:allRows(X(oracle)),independent:allRows(X(train))};
}
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
