"use strict";
/** Historical periods 8/13; continuous mod36 silent channel, fit p0–39
 * (9640 visible), predict p40–55 (3316). Channel not authenticated. */
function run(raw,s,opt={}){
 const m=s.model(raw),q=opt.q||8,n=12956,cut=9640,seeds=[17,3301,1033,761];
 let C,plant=null,Ktruth=null;
 if(opt.original)C=m.gp.pages.slice(0,56).flatMap(p=>p.indices);
 else {const keySeed=opt.keySeed||20261128,rand=s.rng(keySeed);
 if(seeds.includes(keySeed))throw Error("plant/search seed overlap");
 Ktruth=Array.from({length:q},()=>rand(36));
 plant=s.sender(m.tests[opt.source||"gibran"].slice(opt.offset||5000),Ktruth,n);C=plant.C;}
 if(C.length!==n)throw Error("fixture length");
 const rows=s.search(C,q,cut,m,{seeds,sweeps:8}),seen=new Set(),candidates=[];
 for(const row of rows)for(let j=0;j<q;j++){
 const K=row.K.slice(j).concat(row.K.slice(0,j)),id=K.join(",");
 if(seen.has(id))continue;seen.add(id);
 candidates.push({K,seed:row.seed,rotation:j,fit:s.exact(C.slice(0,cut),K,m).fit});}
 candidates.sort((a,b)=>b.fit-a.fit);
 const best=candidates[0],likelihood=s.exact(C,best.K,m,cut);
 return {source:opt.original?"LP2 p0–55 continuous":opt.source||"gibran",q,n,cut,rows,candidates,best,likelihood,truth:plant?{K:Ktruth,cyclicMatches:s.cyclicMatches(best.K,Ktruth),exactPhase:JSON.stringify(best.K)===JSON.stringify(Ktruth),likelihood:s.exact(C,Ktruth,m,cut)}:null};
}
if(typeof module!=="undefined")module.exports={run};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
 console.log(JSON.stringify(run(raw,require("./lp2_alt36_blind_periodic_hmm_sft.cjs"),JSON.parse(process.argv[2]||"{}")),null,2));
}
