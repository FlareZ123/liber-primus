"use strict";
const fs=require("node:fs"),path=require("node:path"),api=require("./lp2_fhold_cyclic_ngram_map.cjs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/liber_primus_master.txt","resources/external/relikd-solved-gp29-native-v1.json"],raw=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const g=JSON.parse(raw[0]),idx=new Map(g.runes.map((v,i)=>[v,i])),read=s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x)),chunks=raw[1].split("%"),lines=[54,55].flatMap(p=>chunks[p+16].split("/").map(read).filter(x=>x.length)),native=JSON.parse(raw[2]).sections.map(s=>read(s.source_text)),lm=api.train(native);
if(lines.length!==15||lines.flat().join()!==g.pages.slice(54,56).flatMap(x=>x.indices).join())throw Error("source mismatch");
const results=[];for(let parity=0;parity<2;parity++){const C=lines.flatMap((x,i)=>i%2===parity?x.slice().reverse():x);for(const q of [8,13]){const r=api.recover(C.slice(0,232),q,lm,{maxZeros:10,exactIfZeros:10});const t=r.ranked[0],cont=t?api.continueFrozen(C,232,t.key,lm):null;results.push({parity,q,zeros:r.zeros,legalMasks:r.legalMasks,exhaustive:r.exhaustiveTrigram,fit:t,cont,fitNLL:t?-t.score/232:null,suffixNLL:cont?.legal?-cont.suffixMap/76:null})}}
console.log(JSON.stringify(results,null,2));
