// Run from repository root: node sims/lp2_p28_dh_fragment_interior_keyword_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const page = n => corpus.pages.find(x => x.page === n).indices;
const line = page(28).slice(117,140);
assert.deepEqual(line,[23,8,9,13,24,12,4,8,9,21,28,0,9,0,3,19,15,9,28,24,10,1,20]);
let offset = 0;
const fragments = [2,3,9,4,5].map(n => {
  const fragment = line.slice(offset,offset+n);
  offset += n;
  return fragment;
});
const key = fragments.flatMap(f => f.slice(1,-1));
assert.deepEqual(key,[13,4,8,9,21,28,0,9,19,15,24,10,1]);
/** @param {number[]} cipher */
function inverseCounts(cipher) {
  let states = new Map([[0,1n]]);
  for (let i=0;i<cipher.length;i++) {
    const c = cipher[i], next = new Map();
    const add = (phase,count) => next.set(phase,(next.get(phase)||0n)+count);
    for (const [phase,count] of states) {
      if (c===0) add(phase,count);
      if ((c-key[phase]+29)%29!==0) add((phase+1)%key.length,count);
    }
    if (!next.size) return {length:cipher.length,firstImpossible:i,cipher:c,states:[...states].map(([j,n])=>[j,String(n)])};
    states = next;
  }
  return {length:cipher.length,paths:String([...states.values()].reduce((a,b)=>a+b,0n)),phases:[...states.keys()]};
}
const primary=inverseCounts([...page(28).slice(140),...page(29)]);
const exploratory=inverseCounts(page(0));
assert.deepEqual(primary,{length:406,firstImpossible:88,cipher:19,states:[[8,'4']]});
assert.deepEqual(exploratory,{length:262,firstImpossible:37,cipher:10,states:[[11,'1']]});
let phase=0;
const plain=page(57);
const planted=plain.map(p=>{
  if (p===0) return 0;
  const c=(p+key[phase])%29;
  phase=(phase+1)%key.length;
  return c;
});
const control=inverseCounts(planted);
assert.equal(plain.length,95);
assert.equal(phase,1);
assert.equal(control.paths,'30');
assert(control.phases.includes(phase));
console.log(JSON.stringify({key,primary,exploratory,control},null,2));
