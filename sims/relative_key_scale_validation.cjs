'use strict';
/**
 * Calibrated LP2 page-pair residue-difference / scale-four test.
 *
 * Select the pair with maximal symmetric modulo-29 residue histogram across
 * all 1485 page pairs, learn the best (scale,rotation) of a Shakespeare-GP
 * plaintext difference model from the FIRST HALF of that pair, score it on
 * the untouched SECOND HALF, and repeat the *complete selection procedure*
 * under independent per-page cyclic rotations.
 *
 * The model C_A-C_B = m*(P_A-P_B)+delta mod29 is a proposed explanation.
 * Cross-validation is empirical/statistical and does not recover a key.
 * Selection of this family after discovering the anomaly is still post-hoc.
 *
 * Node 22, CommonJS, no network or packages.
 * node sims/relative_key_scale_validation.cjs --trials 1000
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const reuse=require('./relative_key_reuse_scan.cjs');
const base=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;

/** @param {number} x @returns {number} */
const mod=x=>((x%MOD)+MOD)%MOD;

/** @param {number} seed */
function rng(seed){let state=seed>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}

/** @returns {{logs:Array<{scale:number,offset:number,log:Float64Array}>,glyphs:number}} */
function buildTemplates(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const words=base.corpusWords(source.slice(0,240000));
  const counts=new Float64Array(29);
  let glyphs=0;
  for(const w of words)for(const c of w){counts[c]++;glyphs++;}
  const q=Float64Array.from(counts,n=>n/glyphs);
  const differences=new Float64Array(29);
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)
    differences[mod(a-b)]+=q[a]*q[b];
  const logs=[];
  for(let scale=1;scale<29;scale++)for(let offset=0;offset<29;offset++){
    const table=new Float64Array(29);
    for(let d=0;d<29;d++)table[mod(scale*d+offset)]=Math.log(29*differences[d]);
    logs.push({scale,offset,log:table});
  }
  assert.equal(logs.length,812);
  return {logs,glyphs};
}

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number[]} rotations
 * @returns {{maxSym:number,pair:[number,number]}}
 */
function selectMaxSym(pages,rotations){
  let maxSym=-Infinity,arg=[0,1];
  for(let i=0;i<pages.length;i++){
    const a=pages[i].indices,na=a.length,ra=rotations[i];
    for(let j=i+1;j<pages.length;j++){
      const b=pages[j].indices,nb=b.length,rb=rotations[j],n=Math.min(na,nb);
      const h=new Uint16Array(29);
      for(let t=0;t<n;t++)h[mod(a[(t+ra)%na]-b[(t+rb)%nb])]++;
      const exp=n/29;
      let symmetric=(h[0]-exp)**2/exp;
      for(let d=1;d<=14;d++)
        symmetric+=(h[d]+h[29-d]-2*exp)**2/(2*exp);
      if(symmetric>maxSym){maxSym=symmetric;arg=[i,j];}
    }
  }
  return {maxSym,pair:arg};
}

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {[number,number]} pair
 * @param {number[]} rotations
 * @param {Array<{scale:number,offset:number,log:Float64Array}>} templates
 */
function fitAndTest(pages,pair,rotations,templates){
  const [i,j]=pair;
  const a=pages[i].indices,b=pages[j].indices,n=Math.min(a.length,b.length),mid=n>>>1;
  const h1=new Uint16Array(29),h2=new Uint16Array(29);
  for(let t=0;t<n;t++){
    const d=mod(a[(t+rotations[i])%a.length]-b[(t+rotations[j])%b.length]);
    (t<mid?h1:h2)[d]++;
  }
  let trainingScore=-Infinity,heldoutScore=-Infinity,parameter=null;
  for(const {scale,offset,log} of templates){
    let train=0,test=0;
    for(let d=0;d<29;d++){train+=h1[d]*log[d];test+=h2[d]*log[d];}
    if(train>trainingScore){
      trainingScore=train;
      heldoutScore=test;
      parameter={scale,offset};
    }
  }
  return {trainingScore,heldoutScore,parameter,firstHalf:mid,secondHalf:n-mid};
}

/** @param {number} trials @param {number} seed */
function study(trials=1000,seed=2026){
  const pages=reuse.loadPages(),{logs,glyphs}=buildTemplates();
  const zero=pages.map(()=>0);
  const selected=selectMaxSym(pages,zero);
  const fit=fitAndTest(pages,selected.pair,zero,logs);
  const observed={symmetricChiSquare:selected.maxSym,
    pair:selected.pair.map(k=>pages[k].page),...fit};
  const random=rng(seed),nullTest=[],nullJoint=[];
  for(let t=0;t<trials;t++){
    const rotations=pages.map(p=>Math.floor(random()*p.indices.length));
    const candidate=selectMaxSym(pages,rotations);
    const nullFit=fitAndTest(pages,candidate.pair,rotations,logs);
    nullTest.push(nullFit.heldoutScore);
    nullJoint.push(candidate.maxSym>=observed.symmetricChiSquare
      && nullFit.heldoutScore>=observed.heldoutScore);
  }
  nullTest.sort((a,b)=>a-b);
  const testExceed=nullTest.filter(x=>x>=observed.heldoutScore).length;
  const jointExceed=nullJoint.filter(Boolean).length;
  // Algebraic positive control for scale-four shared additive key.
  const rand=rng(3301);let reconstructed=0;
  for(let t=0;t<269;t++){
    const p=Math.floor(rand()*29),q=Math.floor(rand()*29),key=Math.floor(rand()*29);
    const a=mod(4*p+key),b=mod(4*q+key);
    assert.equal(mod(22*(a-b)),mod(p-q));
    reconstructed++;
  }
  return {
    description:'Select max-symmetry LP2 pair; fit modulo29 common plaintext scale/offset on first half; test second half',
    numberOfPairs:pages.length*(pages.length-1)/2,numberOfScaleOffsetModels:logs.length,
    shakespeareGPRunes:glyphs,heldoutControl:'269 algebraic scale-four same-key cancellations all passed',
    observed,seed,trials,
    selectedPairHeldoutP:(testExceed+1)/(trials+1),selectedPairHeldoutExceedances:testExceed,
    jointP:(jointExceed+1)/(trials+1),jointExceedances:jointExceed,
    nullTestMedian:nullTest[Math.floor((trials-1)*.5)],
    nullTest95:nullTest[Math.ceil(.95*trials)-1],
    nullTest99:nullTest[Math.ceil(.99*trials)-1],
    nullTestMax:nullTest.at(-1),
    caveat:'This model was suggested after exploratory pair selection; no authenticated plaintext/key and no proof of shared stream'
  };
}

if(require.main===module){
  const args=process.argv.slice(2),i=args.indexOf('--trials');
  const trials=i<0?1000:Number(args[i+1]);
  assert.ok(Number.isInteger(trials)&&trials>0&&trials<=10000);
  process.stdout.write(JSON.stringify(study(trials),null,2)+'\n');
}
module.exports={buildTemplates,selectMaxSym,fitAndTest,study};
