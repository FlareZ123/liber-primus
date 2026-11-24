'use strict';
/** Director #2484. Original GP29 independent stationary additive increment LP and native block-bootstrap sensitivity. Read-only Node CommonJS SFT; no third-party packages. */
const fs = require('node:fs');
const path = require('node:path');
const sources = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/liber-primus/lp2-ink-annotations.json",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
function study(files) {
 const [corpus,trans,ci,cii,ciii,blake,inkstr,lp1]=files;
 const c=JSON.parse(corpus),ink=JSON.parse(inkstr),rune=new Map(c.runes.map((x,i)=>[x,i])),tokens=c.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 const mod=x=>((x%29)+29)%29, sum=a=>a.reduce((s,v)=>s+v,0), zeros=()=>Array.from({length:4},()=>Array(29).fill(0));
 const raw=trans.split("%");raw.splice(50,0,"");const tape=[],offsets=[0],marks=new Set();let pending="";
 for(let p=0;p<58;p++){
  const seq=[];
  for(const ch of raw[p]){
   if(rune.has(ch)){const r=rune.get(ch);seq.push(r);tape.push({r,gap:pending,pg:p});pending="";}
   else if("-.$&§".includes(ch))pending+=ch;
  }
  if(JSON.stringify(seq)!==JSON.stringify(c.pages[p].indices))throw Error("Source page mismatch "+p);
  offsets.push(tape.length);
 }
 if(offsets[56]!==12956)throw Error("Unknown rune count");
 for(const p of ink.pages)if(p.page<56)for(const [i,n] of p.large_punctuation||[])if(n===13)marks.add(offsets[p.page]+i);
 function hist(t,from=0,to=t.length,markSet=new Set(),carry=false){
  const a=zeros();
  for(let i=carry?Math.max(1,from):from+1;i<to;i++){
   const d=mod(t[i].r-t[i-1].r),s=markSet.has(i)?3:/[.$&§]/.test(t[i].gap)?2:t[i].gap?1:0;
   a[s][d]++;
  }
  return a;
 }
 function gp(s){
  const t=[];let gap="";
  for(const m of s.toUpperCase().replaceAll("V","U").replaceAll("K","C").matchAll(/([A-Z]+)|([^A-Z]+)/g)){
   if(!m[1]){gap=/[.!?;:]/.test(m[0])?".":"-";continue;}
   let first=true;
   for(let i=0;i<m[1].length;){
    const v=tokens.find(([s])=>m[1].startsWith(s,i));
    if(v){t.push({r:v[1],gap:first?gap:""});first=false;i+=v[0].length;}else i++;
   }
  }
  return t;
 }
 const cleanLP=lp1.split(/^### /m).filter(s=>/^(1|3|5|6|9|10|11|12|13|14|15|16|56|57)\n/.test(s)).map(s=>s.split("\n").slice(1).filter(l=>!/^(#|\[|\(|\d)/.test(l)&&!/[0-9]/.test(l)).join("\n")).join("\n");
 const b=blake.slice(blake.indexOf("THE ARGUMENT"),blake.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK"));
 const donors=[["Crowley",gp([ci,cii,ciii].join("\n"))],["Blake",gp(b)],["LP editorial (no repeated continuations)",gp(cleanLP)],["p57 actual",tape.slice(offsets[57],offsets[58])]];
 const parts=[["train p0–39",0,40],["holdout p40–53",40,54],["terminal p54–55",54,56],["all p0–55",0,56]];
 const tests=parts.map(([name,lo,hi])=>{
  const h=hist(tape,offsets[lo],offsets[hi],marks),w=h.slice(0,2).map(sum),n=sum(w),z=h[0][0]+h[1][0];
  return {name,counts:h.map(a=>({n:sum(a),z:a[0]})),n,z,w};
 });
 if(tests[3].n!==12781||tests[3].z!==85||sum(tests[3].counts.map(x=>x.z))!==86)throw Error("Original transition count mismatch");
 // LP: minimize the weighted zero-coordinate prediction over q >= 0,
 // sum(q)=1. Its exact optimum is the smallest of 29 column coefficients.
 function estimate(h,w){
  const n=sum(w),den=h.slice(0,2).map(sum);
  return Array.from({length:29},(_,k)=>sum(w.map((v,s)=>v/n*h[s][mod(-k)]/den[s])));
 }
 // Conditional iid increments: the equality indicators are independent
 // Bernoulli variables, not necessarily identically distributed.
 // The Poisson-binomial Chernoff bound follows from concavity of log MGF.
 function tail(n,z,p){
  const v=z/n;
  return v>=p?1:Math.exp(-n*(v*Math.log(v/p)+(1-v)*Math.log((1-v)/(1-p))));
 }
 function makeRng(seed){let s=seed;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
 const rng=makeRng(2484);
 const qfun=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.min(a.length-1,Math.ceil(p*a.length)-1)];
 // Resample complete consecutive blocks, preserving within-block dependence.
 // Simultaneous absolute max-t style band (lower edge used) over 4 source strata weightings x 29 shifts.
 // This is an empirical sensitivity interval, not distribution-free coverage.
 function bootstrap(t,size,B=3000){
  const chunks=[];
  for(let i=0;i<t.length;i+=size)chunks.push(hist(t,i,Math.min(t.length,i+size),new Set(),true));
  const full=hist(t),w=tests.map(x=>x.w),point=w.flatMap(v=>estimate(full,v)),draws=[];
  for(let rep=0;rep<B;rep++){
   const a=zeros();
   for(let i=0;i<chunks.length;i++){
    const v=chunks[Math.floor(rng()*chunks.length)];
    for(let s=0;s<2;s++)for(let d=0;d<29;d++)a[s][d]+=v[s][d];
   }
   draws.push(w.flatMap(v=>estimate(a,v)));
  }
  const sd=point.map((v,j)=>Math.sqrt(sum(draws.map(a=>(a[j]-v)**2))/B));
  const max=draws.map(a=>Math.max(...point.map((v,j)=>sd[j]?Math.abs(v-a[j])/sd[j]:0)));
  const crit=qfun(max,.99),lows=point.map((v,j)=>Math.max(0,v-crit*sd[j]));
  return {size,chunks:chunks.length,crit,results:tests.map((x,j)=>{
   const l=lows.slice(j*29,(j+1)*29),min=Math.min(...l);
   return {name:x.name,min,expected:min*x.n,bound:tail(x.n,x.z,min)};
  })};
 }
 const fixed=donors.map(([name,t])=>({name,n:t.length,counts:hist(t).map(sum),results:tests.map(x=>{
  const a=estimate(hist(t),x.w),min=Math.min(...a);
  return {name:x.name,min,k:a.indexOf(min),expected:min*x.n,bound:tail(x.n,x.z,min)};
 })}));
 const boots=donors.slice(0,2).map(([name,t])=>({name,results:[128,256,512,1024].map(size=>bootstrap(t,size))}));
 // Real solved p56 encryption: ordinary prime offsets with F bypass and no clock advance.
 const primes=[];
 for(let n=2;primes.length<12956;n++){
  let ok=true;for(let j=2;j*j<=n;j++)if(n%j===0){ok=false;break;}
  if(ok)primes.push((n-1)%29);
 }
 const known=gp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE").map(x=>x.r);
 let used=0;
 const solved=known.map(x=>x===0?0:mod(x+primes[used++]));
 if(known.length!==85||solved.join(",")!==c.pages[56].indices.join(","))throw Error("Authentic p56 prime/F replay failed");
 // Known periodic key and prime schedule, iid additive increments, and
 // an adaptive reversible delta mapping. The latter is an illustrative rival,
 // not a proposed authored cipher. X is fixed to difference 0; remaining
 // plaintext symbols map to random distinct nonzero deltas.
 const period=gp("DIVINITY").map(x=>x.r);
 const summarize=(label,t)=>{
  const h=hist(t),a=h[0].map((v,i)=>v+h[1][i]),n=sum(a),off=(n-a[0])/28;
  return {label,n,eq:a[0],rate:a[0]/n,nonzeroChiSquare:sum(a.slice(1).map(v=>(v-off)**2/off))};
 };
 const controls=[];
 for(const [name,full] of donors.slice(0,2)){
  const t=full.slice(0,12956),plain=t.map(x=>x.r),rr=makeRng(3301);
  const map=(a)=>t.map((x,i)=>({...x,r:a[i]}));
  controls.push({donor:name,...summarize("plain",t)});
  for(const [label,fn] of [
   ["DIVINITY periodic",i=>period[i%period.length]],
   ["prime-minus-one continuous",i=>primes[i]],
   ["iid uniform increments",(()=>{let k=0;return i=>{if(i)k=mod(k+Math.floor(rr()*29));return k;};})()],
   ["constant increment 11 (extremal)",i=>mod(11*i)]
  ]){
   const key=plain.map((_,i)=>fn(i)),cipher=plain.map((x,i)=>mod(x+key[i]));
   if(cipher.map((x,i)=>mod(x-key[i])).join(",")!==plain.join(","))throw Error("additive round trip "+label);
   controls.push({donor:name,...summarize(label,map(cipher))});
  }
  const adaptiveRng=makeRng(1033),rare=c.translit.indexOf("X");
  function perm(rng){
   const rest=Array.from({length:28},(_,i)=>i+1);
   for(let i=rest.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
   const p=[];let j=0;for(let i=0;i<29;i++)p[i]=i===rare?0:rest[j++];
   return p;
  }
  const cipher=[plain[0]];
  for(let i=1;i<plain.length;i++)cipher.push(mod(cipher[i-1]+perm(adaptiveRng)[plain[i]]));
  const invRng=makeRng(1033),back=[cipher[0]];
  for(let i=1;i<cipher.length;i++)back.push(perm(invRng).indexOf(mod(cipher[i]-cipher[i-1])));
  if(back.join(",")!==plain.join(","))throw Error("Adaptive inverse failed");
  controls.push({donor:name,...summarize("adaptive permuted delta (X→0)",map(cipher))});
 }
 return {tests,fixed,boots,marks:marks.size,authenticP56:"85/85 exact",controls,original:summarize("original p0–55 (without explicit mark exclusion)",tape.slice(0,offsets[56]))};
}
const files = sources.map(p => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8'));
console.log(JSON.stringify(study(files), null, 2));
