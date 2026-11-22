/**
 * GP29 word-pair affine fingerprint gate on the original LP2 ciphertext.
 *
 * A two-word signature is invariant under either:
 *  - a common affine map a*x+b, with a != 0, over both words, or
 *  - an independent additive Caesar shift of each word.
 * It does not guess the key or assume that a ciphertext repeat is plaintext.
 *
 * Reproduce from repository root: node sims/dju_bei_affine_wordpair_sft.cjs
 * No file writes, external services, or dependencies are needed.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const MOD = 29;
const DI = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const LET = {A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5, L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1, W:7, X:14, Y:26, Z:15};
const inverse = Array(MOD).fill(0);
for (let a=1; a<MOD; a++) for (let b=1; b<MOD; b++) if (a*b%MOD===1) inverse[a]=b;
assert.equal(inverse.slice(1).filter(Boolean).length, 28);

/** @param {string} word @returns {number[]} Native GP29 indices. */
function encode(word) {
  const out=[];
  for(let i=0;i<word.length;i++) {
    const digraph=DI[word.slice(i,i+2)];
    if(digraph!==undefined){out.push(digraph);i++;}
    else{assert.notEqual(LET[word[i]],undefined);out.push(LET[word[i]]);}
  }
  return out;
}

/** @returns {number[][]} Whole source words including across-page continuations. */
function loadUnknown() {
  const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const map = new Map(source.runes.map((r,i)=>[r,i]));
  const stream=read('resources/lp2-transcription.txt').split('%').slice(0,55)
    .join('').replace(/\/\s*\n/g,'');
  const words=stream.split(/[-.\s&$]+/)
    .map(token=>[...token].filter(r=>map.has(r)).map(r=>map.get(r)))
    .filter(w=>w.length>0);
  const observed=words.flat();
  const physical=source.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert.equal(words.length,2896);
  assert.equal(observed.length,12956);
  assert.deepEqual(observed,physical,'The original physical-page index stream must match all words');
  return words;
}

/**
 * @param {number[]} word
 * @param {'shift'|'affine'} mode
 * @returns {string} A signature constant under a source-independent affine alphabet transform.
 */
function fingerprint(word,mode) {
  const first=word[0];
  const pos=word.findIndex(v=>v!==first);
  const scale=mode==='affine'&&pos>=0?inverse[(word[pos]-first+MOD)%MOD]:1;
  return word.map(v=>(v-first+MOD)*scale%MOD).join(',');
}

/**
 * @param {number[][]} words
 * @param {'common-affine'|'independent-shift'|'independent-affine'} architecture
 * @returns {{eligible:number,extra:number,classes:number,repeats:Array<Array<{wi:number,offset:number,words:string}>>}}
 */
function census(words,architecture) {
  const groups=new Map();let eligible=0,offset=0;
  for(let wi=0;wi<words.length-1;wi++) {
    const a=words[wi],b=words[wi+1],joined=a.concat(b);
    const allowed=joined.length>=6 && (
      architecture==='common-affine'||(a.length>=2&&b.length>=2));
    if(allowed) {
      const key=architecture==='common-affine'
        ?a.length+'|'+fingerprint(joined,'affine')
        :a.length+'|'+b.length+'|'+fingerprint(a,architecture==='independent-affine'?'affine':'shift')
          +'|'+fingerprint(b,architecture==='independent-affine'?'affine':'shift');
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push({wi,offset,words:joined.join(',')});
      eligible++;
    }
    offset+=a.length;
  }
  const repeats=[...groups.values()].filter(v=>v.length>1);
  return {eligible,extra:repeats.reduce((sum,v)=>sum+v.length-1,0),classes:repeats.length,repeats};
}

/** @param {number} seed @returns {()=>number} Reproducible xorshift32 [0,1). */
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}

/** @param {number[][]} words @param {()=>number} rnd @returns {number[][]} */
function shuffle(words,rnd){const a=words.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/** @param {number[][]} original @param {number[][]} reference @param {number} seed */
function matchedControl(original,reference,seed){
  const bins=new Map();
  for(const word of reference){if(!bins.has(word.length))bins.set(word.length,[]);bins.get(word.length).push(word);}
  const rnd=random(seed),cases=[];
  for(let replicate=0;replicate<100;replicate++){
    const draw=original.map(word=>{
      const pool=bins.get(word.length);assert.ok(pool?.length,'Missing reference word length '+word.length);
      return pool[Math.floor(rnd()*pool.length)];
    });
    cases.push({common:census(draw,'common-affine').extra,
      separateShift:census(draw,'independent-shift').extra,
      separateAffine:census(draw,'independent-affine').extra});
  }
  const range=k=>({min:Math.min(...cases.map(x=>x[k])),mean:cases.reduce((s,x)=>s+x[k],0)/cases.length,max:Math.max(...cases.map(x=>x[k]))});
  return {referenceWords:reference.length,repetitions:cases.length,seed,common:range('common'),separateShift:range('separateShift'),separateAffine:range('separateAffine')};
}

function main(){
  const phrase=[[23,11,1],[17,18,10]];
  const affine=(word,a,b)=>word.map(x=>(a*x+b)%MOD);
  const shifted=[affine(phrase[0],1,7),affine(phrase[1],1,23)];
  const common=[affine(phrase[0],5,3),affine(phrase[1],5,3)];
  assert.equal(fingerprint(phrase[0],'shift'),fingerprint(shifted[0],'shift'));
  assert.equal(fingerprint(phrase[1],'shift'),fingerprint(shifted[1],'shift'));
  assert.equal(fingerprint(phrase.flat(),'affine'),fingerprint(common.flat(),'affine'));
  const words=loadUnknown();
  const observed={common:census(words,'common-affine'),
    separateShift:census(words,'independent-shift'),
    separateAffine:census(words,'independent-affine')};
  for(const mode of ['common','separateShift']){
    assert.equal(observed[mode].extra,1);
    assert.equal(observed[mode].classes,1);
    assert.deepEqual(observed[mode].repeats[0].map(v=>v.offset),[6555,12950]);
    assert.deepEqual(observed[mode].repeats[0].map(v=>v.words),Array(2).fill('23,11,1,17,18,10'));
  }
  assert.equal(observed.separateShift.eligible,2422);
  assert.equal(observed.separateAffine.extra,30);
  assert.equal(observed.separateAffine.classes,26);
  const files=[
    ['Shakespeare','resources/control/shakespeare_first300k.txt',0x3301aa11],
    ['Emerson','resources/control/emerson_essays_2944.txt',0x3301aa22],
    ['Gibran','resources/control/gibran_prophet_58585.txt',0x3301aa33],
  ];
  const controls=Object.fromEntries(files.map(([name,file,seed])=>[name,matchedControl(words,read(file).toUpperCase().match(/[A-Z]+/g).map(encode),seed)]));
  for(const control of Object.values(controls)){
    assert.ok(control.separateShift.min>observed.separateShift.extra,'Expected control/observed pair gap');
    assert.ok(control.common.min>observed.common.extra,'Expected control/observed common-affine gap');
  }
  const rnd=random(0x3301bb44),shuffleNull=[];
  for(let i=0;i<100;i++)shuffleNull.push(census(shuffle(words,rnd),'independent-shift').extra);
  const wordOrderNull={repetitions:shuffleNull.length,min:Math.min(...shuffleNull),
    mean:shuffleNull.reduce((s,x)=>s+x,0)/shuffleNull.length,max:Math.max(...shuffleNull)};
  const output={
    ciphertext:{unknownWords:words.length,unknownRunes:words.flat().length,
      common:{eligible:observed.common.eligible,extra:observed.common.extra,classes:observed.common.classes},
      separateShift:{eligible:observed.separateShift.eligible,extra:observed.separateShift.extra,classes:observed.separateShift.classes},
      separateAffine:{eligible:observed.separateAffine.eligible,extra:observed.separateAffine.extra,classes:observed.separateAffine.classes},
      repeatingPair:observed.separateShift.repeats[0]},
    matchedNativeGpEnglish:controls,
    originalWordOrderShuffle:wordOrderNull,
    interpretation:'A necessary-condition mismatch for native-GP English under word-local affine relabeling; no authentic key, plaintext or destination.'
  };
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={encode,fingerprint,census,random,shuffle,matchedControl};
