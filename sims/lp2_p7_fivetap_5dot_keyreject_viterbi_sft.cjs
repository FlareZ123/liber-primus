"use strict";
/**
 * P7 source-five-tap LFSR with five-dot conditional no-repeat key rejection.
 *
 * Frozen source: p7 five complete red GP29 words have products
 * 11,26,8,15,2, selecting a finite GF29 recurrence (period 1876);
 * the source-derived DH23 register 23,2,5,2,19 supplies one candidate
 * starting state. Five p7 black dots motivate a tentative 4-of-5
 * collision suppression clock. This is an exploratory cipher hypothesis:
 * the author did not sign the PRNG, pad or fifth-slot-bypass rule.
 *
 * Attack: C_i = (P_i + K_j) mod29. If C_i would equal prior emitted C,
 * reject K_j and advance to K_(j+1), except at every fifth key draw,
 * whose unguarded repeat is allowed. The exact inverse can try skipped
 * key positions only if all rejected candidates WOULD equal prior C.
 * Test the original p8-p14 chapter with every five-phase guard, two
 * source-grounded starts, two sourced seeds and full/black p8 clocks.
 *
 * No dependencies beyond project data, Node.js22 and one existing
 * source-native GP29 spelling module. No file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const M=29;
const mod=n=>(n%M+M)%M;
const cube=Array.from({length:M},(_,x)=>mod(x*x*x));
const cubeInverse=new Uint8Array(M);
assert.equal(new Set(cube).size,M);
for(let x=0;x<M;x++)cubeInverse[cube[x]]=x;
const coeff=[11,26,8,15,2];
const seeds=[
  ["reconstructed-DH23", [23,2,5,2,19]],
  ["literal-five-word-products", coeff.slice()]
];
const p7=corpus.pages[7].indices;
const p8=corpus.pages[8].indices;
assert.deepEqual(p7.slice(-14),[23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
assert.deepEqual(ink.pages.find(p=>p.page===7).red_spans
  .map(x=>[x.start,x.length]),[[194,14]]);
const products=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]]
  .map(w=>w.reduce((a,b)=>mod(a*b),1));
assert.deepEqual(products,coeff);
assert.equal(corpus.prime[18],67);
assert.equal(p8.slice(0,4).map(x=>corpus.translit[x]).join(""),"XIXM");
assert.equal(p8.slice(4,12).reduce((a,b)=>mod(a*b),1),3,
  "p8 second complete eight-rune red-word product selects cube exponent3");
assert.equal((3*19)%28,1,
  "p8 Roman XIX supplies the inverse cube exponent on GP29");
const whole=corpus.pages.slice(8,15).flatMap(x=>x.indices);
const black=[...p8.slice(12),...corpus.pages.slice(9,15).flatMap(x=>x.indices)];
assert.equal(whole.length,1729);
assert.equal(black.length,1717);
/** @param {number[]} initial */
function generate(initial) {
  const out=initial.slice();
  for(let i=5;i<5000;i++)
    out.push(mod(coeff.reduce((s,v,k)=>s+v*out[i-k-1],0)));
  for(let i=1876;i<5000;i++)assert.equal(out[i],out[i-1876]);
  for(let i=0;i+4<out.length;i++)
    assert.ok(!out.slice(i,i+5).every(v=>v===out[i]),
      "every ciphertext skip run must contain at most four equal key draws");
  return out;
}
const shakespeare=encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
const gibran=encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
assert.ok(shakespeare.length>170000 && gibran.length>50000);
// Train on independent Shakespeare source only, hold out Shakespeare tail
// and Gibran completely for validating the native GP language register.
const train=shakespeare.slice(0,150000),un=new Uint32Array(29);
const bi=new Uint32Array(841),tri=new Uint32Array(24389);
for(let i=0;i<train.length;i++){
  un[train[i]]++;
  if(i>0)bi[29*train[i-1]+train[i]]++;
  if(i>1)tri[841*train[i-2]+29*train[i-1]+train[i]]++;
}
/** @param {number} p @param {number} previous1 @param {number} previous2 @param {number} i */
function logScore(p,previous1,previous2,i) {
  if(i>1)return Math.log((tri[841*previous2+29*previous1+p]+0.2)/
    (bi[29*previous2+previous1]+5.8));
  if(i>0)return Math.log((bi[29*previous1+p]+0.2)/(un[previous1]+5.8));
  return Math.log((un[p]+0.2)/(train.length+5.8));
}
/** @param {number[]} text */
function nativeScore(text){
  let score=0;
  for(let i=0;i<text.length;i++)
    score+=logScore(text[i],i?text[i-1]:0,i>1?text[i-2]:0,i);
  return score/text.length;
}
/**
 * Deterministic source cipher, used for positive native-GP plants.
 * @param {number[]} plain @param {number[]} key
 * @param {number} start @param {number} phase
 */
function encrypt(plain,key,start,phase,mode="additive"){
  let j=start,skips=0;const cipher=[];
  for(let i=0;i<plain.length;i++){
    for(;;){
      const pos=j++;
      assert.ok(j<key.length);
      const emission=mode==="cube-plaintext"?cube[plain[i]]:plain[i];
      const candidate=mod(emission+key[pos]);
      if(i&&candidate===cipher[i-1]&&pos%5!==phase){
        skips++;
        continue;
      }
      cipher.push(candidate);
      break;
    }
  }
  return{cipher,skips,finalKeyPosition:j};
}
/**
 * Enumerate exact inverse transitions and Viterbi-best native-GP path.
 * Every retained transition is a legal forward encryption history:
 * skipped key draws must each have emitted the previous ciphertext.
 * The initial symbol cannot trigger a repeat rejection.
 *
 * @param {number[]} cipher @param {number[]} key
 * @param {number} start @param {number} phase
 */
function inverse(cipher,key,start,phase,mode="additive"){
  let states=[{j:start,p1:0,p2:0,score:0,path:""}],maxStates=1;
  for(let i=0;i<cipher.length;i++){
    const next=new Map();
    for(const state of states){
      const j=state.j;
      // Both exact source LFSRs have at most four equal consecutive keys.
      // Four rejected values therefore exhaust all possible skip runs.
      for(let skip=0;skip<=4;skip++){
        const residual=mod(cipher[i]-key[j+skip]);
        const p=mode==="cube-plaintext"?cubeInverse[residual]:residual;
        const emission=mode==="cube-plaintext"?cube[p]:p;
        let admissible=true;
        for(let t=0;t<skip;t++){
          if(i===0||mod(emission+key[j+t])!==cipher[i-1]||
            (j+t)%5===phase){admissible=false;break;}
        }
        if(!admissible)continue;
        if(i&&cipher[i]===cipher[i-1]&&(j+skip)%5!==phase)continue;
        const nextJ=j+skip+1;
        const score=state.score+logScore(p,state.p1,state.p2,i);
        const k=nextJ*841+29*state.p1+p;
        const old=next.get(k);
        if(!old||score>old.score)
          next.set(k,{j:nextJ,p1:p,p2:state.p1,score,
            path:state.path+String.fromCharCode(65+p)});
      }
    }
    states=[...next.values()];
    maxStates=Math.max(maxStates,states.length);
    if(!states.length)return{deadAt:i,statesAtEnd:0,maxStates};
  }
  states.sort((a,b)=>b.score-a.score);
  const best=states[0];
  const decoded=[...best.path].map(ch=>ch.charCodeAt(0)-65);
  assert.equal(decoded.length,cipher.length);
  return {
    averageLogScore:best.score/cipher.length,
    statesAtEnd:states.length,
    maxStates,
    skips:best.j-start-cipher.length,
    startTransliteration:decoded.slice(0,96)
      .map(x=>corpus.translit[x]).join(""),
    decoded,
  };
}
const nativeControls=[
  ["heldout-Gibran",gibran.slice(11000,11000+whole.length)],
  ["heldout-Shakespeare",shakespeare.slice(165000,165000+whole.length)]
];
const originalResults=[];
for(const [seedName,seed] of seeds){
  for(const mode of ["additive","cube-key","cube-plaintext"]){
    const base=generate(seed);
    const key=mode==="cube-key"?base.map(x=>cube[x]):base;
  // Original: both printed p8 chapter with its red12 title, and the
  // remaining body after those 12 original red runes.
  for(const [scope,original] of [["p8-p14",whole],["p8-body-p14",black]]){
    for(const start of [0,14]){
      for(let phase=0;phase<5;phase++){
        const v=inverse(original,key,start,phase,mode);
        originalResults.push({
          seed:seedName,mode,scope,start,unguardedKeyPhase:phase,
          ...(v.deadAt!==undefined ? {firstImpossibleRune:v.deadAt} : {
            meanLogScore:v.averageLogScore,
            survivingStates:v.statesAtEnd,
            skips:v.skips,
            first96:v.startTransliteration
          })
        });
      }
    }
  }
  }
}
const viable=originalResults.filter(x=>x.meanLogScore!==undefined)
  .sort((a,b)=>b.meanLogScore-a.meanLogScore);
assert.ok(viable.length>0);
const positive=[];
for(const [seedName,seed] of seeds){
  for(const mode of ["additive","cube-key","cube-plaintext"]){
    const base=generate(seed);
    const key=mode==="cube-key"?base.map(x=>cube[x]):base;
  for(const [name,plain] of nativeControls){
    const encrypted=encrypt(plain,key,0,0,mode);
    const decoded=inverse(encrypted.cipher,key,0,0,mode);
    assert.ok(decoded.averageLogScore!==undefined);
    // Reconstruct original ciphertext exactly by replaying every inferred
    // plaintext candidate and its source key-consumption history.
    const reencoded=encrypt(decoded.decoded,key,0,0,mode);
    assert.deepEqual(reencoded.cipher,encrypted.cipher);
    positive.push({
      seed:seedName,mode,source:name,originalRunes:plain.length,
      actualSkipCount:encrypted.skips,nativeMeanLogScore:nativeScore(plain),
      decodedMeanLogScore:decoded.averageLogScore,
      exactRecoveredRunes:decoded.decoded.filter((x,i)=>x===plain[i]).length,
      sourceCipherReplayed:true
    });
  }
  }
}
// Deliberately generous separation, >1.2 nats/rune between best
// original across all 120 source cases and worst native heldout control.
const strongest=viable[0];
const worstNative=Math.min(...positive.map(x=>x.nativeMeanLogScore));
assert.ok(worstNative-strongest.meanLogScore>1.2);
assert.ok(positive.every(x=>x.exactRecoveredRunes>1500));
console.log(JSON.stringify({
  decision:"No original p8-p14 GP-English recovered by the source-five-tap five-dot conditional key-rejection architecture.",
  sourcePropositions:{
    p7Products:coeff,
    p8Roman19thGpPrime:67,
    candidateSeedNames:seeds.map(x=>x[0]),
    predeclaredValueOps:["identity GP29 emission","cube source LFSR key",
      "cube plaintext before adding LFSR key"],
    proposedUngatedRate:"one in five LFSR key draws",
    proposedKeyPeriod:1876,
    originalScopeSizes:{whole:whole.length,afterOriginalRed12:black.length}
  },
  original:{
    sourceVariants:originalResults.length,
    completeInverseVariants:viable.length,
    firstImpossibleVariants:originalResults.length-viable.length,
    best:strongest,
    worstViable:viable[viable.length-1],
    allVariantSummaries:originalResults.map(x=>{
      const {first96,...fields}=x;return fields
    }),
  },
  independentNativeSourceControls:positive,
  languageModel:"GP29 smoothed trigram trained on first 150000 runes of Shakespeare only; Gibran and later Shakespeare are held out",
  limitation:"An experimental five-dot guard, fixed authentic candidate seeds, additive GP29 pad and at-most-four consecutive rejected key draws; no claim to exhaust all evolving-key or non-GP mechanisms.",
  unknownPlaintextRecovered:false
},null,2));
