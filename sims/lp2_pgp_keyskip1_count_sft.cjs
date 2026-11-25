"use strict";
const fs=require("node:fs");
const read=p=>fs.readFileSync(p,"utf8");
const {mt}=require("./lp2_r18_skipcount_feasibility_sft.cjs");
const {convert,model}=require("./lp2_perl_pgp_keyskip1_sft.cjs");
const {beam}=require("./lp2_keyskip1_trigram_beam_sft.cjs");
const {plant}=require("./lp2_keyskip1_rejection_marginal_sft.cjs");
function prepare(corpus,gibran,emerson,shakespeare,prior){
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const L=model([convert(gibran,corpus.translit),convert(emerson,corpus.translit)]);
 const P=convert(shakespeare,corpus.translit).slice(0,C.length),seed=0x31415926;
 const E=plant(P,mt(seed,4*C.length+16),seed^0x12345678);
 const groups={candidates:prior.candidates.map(({rank,seed,variant})=>({rank,seed,variant})),null:prior.nulls.map(({seed})=>({seed})),plantnull:prior.nulls.map(({seed})=>({seed}))};
 return {C,L,P,E,groups};
}
function run(prepared,group,start,end){
 const C=group==="plantnull"?prepared.E.C:prepared.C;
 return prepared.groups[group].slice(start,end).map(row=>{
  const K=mt(row.seed,4*C.length+16);
  const b=beam(C,K,prepared.L,{width:64,hold:512,maxSkip:3,trace:true});
  let last=0;const packed=b.path.map(([i,k])=>{const v=(i-last)*4+k;last=i;return v.toString(36)}).join(".");
  return {...row,score:b.score,skips:b.skips,prefixScore:b.prefixScore,prefixSkips:b.prefixSkips,holdScore:b.holdScore,packed};
 });
}
function unpack(packed){let i=0;return packed?packed.split(".").map(x=>{const v=parseInt(x,36);i+=Math.floor(v/4);return [i,v%4]}):[]}
function recover(C,seed,packed){const K=mt(seed,4*C.length+16),path=unpack(packed);let t=0,j=0;return C.map((c,i)=>{const k=t<path.length&&path[t][0]===i?path[t++][1]:0;if(i)j+=1+k;const p=(c+29-K[j])%29;for(let q=1;q<=k;q++)if((p+K[j-q])%29!==C[i-1])throw Error("invalid path");return p})}
module.exports={prepare,run,unpack,recover};
if(require.main===module){const a=prepare(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt"),read("resources/control/shakespeare_first300k.txt"),JSON.parse(read("im-results/lp2-keyskip1-rejection-marginal-output.json")));const [g="candidates",s="0",e="40"]=process.argv.slice(2);console.log(JSON.stringify(run(a,g,+s,+e),null,2))}
