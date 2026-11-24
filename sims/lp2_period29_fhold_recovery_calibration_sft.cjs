"use strict";
/** #2537: calibrate unknown period-29 GP29 additive key recovery with plaintext-F holds. */
const fs=require("node:fs"),path=require("node:path");
const readJson=p=>JSON.parse(fs.readFileSync(path.join(process.cwd(),p),"utf8"));
const readText=p=>fs.readFileSync(path.join(process.cwd(),p),"utf8");
const assert=(v,m)=>{if(!v)throw Error(m);};

const gp=readJson("resources/liber-primus/lp2-corpus.json");
const gold=readJson("resources/external/relikd-solved-gp29-native-v1.json");
const runeToIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const translit=gp.translit;
const tokens=translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(text){
 const out=[];
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error("unmapped token "+w);out.push(t.i);w=w.slice(t.s.length);}
 }
 return out;
}
const xorshift32=seed=>{let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};};
function trainUnigram(alpha=0.25){
 const counts=new Float64Array(29);let total=0;
 for(const section of gold.sections)for(const symbol of Array.from(section.source_text).filter(ch=>runeToIndex.has(ch)).map(ch=>runeToIndex.get(ch))){counts[symbol]++;total++;}
 return Array.from(counts,n=>Math.log((n+alpha)/(total+29*alpha)));
}
function decodeUnigram(C,key,logP){
 const period=key.length;let scores=new Float64Array(period).fill(-Infinity);scores[0]=0;
 const back=Array.from({length:C.length},()=>new Array(period).fill(null));
 for(let t=0;t<C.length;t++){
  const next=new Float64Array(period).fill(-Infinity),nextBack=new Array(period).fill(null),c=C[t];
  for(let phase=0;phase<period;phase++){
   if(!Number.isFinite(scores[phase]))continue;
   const update=(plain,np,hold)=>{const v=scores[phase]+logP[plain];if(v>next[np]){next[np]=v;nextBack[np]={phase,plain,hold};}};
   if(c===0)update(0,phase,true);
   const plain=(c-key[phase]+29)%29;
   if(plain!==0)update(plain,(phase+1)%period,false);
  }
  scores.set(next);back[t]=nextBack;
 }
 let phase=0,best=-Infinity;
 for(let j=0;j<period;j++)if(scores[j]>best){best=scores[j];phase=j;}
 const plaintext=new Array(C.length),phases=new Array(C.length),holds=new Array(C.length);
 for(let t=C.length-1;t>=0;t--){const step=back[t][phase];if(!step)return null;plaintext[t]=step.plain;phases[t]=step.phase;holds[t]=step.hold;phase=step.phase;}
 return{plaintext,phases,holds,score:best};
}
function refineKey(C,period,logP,initial,maxSweeps=25){
 const key=initial.slice();let decoded=null;
 for(let sweep=0;sweep<maxSweeps;sweep++){
  decoded=decodeUnigram(C,key,logP);if(!decoded)return null;let changed=false;
  for(let phase=0;phase<period;phase++){
   const samples=[];
   for(let i=0;i<C.length;i++)if(!decoded.holds[i]&&decoded.phases[i]===phase)samples.push(C[i]);
   if(!samples.length)continue;
   let bestKey=key[phase],bestScore=-Infinity;
   for(let candidate=0;candidate<29;candidate++){
    let score=0,legal=true;
    for(const c of samples){const p=(c-candidate+29)%29;if(p===0){legal=false;break;}score+=logP[p];}
    if(legal&&score>bestScore){bestScore=score;bestKey=candidate;}
   }
   if(bestKey!==key[phase]){key[phase]=bestKey;changed=true;}
  }
  if(!changed)break;
 }
 decoded=decodeUnigram(C,key,logP);
 return decoded?{key,decoded}:null;
}
function recoverKey(C,period,logP,seed,restarts){
 const random=xorshift32(seed),candidates=new Map();let validStarts=0;
 for(let trial=0;trial<restarts;trial++){
  const initial=Array.from({length:period},()=>Math.floor(random()*29));
  const result=refineKey(C,period,logP,initial);if(!result)continue;validStarts++;
  const id=result.key.join(",");
  if(!candidates.has(id))candidates.set(id,{key:result.key,score:result.decoded.score,basin:0});
  candidates.get(id).basin++;
 }
 const ranked=Array.from(candidates.values()).sort((a,b)=>b.score-a.score);
 return{validStarts,distinctCandidates:ranked.length,ranked,scoreGap:ranked.length>1?ranked[0].score-ranked[1].score:null};
}
function encrypt(P,key,initialPhase){
 const C=[],holds=[];let phase=initialPhase;
 for(const p of P){if(p===0){C.push(0);holds.push(true);}else{C.push((p+key[phase])%29);holds.push(false);phase=(phase+1)%key.length;}}
 return{C,holds,finalPhase:phase};
}
function bestRotation(recovered,actual){
 for(let shift=0;shift<actual.length;shift++){
  if(recovered.every((v,i)=>v===actual[(i+shift)%actual.length]))return shift;
 }
 return null;
}
function replay(P,key,initialPhase){
 const out=[];let phase=initialPhase;
 for(const p of P){if(p===0){out.push(0);}else{out.push((p+key[phase])%29);phase=(phase+1)%key.length;}}
 return out;
}
function plant(name,text,length,seed,restarts,logP){
 const P=native(text).slice(0,length);
 assert(P.length===length,name+" plant too short");
 const rng=xorshift32(seed),key=Array.from({length:29},()=>Math.floor(rng()*29)),initialPhase=Math.floor(rng()*29);
 const {C,holds}=encrypt(P,key,initialPhase);
 const search=recoverKey(C,29,logP,seed^0x9e3779b9,restarts);
 const top=search.ranked[0]||null,runner=search.ranked[1]||null;
 const rotation=top?bestRotation(top.key,key):null;
 const decoded=top?decodeUnigram(C,top.key,logP):null;
 const plaintextMatches=decoded?decoded.plaintext.reduce((n,x,i)=>n+(x===P[i]),0):0;
 const holdMatches=decoded?decoded.holds.reduce((n,x,i)=>n+(x===holds[i]),0):0;
 const forward=decoded?replay(decoded.plaintext,top.key,0):null;
 const forwardExact=forward?forward.every((x,i)=>x===C[i]):false;
 return{
  name,length:P.length,Fholds:holds.filter(Boolean).length,period:29,initialPhase,
  recoveredCandidates:search.distinctCandidates,validStarts:search.validStarts,
  topScore:top?.score??null,runnerUpScore:runner?.score??null,topRunnerGap:search.scoreGap,
  topBasin:top?.basin??0,topKey:top?.key??null,actualKey:key,
  exactKeyModuloRotation:rotation!==null,matchedRotation:rotation,expectedRotation:initialPhase,
  plaintextExact:plaintextMatches===P.length,plaintextMatchFraction:plaintextMatches/P.length,
  holdExact:holdMatches===P.length,holdMatchFraction:holdMatches/P.length,
  forwardReplayExact:forwardExact
 };
}
const logP=trainUnigram();
const sources=[
 {name:"Shakespeare-5000",file:"resources/control/shakespeare_first300k.txt",length:5000,seed:0x2901,restarts:240},
 {name:"Gibran-5000",file:"resources/control/gibran_prophet_58585.txt",length:5000,seed:0x2902,restarts:240},
 {name:"Emerson-2500",file:"resources/control/emerson_essays_2944.txt",length:2500,seed:0x2903,restarts:240},
 {name:"Shakespeare-308-short",file:"resources/control/shakespeare_first300k.txt",length:308,seed:0x2904,restarts:400}
];
const results=sources.map(s=>plant(s.name,readText(s.file),s.length,s.seed,s.restarts,logP));
const summary={
 period:29,
 model:"additive GP29; plaintext F transparent and key phase holds only at P=F; unigram GP29 model trained on solved LP1 corpus; coordinate-EM + Viterbi; random uniform 29-symbol keys",
 calibration:"independent English controls transliterated through GP29; random key and random initial phase; exact key compared modulo cyclic rotation",
 results,
 exactLongPlants:results.slice(0,3).filter(x=>x.exactKeyModuloRotation&&x.plaintextExact&&x.holdExact&&x.forwardReplayExact).length,
 longPlants:3,
 shortPlant:results[3]
};
console.log(JSON.stringify(summary,null,2));
