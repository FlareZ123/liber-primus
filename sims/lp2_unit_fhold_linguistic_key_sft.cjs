"use strict";
// Independent key-language prior and frozen original p54–55 test.
const fs=require("node:fs");
const {experiment,paths}=require("./lp2_gp_prime_weighted_latent_clock_sft.cjs");
const inputs=paths.map(p=>fs.readFileSync(p,"utf8"));
const common={
 clock:"unit",
 keyCorpus:fs.readFileSync("resources/control/shakespeare_first300k.txt","utf8"),
 cipherText:fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8"),
 forbiddenKeyWords:["DIUINITY","FIRFUMFERENFE","CIRCUMFERENCE","MOUNTAIN","MISUNDERSTAND","INDEPENDENTLY","NOTEBOOK"],
 controlsOnly:true
};
const cases8=[{type:"actual",ex:1,keyWord:"DIUINITY"},{type:"random",ex:3,seed:827364},{type:"linguistic",ex:4,keyWord:"MOUNTAIN"}];
const cases13=[{type:"actual",ex:5,keyWord:"FIRFUMFERENFE"},{type:"random",ex:4,seed:834112},{type:"linguistic",ex:3,keyWord:"MISUNDERSTAND"},{type:"linguistic",ex:1,keyWord:"INDEPENDENTLY"}];
const a=experiment(...inputs,{...common,period:8,tests:cases8});
const b=experiment(...inputs,{...common,period:13,chapter:"p54-55",tests:cases13});
const gate=a.controls.concat(b.controls).every(x=>x.rank===1&&x.phaseExact&&x.prefixReplay&&x.holdout?.replay&&x.holdout.match===x.holdout.total&&x.prefixMatch===x.split);
const original=gate?experiment(...inputs,{...common,period:13,chapter:"p54-55",tests:[],controlsOnly:false}).original:null;
console.log(JSON.stringify({period8:a.controls,period13:b.controls,gate,original},null,2));
