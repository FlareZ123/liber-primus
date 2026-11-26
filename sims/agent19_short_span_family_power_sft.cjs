"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const archived=JSON.parse(raw[3]);
 const extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const native=gold.sections.map(s=>({name:s.name,t:extract(s.source_text),lines:s.source_text.split("\n").map(extract)}));
 const headings={"0_warning":[0],"0_welcome":[0,8,13],"0_wisdom":[0,4],"0_koan_1":[0,20],"0_loss_of_divinity":[0,2,7,12,18,22],"jpg107-167":[0],"jpg229":[0,5],"p56_an_end":[0],"p57_parable":[0]};
 const exclude=new Set(["0_koan_1","0_loss_of_divinity"]);
 const M=n=>29n**BigInt(n),A=M(13),B=M(14);
 const integer=a=>a.reduceRight((n,x)=>n*29n+BigInt(x),0n);
 const id=a=>String.fromCharCode(...a.map(x=>65+x));
 const num=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const original=gp.pages[0].indices;
 if(original.length!==262)throw Error("scope");
 // Exactly reuse the archived lattice enumerator, not a surrogate search.
 const begin=raw[2].indexOf(" function lattice("),end=raw[2].indexOf(" let toys=",begin);
 if(begin<0||end<0)throw Error("frozen lattice source missing");
 const lattice=new Function(raw[2].slice(begin,end)+"; return lattice;")();
 function model(train){
  const u=new Float64Array(29),b=new Float64Array(841),tr=new Float64Array(24389);let total=0;
  for(const s of train){let t=s.t;for(let i=0;i<t.length;i++){u[t[i]]++;total++;if(i)b[t[i-1]*29+t[i]]++;if(i>1)tr[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
  const lm=new Float64Array(24389);for(let a=0;a<29;a++)for(let q=0;q<29;q++)for(let c=0;c<29;c++){const p0=(u[c]+.5)/(total+14.5),p1=(b[q*29+c]+8*p0)/(u[q]+8),p2=(tr[(a*29+q)*29+c]+8*p1)/(b[a*29+q]+8);lm[(a*29+q)*29+c]=Math.log(p2);}
  return lm;
 }
 const score=(t,lm)=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 function windows(t,n){return Array.from({length:Math.max(0,t.length-n+1)},(_,i)=>t.slice(i,i+n));}
 const lengths=[6,8,10,12],folds=[];
 for(const test of native){
  // Entire held-out source absent from fitted score. Anchor subset is exactly
  // the frozen original bank's native components, also removing held-out source.
  const train=native.filter(s=>s.name!==test.name),lm=model(train);
  const anchors=[...new Set(train.filter(s=>!exclude.has(s.name)).flatMap(s=>windows(s.t,14).map(id)))].map(s=>({id:s,t:num(s),value:integer(num(s))}));
  const titles=headings[test.name].map(i=>test.lines[i]);
  const bodies=[];
  for(let j=0;j<headings[test.name].length;j++){
   const h=headings[test.name][j],end=headings[test.name][j+1]??test.lines.length;
   // Explicitly exclude mixed numeric diagrams and don't concatenate across p56 hash.
   if((test.name==="0_wisdom"&&h===4)||(test.name==="jpg229"&&h===5))continue;
   if(test.name==="p56_an_end")bodies.push(test.lines[1],test.lines[3]);
   else bodies.push(test.lines.slice(h+1,end).flat());
  }
  folds.push({name:test.name,lm,anchorCount:anchors.length,titleRunes:titles.map(x=>x.length),bodyRunes:bodies.map(x=>x.length),rows:lengths.map(n=>{
   const top=anchors.map(x=>({value:x.value,anchor:x.id,s:Math.max(...windows(x.t,n).map(t=>score(t,lm)))})).sort((a,b)=>b.s-a.s||a.anchor.localeCompare(b.anchor)).slice(0,4);
   const titleScores=titles.flatMap(t=>windows(t,n).map(x=>score(x,lm)));
   const bodyScores=bodies.flatMap(t=>windows(t,n).map(x=>score(x,lm)));
   return {n,top,titleScores,bodyScores,lowMax:[],single:[]};
  })});
 }
 let state=0x29712970;function r(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;}
 const repeats=a=>a.slice(1).reduce((n,x,i)=>n+Number(x===a[i]),0);
 const target=repeats(original);
 const inventory=original.slice().sort((a,b)=>a-b).join(",");
 function sample(){
  const a=original.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  let n=repeats(a);
  for(let k=0;k<100000&&n!==target;k++){
   const i=Math.floor(r()*a.length),j=Math.floor(r()*a.length);if(i===j||a[i]===a[j])continue;
   [a[i],a[j]]=[a[j],a[i]];const m=repeats(a);if(Math.abs(m-target)<=Math.abs(n-target))n=m;else [a[i],a[j]]=[a[j],a[i]];
  }
  if(n!==target)throw Error("repair");
  for(let k=0;k<8192;k++){
   const i=Math.floor(r()*a.length),j=Math.floor(r()*a.length);if(i===j||a[i]===a[j])continue;
   [a[i],a[j]]=[a[j],a[i]];if(repeats(a)!==target)[a[i],a[j]]=[a[j],a[i]];
  }
  if(repeats(a)!==target||a.slice().sort((a,b)=>a-b).join(",")!==inventory)throw Error("match");
  return a;
 }
 const count=512, probes=[];
 for(let i=0;i<count;i++){
  const C=sample(),ci=integer(C), cache=new Map(), hits=new Map();
  let tests=0;
  function has(p){
   const k=String(p);if(hits.has(k))return hits.get(k);
   for(let d=13;d+14<=C.length;d++){
    let st=cache.get(d);
    if(!st){const D=M(d),R=A,T=D/R,cp=ci%(D*B),u=cp/T;st={cp,div:D/A,enumerate:lattice(u,R,B,A)};cache.set(d,st);}
    tests++;
    for(const a of st.enumerate((p-2n)*A,(p+1n)*A-1n)){
     if(a%29n===0n)continue;
     const prod=a*st.cp,L=prod%A,H=prod/A;
     for(let s=0;s<=1;s++){
      if(s===1&&L===0n)continue;
      if((H+BigInt(s))/st.div%B===p){hits.set(k,true);return true;}
     }
    }
   }
   hits.set(k,false);return false;
  }
  for(const f of folds)for(const row of f.rows){
   let best=null;for(const x of row.top)if(has(x.value)){best=x.s;break;}
   row.lowMax.push(best);const start=Math.floor(r()*(C.length-row.n+1));row.single.push(score(C.slice(start,start+row.n),f.lm));
  }
  probes.push({tests,distinctAnchors:hits.size});
 }
 const quantile=(xs,p)=>xs.slice().sort((a,b)=>(a??-Infinity)-(b??-Infinity))[Math.ceil(p*xs.length)-1];
 function wilson(k,n){if(!n)return null;const z=1.96,p=k/n,D=1+z*z/n,c=(p+z*z/(2*n))/D,w=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/D;return [c-w,c+w];}
 const summary=folds.map(f=>({name:f.name,anchorCount:f.anchorCount,titleRunes:f.titleRunes,bodyRunes:f.bodyRunes,rows:f.rows.map(x=>{
  const q=quantile(x.lowMax,.99),single=quantile(x.single,.99);
  if(q===null)throw Error("no calibration power");
  const atBound=x.lowMax.filter(v=>v!==null&&v>=q).length;
  const positives=a=>({n:a.length,passSingle:a.filter(v=>v>single).length,passFamilyUpper:a.filter(v=>v>q).length,max:a.length?Math.max(...a):null});
  return {n:x.n,anchorBounds:x.top.map(y=>({anchor:y.anchor,score:y.s})),familyMaxLowerQ99:q,singleQ99:single,nullAtOrAboveBound:atBound,nullAtOrAboveWilson95:wilson(atBound,count),title:positives(x.titleScores),body:positives(x.bodyScores),lowerMaxScores:x.lowMax,singleScores:x.single};
 })}));
 const aggregate=lengths.map(n=>{
  const rows=summary.map(f=>f.rows.find(x=>x.n===n));
  const out={n};
  for(const key of ["title","body"]){
   const a=rows.map(x=>x[key]).filter(x=>x.n>0);const sum=k=>a.reduce((s,x)=>s+x[k],0);const N=sum("n"),hits=sum("passFamilyUpper"),single=sum("passSingle");
   out[key]={windows:N,sections:a.length,singleHits:single,singleTPR:single/N,familyUpperHits:hits,familyTPRUpper:hits/N,sectionsWithAnyHit:a.filter(x=>x.passFamilyUpper>0).length,sectionRateRange:[Math.min(...a.map(x=>x.passFamilyUpper/x.n)),Math.max(...a.map(x=>x.passFamilyUpper/x.n))]};
  }
  return out;
 });
 const width=BigInt(archived.original.bRange[1])-BigInt(archived.original.bRange[0])+1n;
 return {scope:{sections:native.length,titles:folds.reduce((n,f)=>n+f.titleRunes.length,0),p56:85,p57:95,originalTitleUnconstrainedPrefix:12,archivedBestOffsetWidth:String(width),A:String(A),ratio:Number(width)/Number(A),familyFitDigits:249,frozenOriginalBank:archived.fragments,archivedOriginalStates:archived.original.candidates},count,target,probeRange:[Math.min(...probes.map(x=>x.tests)),Math.max(...probes.map(x=>x.tests))],aggregate,folds:summary};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","sims/lp2_p0_short_affine_offset_spacingfree_sft.cjs","im-results/lp2-p0-short-affine-offset-spacingfree-output.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
