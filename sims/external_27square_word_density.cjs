'use strict';
/**
 * Challenge the claimed 27x27, three-rune-node LP2 word decryption
 * with a complete *ciphertext-native* enumerator and page-preserving
 * no-language null.  This intentionally evaluates all allowed 3-rune keys
 * and all straight 3/4/5-rune spans, without hand-picking geometric nodes.
 *
 * External proposal: 2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-
 * Totient-Decryption (8 November 2026). Hypothesis only, no authentic
 * LP2 plaintext confirmed.
 *
 * SFT: node sims/external_27square_word_density.cjs
 *
 * @module external_27square_word_density
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const GRID=corpus.pages.slice(0,3).flatMap(p=>p.indices);
const SIDE=27,MOD=29,REPLICATES=250,SEED=0x20261029;
assert.equal(GRID.length,SIDE*SIDE);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
const mod=x=>(x%MOD+MOD)%MOD;
const directions=[[0,1],[0,-1],[1,0],[-1,0],
                  [1,1],[-1,-1],[1,-1],[-1,1]];
const sourceAxes=[[0,1],[1,0],[1,1],[1,-1]];
const at=(g,y,x)=>g[y*SIDE+x];
/** @param {number} n */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {number} n */
function phi(n){
  let count=0;for(let i=1;i<=n;i++)if(gcd(i,n)===1)count++;
  return count;
}
/** @param {number} n */
function mu(n){
  if(n===1)return 1;
  let sign=1;
  for(let p=2;p*p<=n;p++){
    if(n%p!==0)continue;
    n/=p;sign=-sign;
    if(n%p===0)return 0;
  }
  return n>1?-sign:sign;
}
const PHI=Array.from({length:29},(_,k)=>k===0?0:phi(k));
const MU=Array.from({length:29},(_,k)=>k===0?0:mu(PHI[k]));

/** Source geometry: every equally spaced 3-rune node at every valid radius.
 * Both reading directions and original / phi-transformed center are admitted.
 * Each output is a mod29 repeated three-key, with phase from the proposal.
 * @param {number[]} grid
 * @returns {{counts:Uint16Array,total:number,distinct:number}}
 */
function sourceKeys(grid){
  const counts=new Uint16Array(MOD**3);
  let total=0;
  for(let y=0;y<SIDE;y++)for(let x=0;x<SIDE;x++)
  for(const [dy,dx] of sourceAxes)
  for(let radius=1;radius<SIDE;radius++){
    const y0=y-radius*dy,x0=x-radius*dx;
    const y2=y+radius*dy,x2=x+radius*dx;
    if(y0<0||y0>=SIDE||x0<0||x0>=SIDE||
       y2<0||y2>=SIDE||x2<0||x2>=SIDE)break;
    const center=at(grid,y,x),left=at(grid,y0,x0),right=at(grid,y2,x2);
    if(!left||!center||!right)continue;
    for(const [a,b] of [[left,right],[right,left]])
    for(const transformed of [false,true]){
      const k=[a,transformed?PHI[center]:center,b];
      const phase=mod(MU[k[0]]+MU[k[1]]+MU[k[2]])%3;
      counts[k[phase]*841+k[(phase+1)%3]*29+k[(phase+2)%3]]++;
      total++;
    }
  }
  let distinct=0;for(const n of counts)if(n)distinct++;
  return {counts,total,distinct};
}
/** @param {number[]} grid @param {Uint16Array} sources @param {number[]} plain */
function findWord(grid,sources,plain){
  const length=plain.length;
  assert.ok(length>=3);
  const hits=[];
  let periodic=0,sourceMatched=0,nodeAssignments=0;
  for(let y=0;y<SIDE;y++)for(let x=0;x<SIDE;x++)
  for(const [dy,dx] of directions){
    const yEnd=y+(length-1)*dy,xEnd=x+(length-1)*dx;
    if(yEnd<0||yEnd>=SIDE||xEnd<0||xEnd>=SIDE)continue;
    const pad=plain.map((p,j)=>mod(at(grid,y+j*dy,x+j*dx)-p));
    if(pad.some((k,j)=>j>=3&&k!==pad[j%3]))continue;
    periodic++;
    const sourceCount=sources[pad[0]*841+pad[1]*29+pad[2]];
    if(!sourceCount)continue;
    sourceMatched++;nodeAssignments+=sourceCount;
    hits.push({row:y+1,column:x+1,dy,dx,
      key:pad.slice(0,3),sourceCount});
  }
  return {periodic,sourceMatched,nodeAssignments,hits};
}
/** @param {()=>number} next */
function shuffle(source,next){
  const array=source.slice();
  for(let i=array.length-1;i>0;i--){
    const j=next()%(i+1);
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}
function main(){
  const target={
    WEATHER:[7,28,2,18,4],
    COLD:[5,3,20,23],
    DEATH:[23,18,24,2]
  };
  // Reconstruct the external WEATHER example exactly, including the
  // geometric source key and its independently noted three-rune echo.
  const keyNode=[at(GRID,13,3),at(GRID,13,4),at(GRID,13,5)];
  assert.deepEqual(keyNode,[14,22,14]);
  assert.deepEqual([keyNode[0],PHI[keyNode[1]],keyNode[2]],[14,10,14]);
  assert.deepEqual(Array.from({length:5},(_,j)=>at(GRID,13,13+j)),
    [21,13,12,3,18]);
  assert.deepEqual(Array.from({length:3},(_,j)=>at(GRID,12,13+j)),
    target.WEATHER.slice(0,3));
  const originalSource=sourceKeys(GRID);
  const original=Object.fromEntries(Object.entries(target)
    .map(([word,plain])=>[word,findWord(GRID,originalSource.counts,plain)]));
  assert.equal(originalSource.total,52048);
  assert.equal(originalSource.distinct,17095);
  assert.deepEqual(Object.keys(target).map(w=>original[w].sourceMatched),[5,95,124]);
  assert.ok(original.WEATHER.hits.some(h=>h.row===14&&h.column===14&&
    h.dy===0&&h.dx===1&&h.sourceCount===8));

  // Plant a known source-key pair and exact 5-rune ciphertext as a
  // constructive witness for the actual cipher relation and enumeration.
  const planted=GRID.slice();
  [14,22,14].forEach((c,j)=>{planted[13*27+3+j]=c;});
  [21,13,12,3,18].forEach((c,j)=>{planted[13*27+13+j]=c;});
  assert.ok(findWord(planted,sourceKeys(planted).counts,target.WEATHER)
    .hits.some(h=>h.row===14&&h.column===14&&h.dy===0&&h.dx===1));

  let state=SEED;
  /** @returns {number} */
  function next(){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  }
  const nulls=Object.fromEntries(Object.keys(target).map(w=>[w,[]]));
  for(let rep=0;rep<REPLICATES;rep++){
    const shuffled=shuffle(GRID,next);
    const source=sourceKeys(shuffled);
    for(const [word,plain] of Object.entries(target)){
      const hit=findWord(shuffled,source.counts,plain);
      nulls[word].push(hit.sourceMatched);
    }
  }
  const comparison=Object.fromEntries(Object.keys(target).map(word=>{
    const results=nulls[word],real=original[word].sourceMatched;
    const exceed=results.filter(x=>x>=real).length;
    return [word,{
      actual:{periodic:original[word].periodic,
        matched:real,nodeAssignments:original[word].nodeAssignments},
      shuffledMean:results.reduce((s,v)=>s+v,0)/results.length,
      shuffledMin:Math.min(...results),shuffledMax:Math.max(...results),
      shuffledExceedances:exceed,
      upperTailAddOne:(exceed+1)/(results.length+1),
      locations:word==='WEATHER'?original[word].hits:undefined
    }];
  }));
  console.log(JSON.stringify({
    source:'Authentic LP2 0-2, 729 GP runes, 27x27 row-major',
    externalClaim:'2retooz270703, updated 2026-11-08',
    model:'3-collinear-rune node, any radius, 4 axes, 2 source orders, either phi center or direct, Mobius phase; straight cipher spans in 8 directions',
    keyAssignments:originalSource.total,
    distinctKeys:originalSource.distinct,
    fraction29Cubed:originalSource.distinct/MOD**3,
    fixedExample:{sourceNode:keyNode,alignedKey:[14,14,10],
      ciphertext:[21,13,12,3,18],plaintext:target.WEATHER,
      literalThreeRuneEcho:true},
    randomSeed:'0x'+SEED.toString(16),shuffles:REPLICATES,
    comparison,
    caveat:'Targets are externally postselected. This is a family-size and nonuniqueness test, not a full test of all later geometric transition filters or the literal authorial key.'
  },null,2));
}
if(require.main===module)main();
module.exports={sourceKeys,findWord,shuffle,main};
