"use strict";
/** Continuous independent GP29 deletion with historical q8/q13.
 * Fit p0–39, predict p40–55. No printed word boundaries or resets.
 * Four soft-phase EM proposals + strict likelihood cycle/phase selection.
 */
function run(raw,base,soft,blind,opt={}){
 const m=base.model(raw,"delete"),q=opt.q||8,n=12956,cut=9640,starts=[17,3301,1033,761];
 let C,plant=null,truth=null;
 if(opt.original)C=m.gp.pages.slice(0,56).flatMap(p=>p.indices);
 else{const seed=opt.seed||20261128;if(starts.includes(seed))throw Error("plant/search seed overlap");
 const r=base.rng(seed);truth=Array.from({length:q},()=>r(29));plant=base.sender(m.tests[opt.source||"gibran"].slice(opt.offset||5000),truth,m,n,seed^0x12345678);C=plant.C;}
 if(C.length!==n)throw Error("fixture length");
 const fit=C.slice(0,cut),rows=blind.fitKeys(fit,q,m,base,soft,{starts,steps:100,sweeps:8}),candidates=blind.select(fit,rows,m,base),best=candidates[0];
 const e=blind.effective(best.K,m,base),likelihood=blind.likelihood(C,e,0,cut);
 return {source:opt.original?"LP2 p0–55 continuous":opt.source||"gibran",q,n,cut,rows,candidates,best,likelihood,truth:truth?{K:truth,cyclicMatches:soft.cyclicMatches(truth,best.K),exactPhase:JSON.stringify(truth)===JSON.stringify(best.K),likelihood:blind.likelihood(C,blind.effective(truth,m,base),0,cut)}:null};
}
if(typeof module!=="undefined")module.exports={run};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
 console.log(JSON.stringify(run(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),require("./lp2_alt29_delete_soft_phase_em_sft.cjs"),require("./lp2_alt29_delete_blind_periodic_sft.cjs"),JSON.parse(process.argv[2]||"{}")),null,2));
}
