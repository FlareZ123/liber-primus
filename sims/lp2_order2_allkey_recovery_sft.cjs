// Exact arbitrary second-order affine-recursive inverse; Node.js and C++17/OpenMP required.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const assert=require("node:assert/strict");
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const n=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const idx=new Map(c.runes.map((r,i)=>[r,i]));
const orig=c.pages.slice(16,23).flatMap(p=>p.indices);
const donor=n.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).flatMap(w=>[...w].map(r=>idx.get(r))));
const fp=x=>x.reduce((s,v,i)=>(s+(i+1)*v)%1000000007,0);
assert.deepEqual([orig.length,donor.length,fp(orig),fp(donor)],[1744,2979,21274367,55392254]);
assert.equal(c.pages.slice(16,21).reduce((s,p)=>s+p.indices.length,0),1340);
const alphabet="0123456789abcdefghijklmnopqrs",encode=x=>x.map(v=>alphabet[v]).join("");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-order2-"));
try{
  const exe=path.join(tmp,process.platform==="win32"?"order2.exe":"order2");
  execFileSync(process.env.CXX||"g++",["-O3","-std=c++17","-fopenmp",path.join(__dirname,"lp2_order2_allkey_recovery.cpp"),"-o",exe],{stdio:"inherit"});
  const log=execFileSync(exe,[],{input:encode(orig)+"\n"+encode(donor)+"\n",encoding:"utf8"});
  process.stdout.write(log);
  for(const s of ["complete examined=575019453","plant best_pairs=10852","key=7,23,14,3,9,0,11,19,4","original best_pairs=32587","key=5,3,9,0,2,24,0,3,10","native_min=54128"])assert.ok(log.includes(s),s);
  assert.ok(log.includes("exact_train=600/600 exact_holdout=200/200"));
  const decoded=[...log.match(/^decoded=([0-9a-s]+)$/m)[1]].map(x=>alphabet.indexOf(x));
  const tokens=c.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),dict=new Set();
  for(const l of read("resources/control/english_wordfreq_textblob.txt").split("\n")){
    let w=l.trim().split(/\s+/)[0]?.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
    if(!w)continue;let a=[];while(w){const m=tokens.find(x=>w.startsWith(x.t));if(!m){a=[];break;}a.push(m.i);w=w.slice(m.t.length);}if(a.length)dict.add(a.join(","));
  }
  let words=[],w=[];
  for(const ch of read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("%")){
    if(idx.has(ch))w.push(idx.get(ch));else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[];}
  }
  if(w.length)words.push(w);
  assert.equal(words.length,2896);assert.equal(dict.size,29060);
  const start=c.pages.slice(0,16).reduce((n,p)=>n+p.indices.length,0);
  function stat(a,b){
    let off=0,n=0,hit=0,long=0,longHit=0;
    for(const w of words){const i=off-start,j=i+w.length;off+=w.length;if(i>=a&&j<=b){const p=decoded.slice(i,j);n++;if(w.length>=5)long++;if(dict.has(p.join(","))){hit++;if(w.length>=5)longHit++;}}}
    return {n,hit,long,longHit};
  }
  const result={train:stat(0,1340),holdout:stat(1340,1744)};
  console.log(JSON.stringify(result));
  assert.deepEqual(result,{train:{n:318,hit:27,long:115,longHit:0},holdout:{n:82,hit:5,long:36,longHit:0}});
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
