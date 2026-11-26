"use strict";
const fs=require("node:fs");
const {train,decode,words,encode,makeRng,mod,names}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const Q=29,period=8,supp=1-.664/3.448,powers=Array.from({length:period},(_,i)=>Q**i);
function pack(k){return k.reduce((a,x,i)=>a+x*powers[i],0)}
function unpack(v){const k=[];for(let i=0;i<period;i++){k.push(v%Q);v=Math.floor(v/Q)}return k}
function anchor(ws){let offset=0,zeros=0,prev=null;for(let i=0;i<ws.length&&offset+ws[i].length<=140;i++){const w=ws[i];if(w.length>=period&&w.length<=10&&!w.includes(0))return {word:w,offset,zeros,index:i,prev};offset+=w.length;zeros+=w.filter(x=>x===0).length;prev=w.at(-1)}return null}
/** Enumerate every dictionary anchor word and legal null pattern, with every preceding F hold count. */
function candidates(a,bylen){
 const out=new Set();if(!a)return out;
 const C=a.word,n=C.length,rotations=[...new Set(Array.from({length:a.zeros+1},(_,h)=>modPhase(a.offset-h)))];
 for(let mask=0;mask<2**(n-1);mask++){
  const pos=[],target=[];let m=0,ok=true;
  for(let i=0;i<n;i++){
   const isNull=Boolean(mask&(1<<i)),prev=i?C[i-1]:a.prev;
   if(isNull&&(prev===null||prev===C[i])){ok=false;break}
   pos.push(m);target.push(isNull?prev:C[i]);if(!isNull)m++;
  }
  if(!ok)continue;
  const k=new Int8Array(period);
  for(const p of bylen.get(m)||[]){
   k.fill(-1);let good=true;
   for(let i=0;i<n;i++){const j=i%period,v=mod(target[i]-p[pos[i]]);if(k[j]>=0&&k[j]!==v){good=false;break}k[j]=v}
   if(!good)continue;
   for(const phase of rotations){let key=0;for(let j=0;j<period;j++)key+=k[j]*powers[(j+phase)%period];out.add(key)}
  }
 }
 return out;
}
function modPhase(x){return (x%period+period)%period}
function prefix(ws){let n=0,i=0;while(i<ws.length&&n+ws[i].length<=140)n+=ws[i++].length;return ws.slice(0,i).flat()}
function encryptWords(ws,k,rng){
 const out=[];let j=0,prev=null;
 for(const w of ws){const c=[];for(const p of w){
  if(p===0){c.push(0);prev=0;continue}
  for(;;){const x=mod(p+k[j++%period]);if(prev!==null&&x===prev&&rng(1e9)/1e9<supp){let z=rng(28);if(z>=x)z++;c.push(z);prev=z}else{c.push(x);prev=x;break}}
 }out.push(c)}return out;
}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
function run(raw){
 const c=JSON.parse(raw[0]),transcript=raw[1],ink=JSON.parse(raw[2]),native=JSON.parse(raw[4]),rm=new Map(c.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,ws:split(s.source_text)}));
 function split(s){const out=[];let w=[];for(const ch of s){if(rm.has(ch))w.push(rm.get(ch));else if(w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
 const ws=split(transcript.split("%").slice(3,8).join("").replace(/[\/\r\n]/g,"")),flat=ws.flat(),expected=c.pages.slice(3,8).flatMap(p=>p.indices);
 if(flat.length!==expected.length||flat.some((x,i)=>x!==expected[i]))throw Error("transcription mismatch");
 if(!ink.pages.find(p=>p.page===3).red_spans.some(s=>s.start===119&&s.length===3)||!ink.pages.find(p=>p.page===6).red_spans.some(s=>s.start===71&&s.length===11))throw Error("rubric mismatch");
 let at=0;const spans=ws.map(w=>{const s={at,w};at+=w.length;return s}),ranges=[[122,812],[823,1131]],original=ranges.map(([a,b])=>{const x=spans.filter(s=>s.at>=a&&s.at+s.w.length<=b).map(s=>s.w);if(x.flat().length!==b-a)throw Error("boundary");return x});
 const dict=new Map();function add(w){if(w.length&&w.length<=10&&!w.includes(0))dict.set(w.join(","),w)}
 for(const line of raw[3].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const w of words(m[1]))add(w)}
 for(const s of ns)for(const w of s.ws)add(w);
 const bylen=new Map();for(const w of dict.values()){let a=bylen.get(w.length);if(!a){a=[];bylen.set(w.length,a)}a.push(w)}
 const seq=raw.slice(5).map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7))));
 function trial(pair,truth=null,key0=null){
  const aa=pair.map(anchor);if(aa.some(a=>!a))return {eligible:false,anchors:aa};
  const kk=aa.map(a=>candidates(a,bylen)),small=kk[0].size<=kk[1].size?0:1,joint=[...kk[small]].filter(k=>kk[1-small].has(k)),prefixes=pair.map(prefix),result={eligible:true,anchors:aa,individual:kk.map(s=>s.size),joint:joint.length,trainN:prefixes.map(s=>s.length),fullN:pair.map(s=>s.flat().length),trueKeyInJoint:key0?joint.includes(pack(key0)):null};
  let best=null,feasible=0;
  for(const v of joint){const k=unpack(v),fit=prefixes.map(C=>decode(C,Array.from({length:C.length},(_,i)=>k[i%period]),lp));if(fit.some(d=>!d.possible))continue;feasible++;const score=fit.reduce((a,d)=>a+d.logEvidence,0);if(!best||score>best.score)best={k,score,fit}}
  result.trainFeasible=feasible;
  if(best){result.key=best.k;result.trainScore=best.score;result.trainBF=best.fit.map(d=>d.bf);result.correctKey=key0?pack(best.k)===pack(key0):null;result.full=pair.map((w,i)=>{const C=w.flat(),d=decode(C,Array.from({length:C.length},(_,j)=>best.k[j%period]),lp);return d.possible?{P:d.P,plain:d.P.map(x=>names[x]).join(""),bf:d.bf,edit:truth?edit(d.P,truth[i].flat()):null,pos:truth?d.P.reduce((a,x,j)=>a+(x===truth[i].flat()[j]),0)/truth[i].flat().length:null}:null})}
  return result;
 }
 const res=trial(original),rng=makeRng(0x472522),key=[6,18,1,17,9,22,3,12],plant=ns.filter(s=>s.ws.flat().length>=150).map(s=>({name:s.name,ws:s.ws,C:encryptWords(s.ws,key,rng)})),eligible=plant.filter(s=>anchor(s.C));
 const controls=[];for(let i=1;i<eligible.length;i++){const a=eligible[0],b=eligible[i];controls.push({pair:[a.name,b.name],...trial([a.C,b.C],[a.ws,b.ws],key)})}
 return {dictionary:dict.size,ranges,period,seed:"0x472522",original:res,eligible:eligible.map(s=>s.name),ineligible:plant.filter(s=>!anchor(s.C)).map(s=>s.name),controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-ink-annotations.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={run,candidates,anchor,paths};
