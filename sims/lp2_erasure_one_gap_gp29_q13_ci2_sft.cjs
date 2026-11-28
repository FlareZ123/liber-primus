// GP29 q13 one-gap retained-draw anchor original shard 2.
"use strict";
const fs=require("node:fs"), path=require("node:path");
const {oneGapExperiment}=require("./lp2_erasure_one_gap_draw_anchor_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const started=Date.now();
const result=oneGapExperiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"),{N:29,q:13,ci:2,mode:"original",plants:0});
result.elapsedMs=Date.now()-started;
const out=path.join(process.env.RUNNER_TEMP||root,"source-test-output.json");
fs.writeFileSync(out,JSON.stringify(result,null,2));
console.log(JSON.stringify({ci:2,elapsedMs:result.elapsedMs,original:result.original.map(x=>({ci:x.ci,L:x.L,m:x.m,seeds:x.seeds,keys:x.keys,passes:x.passes,replays:x.replays,hits:x.hits.length}))},null,2));
