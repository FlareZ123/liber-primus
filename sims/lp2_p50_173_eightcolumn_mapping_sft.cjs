'use strict';

/**
 * Director #2098. Original p57 prime-ordinal root173 reverse graph and
 * its possible one-to-one mapping to the original eight printed p50 columns.
 * Read-only Node.js22 CommonJS. No invented 8! permutation search.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus',f),'utf8'));
const source=read('lp2-grid-256.json');
const book=read('lp2-corpus.json');
const bytes=source.pages.flatMap(page=>page.bytes);
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(source.pages.map(page=>page.rows),[10,13,9]);
const p57=book.pages[57].indices;
assert.equal(p57.length,95);
const originalSums=[
  p57.slice(7,37),p57.slice(37,67),p57.slice(67)
].map(segment=>segment.reduce((s,v)=>s+book.prime[v],0));
assert.deepEqual(originalSums,[1259,1031,1229]);
let primeRank=0;
for(let n=2;n<=1031;n++){
  let prime=true;
  for(let div=2;div*div<=n;div++)
    if(n%div===0){prime=false;break;}
  if(prime)primeRank++;
}
assert.equal(primeRank,173);
const children=Array.from({length:256},()=>[]);
for(let i=0;i<256;i++)children[bytes[i]].push(i);

/** @param {number} start */
function bfs(start){
  const q=[start],seen=new Set(q);
  for(let k=0;k<q.length;k++)
    for(const v of children[q[k]])
      if(!seen.has(v)){seen.add(v);q.push(v);}
  return q;
}
const breadth=bfs(primeRank);
assert.deepEqual(breadth,[173,26,84,147,239,41,93,215]);
assert.deepEqual(children[173],[26,84,147,239]);
assert.deepEqual(children[84],[41,93,215]);
const addresses=breadth.toSorted((a,b)=>a-b);
assert.deepEqual(addresses,[26,41,84,93,147,173,215,239]);
const sheet=breadth.map((address,index)=>({
  index,address,row:Math.floor(address/8),printedColumn:address%8,
  byte:bytes[address],byteLow8:bytes[address]%8,
  graphDepth:index===0?0:children[84].includes(address)?2:1,
  parent:bytes[address]
}));
/** @param {number[]} a */
function distinct(a){return new Set(a).size;}
assert.equal(distinct(sheet.map(s=>s.printedColumn)),6);
assert.equal(distinct(sheet.map(s=>s.byteLow8)),2);
assert.deepEqual([...new Set(sheet.map(s=>s.printedColumn))].sort((a,b)=>a-b),
  [1,2,3,4,5,7]);
const missingColumns=[0,6];
const sortedRank=new Map(addresses.map((v,index)=>[v,index]));
/** @param {number} node @param {'pre'|'post'} style */
function dfs(node,style){
  const branches=children[node].filter(v=>breadth.includes(v));
  const body=branches.flatMap(child=>dfs(child,style));
  return style==='pre'?[node,...body]:[...body,node];
}
const candidates={
  originalBreadthFirst:breadth,
  originalDepthFirstPre:dfs(173,'pre'),
  originalDepthFirstPost:dfs(173,'post'),
  printedAddressSort:addresses
};
const projected={};
for(const [name,order] of Object.entries(candidates)){
  assert.deepEqual(order.toSorted((a,b)=>a-b),addresses);
  const ranks=order.map(v=>sortedRank.get(v));
  assert.equal(distinct(ranks),8);
  projected[name]=ranks;
}
assert.notDeepEqual(projected.originalBreadthFirst,
  projected.originalDepthFirstPre);
assert.notDeepEqual(projected.originalDepthFirstPre,
  projected.originalDepthFirstPost);
// Positive unique-column control for the actual direct-position test.
const synthetic=[0,1,2,3,4,5,6,7];
assert.equal(distinct(synthetic.map(address=>address%8)),8);
console.log(JSON.stringify({
  source:'original p57 second GP prime clause (1031, rank173) and p50 32x8',
  root:173,componentSize:breadth.length,
  exactNodeCoordinates:sheet,
  directOriginalPositionColumnCount:6,
  missingPrintedColumns:missingColumns,
  directOriginalByteLowColumnCount:2,
  ordinaryTraversalRankProposals:projected,
  uniqueSourceAuthoredColumnOrder:false,
  originalUnknownPlaintextRecovered:false,
  syntheticDirectMappingControl:true
},null,2));
console.log('PASS: eight original graph nodes do not select eight physical columns');
