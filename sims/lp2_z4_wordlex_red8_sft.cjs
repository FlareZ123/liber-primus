"use strict";
const fs=require("node:fs");
const {experiment,paths}=require("./lp2_z4_wordlex_inverse_sft.cjs");
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),{keys:["p54 red8"]}),null,2));
