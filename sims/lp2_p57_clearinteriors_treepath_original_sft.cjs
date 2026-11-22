'use strict';
/**
 * Original p57 clear 57-edge label tape + p50 58-node parent component:
 * page-specific tree-path GP29 additive key. Direct original receiver only.
 *
 * Node.js 22, Windows 11, CommonJS; no CLI flags required.
 * node sims/lp2_p57_clearinteriors_treepath_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} p */
const load=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const g=load('resources/liber-primus/lp2-corpus.json');
const parent=load('resources/liber-primus/lp2-grid-256.json').bytes;
assert.equal(parent.length,256);
const raw=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8');
const p57Text=raw.split('%').at(-1);
const lookup=new Map(g.runes.map((r,i)=>[r,i]));
/** @type {number[][]} */
const words=[];
let curr=[];
for(const chr of p57Text){
 if(lookup.has(chr))curr.push(lookup.get(chr));
 else if((chr==='-'||chr==='.')&&curr.length){
  words.push(curr);curr=[];
 }
}
if(curr.length)words.push(curr);
assert.equal(words.length,20);
assert.deepEqual(words.flat(),g.pages[57].indices);
assert.equal(words[0].length,7);
const black=words.slice(1).flatMap(w=>w.slice(1,-1));
assert.equal(black.length,50);
const red=words[0];
const labels=[...black,red[0],...red.slice(1,-1),red.at(-1)];
assert.equal(labels.length,57);
const children=Array.from({length:256},()=>[]);
parent.forEach((p,i)=>children[p].push(i));
/** @param {number} n */
function subtreeSize(n){
 const seen=new Set(),stack=[n];
 while(stack.length){
  const p=stack.pop();
  if(seen.has(p))continue;
  seen.add(p);
  stack.push(...children[p]);
 }
 return seen.size;
}
/**
 * Source-motivated but not author-selected canonical branch ordering:
 * largest branch first, tie by numeric node identity.
 * @param {number} n
 * @returns {number[]}
 */
function inorder(n){
 const kids=children[n].toSorted((a,b)=>
  subtreeSize(b)-subtreeSize(a)||a-b);
 if(kids.length===0)return[n];
 return[
  ...inorder(kids[0]),n,
  ...kids.slice(1).flatMap(inorder)
 ];
}
assert.equal(subtreeSize(201),56);
assert.equal(subtreeSize(74),57);
assert.equal(subtreeSize(205),58);
const address=[...inorder(201),74,205];
assert.equal(address.length,58);
assert.equal(new Set(address).size,58);
assert.deepEqual(address.filter((x,i)=>[0,15,32,50,55,56,57].includes(i)),
 [178,105,73,201,128,74,205]);
const pageByNode=new Map(address.map((node,i)=>[node,i]));
/**
 * Label each child->parent edge by its child's index in the 58-node
 * leftmost-inorder serialization. Clear p57 title/body supply 57 labels;
 * the root205 has no outgoing edge.
 * @param {number} page
 */
function keyFor(page){
 let node=address[page],out=[];
 while(node!==205){
  const i=pageByNode.get(node);
  assert.notEqual(i,undefined);
  out.push(labels[i]);
  node=parent[node];
  assert(out.length<58);
 }
 return out;
}
assert.deepEqual(keyFor(0).map(x=>g.translit[x]).join('').replace(/TH/g,'#'),
 'ICNSTNECUWUNC#IPE');
assert.deepEqual(keyFor(55).map(x=>g.translit[x]).join(''),'LPE');
assert.deepEqual(keyFor(56).map(x=>g.translit[x]).join(''),'E');
/** @param {number[]} a */
function ioc(a){
 const hist=new Uint32Array(29);
 for(const x of a)hist[x]++;
 return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const mod=x=>(x%29+29)%29;
/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {-1|1} sign
 */
function shift(input,key,sign){
 assert(key.length>0);
 return input.map((v,i)=>mod(v+sign*key[i%key.length]));
}
const pages=g.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const source=pages.flatMap(p=>p.indices);
assert.equal(source.length,12956);
const results=[];
for(const sign of /** @type {const} */ ([-1,1])){
 const decoded=[],per=[];
 for(const page of pages){
  const key=keyFor(page.page);
  const plain=shift(page.indices,key,sign);
  assert.deepEqual(shift(plain,key,-sign),page.indices);
  decoded.push(...plain);
  per.push({page:page.page,length:page.indices.length,
    key: key.map(i=>g.translit[i]).join(''),ioc:ioc(plain),
    first18:plain.slice(0,18).map(x=>g.translit[x]).join('')});
 }
 results.push({sign,globalIoC:ioc(decoded),page0:per.find(p=>p.page===0),
  page55:per.find(p=>p.page===55),
  top3:per.toSorted((a,b)=>b.ioc-a.ioc).slice(0,3)});
}
assert(Math.abs(ioc(source)-0.03447839786450569)<1e-12);
assert(Math.abs(results[0].globalIoC-0.034505458548715603)<1e-12);
assert(Math.abs(results[1].globalIoC-0.03448856200525032)<1e-12);
const clear=g.pages[57].indices;
assert.equal(clear.length,95);
let control=0;
for(const page of [0,15,32,55])
for(const sign of /** @type {const} */ ([-1,1])){
 const key=keyFor(page);
 const encrypted=shift(clear,key,-sign);
 assert.deepEqual(shift(encrypted,key,sign),clear);
 control++;
}
assert.equal(control,8);
console.log(JSON.stringify({status:'PASS',sourceRoot:205,sourceComponent:58,
 edgeLabels:57,blackInterior:50,redTitle:7,
 tableParentNode201:parent[201],tableParentNode74:parent[74],
 page0Address:address[0],page0Key:keyFor(0).map(x=>g.translit[x]).join(''),
 p55Key:keyFor(55).map(x=>g.translit[x]).join(''),
 unknownRunes:source.length,rawIoC:ioc(source),
 results,sourceNativePlantedInverses:control,
 conclusion:'No original plaintext; unshifted literal p57 word-inner edge tape and p50 parent paths do not form a direct periodic GP29 decryption.'},null,2));
