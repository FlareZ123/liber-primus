'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const pins=[
["FlareZ123/liber-primus","resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],
["FlareZ123/liber-primus","resources/external/relikd-solved-gp29-native-v1.json","1b064ef6d85819b7d96adaff31a82d1ec551598f"],
["neuroretransmit/cicada","2013/001-232.jpg/book-of-the-law-I.txt","64876892683fab1467481fe87d85743a8ea17982"],
["neuroretransmit/cicada","2013/001-232.jpg/book-of-the-law-II.txt","cb4353b080d7584441f85502aeccb60796e6fe0f"],
["neuroretransmit/cicada","2013/001-232.jpg/book-of-the-law-III.txt","36e716252a271d31f5c4ba25b3cb78199ccc1114"],
["FlareZ123/liber-primus","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","12a6bc018047a1276e77f2b7f633d5905732fff9"]];
const mod=x=>(x%29+29)%29,assert=(b,m)=>{if(!b)throw Error(m)};
function experiment(raw){
 const gp=JSON.parse(raw[0]),ref=JSON.parse(raw[1]),W=32,A=29;
 const toks=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const p=[];for(const w0 of t.toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:toks.find(x=>w.startsWith(x.t,j));assert(v,"unknown "+w);p.push(v.i);j+=v.t.length}}return p}
 const refs=ref.sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 raw.slice(2).forEach((t,i)=>refs.push({name:["Law-I","Law-II","Law-III","Self-Reliance"][i],p:native(t)}));
 const frames=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,iv:p.indices[0],c:p.indices.slice(1)}));
 assert(frames.length===55&&frames.reduce((s,f)=>s+f.c.length,0)===12901,"source frame geometry");
 function pageScan(frames,refs,min=32){
  let alignments=0,maskRejected=0,funcRejected=0,permRejected=0,maxFunction=0,maxPermutation=0;
  const counts={func32:0,func64:0,func128:0,funcFull:0,perm32:0,perm64:0,perm128:0,permFull:0};
  const byFrame=[],hits=[],K=new Int8Array(A),R=new Int8Array(A);
  for(const f of frames){let fm=0,pm=0,fn=0,pn=0;const d=f.c.map((c,i)=>mod(c-(i?f.c[i-1]:f.iv)));
   for(const s of refs)for(let start=0;start+min<=s.p.length;start++){
    alignments++;K.fill(-1);R.fill(-1);let q=0,i=0,firstPermFail=-1;const n=Math.min(f.c.length,s.p.length-start);
    for(;i<n;i++){const p=s.p[start+i];if(p===0){if(f.c[i]!==0){maskRejected++;break}continue}
     const k=mod(p-d[i]);if(K[q]!==-1&&K[q]!==k){funcRejected++;break}
     if(K[q]===-1){if(R[k]!==-1&&R[k]!==q&&firstPermFail===-1){firstPermFail=i;permRejected++}K[q]=k;R[k]=q}q=p}
    const j=firstPermFail<0?i:firstPermFail;fm=Math.max(fm,i);pm=Math.max(pm,j);maxFunction=Math.max(maxFunction,i);maxPermutation=Math.max(maxPermutation,j);
    for(const z of [32,64,128]){if(i>=z)counts["func"+z]++;if(j>=z)counts["perm"+z]++}
    if(i===f.c.length){counts.funcFull++;fn++}if(j===f.c.length){counts.permFull++;pn++}
    if(i>=min)hits.push({page:f.page,donor:s.name,start,functionPrefix:i,permutationPrefix:j});
   }byFrame.push({page:f.page,length:f.c.length,maxFunction:fm,maxPermutation:pm,fullFunction:fn,fullPermutation:pn});
  }return {alignments,maskRejected,funcRejected,permRejected,maxFunction,maxPermutation,counts,byFrame,hits};
 }
 function interiorScan(frames,refs){
  const C=[],D=[],page=[],local=[],end=[];
  for(const f of frames){const e=C.length+f.c.length;for(let i=0;i<f.c.length;i++){C.push(f.c[i]);D.push(mod(f.c[i]-(i?f.c[i-1]:f.iv)));page.push(f.page);local.push(i);end.push(e)}}
  const idx=Array.from({length:W},()=>Array.from({length:A},()=>[]));
  for(let i=0;i<D.length;i++)for(let l=1;l<W&&i+l<end[i];l++)idx[l][mod(D[i+l]-D[i])].push(i);
  const starts=[];for(let i=0;i<D.length;i++)if(i+W<=end[i])starts.push(i);
  let windows=0,candidateChecks=0,fullFunction=0,fullPermutation=0,noConstraint=0,afterMask=0,afterPair=0;
  const hits=[],K=new Int8Array(A),R=new Int8Array(A),first=new Int8Array(A);
  for(const s of refs)for(let j=0;j+W<=s.p.length;j++){
   windows++;let q=-1;const eq=[],holds=[];first.fill(-1);
   for(let i=0;i<W;i++){const p=s.p[j+i];if(!p){holds.push(i);continue}if(q>=0){if(first[q]>=0){const a=first[q];eq.push([a,i-a,mod(p-s.p[j+a])])}else first[q]=i}q=p}
   let best=null,min=Infinity;for(const e of eq){const n=idx[e[1]][e[2]].length;if(n<min){min=n;best=e}}
   let list;if(best)list=idx[best[1]][best[2]];else{noConstraint++;list=starts}
   for(const u of list){const o=best?u-best[0]:u;if(o<0||o+W>end[o]||page[o]!==page[u])continue;candidateChecks++;
    let ok=true;for(const i of holds)if(C[o+i]){ok=false;break}if(!ok)continue;afterMask++;
    for(const [a,l,v] of eq)if(mod(D[o+a+l]-D[o+a])!==v){ok=false;break}if(!ok)continue;afterPair++;
    K.fill(-1);R.fill(-1);q=local[o]===0?0:-1;let perm=true;
    for(let i=0;i<W;i++){const p=s.p[j+i];if(!p)continue;if(q>=0){const k=mod(p-D[o+i]);if(K[q]>=0&&K[q]!==k){ok=false;break}if(R[k]>=0&&R[k]!==q)perm=false;K[q]=k;R[k]=q}q=p}
    if(ok){fullFunction++;if(perm)fullPermutation++;hits.push({page:page[o],transitionOffset:local[o],donor:s.name,donorOffset:j,permutation:perm,learned:Array.from(K).filter(x=>x>=0).length})}
   }
  }return {windows,originalWindows:starts.length,conceptualAlignments:windows*starts.length,candidateChecks,noConstraint,afterMask,afterPair,fullFunction,fullPermutation,hits};
 }
 function encode(P,K,iv){let q=0,c=iv;return P.map(p=>{c=p?mod(c+p-K[q]):0;if(p)q=p;return c})}
 function fitPrefix(f,P,n){const K=new Int8Array(A).fill(-1),R=new Int8Array(A).fill(-1);let q=0,prev=f.iv;
  for(let i=0;i<n;i++){const p=P[i],c=f.c[i];if(p===0){assert(c===0,"hold");prev=c;continue}
   const k=mod(prev+p-c);assert(K[q]===-1||K[q]===k,"key conflict");assert(R[k]===-1||R[k]===q,"perm conflict");K[q]=k;R[k]=q;q=p;prev=c}
  let known=0,correct=0,unknown=0;
  for(let i=n;i<P.length;i++){const p=P[i],c=f.c[i];if(p===0||K[q]>=0){known++;if((p===0?0:mod(prev+p-K[q]))===c)correct++}else unknown++;if(p)q=p;prev=c}
  return {learned:Array.from(K).filter(x=>x>=0).length,known,correct,unknown};
 }
 let state=0x3f3301;function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
 function perm(){const a=Array.from({length:A},(_,i)=>i);for(let i=28;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const plants=[];
 for(const [name,page,start] of [["0_welcome",0,73],["Law-II",16,1234],["Self-Reliance",40,3456]]){
  const s=refs.find(r=>r.name===name),f0=frames.find(f=>f.page===page),K=perm(),P=s.p.slice(start,start+f0.c.length);assert(P.length===f0.c.length,"plant length");
  const f={page,iv:f0.iv,c:encode(P,K,f0.iv)},fit=pageScan([{...f,c:f.c.slice(0,128)}],refs);
  assert(fit.hits.some(x=>x.donor===name&&x.start===start&&x.permutationPrefix===128),"missed plant");
  const hold=fitPrefix(f,P,128);assert(hold.known===hold.correct,"heldout prediction");
  plants.push({name,page,start,truth:K,fitMatches:fit.counts.permFull,fitFunctionMatches:fit.counts.funcFull,heldout:hold});
 }
 const s=refs.find(x=>x.name==="0_welcome"),K=Array.from({length:A},(_,i)=>(7*i+3)%29),P=s.p.slice(73,273),C=encode(P,K,15);
 const interiorPlant=interiorScan([{page:0,iv:15,c:C}],[s]);
 const actual=interiorPlant.hits.filter(h=>h.donorOffset===73+h.transitionOffset&&h.permutation).length;
 assert(actual===P.length-W+1,"lost planted alignment");
 return {sources:refs.map(s=>({name:s.name,length:s.p.length})),plants,pageStart:pageScan(frames,refs),interior:interiorScan(frames,refs),interiorPlant:{...interiorPlant,actual,expected:P.length-W+1}};
}
async function main(){const raw=[];for(const [repo,p,sha] of pins){let data;if(repo==="FlareZ123/liber-primus")data=fs.readFileSync(path.join(__dirname,"..",p));else{const r=await fetch("https://api.github.com/repos/"+repo+"/git/blobs/"+sha,{headers:{Accept:"application/vnd.github+json"}});assert(r.ok,"fetch "+r.status);data=Buffer.from((await r.json()).content,"base64")}assert(crypto.createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex")===sha,"pin "+p);raw.push(data.toString("utf8"))}console.log(JSON.stringify(experiment(raw),null,2))}
module.exports={experiment,pins};if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
