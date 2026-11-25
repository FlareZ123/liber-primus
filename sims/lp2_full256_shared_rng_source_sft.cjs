"use strict";
// Full 256-byte public artifacts as a single shared key/coin MT seed.
// Exact nohold reachability, followed by complete threshold/path MAP.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const {reach,plant,domain,mtRaw}=require("./lp2_grid_column_shared_rng_exact_sft.cjs");
const {train,encode}=require("./lp2_shared_rng_exact_plaintext_sft.cjs");
const {caseRun}=require("./lp2_grid_shared_rng_exact_threshold_map_sft.cjs");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function run(gp,grid,onion,training,shakespeare){
 const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),T=gp.translit,L=train(training.map(x=>encode(x,T)));
 assert.equal(C.length,12956);assert.equal(gp.pages.filter(p=>p.page<51).reduce((n,p)=>n+p.indices.length,0),12114);
 const sources=[
 {name:"grid",hex:grid.byte_rows.flat().map(x=>x.toString(16).padStart(2,"0")).join(""),sha512:"bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20",check:[2771980068,985848752,1703214129,2236561509,2259977384,3932182977,1611350355,1055075156]},
 {name:"onion2",hex:onion.final_hex,sha512:"881fc9e850842a8765c86e020e854b5c49680e5027625ca45a7a2fca6b2093d57b35aecf1b3b40b0604e26f2421fd6b0884203cc68e9674fa4abfad4f904f5a2",check:[946298941,4206224457,780932064,1090530888,3760699922,1314046840,1960589158,1910494214]}];
 const out=[];
 for(const s of sources){
  assert.equal(s.hex.length,512);assert.equal(crypto.createHash("sha512").update(Buffer.from(s.hex,"hex")).digest("hex"),s.sha512);
  const bytesSeed=BigInt("0x"+s.hex+s.sha512),raw=mtRaw(bytesSeed);assert.deepEqual(Array.from({length:8},()=>raw()),s.check);
  for(const [repr,seed] of [["BE",BigInt("0x"+s.hex)],["LE",BigInt("0x"+s.hex.match(/../g).reverse().join(""))],["Py3-bytes-v2",bytesSeed]])for(const scope of s.name==="grid"?["book","after-grid"]:["book"]){
   const c=scope==="book"?C:C.slice(12114);
   for(const mode of ["randrange","float","uint32"])for(const schedule of ["conditional","keyfirst","coinfirst"])for(const sign of [1,-1]){
    const cfg={mode,schedule,sign,policy:"nohold"},f=reach(c,seed,mode,schedule,sign,"nohold");
    let q={source:s.name,repr,scope,mode,schedule,sign,dead:f.dead,intervals:f.intervals};
    if(f.intervals.length){const {d}=caseRun(c,seed,cfg,L,domain("nohold"),false);q={...q,score:d.score/c.length,threshold:d.t,plain:d.P.slice(0,120).map(x=>T[x]).join("")}}
    out.push(q)
   }
  }
 }
 const donor=encode(shakespeare,T).slice(14000,14000+842),s=sources[0],seed=BigInt("0x"+s.hex+s.sha512),cfg={mode:"randrange",schedule:"conditional",sign:1,policy:"nohold"},Y=plant(donor,seed,cfg.mode,cfg.schedule,1,"nohold",Math.ceil(.81288*2**53)),{d}=caseRun(Y,seed,cfg,L,domain("nohold"),false);
 return {sources:sources.map(({name,sha512,check})=>({name,sha512,check})),scopeLengths:{book:C.length,"after-grid":842},results:out,control:{n:donor.length,accuracy:d.P.filter((x,i)=>x===donor[i]).length,score:d.score/donor.length}}
}
if(require.main===module)console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/base60-grid.json")),JSON.parse(read("resources/cicada2014-onion2-timing.json")),["resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(read),read("resources/control/shakespeare_first300k.txt")),null,2));
module.exports={run};
