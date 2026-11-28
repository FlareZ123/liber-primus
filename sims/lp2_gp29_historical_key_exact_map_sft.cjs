"use strict";
/**
 * Exact first-order MAP check for the two historical LP1 key spellings named
 * in solved LP2 p57, under the distinct GP29 post-filter deletion sender.
 * Tests source-adjacent terminal p54-55 and opening p0-2 with fixed phase zero,
 * plus matched held-literary controls and deterministic unrelated same-period keys.
 */
const fs=require("node:fs"),path=require("node:path");
const {model,decode,sender,lcs}=require("./lp2_alt_periodic_exact_map_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const raw={
  gp:read("resources/liber-primus/lp2-corpus.json"),
  gibran:read("resources/control/gibran_prophet_58585.txt"),
  emerson:read("resources/control/emerson_essays_2944.txt"),
  shakespeare:read("resources/control/shakespeare_first300k.txt")
};
const m=model(raw,"delete"),gp=m.gp;
const keys={
  DIUINITY:[23,10,1,10,9,10,16,26],
  FIRFUMFERENFE:[0,10,4,0,1,19,0,18,4,18,9,0,18]
};
const scopes={
  opening:gp.pages.filter(p=>p.page>=0&&p.page<=2).flatMap(p=>p.indices),
  terminal:gp.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices)
};
function wrong(K){return K.map((v,i)=>(v+11+3*i)%29);}
function summarize(C,K){
  const z=decode(C,K,m);
  return {score:z.score,clock:z.clock,visited:z.visited,replay:z.replay,maxHiddenGap:z.maxHiddenGap};
}
function control(name,K,Cn,seed,offset){
  const P=m.tests.gibran.slice(offset),z=sender(P,K,m,Cn,seed),right=decode(z.C,K,m),wk=wrong(K),bad=decode(z.C,wk,m);
  return {
    printed:z.C.length,truthClock:z.events.at(-1).j,truthLength:z.full.length,
    right:{score:right.score,clock:right.clock,fullLCS:lcs(right.full,z.full),retainedLCS:lcs(right.retained,z.retained),replay:right.replay,maxHiddenGap:right.maxHiddenGap},
    wrong:{key:wk,score:bad.score,clock:bad.clock,fullLCS:lcs(bad.full,z.full),retainedLCS:lcs(bad.retained,z.retained),replay:bad.replay,maxHiddenGap:bad.maxHiddenGap}
  };
}
const out={schema:1,method:"exact first-order MAP, GP29 strict-repeat + independent deletion d=.187",phase:"fixed zero at scope start",results:{}};
for(const [name,K] of Object.entries(keys)){
  out.results[name]={key:K,wrongKey:wrong(K),original:{},controls:{}};
  for(const [scope,C] of Object.entries(scopes)){
    out.results[name].original[scope]={n:C.length,right:summarize(C,K),wrong:summarize(C,wrong(K))};
    out.results[name].controls[scope]=control(name,K,C.length,3301+K.length*100+(scope==="opening"?1:2),scope==="opening"?5000:9000);
  }
}
const s=JSON.stringify(out,null,2);
console.log(s);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"source-test-output.json"),s);
