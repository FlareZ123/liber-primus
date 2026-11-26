'use strict';
function experiment(raw,mode="original"){
 const c=JSON.parse(raw[0]),g=JSON.parse(raw[1]),tokens=g.pages.flatMap(p=>p.tokens),names=[...new Set(tokens)],ids=tokens.map(t=>names.indexOf(t)),C=c.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 const N=C.length,T=names.length,Q=ids.length,L=T*29;
 if(N!==3008||Q!==256||T!==161||C.filter(x=>!x).length!==125)throw Error("source dimensions");
 const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,a,b){const x=s.indexOf(a),y=s.indexOf(b);if(x<0||y<=x)throw Error("donor bounds");return s.slice(x,y)}
 const ds=[["Gibran",donor(body(raw[2],"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(raw[3])],["Emerson",donor(body(raw[4],"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
 let seed=297234;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function hist(x,holds,phaseIds=ids){const a=new Int32Array(L);let h=0;for(let i=0;i<x.length;i++){if(holds[i]){if(x[i])throw Error("illegal hold");h++;continue}a[phaseIds[(i-h)%phaseIds.length]*29+x[i]]++}return a}
 const col=(x,holds,phaseIds=ids)=>hist(x,holds,phaseIds).reduce((s,n)=>s+n*(n-1)/2,0);
 // For each target nonzero run and its trailing-zero choice, maximize its
 // cross-collisions with all earlier runs over ONE consistent prefix path.
 // Then maximize the sum of these per-target upper bounds over a common
 // outer path. Prefix optima for different target runs need not agree.
 function bound(x,phaseIds=ids){
  const q=phaseIds.length,l=(1+Math.max(...phaseIds))*29,runs=[];let start=0;
  for(let i=0;i<x.length;i++)if(!x[i]){runs.push([start,i,1]);start=i+1}runs.push([start,x.length,0]);
  const H=runs.length-1,cell=(i,h)=>phaseIds[(i-h)%q]*29+x[i],NEG=-1000000000;
  const cells=runs.map(([a,b],r)=>Array.from({length:r+1},(_,h)=>Int16Array.from({length:b-a},(_,j)=>cell(a+j,h))));
  const Z=runs.map(([,b,z],r)=>Int16Array.from({length:r+1},(_,h)=>z?phaseIds[(b-h)%q]:-1));
  let outer=new Int32Array(H+1).fill(NEG);outer[0]=0;
  for(let r=0;r<runs.length;r++){
   let [,b,z]=runs[r],next=new Int32Array(H+1).fill(NEG);
   for(let h=0;h<=r;h++){
    let target=new Int16Array(l),within=0;
    for(const e of cells[r][h]){within+=target[e];target[e]++}
    let zero=Z[r][h],A=new Int32Array(h+1).fill(NEG),B=A.slice(),NA=A.slice(),NB=A.slice();A[0]=B[0]=0;
    for(let s=0;s<r;s++){
     NA.fill(NEG);NB.fill(NEG);
     let lo=Math.max(0,h-(r-s)),hi=Math.min(s,h);
     for(let j=lo;j<=hi;j++){
      let v=0,arr=cells[s][j];for(let k=0;k<arr.length;k++)v+=target[arr[k]];
      const va=A[j]+v,vb=B[j]+v,extra=Number(z&&Z[s][j]===zero);
      if(va>NA[j])NA[j]=va;if(vb+extra>NB[j])NB[j]=vb+extra;
      if(j<h){if(va>NA[j+1])NA[j+1]=va;if(vb>NB[j+1])NB[j+1]=vb}
     }
     [A,NA]=[NA,A];[B,NB]=[NB,B];
    }
    const base=outer[h]+within;
    if(base+B[h]>next[h])next[h]=base+B[h];
    if(z&&base+A[h]>next[h+1])next[h+1]=base+A[h];
   }
   outer=next;
  }
  return [...outer];
 }
 // Exact independent min/max cell counts at each final hold count. No
 // simultaneous attainment of different cell extrema is assumed.
 function marginals(x,phaseIds=ids){
  const q=phaseIds.length,l=(1+Math.max(...phaseIds))*29,runs=[];let start=0;
  for(let i=0;i<x.length;i++)if(!x[i]){runs.push([start,i,1]);start=i+1}runs.push([start,x.length,0]);
  const H=runs.length-1;let P=new Int16Array((H+1)*l),M=P.slice();
  for(let r=0;r<runs.length;r++){
   let [a,b,z]=runs[r],NP=new Int16Array((H+1)*l),NM=new Int16Array((H+1)*l).fill(32767);
   for(let h=0;h<=r;h++){
    let count=new Int16Array(l);for(let i=a;i<b;i++)count[phaseIds[(i-h)%q]*29+x[i]]++;
    let ze=z?phaseIds[(b-h)%q]*29:-1;
    for(let e=0;e<l;e++){let i=h*l+e,n=P[i]+count[e],m=M[i]+count[e],extra=Number(e===ze);
     if(n+extra>NP[i])NP[i]=n+extra;if(m+extra<NM[i])NM[i]=m+extra;
     if(z){NP[i+l]=n;NM[i+l]=m}
    }
   }P=NP;M=NM;
  }return {H,max:P,min:M,l};
 }
 function rejects(p,m){let h=p.filter(x=>!x).length;if(h>m.H)return ["F count"];let ht=hist(p,p.map(x=>!x)),bad=[];
  for(let t=0;t<T;t++){let found=false;
   for(let k=0;k<29&&!found;k++){let ok=true;for(let x=0;x<29;x++){let i=h*L+t*29+(x+k)%29,n=ht[t*29+x];if(n>m.max[i]||n<m.min[i]){ok=false;break}}if(ok)found=true}
   if(!found)bad.push(names[t]);
  }return bad;
 }
 function brute(){
  let count=0;
  for(let trial=0;trial<48;trial++){
   let phaseIds=Array.from({length:5},()=>rng()%3);let x=Array.from({length:14},()=>rng()%4),F=x.flatMap((v,i)=>v===0?[i]:[]);
   if(F.length>10){trial--;continue}
   let B=bound(x,phaseIds),m=marginals(x,phaseIds),trueB=Array(F.length+1).fill(-1),lo=new Int16Array(m.min.length).fill(32767),hi=new Int16Array(m.max.length);
   for(let s=0;s<2**F.length;s++){let h=0,mask=Array(x.length).fill(false);for(let j=0;j<F.length;j++)if((s>>j)&1){mask[F[j]]=true;h++}
    let ht=hist(x,mask,phaseIds);trueB[h]=Math.max(trueB[h],ht.reduce((a,n)=>a+n*(n-1)/2,0));
    for(let j=0;j<m.l;j++){let p=h*m.l+j;lo[p]=Math.min(lo[p],ht[j]);hi[p]=Math.max(hi[p],ht[j])}count++;
   }
   if(trueB.some((v,i)=>v>B[i])||B[0]!==trueB[0]||B.at(-1)!==trueB.at(-1)||lo.some((v,i)=>v!==m.min[i])||hi.some((v,i)=>v!==m.max[i]))throw Error("exhaustive self-test failure");
  }
  return {trials:48,holdHistories:count,exactMarginals:true,allCeilingsSound:true,endpointsExact:true};
 }
 // Exact geometry matching by subset-sum over each class's possible
 // consumed-zero contributions. Randomized tie order, conditioned on 125
 // visible zero ciphertext runes, not uniform random shifts.
 function plant(p,transparent){
  let H=0,ht=new Int32Array(L);
  for(let i=0;i<p.length;i++){if(transparent&&!p[i]){H++;continue}ht[ids[(i-H)%Q]*29+p[i]]++}
  const goal=125-H;if(goal<0)throw Error("too many native F");
  let reach=new Uint8Array(goal+1);reach[0]=1;let rows=[];
  for(let t=0;t<T;t++){
   let next=new Uint8Array(goal+1),back=new Int8Array(goal+1).fill(-1),ks=Array.from({length:29},(_,i)=>i);
   for(let i=28;i>0;i--){let j=rng()%(i+1);[ks[i],ks[j]]=[ks[j],ks[i]]}
   for(const k of ks){let a=ht[t*29+(29-k)%29];for(let n=0;n+a<=goal;n++)if(reach[n]&&!next[n+a]){next[n+a]=1;back[n+a]=k}}
   rows.push(back);reach=next;
  }
  if(!reach[goal])throw Error("geometry not reachable");
  let key=Array(T),n=goal;for(let t=T-1;t>=0;t--){key[t]=rows[t][n];n-=ht[t*29+(29-key[t])%29]}
  let h=0,holds=p.map(x=>transparent&&!x),ct=p.map((x,i)=>{if(holds[i]){h++;return 0}return (x+key[ids[(i-h)%Q]])%29});
  h=0;for(let i=0;i<N;i++){if(holds[i]){if(p[i]||ct[i])throw Error("bad hold");h++}else if((ct[i]-key[ids[(i-h)%Q]]+29)%29!==p[i])throw Error("replay")}
  if(ct.filter(x=>!x).length!==125||col(p,holds)!==col(ct,holds))throw Error("geometry/collision control");
  return {p,ct,key,holds,H};
 }
 function witness(){
  const holdPositions=[44,163,171,187,189,212,221,257,331,337,402,412,472,518,521,568,571,636,666,692,711,716,738,755,799,812,848,871,875,895,946,948,981,1025,1027,1037,1083,1189,1225,1244,1296,1359,1482,1498,1559,1620,1687,1721,1805,1834,1874,1921,1972,1977,2130,2194,2368,2371,2373,2401,2407,2477,2531,2534,2565,2607,2658,2662,2676,2692,2698,2731,2746,2819,2918];
  const mask=C.map((_,i)=>holdPositions.includes(i)),ht=hist(C,mask),key=names.map((_,t)=>ht.subarray(t*29,t*29+29).findIndex(n=>!n));
  if(key.some(k=>k<0))throw Error("witness illegal key");let h=0,p=C.map((x,i)=>{if(mask[i]){h++;return 0}let v=(x-key[ids[(i-h)%Q]]+29)%29;if(!v)throw Error("consumed F");return v});
  if(col(p,mask)!==col(C,mask))throw Error("witness collision");
  h=0;for(let i=0;i<N;i++){if(mask[i]){if(p[i]||C[i])throw Error("witness hold");h++;continue}if((p[i]+key[ids[(i-h)%Q]])%29!==C[i])throw Error("witness replay")}
  return {H:h,collisions:col(C,mask),allClassShiftsLegal:true,replay:true,meaning:"statistic witness only, no linguistic claim",holdPositions,key};
 }
 if(mode==="sliding"){
  // A sliding window at absolute non-F index a selects the precomputed
  // histogram phase a mod256. Update all phase views in O(Q) per step.
  const refs=ds.map(([name,d])=>{
   const counts=Array.from({length:Q},()=>new Int16Array(L)),scores=new Int32Array(Q),min=Array(126).fill(null),max=Array(126).fill(null),byH=Array(126).fill(0),minStart=Array(126).fill(null);
   let a=0,b=0,H=0,above125=0,allMin=Infinity,allMax=-Infinity,checked=0;
   function update(idx,v,sign){for(let ph=0;ph<Q;ph++){let cell=ids[(idx-ph+Q)%Q]*29+v,h=counts[ph],n=h[cell];scores[ph]+=sign===1?n:1-n;h[cell]+=sign}}
   for(let j=0;j<N;j++){let v=d[j];if(v===0)H++;else update(b++,v,1)}
   const end=d.length-N,check=new Set(Array.from({length:32},(_,i)=>Math.round(i*end/31)));
   for(let s=0;s<=end;s++){
    const M=scores[a%Q];if(check.has(s)){const p=d.slice(s,s+N),want=col(p,p.map(v=>!v));if(M!==want||p.filter(v=>!v).length!==H)throw Error("sliding mismatch");checked++}
    allMin=Math.min(allMin,M);allMax=Math.max(allMax,M);
    if(H>125)above125++;else{byH[H]++;if(min[H]===null||M<min[H]){min[H]=M;minStart[H]=s}max[H]=max[H]===null?M:Math.max(max[H],M)}
    if(s===end)break;let v=d[s],w=d[s+N];if(v===0)H--;else update(a++,v,-1);if(w===0)H++;else update(b++,w,1);
   }
   return {name,windows:end+1,allMin,allMax,above125,byH,min,max,minStart,checked};
  });return {n:N,clock:"phase-zero literal-token F-transparent",refs};
 }
 if(mode==="original"){
  const test=brute(),B=bound(C),m=marginals(C),refs=ds.map(([name,d])=>{
   const windows=Array.from({length:32},(_,i)=>{let start=Math.round(i*(d.length-N)/31),p=d.slice(start,start+N),hold=p.map(x=>!x),H=hold.filter(Boolean).length;return {start,H,col:col(p,hold),upper:B[H]??null,classRejections:rejects(p,m)}});
   return {name,min:Math.min(...windows.map(x=>x.col)),max:Math.max(...windows.map(x=>x.col)),excludedByCollision:windows.filter(x=>x.upper===null||x.col>x.upper).length,excludedByMarginals:windows.filter(x=>x.classRejections.length).length,windows};
  });
  return {n:N,classes:T,visibleF:125,test,B,refRange:[42,109],maxRefRange:Math.max(...B.slice(42,110)),refs,witness:witness()};
 }
 const i=Number(mode.slice(-1)),wrong=mode.includes("wrong");
 if(!Number.isInteger(i)||i<0||i>2)throw Error("control selector");
 const [name,d]=ds[i],start=[1234,4567,7890][i],p=d.slice(start,start+N),pl=plant(p,!wrong),H=p.filter(x=>!x).length,M=col(p,p.map(x=>!x));
 if(mode.startsWith("fixture"))return {name,start,wrongClock:wrong,n:N,visibleF:125,trueH:pl.H,nativeH:H,nativeFholdCollisions:M,cipherTrueClockCollisions:col(pl.ct,pl.holds),exactTrueClockReplay:true,ciphertext:pl.ct,key:pl.key,plaintext:p,holds:pl.holds.flatMap((x,i)=>x?[i]:[])};
 const B=bound(pl.ct),m=marginals(pl.ct),rej=rejects(p,m);
 if(!wrong&&(M>B[H]||rej.length))throw Error("positive rejected");
 return {name,start,wrongClock:wrong,n:N,visibleF:125,trueH:pl.H,nativeH:H,nativeFholdCollisions:M,cipherTrueClockCollisions:col(pl.ct,pl.holds),upperAtNativeH:B[H]??null,classRejections:rej,exactTrueClockReplay:true};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
module.exports={experiment,files};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),process.argv[2]||'original'),null,2));}
