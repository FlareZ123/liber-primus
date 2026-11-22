'use strict';
/**
 * Aggregate the 128 non-overlapping PHP 5.x MT seed-shard artifacts from
 * the p15 Fibonacci red-heading crib search. Reject partial/missing coverage.
 * Node.js 22, CommonJS. Input is gh run download's directory output.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const SHARDS=128;
const SIZE=33554432;
const END=4294967296;
const SUMMARY=/^SUMMARY begin=(\d+) end=(\d+) seeds=(\d+) noF=(\d+) literalF_skip=(\d+) literalF_consume=(\d+) cpu_s=([\d.]+)$/gm;
const HIT=/^HIT seed=(\d+) reducer=(\d+) sign=([+-]\d+) chain=(\d+) carrier=(\d+) Fmode=(\d+) matches=(\d+)$/gm;

/** @param {string} text @param {number} shard */
function parse(text,shard){
  const lines=[...text.matchAll(SUMMARY)];
  assert.equal(lines.length,1,'Exactly one complete SUMMARY required for '+shard);
  const m=lines[0],numbers=m.slice(1,7).map(Number);
  const [begin,end,seeds,noF,literalSkip,literalConsume]=numbers;
  assert.equal(begin,shard*SIZE);
  assert.equal(end,(shard+1)*SIZE);
  assert.equal(seeds,SIZE);
  const hits=[...text.matchAll(HIT)].map(h=>({
    seed:Number(h[1]),reducer:Number(h[2]),sign:Number(h[3]),
    chain:Number(h[4]),carrier:Number(h[5]),Fmode:Number(h[6]),
    matches:Number(h[7])
  }));
  assert.equal(hits.length,noF+literalSkip+literalConsume,
    'Candidate count/record disagreement on shard '+shard);
  for(const hit of hits){
    assert.ok(hit.seed>=begin&&hit.seed<end);
    assert.ok(hit.reducer>=0&&hit.reducer<=4);
    assert.ok(hit.sign===1||hit.sign===-1);
    assert.ok(hit.chain>=0&&hit.chain<=1);
    assert.ok(hit.carrier>=0&&hit.carrier<=1);
    assert.ok(hit.Fmode>=0&&hit.Fmode<=2);
    assert.equal(hit.matches,hit.Fmode===0?9:8);
  }
  return {shard,begin,end,seeds,noF,literalSkip,literalConsume,
    cpuSeconds:Number(m[7]),hits};
}
/** @param {string} folder */
function walk(folder){
  const out=[];
  for(const dirent of fs.readdirSync(folder,{withFileTypes:true})){
    const name=path.join(folder,dirent.name);
    if(dirent.isDirectory())out.push(...walk(name));
    else if(dirent.isFile())out.push(name);
  }
  return out;
}
/** @param {string} folder */
function aggregate(folder){
  const indexed=new Map();
  for(const name of walk(folder)){
    const match=/^fib-heading-(\d+)\.log$/.exec(path.basename(name));
    if(!match)continue;
    const shard=Number(match[1]);
    assert.ok(shard>=0&&shard<SHARDS);
    assert.ok(!indexed.has(shard),'Duplicate shard '+shard);
    indexed.set(shard,parse(fs.readFileSync(name,'utf8'),shard));
  }
  assert.equal(indexed.size,SHARDS,
    'Incomplete seed coverage: '+indexed.size+'/'+SHARDS+' shards');
  const ordered=Array.from({length:SHARDS},(_,i)=>{
    const value=indexed.get(i);
    assert.ok(value,'Missing shard '+i);
    return value;
  });
  const total=ordered.reduce((s,x)=>s+x.seeds,0);
  assert.equal(total,END);
  const hits=ordered.flatMap(x=>x.hits);
  const candidates={
    noF:ordered.reduce((s,x)=>s+x.noF,0),
    literalFSkip:ordered.reduce((s,x)=>s+x.literalSkip,0),
    literalFConsume:ordered.reduce((s,x)=>s+x.literalConsume,0)
  };
  assert.equal(hits.length,Object.values(candidates).reduce((s,x)=>s+x,0));
  return {
    model:'PHP 5.x 32-bit MT19937, FIBONACCI hypothesized nine-rune page15 heading',
    source:'LP2 page15 original scan32.jpg; source red words are 4+5, not a single nine-rune word',
    scope:'Five historical output reductions; +/- additive; optional ciphertext chaining; direct and atbash carriers; F literal key consume or skip.',
    coverage:{shards:SHARDS,seedsPerShard:SIZE,begin:0,endExclusive:END,
      totalSeeds:total,complete:true},
    candidates,hits,
    cpuSecondsSum:ordered.reduce((s,x)=>s+x.cpuSeconds,0),
    caveat:'Even exact heading matches are only crib hits; independently decode other text and re-encrypt before claiming recovered plaintext.'
  };
}
if(require.main===module){
  if(process.argv[2]==='--selftest'){
    const text='HIT seed=777 reducer=0 sign=+1 chain=0 carrier=0 Fmode=1 matches=8\n'+
      'SUMMARY begin=0 end=33554432 seeds=33554432 noF=0 literalF_skip=1 literalF_consume=0 cpu_s=7.123\n';
    const out=parse(text,0);
    assert.equal(out.hits.length,1);
    assert.equal(out.hits[0].seed,777);
    console.log('PASS: single-shard parser positive; coverage gate requires all 128');
  }else{
    const folder=path.resolve(process.argv[2]||'fibonacci-artifacts');
    console.log(JSON.stringify(aggregate(folder),null,2));
  }
}
module.exports={parse,walk,aggregate};
