// @ts-check
"use strict";
/** Ciphertext-only cube-orbit partition fit; prefix-trained bigram/trigram likelihood, held-out Viterbi. */
const fs=require("node:fs");
const path=require("node:path");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function run(inputs){
  const corpus=JSON.parse(inputs[0]),native=JSON.parse(inputs[4]);
  const mod=x=>(x%29+29)%29;
  const cube=x=>x*x*x%29;
  const classes=[],cls=new Int8Array(29).fill(-1);
  for(let x=0;x<29;x++)if(cls[x]<0){const a=[];let v=x;do{a.push(v);cls[v]=classes.length;v=cube(v)}while(v!==x);classes.push(a)}
  const sizes=classes.map(a=>a.length),starts=[];let z=0;for(const n of sizes){starts.push(z);z+=n}
  const slotClass=classes.flatMap((a,i)=>a.map(()=>i));
  const pow=Array.from({length:6},(_,k)=>Array.from({length:29},(_,x)=>{for(let i=0;i<k;i++)x=cube(x);return x}));
  const map=new Map(corpus.translit.map((s,i)=>[s,i]));
  const glyphs=new Map(corpus.runes.map((s,i)=>[s,i]));
  function latin(raw){const a=[];for(let s of raw.match(/[A-Za-z]+/g)||[]){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let j=0;j<s.length;){const t=["TH","EO","NG","OE","AE","IA","EA"].find(t=>s.startsWith(t,j))||s[j];if(!map.has(t))throw Error(t);a.push(map.get(t));j+=t.length}}return a}
  const donors=inputs.slice(1,4).map(latin);
  const counts1=new Float64Array(29),counts2=new Float64Array(841),counts3=new Float64Array(24389),den2=new Float64Array(29),den3=new Float64Array(841);
  const training=[donors[0],donors[2].slice(0,Math.floor(donors[2].length/2)),...native.sections.slice(0,5).map(s=>[...s.source_text].filter(x=>glyphs.has(x)).map(x=>glyphs.get(x)))];
  let total=0;
  for(const a of training)for(let i=0;i<a.length;i++){counts1[a[i]]++;total++;if(i){counts2[a[i-1]*29+a[i]]++;den2[a[i-1]]++}if(i>1){let t=a[i-2]*29+a[i-1];counts3[t*29+a[i]]++;den3[t]++}}
  const p1=counts1.map(n=>(n+.5)/(total+14.5)),p2=counts2.map((n,i)=>(n+10*p1[i%29])/(den2[Math.floor(i/29)]+10)),p3=counts3.map((n,i)=>(n+20*p2[i%841])/(den3[Math.floor(i/29)]+20));
  const l1=p1.map(Math.log),l2=p2.map(Math.log),l3=p3.map(Math.log);
  const rand=(seed)=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}};
  function shuffle(a,rng){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function score2(o,chart){
    let prev=new Float64Array(6),next=new Float64Array(6),n=sizes[o[0]],s=starts[o[0]],sum=0;
    for(let j=0;j<n;j++)sum+=(prev[j]=p1[chart[s+j]]);
    let ll=Math.log(sum);for(let j=0;j<n;j++)prev[j]/=sum;
    for(let t=1;t<o.length;t++){const m=sizes[o[t]],v=starts[o[t]];sum=0;
      for(let j=0;j<m;j++){let p=0,b=chart[v+j];for(let i=0;i<n;i++)p+=prev[i]*p2[chart[s+i]*29+b];sum+=(next[j]=p)}
      ll+=Math.log(sum);for(let j=0;j<m;j++)next[j]/=sum;
      [prev,next]=[next,prev];n=m;s=v;
    }return ll
  }
  function score3(o,chart,split=o.length){
    let a=sizes[o[0]],b=sizes[o[1]],sa=starts[o[0]],sb=starts[o[1]],prev=new Float64Array(36),next=new Float64Array(36),sum=0;
    for(let i=0;i<a;i++)for(let j=0;j<b;j++)sum+=(prev[i*b+j]=p1[chart[sa+i]]*p2[chart[sa+i]*29+chart[sb+j]]);
    let ll=Math.log(sum),prefix=split===2?ll:null;
    for(let k=0;k<a*b;k++)prev[k]/=sum;
    for(let t=2;t<o.length;t++){const c=sizes[o[t]],sc=starts[o[t]];sum=0;
      for(let j=0;j<b;j++)for(let k=0;k<c;k++){let p=0,y=chart[sb+j]*29+chart[sc+k];for(let i=0;i<a;i++)p+=prev[i*b+j]*p3[chart[sa+i]*841+y];sum+=(next[j*c+k]=p)}
      ll+=Math.log(sum);for(let k=0;k<b*c;k++)next[k]/=sum;
      [prev,next]=[next,prev];a=b;b=c;sa=sb;sb=sc;if(t+1===split)prefix=ll;
    }return {ll,prefix:prefix??ll,held:ll-(prefix??ll)}
  }
  function viterbi(o,chart){
    let a=sizes[o[0]],b=sizes[o[1]],sa=starts[o[0]],sb=starts[o[1]],prev=new Float64Array(36),next=new Float64Array(36);
    for(let i=0;i<a;i++)for(let j=0;j<b;j++)prev[i*b+j]=l1[chart[sa+i]]+l2[chart[sa+i]*29+chart[sb+j]];
    const back=new Int8Array(o.length*36).fill(-1);
    for(let t=2;t<o.length;t++){const c=sizes[o[t]],sc=starts[o[t]];
      for(let j=0;j<b;j++)for(let k=0;k<c;k++){let best=-Infinity,arg=-1,y=chart[sb+j]*29+chart[sc+k];for(let i=0;i<a;i++){const v=prev[i*b+j]+l3[chart[sa+i]*841+y];if(v>best){best=v;arg=i}}next[j*c+k]=best;back[t*36+j*c+k]=arg}
      [prev,next]=[next,prev];a=b;b=c;sa=sb;sb=sc;
    }
    let pos=0;for(let k=1;k<a*b;k++)if(prev[k]>prev[pos])pos=k;
    const idx=new Int8Array(o.length);idx[o.length-2]=Math.floor(pos/b);idx[o.length-1]=pos%b;
    for(let t=o.length-1;t>=2;t--)idx[t-2]=back[t*36+idx[t-1]*sizes[o[t]]+idx[t]];
    const plain=Array.from(idx,(v,i)=>chart[starts[o[i]]+v]);
    return {plain,logp:prev[pos]}
  }
  function membership(chart){const m=new Int8Array(29);for(let i=0;i<29;i++)m[chart[i]]=slotClass[i];return Array.from(m)}
  function swapProposal(chart,rng){const a=Math.floor(rng()*29);let b=Math.floor(rng()*29);while(slotClass[a]===slotClass[b])b=Math.floor(rng()*29);[chart[a],chart[b]]=[chart[b],chart[a]];return [a,b]}
  function optimize(prefix,seed){
    const rng=rand(seed),best2=[];
    for(let j=0;j<6;j++){
      let chart=shuffle(Array.from({length:29},(_,i)=>i),rng),sc=score2(prefix,chart),best=sc,bestChart=chart.slice();
      for(let i=0;i<1800;i++){const temp=2.5*Math.pow(.04,i/1799),[a,b]=swapProposal(chart,rng),n=score2(prefix,chart);if(n>sc||rng()<Math.exp((n-sc)/temp)){sc=n;if(sc>best){best=sc;bestChart=chart.slice()}}else [chart[a],chart[b]]=[chart[b],chart[a]]}
      best2.push({chart:bestChart,score:best})
    }
    best2.sort((a,b)=>b.score-a.score);
    let best=null;
    for(let j=0;j<3;j++){let chart=best2[j].chart.slice(),sc=score3(prefix,chart).ll,top=sc,topChart=chart.slice();for(let i=0;i<900;i++){const temp=1.8*Math.pow(.035,i/899),[a,b]=swapProposal(chart,rng),n=score3(prefix,chart).ll;if(n>sc||rng()<Math.exp((n-sc)/temp)){sc=n;if(sc>top){top=sc;topChart=chart.slice()}}else [chart[a],chart[b]]=[chart[b],chart[a]]}if(best===null||top>best.score)best={chart:topChart,score:top}}
    return {best,stage2:best2.map(x=>x.score)}
  }
  function observe(c){return c.slice(1).map((v,i)=>cls[mod(v-c[i])])}
  const original=corpus.pages.filter(p=>p.page>=27&&p.page<33).flatMap(p=>p.indices),split=corpus.pages.filter(p=>p.page>=27&&p.page<29).reduce((s,p)=>s+p.indices.length,0)-1;
  const N=original.length-1;
  const cases=[{name:"original",c:original,truth:null,chart:null}];
  for(let j=0;j<2;j++){const plain=donors[j===0?1:2].slice(j===0?41000:220000,(j===0?41000:220000)+N),rng=rand(0x78422000+j),chart=shuffle(Array.from({length:29},(_,i)=>i),rng),m=membership(chart),c=[Math.floor(rng()*29)],rounds=[];
    const index=new Int8Array(29);for(let k=0;k<classes.length;k++)for(let i=0;i<sizes[k];i++)index[chart[starts[k]+i]]=classes[k][i];
    for(const p of plain){const n=Math.floor(rng()*6);rounds.push(n);c.push(mod(c[c.length-1]+pow[n][index[p]]))}
    cases.push({name:j?"Emerson blind chart":"Shakespeare blind chart",c,truth:plain,chart,rounds})
  }
  const results=[];
  for(let j=0;j<cases.length;j++){const t=cases[j],o=observe(t.c),prefix=o.slice(0,split),opt=optimize(prefix,0x13370000+j),chart=opt.best.chart,v=viterbi(o,chart),scores=score3(o,chart,split),mem=membership(chart),index=new Int8Array(29);for(let k=0;k<classes.length;k++)for(let i=0;i<sizes[k];i++)index[chart[starts[k]+i]]=classes[k][i];
    const recovered=[t.c[0]],rounds=[];for(let i=0;i<N;i++){const d=mod(t.c[i+1]-t.c[i]);const k=pow.findIndex(row=>row[index[v.plain[i]]]===d);if(k<0)throw Error("no inverse");rounds.push(k);recovered.push(mod(recovered[i]+pow[k][index[v.plain[i]]]))}
    if(recovered.some((x,i)=>x!==t.c[i]))throw Error("replay");
    const result={name:t.name,chart,member:mem,stage2:opt.stage2,prefixNats:scores.prefix/split,heldNats:scores.held/(N-split),uniformLabelHeldNats:o.slice(split).reduce((s,k)=>s+Math.log(sizes[k]/29),0)/(N-split),viterbiPreview:v.plain.slice(0,100).map(x=>corpus.translit[x]).join(" "),viterbiPlain:v.plain,rounds,replayed:N};
    if(t.truth){const known=viterbi(o,t.chart),trueScore=score3(o,t.chart,split);result.truthMember=membership(t.chart);result.classLabelsCorrect=mem.filter((x,i)=>x===result.truthMember[i]).length;result.heldExact=v.plain.slice(split).filter((x,i)=>x===t.truth[split+i]).length;result.knownChartHeldExact=known.plain.slice(split).filter((x,i)=>x===t.truth[split+i]).length;result.knownChartHeldNats=trueScore.held/(N-split);result.knownChartPrefixNats=trueScore.prefix/split;result.truth=t.truth}
    results.push(result);
  }
  return {model:"cumulative canonical GP29 differences; arbitrary static input chart and independent uniform Q rounds as likelihood assumption",classes,trainingRunes:total,N,split,held:N-split,results};
}
console.log(JSON.stringify(run(inputs),null,2));
