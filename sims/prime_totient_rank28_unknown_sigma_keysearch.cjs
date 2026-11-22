"use strict";
/**
 * True original-input key search for a source-native prime/totient 28-rank
 * predecessor-excluding channel with a completely unknown fixed GP alphabet.
 * Rank concentration is invariant under every outer 28! alphabet permutation.
 *
 * Exact input: original LP2 source pages 0,3,8,16 (key-selection), and
 * original physical pages 23,27,33,40 (locked original holdout).
 * Under a fixed prime ordinal start s, each page resets its source state.
 * 4 original models cover two reversible nonzero-rank representations
 * and both marker/key-consumption policies. No GP plaintext known or used
 * to score original cipher. Correctness tested via two source-native plants.
 *
 * Run: node sims/prime_totient_rank28_unknown_sigma_keysearch.cjs [starts]
 * With omitted starts, searches 200,000 consecutive possible prime positions.
 * This does not recover plaintext if no authentic original key is selected.
 *
 * @module prime_totient_rank28_unknown_sigma_keysearch
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {gpWord}=require("./prime_totient_secret_parity_wordfit.cjs");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const TRAIN=[0,3,8,16],HOLD=[23,27,33,40],LENGTH=145;
const samplePages=[...TRAIN,...HOLD].map(page=>{
  const record=corpus.pages.find(p=>p.page===page);
  assert.ok(record.indices.length>=LENGTH);
  return {page,cipher:record.indices.slice(0,LENGTH)};
});
const gp=shakespeare.slice(240000).toUpperCase().match(/[A-Z]+/g)
  .flatMap(gpWord).filter(x=>x<28);
assert.ok(gp.length>10000);
const mod29=x=>(x%29+29)%29;
const power=[],log=Array(29).fill(-1);
for(let x=1,i=0;i<28;i++,x=x*15%29){power[i]=x;log[x]=i;}
let rng=0x33011422;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)/4294967296;}
/** @param {number} count */
function primeResidues(count){
  // Sieve upper bound sufficient for 2,000,000 primes and 145-symbol offsets.
  const bound=count<100000?2000000:count<250000?4000000:count<2100000?35000000:Math.ceil(count*(Math.log(count)+Math.log(Math.log(count)))+50000);
  const composite=new Uint8Array(bound+1),root=Math.floor(Math.sqrt(bound));
  for(let p=2;p<=root;p++)if(!composite[p])for(let k=p*p;k<=bound;k+=p)composite[k]=1;
  const result=new Uint8Array(count);let j=0;
  for(let k=2;k<=bound&&j<count;k++)if(!composite[k])result[j++]=(k-1)%28;
  assert.equal(j,count);
  return result;
}
/** @param {number[]} cipher @param {"cyclic"|"power"} scheme @param {boolean} consumes */
function features(cipher,scheme,consumes){
  const rank=[],clock=[];let keyCount=0;
  for(let i=1;i<cipher.length;i++){
    const delta=mod29(cipher[i]-cipher[i-1]);
    if(delta!==0){rank.push(scheme==="cyclic"?delta-1:log[delta]);clock.push(consumes?i-1:keyCount);}
    if(delta!==0||consumes)keyCount++;
  }
  return {rank,clock};
}
/** @param {{rank:number[],clock:number[]}[]} features @param {Uint8Array} shifts @param {number} start */
function fingerprint(features,shifts,start){
  const hist=new Int32Array(28);let total=0;
  for(const page of features)for(let i=0;i<page.rank.length;i++){
    let v=page.rank[i]-shifts[start+page.clock[i]];if(v<0)v+=28;
    hist[v]++;total++;
  }
  let collisions=0;
  for(const n of hist)collisions+=n*(n-1);
  return {ioc:collisions/(total*(total-1)),collisions,total};
}
/** @param {{rank:number[],clock:number[]}[]} features @param {Uint8Array} shifts @param {number} limit @param {number} top */
function search(features,shifts,limit,top=5){
  let count=features.reduce((a,p)=>a+p.rank.length,0),leader=[];
  const hist=new Int32Array(28);
  for(let start=1;start<=limit;start++){
    hist.fill(0);
    for(const page of features)for(let i=0;i<page.rank.length;i++){
      let v=page.rank[i]-shifts[start+page.clock[i]];
      if(v<0)v+=28;
      hist[v]++;
    }
    let total=0;for(let i=0;i<28;i++)total+=hist[i]*(hist[i]-1);
    if(leader.length<top||total>leader[leader.length-1].collisions){
      const item={start,collisions:total,ioc:total/(count*(count-1))};
      leader.push(item);leader.sort((a,b)=>b.collisions-a.collisions||a.start-b.start);
      if(leader.length>top)leader.length=top;
    }
  }
  return leader;
}
/**
 * Source-native forward cipher, with exact inverse under planted true
 * 28-alphabet permutation and genuine successive prime-totient source.
 * @param {"cyclic"|"power"} scheme @param {boolean} consumes
 * @param {Uint8Array} shifts @param {number} start
 */
function plant(scheme,consumes,shifts,start){
  const perm=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){let j=Math.floor(rand()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
  const inverse=Array(28);
  for(let i=0;i<28;i++)inverse[perm[i]]=i;
  let sourceAt=0,matched=0,markers=0;
  const books=samplePages.map(({page,cipher:shape})=>{
    const cipher=[(page*13+7)%29];
    let step=0;
    for(let i=1;i<shape.length;i++){
      const d=mod29(shape[i]-shape[i-1]);
      if(d===0){cipher.push(cipher[i-1]);markers++;if(consumes)step++;continue;}
      const plain=gp[sourceAt++ % gp.length];
      const key=shifts[start+step],rank=(perm[plain]+key)%28;
      cipher.push(mod29(cipher[i-1]+(scheme==="cyclic"?rank+1:power[rank])));
      const delta=mod29(cipher[i]-cipher[i-1]);
      const actualRank=scheme==="cyclic"?delta-1:log[delta];
      const plainRecovered=inverse[(actualRank-key+28)%28];
      assert.equal(plainRecovered,plain,"complete reversible planted cipher");
      matched++;step++;
    }
    return {page,cipher};
  });
  return {books,matched,markers,start,scheme,consumes};
}
function main(limit=200000){
  assert.ok(Number.isInteger(limit)&&limit>=10&&limit<=2000000);
  const began=Date.now();
  const shifts=primeResidues(limit+LENGTH+2);
  const data=samplePages;
  const modes=[{scheme:"cyclic",consumes:true},{scheme:"cyclic",consumes:false},
    {scheme:"power",consumes:true},{scheme:"power",consumes:false}];
  const report={originalInput:"eight original LP2 section-opening physical page prefixes",
    sourceStream:"actual consecutive primes phi(p) modulo28, any start in 1.."+limit,
    unknownGPAlphabet:"every fixed arbitrary 28-permutation, score invariant",
    modelSelectionPages:TRAIN,holdoutPages:HOLD,
    original:[],plants:[],settings:{limit,wordCountPerPage:LENGTH,schemeCount:4},
    originalSHA256:createHash("sha256").update(Buffer.from(data.flatMap(p=>p.cipher))).digest("hex")};
  for(const mode of modes){
    const selected=data.map(p=>features(p.cipher,mode.scheme,mode.consumes));
    const candidates=search(selected.slice(0,4),shifts,limit,5);
    const heldout=candidates.map(c=>({...c,
      holdout:fingerprint(selected.slice(4),shifts,c.start)}));
    report.original.push({...mode,trainRunes:selected.slice(0,4).reduce((a,b)=>a+b.rank.length,0),
      holdoutRunes:selected.slice(4).reduce((a,b)=>a+b.rank.length,0),
      trainTopFiveHeldout:heldout});
  }
  for(const mode of [{scheme:"cyclic",consumes:true},{scheme:"power",consumes:false}]){
    const trueStart=Math.min(123456,Math.floor(limit*.7));
    const fixed=plant(mode.scheme,mode.consumes,shifts,trueStart);
    const prepared=fixed.books.map(p=>features(p.cipher,mode.scheme,mode.consumes));
    const top=search(prepared.slice(0,4),shifts,limit,3);
    report.plants.push({...mode,trueStart,matched:fixed.matched,markers:fixed.markers,
      correctRank:top.findIndex(x=>x.start===trueStart)+1,
      selected:top,holdoutAtTruth:fingerprint(prepared.slice(4),shifts,trueStart)});
    assert.equal(top[0].start,trueStart,"source-native blind prime-start recovery");
  }
  report.elapsedSeconds=(Date.now()-began)/1000;
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main(Number(process.argv[2]||200000));
module.exports={main,search,features,primeResidues,plant};
