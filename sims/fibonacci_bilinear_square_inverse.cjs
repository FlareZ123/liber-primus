'use strict';
/**
 * Exact source-constrained inversion of a Fibonacci bilinear F29 cipher on
 * both authentic LP2 bookend-square layouts. Synthetic native-source plants
 * independently test all 12,956 runes and both unknown column-key arrays.
 *
 * Hypothesis, not an authenticated Cicada mechanism:
 * C[row,col] = P[row,col] + F_(row+phase)*key[col] (mod 29).
 *
 * Run: node sims/fibonacci_bilinear_square_inverse.cjs
 * @module fibonacci_bilinear_square_inverse
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const raw=read('resources/liber-primus/lp2-corpus.json');
const corpus=JSON.parse(raw);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const ORIGINAL=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(ORIGINAL.length,12956);
assert.deepEqual(pages.slice(0,3).map(x=>x.indices.length),[262,266,201]);
assert.equal(81**2+(80**2-5),ORIGINAL.length);

const sourceRaw=read('resources/control/shakespeare_first300k.txt');
const translit=corpus.translit.map((value,i)=>({text:value,index:i}))
  .sort((a,b)=>b.text.length-a.text.length);
/** @param {string} text @returns {number[]} */
function encodeGP(text){
  const runes=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    for(let i=0;i<word.length;){
      const rune=translit.find(x=>word.startsWith(x.text,i));
      if(rune){runes.push(rune.index);i+=rune.text.length;}else i++;
    }
  }
  return runes;
}
const SOURCE=encodeGP(sourceRaw);
assert.equal(SOURCE.length,218800);
const frequencies=Array(29).fill(1);
for(const x of SOURCE.slice(0,100000))frequencies[x]++;
const LOGP=frequencies.map(x=>Math.log(x/100029));
const F=[0,1];
for(let i=2;i<=15;i++)F[i]=(F[i-1]+F[i-2])%29;
assert.equal(F[14],0);
assert.equal(F[15],1);
assert.deepEqual(F.slice(0,14),
  [0,1,1,2,3,5,8,13,21,5,26,2,28,1]);
const mod=x=>(x%29+29)%29;
/**
 * Map the hypothetical square to unchanged original-rune offsets.
 * @param {number} r @param {number} c @param {number} w
 * @param {'row'|'column'} axis @param {boolean} rev
 */
function at(r,c,w,axis,rev){
  const rr=rev?w-1-r:r;
  return axis==='row'?rr*w+c:c*w+rr;
}
/**
 * Recover every unknown column key by exact finite maximization of GP
 * log likelihood, for all 14 phase choices and both axis directions.
 * Fit ONLY the first two-thirds of rows. Withhold the rest unchanged.
 * @param {number[]} cipher @param {number} w
 */
function fit(cipher,w){
  const rows=Math.floor(w*2/3),choices=[];
  for(const axis of ['row','column'])for(const rev of [false,true])
    for(let phase=0;phase<14;phase++){
      const key=[];let train=0,held=0,nTrain=0,nHeld=0;
      for(let c=0;c<w;c++){
        let best=-Infinity,chosen=-1,nBest=0;
        for(let v=0;v<29;v++){
          let score=0,n=0;
          for(let r=0;r<rows;r++){
            const i=at(r,c,w,axis,rev);
            if(i>=cipher.length)continue;
            score+=LOGP[mod(cipher[i]-F[(r+phase)%14]*v)];
            n++;
          }
          if(score>best){best=score;chosen=v;nBest=n;}
        }
        assert(chosen>=0);
        key.push(chosen);train+=best;nTrain+=nBest;
        for(let r=rows;r<w;r++){
          const i=at(r,c,w,axis,rev);
          if(i>=cipher.length)continue;
          held+=LOGP[mod(cipher[i]-F[(r+phase)%14]*chosen)];
          nHeld++;
        }
      }
      choices.push({axis,rev,phase,key,trainingRows:rows,
        train:train/nTrain,held:held/nHeld,nTrain,nHeld});
    }
  return choices.sort((a,b)=>b.train-a.train);
}
/** Reversibly transform source runes under any fully specified model. */
function transform(runes,w,cfg,sign){
  const out=new Array(runes.length);
  for(let r=0;r<w;r++)for(let c=0;c<w;c++){
    const i=at(r,c,w,cfg.axis,cfg.rev);
    if(i>=runes.length)continue;
    out[i]=mod(runes[i]+sign*F[(r+cfg.phase)%14]*cfg.key[c]);
  }
  assert(out.every(Number.isInteger));
  return out;
}
/**
 * Regardless of column keys, F14=0 and F15=1 imply every 14th
 * row is true unmodified GP plaintext for a Fibonacci-masked square.
 * Both row and column bases and all 14 hidden Fibonacci phases are tested.
 * @param {number[]} stream @param {number} w
 */
function zeroRowBound(stream,w){
  const candidates=[];
  for(const axis of ['row','column'])for(let phase=0;phase<14;phase++){
    let score=0,count=0;const plainRows=[];
    for(let r=0;r<w;r++){
      if(F[(r+phase)%14]!==0)continue;
      plainRows.push(r);
      for(let c=0;c<w;c++){
        const i=at(r,c,w,axis,false);
        if(i>=stream.length)continue;
        score+=LOGP[stream[i]];count++;
      }
    }
    assert(plainRows.length===5||plainRows.length===6);
    candidates.push({axis,phase,plainRows,count,logp:score/count});
  }
  candidates.sort((a,b)=>b.logp-a.logp);
  return {best:candidates[0],worst:candidates.at(-1)};
}
/** @param {number} seed */
function rng32(seed){
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}
function score(data){return data.reduce((s,x)=>s+LOGP[x],0)/data.length;}
/** Blinded natural-GP full-block plant with all unknown column keys. */
function plant(w,n,start,phase,seed){
  const rng=rng32(seed),key=Array.from({length:w},()=>rng()%29);
  const expected=SOURCE.slice(start,start+n);
  assert.equal(expected.length,n);
  const trueCfg={axis:'row',rev:false,phase,key};
  const cipher=transform(expected,w,trueCfg,+1);
  const winner=fit(cipher,w)[0];
  assert.equal(winner.axis,'row');
  assert.equal(winner.rev,false);
  assert.equal(winner.phase,phase);
  assert.deepEqual(winner.key,key);
  const recovered=transform(cipher,w,winner,-1);
  assert.deepEqual(recovered,expected);
  assert.deepEqual(transform(recovered,w,winner,+1),cipher);
  return {w,sourceOffset:start,phase,
    recoveredColumnKeys:w,exactPlaintextRunes:recovered.length,
    trueNativeLogp:score(expected),
    blindTrainLogp:winner.train,blindHoldoutLogp:winner.held};
}
function run(){
  const blocks=[{w:81,stream:ORIGINAL.slice(0,6561)},
    {w:80,stream:ORIGINAL.slice(6561)}];
  const original=blocks.map(({w,stream})=>{
    const models=fit(stream,w),winner=models[0];
    const decoded=transform(stream,w,winner,-1);
    assert.deepEqual(transform(decoded,w,winner,+1),stream);
    return {square:w,sourceCipherRunes:stream.length,
      missingTerminalCells:w*w-stream.length,
      originalCipherGPLogp:score(stream),modelVariants:models.length,
      selected:{axis:winner.axis,reverseRows:winner.rev,phase:winner.phase,
        train:winner.train,held:winner.held,
        trainedRunes:winner.nTrain,heldoutRunes:winner.nHeld},
      otherBest:models.slice(1,4).map(x=>({
        axis:x.axis,reverseRows:x.rev,phase:x.phase,
        train:x.train,held:x.held})),
      exactOriginalReencipher:decoded.length,
      zeroRowBound:zeroRowBound(stream,w)};
  });
  const planted=[
    plant(81,6561,100000,7,0x40cafe45),
    plant(80,6395,108000,9,0x40cafe46)];
  const sourceControls=[];
  for(let i=0;i<1024;i++){
    const x=SOURCE.slice(100000+100*i,106561+100*i);
    assert.equal(x.length,6561);
    sourceControls.push(zeroRowBound(x,81).best.logp);
  }
  sourceControls.sort((a,b)=>a-b);
  const actualMax=Math.max(...original.map(x=>x.zeroRowBound.best.logp));
  return {status:'Original-source negative for this exact model; no LP2 unknown plaintext or key',
    cipher:'C=(P+F_(r+phase)*columnKey[c]) mod29',
    clue:'p15 Fibonacci-prime construction and 81^2 / 80^2-5 bookend',
    knownNativeReference:'first 100000 GP runes of independent Shakespeare control',
    fibonacciPeriod14:true,
    sourceSHA256:crypto.createHash('sha256').update(sourceRaw).digest('hex'),
    corpusSHA256:crypto.createHash('sha256').update(raw).digest('hex'),
    originalTotalRunes:ORIGINAL.length,
    testedModelsPerSquare:56,unknownColumnKeys:[81,80],
    authenticCipher:original,
    blindNativePlants:planted,
    zeroRowControl:{sourceWindows:1024,sourceFirstOffset:100000,
      sourceLastOffset:202300,min:sourceControls[0],
      median:sourceControls[512],max:sourceControls.at(-1),
      mostGenerousRealScore:actualMax,
      sourceWindowsAsLowAsReal:sourceControls.filter(x=>x<=actualMax).length},
    limitation:'English GP source register, proposed square geometry, bilinear Fibonacci row factor, fixed column keys; no claim of historical cipher.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encodeGP,F,fit,transform,zeroRowBound,plant,run};
