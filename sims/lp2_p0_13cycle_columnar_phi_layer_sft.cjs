'use strict';

/**
 * Director #2095, exact p0 13-column graph-ranked transposition + authentic
 * p56 F-transparent consecutive-prime-totient layer. Node.js22, CommonJS.
 * All parameters are frozen from source before reading original p0.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources/liber-primus',f),'utf8'));
const corpus=read('lp2-corpus.json');
const grid=read('lp2-grid-256.json').pages.flatMap(page=>page.bytes);
assert.equal(grid.length,256);
const original=corpus.pages[0].indices;
assert.equal(original.length,262);
assert.equal(corpus.pages[50].indices.length,0);
const mod=v=>((v%29)+29)%29;
const columns=13,rows=21,extra=2;
assert.equal(columns*(rows-1)+extra,original.length);

const loop11=[115,247,192,0,203,68,199,47,76,114,197];
const loop2=[158,249],nodes=[...loop11,...loop2];
const order=[3,7,5,8,9,0,11,2,10,6,4,1,12];
assert.equal(nodes.length,13);
assert.deepEqual(nodes.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v)
  .map(x=>x.i),order);
for(const cycle of [loop11,loop2])
  cycle.forEach((v,i)=>assert.equal(grid[v],cycle[(i+1)%cycle.length]));
const prefix51=corpus.pages[51].indices.slice(0,3)
  .map(v=>corpus.translit[v]).join('');
assert.equal(prefix51,'WWP');
assert.equal(corpus.pages[51].indices.slice(0,3)
  .reduce((sum,v)=>sum+corpus.prime[v],0),81);
let j=81;
for(let i=0;i<20;i++)j=grid[j];
assert.equal(j,115);

/** @param {number[]} plain @returns {number[]} */
function columnEncrypt(plain){
  const out=[];
  for(const column of order)
    for(let row=0;row<rows;row++)
      if(row*columns+column<plain.length)
        out.push(plain[row*columns+column]);
  assert.equal(out.length,plain.length);
  return out;
}
/** @param {number[]} cipher @returns {number[]} */
function columnDecrypt(cipher){
  const clear=Array(cipher.length),length=cipher.length;
  let next=0;
  for(const column of order)
    for(let row=0;row<rows;row++)
      if(row*columns+column<length)
        clear[row*columns+column]=cipher[next++];
  assert.equal(next,length);
  return clear;
}
assert.deepEqual(columnDecrypt(columnEncrypt(original)),original);

const primes=[];
for(let n=2;primes.length<700;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)
    if(n%d===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
/**
 * Original historical encryption used in solved p56:
 * F plaintext literal copies F ciphertext and leaves prime clock static.
 * @param {number[]} plain
 * @returns {{cipher:number[],primeConsumed:number}}
 */
function phiEncrypt(plain){
  let k=0;
  const cipher=plain.map(v=>v===0?0:mod(v+primes[k++]-1));
  return {cipher,primeConsumed:k};
}
/**
 * Exact all-F-bypass inverse, retaining a representative prefix for
 * every algebraically reachable prime-clock state. Merging same states
 * cannot make an impossible full page possible.
 * @param {number[]} cipher
 */
function phiInverse(cipher){
  let states=new Map([[0,[]]]),highestStates=1,zerosRead=0;
  for(let i=0;i<cipher.length;i++){
    const value=cipher[i],next=new Map();
    for(const [k,plain] of states){
      const decoded=mod(value-(primes[k]-1));
      if(decoded!==0)next.set(k+1,[...plain,decoded]);
      if(value===0)next.set(k,[...plain,0]);
    }
    if(value===0)zerosRead++;
    if(next.size===0)return{
      valid:false,firstImpossiblePosition:i,
      possibleBeforeFailure:states.size,
      lastKeyStates:[...states.keys()],
      lastPrefix:[...states.values()][0],
      maximumStates:highestStates,zerosRead
    };
    states=next;
    highestStates=Math.max(highestStates,states.size);
  }
  return {valid:true,firstImpossiblePosition:null,
    possibleBeforeFailure:states.size,lastKeyStates:[...states.keys()],
    lastPrefix:[...states.values()][0],
    maximumStates:highestStates,zerosRead};
}
/** @param {number[]} sequence */
function ioc(sequence){
  if(sequence.length<2)return 0;
  const counts=Array(29).fill(0);
  for(const x of sequence)counts[x]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/
    (sequence.length*(sequence.length-1));
}
/** @param {string} source */
function native(source){
  const tokens=corpus.translit.map((value,index)=>({value,index}))
    .sort((a,b)=>b.value.length-a.value.length);
  const out=[];
  for(const word of source.split(' '))
    for(let i=0;i<word.length;){
      const t=tokens.find(x=>word.startsWith(x.value,i));
      assert(t,'invalid GP plaintext spelling');
      out.push(t.index);i+=t.value.length;
    }
  return out;
}
const p56=native('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
 'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(p56.length,85);
assert.deepEqual(phiEncrypt(p56).cipher,corpus.pages[56].indices);
assert.equal(phiEncrypt(p56).primeConsumed,84);
assert(phiInverse(corpus.pages[56].indices).valid);

// A planted native-GP original-text 262-rune page with the original
// 2014 punctuation-independent GP symbol material; no custom word fitting.
const clear57=corpus.pages[57].indices;
assert.equal(clear57.length,95);
const plantedPlain=Array.from({length:262},(_,i)=>clear57[i%95]);
const plantA=columnEncrypt(phiEncrypt(plantedPlain).cipher);
const plantB=phiEncrypt(columnEncrypt(plantedPlain)).cipher;
assert.deepEqual(columnDecrypt(plantA),phiEncrypt(plantedPlain).cipher);
assert.deepEqual(columnDecrypt(columnEncrypt(plantedPlain)),plantedPlain);
assert(phiInverse(columnDecrypt(plantA)).valid);
assert(phiInverse(plantB).valid);
// Verify authentic forward re-encryption rather than relying on an arbitrary
// terminal DP prefix in ambiguous ciphertext-F branching.
assert.deepEqual(columnEncrypt(phiEncrypt(plantedPlain).cipher),plantA);
assert.deepEqual(phiEncrypt(columnEncrypt(plantedPlain)).cipher,plantB);

const caseAIntermediate=columnDecrypt(original);
const caseA=phiInverse(caseAIntermediate);
const caseB=phiInverse(original);
assert.equal(caseA.firstImpossiblePosition,86);
assert.equal(caseB.firstImpossiblePosition,235);
assert.equal(caseA.valid,false);
assert.equal(caseB.valid,false);
const result={
  source:'original p0 (262 GP runes), p51 WWP, 2016 signed coda, p50 graph, solved p56',
  sourceLoop11:loop11,sourceLoop2:loop2,columnOrder:order,
  p0Shape:{runes:262,redHeading:13,columns,rows,finalRowCells:extra},
  knownP56:{runes:85,primeConsumed:84,authenticForwardMatch:true},
  plant:{runes:262,bothLayerOrdersLegal:true,bothForwardExact:true},
  original:{
    transposeThenPhi:{
      valid:caseA.valid,firstImpossiblePosition:caseA.firstImpossiblePosition,
      maxFbranchStates:caseA.maximumStates,legalPrefix:caseA.lastPrefix.length,
      prefixIoc:ioc(caseA.lastPrefix),
      prefixGP:caseA.lastPrefix.map(v=>corpus.translit[v]).join(' '),
      fullTransposedCipherGP:caseAIntermediate.map(v=>corpus.translit[v]).join(' ')
    },
    phiThenTranspose:{
      valid:caseB.valid,firstImpossiblePosition:caseB.firstImpossiblePosition,
      maxFbranchStates:caseB.maximumStates,legalPrefix:caseB.lastPrefix.length,
      prefixIoc:ioc(caseB.lastPrefix),
      prefixGP:caseB.lastPrefix.map(v=>corpus.translit[v]).join(' ')
    }
  },
  unknownPlaintextRecovered:false
};
console.log(JSON.stringify(result,null,2));
console.log('PASS: exact original two-layer exclusion, authentic p56 and native-GP plants');
