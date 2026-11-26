"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
const root=path.resolve(__dirname,"..");
const inputs=files.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source),A=29,R=841,assert=(p,m)=>{if(!p)throw Error(m)};
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,"unmapped "+w);a.push(t.i);i+=t.s.length}}}return Uint8Array.from(a)}
 const donors=inputs.slice(1).map(x=>({name:x.path,tape:native(x.source)}));
 const f=new Float64Array(A).fill(1);for(const id of [0,2])for(const p of donors[id].tape)f[p]++;
 const sum=f.reduce((a,b)=>a+b);for(let p=0;p<A;p++)f[p]*=A/sum;
 const logF=Array.from(f,Math.log),lgfact=new Float64Array(A+1);for(let k=1;k<=A;k++)lgfact[k]=lgfact[k-1]+Math.log(k);
 const orig=gp.pages.filter(p=>p.page<56&&p.indices.length).map(p=>({id:p.page,C:p.indices}));
 const tailN=orig.filter(p=>p.id>=54).reduce((n,p)=>n+p.C.length,0),earlyN=orig.filter(p=>p.id<54).reduce((n,p)=>n+p.C.length,0);
 assert(tailN===308&&earlyN===12648,"layout");
 function tailSpec(pages){const rows=Array.from({length:R},()=>new Map()),eq=[],ne=[];let off=0;
 for(const p of pages){const c=p.C;for(let i=2;i<c.length;i++){const row=rows[c[i-2]*A+c[i-1]];if(row.has(c[i]))eq.push(row.get(c[i]),off+i);else row.set(c[i],off+i)}off+=c.length}
 const spec=[];let offset=0;for(let s=0;s<R;s++){if(!rows[s].size)continue;const e=[...rows[s]].sort((a,b)=>a[0]-b[0]);for(let i=0;i<e.length;i++)for(let j=i+1;j<e.length;j++)ne.push(e[i][1],e[j][1]);spec.push({s,columns:e.map(x=>x[0]),positions:e.map(x=>x[1]),offset});offset+=e.length;}
 return {spec,eq,ne,n:off,mappings:offset};
 }
 function candidates(tail,truth){const {spec,eq,ne,n,mappings}=tail,out=new Map();let offsets=0,full=0,truthId=null;
 function signature(t,o){const a=new Uint8Array(mappings);for(const r of spec)for(let j=0;j<r.positions.length;j++)a[r.offset+j]=t[o+r.positions[j]];return a}
 for(let d=0;d<donors.length;d++){const t=donors[d].tape;for(let o=0;o+n<=t.length;o++){offsets++;let ok=true;for(let i=0;i<eq.length;i+=2)if(t[o+eq[i]]!==t[o+eq[i+1]]){ok=false;break}if(!ok)continue;for(let i=0;i<ne.length;i+=2)if(t[o+ne[i]]===t[o+ne[i+1]]){ok=false;break}if(!ok)continue;
  full++;const a=signature(t,o),id=String.fromCharCode(...a);if(!out.has(id))out.set(id,{id,a,d,o,aliases:0});out.get(id).aliases++;if(truth&&d===truth.d&&o===truth.o)truthId=id;
 }}
 return {offsets,full,truthId,keys:[...out.values()]};
 }
 function counts(pages,maxPage){const h=Array.from({length:R},()=>new Uint16Array(A));for(const p of pages){if(p.id>maxPage)continue;const c=p.C;for(let i=2;i<c.length;i++)h[c[i-2]*A+c[i-1]][c[i]]++;}return h}
 function rowMarginal(counts,columns){
  const known=new Set(columns),freq=new Map();for(let c=0;c<A;c++)if(!known.has(c)&&counts[c])freq.set(counts[c],(freq.get(counts[c])??0)+1);
  const groups=[...freq].sort((a,b)=>a[0]-b[0]),remaining=A-columns.length;
  let size=1;const strides=[];let nonzero=0,logDen=lgfact[remaining];for(const [r,m] of groups){strides.push(size);size*=m+1;nonzero+=m;logDen-=lgfact[m]}logDen-=lgfact[remaining-nonzero];
  const transitions=groups.map(([r,m],j)=>{const a=new Int32Array(size).fill(-1),k=strides[j];for(let i=0;i<size;i++)if(Math.floor(i/k)%(m+1)<m)a[i]=i+k;return a});
  const powers=groups.map(([r])=>Array.from(f,p=>p**r)),cache=new Map();
  function evaluate(mask){if(!groups.length)return 0;if(cache.has(mask))return cache.get(mask);let dp=new Float64Array(size),next=new Float64Array(size);dp[0]=1;
   for(let p=0;p<A;p++){if(mask&(1<<p))continue;next.fill(0);for(let i=0;i<size;i++){const v=dp[i];if(v===0)continue;next[i]+=v;for(let j=0;j<groups.length;j++){const q=transitions[j][i];if(q>=0)next[q]+=v*powers[j][p];}}[dp,next]=[next,dp];}
   const val=Math.log(dp[size-1])-logDen;assert(Number.isFinite(val),"row marginal");cache.set(mask,val);return val
  }return {evaluate}
 }
 // Independent small-domain direct permutation-sum regression (24 completions).
 {const h=new Uint16Array(A);h[25]=2;h[26]=1;h[27]=3;const columns=Array.from({length:25},(_,i)=>i),mask=(1<<25)-1;let direct=0,num=0;for(let a=25;a<29;a++)for(let b=25;b<29;b++)if(b!==a)for(let c=25;c<29;c++)if(c!==a&&c!==b){direct+=f[a]**2*f[b]*f[c]**3;num++}assert(num===24&&Math.abs(rowMarginal(h,columns).evaluate(mask)-Math.log(direct/num))<1e-10,"exact posterior regression")}
 function scoreModel(h,spec){let baseline=0;const baseRows=new Float64Array(R);for(let s=0;s<R;s++){baseRows[s]=rowMarginal(h[s],[]).evaluate(0);baseline+=baseRows[s]}
  const models=spec.map(r=>({r,m:rowMarginal(h[r.s],r.columns),base:baseRows[r.s],cnt:r.columns.map(c=>h[r.s][c])}));
  function score(a){let v=0;for(const {r,m,base,cnt} of models){let mask=0,known=0;for(let j=0;j<r.columns.length;j++){const p=a[r.offset+j];mask|=1<<p;known+=cnt[j]*logF[p]}v+=known+m.evaluate(mask)-base}return v}return{score,baseline}
 }
 function mapPred(pages,spec,a,plaintext=null){const table=Array.from({length:R},()=>new Int8Array(A).fill(-1));for(const r of spec)for(let j=0;j<r.columns.length;j++)table[r.s][r.columns[j]]=a[r.offset+j];let n=0,correct=0,eligible=0,off=0,runs=[];for(const page of pages){if(page.id>=54)continue;let run=[];function flush(i){if(run.length>=2)runs.push({page:page.id,offset:i-run.length,text:run.map(p=>gp.translit[p]).join("")});run=[]}
  for(let i=0;i<page.C.length;i++){if(i<2)continue;eligible++;const v=table[page.C[i-2]*A+page.C[i-1]][page.C[i]];if(v>=0){n++;if(plaintext&&plaintext[off+i]===v)correct++;run.push(v)}else flush(i)}flush(page.C.length);off+=page.C.length;}
  return {eligible,covered:n,correct:plaintext?correct:null,runs:runs.slice(0,30),runCount:runs.length}
 }
 function scoreAll(pages,tail,cands,truthPlain=null){const D=scoreModel(counts(pages,32),tail.spec),B=scoreModel(counts(pages,53),tail.spec);for(const q of cands.keys){q.D=D.score(q.a);q.B=B.score(q.a);q.V=q.B-q.D}
  const rank=(q,k)=>cands.keys.filter(x=>x[k]>=q[k]-1e-9).length;
  const summary=q=>({donor:donors[q.d].name,offset:q.o,aliases:q.aliases,discovery:q.D,validation:q.V,total:q.B,rankD:rank(q,"D"),rankV:rank(q,"V"),rankB:rank(q,"B")});
  const byD=cands.keys.slice().sort((a,b)=>b.D-a.D),byB=cands.keys.slice().sort((a,b)=>b.B-a.B);
  const truth=cands.truthId?cands.keys.find(q=>q.id===cands.truthId):null;
  if(truthPlain)assert(truth,"true key absent");
  const truthPred=truth?mapPred(pages,tail.spec,truth.a,truthPlain):null;
  if(truthPred)assert(truthPred.covered===truthPred.correct,"frozen true partial key wrong");
  return {baselineDiscovery:D.baseline,baselineAll:B.baseline,truth:truth?{...summary(truth),predictions:truthPred}:null,topDiscovery:byD.slice(0,3).map(summary),topTotal:byB.slice(0,3).map(summary),topDiscoveryPredictions:mapPred(pages,tail.spec,byD[0].a,truthPlain),topTotalPredictions:mapPred(pages,tail.spec,byB[0].a,truthPlain)}
 }
 function random(seed){let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}return n=>{const bound=Math.floor(4294967296/n)*n;let a;do{a=next()}while(a>=bound);return a%n}}
 function plant(seed,donor,tailOffset,earlyOffset){const rand=random(seed),trueTail=donors[donor].tape.slice(tailOffset,tailOffset+tailN),trueEarly=donors[1].tape.slice(earlyOffset,earlyOffset+earlyN);
  function makeTables(){return Array.from({length:R},()=>{const a=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a})}
  function encrypt(geometry,plain,tables){let off=0;return geometry.map(p=>{const C=[];for(let i=0;i<p.C.length;i++){const v=plain[off++],c=i<2?rand(A):tables[C[i-2]*A+C[i-1]][v];if(i>=2)assert(tables[C[i-2]*A+C[i-1]].indexOf(c)===v,"plant inverse");C.push(c)}return {id:p.id,C}})}
  for(let attempt=1;attempt<=200;attempt++){const tables=makeTables(),t=encrypt(orig.filter(p=>p.id>=54),trueTail,tables),ts=tailSpec(t);if(ts.eq.length!==2||ts.ne.length/2<50||ts.ne.length/2>76)continue;
   return {attempt,pages:[...encrypt(orig.filter(p=>p.id<54),trueEarly,tables),...t],trueEarly,ts}}
  throw Error("matched-profile plant absent")
 }
 const configurations=[[0,4013,18000,0x330102],[1,38000,46000,0x330103],[2,17000,72000,0x330104],[3,500,92000,0x330105],[0,20000,113000,0x330106],[2,80000,144000,0x330107]];
 const controls=[];
 for(const [d,o,e,seed] of configurations){const p=plant(seed,d,o,e),q=candidates(p.ts,{d,o});assert(q.truthId,"true source absent");const result=scoreAll(p.pages,p.ts,q,p.trueEarly);controls.push({seed,truthDonor:donors[d].name,truthOffset:o,earlyOffset:e,attempt:p.attempt,equal:p.ts.eq.length/2,unequal:p.ts.ne.length/2,mappings:p.ts.mappings,sourceOffsets:q.offsets,fullMatches:q.full,distinctKeys:q.keys.length,...result})}
 const gate={discoveryTop5:controls.filter(x=>x.truth.rankD<=5).length,totalTop1:controls.filter(x=>x.truth.rankB===1).length,requiredDiscoveryTop5:5,requiredTotalTop1:4,controls:6};gate.pass=gate.discoveryTop5>=gate.requiredDiscoveryTop5&&gate.totalTop1>=gate.requiredTotalTop1;
 let original=null;
 if(gate.pass){const ts=tailSpec(orig.filter(p=>p.id>=54)),q=candidates(ts,null);assert(q.full===588,"original match count");original={equal:ts.eq.length/2,unequal:ts.ne.length/2,mappings:ts.mappings,sourceOffsets:q.offsets,fullMatches:q.full,distinctKeys:q.keys.length,...scoreAll(orig,ts,q)}}
 return {inputs:inputs.map(({path,sha})=>({path,sha})),prior:"add-one GP frequencies from pinned Gibran and Emerson; normalized to uniform-relative weights",f:Array.from(f,x=>x/A),calibration:controls,gate,original};
}
console.log(JSON.stringify(experiment(inputs),null,2));
