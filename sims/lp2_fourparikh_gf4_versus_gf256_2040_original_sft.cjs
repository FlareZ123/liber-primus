'use strict';
/**
 * ORIGINAL held-out fourth Parikh anagram against the earlier 2,040 AES/RS
 * GF256/radix-59-or-60/sign/seed keyed whole-word→p8 source receivers.
 * The 3/3 AES-field seed237 configuration was *already fitted* to only the
 * first three original identical scroll-word pairs and is frozen here.
 *
 * Windows Node22 single-file test:
 *   node sims/lp2_fourparikh_gf4_versus_gf256_2040_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const folder=path.join(__dirname,'..','resources','liber-primus');
/** @param {string} name @returns {string} */
const read=name=>fs.readFileSync(path.join(folder,name),'utf8');
const gp=JSON.parse(read('lp2-corpus.json'));
const grid=JSON.parse(read('lp2-grid-256.json'));
const parts=read('lp2-transcription.txt').split('%');
const map=new Map(gp.runes.map((v,i)=>[v,i]));
const words=[],c=gp.pages.find(p=>p.page===8).indices;
let pending=[];
for(let page=3;page<=7;page++)
  for(const ch of parts[page]){
    if(map.has(ch))pending.push(map.get(ch));
    else if((ch==='-'||ch==='.')&&pending.length){
      words.push(pending);
      pending=[];
    }
  }
if(pending.length)words.push(pending);
assert.equal(words.length,255);
assert.equal(c.length,255);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices));
const pairs=[[47,240],[48,231],[235,236],[88,179]];
for(const [i,j] of pairs)
  assert.deepEqual([...words[i]].sort((a,b)=>a-b),
    [...words[j]].sort((a,b)=>a-b));
for(const [i,j] of pairs.slice(0,3))assert.deepEqual(words[i],words[j]);
assert.deepEqual(words[88],[12,14]);
assert.deepEqual(words[179],[14,12]);
assert.notDeepEqual(words[88],words[179]);
/** @param {number} v @returns {number} */
const mod=v=>((v%29)+29)%29;
const actual=pairs.map(([i,j])=>mod(c[i]-c[j]));
assert.deepEqual(actual,[8,18,14,25]);
const tokens=grid.pages.flatMap(p=>p.tokens);
const alphabet59=grid.alphabet.replace('f','');
const table59=tokens.map(t=>59*alphabet59.indexOf(t[0])+alphabet59.indexOf(t[1]));
assert.equal(table59.length,256);
assert(table59.every(v=>v>=0&&v<=251));
const table60=grid.bytes;
/** @param {number} a @param {number} b @param {number} poly @returns {number} */
function gfMul(a,b,poly){
  let out=0;
  while(b){
    if(b&1)out^=a;
    b>>>=1;
    const carry=a&128;
    a=(a<<1)&255;
    if(carry)a^=poly&255;
  }
  return out;
}
const matchCounts=Array(5).fill(0),threeOrFour=[];
for(const [field,poly,mult] of [['RS-11D',0x11D,2],['AES-11B',0x11B,3]]){
  for(const [radix,table] of [[59,table59],[60,table60]]){
    for(const sign of [-1,1]){
      for(let seed=1;seed<=255;seed++){
        const addresses=[];
        let state=seed;
        for(let i=0;i<255;i++){
          addresses.push(state);
          state=gfMul(state,mult,poly);
        }
        assert.equal(state,seed);
        assert.equal(new Set(addresses).size,255);
        const predicted=pairs.map(([i,j])=>
          mod(sign*(table[addresses[j]]-table[addresses[i]])));
        const matches=predicted.filter((v,i)=>v===actual[i]).length;
        matchCounts[matches]++;
        if(matches>=3)threeOrFour.push({field,radix,sign,seed,predicted,matches});
      }
    }
  }
}
assert.deepEqual(matchCounts,[1791,233,15,1,0]);
assert.deepEqual(threeOrFour,[{field:'AES-11B',radix:59,sign:-1,
  seed:237,predicted:[8,18,14,8],matches:3}]);
// The exact original 3/3 fitted seed237 fails the truly unseen fourth
// black/red reversed-rune pair without a posthoc phase or key change.
assert.equal(threeOrFour[0].predicted[3],8);
assert.equal(actual[3],25);
console.log(JSON.stringify({priorOriginalThreePairAESSeed:237,
  originalFourPairDifferences:actual,priorAESPrediction:threeOrFour[0].predicted,
  differenceAtUnseenAnagram:mod(actual[3]-threeOrFour[0].predicted[3]),
  full2040CandidateDistribution:matchCounts,
  fourOfFourCandidates:0,previousThreeOfThreeCandidateCount:1},null,2));
console.log('PASS: the newly found original p8 fourth Parikh pair rejects all prior 2040 GF256 historical-field candidates; no plaintext claimed.');
