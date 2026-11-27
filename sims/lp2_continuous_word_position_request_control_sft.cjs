'use strict';
const fs=require('node:fs'),path=require('node:path');
const {study,paths}=require('./lp2_p15_gap_stride_word_position_fhold_sft.cjs');
/** Independent supplied-clock blind API calibration, not an LP2 key candidate. */
function control(data,receiver=study){
  const c=JSON.parse(data[0]),toks=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const encWord=w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=toks.find(x=>w.startsWith(t.s,i));if(!t)return null;out.push(t.i);i+=t.s.length}}return out};
  const ws=(data[6].toUpperCase().match(/[A-Z]+/g)||[]).map(encWord).filter(x=>x?.length);
  const PWords=ws.slice(1100,1532),P=PWords.flat(),N=P.length;
  const K=Array.from({length:N},(_,i)=>((Math.imul(i+1,2654435761)>>>0)%29));
  let seed=0xb721ad33;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
  const perm=fix=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>(fix?1:0);i--){const lo=fix?1:0,j=lo+Math.floor(rand()*(i-lo+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const A=perm(true),B=perm(false),I=Array(29);B.forEach((x,i)=>I[x]=i);
  let j=0;const CWords=PWords.map(w=>w.map(x=>x===0?0:I[(A[x]+K[j++])%29]));
  const out=receiver(data,{CWords,K,fitWords:330,seed:0x619a32fe}),best=out.result.best;
  if(!best)throw Error("no legal key");
  const check={fit:best.P.slice(0,out.cut).filter((v,i)=>v===P[i]).length,held:best.P.slice(out.cut).filter((v,i)=>v===P[out.cut+i]).length,fitN:out.cut,heldN:N-out.cut,replay:best.replay,legal:out.result.records.filter(x=>x.ll!==null).length,total:out.result.records.length};
  if(check.fit<.9*check.fitN||check.held<.9*check.heldN||!check.replay)throw Error("control recovery failed");
  return {N,wordRange:[1100,1532],schedule:"((Math.imul(i+1,2654435761)>>>0)%29)",keySeed:"0xb721ad33",fitSeed:"0x619a32fe",fitWords:330,check,result:out};
}
if(require.main===module)console.log(JSON.stringify(control(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={control};
