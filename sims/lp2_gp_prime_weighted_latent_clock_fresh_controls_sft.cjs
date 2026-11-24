"use strict";
const fs=require("node:fs");
const {experiment,paths}=require("./lp2_gp_prime_weighted_latent_clock_sft.cjs");
console.log(JSON.stringify(experiment(...paths.map(p=>fs.readFileSync(p,"utf8")),{sections:[1,3,4,5],seedBase:67890,controlsOnly:true}),null,2));
