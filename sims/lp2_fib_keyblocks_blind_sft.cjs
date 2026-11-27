"use strict";
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const native=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
const tapes=[corpus.pages.slice(15,23).flatMap(p=>p.indices).slice(20),...native.sections.map(s=>[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0))];
const lines=tapes.map(a=>a.map(x=>String.fromCharCode(x+65)).join(""));
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16);}
const expected=["41e53c83","538c0b28","70f2f985","453b40cc","66422e2d","92acbe33","67a9eac5","7f1e5490","767a1a5d","fb59fff1"];
if(JSON.stringify(lines.map(fnv))!==JSON.stringify(expected))throw Error("source tape mismatch");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-fib-keyblocks-"));
try{
 const input=path.join(tmp,"input.txt"),bin=path.join(tmp,process.platform==="win32"?"receiver.exe":"receiver");
 fs.writeFileSync(input,lines.join("\n")+"\n");
 const build=cp.spawnSync(process.env.CXX||"g++",["-O3","-std=c++17","sims/lp2_fib_keyblocks_blind.cpp","-o",bin],{stdio:"inherit"});
 if(build.status!==0)throw Error("compile failed");
 for(const [width,rerank] of [[1024,256],[4096,1024]]){
  const run=cp.spawnSync(bin,[input,String(width),String(rerank),"all"],{stdio:"inherit"});
  if(run.status!==0)throw Error("receiver failed");
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
