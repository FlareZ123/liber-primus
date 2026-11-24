// Reproduce exact phase-private six-tap recovery on the original and two native controls.
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
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-phase5-fir6-"));
try {
  const exe=path.join(tmp,process.platform==="win32"?"fir6.exe":"fir6");
  execFileSync(process.env.CXX||"g++",["-O3","-std=c++17","-fopenmp",path.join(__dirname,"lp2_phase5_fir6_allkey_recovery.cpp"),"-o",exe],{stdio:"inherit"});
  const log=execFileSync(exe,[],{input:encode(orig)+"\n"+encode(donor)+"\n",encoding:"utf8"});
  process.stdout.write(log);
  for(const s of ["plant1 train_pairs=3459","exact_phase_keys=4/5 exact_training=608/751 exact_holdout=214/265","plant2 train_pairs=3497","exact_phase_keys=5/5 exact_training=751/751 exact_holdout=265/265","original train_pairs=2800","holdout_pairs=231","full_max_pairs=4669","min_pairs=6034"])assert.ok(log.includes(s),s);
  const tokens=c.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),dict=new Set();
  for(const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")){
    let w=line.trim().split(/\s+/)[0]?.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
    if(!w)continue;
    let v=[];while(w){const m=tokens.find(x=>w.startsWith(x.t));if(!m){v=[];break;}v.push(m.i);w=w.slice(m.t.length);}
    if(v.length)dict.add(v.join(","));
  }
  let words=[],w=[];
  for(const ch of read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("%")){
    if(idx.has(ch))w.push(idx.get(ch));else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[];}
  }
  if(w.length)words.push(w);
  assert.equal(words.length,2896);assert.equal(dict.size,29060);
  const start=c.pages.slice(0,23).reduce((s,p)=>s+p.indices.length,0);
  const out=Array(5).fill(-1).concat([...log.match(/^original train_pairs=.*\n^decoded=([0-9a-s]+)$/m)[1]].map(x=>chars.indexOf(x)));
  function stat(from,to){
    let off=0,n=0,hit=0,long=0,longHit=0;
    for(const w of words){const i=off-start,j=i+w.length;off+=w.length;if(i>=from&&j<=to){n++;if(w.length>=5)long++;if(dict.has(out.slice(i,j).join(","))){hit++;if(w.length>=5)longHit++;}}}
    return {n,hit,long,longHit};
  }
  const result={train:stat(5,756),holdout:stat(756,1021)};
  console.log(JSON.stringify(result));
  assert.deepEqual(result,{train:{n:163,hit:15,long:64,longHit:0},holdout:{n:58,hit:4,long:25,longHit:0}});
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
