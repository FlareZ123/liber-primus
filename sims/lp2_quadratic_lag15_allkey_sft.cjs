"use strict";
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const native=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const C=gp.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices);
const ix=new Map(gp.runes.map((c,i)=>[c,i]));
const N=native.sections.flatMap(s=>[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c)));
const hash=a=>a.reduce((h,v)=>BigInt.asUintN(64,(h^BigInt(v))*1099511628211n),14695981039346656037n).toString(16);
assert.equal(C.length,1021);assert.equal(N.length,2979);
assert.equal(hash(C),"b7c5e1f8758c70d8");assert.equal(hash(N),"fc20de89018c27f3");
assert.deepEqual(gp.pages.filter(p=>p.page>=23&&p.page<=26).map(p=>p.indices.length),[213,270,273,265]);
const exe=process.argv[2];if(!exe)throw Error("Supply compiled lp2_quadratic_lag15_allkey executable");
const input=[C,N].map(a=>a.map(x=>x.toString(29)).join("")).join("\n")+"\n";
for(const mode of ["plant1","plant2","original","full"]){
 const p=spawnSync(path.resolve(exe),[mode],{input,encoding:"utf8",timeout:180000});
 if(p.error)throw p.error;
 assert.equal(p.status,0,p.stderr);process.stdout.write(p.stdout);
 if(mode.startsWith("plant"))assert.match(p.stdout,/exact_training=751\/751 exact_holdout=265\/265/);
 if(mode==="original")assert.match(p.stdout,/train_pairs=10642 ties=1 .*hold_pairs=1257/);
 if(mode==="full")assert.match(p.stdout,/original_full_allkey_pairs=18854 ties=1/);
}
