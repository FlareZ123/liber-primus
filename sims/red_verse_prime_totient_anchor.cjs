'use strict';

/**
 * Exact dictionary-anchored attack on LP2 p53 red 51-rune stanza using the
 * historically authentic LP2 p56 keystream phi(prime_n)=prime_n-1 (mod 29).
 *
 * Keys may begin at any of the first MAX_START prime positions. The
 * 11-rune anchor tolerates at most two symbol errors using a nine-of-eleven
 * erasure index, rather than an exploratory language score.
 *
 * Run: node sims/red_verse_prime_totient_anchor.cjs
 */
const assert=require('node:assert/strict');
const {dictionary,source} = require('./red_verse_second_order_key.cjs');
const mod = n => (n % 29 + 29) % 29;
const MAX_START = Number(process.env.PRIME_ANCHOR_STARTS || 50000);
assert.ok(Number.isInteger(MAX_START) && MAX_START>2500 && MAX_START<=200000);

/** @param {number} length @returns {Uint8Array} */
function totientPrimes(length) {
  const limit=Math.ceil((length+10)*(Math.log(length+10)+Math.log(Math.log(length+10))))+200;
  const isComposite=new Uint8Array(limit+1);
  const key=new Uint8Array(length);
  let at=0;
  for(let p=2;p<=limit&&at<length;p++){
    if(isComposite[p])continue;
    key[at++]=(p-1)%29;
    if(p*p<=limit)for(let z=p*p;z<=limit;z+=p)isComposite[z]=1;
  }
  assert.equal(at,length,'Prime sieve bound insufficient');
  return key;
}

/** 55 two-position deletion masks recover every anchor with <=2 errors. */
const MASKS=[];
for(let i=0;i<11;i++)for(let j=i+1;j<11;j++)
  MASKS.push([i,j]);
assert.equal(MASKS.length,55);

/** @param {number[]} values @param {number} index @returns {number} */
function signature(values,index) {
  const [omitA,omitB]=MASKS[index];
  let n=0;
  for(let t=0;t<11;t++){
    if(t!==omitA&&t!==omitB)n=n*29+values[t];
  }
  return n*64+index;
}

/** @param {ReturnType<typeof dictionary>['anchors']} anchors */
function indexAnchors(anchors) {
  const m=new Map();
  for(let i=0;i<anchors.length;i++) {
    const values=anchors[i].values;
    for(let mask=0;mask<55;mask++){
      const key=signature(values,mask);
      const bucket=m.get(key);
      if(bucket)bucket.push(i);
      else m.set(key,[i]);
    }
  }
  return m;
}

/** @param {number[]} cipher @param {number[]} lengths */
function variations(cipher,lengths) {
  const words=[];
  let at=0;
  for(const length of lengths){words.push(cipher.slice(at,at+length));at+=length;}
  assert.equal(at,cipher.length);
  return [
    {name:'printed',cipher:words.flat(),lengths},
    {name:'reverse-word-order',cipher:words.slice().reverse().flat(),lengths:lengths.slice().reverse()},
    {name:'full-reversal',cipher:words.slice().reverse().map(w=>w.slice().reverse()).flat(),lengths:lengths.slice().reverse()},
    {name:'mirror-each-word',cipher:words.map(w=>w.slice().reverse()).flat(),lengths}
  ];
}

/** @param {number[]} cipher @param {boolean} skipF */
function phases(cipher,skipF) {
  const arr=[];
  let clock=0;
  for(const c of cipher){
    arr.push(clock);
    if(!(skipF&&c===0))clock++;
  }
  return arr;
}

/**
 * Score only non-anchor words using the fixed lexicon; source-boundary and
 * anchor predictions are entirely separated from the held-out word score.
 * @param {{cipher:number[],lengths:number[]}} reading
 * @param {Uint8Array} key
 * @param {ReturnType<typeof dictionary>} dict
 * @param {number} firstKey
 * @param {number} sign
 * @param {boolean} flip
 * @param {boolean} skipF
 */
function decrypt(reading,key,dict,firstKey,sign,flip,skipF) {
  const phase=phases(reading.cipher,skipF);
  let offset=0,score=0,matched=0,longMatched=0;
  const text=[];
  for(let w=0;w<reading.lengths.length;w++){
    const values=[];
    for(let j=0;j<reading.lengths[w];j++){
      const i=offset+j, c=reading.cipher[i];
      values.push(skipF&&c===0?0:mod((flip?28-c:c)+sign*key[firstKey+phase[i]]));
    }
    const hit=dict.byCode.get(values.join(','));
    text.push(hit?hit.english:values.map(v=>DICT_TRANSLIT[v]).join('').toLowerCase());
    if(w!==reading.lengths.indexOf(11)) {
      if(hit){
        matched++; if(values.length>=3)longMatched++;
        score+=Math.log1p(hit.freq)+0.45*values.length;
      } else if(values.length>=3)score-=5;
    }
    offset+=reading.lengths[w];
  }
  return {score,matched,longMatched,text:text.join(' '),skipF};
}
const DICT_TRANSLIT=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];

/** @param {{cipher:number[],lengths:number[],name:string}} reading */
function candidates(reading,key,dict,lookup,maximumStart,keep=5) {
  const anchorWord=reading.lengths.indexOf(11);
  assert.ok(anchorWord>=0);
  const start=reading.lengths.slice(0,anchorWord).reduce((s,v)=>s+v,0);
  assert.ok(!reading.cipher.slice(start,start+11).includes(0),'Literal F inside anchor is not supported');
  const cases=[];
  for(const flip of [false,true])for(const sign of [-1,1]){
    const result={reading:reading.name,flip,sign,anchorStart:start,
      enumeratedOffsets:maximumStart,anchoredCandidates:0,candidatesByError:[0,0,0],top:[]};
    const carrier=reading.cipher.slice(start,start+11).map(c=>flip?28-c:c);
    const decoded=new Int8Array(11);
    const seen=new Set();
    for(let keyStart=0;keyStart<maximumStart;keyStart++){
      for(let j=0;j<11;j++)decoded[j]=mod(carrier[j]+sign*key[keyStart+j]);
      for(let mask=0;mask<55;mask++) {
        const found=lookup.get(signature(decoded,mask));
        if(!found)continue;
        for(const index of found) {
          const id=keyStart*dict.anchors.length+index;
          if(seen.has(id))continue;
          seen.add(id);
          const anchor=dict.anchors[index];
          let errors=0;
          for(let j=0;j<11;j++)if(anchor.values[j]!==decoded[j])errors++;
          if(errors>2)continue;
          result.anchoredCandidates++;
          result.candidatesByError[errors]++;
          for(const skipF of [false,true]) {
            const phase=phases(reading.cipher,skipF);
            const fullStart=keyStart-phase[start];
            if(fullStart<0)continue;
            const scored=decrypt(reading,key,dict,fullStart,sign,flip,skipF);
            result.top.push({...scored,keyStart,fullStart,anchor:anchor.english,
              anchorErrors:errors});
            result.top.sort((x,y)=>y.score-x.score||y.longMatched-x.longMatched);
            if(result.top.length>keep)result.top.pop();
          }
        }
      }
    }
    cases.push(result);
  }
  return cases;
}

function planted(dict,index,key) {
  const s=source();
  const wordChoices=new Map();
  for(const [code,hit] of dict.byCode){
    const letters=code.split(',').map(Number);
    const length=letters.length;
    if(hit.freq<30)continue;
    if(!wordChoices.has(length))wordChoices.set(length,[]);
    wordChoices.get(length).push(letters);
  }
  const lengths=s.lengths;
  const plain=lengths.flatMap((len,i)=>{
    const options=wordChoices.get(len);
    assert.ok(options.length>=10);
    return options[(i*7+4)%options.length];
  });
  const seed=3301;
  const encrypted=plain.map((p,i)=>mod(p+key[seed+i]));
  for(const at of [13+2,13+9])encrypted[at]=mod(encrypted[at]+3);
  const reading={name:'positive',cipher:encrypted,lengths};
  const result=candidates(reading,key,dict,index,seed+24,8)
    .find(r=>r.flip===false&&r.sign===-1);
  const hit=result.top.find(x=>x.fullStart===seed&&x.anchorErrors===2&&x.longMatched>=7);
  assert.ok(hit,'Planted prime-totient offset and independent heldout words not recovered');
  return {exactStart:seed,corruptedAnchorPositions:[2,9],
    expectedKeySign:-1,recoveredStart:hit.fullStart,
    recoveredAnchor:hit.anchor,matchedOtherLongWords:hit.longMatched,
    candidateOffsets:seed+24,passed:true};
}

function main(){
  const s=source(),dict=dictionary(),lookup=indexAnchors(dict.anchors);
  const key=totientPrimes(MAX_START+256);
  assert.equal(key[0],1);
  assert.deepEqual(Array.from(key.slice(0,8)),[1,2,4,6,10,12,16,18]);
  const positive=planted(dict,lookup,key);
  const readings=variations(s.cipher,s.lengths);
  const cases=readings.flatMap(r=>candidates(r,key,dict,lookup,MAX_START));
  console.log(JSON.stringify({
    source:'LP2 physical page 53 (70.jpg), visual red 51-rune passage',
    basis:'Actual solved LP2 page 56 prime-totient stream, all offsets [0,MAX_START)',
    maxStart:MAX_START,anchorGPWords:dict.anchors.length,
    deletionSignatures:MASKS.length,signatureIndexEntries:lookup.size,
    cases,positive,status:'No claim without a recovered plaintext on unfitted non-anchor words'
  },null,2));
}
if(require.main===module)main();
module.exports={totientPrimes,indexAnchors,variations,candidates,planted};
