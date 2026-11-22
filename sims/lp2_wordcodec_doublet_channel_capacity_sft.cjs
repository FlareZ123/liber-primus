"use strict";
/**
 * Reproducible finite-alphabet cardinality/rate bound for the authentic LP2
 * within-word and between-word rare-doublet counts. The same-size,
 * word-boundary-preserving rate bound holds for ALL 29-symbol plaintexts.
 *
 * It is a conditional theorem for ciphers which GUARANTEE the output cap,
 * not a proof about the unknown LP2 cipher.
 *
 * Run on Windows 11: node sims/lp2_wordcodec_doublet_channel_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const source = parseSharedCorpus();
assert.equal(source.runeCount,12956);
assert.equal(source.words.length,2896);
assert.equal(source.crossPageWords,32);
let withinPairs=0,withinEqual=0,crossPairs=0,crossEqual=0;
for(const w of source.words){
  const r=[...w.runes];
  withinPairs+=r.length-1;
  for(let i=1;i<r.length;i++)withinEqual+=Number(r[i]===r[i-1]);
}
withinPairs-=source.crossPageWords;
for(let i=1;i<source.words.length;i++){
  const a=source.words[i-1],b=source.words[i];
  if(a.endPage===b.startPage){
    crossPairs++;
    crossEqual+=Number(a.runes.at(-1)===b.runes[0]);
  }
}
assert.deepEqual(
  {withinPairs,withinEqual,crossPairs,crossEqual},
  {withinPairs:10028,withinEqual:63,crossPairs:2873,crossEqual:23}
);
const withinPagePairs=withinPairs+crossPairs;
assert.equal(withinPagePairs,12901);
assert.equal(withinEqual+crossEqual,86);

/**
 * Return ln Pr[Binomial(n,1/29) <= k] via log-sum-exp, without
 * evaluating an exponentially small probability in floating point.
 * @param {number} n @param {number} k @returns {number}
 */
function logCumulative(n,k){
  const p=1/29;
  let logPmf=n*Math.log1p(-p),max=logPmf;
  const rows=[logPmf];
  for(let i=0;i<k;i++){
    logPmf+=Math.log(n-i)-Math.log(i+1)+Math.log(p)-Math.log1p(-p);
    rows.push(logPmf);
    max=Math.max(max,logPmf);
  }
  return max+Math.log(rows.reduce((sum,lp)=>sum+Math.exp(lp-max),0));
}
/** @param {number} n @param {number} k @returns {number} */
function deficitBits(n,k){return -logCumulative(n,k)/Math.LN2;}
const withinDeficit=deficitBits(withinPairs,withinEqual);
const betweenDeficit=deficitBits(crossPairs,crossEqual);
const combinedBits=withinDeficit+betweenDeficit;
const unstratifiedBits=deficitBits(withinPagePairs,withinEqual+crossEqual);
const minSideChannelBits=Math.ceil(combinedBits);
const minExpansionRunes=Math.ceil(combinedBits/Math.log2(29));
assert(Math.abs(withinDeficit-263.1583240406082)<1e-8);
assert(Math.abs(betweenDeficit-66.00189415603242)<1e-8);
assert(Math.abs(unstratifiedBits-325.4502541839801)<1e-8);
assert.equal(minSideChannelBits,330);
assert.equal(minExpansionRunes,68);

// Synthetic baseline mathematical check: a totally no-repeat successor
// alphabet has only 28 choices for each non-page-first output rune,
// requiring 12901*log2(29/28) bits of additional channel capacity.
const noRepeatBits=withinPagePairs*Math.log2(29/28);
assert(Math.abs(noRepeatBits-653.1269686756573)<1e-8);

console.log(JSON.stringify({
  status:"PASS",
  source:{runes:source.runeCount,words:source.words.length,
    runeBearingPages:55,joinedPageCarryWords:source.crossPageWords,
    samePageWithinWord:{opportunities:withinPairs,equal:withinEqual},
    samePageCrossWord:{opportunities:crossPairs,equal:crossEqual},
    totalSamePage:{opportunities:withinPagePairs,equal:withinEqual+crossEqual}},
  theorem:{
    condition:"fixed length and breaks; encoder guarantees at most source repeat counts in each independent adjacency stratum for every arbitrary GP29 input",
    observation:"The exact original source is one output; its rarity alone cannot prove an encoder-wide cap",
    reference:"29-symbol uniform source, each consecutive equality independent with probability 1/29",
    withinWordDeficitBits:withinDeficit,
    betweenWordDeficitBits:betweenDeficit,
    combinedDeficitBits:combinedBits,
    unstratifiedDeficitBits:unstratifiedBits,
    minExternalChannelBits:minSideChannelBits,
    minAdditionalGP29SymbolsWithoutSideChannel:minExpansionRunes,
    strictNoRepeatAllSamePageBits:noRepeatBits
  }
},null,2));