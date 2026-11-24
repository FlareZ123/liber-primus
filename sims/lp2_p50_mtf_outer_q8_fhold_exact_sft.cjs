'use strict';
// Agent12: exact p50 bit0 two-tap MTF outer + q8 authentic latent-F inner inverse.
// Reproduce from repository root: node sims/lp2_p50_mtf_outer_q8_fhold_exact_sft.cjs
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,table,raw,gold,lexText){
 const Q=8,ALL=(1<<29)-1,mod=x=>(x%29+29)%29,alphabet=Array.from({length:29},(_,i)=>i);
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]), values=m=>alphabet.filter(k=>m&(1<<k));
 const glyph=new Map(corpus.runes.map((x,i)=>[x,i]));
 const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 let words=[],w=[],tape=[];
 for(const ch of raw.split("%").slice(0,55).join("%")){
  if(glyph.has(ch)){w.push(glyph.get(ch));tape.push(glyph.get(ch))}
  else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[]}
 }
 if(w.length)words.push(w);
 check(original.length===12956&&words.length===2896&&same(tape,original),"canonical source");
 check(table.bytes.length===256,"table");
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>glyph.get(x)))}));
 check(native.flatMap(s=>s.words.flat()).length===2979,"native source");
 const wordpos=ws=>ws.flatMap(w=>w.map((_,i)=>i));
 function singletons(ws){let i=0;const S=new Set();for(const w of ws){if(w.length===1)S.add(i);i+=w.length}return S}
 let seed=33012014;
 function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 /** State is updated only by observed/emitted ciphertext, not guessed plaintext. */
 function rotor(seq,wp,initial,encode){
  const S=initial.slice(),out=[],seen=new Set();let cover=0;
  for(let i=0;i<seq.length;i++){
   const lag=!(table.bytes[(i+255)&255]&1)&&wp[i]>=5?5:1,prior=encode?out:seq,f=i>=lag?prior[i-lag]:0;
   const a=S.filter(x=>x!==f),c=encode?(seq[i]===0?f:a[seq[i]-1]):seq[i];
   out.push(encode?c:c===f?0:a.indexOf(c)+1);S.splice(S.indexOf(c),1);S.unshift(c);
   seen.add(c);if(!cover&&seen.size===29)cover=i+1;
  }
  return {out,cover}
 }
 /** For each state, the eight independent bitmasks are an exact Cartesian set of keys.
  * Equal phase+domain states merge; no beam or frequency pruning is used.
  * @param {number[]} C @param {Set<number>} singleton @param {number[]} support
  * @param {boolean} useSingles @param {{j:number,d:number[]}[]} init
  */
 function propagate(C,singleton,support,useSingles,init=[{j:0,d:Array(Q).fill(ALL)}]){
  let states=init,max=states.length,zeros=0;
  for(let i=0;i<C.length;i++){
   const c=C[i],is=useSingles&&singleton.has(i),pSet=is?[24,10,3,16]:support;
   const allow=pSet.filter(p=>p!==0).reduce((m,p)=>m|(1<<mod(c-p)),0),next=new Map();
   if(c===0)zeros++;
   for(const s of states){
    if(c===0&&!is)next.set(s.j+":"+s.d.join(),s);
    const m=s.d[s.j]&allow;
    if(m){const d=s.d.slice();d[s.j]=m;const j=(s.j+1)%Q;next.set(j+":"+d.join(),{j,d})}
   }
   states=[...next.values()];max=Math.max(max,states.length);
   if(!states.length)return {length:i+1,states,max,zeros};
   check(states.length<=200000,"domain state cap");
  }
  return {length:C.length,states,max,zeros}
 }
 function expand(states){
  const keys=new Map();
  function rec(d,j,K){if(K.length===Q){const key=K.join();if(!keys.has(key))keys.set(key,{K:K.slice(),phases:new Set()});keys.get(key).phases.add(j);return}
   for(const v of values(d[K.length])){K.push(v);rec(d,j,K);K.pop()}}
  for(const s of states)rec(s.d,s.j,[]);
  return [...keys.values()].map(x=>({K:x.K,phases:[...x.phases].sort((a,b)=>a-b)}))
 }
 function stat(a){return {length:a.length,states:a.states.length,maximumStates:a.max,zeros:a.zeros}}
 function inner(P,K,phase=0){let j=phase;return P.map(p=>p===0?0:mod(p+K[j++%Q]))}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encodeWord(w){let s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),out=[];
  while(s.length){const t=tokens.find(t=>s.startsWith(t.s));if(!t)return null;out.push(t.i);s=s.slice(t.s.length)}return out}
 const dictionary=new Set();
 for(const line of lexText.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+/i);if(m){const p=encodeWord(m[1]);if(p)dictionary.add(p.join())}}
 /** Fixed lexical and smoothed trigram scoring; target section excluded. */
 function scorer(others){
  const lex=new Set(dictionary),counts=new Map(),contexts=new Map();
  for(const w of others.flatMap(s=>s.words)){
   lex.add(w.join());const q=[29,29,...w,29];for(let i=2;i<q.length;i++){const a=q[i-2]+","+q[i-1],b=a+","+q[i];counts.set(b,(counts.get(b)||0)+1);contexts.set(a,(contexts.get(a)||0)+1)}
  }
  return w=>{const q=[29,29,...w,29];let score=lex.has(w.join())?5:0;for(let i=2;i<q.length;i++){const a=q[i-2]+","+q[i-1],b=a+","+q[i];score+=Math.log(((counts.get(b)||0)+0.5)/((contexts.get(a)||0)+15))}return score}
 }
 /** Exact best path for a fixed key, keeping every terminal phase until
  * a frozen training winner is chosen. Uses only whole printed group lengths. */
 function decode(C,lengths,K,support,score,phase=0){
  const allow=new Set(support);let states=new Map([[phase,{j:phase,score:0,P:[]}]]),offset=0;
  for(const len of lengths){
   const next=new Map();
   for(const s of states.values()){
    const p=[];
    function dfs(i,j){
     if(i===len){const sc=s.score+score(p),old=next.get(j);
      if(!old||sc>old.score)next.set(j,{j,score:sc,P:s.P.concat(p)});return}
     const c=C[offset+i];
     if(c===0&&len!==1){p.push(0);dfs(i+1,j);p.pop()}
     const v=mod(c-K[j]);
     if(v&&allow.has(v)&&(len!==1||[24,10,3,16].includes(v))){p.push(v);dfs(i+1,(j+1)%Q);p.pop()}
    }
    dfs(0,s.j);
   }
   states=next;offset+=len;if(!states.size)break;
  }
  return [...states.values()].sort((a,b)=>b.score-a.score||a.j-b.j)
 }
 const allSupport=alphabet,sourceSupport=[...new Set(native.flatMap(s=>s.words.flat()))];
 const controls=[];
 // Keep the fixed control order, seed and split; no target text informs the scorer.
 for(const target of native.filter(s=>["0_welcome","0_koan_1","0_loss_of_divinity"].includes(s.name))){
  const others=native.filter(s=>s!==target),warm=others.flatMap(s=>s.words),ws=[...warm,...target.words],P=ws.flat(),wp=wordpos(ws),K=Array.from({length:Q},()=>rng()%29),init=shuffle(alphabet);
  const R=inner(P,K),enc=rotor(R,wp,init,true),dec=rotor(enc.out,wp,alphabet,false),off=warm.flat().length,phase=P.slice(0,off).filter(Boolean).length%Q,rot=K.slice(phase).concat(K.slice(0,phase));
  check(dec.cover<=off&&same(dec.out.slice(off),R.slice(off)),"planted outer washout");
  check(same(rotor(R,wp,init,true).out,enc.out),"planted replay");
  let cut=0,nw=0;const truth=target.words.flat();
  for(const w of target.words){if(cut+w.length>truth.length*2/3)break;cut+=w.length;nw++}
  const observed=dec.out.slice(off),support=[...new Set(others.flatMap(s=>s.words.flat()))],S=singletons(target.words);
  const train=propagate(observed.slice(0,cut),S,support,true),keys=expand(train.states),score=scorer(others);
  check(keys.some(k=>same(k.K,rot)),"true key survives");
  const lens=target.words.map(w=>w.length);let best=null,runner=-Infinity;
  for(const k of keys){const fits=decode(observed.slice(0,cut),lens.slice(0,nw),k.K,support,score);
   for(const fit of fits){if(!k.phases.includes(fit.j))continue;if(!best||fit.score>best.fit.score){if(best)runner=Math.max(runner,best.fit.score);best={K:k.K,fit}}else runner=Math.max(runner,fit.score)}
  }
  check(best,"control no winner");
  const test=decode(observed.slice(cut),lens.slice(nw),best.K,support,score,best.fit.j)[0];
  const plain=best.fit.P.concat(test?.P||[]),trainMatches=best.fit.P.filter((p,i)=>p===truth[i]).length,testMatches=test?test.P.filter((p,i)=>p===truth[cut+i]).length:0;
  check(same(inner(best.fit.P,best.K),observed.slice(0,cut)),"training reencrypt");
  if(test)check(same(inner(test.P,best.K,best.fit.j),observed.slice(cut)),"holdout reencrypt");
  controls.push({name:target.name,outerCover:dec.cover,targetStart:off,train:cut,holdout:truth.length-cut,states:train.states.length,distinctKeys:keys.length,maximumStates:train.max,trueKey:rot,recoveredKey:best.K,keyExact:same(best.K,rot),trainMatches,testMatches,scoreGap:best.fit.score-runner,fullReplay:plain.length===truth.length&&same(inner(plain,best.K),observed)});
 }
 // Original: identity initialization is used only before the outer state has washed out.
 const wp=wordpos(words),dec=rotor(original,wp,alphabet,false),second=rotor(original,wp,alphabet.slice().reverse(),false);
 check(dec.cover===163&&same(dec.out.slice(163),second.out.slice(163)),"original all-symbol cover");
 check(same(rotor(dec.out,wp,alphabet,true).out,original),"original outer replay");
 const trainStart=corpus.pages.filter(p=>p.page<3).reduce((n,p)=>n+p.indices.length,0),testStart=corpus.pages.filter(p=>p.page<8).reduce((n,p)=>n+p.indices.length,0),end=corpus.pages.filter(p=>p.page<15).reduce((n,p)=>n+p.indices.length,0);
 check(trainStart===729&&testStart===1874&&end===3603,"frozen physical split");
 const single=singletons(words),relative=new Set([...single].filter(i=>i>=trainStart).map(i=>i-trainStart)),T=dec.out.slice(trainStart,testStart),H=dec.out.slice(testStart,end);
 const train=propagate(T,relative,allSupport,false),keys=expand(train.states),holdout=propagate(H,new Set(),allSupport,false,train.states),final=expand(holdout.states);
 const perKey=keys.map(k=>({K:k.K,trainPhases:k.phases,continuation:k.phases.map(j=>{const a=propagate(H,new Set(),allSupport,false,[{j,d:k.K.map(v=>1<<v)}]);return {phase:j,...stat(a),terminalPhases:a.states.map(x=>x.j)}})}));
 const singletonGate=propagate(T,relative,allSupport,true),nativeGate=propagate(T,relative,sourceSupport,true);
 check(keys.length===6&&final.length===1&&final[0].K.every(x=>x===0),"original exact key census");
 check(singletonGate.states.length===0&&nativeGate.states.length===0,"original support gate");
 const freq=Array(29).fill(0);for(const x of dec.out.slice(trainStart,end))freq[x]++;
 const ioc=freq.reduce((n,x)=>n+x*(x-1),0)/((end-trainStart)*(end-trainStart-1));
 return {source:{runes:original.length,words:words.length,outerCover:dec.cover,outerZeroCount:dec.out.filter(x=>!x).length,dictionary:dictionary.size},
  controls,original:{trainStart,testStart,end,train:stat(train),keys:perKey,holdout:stat(holdout),final,singletonGate:stat(singletonGate),nativeGate:stat(nativeGate),zeroKeyIoC:ioc,zeroKeyPrefix:dec.out.slice(trainStart,trainStart+120).map(x=>corpus.translit[x]).join(" "),outerReplay:true}};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
if(require.main===module){const d=inputs.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(experiment(JSON.parse(d[0]),JSON.parse(d[1]),d[2],JSON.parse(d[3]),d[4]),null,2));}
module.exports={experiment};
