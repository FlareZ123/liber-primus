"use strict";
const fs=require("node:fs");
function experiment(corpus,gold){
 const W=19,H=91,N=W*H,FIT=60;
 const source=corpus.pages.slice(8,15).flatMap(p=>p.indices);
 const native=gold.sections.flatMap(s=>[...s.source_text].map(ch=>corpus.runes.indexOf(ch)).filter(x=>x>=0));
 const check=(condition,msg)=>{if(!condition)throw Error(msg)};
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const countRepeat=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 check(source.length===N&&countRepeat(source)===9,"canonical source");
 const columns=(x,w,h,mode="blocks")=>Array.from({length:w},(_,j)=>Array.from({length:h},(_,i)=>x[mode==="blocks"?j*h+i:i*w+j]));
 const join=(cols,order,start=0,end=cols[0].length)=>{const out=[];for(let i=start;i<end;i++)for(const j of order)out.push(cols[j][i]);return out};
 const flatten=cols=>cols.flat();
 function costDP(w,first,weight,maximize){
  const total=1<<w,full=total-1,dp=new Float64Array(total*w).fill(maximize?-Infinity:Infinity),prev=new Int8Array(total*w).fill(-1),size=new Uint8Array(total),ways=new Uint8Array(total*w);
  for(let j=0;j<w;j++){dp[(1<<j)*w+j]=first[j];ways[(1<<j)*w+j]=1}
  for(let mask=1;mask<=full;mask++){
   size[mask]=size[mask&(mask-1)]+1;
   let bits=mask,t=size[mask]-1;
   while(bits){const bit=bits&-bits,j=31-Math.clz32(bit),m=mask^bit;bits^=bit;if(!m)continue;
    let best=maximize?-Infinity:Infinity,q=-1,num=0,bs=m;
    while(bs){const b=bs&-bs,k=31-Math.clz32(b),v=dp[m*w+k]+weight[t][k*w+j];bs^=b;
     if(maximize?v>best:v<best){best=v;q=k;num=ways[m*w+k]}else if(v===best)num=Math.min(3,num+ways[m*w+k]);
    }dp[mask*w+j]=best;prev[mask*w+j]=q;ways[mask*w+j]=num;
   }
  }
  let j=0;for(let k=1;k<w;k++)if(maximize?dp[full*w+k]>dp[full*w+j]:dp[full*w+k]<dp[full*w+j])j=k;
  const best=dp[full*w+j];let minWays=0;for(let k=0;k<w;k++)if(dp[full*w+k]===best)minWays=Math.min(3,minWays+ways[full*w+k]);
  let m=full,path=[];while(m){path.push(j);const k=prev[m*w+j];m^=1<<j;j=k;}
  return {objective:best,path:path.reverse(),tiesCappedAt3:minWays};
 }
 function repeatFit(cols,start,end){
  const w=cols.length,weight=new Float64Array(w*w);
  for(let j=0;j<w;j++)for(let k=0;k<w;k++)for(let i=start;i<end;i++)weight[j*w+k]+=cols[j][i]===cols[k][i];
  return costDP(w,Array(w).fill(0),Array(w).fill(weight),false);
 }
 function repeatScore(cols,p,start,end){
  let internal=0,seam=0;for(let i=start;i<end;i++){for(let j=1;j<p.length;j++)internal+=cols[p[j]][i]===cols[p[j-1]][i];if(i>start)seam+=cols[p[0]][i]===cols[p.at(-1)][i-1];}
  return {internal,seam,total:internal+seam};
 }
 const originalRepeat=[];
 for(const mode of ["blocks","rows"]){const cols=columns(source,W,H,mode),all=repeatFit(cols,0,H),fit=repeatFit(cols,0,FIT);originalRepeat.push({mode,all,allScore:repeatScore(cols,all.path,0,H),fit,fitScore:repeatScore(cols,fit.path,0,FIT),holdout:repeatScore(cols,fit.path,FIT,H)});}
 check(originalRepeat[0].all.objective===15,"exact min");
 const random=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 function permutation(n,rng){let a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function encryptColumns(p,write,w=W,h=H){return write.flatMap(j=>Array.from({length:h},(_,i)=>p[i*w+j]));}
 const inverse=write=>write.map((_,i)=>write.indexOf(i));
 const repeatControls=[];
 const mask=new Set(source.flatMap((x,i)=>i&&x===source[i-1]?[i]:[]));
 for(let trial=0;trial<3;trial++){
  const rng=random(0x13333100+trial),p=[Math.floor(rng()*29)];
  for(let i=1;i<N;i++){let z=Math.floor(rng()*28);if(z>=p[i-1])z++;p.push(mask.has(i)?p[i-1]:z)}
  const write=permutation(W,rng),truth=inverse(write),c=encryptColumns(p,write),cols=columns(c,W,H),all=repeatFit(cols,0,H),fit=repeatFit(cols,0,FIT);
  check(eq(join(cols,truth),p),"plant known-order inversion");
  check(all.objective<=repeatScore(cols,truth,0,H).internal,"minimum plant bound");
  const samePath=(a,b)=>eq(a,b)||eq(a,b.slice().reverse());
  repeatControls.push({trial,truth,trueScore:repeatScore(cols,truth,0,H),all,allScore:repeatScore(cols,all.path,0,H),allAdjacencyRecovered:samePath(all.path,truth),fit,fitScore:repeatScore(cols,fit.path,0,FIT),holdout:repeatScore(cols,fit.path,FIT,H),fitAdjacencyRecovered:samePath(fit.path,truth)});
 }
 // Exhaustive brute-force regression for the subset recurrence at small widths.
 const rng=random(0x33011033);
 const small=Array.from({length:7},()=>Array.from({length:15},()=>Math.floor(rng()*5)));
 let min=Infinity,orders=0;
 function brute(path,left){if(!left.length){orders++;min=Math.min(min,repeatScore(small,path,0,15).internal);return;}for(const j of left)brute([...path,j],left.filter(x=>x!==j))}
 brute([],Array.from({length:7},(_,i)=>i));
 check(orders===5040&&repeatFit(small,0,15).objective===min,"7! brute regression");
 const primes=[];for(let n=2;primes.length<N;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}if(prime)primes.push((n-1)%29)}
 const mod=x=>(x%29+29)%29;
 const trainModel=p=>{let u=Array(29).fill(.5),b=Array.from({length:29},()=>Array(29).fill(.15));for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]][p[i]]++}const norm=a=>{let sum=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(x/sum))};return {u:norm(u),b:b.map(norm)}};
 // Known consuming prime clock, unknown whole-column permutation. For inner clock
 // shift depends on destination column; for outer clock on printed column.
 function decoded(c,order,layer,start=0,end=H){const cols=columns(c,W,H);const out=[];for(let i=start;i<end;i++)for(let t=0;t<W;t++){const j=order[t],k=layer==="inner"?i*W+t:j*H+i;out.push(mod(cols[j][i]-primes[k]));}return out}
 function encode(p,order,layer){const write=inverse(order);if(layer==="inner")return encryptColumns(p.map((x,i)=>mod(x+primes[i])),write);return encryptColumns(p,write).map((x,i)=>mod(x+primes[i]));}
 function languageFit(c,layer,model){
  const cols=columns(c,W,H),value=(t,j,i)=>mod(cols[j][i]-primes[layer==="inner"?i*W+t:j*H+i]);
  const first=Array.from({length:W},(_,j)=>{let v=0;for(let i=0;i<FIT;i++)v+=model.u[value(0,j,i)];return v});
  const weight=Array.from({length:W},()=>new Float64Array(W*W));
  for(let t=1;t<W;t++)for(let a=0;a<W;a++)for(let b=0;b<W;b++){let v=0;for(let i=0;i<FIT;i++)v+=model.b[value(t-1,a,i)][value(t,b,i)];weight[t][a*W+b]=v;}
  return costDP(W,first,weight,true);
 }
 function languageScore(p,m){let s=0;for(let i=0;i<p.length;i++)s+=i%W?m.b[p[i-1]][p[i]]:m.u[p[i]];return s/p.length}
 function fholdReach(c){let states=new Set([0]);for(let i=0;i<c.length;i++){let next=new Set;for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-primes[j])!==0)next.add(j+1)}if(!next.size)return {dead:i,final:0};states=next;}return {dead:null,final:states.size}}
 const results=[];
 for(const [idx,layer] of ["inner","outer"].entries()){
  const offset=idx?native.length-N:0,p=native.slice(offset,offset+N),training=native.slice(0,offset).concat(native.slice(offset+N)),model=trainModel(training);
  const truth=permutation(W,random(0x19172900+idx)),c=encode(p,truth,layer),fit=languageFit(c,layer,model),guess=decoded(c,fit.path,layer);
  check(eq(encode(guess,fit.path,layer),c),"plant exact forward replay");
  results.push({name:"native ordinary plant",layer,offset,truth,fit,exactOrder:eq(truth,fit.path),exactPrefix:guess.slice(0,FIT*W).filter((x,i)=>x===p[i]).length,exactHoldout:guess.slice(FIT*W).filter((x,i)=>x===p[FIT*W+i]).length,trainScore:languageScore(guess.slice(0,FIT*W),model),holdoutScore:languageScore(guess.slice(FIT*W),model),trueHoldoutScore:languageScore(p.slice(FIT*W),model)});
  const origModel=trainModel(native),of=languageFit(source,layer,origModel),op=decoded(source,of.path,layer);
  check(eq(encode(op,of.path,layer),source),"original exact forward replay");
  const shifted=join(columns(source,W,H),of.path);
  results.push({name:"original",layer,fit:of,trainScore:languageScore(op.slice(0,FIT*W),origModel),holdoutScore:languageScore(op.slice(FIT*W),origModel),prefix:op.slice(0,100).map(x=>corpus.translit[x]).join(""),holdoutPrefix:op.slice(FIT*W,FIT*W+100).map(x=>corpus.translit[x]).join(""),literalFReach:layer==="inner"?fholdReach(shifted):fholdReach(source)});
 }
 return {W,H,FIT,originalRepeat,repeatControls,brute:{orders,min},results};
}
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
