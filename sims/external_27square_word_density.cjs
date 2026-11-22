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
/** The external proposal's 8 November 2026 block 38 claims these outgoing
 * conditions for the unseen block 39. Enumerate their explicit geometric
 * and source-signature consequences, without selecting an English word.
 * This is deliberately a partial condition set, before further GCD filters.
 * @param {number[]} grid
 */
function nextFromBlock38(grid){
  const source=[];
  for(let row=2;row<=26;row+=2)for(let col=2;col<=26;col+=2)
  for(let radius=2;radius<=12;radius+=2){
    if(col-radius<1||col+radius>27)break;
    const a=at(grid,row-1,col-radius-1);
    const middle=at(grid,row-1,col-1);
    const b=at(grid,row-1,col+radius-1);
    if(!a||!middle||!b||a===b)continue;
    for(const order of [[a,b],[b,a]])
    for(const transform of [false,true]){
      const key=[order[0],transform?PHI[middle]:middle,order[1]];
      if(MU[key[0]]!==0||MU[key[1]]!==1||MU[key[2]]!==0)continue;
      source.push({key:[key[1],key[2],key[0]],center:[row,col]});
    }
  }
  const starts=[];
  for(let row=1;row<=27;row+=2)for(let col=2;col<=26;col+=2){
    const dy=Math.abs(row-8),dx=Math.abs(col-17);
    if(dy===0||dy!==dx)continue;
    for(const direction of [-1,1])for(let length=3;length<=27;length+=2){
      if(row+(length-1)*direction<1||
         row+(length-1)*direction>27||col+length-1>27)break;
      starts.push([row,col,direction,length]);
    }
  }
  const n0=(row,col)=>27*(row-1)+col;
  const n1=(row,col)=>27*(col-1)+28-row;
  const n2=(row,col)=>730-n0(row,col);
  const n3=(row,col)=>730-n1(row,col);
  const prefixes=new Set(),gcdPrefixes=new Set();
  let startsWithTHE=0,gcdSurvivors=0,gcdTHE=0;
  const gcdFailures=[0,0,0,0];
  for(const [row,col,dir,length] of starts)for(const {key,center} of source){
    const plain=Array.from({length:3},(_,i)=>
      mod(at(grid,row-1+i*dir,col-1+i)-key[i]));
    const packed=plain[0]*841+plain[1]*29+plain[2];
    prefixes.add(packed);
    if(plain[0]===2&&plain[1]===18)startsWithTHE++;
    const [sr,sc]=center,er=row+(length-1)*dir,ec=col+length-1;
    // Published Report 10: four exact squarefree-gcd conditions on
    // original source center M and next ciphertext B, L, E. Here L=B
    // by the claimed outgoing leftmost-at-beginning forecast, so
    // G1 and G2 are intentionally the same mathematical predicate.
    const conditions=[
      gcd(n0(sr,sc),n0(row,col)),
      gcd(n0(sr,sc),n0(row,col)),
      gcd(n1(sr,sc),n3(er,ec)),
      gcd(n0(sr,sc),n2(er,ec))
    ].map(t=>mu(t)!==0);
    conditions.forEach((ok,i)=>{if(!ok)gcdFailures[i]++;});
    if(conditions.some(ok=>!ok))continue;
    gcdSurvivors++;gcdPrefixes.add(packed);
    if(plain[0]===2&&plain[1]===18)gcdTHE++;
  }
  const result={outgoing:'block38 I ASK, reported S=32',
    explicitConstraints:'horizontal original node, even row/column center and radius, nonmirror, signature (0,+1,0); diagonal ciphertext, start on exact previous-L ray, leftmost beginning, start row odd, col even, end row odd',
    sourceAssignments:source.length,startLengthAssignments:starts.length,
    totalPairs:source.length*starts.length,distinctThreeRuneBeginnings:prefixes.size,
    pairsBeginningWithTH_E:startsWithTHE,
    report10:{originalPairCount:source.length*starts.length,
      fourGcdFailureCounts:gcdFailures,passingPairs:gcdSurvivors,
      distinctThreeRuneBeginnings:gcdPrefixes.size,
      pairsBeginningWithTH_E:gcdTHE,
      note:'G1 and G2 are duplicate predicates when leftmost cell is the beginning'} };
  assert.equal(result.sourceAssignments,172);
  assert.equal(result.startLengthAssignments,166);
  assert.equal(result.totalPairs,28552);
  assert.equal(result.distinctThreeRuneBeginnings,4938);
  assert.equal(result.pairsBeginningWithTH_E,33);
  assert.deepEqual(result.report10.fourGcdFailureCounts,[360,360,350,298]);
  assert.equal(result.report10.passingPairs,27580);
  assert.equal(result.report10.distinctThreeRuneBeginnings,4867);
  return result;
}

function main(){
  const target={
    WEATHER:[7,28,2,18,4],
    COLD:[5,3,20,23],
    DEATH:[23,18,24,2]
  };
  // The external opening AS I GO THE uses a row-wrapped ciphertext block.
  // This exact published arithmetic is reproduced separately from the
  // exhaustive straight-line candidate multiplicity and null experiment.
  const openingNode=[at(GRID,12,10),at(GRID,12,11),at(GRID,12,12)];
  assert.deepEqual(openingNode,[25,11,28]);
  assert.equal(PHI[openingNode[1]],10);
  const openingKey=[25,10,28];
  assert.equal(mod(openingKey.reduce((s,k)=>s+MU[k],0))%3,0);
  const openingCipher=Array.from({length:7},(_,i)=>GRID[12*27+24+i]);
  assert.deepEqual(openingCipher,[20,25,9,2,13,1,14]);
  assert.deepEqual(openingCipher.map((v,i)=>mod(v-openingKey[i%3])),
    [24,15,10,6,3,2,18]);

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
    openingExample:{sourceNode:openingNode,alignedKey:openingKey,
      ciphertext:openingCipher,plaintext:[24,15,10,6,3,2,18 ]},
    fixedExample:{sourceNode:keyNode,alignedKey:[14,14,10],
      ciphertext:[21,13,12,3,18],plaintext:target.WEATHER,
      literalThreeRuneEcho:true},
    randomSeed:'0x'+SEED.toString(16),shuffles:REPLICATES,
    comparison,
    possibleBlock39:nextFromBlock38(GRID),
    caveat:'Targets are externally postselected. This is a family-size and nonuniqueness test, not a full test of all later geometric transition filters or the literal authorial key.'
  },null,2));
}
if(require.main===module)main();
module.exports={sourceKeys,findWord,shuffle,nextFromBlock38,main};
