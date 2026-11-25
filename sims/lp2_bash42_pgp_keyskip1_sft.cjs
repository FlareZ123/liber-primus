"use strict";
// Director #2668, exact historical Bash 4.2 LP64 source, frozen GP29 beam.
// Historical source tag: gitGNU/gnu_bash@495aee441b75276e38c75694ccb455bb6463fdb9:variables.c.
// Reuse the already calibrated spacing-free keyskip1 instrument from #2667.
const lib=require("./lp2_perl_pgp_keyskip1_sft.cjs");
const N=12956, HOLD=512, WIDTH=64, Q=29;
const MASK=(1n<<64n)-1n;
function random42(seed){
 let s=BigInt(seed)&MASK,last=0;
 return ()=>{
  let v;
  do{
   if(s===0n)s=123459876n;
   s=(16807n*(s%127773n)-2836n*(s/127773n))&MASK;
   v=Number(s&32767n);
  }while(v===last);
  last=v;
  return v;
 };
}
function key(seed,n){
 const draw=random42(seed),K=new Uint8Array(n);
 for(let i=0;i<n;i++){let v;do v=draw();while(v>=32741);K[i]=v%Q}
 return K;
}
function rnd(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0}}
function nullSeeds(seeds){
 const used=new Set(seeds.map(x=>x.seed)),next=rnd(0x2668b042),a=[];
 // Preserve approximate candidate fraction of wide (>32-bit) inputs.
 while(a.length<500){
  const wide=a.length>=371;
  const x=wide?4294967296+(next()%4687)*4294967296+next():next();
  if(used.has(x)||x===0x12345678||x===20170404232327)continue;
  used.add(x);a.push({rank:a.length+1,seed:x});
 }
 return a;
}
function run(corpus,gibran,emerson,shakespeare,seeds,{group="control",start=0,end=10,trace=false}={}){
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 if(C.length!==N||C.slice(1).filter((x,i)=>x===C[i]).length!==86||seeds.length!==433)throw Error("input mismatch");
 const L=lib.model([lib.convert(gibran,corpus.translit),lib.convert(emerson,corpus.translit)]);
 const P=lib.convert(shakespeare,corpus.translit).slice(0,N);
 if(P.length!==N)throw Error("plant length");
 if(group==="control"){
  return [0x12345678,20170404232327].map((seed,i)=>{
   const K=key(seed,2*N+16),enc=lib.plant(P,K,0x31415926+i);
   const d=lib.beam(enc.C,K,L,{width:WIDTH,trace:true,hold:HOLD});
   const recovered=d.P.filter((x,i)=>x===P[i]).length;
   const holdRecovered=d.P.slice(-HOLD).filter((x,i)=>x===P[N-HOLD+i]).length;
   delete d.P;delete d.ks;
   return {seed,trueSkips:enc.sk,recovered,holdRecovered,...d};
  });
 }
 const rows=group==="candidates"?seeds:nullSeeds(seeds);
 return rows.slice(start,end).map(({rank,seed,tier})=>({rank,seed,tier,...lib.beam(C,key(seed,2*N+16),L,{width:WIDTH,trace,hold:HOLD})}));
}
function nativeControl(corpus,gibran,emerson,native){
 const L=lib.model([lib.convert(gibran,corpus.translit),lib.convert(emerson,corpus.translit)]);
 const tape=native.sections.flatMap(z=>Array.from(z.source_text).map(ch=>native.runes.indexOf(ch)).filter(i=>i>=0));
 if(tape.length!==2979)throw Error("native source length");
 const P=Array.from({length:N},(_,i)=>tape[i%tape.length]);
 const seed=0x99aabbcc,K=key(seed,2*N+16),enc=lib.plant(P,K,0x27182818);
 const d=lib.beam(enc.C,K,L,{width:WIDTH,trace:true,hold:HOLD});
 const recovered=d.P.filter((x,i)=>x===P[i]).length,heldRecovered=d.P.slice(-HOLD).filter((x,i)=>x===P[N-HOLD+i]).length;
 delete d.P;delete d.ks;return {seed,nativeRunes:tape.length,trueSkips:enc.sk,recovered,heldRecovered,...d};
}
module.exports={random42,key,nullSeeds,run,nativeControl};
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path");
 const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const seeds=JSON.parse(read("im-results/agent50-2667-pgp-seeds.json")).candidates;
 const [group="control",start="0",end="10",trace="false"]=process.argv.slice(2);
 const g=read("resources/control/gibran_prophet_58585.txt"),e=read("resources/control/emerson_essays_2944.txt");
 console.log(JSON.stringify(group==="native"?nativeControl(corpus,g,e,JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))):run(corpus,g,e,read("resources/control/shakespeare_first300k.txt"),seeds,{group,start:+start,end:+end,trace:trace==="true"}),null,2));
}
