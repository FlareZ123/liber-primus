'use strict';
/**
 * LP2 p15 red 4+5-rune title: GP prime-value sum relation to Fibonacci square.
 * Exact observations are reproducible, but the relationship was post-selected.
 * No plaintext, cryptographic key, or formal discovery p-value is claimed.
 * Node.js 22 CommonJS: node sims/fibonacci_title_gematria_alignment.cjs.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const {readSquare,clockwiseSpiral,uniqueFibonacciPrimeRanks,primeList}=
  require('./fibonacci_prime_spiral.cjs');
const ROOT=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const gpPrimes=primeList(29);
const sum=s=>[...s].reduce((n,r)=>{
  assert.ok(runeIndex.has(r));
  return n+gpPrimes[runeIndex.get(r)];
},0);
function run(){
  const parsed=parseSharedCorpus();
  assert.equal(parsed.words.length,2896);
  assert.equal(parsed.runeCount,12956);
  const words=parsed.words.map(x=>x.runes);
  const first='ᚠᚢᛚᛗ',second='ᚪᛠᚣᛟᚪ';
  const at=words.findIndex((w,i)=>w===first&&words[i+1]===second);
  assert.ok(at>=0);
  assert.deepEqual(gp.pages.find(p=>p.page===15).indices.slice(0,9),
    [...first+second].map(r=>runeIndex.get(r)));
  const title=[sum(first),sum(second)];
  assert.deepEqual(title,[149,489]);
  assert.equal(title[0]+title[1],29*22);
  const ranks=uniqueFibonacciPrimeRanks();
  const allPrimes=primeList(ranks.at(-1));
  const selected=ranks.map(r=>allPrimes[r-1]);
  assert.deepEqual(clockwiseSpiral().map(([r,c])=>readSquare()[r][c]),
    selected.map(p=>Math.abs(3301-p)));
  const middle=selected.indexOf(title[0]);
  assert.equal(middle,8);
  assert.equal(ranks[middle],35);
  assert.equal(ranks[middle-1],22);
  assert.equal(selected[middle-1],79);
  const four=words.filter(w=>[...w].length===4).map(sum);
  const five=words.filter(w=>[...w].length===5).map(sum);
  assert.equal(four.length,513);
  assert.equal(five.length,317);
  assert.equal(four.filter(x=>x===149).length,1);
  assert.equal(five.filter(x=>x>=489).length,1);
  const targets=[];
  for(let i=1;i<ranks.length;i++){
    const a=selected[i],b=29*ranks[i-1]-a;
    if(a>=4*2&&a<=4*109&&b>=5*2&&b<=5*109)
      targets.push({first:a,second:b,previousOrdinal:ranks[i-1],
        currentOrdinal:ranks[i]});
  }
  assert.deepEqual(targets.map(t=>[t.first,t.second]),
    [[13,103],[23,151],[43,218],[79,327],[149,489]]);
  let cartesian=0;
  for(const t of targets)cartesian+=
    four.filter(x=>x===t.first).length*five.filter(x=>x===t.second).length;
  assert.equal(cartesian,3);
  const sourcePairs=[];
  for(let i=0;i<words.length-1;i++)
    if([...words[i]].length===4&&[...words[i+1]].length===5)
      sourcePairs.push({i,first:sum(words[i]),second:sum(words[i+1])});
  assert.equal(sourcePairs.length,74);
  const matches=sourcePairs.filter(x=>targets.some(t=>t.first===x.first&&t.second===x.second));
  assert.deepEqual(matches,[{i:at,first:149,second:489}]);
  const expected=sourcePairs.length*cartesian/(four.length*five.length);
  return {
    status:'exact exploratory arithmetic relationship; mechanism unproven',
    source:'LP2 page15, red title followed by 4x4 Fibonacci-indexed prime square',
    title:{runeWordLengths:[4,5],wordPrimeSums:title,totalPrimeSum:638,
      firstPrimeMatchesSquare:149,itsFibonacciPrimeOrdinal:35,
      titleTotalDividedByAlphabetSize:22,
      precedingSquarePrimeOrdinal:22,precedingSquarePrime:79},
    corpus:{words:words.length,fourRuneWords:four.length,
      fiveRuneWords:five.length,uniqueFourRuneSum149:1,
      fiveRuneSumsAtLeast489:1,adjacent4to5Pairs:sourcePairs.length},
    relation:'For consecutive spiral primes p_(F_i+1), require sum(first word)=later prime and sum(both words)=29*(previous prime ordinal)',
    targetSumPairs:targets,matches,
    wordLengthStratifiedPermutation:{
      combinations:four.length*five.length,successfulPairs:cartesian,
      expectedCountAcross74Slots:expected,
      unionBoundForAtLeastOne:expected,
      interpretation:'Descriptive conditional rarity only; the relation was discovered after viewing the title, so this is not a preregistered significance test.'
    },
    caveat:'No recovered runic plaintext or key. A valid decipherment must exactly regenerate independent original ciphertext.'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sum,run};
