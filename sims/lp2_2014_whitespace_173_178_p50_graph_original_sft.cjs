'use strict';

/**
 * First-party 2014 whitespace -> original p50 table navigation candidate.
 *
 * The original archived May 2014 signed handoff has ten trailing whitespace
 * counts summing to173. A single 5-space leading indentation on the onion
 * address raises the complete decoration sum to178.
 *
 * Independently, the known p57 three clause GP-prime sums have prime ranks
 * [205,173,201]; 173 selects an 8-descendant component of original p50.
 * Starting the 58-descendant component rooted205 from address178 reaches
 * its unique maximum-depth leaf, with an exact physical-page node mapping
 * under the previously fixed largest-subtree-first inorder.
 *
 * This is a navigation/key-source test. It does not decrypt unknown runes.
 * Windows Node.js 22:
 *   node sims/lp2_2014_whitespace_173_178_p50_graph_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const handoff=read('resources/cicada2014-may2-signed-message.asc');
const trans=read('resources/liber-primus/lp2-transcription.txt');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const allLines=handoff.split(/\r?\n/);
const begin=allLines.indexOf('-----BEGIN PGP SIGNED MESSAGE-----');
const end=allLines.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.ok(begin>=0&&end>begin);
const plaintext=allLines.slice(begin+3,end);
assert.equal(plaintext.length,12);
assert.ok(plaintext[2].includes('ky2khlqdf7qdznac.onion'));
assert.ok(plaintext[9].trim()==='3301');
/** @param {string} s @returns {number} */
const leading=s=>(s.match(/^ */)||[''])[0].length;
/** @param {string} s @returns {number} */
const trailing=s=>(s.match(/ *$/)||[''])[0].length;
// A blank all-space line is a SINGLE whitespace group.
const tailCounts=plaintext.map(trailing).filter(x=>x>0);
assert.deepEqual(tailCounts,[2,3,7,11,13,17,23,29,31,37]);
const leadingOnion=leading(plaintext[2]);
assert.equal(leadingOnion,5);
const trailSum=tailCounts.reduce((s,x)=>s+x,0);
const fullSum=trailSum+leadingOnion;
assert.equal(trailSum,173);
assert.equal(fullSum,178);
assert.deepEqual([leadingOnion,...tailCounts].sort((a,b)=>a-b),
  [2,3,5,7,11,13,17,23,29,31,37]);

const p57=trans.split('%').at(-1).split('§')[0];
const clauses=p57.split('.').filter(s=>[...s].some(r=>corpus.runes.includes(r)));
assert.equal(clauses.length,4);
const clauseSums=clauses.slice(1).map(text=>[...text]
  .filter(r=>corpus.runes.includes(r))
  .reduce((s,r)=>s+corpus.prime[corpus.runes.indexOf(r)],0));
assert.deepEqual(clauseSums,[1259,1031,1229]);
/** @param {number} n @returns {number} */
function primeRank(n){
  let count=0;
  for(let v=2;v<=n;v++){
    let prime=true;
    for(let j=2;j*j<=v;j++)if(v%j===0){prime=false;break;}
    if(prime)count++;
  }
  return count;
}
const clauseRanks=clauseSums.map(primeRank);
assert.deepEqual(clauseRanks,[205,173,201]);
assert.ok(clauseRanks.includes(trailSum));

const next=grid.bytes;
assert.equal(next.length,256);
const children=Array.from({length:256},()=>[]);
next.forEach((destination,source)=>children[destination].push(source));
/** @param {number} rootNode @returns {number[]} */
function descendants(rootNode){
  const nodes=new Set(),queue=[rootNode];
  while(queue.length){
    const node=queue.pop();
    if(nodes.has(node))continue;
    nodes.add(node);queue.push(...children[node]);
  }
  return [...nodes];
}
/** @param {number} rootNode @returns {number[]} */
function inorder(rootNode){
  const cc=children[rootNode].toSorted((a,b)=>
    descendants(b).length-descendants(a).length||a-b);
  return cc.length?[
    ...inorder(cc[0]),rootNode,...cc.slice(1).flatMap(inorder)
  ]:[rootNode];
}
assert.deepEqual([173,201,74,205].map(n=>descendants(n).length),
  [8,56,57,58]);
assert.deepEqual([next[201],next[74],next[205]],[74,205,76]);
assert.deepEqual(children[201],[82,128]);
assert.deepEqual(children[201].map(n=>descendants(n).length),[50,5]);
const root205nodes=descendants(205);
const d=new Map([[205,0]]),queue=[205];
while(queue.length){
  const n=queue.shift();
  for(const child of children[n]){
    assert.ok(!d.has(child));
    d.set(child,d.get(n)+1);
    queue.push(child);
  }
}
assert.equal(d.size,58);
const maximum=Math.max(...d.values());
const deepest=[...d].filter(([n,depth])=>depth===maximum);
assert.equal(maximum,17);
assert.deepEqual(deepest,[[178,17]]);
assert.equal(d.get(fullSum),maximum);

/** @param {number} start @param {number} target @returns {number[]} */
function pathTo(start,target){
  const seen=new Set(),nodes=[];
  let n=start;
  while(!seen.has(n)){
    nodes.push(n);
    if(n===target)return nodes;
    seen.add(n);n=next[n];
  }
  throw new Error('Path does not reach intended source tree root');
}
const exactRoute=pathTo(fullSum,205);
assert.deepEqual(exactRoute,
  [178,166,250,172,148,246,198,105,63,51,59,69,73,79,82,201,74,205]);
// The one omitted member of GP's first twelve prime labels is W=19.
// Restoring it produces197. The solved PARABLE has exactly20 printed
// words. Starting at178 and following *exactly twenty* original table
// arrows lands on197, the entry to an 11-cycle. The signed handoff itself
// has eleven positive prime padding groups.
const first12=corpus.prime.slice(0,12);
assert.deepEqual(first12,[2,3,5,7,11,13,17,19,23,29,31,37]);
assert.equal(corpus.translit[corpus.prime.indexOf(19)],'W');
const fullFirst12=first12.reduce((sum,p)=>sum+p,0);
assert.equal(fullFirst12,197);
assert.equal(fullFirst12-fullSum,19);
const parableWords=(p57.match(/[\u16A0-\u16FF]+/gu)||[]);
assert.equal(parableWords.length,20);
let pos=fullSum;
const twentyHops=[pos];
for(let i=0;i<parableWords.length;i++){
  pos=next[pos];twentyHops.push(pos);
}
assert.equal(pos,fullFirst12);
assert.deepEqual(twentyHops.slice(0,exactRoute.length),exactRoute);
assert.deepEqual(twentyHops.slice(exactRoute.length),[76,114,197]);
const cycle=[pos];
let cyc=next[pos];
while(cyc!==pos){
  assert.ok(cycle.length<=11);
  cycle.push(cyc);cyc=next[cyc];
}
assert.equal(cycle.length,tailCounts.length+1);
assert.deepEqual(cycle,[197,115,247,192,0,203,68,199,47,76,114]);

const mapped=inorder(205);
assert.equal(mapped.length,58);
assert.equal(new Set(mapped).size,58);
assert.deepEqual([mapped[0],mapped[32],mapped[50],mapped[56],mapped[57]],
  [178,73,201,74,205]);
for(const selected of [73,201,74,205])assert.ok(exactRoute.includes(selected));
assert.ok(!root205nodes.includes(173));
// Note the separate rank173 component is distinct, not a hidden branch of
// the root205 tree.
console.log(JSON.stringify({
  source:'May 2014 archived signed-message original body, source p57, original p50 bytes',
  handoff:{
    lineCount:plaintext.length,
    trailingWhitespace:tailCounts,
    leadingIndentation:leadingOnion,
    trailingSum:trailSum,
    totalPaddingSum:fullSum
  },
  sourceP57:{
    clausePrimeSums:clauseSums,
    primeRanks:clauseRanks,
    rank173ReverseComponentSize:descendants(trailSum).length
  },
  conditionalP50Graph:{
    root:205,totalReverseDescendants:root205nodes.length,
    root201Size:descendants(201).length,
    root201Children:children[201],
    root201ChildSizes:children[201].map(n=>descendants(n).length),
    uniqueDeepestAddress:deepest[0][0],maxDepth:maximum,
    pathFromAllWhitespacePrimeSum:exactRoute,
    provisionalPhysicalPageMap:{
      p0:mapped[0],p32:mapped[32],p50:mapped[50],
      p56:mapped[56],p57:mapped[57]
    },
    root205OutgoingNextAddress:next[205],
    gpFirst12PrimeSum:fullFirst12,
    omittedGPPrime:{prime19Rune:'W',value:19},
    solvedP57WordCount:parableWords.length,
    completeTwentyHopWalk:twentyHops,
    finalCycle:cycle,
    finalCycleLength:cycle.length
  },
  decision:'Archival 2014 whitespace provides distinct original parameters 173 and178, both landing on structurally distinctive original p50 addresses under conditional base60 pointer reading. No author-authenticated sum instruction, page traversal or encrypted plaintext has been obtained.'
},null,2));
