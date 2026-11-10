'use strict';
/**
 * Source-key inverse for a proposed 28-unit multiplicative GP difference cipher.
 *
 * d[t] = (C[t]-C[t-1]) mod 29; d=0 is the proposed literal GP EA marker.
 * For d!=0: log_15(d) = sigma(P[t]) - sign*K[t] (mod 28).
 * sigma is ANY 28-symbol permutation, shared by all sections.
 *
 * A key-independent statistic (post-key-removal IoC) identifies or rejects
 * a known AES/ChaCha keystream even when sigma is unknown. Eight 32-byte
 * sources are assigned one-to-one to the eight printed text sections.
 * Model selected only on the first 300 nonzero steps per section; the next
 * 300 steps remain untouched. Nulls shuffle the grid's 256 original bytes
 * and rerun the entire selected configuration/assignment search.
 *
 * The forward/inverse source-GP plant uses actual grid bytes, arbitrary
 * unknown sigma and exact original section lengths, and checks every symbol.
 *
 * Node.js 22 CommonJS. Use: node sims/field_unit_csprng_alphabet_inverse.cjs
 * Original 56 physical LP2 pages, with runeless page50 and solved 56–57
 * excluded by corpus page IDs; no writes or external packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {toGematria,xorshift}=require('./previous_cipher_sbox_invariant.cjs');
const ROOT=path.resolve(__dirname,'..'),MOD=29,RADIX=28;
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const ANEND=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/cicada2014-archive-hash-manifest.json'),'utf8')).targetHex;
assert.match(ANEND,/^[0-9a-f]{128}$/i);
const IV_MODE=process.env.LP2_FIELD_IV||'zero';
assert.ok(['zero','anend','digest-key'].includes(IV_MODE),'Unknown source-IV mode');
const DIGEST=Buffer.from(ANEND,'hex');
const NONCES=IV_MODE==='anend'?[{name:'anend-first16',bytes:DIGEST.subarray(0,16)},
  {name:'anend-last16',bytes:DIGEST.subarray(48,64)}]:
  [{name:'zero',bytes:Buffer.alloc(16)}];
const raw=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const page=data.pages.filter(p=>p.page<=55&&p.indices.length);
const flat=page.flatMap(p=>p.indices);
const lengths=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(page.length,55);
assert.equal(flat.length,12956);
assert.equal(lengths.reduce((x,y)=>x+y,0),flat.length);
assert.equal(grid.bytes.length,256);
const sections=[];let off=0;
for(const n of lengths){sections.push(flat.slice(off,off+n));off+=n;}
const exp=[],log=Array(MOD).fill(-1);
for(let i=0,v=1;i<RADIX;i++,v=15*v%MOD){assert.equal(log[v],-1);exp.push(v);log[v]=i;}
assert.equal(exp.length,RADIX);assert.equal(log[0],-1);
const TRAIN=300,HOLD=300,MAXKEY=3600;
const ALGORITHMS=['aes-256-ctr','chacha20'];
const REDUCERS=['mod','scale'];
const CLOCKS=['skip-zero','consume-zero'];
const LAYOUTS=['columns','chunks'];
const SIGNS=[-1,1];
const SEED=0x2890a991;
const random=xorshift(SEED);
const mod28=n=>(n%RADIX+RADIX)%RADIX;

/** @param {number[]} original @param {string} clock */
function observations(original,clock){
  const result=[];
  let ptr=0;
  for(let i=1;i<original.length;i++){
    const d=(original[i]-original[i-1]+MOD)%MOD;
    if(d!==0)result.push({x:log[d],keyIndex:ptr});
    if(d!==0||clock==='consume-zero')ptr++;
  }
  return result;
}
const OBS=Object.fromEntries(CLOCKS.map(clock=>[
  clock,sections.map(s=>observations(s,clock))
]));
for(const clock of CLOCKS)assert.ok(OBS[clock].every(s=>s.length>=TRAIN+HOLD));

/** @param {number[]} bytes @param {'columns'|'chunks'} layout */
function originalKeys(bytes,layout){
  if(layout==='columns')return Array.from({length:8},(_,j)=>
    Buffer.from(Array.from({length:32},(_,i)=>bytes[i*8+j])));
  return Array.from({length:8},(_,j)=>Buffer.from(bytes.slice(32*j,32*j+32)));
}

/**
 * Original grid supplies eight candidate section key-or-nonce blocks. In the
 * digest-key variant, the independently printed solved-page SHA-512 target
 * is instead the 256-bit symmetric key (first/last half), with one distinct
 * original-table 16-byte nonce per section.
 *
 * @param {number[]} bytes Exact 256 original base-60-decoded grid bytes.
 * @param {'columns'|'chunks'} layout Original 8x32-byte serialization.
 * @returns {Array<{name:string,blocks:Array<{key:Buffer,nonce:Buffer}>}>}
 */
function keyNonceOptions(bytes,layout){
  const blocks=originalKeys(bytes,layout);
  if(IV_MODE==='digest-key')return [0,1].flatMap(keyHalf=>
    [0,1].map(nonceHalf=>({
      name:'digest-half'+keyHalf+'-grid-half'+nonceHalf,
      blocks:blocks.map(b=>({
        key:DIGEST.subarray(32*keyHalf,32*keyHalf+32),
        nonce:b.subarray(16*nonceHalf,16*nonceHalf+16)
      }))
    })));
  return NONCES.map(nonce=>({
    name:nonce.name,
    blocks:blocks.map(key=>({key,nonce:nonce.bytes}))
  }));
}

/** @param {Buffer} key @param {string} algorithm @param {string} reducer */
function keystream(key,algorithm,reducer,nonce){
  const c=crypto.createCipheriv(algorithm,key,nonce);
  const bytes=Buffer.concat([c.update(Buffer.alloc(MAXKEY)),c.final()]);
  return Uint8Array.from(bytes,b=>reducer==='mod'?b%RADIX:Math.floor(b*RADIX/256));
}

/** @param {{x:number,keyIndex:number}[]} records @param {Uint8Array} pad
 * @param {number} sign @param {number} from @param {number} to */
function hist(records,pad,sign,from,to){
  const counts=new Int32Array(RADIX);
  for(let i=from;i<to;i++){
    const {x,keyIndex}=records[i];
    counts[mod28(x+sign*pad[keyIndex])]++;
  }
  return counts;
}

/** @param {Int32Array} counts @param {number} n */
function ioc(counts,n){
  let pairs=0;for(const v of counts)pairs+=v*(v-1);
  return pairs/(n*(n-1));
}
/** @param {number[][]} matrix */
function assignment(matrix){
  const scores=new Float64Array(256).fill(-Infinity);
  const prev=new Int16Array(256).fill(-1);
  const which=new Int8Array(256).fill(-1);scores[0]=0;
  for(let mask=0;mask<255;mask++){
    const row=mask.toString(2).replace(/0/g,'').length;
    if(row===8||!Number.isFinite(scores[mask]))continue;
    for(let j=0;j<8;j++)if((mask&(1<<j))===0){
      const next=mask|(1<<j),candidate=scores[mask]+matrix[row][j];
      if(candidate>scores[next]){scores[next]=candidate;prev[next]=mask;which[next]=j;}
    }
  }
  let mask=255;const chosen=new Array(8);
  for(let row=7;row>=0;row--){chosen[row]=which[mask];mask=prev[mask];}
  assert.equal(mask,0);
  return {score:scores[255]/8,chosen};
}

/** @param {number[]} bytes @returns {object} */
function attack(bytes){
  const models=[];
  for(const layout of LAYOUTS)for(const scheme of keyNonceOptions(bytes,layout)){
    const keys=scheme.blocks;
    for(const algorithm of ALGORITHMS){
      const stream=Object.fromEntries(REDUCERS.map(reducer=>[
        reducer,keys.map(x=>keystream(x.key,algorithm,reducer,x.nonce))
      ]));
      for(const reducer of REDUCERS)for(const sign of SIGNS)for(const clock of CLOCKS){
        const matrix=OBS[clock].map(o=>
          stream[reducer].map(k=>ioc(hist(o,k,sign,0,TRAIN),TRAIN)));
        const selected=assignment(matrix),pooled=new Int32Array(RADIX);
        const trainPool=new Int32Array(RADIX);
        let holdMean=0;
        for(let j=0;j<8;j++){
          const obs=OBS[clock][j],pad=stream[reducer][selected.chosen[j]];
          const h=hist(obs,pad,sign,TRAIN,TRAIN+HOLD);
          const t=hist(obs,pad,sign,0,TRAIN);
          holdMean+=ioc(h,HOLD)/8;
          for(let x=0;x<RADIX;x++){pooled[x]+=h[x];trainPool[x]+=t[x];}
        }
        models.push({nonce:scheme.name,layout,algorithm,reducer,sign,clock,
          assignment:selected.chosen,trainMean:selected.score,
          heldoutMean:holdMean,
          heldoutPooled:ioc(pooled,8*HOLD),
          trainPooled:ioc(trainPool,8*TRAIN)});
      }
    }
  }
  models.sort((a,b)=>b.trainMean-a.trainMean);
  return {champion:models[0],top:models.slice(0,6)};
}

/** Forward cryptosystem, including exact zero step, from GP source. */
function plant(){
  const source=toGematria(raw);
  assert.equal(source.length,218800);
  let sourceOffset=100000;
  const sigma=Array.from({length:RADIX},(_,i)=>i);
  for(let i=RADIX-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [sigma[i],sigma[j]]=[sigma[j],sigma[i]];
  }
  const inverse=new Uint8Array(RADIX);
  for(let p=0;p<RADIX;p++)inverse[sigma[p]]=p;
  const trueScheme=keyNonceOptions(grid.bytes,'columns')[0];
  const keys=trueScheme.blocks.map(x=>
    keystream(x.key,'aes-256-ctr','mod',x.nonce));
  const assigned=[4,0,7,2,6,1,5,3];
  const plain=[],cipher=[],recovered=[];
  for(let section=0;section<8;section++){
    const p=source.slice(sourceOffset,sourceOffset+lengths[section]);
    sourceOffset+=lengths[section];
    const c=[p[0]],k=keys[assigned[section]];
    let ptr=0;
    for(let i=1;i<p.length;i++){
      const v=p[i];
      if(v===28)c.push(c[i-1]);
      else{const step=mod28(sigma[v]-k[ptr++]);c.push((c[i-1]+exp[step])%29);}
    }
    const out=[c[0]];ptr=0;
    for(let i=1;i<c.length;i++){
      const delta=(c[i]-c[i-1]+29)%29;
      if(delta===0)out.push(28);
      else out.push(inverse[mod28(log[delta]+k[ptr++])]);
    }
    plain.push(p);cipher.push(c);recovered.push(out);
  }
  const plainFlat=plain.flat();
  const correct=recovered.flat().filter((v,i)=>v===plainFlat[i]).length;
  assert.equal(correct,12956);
  // Fit exactly as in real attack but on the planted manuscript.
  const savedSkip=OBS['skip-zero'],savedConsume=OBS['consume-zero'];
  OBS['skip-zero']=cipher.map(s=>observations(s,'skip-zero'));
  OBS['consume-zero']=cipher.map(s=>observations(s,'consume-zero'));
  const fitted=attack(grid.bytes);
  OBS['skip-zero']=savedSkip;OBS['consume-zero']=savedConsume;
  const win=fitted.champion;
  const keyCorrect=win.assignment.filter((v,i)=>v===assigned[i]).length;
  assert.equal(win.nonce,trueScheme.name);
  assert.equal(win.layout,'columns');
  assert.equal(win.algorithm,'aes-256-ctr');
  assert.equal(win.reducer,'mod');
  assert.equal(win.sign,1);
  assert.equal(win.clock,'skip-zero');
  assert.equal(keyCorrect,8);
  return {encryptedAndExactlyRecovered:correct,
    total:12956,knownSourceKeyConfigurationRecovered:true,
    recoveredKeyAssignments:keyCorrect,chosen:win,
    samplePlaintextRuneIndices:plain[0].slice(0,24),
    sampleCiphertextRuneIndices:cipher[0].slice(0,24)};
}
function main(){
  const original=attack(grid.bytes);
  const control=plant();
  const trials=Number(process.env.LP2_FIELD_NULLS||100);
  assert.ok(Number.isInteger(trials)&&trials>=0&&trials<=1000);
  const maxima=[];
  for(let rep=0;rep<trials;rep++){
    const shuffled=[...grid.bytes];
    for(let j=255;j>0;j--){
      const k=Math.floor(random()*(j+1));
      [shuffled[j],shuffled[k]]=[shuffled[k],shuffled[j]];
    }
    maxima.push(attack(shuffled).champion.heldoutPooled);
  }
  const target=original.champion.heldoutPooled;
  const exceeds=maxima.filter(x=>x>=target).length;
  const mean=maxima.reduce((s,x)=>s+x,0)/(maxima.length||1);
  console.log(JSON.stringify({
    hypothesis:'EA transparent 28-step log15 GP + eight 256-bit grid AES/ChaCha keys + unknown output permutation',
    corpus:{physicalPages:55,runes:12956,sectionLengths:lengths,
      observedNonzeroBySection:OBS['skip-zero'].map(x=>x.length)},
    selection:{source:'eight printed 32-byte grid keys',
      trainPerSection:TRAIN,heldoutPerSection:HOLD,
      globalSettings:32*(IV_MODE==='digest-key'?4:NONCES.length),
      nonceSource:IV_MODE==='anend'?'Solved LP2 page56 SHA512 target, first or last 16 printed digest bytes':
        IV_MODE==='digest-key'?'Solved p56 SHA512 target as first/last 32-byte key; original grid eight 16-byte nonces':'historical zero-IV benchmark',
      nonceChoices:keyNonceOptions(grid.bytes,'columns').map(x=>x.name),
      assignment:'all 8! via exact subset DP'},
    original,
    syntheticControl:control,
    shuffledGridFamilywise:{
      trials,seed:'0x2890a991',mean,
      atLeastOriginal:exceeds,addOneUpperP:(exceeds+1)/(trials+1),
      sortedHeldoutPooled:maxima.sort((a,b)=>a-b).slice(-5)},
    interpretation:'An exact plant exercises output-permutation uncertainty, key assignment, and all 12956 reversible GP runes; a low original holdout score does not identify the genuine cipher or plaintext.'
  },null,2));
}
if(require.main===module)main();
module.exports={observations,assignment,attack,plant};
