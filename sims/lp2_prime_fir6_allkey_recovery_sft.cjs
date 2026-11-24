// Reproduce the ordinary prime-forced six-tap recovery and its independent native control.
// Requires Node.js and a C++17 compiler with OpenMP (g++, including MinGW-w64).
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const idx=new Map(c.runes.map((r,i)=>[r,i]));
const orig=c.pages.slice(23,27).flatMap(p=>p.indices);
const donor=native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).flatMap(w=>[...w].map(r=>idx.get(r))));
const fp=x=>x.reduce((s,v,i)=>(s+(i+1)*v)%1000000007,0);
assert.equal(orig.length,1021);assert.equal(donor.length,2979);
assert.equal(fp(orig),7322417);assert.equal(fp(donor),55392254);
const chars="0123456789abcdefghijklmnopqrs";
const encode=x=>x.map(v=>chars[v]).join("");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-prime-fir6-"));
try {
  const exe=path.join(tmp,process.platform==="win32"?"fir6.exe":"fir6");
  execFileSync(process.env.CXX||"g++",["-O3","-std=c++17","-fopenmp",path.join(__dirname,"lp2_prime_fir6_allkey_recovery.cpp"),"-o",exe],{stdio:"inherit"});
  const log=execFileSync(exe,[],{input:encode(orig)+"\n"+encode(donor)+"\n",encoding:"utf8"});
  process.stdout.write(log);
  assert.ok(log.includes("plant train_pairs=16917"));
  assert.ok(log.includes("key=7,19,7,24,16,12,13,4"));
  assert.ok(log.includes("exact_training=751/751 exact_holdout=265/265"));
  assert.ok(log.includes("original train_pairs="));
  assert.ok(log.includes("native_min"));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
