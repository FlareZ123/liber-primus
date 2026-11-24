"use strict";
/** Rebuild and rerun #2608; Node22 and g++ required. */
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process"),assert=require("node:assert/strict");
const refine=require("./lp2_two_history_fhold_refine.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),donor=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),raw=read("resources/control/shakespeare_first300k.txt");
const ix=new Map(gp.runes.map((r,i)=>[r,i])),S=donor.sections.map(s=>[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c)));
const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length)}}return out}
const train=native(raw).concat(...[0,2,7,8].map(i=>S[i])),counts=Array(29).fill(0);
for(const v of train)counts[v]++;
assert.equal(train.length,217627);
const mod=x=>(x%29+29)%29;
function enc(P,key,h){const [a,b,d,u]=key;let [x1,x2,c1,c2]=h;return P.map(p=>{if(!p)return 0;const x=u*p%29,c=mod(x+a*(x1+x2)+b*(c1+c2)+d);x2=x1;x1=x;c2=c1;c1=c;return c})}
const fnv=A=>A.reduce((h,x)=>Math.imul(h^x,16777619)>>>0,2166136261);
const P1=enc(S[1].concat(S[3]),[4,21,11,19],[9,13,11,8]),P2=enc(S[4].concat(S[5],S[6]),[24,7,20,3],[6,25,20,5]);
const original=gp.pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices);
assert.deepEqual([fnv(P1),fnv(P2),fnv(original.slice(0,600))],[3886556647,3087354484,3426276579]);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-two-history-")),exe=path.join(dir,process.platform==="win32"?"rank.exe":"rank"),countPath=path.join(dir,"counts.txt");
fs.writeFileSync(countPath,counts.join(" ")+"\n");
try{
 cp.execFileSync("g++",["-O3","-march=native","-std=c++17",path.join(__dirname,"lp2_two_history_fhold_rank.cpp"),"-o",exe],{stdio:"inherit"});
 function rank(C,name){const input=path.join(dir,name+".txt");fs.writeFileSync(input,C.slice(0,600).map(x=>x.toString(36)).join("")+"\n");
 const rows=[];for(const [lo,hi] of [[0,15],[15,29]]){const lines=cp.execFileSync(exe,[input,countPath,String(lo),String(hi)],{encoding:"utf8"}).trim().split(/\r?\n/);console.log(name,lines.shift());rows.push(...lines.map(line=>line.split(" ").map(Number)))}
 rows.sort((a,b)=>{for(let i=0;i<5;i++)if(a[i]!==b[i])return b[i]-a[i];return 0});return rows.slice(0,128).map(r=>r.slice(1).map(x=>x.toString(36)).join("")).join("");}
 const rankEnc=[rank(P1,"plant1"),rank(P2,"plant2")];
 const controls=refine(gp,donor,raw,rankEnc);
 for(const c of controls.control){assert.equal(c.trueKeyRank,1);assert.equal(c.trueTrigramRank,1);assert.equal(c.prefixCorrect,600);assert.equal(c.suffixCorrect,c.n-600);assert(c.replay);}
 console.log("Controls pass; original rank starts.");
 const originalRank=rank(original,"original"),result=refine(gp,donor,raw,rankEnc,originalRank,true);
 console.log(JSON.stringify({rankEnc,originalRank,result},null,2));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
