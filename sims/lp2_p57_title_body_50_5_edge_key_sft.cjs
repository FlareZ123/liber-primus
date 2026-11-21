'use strict';

/**
 * Original solved PARABLE word interiors as edge labels on p50's conditional
 * base60 56-node source graph. The body gives exactly 50 interior GP runes;
 * the seven-rune title gives 5. These exactly fill the two printed-table
 * subtree sizes (50+5), leaving root201 for the rune-free physical page50.
 *
 * Test two fixed decipherment consumers: repeated edge-labelled path keys
 * (8 full-book GP29 additive variants), and the genuine solved-p56
 * plaintext-F-transparent prime-totient cipher seeded by each assigned
 * p57 interior rune (two full-book variants).
 *
 * The page-node traversal is only a test hypothesis: largest child first
 * inorder; the original manuscript does not authenticate that ordering.
 *
 * Windows Node.js 22: node sims/lp2_p57_title_body_50_5_edge_key_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const parent=table.bytes;
assert.equal(parent.length,256);
const children=Array.from({length:256},()=>[]);
parent.forEach((p,i)=>children[p].push(i));
/** @param {number} n @returns {number[]} */
function descendants(n){
  const visited=new Set(),todo=[n];
  while(todo.length){
    const cur=todo.pop();
    if(visited.has(cur))continue;
    visited.add(cur);
    todo.push(...children[cur]);
  }
  return [...visited];
}
/** @param {number} node @returns {number[]} */
function inorder(node){
  const branches=children[node].toSorted((a,b)=>
    descendants(b).length-descendants(a).length||a-b);
  return branches.length?[
    ...inorder(branches[0]),node,...branches.slice(1).flatMap(inorder)
  ]:[node];
}
assert.deepEqual(children[201],[82,128]);
assert.deepEqual(children[201].map(n=>descendants(n).length),[50,5]);
assert.deepEqual(children[82].map(n=>descendants(n).length),[44,5]);
assert.deepEqual([parent[201],parent[74]],[74,205]);
assert.deepEqual([201,74,205].map(n=>descendants(n).length),[56,57,58]);
const pageNodes=inorder(201);
assert.equal(pageNodes.length,56);
assert.equal(new Set(pageNodes).size,56);
assert.deepEqual([pageNodes[0],pageNodes[32],pageNodes[44],
  pageNodes[50],pageNodes[55]],[178,73,82,201,128]);

const sourceWords=(transcription.split('%').at(-1)
  .replace(/\/\r?\n/g,'').match(/[\u16A0-\u16FF]+/gu)||[])
  .map(raw=>[...raw].map(rune=>corpus.runes.indexOf(rune)));
assert.equal(sourceWords.length,20);
assert.deepEqual(sourceWords.flat(),corpus.pages[57].indices);
assert.equal(sourceWords[0].length,7);
assert.equal(sourceWords.slice(1).flat().length,88);
/** @param {number[]} w @returns {number[]} */
const shed=w=>w.slice(1,-1);
const body=sourceWords.slice(1).flatMap(shed),title=shed(sourceWords[0]);
assert.equal(body.length,50);
assert.equal(title.length,5);
assert.deepEqual(title.map(x=>corpus.translit[x]),['A','R','A','B','L']);
const edgeLabels=[...body,...title];
assert.equal(edgeLabels.length,55);
const unknownPages=corpus.pages.filter(p=>p.page<56&&p.indices.length>0);
assert.equal(unknownPages.length,55);
assert.equal(unknownPages.reduce((a,p)=>a+p.indices.length,0),12956);
assert.ok(unknownPages.every(p=>p.page!==50));
const nodeLabels=new Map();
for(const page of unknownPages){
  const mappedNode=pageNodes[page.page],order=page.page<50?page.page:page.page-1;
  assert.ok(!nodeLabels.has(mappedNode));
  nodeLabels.set(mappedNode,edgeLabels[order]);
}
assert.equal(nodeLabels.size,55);
assert.equal(nodeLabels.has(201),false);
assert.deepEqual([...nodeLabels.keys()].sort((a,b)=>a-b),
  pageNodes.filter(x=>x!==201).sort((a,b)=>a-b));
/** @param {number} node @returns {number[]} */
function pathToRoot(node){
  const result=[];
  while(node!==201){
    result.push(node);
    node=parent[node];
    assert.ok(result.length<56);
  }
  return result;
}
const mod=n=>(n%29+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a){
  const hist=Array(29).fill(0);
  for(const v of a){assert.ok(v>=0&&v<29);hist[v]++;}
  return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} cipher @param {number[]} key @param {number} sign */
const additive=(cipher,key,sign)=>cipher.map((c,i)=>mod(c+sign*key[i%key.length]));
const clear=corpus.pages[57].indices;
const original=unknownPages.flatMap(p=>p.indices);
const periodic=[];
for(const channel of ['ordinal','GPprime'])
for(const reverse of [false,true])
for(const sign of [-1,+1]){
  const all=[],periods=[];
  for(const page of unknownPages){
    const path=pathToRoot(pageNodes[page.page]);
    if(reverse)path.reverse();
    const key=path.map(n=>channel==='ordinal'?
      nodeLabels.get(n):corpus.prime[nodeLabels.get(n)]).map(mod);
    assert.ok(key.length>0);
    const plain=additive(page.indices,key,sign);
    assert.deepEqual(additive(plain,key,-sign),page.indices);
    const plant=Array.from({length:page.indices.length},
      (_,i)=>clear[i%clear.length]);
    assert.deepEqual(additive(additive(plant,key,-sign),key,sign),plant);
    all.push(...plain);
    periods.push(key.length);
  }
  const ic=ioc(all);
  assert.ok(ic>=0.0344&&ic<=0.0346);
  periodic.push({channel,reverse,sign,
    allRuneIoC:Number(ic.toFixed(8)),minPeriod:Math.min(...periods),
    maxPeriod:Math.max(...periods)});
}
assert.equal(periodic.length,8);
assert.equal(Math.max(...periodic.map(x=>x.allRuneIoC)),0.03450328);

// The authentic positive p56 cipher uses successive prime totients,
// plaintext-F transparency, and an uninterrupted clock within each page.
const sieve=new Uint8Array(150000),primeKey=[];
for(let n=2;n<sieve.length&&primeKey.length<9000;n++){
  if(sieve[n])continue;
  primeKey.push((n-1)%29);
  if(n*n<sieve.length)for(let q=n*n;q<sieve.length;q+=n)sieve[q]=1;
}
assert.equal(primeKey.length,9000);
/** @param {number[]} plaintext @param {number} seed @returns {number[]} */
function encryptPhi(plaintext,seed){
  let used=0;
  return plaintext.map(p=>p===0?0:mod(p+primeKey[seed+used++]));
}
/**
 * @param {number[]} ciphertext
 * @param {number} seed
 * @returns {number} Maximal valid original prefix length over all literal-F
 * and encrypted-non-F legal plaintext branches.
 */
function furthest(ciphertext,seed){
  let states=[0];
  for(let i=0;i<ciphertext.length;i++){
    const seen=new Uint8Array(i+2),next=[];
    for(const used of states){
      const c=ciphertext[i];
      if(c===0&&!seen[used]){next.push(used);seen[used]=1;}
      const p=mod(c-primeKey[seed+used]);
      if(p!==0&&!seen[used+1]){next.push(used+1);seen[used+1]=1;}
    }
    if(!next.length)return i;
    states=next;
  }
  return ciphertext.length;
}
const solved56=corpus.pages[56].indices;
assert.equal(furthest(solved56,0),85);
const primeTransfer=[];
for(const sourceRegister of ['ordinal','GPprime']){
  const rows=[];
  for(const page of unknownPages){
    const edgeRune=nodeLabels.get(pageNodes[page.page]);
    const seed=sourceRegister==='ordinal'?edgeRune:corpus.prime[edgeRune];
    const reached=furthest(page.indices,seed);
    const plant=Array.from({length:page.indices.length},
      (_,i)=>clear[i%clear.length]);
    const enc=encryptPhi(plant,seed);
    assert.equal(furthest(enc,seed),plant.length);
    rows.push({page:page.page,seed,furthest:reached,total:page.indices.length});
  }
  const full=rows.filter(r=>r.furthest===r.total).map(r=>r.page);
  assert.deepEqual(full,sourceRegister==='ordinal'?[]:[2,17,22,43,51]);
  primeTransfer.push({sourceRegister,completeOriginalPages:full,
    originalPageCount:rows.length,failedPages:rows.length-full.length,
    meanFurthest:Number((rows.reduce((a,r)=>a+r.furthest,0)/55).toFixed(4))});
}
const result={
  source:{originalLP2RInheritedUnknownRunes:12956,p57TitleRunes:7,
    p57TitleInteriorRunes:5,p57BodyWords:19,p57BodyRunes:88,
    p57BodyInteriorRunes:50,root:201,rootBranchSizes:[50,5],
    runePagesBeforeTable:50,runePagesAfterTable:5,
    pageNodeOrder:'prospective largest-subtree-first inorder',
    sourceClue:'p57 SHED OUR OWN CIRCUMFERENCES; p57 TUNNELING TO THE SURFACE'},
  baseline:{originalIoC:Number(ioc(original).toFixed(8)),
    solvedClearP57IoC:Number(ioc(clear).toFixed(8))},
  fullOriginalGP29PeriodicPathKeyModels:periodic,
  directP56PhiPrimeTransfer:primeTransfer,
  positive:'all 8 edge-path receivers invert native-GP plants and re-encrypt original; p56 85/85 authentic control; 110 page-specific F-transparent plants invert in full',
  decision:'Exact source 50/5 interior-title/body alignment is real; table traversal and both direct receivers remain unauthenticated and fail to recover intact unknown-page plaintext.'
};
console.log(JSON.stringify(result,null,2));
