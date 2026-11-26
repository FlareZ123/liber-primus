"use strict";
// Reproduce Agent 6's staged semantic-A3 start search.
const fs=require("node:fs"),path=require("node:path");
const solve=require("./lp2_semantic_a3_latent_receiver_sft.cjs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const raw=paths.map(read),variants=JSON.parse(read("resources/derived/dukotah-r38-r39-lp1-semantic-keys.json")).variants;
const groups=Object.keys(variants).flatMap(v=>[-1,1].map(sign=>({v,sign})));
const plant=[1,123,"B-R28",371,-1,100,0x6113002];
const common={noControls:true,noHeld:true};
function screen(opts){
 const out=[];
 for(const {v,sign} of groups){
  const r=solve(raw,variants,{...common,...opts,screen:true,N:24,width:24,configs:Array.from({length:726},(_,s)=>({v,sign,s}))});
  out.push(...r.results);
 }
 return out.sort((a,b)=>b.score-a.score);
}
const controlScreen=screen({plant});
const controlCandidates=[["B-R28",-1,371],["L-R29",-1,358],["L-R28",-1,358],["B-R28",-1,515],["B-R28",-1,183],["B-D29",-1,469],["A-R29",-1,7],["L-R29",-1,262],["L-R28",-1,262],["A-R28",-1,71],["B-R29",-1,544],["B-D29",-1,652],["L-R29",-1,143],["L-R28",-1,143],["A-D29",-1,529],["B-R29",-1,368]].map(([v,sign,s])=>({v,sign,s}));
const control=solve(raw,variants,{...common,plant,N:80,width:500,configs:controlCandidates});
const originalScreen=screen({page:0});
const finalists=groups.flatMap(({v,sign})=>originalScreen.filter(x=>x.v===v&&x.sign===sign).slice(0,5).map(({v,sign,s})=>({v,sign,s})));
const original=solve(raw,variants,{...common,page:0,N:80,width:500,configs:finalists});
console.log(JSON.stringify({controlRank:1+controlScreen.findIndex(x=>x.v===plant[2]&&x.s===plant[3]&&x.sign===plant[4]),controlScreen,control,originalScreen,original},null,2));
