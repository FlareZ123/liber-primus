"use strict";
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const C=corpus.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.indices);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-fhold-"));
const tape=path.join(temp,"tape.txt"),exe=path.join(temp,"fhold"+(process.platform==="win32"?".exe":""));
fs.writeFileSync(tape,C.map(x=>x.toString(29)).join("")+"\n");
const compiler=process.env.CXX||"g++";
cp.execFileSync(compiler,["-std=c++17","-O3","-pthread",path.join(__dirname,"lp2_fhold_parallel.cpp"),"-o",exe],{stdio:"inherit"});
const qs=process.argv.slice(2).map(Number);for(const q of qs.length?qs:[9,10,11,12,13]){
 const output=path.join(temp,"q"+q+"-keys.txt");
 const result=cp.execFileSync(exe,[tape,String(q),String(Math.min(5,os.availableParallelism())),output],{encoding:"utf8",stdio:["ignore","pipe","inherit"]});
 console.log(result.trim());console.error("Complete legal keys:",output);
}
