'use strict';

/**
 * LP2 p57 PARABLE -> p50 56-node tree -> p15 16 Fibonacci-prime depths
 * -> historical p56 plaintext-F transparent phi(prime) inverse.
 *
 * This SFT does NOT assume any order/bijection of rune pages within the
 * 50-node and five-node physical-side groups. Exact maximum matching
 * grants all 50! * 5! page-node assignments (implicitly).
 * Synthetic native GP29 controls establish sensitivity.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {readSquare,uniqueFibonacciPrimeRanks,clockwiseSpiral}=
  require('./fibonacci_prime_spiral.cjs');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const book=read('resources/liber-primus/lp2-corpus.json');
const original=read('resources/liber-primus/base60-grid.json');
const bytes=original.byte_rows.flat(),tokens=original.rows.flat();
assert.equal(bytes.length,256);
assert.equal(tokens.length,256);
const children=Array.from({length:256},()=>[]);
for(let address=0;address<256;address++)
  children[bytes[address]].push(address);

/** @param {number} start @returns {number[]} */
function descendants(start){
  const seen=new Set([start]),queue=[start];
  for(let i=0;i<queue.length;i++)
    for(const child of children[queue[i]])
      if(!seen.has(child)){seen.add(child);queue.push(child);}
  return queue;
}
const clause=book.pages[57].indices;
assert.equal(clause.length,95);
const sourceSums=[
  clause.slice(7,37),clause.slice(37,67),clause.slice(67,95)
].map(span=>span.reduce((sum,index)=>sum+book.prime[index],0));
assert.deepEqual(sourceSums,[1259,1031,1229]);

/** @param {number} count @returns {number[]} */
function primesUpToCount(count){
  const limit=120000;
  const composite=new Uint8Array(limit+1),primes=[];
  for(let n=2;n<=limit&&primes.length<count;n++){
    if(composite[n])continue;
    primes.push(n);
    if(n*n<=limit)for(let m=n*n;m<=limit;m+=n)composite[m]=1;
  }
  assert.equal(primes.length,count);
  return primes;
}
const prime=primesUpToCount(8500);
assert.deepEqual(sourceSums.map(n=>prime.indexOf(n)+1),[205,173,201]);
assert.deepEqual([bytes[201],bytes[74],bytes[205]],[74,205,76]);
assert.equal(descendants(201).length,56);
const left=descendants(82),right=descendants(128);
assert.equal(left.length,50);
assert.equal(right.length,5);
assert.deepEqual(children[201],[82,128]);
assert.equal(new Set([...left,...right,201]).size,56);

const depth=new Array(256).fill(-1),queue=[201];
depth[201]=0;
for(let i=0;i<queue.length;i++)
  for(const child of children[queue[i]]){
    assert.equal(depth[child],-1);
    depth[child]=depth[queue[i]]+1;
    queue.push(child);
  }
assert.equal(queue.length,56);
assert.equal(Math.max(...queue.map(node=>depth[node])),15);

const p15Ranks=uniqueFibonacciPrimeRanks();
const p15Primes=p15Ranks.map(rank=>prime[rank-1]);
const sourceSpiral=clockwiseSpiral().map(([r,c])=>readSquare()[r][c]);
assert.deepEqual(sourceSpiral,
  p15Primes.map(primeValue=>Math.abs(3301-primeValue)));
assert.deepEqual(p15Ranks,
  [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
const mod=n=>((n%29)+29)%29;

/** Source-authentic solved p56 85/85 control. */
const p56Words='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT '+
  'HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet=book.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
const p56=[];
for(const word of p56Words.split(' '))
  for(let i=0;i<word.length;){
    const atom=alphabet.find(x=>word.startsWith(x.name,i));
    assert(atom);
    p56.push(atom.index);
    i+=atom.name.length;
  }
assert.equal(p56.length,85);
const p56Cipher=book.pages[56].indices;
assert.equal(p56Cipher.length,85);
let stage=0,literalF=[];
for(let i=0;i<p56.length;i++){
  if(p56[i]===0){literalF.push(i);assert.equal(p56Cipher[i],0);}
  else assert.equal(p56Cipher[i],mod(p56[i]+prime[stage++]-1));
}
assert.equal(stage,84);
assert.deepEqual(literalF,[56]);

/**
 * All exact plaintext-F bypass paths.
 * Ciphertext F may be literal plaintext F or encrypted non-F.
 * @param {number[]} cipher @param {number} primeStart one-based
 * @returns {boolean}
 */
function admissible(cipher,primeStart){
  let states=new Set([primeStart-1]);
  for(const symbol of cipher){
    const next=new Set();
    for(const keyIndex of states){
      const plain=mod(symbol-(prime[keyIndex]-1));
      if(plain!==0)next.add(keyIndex+1);
      if(symbol===0)next.add(keyIndex);
    }
    if(next.size===0)return false;
    states=next;
  }
  return true;
}

/**
 * Full-length independent actual GP29 language plant.
 * @param {number[]} native @param {number} primeStart
 * @returns {number[]}
 */
function encode(native,primeStart){
  let keyIndex=primeStart-1;
  return native.map(glyph=>glyph===0?0:mod(glyph+prime[keyIndex++]-1));
}

const pages=book.pages.filter(p=>p.page<=55&&p.page!==50);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
assert.equal(book.pages[50].indices.length,0);
const sourceNodes={left:left.toSorted((a,b)=>a-b),
  right:right.toSorted((a,b)=>a-b)};

/**
 * Find a maximum number of distinct page->node matches.
 * @param {Array<{page:number,allowed:number[]}>} graph
 * @returns {number}
 */
function maxMatching(graph){
  const occupied=new Map();
  /** @param {number} index @param {Set<number>} seen */
  function augment(index,seen){
    for(const node of graph[index].allowed){
      if(seen.has(node))continue;
      seen.add(node);
      const old=occupied.get(node);
      if(old===undefined||augment(old,seen)){
        occupied.set(node,index);
        return true;
      }
    }
    return false;
  }
  let matched=0;
  for(let i=0;i<graph.length;i++)
    if(augment(i,new Set()))matched++;
  return matched;
}

/**
 * Build the all-secret assignment compatibility graph. With a fixed
 * node->depth->prime initial clock, the legality of that page is
 * independent of which other page gets which node.
 * @param {number[][]} ciphertextPages @param {number[]} starts
 */
function compatible(ciphertextPages,starts){
  return ciphertextPages.map((cipher,index)=>{
    const page=pages[index].page,side=page<50?'left':'right';
    const nodeSet=sourceNodes[side];
    const depthAllowed=new Map();
    const allowed=nodeSet.filter(node=>{
      const d=depth[node];
      if(!depthAllowed.has(d))
        depthAllowed.set(d,admissible(cipher,starts[d]));
      return depthAllowed.get(d);
    });
    return {page,allowed};
  });
}

const outcomes={};
for(const [label,starts] of Object.entries({
  fibonacciPrimeOrdinals:p15Ranks,
  fibonacciPrimeValues:p15Primes
})){
  const actual=compatible(pages.map(page=>page.indices),starts);
  const allowed=actual.filter(x=>x.allowed.length>0);
  const impossible=actual.filter(x=>x.allowed.length===0).map(x=>x.page);
  assert.equal(actual.length,55);
  assert.equal(allowed.length,label==='fibonacciPrimeOrdinals'?10:18);
  assert.equal(impossible.length,label==='fibonacciPrimeOrdinals'?45:37);
  assert.equal(maxMatching(actual),allowed.length);

  // Explicit positive controls, arbitrary but legal hidden node assignments.
  const clean=pages.map((page,i)=>{
    const nodeSet=sourceNodes[page.page<50?'left':'right'];
    const localIndex=page.page<50?page.page:page.page-51;
    const assigned=nodeSet[localIndex];
    assert.notEqual(assigned,undefined);
    const message=Array.from({length:page.indices.length},
      (_,j)=>clause[j%clause.length]);
    return encode(message,starts[depth[assigned]]);
  });
  const positive=compatible(clean,starts);
  assert(positive.every((x,i)=>x.allowed.length>0));
  assert.equal(maxMatching(positive),55);
  outcomes[label]={
    originalAllowedPages:allowed.length,
    originalImpossiblePages:impossible.length,
    originalMaxDistinctPageNodeMatching:maxMatching(actual),
    sampleImpossiblePages:impossible.slice(0,15),
    validOriginalPageIds:allowed.map(x=>x.page),
    nativeGpPositivePages:55,
    nativeGpPositiveMatching:55
  };
}
assert.deepEqual(Object.keys(outcomes),
  ['fibonacciPrimeOrdinals','fibonacciPrimeValues']);
console.log(JSON.stringify({
  originalSource:'p15 Fibonacci prime spiral, p57 PARABLE, p50 base60 graph',
  originalGraph:{root:201,sideSizes:[50,5],depthLevels:16},
  model:'one known prime starting ordinal per source depth, page permutations unrestricted',
  authenticP56KnownAnswer:'85/85 with one literal F',
  results:outcomes,unknownPlaintextRecovered:false
},null,2));
console.log('PASS: original all-permutation exclusions and native GP29 plants');
