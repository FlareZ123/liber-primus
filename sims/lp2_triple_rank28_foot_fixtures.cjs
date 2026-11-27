"use strict";
const fs=require("node:fs"),path=require("node:path");
function rank28Fixtures(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[4]),Q=29,L=76,H=48,Q2=Q*Q,Q3=Q2*Q;
 const mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"encode");out.push(q.i);j+=q.t.length;}}return out;}
 function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
 const lit=raw.slice(1,4).map(s=>encode(body(s)));
 const train=[...lit.map(p=>p.slice(0,Math.floor(p.length*.65))),...gold.sections.filter(s=>s.name!=="p57_parable").map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)))];
 const n1=new Float64Array(Q),n2=new Float64Array(Q2),n3=new Float64Array(Q3),d2=new Float64Array(Q),d3=new Float64Array(Q2),n4=new Float64Array(Q3*Q),d4=new Float64Array(Q3);
 let total=0;
 for(const p of train)for(let i=0;i<p.length;i++){const c=p[i];n1[c]++;total++;if(i){const a=p[i-1];n2[a*Q+c]++;d2[a]++;if(i>1){const ab=p[i-2]*Q+a;n3[ab*Q+c]++;d3[ab]++;if(i>2){const abc=p[i-3]*Q2+ab;n4[abc*Q+c]++;d4[abc]++;}}}}
 const U=Float64Array.from(n1,n=>(n+.5)/(total+14.5)),B=Float64Array.from(n2,(n,i)=>(n+12*U[i%Q])/(d2[Math.floor(i/Q)]+12)),T=Float64Array.from(n3,(n,i)=>(n+9*B[i%Q2])/(d3[Math.floor(i/Q)]+9));
 const F=Float64Array.from(n4,(n,i)=>(n+7*T[i%Q3])/(d4[Math.floor(i/Q)]+7));
 const lu=U.map(Math.log),lb=B.map(Math.log),lt=T.map(Math.log),lf=F.map(Math.log);



 const D=28,wrap=(x,m)=>(x%m+m)%m;
 const orig=[32,53,55].map(i=>gp.pages[i].indices.slice(-76).slice(1).map((x,j)=>mod(x-gp.pages[i].indices.slice(-76)[j])));
 const repeats=x=>x.flatMap((v,i)=>v===0?[i]:[]);
 check(JSON.stringify(orig.map(repeats))===JSON.stringify([[58],[],[58]]),"original foot repeat positions");
 // Match the observed repeat positions exactly using genuine held literary windows.
 const W=75,pos=58,eligible=[];
 for(let R=0;R<Q;R++){
  const windows=lit.map((s,j)=>{
   const lo=Math.floor(s.length*.70),hi=Math.floor(s.length*.95)-W,good=[];
   let count=s.slice(lo,lo+W).filter(x=>x===R).length;
   for(let a=lo;a<=hi;a++){
    if(j===1?count===0:count===1&&s[a+pos]===R)good.push(a);
    if(a<hi)count+=(s[a+W]===R?1:0)-(s[a]===R?1:0);
   }return good;
  });
  if(windows.every(x=>x.length))eligible.push({R,windows});
 }
 check(eligible.length>=6,"insufficient R support");
 let rng=0x87225e31;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const pool=[...eligible];const controls=[];
 for(let trial=0;trial<8;trial++){
  if(!pool.length)pool.push(...eligible);
  const {R,windows}=pool.splice(rand(pool.length),1)[0],skip=trial%2===1,offsets=windows.map(a=>a[rand(a.length)]);
  const p=lit.map((s,j)=>s.slice(offsets[j],offsets[j]+W));
  const randpad=()=>Array.from({length:W},()=>rand(D));
  function encode(p,k){let j=0;return p.map(x=>{if(x===R){if(!skip)j++;return 0;}const rank=x<R?x:x-1;return 1+wrap(rank+k[j++],D);});}
  const k=randpad(),positive=p.map(x=>encode(x,k)),negative=p.map(x=>encode(x,randpad()));
  check(JSON.stringify(positive.map(repeats))===JSON.stringify(orig.map(repeats)),"positive patterns");
  check(JSON.stringify(negative.map(repeats))===JSON.stringify(orig.map(repeats)),"negative patterns");
  controls.push({trial,R,skip:skip?1:0,offsets,p,k,positive,negative});
 }
 return {n1:[...n1],n2:[...n2],n3:[...n3],trainRunes:total,original:orig,eligible:eligible.map(x=>({R:x.R,count:x.windows.map(w=>w.length)})),controls};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(rank28Fixtures(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
