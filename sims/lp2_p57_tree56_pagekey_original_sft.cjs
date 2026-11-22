'use strict';

/**
 * Source-constrained p57 -> p50 graph -> 55 LP2 page-key receivers.
 *
 * The solved p57 clauses select table root201; canonical base60 pointers
 * give an exact 56-node subtree. Read its larger child subtree, its node,
 * and then its remaining smaller subtrees. This maps table-only page50
 * to root201 and one of the other 55 nodes to each rune-bearing page.
 *
 * First test a complete node-to-root path as a repeating GP29 key.
 * Second test the 55 strict p57 word interiors as page-local plaintext
 * autokey starting symbols. Neither model uses fitted keys or cribs.
 *
 * Run on Windows Node.js 22:
 *   node sims/lp2_p57_tree56_pagekey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const parent = table.bytes;
assert.equal(parent.length, 256);
const children = Array.from({length: 256}, () => []);
parent.forEach((destination, source) => children[destination].push(source));
/** @param {number} node @returns {number[]} */
function descendants(node) {
  const stack = [node], seen = new Set();
  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...children[current]);
  }
  return [...seen];
}
/** @param {number} node @returns {number[]} */
function inorder(node) {
  const branches = children[node].toSorted((a, b) =>
    descendants(b).length - descendants(a).length || a - b);
  return branches.length ? [
    ...inorder(branches[0]), node, ...branches.slice(1).flatMap(inorder)
  ] : [node];
}
assert.deepEqual(children[201].toSorted((a,b) => a-b), [82,128]);
assert.deepEqual(children[82].toSorted((a,b) => a-b), [79,163]);
assert.deepEqual(children[201].map(n => descendants(n).length), [50,5]);
assert.deepEqual(children[82].map(n => descendants(n).length), [44,5]);
const addresses = inorder(201);
assert.equal(addresses.length, 56);
assert.equal(new Set(addresses).size, 56);
assert.deepEqual([addresses[0],addresses[15],addresses[23],
  addresses[32],addresses[44],addresses[50],addresses[55]],
  [178,105,222,73,82,201,128]);
assert.equal(parent[201],74);
assert.equal(parent[74],205);
assert.deepEqual([descendants(201).length,descendants(74).length,
  descendants(205).length], [56,57,58]);
const pages = book.pages.filter(page => page.page < 56 && page.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((sum,page) => sum+page.indices.length,0),12956);
assert.ok(pages.every(page => page.page !== 50));

const lastSection = transcript.split('%').at(-1)
  .replace(/\/\r?\n/g, '');
const words = (lastSection.match(/[\u16A0-\u16FF]+/gu) || [])
  .map(raw => [...raw].map(rune => book.runes.indexOf(rune)));
assert.equal(words.length,20);
assert.deepEqual(words.flat(),book.pages.find(page => page.page===57).indices);
const interior = words.flatMap(word => word.slice(1,-1));
assert.equal(interior.length,55);
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const h=Array(29).fill(0);
  for (const x of arr) h[x]++;
  return h.reduce((sum, n) => sum + n*(n-1),0)/(arr.length*(arr.length-1));
}
/** @param {number} node @param {boolean} includeRoot */
function pathTo201(node, includeRoot) {
  const result=[node];
  while (node !== 201) {
    node=parent[node];
    assert.ok(result.length<256);
    result.push(node);
  }
  if (!includeRoot) result.pop();
  return result;
}
/** @param {number[]} ciphertext @param {number[]} key @param {number} sign */
function decodePeriodic(ciphertext, key, sign) {
  return ciphertext.map((value,i) => mod(value+sign*key[i%key.length]));
}
/** @param {number[]} ciphertext @param {number} seed @param {number} sign */
function decodeAutokey(ciphertext, seed, sign) {
  let previous=seed;
  return ciphertext.map(value => {
    const next=mod(value+sign*previous);
    previous=next;
    return next;
  });
}
const original = pages.flatMap(page=>page.indices);
assert.ok(Math.abs(ioc(original)-0.03447839786450569)<1e-12);
const clean57=book.pages.find(page=>page.page===57).indices;
const models=[];
for (const includeRoot of [false,true])
for (const channel of ['address','token'])
for (const reverse of [false,true])
for (const sign of [-1,1]) {
  const all=[],periods=[];
  let p0=[],p55=[];
  for (const page of pages) {
    const path=pathTo201(addresses[page.page],includeRoot);
    if (reverse) path.reverse();
    const key=path.map(n=>mod(channel==='address'?n:parent[n]));
    const plaintext=decodePeriodic(page.indices,key,sign);
    const forward=plaintext.map((v,i)=>mod(v-sign*key[i%key.length]));
    assert.deepEqual(forward,page.indices);
    const plant=Array.from({length:page.indices.length},
      (_,i)=>clean57[i%clean57.length]);
    const encrypted=plant.map((v,i)=>mod(v-sign*key[i%key.length]));
    assert.deepEqual(decodePeriodic(encrypted,key,sign),plant);
    all.push(...plaintext);
    periods.push(key.length);
    if (page.page===0) p0=plaintext.slice(0,22);
    if (page.page===55) p55=plaintext.slice(0,22);
  }
  assert.equal(all.length,12956);
  const value=ioc(all);
  assert.ok(value>0.0344&&value<0.0346);
  models.push({includeRoot,channel,reverse,sign,periodRange:
    [Math.min(...periods),Math.max(...periods)],
    allRuneIoC:Number(value.toFixed(8)),
    p0Beginning:p0.map(x=>book.translit[x]).join(' '),
    p55Beginning:p55.map(x=>book.translit[x]).join(' ')});
}
const autokey=[];
for (const reverse of [false,true])
for (const sign of [-1,1]) {
  const key=reverse?[...interior].reverse():interior;
  const all=[];
  for (let i=0;i<pages.length;i++) {
    const cipher=pages[i].indices;
    const plain=decodeAutokey(cipher,key[i],sign);
    let previous=key[i];
    const forward=plain.map(value=>{
      const encoded=mod(value-sign*previous);
      previous=value;
      return encoded;
    });
    assert.deepEqual(forward,cipher);
    const planted=Array.from({length:cipher.length},
      (_,j)=>clean57[j%clean57.length]);
    previous=key[i];
    const encrypted=planted.map(value=>{
      const encoded=mod(value-sign*previous);
      previous=value;
      return encoded;
    });
    assert.deepEqual(decodeAutokey(encrypted,key[i],sign),planted);
    all.push(...plain);
  }
  const value=ioc(all);
  assert.ok(value>0.0344&&value<0.0346);
  autokey.push({reverse,sign,allRuneIoC:Number(value.toFixed(8))});
}
console.log(JSON.stringify({
  source:{knownPages:55,knownRunes:12956,treeRoot:201,
    page50Node:addresses[50],page55Node:addresses[55],
    tableBranches:[50,5],secondBranches:[44,5],
    p57InteriorRunes:interior.length},
  originalIoC:ioc(original),clearP57IoC:ioc(clean57),
  directPathKeys:{models:models.length,bestIoC:Math.max(...models.map(x=>x.allRuneIoC)),
    results:models},
  directInteriorAutokey:autokey,
  positive:'All direct-path and autokey cases recover their entire independent clear GP29 plants',
  decision:'Source-derived page-node keys with direct periodic GP29 or plaintext-autokey receiver do not recover prose. Page-node mapping remains a hypothesis.'
},null,2));
