'use strict';

/**
 * LP2 p53 source-marked 11-rune inversion under the *authentic* LP2 p56
 * prime-totient key with rejection/skip when an attempted ciphertext symbol
 * equals the previous visible symbol. At most two rejected prime-key draws
 * are permitted inside the independently fixed 11-rune anchor.
 *
 * Unlike arbitrary two-error key matching, a proposed skip must satisfy
 * an exact, plaintext-independent rejected-output congruence.
 *
 * Run: node sims/red_verse_prime_collision_anchor.cjs
 */
const assert=require('node:assert/strict');
const {dictionary,source}=require('./red_verse_second_order_key.cjs');
const {totientPrimes,variations}=require('./red_verse_prime_totient_anchor.cjs');
const mod=n=>(n%29+29)%29;
const MAX_START=Number(process.env.COLLISION_ANCHOR_STARTS||50000);
const SKIP_LIMIT=2;
assert.ok(Number.isInteger(MAX_START)&&MAX_START>=1000&&MAX_START<=200000);

/**
 * Backsolve one 11-rune anchor under key rejection. A skipped draw would
 * have produced the preceding visible ciphertext rune, a necessary
 * state-transition condition that eliminates most hypothetical skips.
 * @param {number[]} carrier 11 cipher runes under raw/atbash alphabet.
 * @param {Uint8Array} key Sufficient prime-totient key schedule.
 * @param {number} keyStart Prime-key index for the first anchor rune.
 * @param {-1|1} sign Plain relation P = carrier + sign * K modulo 29.
 * @param {Map<string,{english:string,freq:number}>} lexicon Dictionary GP keys.
 * @returns {Array<{word:string,frequency:number,keyStart:number,skips:number[],used:number,plain:number[]}>}
 */
function invertAnchor(carrier,key,keyStart,sign,lexicon) {
  assert.equal(carrier.length,11);
  const work=new Int8Array(11),locations=[];
  const matches=[];
  function search(i,skips) {
    if(i===11) {
      const hit=lexicon.get(Array.from(work).join(','));
      if(hit)matches.push({word:hit.english,frequency:hit.freq,keyStart,
        skips:locations.slice(),used:skips,plain:Array.from(work)});
      return;
    }
    const offset=keyStart+i+skips;
    const choices=i===0?0:Math.min(2-skips,2);
    for(let take=0;take<=choices;take++){
      const currentKey=key[offset+take];
      const p=mod(carrier[i]+sign*currentKey);
      let valid=true;
      for(let j=0;j<take;j++) {
        // The earlier attempted output under this SAME plaintext symbol
        // must have equalled the previous visible ciphertext rune.
        const wouldBe=mod(p-sign*key[offset+j]);
        if(wouldBe!==carrier[i-1]){valid=false;break;}
      }
      if(!valid)continue;
      work[i]=p;
      for(let j=0;j<take;j++)locations.push(i);
      search(i+1,skips+take);
      locations.length-=take;
    }
  }
  search(0,0);
  return matches;
}

/**
 * Find all source-compatible key starts on the fixed real red anchor.
 * Four reading orders, raw/atbash carrier, two key signs: 16 cases.
 * @param {{cipher:number[],lengths:number[],name:string}} reading
 * @param {Uint8Array} key
 * @param {Map<string,{english:string,freq:number}>} lexicon
 * @param {number} max
 */
function searchReading(reading,key,lexicon,max) {
  const index=reading.lengths.indexOf(11);
  assert.ok(index>=0);
  const start=reading.lengths.slice(0,index).reduce((a,b)=>a+b,0);
  const anchor=reading.cipher.slice(start,start+11);
  assert.ok(!anchor.includes(0),'No F interrupter within fixed anchor');
  const results=[];
  for(const flip of [false,true])for(const sign of [-1,1]) {
    const carrier=anchor.map(c=>flip?28-c:c);
    const row={orientation:reading.name,flip,sign,anchorRuneOffset:start,
      scannedStarts:max,matchesBySkipCount:[0,0,0],candidates:[]};
    for(let keyStart=0;keyStart<max;keyStart++) {
      const hits=invertAnchor(carrier,key,keyStart,sign,lexicon);
      for(const h of hits) {
        row.matchesBySkipCount[h.used]++;
        if(row.candidates.length<20)row.candidates.push({
          word:h.word,primeKeyStart:keyStart,skipLocations:h.skips,
          keyDraws:h.used,frequency:h.frequency});
      }
    }
    results.push(row);
  }
  return results;
}

/**
 * Forward cipher with rejection; an attempted repeated symbol consumes a key
 * draw and is never released. This is a deliberately stringent model.
 * @param {number[]} plaintext
 * @param {Uint8Array} key
 * @param {number} firstPrime
 * @param {-1|1} sign
 */
function encryptWithRejection(plaintext,key,firstPrime,sign){
  const cipher=[],skips=[];
  let counter=firstPrime;
  for(let i=0;i<plaintext.length;i++){
    const p=plaintext[i];
    let tries=0,c;
    while(true){
      c=mod(p-sign*key[counter++]);
      if(i===0||c!==cipher[i-1])break;
      skips.push(i);
      assert.ok(++tries<10);
    }
    cipher.push(c);
  }
  return {cipher,skips,finalPrime:counter};
}

function positiveControl(dict,key){
  const lengths=source().lengths;
  const byLength=new Map();
  for(const [code,entry] of dict.byCode){
    if(entry.freq<30)continue;
    const gp=code.split(',').map(Number);
    if(!byLength.has(gp.length))byLength.set(gp.length,[]);
    byLength.get(gp.length).push({gp,entry});
  }
  const plaintext=[];
  for(let w=0;w<lengths.length;w++){
    const choices=byLength.get(lengths[w]);
    assert.ok(choices.length>=10);
    const selected=choices[(w*5+1)%choices.length].gp;
    plaintext.push(...selected);
  }
  const anchorStart=lengths.slice(0,3).reduce((a,b)=>a+b,0);
  assert.equal(anchorStart,13);
  let chosen=null;
  for(let firstPrime=3200;firstPrime<4400;firstPrime++){
    const out=encryptWithRejection(plaintext,key,firstPrime,-1);
    const within=out.skips.filter(i=>i>=anchorStart&&i<anchorStart+11);
    if(within.length===2) {chosen={firstPrime,...out,within};break;}
  }
  assert.ok(chosen,'Planted two-rejection source not found');
  const before=chosen.skips.filter(i=>i<anchorStart).length;
  const anchorKeyStart=chosen.firstPrime+anchorStart+before;
  const anchor=chosen.cipher.slice(anchorStart,anchorStart+11);
  const matching=invertAnchor(anchor,key,anchorKeyStart,-1,dict.byCode);
  const expected=plaintext.slice(anchorStart,anchorStart+11);
  const hit=matching.find(x=>x.used===2&&
    x.skips.every((v,i)=>v===chosen.within[i]-anchorStart)&&
    x.plain.every((v,i)=>v===expected[i]));
  assert.ok(hit,'True exact two-rejection key and decoded anchor not found');
  const measured=searchReading({cipher:chosen.cipher,lengths,name:'positive'},key,
    dict.byCode,anchorKeyStart+2).find(x=>!x.flip&&x.sign===-1);
  assert.ok(measured.candidates.some(h=>h.primeKeyStart===anchorKeyStart));
  return {firstPrime:chosen.firstPrime,anchorPrimeStart:anchorKeyStart,
    anchorGPWord:hit.word,rejectedAtAnchor:chosen.within.map(i=>i-anchorStart),
    recoveredAnchor:true,scannedKeyStarts:anchorKeyStart+2};
}

function main(){
  const dict=dictionary(),src=source(),key=totientPrimes(MAX_START+256);
  const positive=positiveControl(dict,key);
  const cases=variations(src.cipher,src.lengths).flatMap(r=>searchReading(
    r,key,dict.byCode,MAX_START));
  const totalHits=cases.reduce((s,r)=>s+r.matchesBySkipCount.reduce((a,b)=>a+b,0),0);
  console.log(JSON.stringify({
    source:'LP2 physical p53 / 70.jpg, corrected 51 red runes, eleven-rune fourth word',
    hypothesis:'Actual solved LP2 p56 prime-totient key with 0..2 rejection draws per 11-rune anchor whenever candidate equals previous ciphertext rune',
    model:'Exact invertible prime-draw consumption, no arbitrary corrected output symbols',
    maxStart:MAX_START,dictionaryWords:dict.anchors.length,
    cases,totalHits,positive,
    status:'Only a key explaining held-out red words and source runes can be promoted'
  },null,2));
}
if(require.main===module)main();
module.exports={invertAnchor,searchReading,encryptWithRejection,positiveControl};
