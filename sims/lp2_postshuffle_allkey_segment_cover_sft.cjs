"use strict";
// Exact all-key relaxed segment-coverage bound. No candidate key search.
const fs=require("node:fs");
const path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
// Exact unrestricted-context max-plus bound on joint cyclic substring support.
// The open walk relaxes cyclic closure and distinct group/tuple counting.
function jointPathBound(cells,ms,q,budget,K=null,A=29,maxSteps=96){
 const maxNodes=1+ms.reduce((s,m)=>s+cells[m].counts.size*m,0);
 const next=new Int32Array(maxNodes*A),failure=new Int32Array(maxNodes),out=new Int32Array(maxNodes),queue=new Int32Array(maxNodes);
 let n=1;
 for(const m of ms)for(const [e,w] of cells[m].counts){
   let x=e,k=0,d=A**(m-1);
   for(let j=0;j<m;j++,d/=A){const r=Math.floor(x/d);x-=r*d;const i=k*A+r;if(!next[i])next[i]=n++;k=next[i];}
   out[k]+=w;
 }
 let h=0,t=0;for(let r=0;r<A;r++)if(next[r])queue[t++]=next[r];
 while(h<t){const u=queue[h++],f=failure[u];out[u]+=out[f];for(let r=0;r<A;r++){const i=u*A+r,v=next[i];if(v){failure[v]=next[f*A+r];queue[t++]=v;}else next[i]=next[f*A+r];}}
 const required=ms.reduce((s,m)=>s+Math.max(0,cells[m].n-budget),0);
 // A cyclic key is a q-transition walk initialized in its periodic
 // predecessor context. Permit every initial and final state, even
 // nonclosing walks, to obtain a valid upper bound.
 let a=new Int32Array(n),b=new Int32Array(n),maxByLength=[0],firstPass=required===0?0:null;
 for(let j=1;j<=Math.max(q,maxSteps);j++){
   let global=0;
   for(let u=0;u<n;u++){
     const base=u*A;let best=0;
     for(let r=0;r<A;r++){const v=next[base+r],z=out[v]+a[v];if(z>best)best=z;}
     b[u]=best;if(best>global)global=best;
   }
   [a,b]=[b,a];maxByLength.push(global);
   if(firstPass===null&&global>=required)firstPass=j;
   if(j>=q&&firstPass!==null)break;
 }
 let trueCyclicSupport=null;
 if(K){
   trueCyclicSupport=0;for(const m of ms)for(let i=0;i<K.length;i++){
     let x=0;for(let j=0;j<m;j++)x=x*A+K[(i+j)%K.length];
     trueCyclicSupport+=cells[m].counts.get(x)||0;
   }
   if(trueCyclicSupport>maxByLength[q])throw Error("true cycle exceeded max-plus upper bound");
 }
 return {m:ms,nodes:n,q,groupCounts:ms.map(m=>cells[m].n),required,upper:maxByLength[q],firstPass,maxByLength,trueCyclicSupport,pass:maxByLength[q]>=required};
}
function jointToyChecks(){
 let count=0;for(let seed=1;seed<=16;seed++){
   const cells=[null,null,{n:0,counts:new Map()},{n:0,counts:new Map()}];
   for(const m of [2,3])for(let x=0;x<2**m;x++){const w=(seed*13+x*17+m*7+(seed^x)*3)%5;if(w)cells[m].counts.set(x,w);}
   for(const q of [1,2,3,4]){
     let expected=0;
     for(let x=0;x<2**(q+2);x++){
       const word=Array.from({length:q+2},(_,i)=>(x>>(q+1-i))&1);let score=0;
       for(let end=2;end<word.length;end++)for(const m of [2,3]){
         const v=word.slice(end-m+1,end+1).reduce((a,r)=>a*2+r,0);score+=cells[m].counts.get(v)||0;
       }
       expected=Math.max(expected,score);
     }
     const got=jointPathBound(cells,[2,3],q,0,null,2,q).upper;
     if(got!==expected)throw Error("toy max-plus mismatch "+JSON.stringify({seed,q,got,expected}));
     count++;
   }
 }
 return count;
}

function experiment(raw, broad = false, q29 = false) {
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29, id=w=>w.join(",");
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(const w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){const p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown token "+w);p.push(v.i);j+=v.t.length}out.push(p)}return out}
 const donors=raw.slice(3,6).map(native), training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections) if(!["0_welcome","jpg107-167"].includes(s.name))training.push(runeWords(s.source_text,/[^\u16a0-\u16ff]/u));
 const vocab=new Map();for(const w of training.flat())if(w.length<=24)vocab.set(id(w),w);
 if(vocab.size!==10842)throw Error("vocabulary changed");
 const baseVocab=new Set(vocab.keys());
 if(broad){
   function spell(word,alt){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown dictionary token "+w);p.push(v.i);j+=v.t.length;}return p;}
   for(const line of raw[6].split(/\r?\n/)){const match=/^([a-z]+) (\d+)$/.exec(line);if(match)for(const alt of [false,true]){const p=spell(match[1],alt);if(p.length&&p.length<=24)vocab.set(id(p),p);}}
   for(let i=0;i<29;i++)vocab.set(id([i]),[i]);
 }

 const byLength=new Map();for(const w of vocab.values()){if(!byLength.has(w.length))byLength.set(w.length,[]);byLength.get(w.length).push(w)}
 // Choose the earliest longest contiguous nonzero span; cap at 8.
 function span(c){let best=0,start=0,a=0;for(let i=0;i<c.length;i++){if(c[i]===0)a=i+1;else if(i-a+1>best){best=i-a+1;start=a}}return {start,len:Math.min(best,8)}}
 function code(c,p,start,m){let x=0;for(let j=start;j<start+m;j++)x=x*29+mod(c[j]-p[j]);return x}
 function options(c,start,m){const s=new Set();for(const p of byLength.get(c.length)||[]){if(p.some((v,i)=>v===0&&c[i]!==0))continue;s.add(code(c,p,start,m))}return s}

 function canonical(K){return K.map((_,i)=>K.slice(i).concat(K.slice(0,i)).join(",")).sort()[0]}
 function overlapGraph(cell,groups){
   const base=29**4, overlap=29**3, edgeList=[...cell.counts].filter(([,n])=>n>=2).map(([e])=>e), byPrefix=new Map();
   for(const e of edgeList){const a=Math.floor(e/29);if(!byPrefix.has(a))byPrefix.set(a,[]);byPrefix.get(a).push(e);}
   let nodes=0,maxPath=0,paths12=0,closedPaths=0;const keys=new Set();
   function visit(path,used){
     nodes++;maxPath=Math.max(maxPath,path.length);
     if(path.length===12){
       paths12++;
       const a=path[path.length-1]%base,b=Math.floor(path[0]/29);
       if(a%overlap!==Math.floor(b/29))return;
       const close=a*29+(b%29),K=path.concat(close).map(e=>Math.floor(e/base));
       if(path.concat(close).some((e,i)=>Array.from({length:5},(_,j)=>K[(i+j)%13]).reduce((n,v)=>29*n+v,0)!==e))throw Error("invalid cycle reconstruction");
       closedPaths++;keys.add(canonical(K));return;
     }
     for(const e of byPrefix.get(path[path.length-1]%base)||[]){if(used.has(e))continue;used.add(e);path.push(e);visit(path,used);path.pop();used.delete(e);}
   }
   for(const e of edgeList)visit([e],new Set([e]));
   function covers(c,K){for(const p of byLength.get(c.length)||[])for(let s=0;s<K.length;s++){let phase=s,ok=true;for(let i=0;i<c.length;i++){const v=p[i];if((v?mod(v+K[phase]):0)!==c[i]){ok=false;break}if(v)phase=(phase+1)%K.length;}if(ok)return true;}return false;}
   const candidates=[...keys].map(k=>({K:k.split(",").map(Number),covered:groups.filter(c=>covers(c,k.split(",").map(Number))).length}));
   return {groups:groups.length,n:cell.n,maxSupport:[...cell.counts.values()].reduce((a,b)=>Math.max(a,b),0),doubleEdges:edgeList.length,nodes,maxPath,paths12,closedPaths,candidates};
 }

 function bound(groups,periods,truth,K,graph=false,joint=false){const strata=Array.from({length:9},()=>({n:0,counts:new Map()})),all=Array.from({length:9},()=>({n:0,counts:new Map()}));let checks=0;
 const segments=K?Array.from({length:9},(_,m)=>new Set(K.map((_,s)=>Array.from({length:m},(_,j)=>K[(s+j)%K.length]).reduce((a,b)=>29*a+b,0)))):null;
 for(let i=0;i<groups.length;i++){const c=groups[i],{start,len}=span(c);if(len<2)continue;for(let m=2;m<=len;m++){const opts=options(c,start,m);for(const cell of [all[m],...(m===len?[strata[m]]:[])]){cell.n++;for(const k of opts)cell.counts.set(k,(cell.counts.get(k)||0)+1)}if(truth&&vocab.has(id(truth[i]))){const k=code(c,truth[i],start,m);if(!opts.has(k)||!segments[m].has(k))throw Error("true segment missing");checks++}}}
 const sorted=cell=>{const s=[...cell.counts.values()].sort((a,b)=>b-a);const prefix=[0];for(const v of s)prefix.push(prefix[prefix.length-1]+v);return {n:cell.n,prefix}};
 const S=strata.slice(2).map(sorted),A=all.slice(2).map(sorted),uncovered=(x,q)=>Math.max(0,x.n-x.prefix[Math.min(q,x.prefix.length-1)]);
 const minMissing=q=>Math.max(S.reduce((a,x)=>a+uncovered(x,q),0),...A.map(x=>uncovered(x,q)));
 const maxQ=Math.max(...S.concat(A).map(x=>x.prefix.length-1));
 const budget=Math.floor(groups.length*.05);let requiredPeriod=null;
 if(minMissing(maxQ)<=budget){let lo=0,hi=maxQ;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(minMissing(mid)<=budget)hi=mid;else lo=mid+1}requiredPeriod=lo;}
 if(K&&requiredPeriod!==null&&requiredPeriod>K.length)throw Error("period lower bound rejects true key");
 const graphResult=graph?overlapGraph(all[5],groups):null;
 const jointResult=joint&&requiredPeriod!==null&&requiredPeriod<=29?jointPathBound(all,[5,8],29,budget,K):null;
 if(K&&jointResult&&jointResult.trueCyclicSupport<jointResult.required)throw Error("true cycle fails joint coverage");
 return periods.map(q=>{const summarize=cell=>{const top=[...cell.counts.values()].sort((a,b)=>b-a).slice(0,q),upper=Math.min(cell.n,top.reduce((a,b)=>a+b,0));return {n:cell.n,top,upper,miss:cell.n-upper,distinct:cell.counts.size}};
 const strat=strata.slice(2).map((x,i)=>({m:i+2,...summarize(x)})),threshold=all.slice(2).map((x,i)=>({m:i+2,...summarize(x)}));
 return {groups:groups.length,q,checks,strat,threshold,miss:Math.max(strat.reduce((a,b)=>a+b.miss,0),...threshold.map(x=>x.miss)),budget,requiredPeriod,graph:graphResult,...(q29?{joint:jointResult}:{}),periodBoundary:requiredPeriod===null?null:[requiredPeriod?minMissing(requiredPeriod-1):null,minMissing(requiredPeriod)]}});
 }
 function encrypt(words,K){let phase=0;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+K[phase]);phase=(phase+1)%K.length;return c}))}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffle(a,R){for(let j=a.length-1;j>0;j--){const i=R()%(j+1);[a[j],a[i]]=[a[i],a[j]]}return a}
 const controls=[];
 for(const [d,donor] of (q29?[]:donors.entries())){const first=Math.floor(donor.length*.8),n=669;let start=first;while(start+n<=donor.length&&donor.slice(start,start+n).filter(w=>!baseVocab.has(id(w))).length>Math.floor(n*.05))start++;if(start+n>donor.length)throw Error("no control");const p=donor.slice(start,start+n),oov=p.filter(w=>!vocab.has(id(w))).length;for(const q of [8,13]){const R=rng(0x33012684+d*31+q),K=Array.from({length:q},()=>R()%29),c=encrypt(p,K),order=shuffle(p.map((_,i)=>i),R);const result=bound(order.map(i=>c[i]),[q],order.map(i=>p[i]),K)[0];if(result.miss>oov)throw Error("false rejection on native plant");controls.push({d,start,oov,K,holdF:p.flat().filter(x=>x===0).length,consumingZero:c.flat().filter(x=>x===0).length-p.flat().filter(x=>x===0).length,...result})}}
 if(q29){
   for(const [d,donor] of donors.entries())for(const n of [66,158]){
     const first=Math.floor(donor.length*.8);let start=first;
     while(start+n<=donor.length&&donor.slice(start,start+n).filter(w=>!baseVocab.has(id(w))).length>Math.floor(n*.05))start++;
     if(start+n>donor.length)throw Error("no q29 control");
     const p=donor.slice(start,start+n),oov=p.filter(w=>!vocab.has(id(w))).length,R=rng(0x33012900+d*31+n),K=Array.from({length:29},()=>R()%29),c=encrypt(p,K),order=shuffle(p.map((_,i)=>i),R);
     const result=bound(order.map(i=>c[i]),[29],order.map(i=>p[i]),K,false,true)[0];
     if(!result.joint||!result.joint.pass||result.miss>oov)throw Error("q29 control rejected");
     controls.push({d,start,n,oov,K,holdF:p.flat().filter(x=>x===0).length,consumingZero:c.flat().filter(x=>x===0).length-p.flat().filter(x=>x===0).length,...result});
   }
 }
 // Independent phase-saturated native lexical positive: two distinct,
 // held-out non-F five-rune words for every planted q13 phase.
 // This is constructed graph calibration, not natural prose.
 let graphControl=null;
 if(broad&&!q29){
   const R=rng(0x33012713),K=Array.from({length:13},()=>R()%29),pool=donors[0].slice(Math.floor(donors[0].length*.8)).filter(p=>p.length===5&&p.every(v=>v!==0)&&vocab.has(id(p))),C=[],P=[],seen=new Set();
   for(let phase=0;phase<13;phase++){let n=0;for(const p of pool){const c=p.map((v,j)=>mod(v+K[(phase+j)%13]));if(c.includes(0)||seen.has(id(c)))continue;C.push(c);P.push(p);seen.add(id(c));if(++n===2)break;}if(n!==2)throw Error("insufficient graph calibration words");}
   const G=bound(C,[13],P,K,true)[0].graph,correct=G.candidates.find(x=>canonical(x.K)===canonical(K));
   if(!correct||correct.covered!==26)throw Error("graph failed planted key: "+JSON.stringify({K,G}));
   graphControl={K,correct,graph:G};
 }
 // All original chapters, with carries retained.
 const source=runeWords(raw[1],/[-.&]/u), flat=source.flat();if(flat.slice(0,12956).join()!=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 function chapter(a,b){const lo=gp.pages.filter(p=>p.page<a).reduce((s,p)=>s+p.indices.length,0),hi=lo+gp.pages.filter(p=>p.page>=a&&p.page<=b).reduce((s,p)=>s+p.indices.length,0);let k=0;const out=[];for(const w of source){if(k>=lo&&k+w.length<=hi)out.push(w);else if(k<hi&&k+w.length>lo)throw Error("clipped chapter "+a+"-"+b);k+=w.length}return out}
 const originals=[];for(const [a,b,n] of [[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]]){const g=chapter(a,b);if(g.length!==n)throw Error("chapter groups "+a+": "+g.length);for(const result of bound(g,q29?[29]:[8,13],null,null,broad&&!q29&&a===54,q29))originals.push({a,b,...result})}
 return {broad,vocab:vocab.size,controls,graphControl,originals,...(q29?{q29:true,toyChecks:jointToyChecks()}: {})};
}
const q29=process.argv.includes("--q29"), broad=process.argv.includes("--broad")||q29;
const paths=broad?INPUTS.concat("resources/control/english_wordfreq_textblob.txt"):INPUTS;
const result=experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),broad,q29);
console.log(JSON.stringify(result,null,2));
