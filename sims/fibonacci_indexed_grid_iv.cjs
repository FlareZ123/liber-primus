'use strict';

/**
 * Source-constrained candidate: use the 16 Fibonacci-prime indices on LP2
 * page 15 to select a 16-byte IV from the 256-byte LP2 base-60 table.
 * Each of the eight vertical table columns remains one AES/ChaCha section key.
 *
 * The train/holdout boundary is fixed at the first 400 runes of every section;
 * all IV layouts, encryption variants and section-key assignments are fitted
 * only on those 400-rune prefixes. No plaintext or cipher key is claimed.
 * Reproduce: node sims/fibonacci_indexed_grid_iv.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {readSquare, clockwiseSpiral, uniqueFibonacciPrimeRanks, primeList} =
  require('./fibonacci_prime_spiral.cjs');
const {inputs, evaluate, cipherBytes, ioc} =
  require('./grid_section_column_keys.cjs');
const {encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const TRAIN = 400;
const NULLS = 40;
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const mod = x => (x % 29 + 29) % 29;

/** Fixed source-derived IV hypotheses, with exact 1-based and byte indexing. */
function sourceIVs() {
  const square = readSquare(), spiral = clockwiseSpiral();
  const printed = spiral.map(([r,c]) => square[r][c]);
  const ranks = uniqueFibonacciPrimeRanks();
  const primes = primeList(ranks[15]).filter((_,i) => ranks.includes(i+1));
  assert.deepEqual(ranks,[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
  assert.deepEqual(primes,[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
  assert.deepEqual(printed.slice(0,4),[3299,3298,3296,3294]);
  const grid = JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8')).byte_rows;
  assert.equal(grid.length,32);
  const sources = {
    'fibonacci-rank-one-based': ranks.map(x => (x-1) & 255),
    'fibonacci-rank-zero-based': ranks.map(x => x & 255),
    'prime-value': primes.map(x => x & 255),
    'printed-square-value': printed.map(x => x & 255)
  };
  const views = {
    'row-major': grid.flat(),
    'column-major': Array.from({length:8},(_,i)=>grid.map(row=>row[i])).flat()
  };
  const variants = [];
  for(const [orientation, table] of Object.entries(views))
    for(const [selector, indices] of Object.entries(sources))
      variants.push({name: orientation+'/'+selector, iv: Buffer.from(indices.map(i=>table[i]))});
  assert.equal(variants.length,8);
  assert.ok(variants.every(x => x.iv.length===16));
  return variants;
}

/** @param {number} seed */
function random(seed) {
  let state=seed>>>0;
  return () => {
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return state>>>0;
  };
}

/** Select the complete IV, mode and one-to-one table-column assignment on training only. */
function choose(groups, keys, variants) {
  const training = groups.map(g => g.slice(0,TRAIN));
  return variants.map(variant => ({
    ...variant, selected: evaluate(training, keys, variant.iv).winner
  })).sort((a,b)=>b.selected.optimum-a.selected.optimum)[0];
}

/** Locked first-400-rune fit, evaluated only beyond rune 400 in each section. */
function holdout(groups, keys, fit) {
  const {algorithm,reverse,scaled,sign,assignment}=fit.selected;
  let weighted=0,total=0;
  const decoded=[];
  for(let i=0;i<groups.length;i++) {
    const group=groups[i],key=keys[assignment[i]];
    const pad=cipherBytes(reverse?key.slice().reverse():key,algorithm,group.length,fit.iv);
    const tail=group.slice(TRAIN), stream=pad.subarray(TRAIN);
    const val=ioc(tail,stream,sign,scaled);
    weighted+=tail.length*val;total+=tail.length;
    decoded.push({section:i,tailLength:tail.length,ioc:val,
      first80:tail.slice(0,80).map((c,j) =>
        RUNES[mod(c+sign*(scaled?Math.floor(stream[j]*29/256):stream[j]%29))]).join('')});
  }
  return {runes:total,weightedIoc:weighted/total,sections:decoded};
}

/** Encrypt independent known English with the actual source keys and one declared IV. */
function planted(groups,keys,iv) {
  const plain=encode(fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'));
  const required=groups.reduce((n,g)=>n+g.length,0);
  assert.ok(plain.length>=required);
  const rng=random(0x3205f1ae);
  let offset=0,repairs=0;
  const output=groups.map((group,j)=>{
    const pad=cipherBytes(keys[j],'aes-256-ctr',group.length,iv);
    const enc=[];
    for(let i=0;i<group.length;i++){
      let v=mod(plain[offset+i]+pad[i]%29);
      if(i>0&&v===enc[i-1]&&rng()/4294967296<0.81){
        v=mod(v+1+rng()%28);
        repairs++;
      }
      enc.push(v);
    }
    offset+=group.length;
    return enc;
  });
  const candidates=sourceIVs();
  const selected=choose(output,keys,candidates);
  const test=holdout(output,keys,selected);
  return {repairs,originalConfigRecovered:
    selected.name===candidates[0].name
    &&selected.selected.algorithm==='aes-256-ctr'
    &&!selected.selected.reverse&&!selected.selected.scaled
    &&selected.selected.sign===-1
    &&selected.selected.assignment.every((k,i)=>k===i),
    selected:selected.name,mode:selected.selected.algorithm,
    assignment:selected.selected.assignment,holdoutIoc:test.weightedIoc};
}

function main(){
  const {groups,columnKeys}=inputs();
  const variants=sourceIVs();
  const best=choose(groups,columnKeys,variants);
  const heldout=holdout(groups,columnKeys,best);
  const synthetic=planted(groups,columnKeys,variants[0].iv);
  assert.ok(synthetic.originalConfigRecovered);
  assert.ok(synthetic.holdoutIoc>0.045);
  const rng=random(0x324bc117);
  const controls=[];
  for(let k=0;k<NULLS;k++){
    const alternatives=Array.from({length:variants.length},(_,i)=>({
      name:'random-'+k+'-'+i,
      iv:Buffer.from(Array.from({length:16},()=>rng()&255))
    }));
    const fit=choose(groups,columnKeys,alternatives);
    controls.push({training:fit.selected.optimum,
      heldout:holdout(groups,columnKeys,fit).weightedIoc});
  }
  const report={model:'page-15 Fibonacci-prime selectors -> grid 16-byte IV; eight grid columns as section keys',
    selectors:variants.map(v=>({name:v.name,hex:v.iv.toString('hex')})),
    trainingRuneLimit:TRAIN,groupLengths:groups.map(g=>g.length),
    selection:{name:best.name,iv:best.iv.toString('hex'),...best.selected},
    lockedHeldout:heldout,
    planted:synthetic,
    null:{replicates:NULLS,candidatesPerReplicate:variants.length,
      meanTrain:controls.reduce((n,v)=>n+v.training,0)/NULLS,
      meanHeldout:controls.reduce((n,v)=>n+v.heldout,0)/NULLS,
      bestHeldout:Math.max(...controls.map(v=>v.heldout)),
      selectedTrainingP:(1+controls.filter(v=>v.training>=best.selected.optimum).length)/(NULLS+1),
      lockedHeldoutP:(1+controls.filter(v=>v.heldout>=heldout.weightedIoc).length)/(NULLS+1)
    }};
  console.log(JSON.stringify(report,null,2));
}
if(require.main===module)main();
module.exports={sourceIVs,choose,holdout,planted};
