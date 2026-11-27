"use strict";
const fs=require("node:fs");
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),f=JSON.parse(raw[1]),n=JSON.parse(raw[2]),lex=new Map(),ri=new Map(gp.runes.map((r,i)=>[r,i])),compact="0123456789abcdefghijklmnopqrs",Q=8,B=29,M=36,cap=config.cap??160000000,maxHidden=config.maxHidden??2;
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),digits=s=>Array.from(s,x=>x.charCodeAt(0)-65),show=a=>a.map(x=>gp.translit[x]).join("");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function norm(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let j=0;j<w.length;){const t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!t)return null;a.push(t.i);j+=t.t.length;}return a;}
 function add(a){if(a&&a.length<=24)lex.set(id(a),a);}
 for(const l of raw[3].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){add(norm(m[1],false));add(norm(m[1],true));}}
 const native=[];for(const s of n.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]){const a=Array.from(w,x=>ri.get(x));add(a);native.push({name:s.name,a});}
 const mod=x=>(x+M)%M;
 function canonical(K){let b=Infinity;for(let t=0;t<Q;t++){let x=0;for(let j=0;j<Q;j++)x=x*B+K[(t+j)%Q];if(x<b)b=x;}return b;}
 function uncode(x){const a=Array(Q);for(let j=Q-1;j>=0;j--){a[j]=x%B;x=Math.floor(x/B);}return a;}
 function emit(P,K,phase=0,prev=36){let C=[],retries=0,silent=0;for(const p of P){let r=0,c;do{c=(p+K[phase])%M;phase=(phase+1)%Q;if(c===prev){r++;retries++;if(r>=Q)return null;}}while(c===prev);prev=c;if(c<29)C.push(c);else silent++;}return {C,silent,retries,phase,prev};}
 function search(C,limit=cap){
  const candidates=[...lex.values()].filter(p=>p.length>=C.length&&p.length<=C.length+maxHidden),keys=new Map(),K=new Int16Array(Q);let nodes=0,completed=0,stopped=false,fullChecks=0,witnesses=0;
  const same=Array(C.length+1).fill(0);for(let j=C.length-2;j>=0;j--)same[j]=same[j+1]+(C[j]===C[j+1]);
  for(const P of candidates){
   const L=P.length,CL=C.length;
   function addKey(){const key=canonical(K);if(keys.has(key))return;for(let t=0;t<Q;t++)for(let v=0;v<=M;v++){const e=emit(P,K,t,v);if(e&&e.C.length===CL&&e.C.every((x,z)=>x===C[z])){witnesses++;keys.set(key,show(P));return;}}}
   function rest(i,j,prev,r){
    fullChecks++;let t=0;
    for(;i<L;i++){
     let c;
     do{c=(P[i]+K[t])%M;t=(t+1)%Q;if(c===prev){if(++r>=Q)return;}}while(c===prev);
     r=0;prev=c;
     if(c<29){if(j===CL||c!==C[j])return;j++;}
    }
    if(j===CL)addKey();
   }
   function walk(at,i,j,prev,r){
    if(++nodes>limit){stopped=true;return;}
    const spare=L-i-(CL-j);
    if(spare<0||spare<same[j]+(j<CL&&prev===C[j]?1:0)||r>=Q)return;
    if(i===L){if(j===CL&&at===Q)addKey();return;}
    if(at===Q){rest(i,j,prev,r);return;}
    const p=P[i];
    if(prev<M){const k=mod(prev-p);if(k<B){K[at]=k;walk(at+1,i,j,prev,r+1);if(stopped)return;}}
    if(j<CL&&C[j]!==prev){const k=mod(C[j]-p);if(k<B){K[at]=k;walk(at+1,i+1,j+1,C[j],0);if(stopped)return;}}
    if(spare>0)for(let c=29;c<M;c++)if(c!==prev){const k=mod(c-p);if(k<B){K[at]=k;walk(at+1,i+1,j,c,0);if(stopped)return;}}
   }
   // Rotate the key so its first assigned digit emits the first visible output.
   // Every path has at least Q attempts from this point. Recheck the prefix at full-key acceptance.
   for(let i0=0;i0<=L-CL&&!stopped;i0++){const k=mod(C[0]-P[i0]);if(k<B){K[0]=k;walk(1,i0+1,1,C[0],0);}}
   if(stopped)break;completed++;
  }
  return {keys,nodes,fullChecks,witnesses,words:candidates.length,completed,complete:!stopped};
 }
 const plantKey=[11,4,20,3,28,8,17,6],truth=canonical(plantKey),plantCases=[],seen=new Set();
 for(const item of native){
  if(item.a.length<10||seen.has(id(item.a)))continue;seen.add(id(item.a));
  const phase=(plantCases.length*3+2)%Q,prev=plantCases.length?31:0,E=emit(item.a,plantKey,phase,prev);
  if(!E||E.C.length<10||E.silent>maxHidden)continue;
  plantCases.push({name:item.name,word:show(item.a),P:item.a,C:E.C,phase,prev,silent:E.silent,retries:E.retries});
  if(plantCases.length===2)break;
 }
 const rawFit=f.p54.body_groups.slice(0,-1).map((w,i)=>({i,C:Array.from(w,c=>compact.indexOf(c)),compact:w})).sort((a,b)=>b.C.length-a.C.length||a.i-b.i);
 const anchorCases=rawFit.slice(0,2);
 let outputs=[],sets=[];
 for(const c of plantCases){
  const r=search(c.C);outputs.push({...c,kind:"plant",keys:r.keys.size,truth:r.keys.has(truth),nodes:r.nodes,checks:r.fullChecks,words:r.words,completed:r.completed,complete:r.complete,witnesses:r.witnesses});sets.push(r.keys);
 }
 const intersect=(a,b)=>new Map([...a].filter(([k])=>b.has(k)));
 const plantJoint=sets.length===2?intersect(sets[0],sets[1]):new Map();
 if(plantCases.length!==2||outputs.some(x=>!x.truth))return {error:"plant gate",lexicon:lex.size,outputs,plantJoint:plantJoint.size,truth:plantJoint.has(truth)};
 sets=[];
 for(const c of anchorCases){
  const r=search(c.C);outputs.push({...c,kind:"original",keys:r.keys.size,nodes:r.nodes,checks:r.fullChecks,words:r.words,completed:r.completed,complete:r.complete,witnesses:r.witnesses});sets.push(r.keys);
 }
 const joint=intersect(sets[0],sets[1]);const union=[...new Set(sets.flatMap(m=>[...m.keys()]))].map(k=>({key:uncode(k),anchors:sets.map(m=>m.get(k)??null)}));
 return {lexicon:lex.size,maxHidden,cap,plantKey,truthCanonical:uncode(truth),plantJoint:plantJoint.size,plantTruth:plantJoint.has(truth),outputs,union,jointCount:joint.size,jointComplete:outputs.filter(x=>x.kind==="original").every(x=>x.complete),jointKeys:[...joint].slice(0,10000).map(([k,w])=>({key:uncode(k),anchor0:w,anchor1:sets[1].get(k)})),truncated:joint.size>10000};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment,paths};
