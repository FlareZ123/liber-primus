"use strict";
const fs=require("node:fs");
const {train,decode,words,makeRng,mod,names,SUPP}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const {candidates}=require("./lp2_scroll_vnull_fhold_joint_period8_sft.cjs");
const period=8, Q=29;
function pack(k){return k.reduce((a,x,i)=>a+x*Q**i,0)}
function unpack(v){const k=[];for(let i=0;i<period;i++){k.push(v%Q);v=Math.floor(v/Q)}return k}
function plan(ws){
 const n=ws.reduce((a,w)=>a+w.length,0),cap=Math.min(320,Math.floor(n/2));let at=0,zeros=0,prev=null,cut=0;const aa=[];
 for(let i=0;i<ws.length&&at+ws[i].length<=cap;i++){
  const w=ws[i];if(w.length>=period&&w.length<=10&&!w.includes(0))aa.push({word:w,offset:at,zeros,index:i,prev});
  at+=w.length;zeros+=w.filter(x=>x===0).length;prev=w.at(-1);cut=i+1;
 }
 return {n,cut,trainN:at,anchors:aa.slice(0,3)};
}
function encryptWords(ws,k,rng){
 let j=0,prev=null;return ws.map(w=>{const C=[];for(const p of w){if(p===0){C.push(0);prev=0;continue}
  for(;;){const c=mod(p+k[j++%period]);if(prev!==null&&c===prev&&rng(1e9)/1e9<SUPP){let z=rng(28);if(z>=c)z++;C.push(z);prev=z}else{C.push(c);prev=c;break}}
 }return C});
}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
function run(raw,mode="original",start=0,end=9,customTrial=null){
 const c=JSON.parse(raw[0]),native=JSON.parse(raw[3]),rm=new Map(c.runes.map((r,i)=>[r,i]));
 function split(s){const a=[];let w=[];for(const x of s){if(rm.has(x))w.push(rm.get(x));else if(w.length){a.push(w);w=[]}}if(w.length)a.push(w);return a}
 const original=split(raw[1].split("%").slice(0,55).join("").replace(/[\/\r\n]/g,"")),full=original.flat(),expected=c.pages.slice(0,56).flatMap(p=>p.indices);
 if(original.length!==2896||full.length!==12956||full.some((x,i)=>x!==expected[i]))throw Error("original mismatch");
 let offset=0;const po=c.pages.map(p=>{const o=offset;offset+=p.indices.length;return o});offset=0;const spans=original.map(w=>{const a={at:offset,w};offset+=w.length;return a});
 const bounds=[0,3,8,15,23,27,33,40,54,56],chapters=bounds.slice(0,-1).map((b,i)=>{const lo=po[b]+(b===0?13:b===15?20:0),hi=po[bounds[i+1]],ws=spans.filter(s=>s.at>=lo&&s.at+s.w.length<=hi).map(s=>s.w);if(ws.flat().length!==hi-lo)throw Error("chapter boundary");return {name:"p"+b+"-"+(bounds[i+1]-1),ws}});
 const dict=new Map();function add(w){if(w.length&&w.length<=10&&!w.includes(0))dict.set(w.join(","),w)}
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const w of words(m[1]))add(w)}
 for(const s of native.sections)for(const w of split(s.source_text))add(w);
 const bylen=new Map();for(const w of dict.values()){if(!bylen.has(w.length))bylen.set(w.length,[]);bylen.get(w.length).push(w)}
 const seq=raw.slice(4,7).map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7)))),rng=makeRng(0x47a8c8);
 function trial(name,ws,truth=null,key=null){
  const p=plan(ws);if(customTrial)return customTrial({name,ws,truth,key,p,bylen,dict,lp});const result={name,n:p.n,trainN:p.trainN,anchors:p.anchors,eligible:p.anchors.length>=2,steps:[]};if(!result.eligible)return result;
  let set=null;for(const a of p.anchors){const next=candidates(a,bylen),size=next.size;if(set===null)set=next;else set=new Set([...set].filter(k=>next.has(k)));result.steps.push({offset:a.offset,width:a.word.length,individual:size,joint:set.size,containsTrue:key?set.has(pack(key)):null});if(!set.size)break}
  result.joint=set.size;let best=null,feasible=0;const C0=ws.slice(0,p.cut).flat();
  for(const v of set){const k=unpack(v),K=Array.from({length:C0.length},(_,i)=>k[i%period]),d=decode(C0,K,lp);if(!d.possible)continue;feasible++;if(!best||d.logEvidence>best.d.logEvidence)best={k,d}}
  result.trainFeasible=feasible;
  if(best){result.key=best.k;result.correctKey=key?pack(best.k)===pack(key):null;result.trainBF=best.d.bf;const C=ws.flat(),d=decode(C,Array.from({length:C.length},(_,i)=>best.k[i%period]),lp);result.full=d.possible?{bf:d.bf,plain:d.P.map(x=>names[x]).join(""),P:d.P,edit:truth?edit(truth.flat(),d.P):null,pos:truth?d.P.reduce((a,x,i)=>a+(x===truth.flat()[i]),0)/truth.flat().length:null}:null}
  if(truth)result.trueAnchorForms=p.anchors.map(a=>({length:truth[a.index].length,inDict:dict.has(truth[a.index].join(",")),nulls:a.word.length-truth[a.index].length}));
  return result;
 }
 const rows=[];
 if(mode==="original"){for(const x of chapters.slice(start,end))rows.push(trial(x.name,x.ws))}
 else if(mode==="control"){
  const ws=words(raw[7]);for(let i=0;i<end;i++){const at=rng(ws.length-230),P=ws.slice(at,at+230),key=Array.from({length:period},()=>rng(Q)),C=encryptWords(P,key,rng);if(i>=start)rows.push({i,at,...trial("Orthodox"+i,C,P,key),truthKey:key})}
 }else throw Error("mode");
 return {mode,start,end,period,dictionary:dict.size,rows,seed:"0x47a8c8"};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/orthodox_daily_prayers_pg34981.txt"];
if(require.main===module){const raw=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify({original:run(raw),controls:run(raw,"control",0,12)},null,2))}
module.exports={run,paths};
