'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const ink=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json','utf8'));
const grid=JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json','utf8'));
const mod=x=>((x%29)+29)%29;
const inv=x=>{
  assert.notEqual(mod(x),0);
  for(let y=1;y<29;y++)if(mod(x*y)===1)return y;
  throw new Error('no inverse');
};
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row=>row.length===8));

// The 2014 cell 6/7 values select zero-based columns 6/7 via mod 8.
const selected=grid.byte_rows.map(row=>[row[6],row[7]]);
const labels=selected.map(([x,y])=>{
  const xr=mod(x),yr=mod(y);
  assert.notEqual(xr,0,'selected first coordinate must be invertible');
  return mod(yr*inv(xr)); // projective direction [x:y] -> y/x in F29
});
const uniqueSlopes=new Set(labels).size;

// Reconstruct the 32 original red-rune fragments from 13-dot boundaries.
const events=[];
for(const page of ink.pages){
  const sourcePage=corpus.pages[page.page];
  for(const span of page.red_spans||[]){
    for(let i=0;i<span.length;i++){
      events.push({page:page.page,offset:span.start+i,kind:1,rune:sourcePage.indices[span.start+i]});
    }
  }
  for(const mark of page.large_punctuation||[]){
    if(mark[1]===13)events.push({page:page.page,offset:mark[0],kind:0});
  }
}
events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
const fragments=[];
let current=[];
for(const event of events){
  if(event.kind===0){fragments.push(current);current=[];}
  else current.push(event);
}
fragments.push(current);
const lengths=fragments.map(f=>f.length);
const expectedLengths=[13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0];
assert.equal(fragments.length,32);
assert.deepEqual(lengths,expectedLengths);

const contains=(fragment,label)=>fragment.some(e=>e.rune===label);
const observed=labels.reduce((n,label,i)=>n+(contains(fragments[i],label)?1:0),0);
const expected=labels.reduce((n,label)=>n+fragments.filter(f=>contains(f,label)).length/32,0);

// Deterministic 500k permutation null: hold row directions fixed and permute
// the 32 fragment records among the 32 row positions.
let rng=0x3301c0de;
function random(){
  rng^=rng<<13;
  rng^=rng>>>17;
  rng^=rng<<5;
  return (rng>>>0)/4294967296;
}
const reps=500000;
const permutation=Array.from({length:32},(_,i)=>i);
let tail=0,total=0;
for(let n=0;n<reps;n++){
  for(let i=31;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  let matches=0;
  for(let i=0;i<32;i++){
    if(contains(fragments[permutation[i]],labels[i]))matches++;
  }
  total+=matches;
  if(matches>=observed)tail++;
}
const mean=total/reps;
const tailProbability=tail/reps;
assert.equal(observed,4);
assert.equal(uniqueSlopes,23);
assert.equal(expected,6);
assert.ok(Math.abs(mean-6.00158)<0.001);
assert.ok(Math.abs(tailProbability-0.92223)<0.001);

console.log(JSON.stringify({
  selector:{cell6:366,cell7:199,selectedPrintedColumns:[7,8],zeroBasedColumns:[6,7]},
  interpretation:'row pair (column7,column8) as homogeneous coordinates; slope = column8 / column7 mod 29',
  selectedPairs:selected,
  slopeLabels:labels,
  uniqueSlopes,
  fragmentLengths:lengths,
  sameIndexLabelMatches:observed,
  exactPermutationExpectation:expected,
  permutationNull:{seed:'0x3301c0de',permutations:reps,mean,tailAtLeastObserved:tailProbability},
  decision:'The direct rowwise projective-slope-to-fragment-label interpretation is not selective; this does not test other uses of columns 7-8 as key or state material.'
},null,2));
