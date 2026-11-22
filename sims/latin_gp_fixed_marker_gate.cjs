"use strict";
/**
 * Key-independent Latin GP marker gate for all 29 possible transparent
 * predecessor-repeat symbols, using 39835 independently sourced Vulgate
 * GP whole words and every one of the original 2896 printed word lengths.
 *
 * Source words are deliberately GP-encoded *separately* so GP digraphs
 * never cross a plaintext word boundary. This differs from continuous
 * Latin trigram encoding (203357 vs 204802 runes), and is essential to
 * a word-position test. The source artifact pins the eight original
 * Git blob SHA1s and source GP orthography.
 *
 * A single literal GP symbol j can explain a repeated ciphertext rune
 * iff that symbol is present in the plaintext at that same location;
 * independent additive/PRNG keys do not change this forced identity.
 *
 * Sampling uncertainty and label selection are calibrated by drawing
 * independent whole Latin source words conditioned on the exact
 * original word-length multiset, with the same label search applied
 * to all random controls. This is a strict conditional register model.
 * Run: node sims/latin_gp_fixed_marker_gate.cjs [replicates=2000]
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
assert.equal(alphabet.length,29);
const rune=new Map(corpus.runes.map((x,i)=>[x,i]));
const sourceLines=read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const header=sourceLines.filter(s=>s.startsWith("#"));
const sourceWords=sourceLines.filter(s=>!s.startsWith("#"))
  .map(s=>Array.from(s,ch=>{
    const k=alphabet.indexOf(ch);
    assert.ok(k>=0,"Bad source GP rune");
    return k;
  }));
assert.equal(header.filter(x=>x.startsWith("# SOURCE")).length,8);
assert.equal(sourceWords.length,39835);
assert.equal(sourceWords.reduce((s,w)=>s+w.length,0),204802);
const ciphertextWords=read("resources/lp2-transcription.txt")
  .split("%").slice(0,55).join("%").split(/[-.&$§]/u)
  .map(s=>[...s].filter(ch=>rune.has(ch)).map(ch=>rune.get(ch)))
  .filter(w=>w.length);
assert.equal(ciphertextWords.length,2896);
assert.equal(ciphertextWords.flat().length,12956);
const lengthHist=new Map(),buckets=new Map();
for(const w of ciphertextWords)
  lengthHist.set(w.length,(lengthHist.get(w.length)||0)+1);
for(const w of sourceWords) {
  if(!buckets.has(w.length))buckets.set(w.length,[]);
  buckets.get(w.length).push(w);
}
for(const [length] of lengthHist)
  assert.ok(buckets.has(length),"No Latin word of source GP length "+length);
const observed=[0,0,0];let preceding=-1;
for(const w of ciphertextWords)for(let i=0;i<w.length;i++) {
  if(w[i]===preceding) {
    observed[0]++;
    observed[1]+=Number(i===0);
    observed[2]+=Number(i===w.length-1);
  }
  preceding=w[i];
}
assert.deepEqual(observed,[86,23,19]);

/**
 * Each literal GP marker has three length-matched source moments:
 * total markers, word-initial markers and word-final markers.
 * The test score is the sum of three squared standardized deviations.
 * Dependence between categories is accounted for through the matched
 * entire-family source Monte Carlo; this score is not called chi-square.
 */
const mean=Array.from({length:29},()=>new Float64Array(3));
const variance=Array.from({length:29},()=>new Float64Array(3));
for(const [length,count] of lengthHist) {
  const candidates=buckets.get(length),n=candidates.length;
  for(let k=0;k<29;k++) {
    const sum=[0,0,0],squares=[0,0,0];
    for(const w of candidates) {
      const features=[w.filter(x=>x===k).length,
        Number(w[0]===k),Number(w.at(-1)===k)];
      for(let j=0;j<3;j++) {
        sum[j]+=features[j];
        squares[j]+=features[j]**2;
      }
    }
    for(let j=0;j<3;j++) {
      const mu=sum[j]/n;
      mean[k][j]+=count*mu;
      variance[k][j]+=count*(squares[j]/n-mu*mu);
    }
  }
}
const ELIGIBLE_SD=5;
const eligible=Array.from({length:29},(_,i)=>i).filter(k=>
  variance[k][0]>0 &&
  Math.abs(observed[0]-mean[k][0])<=ELIGIBLE_SD*Math.sqrt(variance[k][0]));
assert.ok(eligible.length>0);
/** @param {number} k @param {number[]} x */
function score(k,x) {
  let result=0;
  for(let j=0;j<3;j++) {
    if(variance[k][j]===0) {
      if(x[j]!==mean[k][j])return Infinity;
    } else result+=(x[j]-mean[k][j])**2/variance[k][j];
  }
  return result;
}
/** @param {Int32Array} total @param {Int32Array} first @param {Int32Array} last */
function best(total,first,last) {
  const candidates=eligible.map(k=>({k,score:score(k,
    [total[k],first[k],last[k]])})).sort((a,b)=>a.score-b.score);
  return {winner:candidates[0],ranks:candidates};
}
const actual=eligible.map(k=>({k,name:corpus.translit[k],
  expected:[...mean[k]],sd:[...variance[k]].map(Math.sqrt),
  observed,score:score(k,observed)})).sort((a,b)=>a.score-b.score);
const observedBest=actual[0].score;
const REPS=process.argv[2]===undefined?2000:Number(process.argv[2]);
assert.ok(Number.isSafeInteger(REPS)&&REPS>=1&&REPS<=100000);
let state=0x0a113330;
const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
let atLeast=0,largest=0,totalScore=0,plant=null;
for(let trial=0;trial<REPS;trial++) {
  const totals=new Int32Array(29),first=new Int32Array(29),
    last=new Int32Array(29);
  const planted=[];
  for(const [len,count] of lengthHist) {
    const words=buckets.get(len);
    for(let t=0;t<count;t++) {
      const w=words[random()%words.length];
      first[w[0]]++;
      last[w.at(-1)]++;
      for(const label of w)totals[label]++;
      if(trial===0)planted.push(w);
    }
  }
  const found=best(totals,first,last).winner;
  atLeast+=Number(found.score>=observedBest);
  totalScore+=found.score;
  largest=Math.max(largest,found.score);
  if(trial===0) {
    // Exact one-reserved-symbol reversible predecessor transition.
    // One source GP symbol causes all (and only) equal-output markers.
    const marker=actual[0].k;
    const P=planted.flat(),C=[17];
    for(let t=1;t<P.length;t++) {
      const delta=P[t]===marker?0:1+
        (P[t]<marker?P[t]:P[t]-1);
      C.push((C[t-1]+delta)%29);
    }
    assert.equal(P.length,12956);
    let events=0;
    const recovered=[P[0]]; // The first emitted rune transmits its seed state.
    for(let t=1;t<P.length;t++) {
      const difference=(C[t]-C[t-1]+29)%29;
      recovered.push(difference===0 ? marker :
        (difference-1<marker ? difference-1 : difference));
      assert.equal(C[t]===C[t-1],P[t]===marker);
      events+=Number(C[t]===C[t-1]);
    }
    assert.deepEqual(recovered,P,"Blind marker observation + reversible rank28 inverse");
    plant={sourceGP:12956,marker:corpus.translit[marker],
      encodedCipherRunes:C.length,
      directMarkerEventPositionsRecovered:events,
      observedMarkerPositionsInNativePlant:P.slice(1)
        .filter(x=>x===marker).length,
      GPPlaintextRunesExactlyRecovered:recovered.length,
      exactWholeCipherReversible:true};
  }
}
const report={
  classification:"Key-free Latin GP fixed-repeat-marker model excluded under source-word preservation",
  source:{
    reference:"Eight pinned Latin Vulgate original files, word-segmented GP29",
    words:sourceWords.length,GPWordRunes:204802,
    exactCipherWords:ciphertextWords.length,
    exactCipherRunes:12956
  },
  original:{totalRepeatEvents:observed[0],wordInitial:observed[1],
    wordFinal:observed[2]},
  criterion:"One unchanged GP plaintext marker must cause every original adjacent-equal ciphertext pair",
  candidates:29,eligibleLabels:eligible.map(k=>corpus.translit[k]),
  eligibleCriterion:"5 source standard deviations around observed marker total; selected before full profile score",
  bestOriginal:actual[0],allEligible:actual,
  sourceMatchedNull:{replicates:REPS,seed:"0x0a113330",
    refitAllEligibleEachTrial:true,
    familyScoreMethod:"minimum sum of three standardized squared deviations",
    atLeastAsExtremeAsOriginal:atLeast,
    upperTailAddOne:(atLeast+1)/(REPS+1),
    meanMinimum:totalScore/REPS,largestMinimum:largest},
  sourceNativePlant:plant,
  limits:"Source-conditional only: the words/lengths are real Latin Vulgate GP, and all original ciphertext word boundaries are treated as genuine plaintext word boundaries. Latin codebooks with different spelling, marker-specific word transforms, changing markers, hidden key skips or untransformed English may escape."
};
process.stdout.write(JSON.stringify(report,null,2)+"\n");
