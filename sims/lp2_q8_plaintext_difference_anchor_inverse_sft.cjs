"use strict";
// Agent 5 #2617: q8 consuming plaintext-difference cipher, exact phase-offset lexical anchors.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
function experiment(corpus,transcript,gold,texts){
 const Q=8,TRAIN=232,TEST=76,mod=x=>(x%29+29)%29;
 const check=(v,m)=>{if(!v)throw Error(m)};
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>corpus.runes.indexOf(x)))}));
 const glyph=new Map(corpus.runes.map((x,i)=>[x,i]));
 let words=[],w=[],pos=0,start=0;
 for(const x of transcript.split("%").slice(0,55).join("%")){if(glyph.has(x)){if(!w.length)start=pos;w.push(glyph.get(x));pos++}else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){words.push({start,w});w=[]}}
 if(w.length)words.push({start,w});
 check(words.length===2896&&pos===12956,"source boundaries");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){let s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),p=[];while(s.length){const t=tokens.find(t=>s.startsWith(t.s));check(t,"GP encoding");p.push(t.i);s=s.slice(t.s.length)}return p}
 const baseLex=new Map();
 function add(m,p){if(!m.has(p.length))m.set(p.length,new Map());m.get(p.length).set(p.join(","),p)}
 for(const t of texts)for(const w of t.match(/[A-Za-z]+/g)||[])add(baseLex,encode(w));
 function lexicon(exclude){const m=new Map([...baseLex].map(([k,v])=>[k,new Map(v)]));for(const s of native)if(s.name!==exclude)for(const w of s.words)add(m,w);return m}
 function encrypt(P,K,prev){let j=0;return P.map(p=>{if(p===0)return 0;const c=mod(p-prev+K[j++%Q]);prev=p;return c})}
 function pack(S,B){let code=S;for(const b of B)code=code*29+b;return code}
 function unpack(code){const B=Array(Q);for(let j=Q-1;j>=0;j--){B[j]=code%29;code=Math.floor(code/29)}const S=code,K=[mod(S+B[Q-1]-B[0]),...B.slice(1).map((x,i)=>mod(B[i]-x))];return {S,B,K,prev:mod(S+B[Q-1])}}
 function anchors(C,ws,L){
   const T=[],Z=[];let t=0,z=0;for(const c of C){Z.push(z);if(c===0)z++;t=mod(t+c);T.push(t)}
   return ws.filter(w=>w.start+w.w.length<=TRAIN&&w.w.length>=Q).map(a=>{
     const set=new Set(),n=a.w.length,s=a.start;let compatible=0;
     for(const P of L.get(n)?.values()||[]){
       if(P.some((p,i)=>p===0&&C[s+i]!==0)||P.filter(x=>x!==0).length<Q)continue;
       compatible++;
       for(let h=0;h<=Z[s];h++)for(let S=0;S<29;S++){
         const B=new Int8Array(Q).fill(-1);let j=s-h,ok=true;
         for(let i=0;i<n;i++){
           if(P[i]===0)continue;
           const phase=j%Q,b=mod(P[i]-T[s+i]+Math.floor(j/Q)*S);
           if(B[phase]>=0&&B[phase]!==b){ok=false;break}
           B[phase]=b;j++;
         }
         if(ok&&B.every(x=>x>=0))set.add(pack(S,B));
       }
     }
     return {start:s,length:n,compatible,keys:set};
   });
 }
 // At least two independent long printed words must support one key.
 // The anchor clock grants every possible number of preceding F holds.
 function pairCandidates(rows){
   const counts=new Map();
   for(const row of rows)for(const k of row.keys)counts.set(k,(counts.get(k)||0)+1);
   const max=Math.max(0,...rows.map(row=>row.keys.size?1:0));
   let best=max,selected=[];
   for(const [k,n] of counts){if(n>best){best=n;selected=[k]}else if(n===best&&n>=2)selected.push(k)}
   return {maxSupport:best,bestKeys:selected,distinctKeys:counts.size,pairedKeys:[...counts].filter(([k,n])=>n>=2).map(([k,n])=>k)};
 }
 function paths(C,key,domain,singletons,initial=null){
   const out=[],P=[];let calls=0;
   function dfs(i,j,prev){
     calls++;
     if(i===C.length){out.push({P:[...P],j,prev});return}
     const c=C[i];
     if(c===0&&!singletons.has(i)){P.push(0);dfs(i+1,j,prev);P.pop()}
     const p=mod(prev+c-key.K[j%Q]);
     if(p!==0&&domain.has(p)&&(!singletons.has(i)||[24,10,3,16].includes(p))){P.push(p);dfs(i+1,j+1,p);P.pop()}
   }
   dfs(0,initial?.j||0,initial?.prev??key.prev);
   return {paths:out,calls};
 }
 function score(P,ws,L){
   let hit=0,n=0;
   for(const a of ws)if(a.start+a.w.length<=P.length){n++;if(L.get(a.w.length)?.has(P.slice(a.start,a.start+a.w.length).join(",")))hit++}
   return {hit,n};
 }
 function solve(C,ws,L,domain,truth=null){
   const rows=anchors(C.slice(0,TRAIN),ws,L),pair=pairCandidates(rows);
   const singletons=new Set(ws.filter(a=>a.w.length===1&&a.start<TRAIN).map(a=>a.start));
   const results=[];let pathCount=0,calls=0,rank=-1;
   for(const code of pair.pairedKeys){
     const k=unpack(code),z=paths(C.slice(0,TRAIN),k,domain,singletons);calls+=z.calls;pathCount+=z.paths.length;
     for(const p of z.paths){const s=score(p.P,ws,L);results.push({code,k,p,s})}
   }
   results.sort((a,b)=>b.s.hit-a.s.hit||a.code-b.code);
   const best=results[0],tie=best?results.filter(x=>x.s.hit===best.s.hit):[];
   let holdout=null;
   if(best){
     const si=new Set(ws.filter(a=>a.w.length===1&&a.start>=TRAIN).map(a=>a.start-TRAIN));
     const z=paths(C.slice(TRAIN),best.k,domain,si,best.p);
     const testWords=ws.filter(a=>a.start>=TRAIN).map(a=>({...a,start:a.start-TRAIN}));
     const choices=z.paths.map(p=>({p,s:score(p.P,testWords,L)})).sort((a,b)=>b.s.hit-a.s.hit);
     holdout={paths:choices.length,best:choices[0]?.s??null,ties:choices.length?choices.filter(x=>x.s.hit===choices[0].s.hit).length:0,plaintext:choices[0]?.p.P??null};
   }
   if(truth)rank=results.findIndex(x=>x.k.prev===truth.prev&&x.k.K.join()===truth.K.join()&&x.p.P.join()===truth.P.slice(0,TRAIN).join())+1;
   return {anchors:rows.map(({keys,...x})=>({...x,keys:keys.size})),maxSupport:pair.maxSupport,distinctKeys:pair.distinctKeys,pairedKeys:pair.pairedKeys.length,pathCount,calls,best:best?{key:best.k,score:best.s,ties:tie.length,trainingPlain:best.p.P}:null,holdout,truthRank:truth?rank:null,truthHoldout:truth&&holdout?.plaintext?holdout.plaintext.filter((x,i)=>x===truth.P[TRAIN+i]).length:null};
 }
 const nativeDomain=new Set(native.flatMap(s=>s.words.flat()).filter(x=>x!==0)),allDomain=new Set(Array.from({length:28},(_,i)=>i+1));
 // Exact language-support gate, all 2^3 original hold choices and 29 cycle sums.
 function supportGate(C,ws,domain,singleton){
   const zero=C.map((x,i)=>x===0?i:-1).filter(x=>x>=0),si=new Set(ws.filter(a=>a.w.length===1&&a.start<TRAIN).map(a=>a.start));
   let masks=0,count=0n;
   for(let hold=0;hold<1<<zero.length;hold++)for(let S=0;S<29;S++){
     const D=Array.from({length:Q},()=>Array.from({length:29},(_,i)=>i));let j=0,T=0;
     for(let i=0;i<C.length;i++){
       T=mod(T+C[i]);
       if(C[i]===0&&(hold>>zero.indexOf(i)&1)){if(singleton&&si.has(i)){D[0]=[];break}continue}
       const p=j%Q,v=mod(T-Math.floor(j/Q)*S),allowed=singleton&&si.has(i)?new Set([24,10,3,16]):domain;
       D[p]=D[p].filter(b=>allowed.has(mod(v+b)));j++;
     }
     const n=D.reduce((a,d)=>a*BigInt(d.length),1n);if(n){masks++;count+=n}
   }
   return {masks,count:count.toString()};
 }
 let seed=0x2617a005;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const controls=[];
 for(const s of native.filter(s=>["0_welcome","0_koan_1","0_loss_of_divinity","jpg107-167"].includes(s.name))){
   const P=s.words.flat().slice(0,TRAIN+TEST),K=Array.from({length:Q},()=>rng()%29),prev=rng()%29;
   if(s.name==="0_koan_1")continue; // No full-phase lexical anchor in the first 232 runes; not an applicable control.
   let start=0;const ws=s.words.map(w=>{const a={start,w};start+=w.length;return a}).filter(x=>x.start+x.w.length<=P.length);
   const C=encrypt(P,K,prev),result=solve(C,ws,lexicon(s.name),nativeDomain,{P,K,prev});
   controls.push({name:s.name,truth:{K,prev},zeros:C.slice(0,TRAIN).filter(x=>x===0).length,...result});
 }
 const C=corpus.pages.filter(x=>x.page>=54&&x.page<=55).flatMap(x=>x.indices),off=12956-C.length,ws=words.filter(w=>w.start>=off).map(w=>({...w,start:w.start-off}));
 const gate={all:supportGate(C.slice(0,TRAIN),ws,allDomain,false),native:supportGate(C.slice(0,TRAIN),ws,nativeDomain,false),nativeSingleton:supportGate(C.slice(0,TRAIN),ws,nativeDomain,true)};
 const original=solve(C,ws,lexicon(null),allDomain);
 return {controls,gate,original};
}
if(require.main===module){const d=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3)),null,2));}
module.exports={experiment};
