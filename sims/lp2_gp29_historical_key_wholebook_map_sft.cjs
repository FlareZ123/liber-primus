"use strict";
/** Whole-book all-phase p57-named historical-key GP29 deletion MAP gate. */
const fs=require("node:fs"),path=require("node:path");
const {model,decode,sender}=require("./lp2_alt_periodic_exact_map_sft.cjs");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
const m=model(raw,"delete"),C=m.gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
if(C.length!==12956)throw Error("bad whole-book length");
const keys={DIUINITY:[23,10,1,10,9,10,16,26],FIRFUMFERENFE:[0,10,4,0,1,19,0,18,4,18,9,0,18]};
const rot=(a,r)=>a.slice(r).concat(a.slice(0,r));
function scan(C,K){const rows=[];for(let r=0;r<K.length;r++){const z=decode(C,rot(K,r),m);rows.push({rotation:r,score:z.score,clock:z.clock,maxHiddenGap:z.maxHiddenGap,replay:z.replay});}rows.sort((a,b)=>b.score-a.score);return {best:rows[0],phase0:rows.find(x=>x.rotation===0),all:rows};}
const out={schema:1,method:"whole p0-p55 all cyclic phases, exact GP29 strict-repeat + deletion MAP D=.187",n:C.length,results:{}};
for(const [name,K] of Object.entries(keys)){
  const plant=sender(m.tests.gibran.slice(0),K,m,C.length,3301+K.length);
  out.results[name]={key:K,original:scan(C,K),control:{truthClock:plant.events.at(-1).j,truthLength:plant.full.length,scan:scan(plant.C,K)}};
}
const s=JSON.stringify(out,null,2);console.log(s);if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"source-test-output.json"),s);
