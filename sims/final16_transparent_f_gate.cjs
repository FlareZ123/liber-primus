'use strict';
/**
 * LP2 p40..55: exact key-independent-linguistic feasibility gate for
 * source-frozen AES/ChaCha GP29 pads under the authentic solved-page-56
 * literal-F/no-consumption transducer.
 *
 * Test 40 page-local AES-128 original-grid/square-IV models and 48
 * four-by-829-block SHA256-square AES-256/ChaCha20 models. Exhaust all
 * F-skip masks by propagating reachable key-clock states. Each scenario
 * includes a native-English complete forward plant using the same rule.
 *
 * Deterministic finite cryptanalytic exclusion, conditional on the same
 * pure literal-F transducer as solved LP2 p56. Node.js 22, CommonJS.
 * @module final16_transparent_f_gate
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {readSquare,clockwiseSpiral}=require('./fibonacci_prime_spiral.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');

const ROOT=path.join(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const grid=require('../resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=55);
const source=pages.flatMap(p=>p.indices), LENGTH=829;
assert.equal(source.length,4*LENGTH);
assert.equal(pages.length,16);
const mod=x=>(x%29+29)%29;
const square=readSquare(),rows=square.flat();
const spiral=clockwiseSpiral().map(([r,c])=>square[r][c]);
const zero=()=>Buffer.alloc(16);
const makeIv=x=>{const b=zero();b.writeUInt16BE(x);return b;};
/** @param {Buffer} key @param {string} algo @param {Buffer} iv @param {number} size */
function cipherStream(key,algo,iv,size){
  const stream=crypto.createCipheriv(algo,key,iv);
  return Buffer.concat([stream.update(Buffer.alloc(size)),stream.final()]);
}
/** @param {Buffer} bytes @param {boolean} scaled */
function toPad(bytes,scaled){return Array.from(bytes,x=>scaled?Math.floor(29*x/256):x%29);}
/**
 * Exhaustive reachable key clocks for the lossless selective F transducer.
 * If P_i=0, emission is always C_i=0 and does not advance key. If P_i!=0,
 * C_i=P_i-sign*pad[clock] mod29 and it advances exactly one key byte.
 * Any possible secret-F mask is allowed, including at the first position.
 * @param {number[]} ciphertext
 * @param {number[]} pad
 * @param {-1|1} sign
 */
function possible(ciphertext,pad,sign){
  let states=new Set([0]),largest=1;
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set(),c=ciphertext[i];
    for(const clock of states){
      if(clock<pad.length && mod(c+sign*pad[clock])!==0)
        next.add(clock+1);
      if(c===0)next.add(clock);
    }
    if(!next.size)return {possible:false,firstImpossible:i,
      priorStates:states.size,largestStateCount:largest};
    states=next;largest=Math.max(largest,states.size);
  }
  return {possible:true,firstImpossible:null,
    endStates:states.size,largestStateCount:largest};
}
/** @param {number[]} plain @param {number[]} pad @param {-1|1} sign */
function encrypt(plain,pad,sign){
  let clock=0;
  return plain.map(p=>{
    if(p===0)return 0;
    assert(clock<pad.length);
    return mod(p-sign*pad[clock++]);
  });
}
const raw=Buffer.from(grid.bytes);
assert.equal(raw.length,256);
const col=Buffer.from(Array.from({length:8},(_,j)=>
  Array.from({length:32},(_,i)=>raw[i*8+j])).flat());
const aesKeys={
  'grid-row-major':Array.from({length:16},(_,i)=>raw.subarray(16*i,16*(i+1))),
  'grid-column-major':Array.from({length:16},(_,i)=>col.subarray(16*i,16*(i+1)))
};
const ivChoices={
  zero:rows.map(()=>zero()),
  'square-printed':rows.map(makeIv),
  'square-spiral':spiral.map(makeIv),
  'square-printed-complement':rows.map(v=>makeIv(Math.abs(3301-v))),
  'square-spiral-complement':spiral.map(v=>makeIv(Math.abs(3301-v)))
};
const pageCases=[];
for(const [keysName,keys] of Object.entries(aesKeys))
  for(const [ivName,ivs] of Object.entries(ivChoices))
    for(const scaled of [false,true])
      for(const sign of [-1,1]){
        const pads=pages.map((p,i)=>toPad(
          cipherStream(keys[i],'aes-128-ctr',ivs[i],p.indices.length),scaled));
        pageCases.push({name:keysName+'/'+ivName+'/'+(scaled?'scaled':'mod')+'/'+sign,
          sign,pads});
      }
assert.equal(pageCases.length,40);
const groupings={
  'printed-rows':square.map(x=>x.slice()),
  'printed-columns':[0,1,2,3].map(j=>square.map(x=>x[j])),
  'spiral-quartets':[0,1,2,3].map(j=>spiral.slice(j*4,j*4+4))
};
const blockCases=[];
for(const [groupName,groups] of Object.entries(groupings))
  for(const endian of ['BE','LE'])
    for(const algorithm of ['aes-256-ctr','chacha20'])
      for(const scaled of [false,true])
        for(const sign of [-1,1]){
          const pads=groups.map(numbers=>{
            const bytes=Buffer.alloc(8);
            numbers.forEach((x,i)=>bytes['writeUInt16'+endian](x,i*2));
            const key=crypto.createHash('sha256').update(bytes).digest();
            return toPad(cipherStream(key,algorithm,zero(),LENGTH),scaled);
          });
          blockCases.push({name:groupName+'/'+endian+'/'+algorithm+'/'+
            (scaled?'scaled':'mod')+'/'+sign,sign,pads});
        }
assert.equal(blockCases.length,48);
const blocks=Array.from({length:4},(_,i)=>source.slice(i*LENGTH,(i+1)*LENGTH));
const originalPages=pages.map(p=>p.indices);
/** @param {typeof pageCases|typeof blockCases} scenarios @param {number[][]} book */
function scan(scenarios,book){
  const output=[];
  for(const item of scenarios){
    const tests=book.map((part,i)=>possible(part,item.pads[i],item.sign));
    output.push({name:item.name,possible:tests.every(x=>x.possible),
      firstImpossibleParts:tests.map((x,i)=>x.possible?null:
        ({part:i,offset:x.firstImpossible})).filter(Boolean),
      totalClockPathsAtEnd:tests.reduce((s,v)=>s+(v.endStates||0),0)});
  }
  return output;
}
function run(){
  const controlText=fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8');
  const sample=encode(controlText.slice(240000)).slice(0,3316);
  assert.equal(sample.length,3316);
  const candidate=pageCases.find(x=>x.name==='grid-row-major/zero/mod/-1');
  assert.ok(candidate);
  let at=0;
  const pageSource=originalPages.map(p=>sample.slice(at,at+=p.length));
  const encrypted=pageSource.map((p,i)=>encrypt(p,candidate.pads[i],candidate.sign));
  const planted=encrypted.map((p,i)=>possible(p,candidate.pads[i],candidate.sign));
  assert.ok(planted.every(x=>x.possible));
  let skips=0;
  for(const page of pageSource)skips+=page.filter(x=>x===0).length;
  assert.ok(skips>20);
  const blockCandidate=blockCases.find(x=>x.name==='printed-rows/BE/aes-256-ctr/mod/-1');
  assert.ok(blockCandidate);
  const blockPlain=Array.from({length:4},(_,j)=>sample.slice(j*LENGTH,(j+1)*LENGTH));
  const blockPlant=blockPlain.map((p,i)=>encrypt(p,blockCandidate.pads[i],blockCandidate.sign));
  assert.ok(blockPlant.every((p,i)=>possible(p,blockCandidate.pads[i],blockCandidate.sign).possible));
  const pageOriginal=scan(pageCases,originalPages);
  const blockOriginal=scan(blockCases,blocks);
  const pageSurvivors=pageOriginal.filter(x=>x.possible);
  const blockSurvivors=blockOriginal.filter(x=>x.possible);
  const result={
    classification:'Exact original-symbol no-hidden-key language-independent exclusion',
    conditionalCipher:'Authentic solved-p56 selective literal F, no consumed key on source F; direct additive GP29 byte pad on every other source symbol',
    originalSource:'last LP2 section p40..55, physical p50 number-only, 3316 original runes',
    tests:{
      sixteenPageAes128:{family:pageCases.length,fullyPossible:pageSurvivors.length,
        survivors:pageSurvivors,
        minimumImpossiblePages:Math.min(...pageOriginal.map(x=>x.firstImpossibleParts.length)),
        failures:pageOriginal.map(x=>({name:x.name,
          impossiblePages:x.firstImpossibleParts}))},
      four829BlocksAes256ChaCha:{family:blockCases.length,fullyPossible:blockSurvivors.length,
        survivors:blockSurvivors,
        minimumImpossibleBlocks:Math.min(...blockOriginal.map(x=>x.firstImpossibleParts.length)),
        failures:blockOriginal.map(x=>({name:x.name,
          impossibleBlocks:x.firstImpossibleParts}))}
    },
    sourceEnglishControls:{runes:sample.length,plaintextFEvents:skips,
      pageControl:{model:candidate.name,fullyFeasible:planted.every(x=>x.possible)},
      blockControl:{model:blockCandidate.name,
        fullyFeasible:blockPlant.every((p,i)=>possible(p,blockCandidate.pads[i],blockCandidate.sign).possible)}},
    limits:'Applies only to frozen grid/square key starts, exact page or block alignment and the pure solved-p56 literal-F/no-key-consumption law. A different cipher, F encoding, key advancement, invisible state or outer layer remains untested.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,possible,encrypt,scan};
