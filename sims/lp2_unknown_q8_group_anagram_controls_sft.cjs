"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {files,run}=require("./lp2_unknown_q8_group_anagram_exact_sft.cjs");
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
for(const seed of [2710,2711]){
 const r=run(raw,String(seed));
 assert(r.plant.matched,"hidden key absent from fit candidates");
 console.log(JSON.stringify(r));
}
