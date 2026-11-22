'use strict';

/**
 * SOURCE-LOCKED 2013/2016 full-key-space experiment on unchanged LP2.
 *
 * An authentic 2013 ID3 tag contains 1,595,277,641 = three solved PARABLE
 * clause prime sums. The signed 2016 image is 563 by 569 pixels; Cicada's
 * earlier 2012 puzzle explicitly used dimensions times 3301. A conjectural
 * illustrative full-period LCG therefore uses:
 *   x_(i+1) = (1595277641*x_i + 563*569*3301) mod 2^32,
 *   K_i = x_i mod 29, C_i = P_i +/- K_i mod 29.
 *
 * Prior tests checked four fixed seeds; this test exhausts EVERY possible
 * 32-bit seed using the original 83 printed one-rune words and a generous
 * native-English A/I/O hypothesis. All original runes, source typography
 * and page-carrying words remain unchanged. Source parameter/operation
 * selection itself is speculative: an all-seed failure retires ONLY this
 * exact conditional LCG decoder, not other stateful mechanisms.
 *
 * Run (single runnable test, Node.js 22 CommonJS):
 *   node sims/lp2_source_lcg_singleton_allseed_sft.cjs
 *
 * Read-only, no dependency except Node.js built-ins; uses worker_threads.
 * Positive source-native plant, exact binary jump controls, full original
 * key enumeration, result summaries and complete recovered text on hits.
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {isMainThread,Worker,workerData,parentPort}=require('node:worker_threads');

const MODULUS=2**32;
const A=1595277641>>>0;
const B=1057465447>>>0;
const PLAIN_SINGLETON=[24,10,3]; // GP29 A, I, vocative O
const mod29=n=>((n%29)+29)%29;

/**
 * @param {number} x
 * @returns {number}
 */
function step(x) {return (Math.imul(A,x)+B)>>>0;}

/**
 * x_(i+distance) = multiplier*x_i + offset mod 2^32.
 * @param {number} distance
 * @returns {{multiplier:number, offset:number}}
 */
function jump(distance) {
  assert(Number.isSafeInteger(distance)&&distance>=0);
  let multiplier=1, offset=0, ma=A, cb=B, n=distance;
  while(n>0) {
    if(n%2===1) {
      offset=(Math.imul(ma,offset)+cb)>>>0;
      multiplier=Math.imul(ma,multiplier)>>>0;
    }
    cb=(Math.imul(ma,cb)+cb)>>>0;
    ma=Math.imul(ma,ma)>>>0;
    n=Math.floor(n/2);
  }
  return {multiplier,offset};
}

/** @param {number} x @param {{multiplier:number,offset:number}} j */
function applyJump(x,j) {
  return (Math.imul(j.multiplier,x)+j.offset)>>>0;
}

/**
 * @param {number} c
 * @param {'plus'|'minus'} direction
 * @returns {number}
 */
function maskFor(c,direction) {
  let mask=0;
  for(const p of PLAIN_SINGLETON) {
    const k=mod29(direction==='plus' ? c-p : p-c);
    mask|=(1<<k);
  }
  return mask>>>0;
}

/** @param {number} mask @param {number} residue */
function allowed(mask,residue) {
  return (mask&(1<<residue))!==0;
}

/** A single code file doubles as its own native worker. */
if(!isMainThread) {
  const {residue,masks,jumps,direction}=workerData;
  const counts=new Array(masks.length).fill(0);
  const full=[];
  let attempts=0;
  for(let first=residue;first<MODULUS;first+=29) {
    attempts++;
    counts[0]++;
    let x=first;
    for(let i=1;i<masks.length;i++) {
      const j=jumps[i-1];
      x=(Math.imul(j.multiplier,x)+j.offset)>>>0;
      if(!allowed(masks[i],x%29)) break;
      counts[i]++;
      if(i===masks.length-1) full.push(first);
    }
  }
  parentPort.postMessage({direction,residue,attempts,
    survivorsByPrefix:counts,fullStatesAtFirstSingleton:full});
} else {
  const ROOT=path.resolve(__dirname,'..');
  const file=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
  const corpus=JSON.parse(file('resources/liber-primus/lp2-corpus.json'));
  const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
  const source=file('resources/liber-primus/lp2-transcription.txt');
  const words=[];
  let current=[],absolute=0;
  for(const ch of source.split('%').slice(0,55).join('%')) {
    if(runeMap.has(ch)) {
      current.push({absolute:absolute++,cipher:runeMap.get(ch)});
    } else if(ch==='/'||ch==='%'||/\s/u.test(ch)) {
      // Original page continuations and physical line breaks do not end a word.
    } else if(current.length) {
      words.push(current);current=[];
    }
  }
  if(current.length)words.push(current);
  const trueOriginal=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  assert.equal(absolute,12956);
  assert.equal(words.length,2896);
  assert.deepEqual(words.flat().map(r=>r.cipher),trueOriginal);
  const singles=words.filter(w=>w.length===1).map(w=>w[0]);
  assert.equal(singles.length,83);
  assert.deepEqual(singles.slice(0,5).map(x=>[x.absolute,x.cipher]),
    [[176,28],[244,15],[350,9],[530,1],[644,0]]);
  assert.equal(new Set(singles.map(x=>x.cipher)).size,28);
  assert.equal(singles.at(-1).absolute,12770);
  assert.equal(A,1595277641>>>0);
  assert.equal(B,563*569*3301>>>0);
  assert.equal((A%4),1);
  assert.equal((B%2),1);

  const jumps=singles.slice(1).map((r,i)=>jump(r.absolute-singles[i].absolute));
  for(const span of [0,1,2,3,68,106,180,3301,12955]) {
    let x=0xfacade01;
    for(let k=0;k<span;k++)x=step(x);
    assert.equal(applyJump(0xfacade01,jump(span)),x);
  }
  const clear=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(clear.length,95);
  const p=Array.from({length:12956},(_,i)=>clear[i%clear.length]);
  for(let i=0;i<singles.length;i++)p[singles[i].absolute]=PLAIN_SINGLETON[i%3];

  /**
   * Construct original-shaped positive: all 83 actual singleton positions
   * carry native GP A/I/O; source-literal LCG encrypts every one of 12956.
   * Check both signs and exact inversion with independent seed.
   */
  const seed=0x23456789;
  const states=new Uint32Array(p.length);
  let x=seed;
  for(let i=0;i<states.length;i++){states[i]=x;x=step(x);}
  const positives=[];
  for(const dir of ['plus','minus']) {
    const sign=dir==='plus'?1:-1;
    const cipher=p.map((symbol,i)=>mod29(symbol+sign*(states[i]%29)));
    const decrypted=cipher.map((symbol,i)=>mod29(symbol-sign*(states[i]%29)));
    assert.deepEqual(decrypted,p);
    const originalMasks=singles.map(r=>maskFor(cipher[r.absolute],dir));
    let chain=states[singles[0].absolute];
    assert(allowed(originalMasks[0],chain%29));
    for(let i=1;i<singles.length;i++) {
      chain=applyJump(chain,jumps[i-1]);
      assert.equal(chain,states[singles[i].absolute]);
      assert(allowed(originalMasks[i],chain%29));
    }
    const corrupted=states[singles[0].absolute]+1;
    assert.notEqual(corrupted,chain);
    positives.push({
      direction:dir,originalShapedPlaintextRunes:p.length,
      singletonSlots:singles.length,
      exactForwardAndInverse:true,
      all83ConstraintsRetainHiddenSeed:true,
      firstState:states[singles[0].absolute]
    });
  }

  /** @param {'plus'|'minus'} direction */
  const runDirection=async direction=>{
    const masks=singles.map(r=>maskFor(r.cipher,direction));
    const residues=Array.from({length:29},(_,i)=>i).filter(i=>allowed(masks[0],i));
    assert.equal(residues.length,3);
    const cases=await Promise.all(residues.map(residue=>
      new Promise((resolve,reject)=>{
        const worker=new Worker(__filename,{workerData:{direction,residue,masks,jumps}});
        worker.once('message',resolve);
        worker.once('error',reject);
        worker.once('exit',code=>{if(code!==0)reject(new Error('worker exited '+code));});
      })
    ));
    const survivorCounts=Array(masks.length).fill(0);
    for(const c of cases)for(let j=0;j<masks.length;j++)
      survivorCounts[j]+=c.survivorsByPrefix[j];
    const fullStates=cases.flatMap(c=>c.fullStatesAtFirstSingleton);
    const fullSolutions=[];
    for(const first of fullStates){
      // Undo the exact 176-prefix state clock (all x are invertible).
      // State at singleton176 is enough for an exact 12956-runic inverse:
      // modular inverse of A modulo 2^32 computed via BigInt Euclid.
      let oldR=MODULUS, r=A, oldT=0, t=1;
      while(r!==0){const q=Math.floor(oldR/r);
        [oldR,r]=[r,oldR-q*r];[oldT,t]=[t,oldT-q*t];}
      assert.equal(oldR,1);
      const invA=((oldT%MODULUS)+MODULUS)%MODULUS;
      let state0=first;
      for(let k=0;k<singles[0].absolute;k++)
        state0=Math.imul(invA,((state0-B)>>>0))>>>0;
      let state=state0;
      const sign=direction==='plus'?1:-1;
      const recovered=trueOriginal.map(c=>{
        const plain=mod29(c-sign*(state%29));
        state=step(state);return plain;
      });
      // Exact complete replay is an implementation assertion, not a solve.
      state=state0;
      for(let i=0;i<recovered.length;i++){
        assert.equal(mod29(recovered[i]+sign*(state%29)),trueOriginal[i]);
        state=step(state);
      }
      const sample=recovered.slice(0,300).map(i=>corpus.translit[i]).join('');
      fullSolutions.push({initialState:state0,firstSingletonState:first,
        recovered300Runes:sample,
        fullCipherReconstruction:true});
    }
    return {direction,allowedFirstStateResidues:residues,
      seedStatesTested:cases.reduce((n,c)=>n+c.attempts,0),
      longestPrefixWithAnyCandidate:survivorCounts.findIndex(c=>c===0),
      survivorsByFirst15Singletons:survivorCounts.slice(0,15),
      complete83ConstraintSurvivors:fullSolutions.length,
      fullSolutions};
  };

  (async()=>{
    const outputs=await Promise.all(['plus','minus'].map(runDirection));
    const summary={
      evidence:'original source-input 83 singleton tests against all 2^32 2013/2016 LCG seeds',
      candidate:{multiplier:A,increment:B,
        stateModulus:MODULUS,keyReadout:'state modulo29',
        originalCipherOrientation:'C=P±K in GP29',
        sourcePremise:'2013 authorial Parable product × 2016 signed tree dimensions × 2012 explicit 3301 dimension multiplication',
        creatorSelected:false},
      original:{runes:trueOriginal.length,words:words.length,
        nativeOneRuneWordSites:singles.length,
        permittedPlaintext:'A, I or O at each exact original singleton',
        firstFour:singles.slice(0,4)},
      controls:positives,exhaustive:outputs,
      interpretation:'A complete zero-survivor result excludes only the exactly stated 32-bit source LCG under GP29 additive cipher and native A/I/O singleton preservation. An LCG or GP29 operation is not independently selected by the manuscript; no stronger claim follows.'
    };
    console.log('ORIGINAL_2013_2016_LCG_ALLSEED '+JSON.stringify(summary));
  })().catch(err=>{console.error(err.stack||err);process.exitCode=1;});
}

module.exports={step,jump,applyJump,maskFor};
