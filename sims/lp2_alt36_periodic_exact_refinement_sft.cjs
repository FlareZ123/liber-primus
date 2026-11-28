"use strict";
/**
 * Fit-only exact-likelihood refinement of mod36 periodic-key candidates.
 * The surrogate ranks single-coordinate proposals; only exact likelihood
 * improvements are accepted. This is local search, not exhaustive inversion.
 */
const fs=require("node:fs"),path=require("node:path");
const a=require("./lp2_alt36_blind_periodic_hmm_sft.cjs");
/** @param {number[]} C @param {number[]} initial @param {object} m */
function refine(C,initial,m,sweeps=2,width=5){
  const K=initial.slice(),hist=[];
  let v=a.exact(C,K,m).fit,calls=1;
  for(let sw=0;sw<sweeps;sw++){
    let changes=0;
    for(let j=0;j<K.length;j++){
      const old=K[j],r=[];
      for(let k=0;k<36;k++){K[j]=k;r.push({k,s:a.surrogate(C,K,m)});}
      r.sort((x,y)=>y.s-x.s||x.k-y.k);
      let best=old;
      for(const {k} of r.slice(0,width)){
        if(k===old)continue;
        K[j]=k;
        const z=a.exact(C,K,m).fit;calls++;
        if(z>v+1e-10){v=z;best=k;}
      }
      K[j]=best;
      if(best!==old)changes++;
    }
    hist.push({fit:v,changes,K:K.slice()});
    if(!changes)break;
  }
  return {K,fit:v,calls,hist};
}
/** @param {object} raw @param {object} prior */
function experiment(raw,prior){
  const m=a.model(raw),cut=1479;
  const r=a.rng(1385117),truth=Array.from({length:16},()=>r(36));
  const plant=a.sender(m.tests.shakespeare.slice(3000),truth,1883);
  // Independent plant's poorer proposal from the existing surrogate search:
  // seed 1033 or 761 ranking is not assumed; reproduce via a.search if needed.
  const samples=[
    {name:"Shakespeare independent surrogate-local optimum",C:plant.C,K:[11,6,28,11,31,33,6,23,25,6,4,25,5,32,9,19],truth},
    {name:"LP2 p15–22 existing q16 proposal",C:prior.original.C,K:prior.original.K}
  ];
  return samples.map(e=>{
    const before=a.exact(e.C,e.K,m,cut),res=refine(e.C.slice(0,cut),e.K,m),after=a.exact(e.C,res.K,m,cut);
    return {name:e.name,initial:e.K,before,res,after,truth:e.truth??null,
      initialMatches:e.truth?a.cyclicMatches(e.K,e.truth):null,
      finalMatches:e.truth?a.cyclicMatches(res.K,e.truth):null};
  });
}
module.exports={refine,experiment};
if(require.main===module){
  const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
  const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
  console.log(JSON.stringify(experiment(raw,JSON.parse(read("im-results/lp2-alt36-blind-periodic-hmm-output.json"))),null,2));
}
