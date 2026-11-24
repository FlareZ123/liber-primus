"use strict";
const {train,fixedMask,factors,optimize,plainFor,scorePlain,continueFrozen}=require("./lp2_fhold_cyclic_ngram_map.cjs");
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
function experiment(inputs,mode="target",first=1,last=28){
 const [gp,native]=inputs.slice(0,2).map(JSON.parse),map=new Map(gp.runes.map((x,i)=>[x,i])),extract=s=>[...s].filter(x=>map.has(x)).map(x=>map.get(x)),seqs=native.sections.map(x=>extract(x.source_text)),q=13,split=208;
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const encode=(P,key,a)=>{let j=0;return P.map(x=>x===0?0:(a*x+key[j++%q])%29)};
 let C,lm,truth,actualKey,actualSlope,label;
 if(mode==="authentic"){C=extract(inputs[2].split("$")[5]);truth=seqs[5];actualKey=[0,10,4,0,1,19,0,18,4,18,9,0,18];actualSlope=1;lm=train(seqs.filter((_,i)=>i!==5));label="authentic KOAN2"}
 else if(mode==="plant"){truth=seqs[5].slice(0,308);actualSlope=17;const rand=rng(0x25540017);actualKey=Array.from({length:q},()=>rand()%29);C=encode(truth,actualKey,actualSlope);lm=train(seqs.filter((_,i)=>i!==5));label="KOAN2 independent affine plant"}
 else{C=gp.pages.slice(54,56).flatMap(x=>x.indices);if(C.length!==308)throw Error("original source");lm=train(seqs);label="original p54–55"}
 const pre=C.slice(0,split),z=pre.filter(x=>!x).length;if(z>8)throw Error("declared mask cap");const states=Array.from({length:2**z},(_,mask)=>({mask,state:fixedMask(pre,q,mask)})).filter(x=>x.state);
 const rows=[];for(let a=first;a<=last;a++){let best=null,second=null;for(const {mask,state} of states){const res=optimize(state,factors(pre,q,state,lm,3,a),3);const P=plainFor(pre,state,res.key,a);if(Math.abs(scorePlain(P,lm,3)-res.score)>1e-6)throw Error("factor mismatch");const x={a,mask,key:res.key,score:res.score,prefixMatches:truth?P.filter((v,i)=>v===truth[i]).length:undefined};if(!best||x.score>best.score){second=best;best=x}else if(!second||x.score>second.score)second=x}const pred=continueFrozen(C,split,best.key,lm,a);rows.push({...best,runnerUpMaskGap:second?best.score-second.score:null,correctSlope:actualSlope===undefined?undefined:actualSlope===a,correctKey:actualKey?String(actualKey)===String(best.key):undefined,prediction:{...pred,prefix:undefined,suffix:undefined,suffixText:pred.legal?pred.suffix.map(v=>gp.translit[v]).join(""):undefined,heldMatches:pred.legal&&truth?pred.suffix.filter((v,i)=>v===truth[split+i]).length:undefined}})}
 return {label,length:C.length,split,zeros:z,legalMasks:states.length,first,last,rows};
}
if(require.main===module){const root=path.resolve(__dirname,"..");console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(root,p),"utf8")),process.argv[2]||"target",Number(process.argv[3]||1),Number(process.argv[4]||28)),null,2))}
module.exports={experiment,files};
