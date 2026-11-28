"use strict";
/**
 * Original-cipher attack joining three independently printed operands:
 * 31 separate thirteen-dot punctuation marks -> 32 ordered fragments;
 * 32x8 p49–p51 table -> one period-8 byte key per fragment;
 * Round48 mod36 (29 visible + 7 silent) strict-repeat sender.
 * This proposed JOIN is not a proven Cicada instruction. No fitted key phase,
 * column order, byte offset, page grouping, alphabet mapping, or plaintext crib.
 *
 * Use Node 22; run from repository root:
 *   node sims/lp2_13dot32_row8_mod36_silent_exact_original_sft.cjs
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {machine,language,decode}=require("./lp2_periodic_silent_unbounded_inverse_sft.cjs");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const all=gp.pages.flatMap(p=>p.indices);assert.equal(all.length,13136);
let at=0;const events=[];
for(const page of gp.pages){
 const marks=ink.pages.find(p=>p.page===page.page)?.large_punctuation||[];
 for(const [index,count,color] of marks)if(count===13)
   events.push({absolute:at+index,page:page.page,index,color});
 at+=page.indices.length;
}
events.sort((a,b)=>a.absolute-b.absolute||a.page-b.page);
assert.equal(events.length,31);
const bounds=[0,...events.map(x=>x.absolute),all.length];
const segments=Array.from({length:32},(_,i)=>({i,from:bounds[i],to:bounds[i+1],
  C:all.slice(bounds[i],bounds[i+1]),
  key:grid.bytes.slice(i*8,(i+1)*8).map(x=>x%36)}));
assert.equal(grid.bytes.length,256);
assert.equal(grid.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.deepEqual(segments.filter(s=>!s.C.length).map(s=>s.i),[8,11]);
assert.equal(bounds[28],12956);
assert.equal(segments.slice(0,28).reduce((s,x)=>s+x.C.length,0),12956);
assert.deepEqual(segments.filter(s=>s.C.length>=600).map(s=>s.i),
  [1,5,10,14,16,18,22,25]);
const gpTokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function wordTokens(text){
 return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const v=[];
  for(let j=0;j<w.length;){
   const t=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:gpTokens.find(x=>w.startsWith(x.s,j));
   assert(t,"unknown native GP token "+w.slice(j));v.push(t.i);j+=t.s.length;
  }return v;
 });
}
const donors=["resources/control/shakespeare_first300k.txt",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt"].map(p=>wordTokens(read(p)));
const lm=language(donors);
const held=donors[1].slice(Math.floor(donors[1].length*.57))
  .flatMap(w=>[...w,29]);
assert(held.length>3500);
function lcs(A,B){let p=new Uint16Array(B.length+1),q=new Uint16Array(B.length+1);
 for(const a of A){q.fill(0);for(let i=0;i<B.length;i++)q[i+1]=a===B[i]?p[i]+1:Math.max(q[i],p[i+1]);[p,q]=[q,p];}
 return p[B.length]/Math.max(A.length,B.length);
}
const translit=xs=>xs.slice(0,155).map(x=>x===29?" ":gp.translit[x]).join("");
const beam=128;
const positive=[];
for(const i of[1,27]){
 const s=segments[i],M=machine(36,s.key);
 const P=held.slice(1200+i*12,1200+i*12+320),plant=M.encode(P);
 const a=decode(M,plant.C,lm,beam,0);
 assert(a.P && a.P.length,"correct-key known-GP planted inverse failed");
 const visibleTruth=plant.events.filter(e=>e.c<29&&e.p<29).map(e=>e.p);
 const c=lcs(a.visibleP,visibleTruth);
 positive.push({i,sourcePlainTokens:P.length,printed:plant.C.length,
  lcsVisible:c,score:a.score,hidden:a.hidden,
  exactReplay:true,correctKeyPeriod:s.key.length});
}
const groups=[];
for(const s of segments){
 if(!s.C.length){groups.push({i:s.i,length:0});continue;}
 const M=machine(36,s.key),r=M.minHidden(s.C);
 groups.push({i:s.i,length:s.C.length,reached:r.prefix,
  possible:r.prefix===s.C.length,minimumHidden:r.minHidden,
  terminalStates:r.states});
}
const selected=[1,5,16,27],original=[];
for(const i of selected){
 const s=segments[i],M=machine(36,s.key);
 const result=decode(M,s.C,lm,beam,0);
 original.push(result.P?{i,printed:s.C.length,score:result.score,
  candidateFullLength:result.P.length,hidden:result.hidden,
  maxHidden:result.maxHidden,clock:result.clock,
  preview:translit(result.P),strictForwardReplay:"PASS"}
  :{i,printed:s.C.length,failed:result.failed});
}
const output={hypothesis:"exact 31 physically separate thirteen-dot separators -> 32 intervals -> 32 fixed printed eight-byte table row keys modulo36, periodic strict-repeat/silent channel",mechanismNotAuthenticated:true,
  tableByteOrder:"original row major, each row period8, key phase reset at each physical mark",
  decoder:"exact unbounded epsilon closure; beam128 across visible observations",
  positive,fullTapeReachability:groups,original,
  correctKeyRecoveredFromOriginal:false,
  plaintextAuthenticated:false};
if(process.env.LP2_WRITE_OUTPUT){
 const target=path.join(root,"im-results/lp2-13dot32-row8-mod36-silent-output.json");
 fs.writeFileSync(target,JSON.stringify(output,null,2)+"\n");
}
process.stdout.write(JSON.stringify(output,null,2)+"\n");
