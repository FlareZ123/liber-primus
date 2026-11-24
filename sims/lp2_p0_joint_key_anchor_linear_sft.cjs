"use strict";
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process"),assert=require("node:assert/strict");
const {experiment}=require("./lp2_p0_red8_red5_unknown_layer_sft.cjs");
const root=path.resolve(__dirname,"..","resources"),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const base=experiment(read("liber-primus/lp2-corpus.json"),read("liber-primus/lp2-transcription.txt"),read("control/english_wordfreq_textblob.txt"),()=>{});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-joint-linear-")),exe=path.join(temp,process.platform==="win32"?"linear.exe":"linear");
const mod=x=>(x+29)%29,keystr=k=>k.map(x=>x.toString(29)).join("");
function run(cmd,args){const x=cp.spawnSync(cmd,args,{encoding:"utf8",maxBuffer:64*1024*1024});if(x.error)throw x.error;if(x.status!==0)throw Error(cmd+" failed: "+x.stderr);return x}
function scan(words,L,I){
 const body=path.join(temp,"body.txt"),dict=path.join(temp,"dict.txt");
 fs.writeFileSync(body,words.map(keystr).join(" "));fs.writeFileSync(dict,base.dict.map(keystr).join("\n")+"\n");
 const x=run(exe,[body,dict,String(L),String(I),"run"]);console.log(x.stderr.trim().split("\n").at(-1));return x.stdout.trim().split("\n").filter(Boolean);
}
try{
 run(process.env.CXX||"g++",["-O3","-std=c++17",path.join(__dirname,"lp2_p0_joint_key_anchor_linear.cpp"),"-o",exe]);
 for(const I of [5,8])for(const L of [12,13,14]){const a=scan(base.body,L,I);assert.equal(a.length,I===8&&L===12?1:0);for(const x of a)console.log(x)}
 const ks8=[[15,8,18,3,6,19,27,0],[4,19,2,0,28,13,8,1],[23,4,11,7,17,22,0,9]],ks5=[[15,26,18,21,5],[0,0,3,12,19],[5,12,13,17,26]];
 for(const I of [5,8])for(let j=0;j<3;j++){
  const k=I===5?ks5[j]:ks8[j],l=I===5?ks8[j]:ks5[j],offset=base.ctrl.slice(0,13).flat().length;
  let a=0,b=0,i=0,K,L;
  const C=base.ctrl.map(w=>w.map(p=>{if(i++===offset){K=k.slice(a).concat(k.slice(0,a));L=l.slice(b).concat(l.slice(0,b))}if(!p)return 0;const q=mod(p+k[a]);a=(a+1)%k.length;if(!q)return 0;const x=mod(q+l[b]);b=(b+1)%l.length;return x}));
  const candidates=scan(C,14,I),s="SURVIVOR "+offset+" 0 "+keystr(K)+" "+keystr(L)+" "+keystr(base.ctrl[13]);assert(candidates.includes(s));console.log("PASS planted pair admitted",s);
 }
}finally{fs.rmSync(temp,{recursive:true,force:true})}
