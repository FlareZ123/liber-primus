'use strict';

/**
 * P57 literal word shedding gives 50 black interiors and 7 red title runes.
 * These fill all 57 edges of the conditional 58-node original p50 successor
 * tree rooted at205: left 50, right5, and ancestral spine2.
 *
 * The graph places original p57 at depth0 (clear), p56 at depth1 (solved
 * real prime-totient/F-transparent cipher), numeric-only p50 at depth2,
 * and every still-encrypted rune-bearing page at depth>=3.
 *
 * Test the simplest causal extension: one authentic p56 cipher layer is
 * the final outer layer of each unknown original. Exhaustively enumerate
 * the F-transparent inverse. Also test P/E red title endpoint rune numbers
 * as the p56 initial prime index against the *solved p56 plaintext*.
 *
 * This is a conditional original-structure/cryptographic gate, not a crack.
 * Windows Node.js 22:
 *   node sims/lp2_p57_58node_color_edges_p56_outerlayer_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const trans=read('resources/liber-primus/lp2-transcription.txt');
const parent=table.bytes,children=Array.from({length:256},()=>[]);
assert.equal(parent.length,256);
parent.forEach((p,n)=>children[p].push(n));
/** @param {number} rootNode @returns {number[]} */
function descendants(rootNode){
  const nodes=new Set(),queue=[rootNode];
  while(queue.length){
    const node=queue.pop();
    if(nodes.has(node))continue;
    nodes.add(node);
    queue.push(...children[node]);
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
assert.deepEqual([parent[201],parent[74]],[74,205]);
assert.deepEqual([201,74,205].map(x=>descendants(x).length),[56,57,58]);
assert.deepEqual(children[201].map(x=>descendants(x).length),[50,5]);
assert.deepEqual(children[201],[82,128]);
const order=inorder(205);
assert.equal(order.length,58);
assert.equal(new Set(order).size,58);
assert.deepEqual([order[0],order[50],order[55],order[56],order[57]],
  [178,201,128,74,205]);
const treeSet=new Set(order),treeEdgeSources=order.filter(x=>x!==205);
assert.equal(treeEdgeSources.length,57);
for(const n of treeEdgeSources)assert.ok(treeSet.has(parent[n]));
/** @param {number} n @returns {number} */
function depth(n){
  let k=0;
  while(n!==205){
    n=parent[n];
    k++;
    assert.ok(k<58);
  }
  return k;
}
assert.equal(depth(order[57]),0);
assert.equal(depth(order[56]),1);
assert.equal(depth(order[50]),2);
assert.ok(order.filter((_,p)=>p<56&&p!==50).every(x=>depth(x)>=3));
const wordRunes=(trans.split('%').at(-1).replace(/\/\r?\n/g,'')
  .match(/[\u16A0-\u16FF]+/gu)||[])
  .map(w=>[...w].map(r=>source.runes.indexOf(r)));
assert.equal(wordRunes.length,20);
assert.deepEqual(wordRunes.flat(),source.pages[57].indices);
const title=wordRunes[0],body=wordRunes.slice(1);
assert.equal(title.length,7);
assert.equal(body.flat().length,88);
assert.equal(body.length,19);
const bodyInner=body.flatMap(w=>w.slice(1,-1));
const titleInner=title.slice(1,-1);
assert.deepEqual([bodyInner.length,titleInner.length],[50,5]);
assert.deepEqual([source.translit[title[0]],source.translit[title.at(-1)]],['P','E']);

// Source-label every one of the 57 directed edges of the graph rooted205.
// The separate editorial rule for ordering edges *within* each branch is
// still provisional; the existence of an exact color/size partition is not.
const edgeLabels=new Map();
for(let p=0;p<50;p++)edgeLabels.set(order[p],bodyInner[p]);
for(let p=51;p<=55;p++)edgeLabels.set(order[p],titleInner[p-51]);
edgeLabels.set(201,title[0]); // red title first perimeter P, on201->74
edgeLabels.set(74,title.at(-1)); // red title last perimeter E, on74->205
assert.equal(edgeLabels.size,57);
assert.deepEqual([...edgeLabels.keys()].sort((a,b)=>a-b),
  treeEdgeSources.sort((a,b)=>a-b));
assert.equal(edgeLabels.has(205),false);

const mod=x=>(x%29+29)%29;
const sieve=new Uint8Array(150000),primeKey=[];
for(let n=2;primeKey.length<9000;n++){
  if(sieve[n])continue;
  primeKey.push((n-1)%29);
  if(n*n<sieve.length)for(let j=n*n;j<sieve.length;j+=n)sieve[j]=1;
}
assert.equal(primeKey.length,9000);
/** @param {number[]} p @param {number} start @returns {number[]} */
function encryptPhi(p,start){
  let consumed=0;
  return p.map(v=>v===0?0:mod(v+primeKey[start+consumed++]));
}
/** @param {number[]} cipher @param {number} start @returns {number} */
function furthest(cipher,start){
  let states=[0];
  for(let i=0;i<cipher.length;i++){
    const next=[],visited=new Uint8Array(i+2),v=cipher[i];
    for(const used of states){
      if(v===0&&!visited[used]){visited[used]=1;next.push(used);}
      if(mod(v-primeKey[start+used])!==0&&!visited[used+1]){
        visited[used+1]=1;next.push(used+1);
      }
    }
    if(!next.length)return i;
    states=next;
  }
  return cipher.length;
}
const tokens=source.translit.map((t,i)=>({t,i}))
  .sort((a,b)=>b.t.length-a.t.length);
/** @param {string} raw @returns {number[]} */
function encodeWord(raw){
  const str=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  for(let i=0;i<str.length;){
    const found=tokens.find(item=>str.startsWith(item.t,i));
    assert.ok(found);
    out.push(found.i);i+=found.t.length;
  }
  return out;
}
const plain56=('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(encodeWord);
assert.equal(plain56.length,85);
assert.deepEqual(encryptPhi(plain56,0),source.pages[56].indices);
assert.equal(furthest(source.pages[56].indices,0),85);
const p56EdgeSeeds=[title[0],title.at(-1),
  source.prime[title[0]],source.prime[title.at(-1)]];
const p56EndpointGate=p56EdgeSeeds.map(seed=>
  ({seed,originalPrefixAdmissible:furthest(source.pages[56].indices,seed)}));
assert.deepEqual(p56EndpointGate.map(x=>x.originalPrefixAdmissible),
  [41,11,9,34]);
assert.ok(p56EndpointGate.every(x=>x.originalPrefixAdmissible<85));

const pages=source.pages.filter(page=>page.page<56&&page.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,x)=>s+x.indices.length,0),12956);
const rows=pages.map(page=>{
  const prefix=furthest(page.indices,0);
  const native=Array.from({length:page.indices.length},
    (_,j)=>source.pages[57].indices[j%source.pages[57].indices.length]);
  const positive=encryptPhi(native,0);
  assert.equal(furthest(positive,0),native.length);
  return {page:page.page,node:order[page.page],depth:depth(order[page.page]),
    total:page.indices.length,furthestSingleOuterPhi:prefix};
});
const complete=rows.filter(x=>x.total===x.furthestSingleOuterPhi)
  .map(x=>x.page);
assert.deepEqual(complete,[1,49]);
assert.equal(rows.filter(x=>x.total!==x.furthestSingleOuterPhi).length,53);
const output={
  graph:{root:205,totalNodes:58,totalEdges:57,
    p57Depth:depth(order[57]),p56Depth:depth(order[56]),
    p50Depth:depth(order[50]),lowestUnknownRunePageDepth:
      Math.min(...rows.map(x=>x.depth)),
    sourceBranchSizes:[50,5],externalSpineEdges:2},
  p57LabelInventory:{bodyPrintedRunes:88,bodyWords:19,bodyInteriors:50,
    redTitlePrintedRunes:7,redTitleInteriors:5,
    redTitleExterior:[source.translit[title[0]],
      source.translit[title.at(-1)]],allLabelledEdges:edgeLabels.size},
  solvedControl:{p56PlainRunes:plain56.length,originalCipherRecovered:
    encryptPhi(plain56,0).length,originalP56ValidPrefix:85,
    clearP57Runes:source.pages[57].indices.length},
  p56TitleEndpointAsPrimeStart:p56EndpointGate,
  originalOneAuthenticOuterLayer:{
    runePagesTested:55,runesTested:12956,
    fullyAdmissiblePages:complete,
    impossibleOriginalPages:55-complete.length,
    firstFailureExamples:rows.slice(0,8)},
  nativePositive:'55/55 source-GP page plants invert under authentic p56 rule',
  conclusion:'Original colors and 58-node topology yield an exact 50+5+2 edge inventory. However authentic p56 cipher as common outer layer with key start0 fails 53/55 unknown pages, and P/E edge labels do not reproduce the solved p56 cipher start. No plaintext.'
};
console.log(JSON.stringify(output,null,2));
