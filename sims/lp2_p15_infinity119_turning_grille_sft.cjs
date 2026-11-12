"use strict";
/**
 * Agent26: p15 original 4×4 Fibonacci spiral + illustrated infinity,
 * exact p15..22 1903-rune chapter, frozen turning-grille extract.
 * Run node sims/lp2_p15_infinity119_turning_grille_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const rows = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
/** @param {[number,number]} v @returns {[number,number]} */
function turn([r,c]) { return [c,3-r]; }
/** @param {[number,number]} v @returns {string} */
function key(v) { return v.join(","); }
function sourceHoles() {
  const selected = [];
  const visited = new Set();
  for (const n of spiral) {
    const flat = rows.flat().indexOf(n);
    assert.notEqual(flat,-1);
    const position = /** @type {[number,number]} */ ([Math.floor(flat/4),flat%4]);
    const orbit = [];
    let current = position;
    for (let i=0;i<4;i++) {orbit.push(current);current=turn(current);}
    if (orbit.every(p=>!visited.has(key(p)))) {
      selected.push({position,value:n});
      orbit.forEach(p=>visited.add(key(p)));
    }
  }
  assert.equal(visited.size,16);
  assert.deepEqual(selected.map(s=>s.value),[3299,3288,3278,3258]);
  assert.deepEqual(selected.map(s=>s.position[0]*4+s.position[1]),[5,8,4,0]);
  return selected.map(s=>s.position);
}
/** @param {[number,number][]} holes @param {number} rot @returns {number[]} */
function rotated(holes,rot) {
  return holes.map(v=>{
    for(let j=0;j<rot;j++)v=turn(v);
    return v[0]*4+v[1];
  });
}
/** @param {number[]} symbols @param {number[]} holes @returns {number[]} */
function extract(symbols,holes) {
  const out=[];
  for(let block=0;block<119;block++)for(const h of holes) {
    const index=16*block+h;
    if(index<symbols.length)out.push(symbols[index]);
  }
  return out;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const hist=new Uint16Array(29);
  symbols.forEach(n=>hist[n]++);
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
function main() {
  const chapter=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices);
  assert.equal(chapter.length,1903);
  const holes=sourceHoles();
  const rotations=Array.from({length:4},(_,r)=>{
    const offsets=rotated(holes,r);
    const tape=extract(chapter,offsets);
    return {turn:r,offsets,n:tape.length,ioc:ioc(tape),
      opening:tape.slice(0,24).map(i=>corpus.translit[i]).join(" ")};
  });
  assert.deepEqual(rotations.map(x=>x.n),[476,476,475,476]);
  const expected=[.03499336576735958,.0340734188412207,
    .03449256051521208,.034126492702344094];
  expected.forEach((x,i)=>assert.ok(Math.abs(rotations[i].ioc-x)<1e-12));
  const controls=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(controls.length,95);
  const planted=chapter.slice(), at=rotations[0].offsets;
  let consumed=0;
  for(let k=0;k<119;k++)for(const hole of at)
    planted[k*16+hole]=controls[(consumed++)%controls.length];
  assert.equal(consumed,476);
  const recovered=extract(planted,at);
  assert.deepEqual(recovered,
    Array.from({length:476},(_,k)=>controls[k%controls.length]));
  return {
    claim:"No original native-GP plaintext recovered by source-ordered four-hole reading",
    source:{physicalPages:"p15..p22",runes:1903,hypotheticalInfinityPad:1,
      frameSize:16,frames:119},
    selectedValues:[3299,3288,3278,3258],
    rotations,
    nativeSolvedP57IoC:ioc(controls),
    positivePlant:{runes:476,recovered:476,exact:true},
    limits:"Conditional greedy hole rule and hypothetical infinity pad; not an authenticated LP2 cipher"
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={sourceHoles,rotated,extract,ioc,main};
