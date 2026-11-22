"use strict";
/**
 * Physical p32/p55 twin-tree source: exact 45-insertion affine subsequence.
 *
 * Source: matching p32/p55 tree illustrations with red 13-dot terminals,
 * original rune lengths 121 and 76, difference 45. The authenticated
 * 2016 signed plaintext has exactly 45 whitespace-delimited source tokens.
 * Hypothesis: the 121-runic longer tree page contains an *order-preserving*
 * copy of the 76-runic shorter page plus 45 inserted runes, where the
 * copied runes may be encrypted under any fixed unknown invertible affine
 * GP29 relabeling. All 812 (a≠0,b) maps, all four paired reading
 * orientations, and EVERY placement of 45 insertions are covered by exact
 * dynamic-programming longest common subsequence, without selecting
 * positions or keys.
 *
 * A full copy would have LCS=76. Direct source output <76 disproves
 * the stated hypothesis for every secret affine map and insertion scheme.
 *
 * Node22 Windows11 CommonJS read-only SFT:
 * node sims/lp2_p32_p55_45insert_affine_subsequence_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const sourceSigned=fs.readFileSync(path.join(root,
  "resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const a=gp.pages.find(p=>p.page===32).indices;
const b=gp.pages.find(p=>p.page===55).indices;
assert.equal(a.length,121);
assert.equal(b.length,76);
assert.equal(a.length-b.length,45);
const signedBody=sourceSigned.split("Hash: SHA1\n\n")[1]
  .split("-----BEGIN PGP SIGNATURE-----")[0];
assert.equal(signedBody.trim().split(/\s+/u).length,45);
assert.equal(gp.translit.length,29);
/**
 * Fast exact LCS dynamic programming. A missing/rune insertion position
 * is completely unrestricted. No heuristic alignment or bounded window.
 * @param {number[]} first
 * @param {number[]} second
 * @returns {number}
 */
function lcs(first,second){
 const dp=new Uint8Array(second.length+1);
 for(let i=0;i<first.length;i++){
  let prior=0;
  const rune=first[i];
  for(let j=1;j<=second.length;j++){
   const old=dp[j];
   dp[j]=rune===second[j-1]?prior+1:Math.max(dp[j-1],dp[j]);
   prior=old;
  }
 }
 return dp[second.length];
}
assert.equal(lcs(a,b),28);
const hits=[];
for(const reversedA of [false,true]){
 const x=reversedA?a.toReversed():a;
 for(const reversedB of [false,true]){
  const y=reversedB?b.toReversed():b;
  for(let multiplier=1;multiplier<29;multiplier++){
   for(let intercept=0;intercept<29;intercept++){
    const relabeled=x.map(v=>(multiplier*v+intercept)%29);
    hits.push({
     lcs:lcs(relabeled,y),multiplier,intercept,reversedA,reversedB
    });
   }
  }
 }
}
assert.equal(hits.length,3248);
hits.sort((x,y)=>y.lcs-x.lcs);
assert.equal(hits[0].lcs,33);
assert.deepEqual(hits[0],{lcs:33,multiplier:6,intercept:2,
 reversedA:false,reversedB:false});
assert.equal(hits.filter(h=>h.lcs===b.length).length,0);

// Independent positive: choose 76 increasing source positions, delete 45,
// apply actual secret affine permutation. Full 76/76 positions should be
// exactly recoverable by the SAME original all-key exhaustive search.
const positions=Array.from({length:76},(_,i)=>Math.floor(i*120/75));
assert.equal(new Set(positions).size,76);
const encrypted=positions.map(i=>(7*a[i]+13)%29);
assert.equal(lcs(a.map(x=>(7*x+13)%29),encrypted),76);
let bestPlant=0;
for(const ar of [a,a.toReversed()])
for(const br of [encrypted,encrypted.toReversed()])
for(let mult=1;mult<29;mult++)
for(let inc=0;inc<29;inc++){
 const transformed=ar.map(x=>(mult*x+inc)%29);
 bestPlant=Math.max(bestPlant,lcs(transformed,br));
}
assert.equal(bestPlant,76);
console.log(JSON.stringify({
 originalPage32Runes:a.length,originalPage55Runes:b.length,
 deletedOrInsertedCount:a.length-b.length,
 independentlySignedSourceTokens:45,
 source:"twin tree page images and unmodified GP29 ciphertext",
 candidateMaps:812,orientationPairs:4,
 originalDirectLcs:lcs(a,b),
 originalMaxAffineLcs:hits[0].lcs,
 originalBestParameters:hits.slice(0,6),
 exactMissingPositionsAtBest:76-hits[0].lcs,
 requiredUnderHypothesis:76,
 plantedFullKeySearchMatches:bestPlant,
 plantedDeletedPositions:45,
 decision:"No possible 45-rune insertion into p32 of any fixed affine image of all 76 p55 runes, for any of 812 keys and either orientation. Does not constrain arbitrary nonlinear, stateful or independently keyed encodings."
},null,2));
console.log("PASS: original 121/76 tree pages and 45 signed tokens, exhaustive 3248 affine/reversal subsequence alignments, full 76/76 real planted recovery.");
