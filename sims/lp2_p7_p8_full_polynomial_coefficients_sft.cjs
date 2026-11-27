'use strict';
const fs=require('node:fs');
function run(corpus,reference){
  const mod=x=>((x%29)+29)%29;
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("singular")};
  const pow=(x,n)=>{let a=1;while(n--)a=mod(a*x);return a};
  const evalP=(a,x)=>a.reduceRight((s,v)=>mod(s*x+v),0);
  function lagrange(xs){
    return xs.map((x,i)=>{
      let a=[1],d=1;
      for(let j=0;j<xs.length;j++)if(i!==j){const y=xs[j],b=Array(a.length+1).fill(0);for(let k=0;k<a.length;k++){b[k]=mod(b[k]-y*a[k]);b[k+1]=mod(b[k+1]+a[k]);}a=b;d=mod(d*(x-y));}
      return a.map(v=>mod(v*inv(d)));
    });
  }
  const render=a=>a.map(x=>corpus.translit[x]).join("");
  const p8=corpus.pages[8].indices,p9=corpus.pages[9].indices,p57=corpus.pages[57].indices;
  assert(p8.length===255&&p9.length===268&&p57.length===95,"physical lengths");
  const labels=corpus.translit.map((s,i)=>[s,i]).concat([["ING",21],["QU",5],["K",5],["V",1]]).sort((a,b)=>b[0].length-a[0].length);
  const train=[];
  for(const word of reference.split("### 56")[0].split("\n").filter(s=>/^[A-Z][A-Z ,;.!?"'0-9-]*$/.test(s)).join(" ").match(/[A-Z]+/g)||[]){let i=0;while(i<word.length){const p=labels.find(([s])=>word.startsWith(s,i));if(!p){i++;continue;}train.push(p[1]);i+=p[0].length;}}
  const counts=Array.from({length:841},()=>Array(29).fill(0.25)),totals=Array(841).fill(29*0.25);
  for(let i=2;i<train.length;i++){const j=train[i-2]*29+train[i-1];counts[j][train[i]]++;totals[j]++;}
  function score(a){let s=0;for(let i=2;i<a.length;i++){const j=a[i-2]*29+a[i-1];s+=Math.log(counts[j][a[i]]/totals[j]);}const h=Array(29).fill(0);for(const x of a)h[x]++;return {n:a.length,trigram:s/(a.length-2),ioc:h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1)),text:render(a)};}
  function read(a,layout){const n=Math.floor(a.length/5);return Array.from({length:n},(_,i)=>Array.from({length:5},(_,j)=>a[layout==="rows"?5*i+j:j*n+i]));}
  function flatten(a,layout){return layout==="rows"?a.flat():Array.from({length:5},(_,j)=>a.map(row=>row[j])).flat();}
  function decode(a,xs,li,lo,monic){const L=lagrange(xs);const vals=read(a,li);const coefficients=vals.map(row=>Array.from({length:5},(_,k)=>mod(row.reduce((s,y,i)=>s+mod(y-(monic?pow(xs[i],5):0))*L[i][k],0))));return {plain:flatten(coefficients,lo).concat(a.slice(vals.length*5)),lanes:flatten(coefficients,"columns").reduce((arr,x,i)=>{const j=Math.floor(i/coefficients.length);(arr[j]??=[]).push(x);return arr;},[])};}
  function encode(a,xs,li,lo,monic){const coefficients=read(a,lo);return flatten(coefficients.map(row=>xs.map(x=>mod(evalP(row,x)+(monic?pow(x,5):0)))),li).concat(a.slice(coefficients.length*5));}
  const configs=[],same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  for(const xs of [[1,2,3,4,5],[3,5,1,4,2],[11,26,8,15,2]])for(const monic of [false,true])for(const li of ["rows","columns"])for(const lo of ["rows","columns"]){
    const a=decode(p8,xs,li,lo,monic),b=decode(p9,xs,li,lo,monic);
    assert(same(encode(a.plain,xs,li,lo,monic),p8)&&same(encode(b.plain,xs,li,lo,monic),p9),"original replay");
    const plant1=train.slice(300,555),plant2=p57.concat(train.slice(700,873));assert(plant1.length===255&&plant2.length===268,"control lengths");
    for(const plant of [plant1,plant2])assert(same(decode(encode(plant,xs,li,lo,monic),xs,li,lo,monic).plain,plant),"plant");
    configs.push({xs,monic,li,lo,p8:score(a.plain),p9:score(b.plain.slice(0,265)),p8lanes:a.lanes.map(score),p9lanes:b.lanes.map(score),controls:2});
  }
  configs.sort((a,b)=>b.p8.trigram-a.p8.trigram);
  return {train:train.length,baseline:{raw8:score(p8),raw9:score(p9.slice(0,265)),clear57:score(p57),native255:score(train.slice(300,555)),native268:score(p57.concat(train.slice(700,873)))},configs};
}
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const reference=fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt','utf8');
console.log(JSON.stringify(run(corpus,reference),null,2));
