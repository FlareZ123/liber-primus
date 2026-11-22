'use strict';

/**
 * Exact-word-length test of all 29 potential zero-residue GP symbols under
 * a reversible word-reset differential multiplicative cipher:
 *
 * C[i] - C[i-1] = (P[i] - marker) * K[i] (mod 29), i>=1 inside each word,
 * K[i] in {1,...,28}. C[0] may be an arbitrary independent word seed.
 *
 * The key cannot alter which positions give equal adjacent ciphertext
 * symbols inside a word; such positions occur iff plaintext=marker.
 * Tests all candidate markers against three GP-English reference registers.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {encodeWords}=require('./field_unit_differential.cjs');
const {parseUnsolved,random32}=require('./lag6_conditioned_echo.cjs');
const {squaredDistance}=require('./field_unit_unknown_zero_marker.cjs');
const ROOT=path.resolve(__dirname,'..');
const REFERENCES=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const A=29;
const mod=x=>(x%29+29)%29;

/** @param {number[][]} words */
function countInternal(words){
  let hits=0,terminal=0,markedWords=0;
  for(const word of words){
    let local=0;
    for(let i=1;i<word.length;i++){
      if(word[i]===word[i-1]){
        hits++;local++;
        if(i===word.length-1)terminal++;
      }
    }
    if(local)markedWords++;
  }
  return{hits,terminal,markedWords};
}

/** @param {number[][]} words @returns {Map<number,number[][]>} */
function binsByLength(words){
  const bins=new Map();
  for(const word of words){
    let group=bins.get(word.length);
    if(!group){group=[];bins.set(word.length,group);}
    group.push(word);
  }
  return bins;
}

/**
 * Exact independent word-draw moments conditional on all original LP2
 * word lengths. X = count of marker inside word after first glyph;
 * Y = count of marker at final glyph of words of length>=2.
 * @param {number[]} lengths
 * @param {Map<number,number[][]>} bins
 */
function moments(lengths,bins){
  const byLen=new Map();
  for(const [len,words]of bins){
    const stats=Array.from({length:A},()=>({mean:0,sq:0,end:0,cross:0}));
    for(const word of words){
      const c=new Uint8Array(A);
      for(let i=1;i<word.length;i++)c[word[i]]++;
      for(let a=0;a<A;a++){
        const s=stats[a],e=Number(len>1 && word[len-1]===a);
        s.mean+=c[a];s.sq+=c[a]*c[a];s.end+=e;s.cross+=c[a]*e;
      }
    }
    const n=words.length;
    byLen.set(len,stats.map(s=>({
      mean:s.mean/n,sq:s.sq/n,end:s.end/n,cross:s.cross/n
    })));
  }
  const result=Array.from({length:A},()=>({meanTotal:0,meanFirst:0,
    varTotal:0,varFirst:0,cov:0}));
  for(const len of lengths){
    const s=byLen.get(len);
    assert.ok(s,'missing reference word length '+len);
    for(let a=0;a<A;a++){
      const x=s[a],r=result[a];
      r.meanTotal+=x.mean;r.meanFirst+=x.end;
      r.varTotal+=x.sq-x.mean*x.mean;
      r.varFirst+=x.end*(1-x.end);
      r.cov+=x.cross-x.mean*x.end;
    }
  }
  return result;
}

/**
 * @param {number[]} lengths
 * @param {Map<number,number[][]>} bins
 * @param {()=>number} next
 * @returns {{hits:Int32Array,terminal:Int32Array}}
 */
function draw(lengths,bins,next){
  const hits=new Int32Array(A),terminal=new Int32Array(A);
  for(const len of lengths){
    const words=bins.get(len),word=words[next()%words.length];
    for(let i=1;i<len;i++)hits[word[i]]++;
    if(len>1)terminal[word[len-1]]++;
  }
  return{hits,terminal};
}

/**
 * Verify exact ciphertext inverse of the marker channel with arbitrary
 * nonzero unit keys and independent word start seeds.
 * @param {number[][]} plaintext
 * @param {number} marker
 * @param {()=>number} next
 */
function plant(plaintext,marker,next){
  let expectedHits=0,expectedTerminal=0;
  let inverted=0;
  const ciphertext=plaintext.map(word=>{
    const keys=[next()%29],out=[mod(word[0]+keys[0])];
    for(let i=1;i<word.length;i++){
      const k=1+next()%28;
      keys.push(k);
      out.push(mod(out[i-1]+(word[i]-marker)*k));
      if(word[i]===marker){
        expectedHits++;
        if(i===word.length-1)expectedTerminal++;
      }
    }
    // A supplied key recovers every plaintext rune and roundtrips all
    // ciphertext symbols, including the per-word first-rune seed.
    assert.equal(mod(out[0]-keys[0]),word[0]);
    inverted++;
    for(let i=1;i<word.length;i++){
      const inv=Array.from({length:29},(_,j)=>j).find(j=>
        mod(j*keys[i])===1);
      assert.ok(Number.isInteger(inv));
      const p=mod(marker+mod(out[i]-out[i-1])*inv);
      assert.equal(p,word[i]);
      assert.equal(mod(out[i-1]+(p-marker)*keys[i]),out[i]);
      inverted++;
    }
    return out;
  });
  const found=countInternal(ciphertext);
  assert.equal(found.hits,expectedHits);
  assert.equal(found.terminal,expectedTerminal);
  return{marker,validated:true,fullCipherAndPlainRuneRoundTrips:inverted,
    inside:found.hits,atWordEnd:found.terminal};
}

/** @param {number} [reps=10000] @param {number} [seed=0x7133ab05] */
function run(reps=10000,seed=0x7133ab05){
  assert.ok(Number.isInteger(reps)&&reps>=100);
  const raw=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8');
  const original=parseUnsolved(raw);
  const observed=countInternal(original);
  assert.equal(original.length,2896);
  assert.equal(original.flat().length,12956);
  assert.deepEqual(observed,{hits:63,terminal:19,markedWords:62});
  const lengths=original.map(x=>x.length),results=[];
  for(let si=0;si<REFERENCES.length;si++){
    const file=REFERENCES[si];
    const reference=encodeWords(fs.readFileSync(path.join(ROOT,file),'utf8'))
      .filter(w=>w.length);
    const bins=binsByLength(reference),expected=moments(lengths,bins);
    const scores=expected.map((s,a)=>({
      marker:a,
      expectedWithin:s.meanTotal,
      expectedAtEnd:s.meanFirst,
      sdWithin:Math.sqrt(s.varTotal),
      sdAtEnd:Math.sqrt(s.varFirst),
      squaredMahalanobis:squaredDistance(s,observed.hits,observed.terminal),
      nullExceed:0
    }));
    const rand=random32((seed ^ Math.imul(si+1,0x9e3779b9))>>>0);
    const plantedWords=lengths.map(len=>{
      const a=bins.get(len);return a[rand()%a.length];
    });
    const positives=Array.from({length:A},(_,a)=>plant(plantedWords,a,rand));
    assert.equal(positives.length,A);
    for(let i=0;i<reps;i++){
      const sample=draw(lengths,bins,rand);
      for(let a=0;a<A;a++){
        if(squaredDistance(expected[a],sample.hits[a],sample.terminal[a])
          >=scores[a].squaredMahalanobis)scores[a].nullExceed++;
      }
    }
    for(const s of scores)s.empiricalUpperP=(s.nullExceed+1)/(reps+1);
    scores.sort((a,b)=>a.squaredMahalanobis-b.squaredMahalanobis);
    results.push({file,referenceWords:reference.length,
      model:'independent occurrence-weighted English GP words drawn at each original word length',
      exactPlantedRoundTripMarkers:positives.length,
      closest:scores.slice(0,8),
      bestCompatibility:Math.max(...scores.map(s=>s.empiricalUpperP)),
      all29BelowOnePercent:scores.every(s=>s.empiricalUpperP<.01)});
  }
  return{input:{runes:12956,wholeWords:2896,original:observed},
    mathematicalConstraint:'For any fixed unknown rune a and nonzero units K[i], word-internal cipher doublets occur iff P[i]=a; word starts may freely reset',
    seed:'0x'+seed.toString(16),repsPerReference:reps,results,
    scope:'Bivariate internal-marker and word-terminal counts, with exact LP2 word-length sequence. Source-conditioned statistical exclusions, not absolute theorem over all possible English texts. Ridge 0.25 covariance applied identically to real and sampled distances.'};
}
if(require.main===module)console.log(JSON.stringify(
  run(Number(process.argv[2]||'10000')),null,2));
module.exports={countInternal,binsByLength,moments,draw,plant,run};
