"use strict";
/**
 * Exact unknown eight-column word-order inversion against original LP2.
 *
 * Model: for each consecutive block of 8 printed rune words, a single secret
 * permutation maps ciphertext word positions to plaintext word positions.
 * Original word lengths are unaltered, and block phase is fixed at book origin.
 * This is a CONDITIONAL language-model attack; no LP2 plaintext is inferred
 * from a training-score improvement alone.
 *
 * Execute: node sims/word_block_hamiltonian_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const B = 8;
const ALPHABET = new Set([
  "F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
  "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"
]);
const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
const printed = original.words.map(w => w.length);
const pageGroups = original.byStartPage.map(bucket => {
  const indices = [];
  for (let i=0; i<original.words.length; i++)
    if (original.words[i].startPage === original.byStartPage.indexOf(bucket))
      indices.push(i);
  return indices;
});
assert.equal(pageGroups.flat().length, printed.length);
const control = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");

/** GP word width; follows the repository's exact QU/V/K/Z and digraph rules. */
function gpLength(raw) {
  const w = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let total = 0;
  for (let i=0; i<w.length;) {
    if (ALPHABET.has(w.slice(i,i+2))) {
      i+=2; total++;
    } else {
      if (ALPHABET.has(w[i])) total++;
      i++;
    }
  }
  return total;
}
const controlLengths = (control.match(/[A-Za-z]+/g)||[])
  .map(gpLength).filter(n => n>0);
assert.ok(controlLengths.length >= 38000);

/** 7-level GP word-length Markov log-odds, trained off the positive-control region. */
function trainReference() {
  const cats=7,bin=n=>Math.min(cats-1,n-1);
  const count=Array.from({length:cats},()=>new Float64Array(cats));
  const from=new Float64Array(cats),to=new Float64Array(cats);
  for (let i=1;i<30000;i++) {
    const a=bin(controlLengths[i-1]),b=bin(controlLengths[i]);
    count[a][b]++;from[a]++;to[b]++;
  }
  const weights=Array.from({length:cats},(_,i)=>Array.from(
    {length:cats},(_,j)=>Math.log((count[i][j]+2)/(from[i]+2*cats))
      -Math.log((to[j]+2*cats)/(29999+2*cats*cats))));
  return (x,y)=>weights[bin(x)][bin(y)];
}
const logOdds = trainReference();
const blockCount = Math.floor(printed.length/B);
const trainBlocks = Math.floor(blockCount*0.6);
const cutoff = trainBlocks*B;
const end = blockCount*B;
const identity = Array.from({length:B},(_,i)=>i);

/**
 * Exact max-weight Hamiltonian cycle with one special between-block edge.
 * Every secret permutation of the eight columns is covered (8!=40320).
 * DP reconstructs the winning order, including its cyclic starting position.
 */
function fit(y) {
  const W=Array.from({length:B},()=>new Float64Array(B));
  const X=Array.from({length:B},()=>new Float64Array(B));
  for(let k=0;k<trainBlocks;k++) {
    const at=k*B;
    for(let i=0;i<B;i++)for(let j=0;j<B;j++)if(i!==j) {
      W[i][j]+=logOdds(y[at+i],y[at+j]);
      if(k+1<trainBlocks) X[i][j]+=logOdds(y[at+i],y[at+B+j]);
    }
  }
  const subsets=1<<B,full=subsets-1;
  let best={score:-Infinity,pi:[]};
  for(let start=0;start<B;start++) {
    const dp=new Float64Array(subsets*B).fill(-Infinity);
    const predecessor=new Int8Array(subsets*B).fill(-1);
    dp[(1<<start)*B+start]=0;
    for(let mask=0;mask<subsets;mask++)if(mask&(1<<start)) {
      for(let last=0;last<B;last++)if(mask&(1<<last)) {
        const old=dp[mask*B+last];
        if(old===-Infinity)continue;
        for(let next=0;next<B;next++)if(!(mask&(1<<next))) {
          const at=(mask|(1<<next))*B+next;
          const value=old+W[last][next];
          if(value>dp[at]) {
            dp[at]=value;
            predecessor[at]=last;
          }
        }
      }
    }
    for(let last=0;last<B;last++) {
      const score=dp[full*B+last]+X[last][start];
      if(score>best.score) {
        const path=[];
        let mask=full,here=last;
        while(mask) {
          path.push(here);
          const old=predecessor[mask*B+here];
          mask^=1<<here;
          if(old<0)break;
          here=old;
        }
        best={score,pi:path.reverse()};
      }
    }
  }
  assert.equal(best.pi.length,B);
  assert.equal(new Set(best.pi).size,B);
  return best;
}
/** GP word-length sequence heldout likelihood under a frozen permutation. */
function heldout(y,pi) {
  let value=0,links=0;
  for(let at=cutoff;at+B<=end;at+=B) {
    for(let j=1;j<B;j++){
      value+=logOdds(y[at+pi[j-1]],y[at+pi[j]]);
      links++;
    }
    if(at+2*B<=end){
      value+=logOdds(y[at+pi[B-1]],y[at+B+pi[0]]);
      links++;
    }
  }
  return {value,links};
}
function seeded(seed){
  let state=seed|0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}
function permute(a,random) {
  const result=a.slice();
  for(let i=result.length-1;i>0;i--) {
    const k=random()%(i+1);
    [result[i],result[k]]=[result[k],result[i]];
  }
  return result;
}
/** Preserve every original physical page's word-length multiset. */
function pageShuffle(random) {
  const y=printed.slice();
  for(const group of pageGroups) {
    for(let j=group.length-1;j>0;j--) {
      const k=random()%(j+1);
      const left=group[j],right=group[k];
      [y[left],y[right]]=[y[right],y[left]];
    }
  }
  return y;
}
/** Independent genuine-GP positive plant encrypted by an unknown fixed 8-column route. */
function positiveControl(random) {
  const truePlain=controlLengths.slice(35000,35000+end);
  assert.equal(truePlain.length,end);
  const secret=permute(identity,random);
  const cipher=truePlain.slice();
  for(let k=0;k<blockCount;k++)for(let i=0;i<B;i++)
    cipher[k*B+secret[i]]=truePlain[k*B+i];
  const found=fit(cipher);
  let correct=0;
  for(let i=0;i<end;i++)
    correct+=Number(cipher[Math.floor(i/B)*B+found.pi[i%B]]===truePlain[i]);
  return {
    secret,recovered:found.pi,exactKey:secret.every((n,i)=>n===found.pi[i]),
    recoveredWordLengths:correct,totalWordLengths:end,
    heldoutGain:heldout(cipher,found.pi).value-heldout(cipher,identity).value
  };
}
/**
 * Exact whole-source comparison for a second, Latin GP word-length register.
 * Sliding windows retain all source-adjacent length pairs, with O(words) updates.
 * This is a source-specific structural control, not an LP2 cipher inversion.
 */
function latinWindowComparison() {
  const content=fs.readFileSync(path.join(
    ROOT,"resources/control/latin-vulgate-gp-wholewords.txt"),"utf8");
  const latin=content.split(/\r?\n/u).map(w=>w.trim())
    .filter(w=>/^[0-9A-S]+$/u.test(w)).map(w=>w.length);
  assert.equal(latin.length,39835);
  const bin=n=>n<=2?0:n<=5?1:2;
  /** @param {Int32Array} counts @param {number} pairs */
  function chi(counts,pairs) {
    const row=new Int32Array(3),col=new Int32Array(3);
    for(let x=0;x<3;x++)for(let y=0;y<3;y++){
      const v=counts[3*x+y];row[x]+=v;col[y]+=v;
    }
    let value=0;
    for(let x=0;x<3;x++)for(let y=0;y<3;y++){
      const expect=row[x]*col[y]/pairs;
      if(expect>0)value+=(counts[3*x+y]-expect)**2/expect;
    }
    return value;
  }
  /** @param {number[]} words @param {number} first @param {number} length */
  function initial(words,first,length) {
    const counts=new Int32Array(9);
    for(let i=first+1;i<first+length;i++)
      counts[3*bin(words[i-1])+bin(words[i])]++;
    return counts;
  }
  const originalChi=chi(initial(printed,0,printed.length),printed.length-1);
  const pairs=printed.length-1;
  const counts=initial(latin,0,printed.length);
  const windowChi=[];
  for(let start=0;start+printed.length<=latin.length;start++){
    windowChi.push(chi(counts,pairs));
    if(start+printed.length<latin.length) {
      counts[3*bin(latin[start])+bin(latin[start+1])]--;
      counts[3*bin(latin[start+printed.length-1])
        +bin(latin[start+printed.length])]++;
    }
  }
  windowChi.sort((a,b)=>a-b);
  const atMost=windowChi.filter(x=>x<=originalChi).length;
  assert.ok(Math.abs(originalChi-3.949446088360591)<1e-8);
  assert.equal(windowChi.length,36940);
  assert.equal(atMost,0);
  return {
    source:"resources/control/latin-vulgate-gp-wholewords.txt",
    latinGpWords:latin.length,sourceWindows:windowChi.length,
    windowWordCount:printed.length,categoryLengths:["1-2","3-5","6+"],
    originalChiSquare:originalChi,
    latinMinChiSquare:windowChi[0],
    latinMedianChiSquare:windowChi[Math.floor(windowChi.length/2)],
    windowsAtOrBelowOriginal:atMost,
    limitation:"Overlapping windows are dependent; finite Latin-source comparison, not a genre-wide p-value or decrypted text."
  };
}
function main() {
  const actualFit=fit(printed);
  const originalDelta=heldout(printed,actualFit.pi).value
    -heldout(printed,identity).value;
  const random=seeded(0x32a71b2c);
  const repetitions=1000;
  const values=[],tail=[];
  let exceed=0;
  for(let i=0;i<repetitions;i++) {
    const y=pageShuffle(random),candidate=fit(y);
    const gain=heldout(y,candidate.pi).value-heldout(y,identity).value;
    values.push(gain);
    exceed+=Number(gain>=originalDelta);
  }
  const plant=positiveControl(seeded(0x32a71b2c));
  assert.equal(plant.exactKey,true,"positive plant must recover its true key");
  assert.equal(plant.recoveredWordLengths,end);
  values.sort((a,b)=>a-b);
  const results={
    status:"conditional original-cipher inverse; no unknown plaintext or key recovered",
    source:{originalRuneWords:printed.length,originalRunes:original.runeCount,
      reference:"resources/control/shakespeare_first300k.txt",
      sourceControlTrainingGPWords:30000,positiveControlOffset:35000},
    model:"global zero-phase fixed 8-column permutation of intact word lengths",
    exactSecretKeyspace:40320,
    trainingWordCount:cutoff,heldoutWordCount:end-cutoff,
    original:{
      inferredPermutation:actualFit.pi,trainingLogOdds:actualFit.score,
      heldoutLogOdds:heldout(printed,actualFit.pi),
      identityHeldoutLogOdds:heldout(printed,identity),
      heldoutGain:originalDelta
    },
    matchedPageShuffles:{
      seed:"0x32a71b2c",iterations:repetitions,
      refitPermutationEachTime:true,
      source:"shuffle word lengths only among words beginning on each original physical page",
      atLeastOriginal:exceed,addOneUpperTail:(exceed+1)/(repetitions+1),
      meanGain:values.reduce((a,b)=>a+b,0)/repetitions,
      p05:values[Math.floor(repetitions*.05)],
      median:values[Math.floor(repetitions*.5)],
      p95:values[Math.floor(repetitions*.95)]
    },
    positivePlant:plant,
    independentLatinWordOrderControl:latinWindowComparison()
  };
  console.log(JSON.stringify(results,null,2));
}
if(require.main===module) main();
module.exports={fit,heldout,positiveControl};
