'use strict';

/**
 * Test the exact nonzero-step discrete-logarithm coordinate implied by the
 * three independently red-marked GP sum quotients q40=15, q15=22, q53=78:
 *
 * 15^2 = 22 (mod29), 22^2 = 20 = 78 (mod29).
 * ord29(15)=28, ord29(22)=14, ord29(20)=7.
 *
 * For a nonrepeated published rune pair (a,b), let
 * R=log_15((b-a) mod29) in Z28. This is a bijection on all nonzero
 * differences, and exactly explains a no-repeat 29-rune chain coordinate.
 * Page initials and 86 literal doubles are explicit erasures. Testing
 * P=(R+sign*K) mod28 does not assume this was the author's real cipher.
 *
 * Finite historical source keys: entire printed 256-byte grid, fixed
 * p15 4x4 Fibonacci-prime spiral, 78-period powers of 53 in F79,
 * and the ordinary prime / totient stream from the solved page56 method.
 *
 * Run: node sims/red_triangle_discrete_log_step.cjs
 * Node.js 22, CommonJS, deterministic; no network or writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {readSquare, clockwiseSpiral}=require('./fibonacci_prime_spiral.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const M=29, Q=28, SEED=0x7ace3015;
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);

/** @param {number} v @param {number} n @param {number} m */
function power(v,n,m){
  let out=1;
  while(n>0){if(n%2)out=out*v%m;v=v*v%m;n=Math.floor(n/2);}
  return out;
}
/** @param {number} v @param {number} p */
function order(v,p){
  let x=1;for(let k=1;k<p;k++){x=x*v%p;if(x===1)return k;}
  throw new Error('Not in multiplicative field');
}
assert.deepEqual([435/29,638/29,2262/29],[15,22,78]);
assert.equal(power(15,2,29),22);
assert.equal(power(22,2,29),78%29);
assert.deepEqual([15,22,78%29].map(x=>order(x,29)),[28,14,7]);

const steps=Array.from({length:Q},(_,k)=>power(15,k,M));
const logs=new Int8Array(M).fill(-1);
for(let k=0;k<Q;k++){
  assert.equal(logs[steps[k]],-1);
  logs[steps[k]]=k;
}
assert.equal(logs[0],-1);
assert.equal(steps[logs[20]],20);
assert.equal(new Set(steps).size,Q);

/** @param {number[][]} segments */
function rankStream(segments){
  return segments.map(row=>row.map((c,i)=>
    i===0||c===row[i-1]?-1:logs[(c-row[i-1]+M)%M]));
}
const original=rankStream(pages.map(p=>p.indices));
assert.equal(original.flat().filter(x=>x<0).length,141);

/** @returns {number[]} */
function ordinaryPrimes(){
  const N=230000,sieve=new Uint8Array(N+1),result=[];
  for(let p=2;p*p<=N;p++)if(!sieve[p])
    for(let j=p*p;j<=N;j+=p)sieve[j]=1;
  for(let p=2;p<=N;p++)if(!sieve[p])result.push(p);
  assert(result.length>16500);
  return result;
}

/**
 * @typedef {{name:string, seq:number[], offsets:number[]}} Family
 * @returns {Family[]}
 */
function families(){
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  const f79=[];let residue=1;
  for(let i=0;i<78;i++){
    f79.push(residue);residue=residue*53%79;
  }
  assert.equal(residue,1);
  assert.equal(new Set(f79).size,78);
  const square=readSquare(),fib=clockwiseSpiral().map(([r,c])=>square[r][c]);
  assert.deepEqual(fib,[3299,3298,3296,3294,3288,3278,3258,3222,
    3152,3038,2838,2472,1820,708,1206,4516]);
  const primes=ordinaryPrimes();
  const offsets=[0,1,7,15,22,53,78,79,149,3301];
  return [
    {name:'grid-mod28',seq:bytes.map(x=>x%Q),offsets:bytes.map((_,i)=>i)},
    {name:'grid-scaled28',seq:bytes.map(x=>Math.floor(28*x/256)),offsets:bytes.map((_,i)=>i)},
    {name:'F79-residue',seq:f79.map(x=>x%Q),offsets:f79.map((_,i)=>i)},
    {name:'F79-square',seq:f79.map(x=>x*x%79%Q),offsets:f79.map((_,i)=>i)},
    {name:'Fibonacci-prime-spiral',seq:fib.map(x=>x%Q),offsets:fib.map((_,i)=>i)},
    {name:'ordinary-prime',seq:primes.map(x=>x%Q),offsets},
    {name:'ordinary-prime-totient',seq:primes.map(x=>(x-1)%Q),offsets},
  ];
}

/**
 * @typedef {{source:string, offset:number, sign:-1|1, reset:boolean, advanceErasure:boolean}} Choice
 * @param {Family[]} keys
 */
function configurations(keys){
  const options=[];
  for(const family of keys)for(const offset of family.offsets)
    for(const sign of [-1,1])for(const reset of [false,true])
      for(const advanceErasure of [false,true])
        options.push({source:family.name,offset,sign,reset,advanceErasure});
  assert.equal(options.length,5632);
  return options;
}
/** @param {number[]} cipher @returns {number} */
function ioc(cipher){
  const count=new Uint32Array(Q);
  for(const x of cipher)count[x]++;
  const n=cipher.length;
  let matches=0;for(const c of count)matches+=c*(c-1);
  return matches/(n*(n-1));
}

/** Decode a source-rank book under the exact configured external key rule.
 *  @param {number[][]} rankPages
 *  @param {Choice} config
 *  @param {Map<string,Family>} keyByName
 */
function decode(rankPages,config,keyByName){
  const key=keyByName.get(config.source).seq;
  const parts=[[],[]];let pointer=0;
  for(let pi=0;pi<rankPages.length;pi++){
    if(config.reset)pointer=0;
    for(const r of rankPages[pi]){
      const digit=key[(pointer+config.offset)%key.length];
      if(r>=0)parts[pages[pi].page%2].push((r+config.sign*digit+Q)%Q);
      if(config.advanceErasure||r>=0)pointer++;
    }
  }
  return parts;
}

/** @param {number[][]} rankPages @param {Family[]} keys */
function scan(rankPages,keys){
  const byName=new Map(keys.map(x=>[x.name,x]));
  const models=configurations(keys).map(config=>{
    const [training,heldout]=decode(rankPages,config,byName);
    return {...config,trainIoC:ioc(training),heldoutIoC:ioc(heldout)};
  });
  models.sort((a,b)=>b.trainIoC-a.trainIoC);
  return {
    configurations:models.length, bestTraining:models.slice(0,8),
    bestHeldout:models.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC).slice(0,4),
  };
}

/** @returns {number[]} Independent late-English GP token register 0..27. */
function controlPlaintext(){
  const labels=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const input=read('resources/control/shakespeare_first300k.txt')
    .slice(240000).toUpperCase().replace(/[KVQZ]/g,
      c=>({K:'C',V:'U',Q:'C',Z:'S'})[c]);
  const result=[];
  for(let i=0;i<input.length;){
    const matched=labels.find(x=>input.startsWith(x.s,i));
    if(!matched){i++;continue;}
    if(matched.i<Q)result.push(matched.i);
    i+=matched.s.length;
  }
  assert.equal(result.length,43465);
  return result;
}

/**
 * Generate authentic 29-rune chain from withheld GP-language positions and
 * the source-selected candidate K, with the original erasure positions.
 * Decryption must recover all 12815 nonerasure input values exactly.
 * @param {Choice} truth
 * @param {Map<string,Family>} byName
 * @param {number[][]} mask
 */
function plant(truth,byName,mask){
  const source=controlPlaintext();
  const start=14069,key=byName.get(truth.source).seq;
  let pointer=0,position=0,repeat=0;
  const plaintext=[],output=[],maskedRank=[];
  for(let page=0;page<pages.length;page++){
    if(truth.reset)pointer=0;
    const cipher=[pages[page].indices[0]], target=[-1];
    const plain=[];
    for(let i=0;i<mask[page].length;i++,position++){
      const m=mask[page][i],k=key[(truth.offset+pointer)%key.length];
      if(m>=0){
        const p=source[start+position];
        const rank=(p-truth.sign*k+Q)%Q;
        plain.push(p);
        cipher.push(0); // next value is assigned below
        if(i===0)throw Error('page initial not erased');
        cipher.pop();
        cipher.push((cipher[i-1]+steps[rank])%M);
        target.push(rank);
      }else if(i>0){
        cipher.push(cipher[i-1]);
        target.push(-1);
        repeat++;
      }
      if(truth.advanceErasure||m>=0)pointer++;
    }
    assert.equal(cipher.length,pages[page].indices.length);
    assert.equal(target.length,cipher.length);
    plaintext.push(plain);
    output.push(cipher);
    maskedRank.push(target);
  }
  assert.equal(position,12956);
  assert.equal(repeat,86);
  assert.deepEqual(rankStream(output),maskedRank);
  const decoded=decode(rankStream(output),truth,byName);
  const originalPlain=pages.flatMap((p,pi)=>plaintext[pi]).length;
  assert.equal(decoded.flat().length,12815);
  const sourceValues=pages.flatMap(()=>[]); // no source mutation
  let correct=0;
  const expected=[[],[]];
  for(let pi=0;pi<pages.length;pi++)
    expected[pages[pi].page%2].push(...plaintext[pi]);
  for(let half=0;half<2;half++)for(let j=0;j<decoded[half].length;j++)
    correct+=Number(decoded[half][j]===expected[half][j]);
  assert.equal(correct,12815);
  return {truth,englishSourceRunes:source.length,sourceOffset:start,
    repeatedCipherRunes:repeat,recoveredExact:correct,
    testIoC:ioc(expected[1]),trainingIoC:ioc(expected[0]),
    synthetic:rankStream(output)};
}

function run(){
  const keys=families();
  const originalStats=scan(original,keys);
  const byName=new Map(keys.map(x=>[x.name,x]));
  const truth={source:'grid-scaled28',offset:103,sign:1,reset:true,advanceErasure:false};
  const control=plant(truth,byName,original);
  const planted=scan(control.synthetic,keys);
  const listed=planted.bestTraining[0];
  assert(planted.bestTraining.some(x=>x.trainIoC>0.05&&x.heldoutIoC>0.05));
  assert(originalStats.bestTraining[0].trainIoC<0.04);
  assert(originalStats.bestTraining[0].heldoutIoC<0.04);
  return {
    classification:'new source-defined 28-ary log-step cipher coordinate; finite negative direct-key inversion',
    exactOriginalArithmetic:{q40:15,q15:22,q53:78,modulus:29,
      square1:power(15,2,29),square2:power(22,2,29),orders:[28,14,7],
      primitiveRoot:15,nonzeroSteps:steps},
    input:{originalRunes:12956,physicalRunePages:55,
      erasures:141,pageStarts:55,adjacentDoublets:86,nonerasureRankSlots:12815,
      rawLogRankIoC:ioc(original.flat().filter(x=>x>=0))},
    cipherFamily:'C_i=C_(i-1)+15^(P_i-sign*K_i mod28) mod29, exact at nonerased positions',
    sourceKeys:keys.map(k=>({name:k.name,length:k.seq.length,offsets:k.offsets.length})),
    original:originalStats,
    positive:{...control,synthetic:undefined,topKey:listed},
    inference:'None of the 5632 fixed source-derived log-step running keys exposes English-GP unigram structure on original LP2. The exponent coordinate itself remains a reversible candidate; no original unknown text or key was recovered.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,power,order,rankStream,decode,plant,scan,families};
