"use strict";
const {recover,train,continueFrozen}=require("./lp2_fhold_cyclic_ngram_map.cjs");
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(inputs,mode="all"){
 const [gp,native,lp1,trans,lex]=[JSON.parse(inputs[0]),JSON.parse(inputs[1]),...inputs.slice(2)];
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const extract=s=>[...s].filter(x=>map.has(x)).map(x=>map.get(x));
 const seqs=native.sections.map(x=>extract(x.source_text)),q=13,split=208;
 const same=(a,b)=>String(a)===String(b),txt=p=>p.map(x=>gp.translit[x]).join("");
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const encode=(P,key)=>{let j=0;return P.map(x=>x===0?0:(x+key[j++%q])%29)};
 function displace(C){let out="",j=0;for(let i=0;i<C.length;i++){out+=gp.runes[C[i]];if(--j<=0){out+=" ";j=[2,5,3,7][i%4]}}return extract(out)}
 function buildLex(excluded){const d=new Set(),add=w=>{if(w.length>=2&&w.length<=20)d.add(String(w))};
  for(const l of lex.split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");
   function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):a==="IO"?alpha.get("IA"):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
  for(const [i,x] of native.sections.entries())if(i!==excluded)for(const w of x.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(extract(w));return d}
 function segment(P,d){const n=P.length,dp=new Float64Array(n+1).fill(-Infinity),back=new Int16Array(n+1);dp[0]=0;
  for(let i=0;i<n;i++){if(dp[i]-2>dp[i+1]){dp[i+1]=dp[i]-2;back[i+1]=1}for(let k=2;k<=20&&i+k<=n;k++)if(d.has(String(P.slice(i,i+k)))&&dp[i]+k-2>dp[i+k]){dp[i+k]=dp[i]+k-2;back[i+k]=k}}
  const words=[],breaks=[];let long=0;for(let i=n;i>0;){const k=back[i];if(i<n)breaks.push(i);words.push(txt(P.slice(i-k,i)));if(k>=4)long+=k;i-=k}return {text:words.reverse().join(" "),breaks:breaks.reverse(),longRunes:long}}
 function run(label,C,lm,dict,truth,key,printed){const src=displace(C);if(!same(C,src))throw Error("displacement changed symbols");const res=recover(src.slice(0,split),q,lm);const out={label,length:C.length,zeros:res.zeros,totalMasks:res.totalMasks,legalMasks:res.legalMasks,trigramMasks:res.trigramMasks,exhaustiveTrigram:res.exhaustiveTrigram,reason:res.reason};if(!res.ranked.length)return out;
  const best=res.ranked[0];out.key=best.key;out.mask=best.mask;out.prefixScore=best.score/split;out.runnerUpMaskGap=best.score-(res.ranked[1]?.score??best.score);out.candidates=res.ranked.map(x=>({key:x.key,mask:x.mask,score:x.score}));if(key)out.correctKey=same(key,best.key);if(truth)out.prefixMatches=best.p.filter((x,i)=>x===truth[i]).length;
  const preSeg=segment(best.p,dict);out.prefixSegmented=preSeg.text;out.prefixLongWordCoverage=preSeg.longRunes/split;if(printed){const a=new Set(printed.filter(x=>x<split)),b=new Set(preSeg.breaks),both=[...b].filter(x=>a.has(x)).length;out.prefixBoundaries={printed:a.size,inferred:b.size,intersection:both,precision:both/b.size,recall:both/a.size}}
  const pred=continueFrozen(src,split,best.key,lm);out.predict={...pred,prefix:undefined,suffix:undefined};if(!pred.legal)return out;
  const P=pred.prefix.concat(pred.suffix),seg=segment(P,dict);out.plaintext=txt(P);out.segmented=seg.text;out.longWordCoverage=seg.longRunes/P.length;out.heldScore=pred.conditionalLogEvidence/(C.length-split);if(truth){out.heldMatches=pred.suffix.filter((x,i)=>x===truth[split+i]).length;out.fullMatches=P.filter((x,i)=>x===truth[i]).length}
  if(printed){const a=new Set(printed),b=new Set(seg.breaks),both=[...b].filter(x=>a.has(x)).length;out.boundaries={printed:a.size,inferred:b.size,intersection:both,precision:both/b.size,recall:both/a.size}}
  return out}
 const ctrl=(i,seed)=>{const rand=rng(seed),key=Array.from({length:q},()=>rand()%29),P=seqs[i].slice(0,308);return run("plant:"+native.sections[i].name,encode(P,key),train(seqs.filter((_,j)=>j!==i)),buildLex(i),P,key)};
 if(mode==="controls"||mode==="all"){const C=extract(lp1.split("$")[5]);const koan=run("authentic KOAN2",C,train(seqs.filter((_,j)=>j!==5)),buildLex(5),seqs[5],[0,10,4,0,1,19,0,18,4,18,9,0,18]);const controls=[koan,ctrl(1,0x25480001),ctrl(3,0x25480002)];if(mode==="controls")return controls;if(!(koan.correctKey&&koan.heldMatches===111&&controls[2].correctKey&&controls[2].heldMatches===100))throw Error("positive controls failed")}
 const C=gp.pages.slice(54,56).flatMap(x=>x.indices);if(C.length!==308)throw Error("target length");
 const orig=trans.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g).slice(0,2896).slice(-66).map(extract);if(!same(orig.flat(),C))throw Error("original alignment");
 const breaks=[];let t=0;for(const w of orig.slice(0,-1)){t+=w.length;breaks.push(t)}
 const lm=train(seqs),dict=buildLex(-1);
 const target=run("p54-55",C,lm,dict,null,null,breaks);
 const nulls=[];for(let j=0;j<3;j++){const rand=rng(0x2548f000+j),shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const k=rand()%(i+1);[a[i],a[k]]=[a[k],a[i]]}return a};nulls.push(run("matched null "+j,shuffle(C.slice(0,split)).concat(shuffle(C.slice(split))),lm,dict))}
 return {target,nulls};
}
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]||"all"),null,2));
