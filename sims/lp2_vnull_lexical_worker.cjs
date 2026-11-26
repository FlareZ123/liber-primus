"use strict";
const fs=require("node:fs"),path=require("node:path"),readline=require("node:readline");
const {makeDecoder,paths}=require("./lp2_vnull_lexical_posterior_sft.cjs");
const root=path.resolve(__dirname,"..");
const receiver=makeDecoder(paths.slice(0,3).map(p=>fs.readFileSync(path.join(root,p),"utf8")),"checker",true);
const io=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
io.on("line",line=>{
 const {C,K,sign}=JSON.parse(line);
 const d=receiver.decode(C,K,null,sign);
 console.log(JSON.stringify(d));
});
