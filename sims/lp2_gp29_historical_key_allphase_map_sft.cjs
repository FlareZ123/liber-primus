"use strict";
/** Scan every cyclic phase of p57-named LP1 keys in the exact GP29 deletion MAP. */
const fs=require("node:fs"),path=require("node:path");
const {model,decode,sender}=require("./lp2_alt_periodic_exact_map_sft.cjs");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
const m=model(raw,"delete"),gp=m.gp;
const keys={DIUINITY:[23,10,1,10,9,10,16,26],FIRFUMFERENFE:[0,10,4,0,1,19,0,18,4,18,9,0,18]};
const scopes={opening:gp.pages.filter(p=>p.page<=2).flatMap(p=>p.indices),terminal:gp.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices)};
const rot=(a,r)=>a.slice(r).concat(a.slice(0,r));
function scan(C,K){
  const rows=[];
  for(let r=0;r<K.length;r++){const z=decode(C,rot(K,r),m);rows.push({rotation:r,score:z.score,clock:z.clock,maxHiddenGap:z.maxHiddenGap,replay:z.replay});}
  rows.sort((a,b)=>b.score-a.score);return {best:rows[0],phase0:rows.find(x=>x.rotation===0),all:rows};
}
function plant(K,n,seed,offset){const z=sender(m.tests.gibran.slice(offset),K,m,n,seed);return {truthClock:z.events.at(-1).j,truthLength:z.full.length,scan:scan(z.C,K)};}
const out={schema:1,method:"all cyclic rotations of source-named LP1 keys under exact GP29 strict-repeat + deletion MAP",results:{}};
for(const [name,K] of Object.entries(keys)){
  out.results[name]={key:K,original:{},controls:{}};
  for(const [scope,C] of Object.entries(scopes)){
    out.results[name].original[scope]={n:C.length,...scan(C,K)};
    out.results[name].controls[scope]=plant(K,C.length,761+K.length*100+(scope==="opening"?1:2),scope==="opening"?11000:15000);
  }
}
const s=JSON.stringify(out,null,2);console.log(s);if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"source-test-output.json"),s);
