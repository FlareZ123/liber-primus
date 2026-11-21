'use strict';
/**
 * Source-only, all-sibling-order P50 functional graph traversal discriminator.
 * Node.js 22 CommonJS. No hidden fitting, network, file writes or dependencies.
 * Run against original repository resources.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcript=read('resources/liber-primus/lp2-transcription.txt').split('%');
assert(signed.includes('their numbers are the direction.'));
assert(signed.includes('epiphany seeks the devoted.'));
assert.equal(transcript.length,57);
for(const p of [2,7,15,32,39])assert(transcript[p].includes('$'));
const nodes=grid.pages.flatMap(p=>p.bytes);
assert.equal(nodes.length,256);
const rev=Array.from({length:256},()=>[]);
nodes.forEach((v,i)=>rev[v].push(i));
function ancestors(root) {
 const found=new Set([root]), stack=[root];
 while(stack.length)for(const v of rev[stack.pop()])if(!found.has(v)){found.add(v);stack.push(v);}
 return found;
}
const S=Array.from({length:256},(_,i)=>ancestors(i));
assert.deepEqual([205,173,201].map(n=>S[n].size),[58,8,56]);
assert.deepEqual(rev[201],[82,128]);
assert.deepEqual([82,128].map(n=>S[n].size),[50,5]);
const gpWords=gp.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
function gp0(text) {
 let s=text.toUpperCase().replace(/ING/g,'NG').replace(/K|Q/g,'C').replace(/V/g,'U').replace(/Z/g,'S'),out=0;
 while(s){const item=gpWords.find(x=>s.startsWith(x.token));assert(item,'Rune transliteration failed at '+s);out+=item.i;s=s.slice(item.token.length);}
 return out;
}
assert.equal(gp0('DIRECTION'),98);
assert.equal(gp0('DIRECTION'.replace(/IO/g,'IA')),112);
assert.equal(grid.pages.flatMap(p=>p.tokens)[112],'1D');
assert.equal(nodes[112],73);
const redSource=read('resources/external/Liber Primus 57.txt');
const p15=redSource.split(/^%15\s*$/m)[1]?.split(/^%16\s*$/m)[0];
assert(p15,'source p15 stanza missing');
const redHead=[...p15.matchAll(/\[([^\]]+)\]/gu)]
 .map(x=>[...x[1]].filter(c=>gp.runes.includes(c)))
 .find(xs=>xs.length===9);
assert(redHead,'p15 nine-red-rune section heading missing');
assert.equal(redHead.join(''),'ᚠᚢᛚᛗᚪᛠᚣᛟᚪ');
const redSum=redHead.reduce((sum,ch)=>sum+gp.runes.indexOf(ch),0);
assert.equal(redSum,164);
assert.equal(grid.pages.flatMap(p=>p.tokens)[redSum],'1j');
assert.equal(nodes[redSum],105);
const routeFromP15=[105];
while(routeFromP15.at(-1)!==205){
 const next=nodes[routeFromP15.at(-1)];
 assert(!routeFromP15.includes(next),'cyclic p15 original table route');
 routeFromP15.push(next);
}
assert.deepEqual(routeFromP15,[105,63,51,59,69,73,79,82,201,74,205]);
const selected=[112,73,79,82,201,74,205];
for(let i=0;i+1<selected.length;i++)assert.equal(nodes[selected[i]],selected[i+1]);

const branchNodes=[...S[205]].filter(n=>rev[n].length>1);
const options={};
function perms(xs){
 if(xs.length<=1)return [xs.slice()];
 return xs.flatMap((v,i)=>perms(xs.filter((_,j)=>i!==j)).map(a=>[v,...a]));
}
for(const n of branchNodes)options[n]=perms(rev[n]);
assert.equal(branchNodes.length,13);
const choiceNodes=branchNodes.filter(n=>n!==201).sort((a,b)=>a-b);
const choiceSets=choiceNodes.map(n=>options[n]);
const totalChoices=choiceSets.reduce((a,b)=>a*b.length,1);
assert.equal(totalChoices,442368);
const chosen=rev.map(x=>x);
chosen[201]=[82,128]; // physical p50 is the sole rune-free page.
function visit(n,out){
 const c=chosen[n];
 if(c.length)visit(c[0],out);
 out.push(n);
 for(let i=1;i<c.length;i++)visit(c[i],out);
}
function order(){const out=[];visit(205,out);assert.equal(out.length,58);return out;}
function matchRange(arr,start,end,n){
 const target=S[n],test=arr.slice(start,end+1);
 return test.length===target.size&&test.every(x=>target.has(x));
}
function flags(arr){
 return {
  first3:matchRange(arr,0,2,250),
  first8:matchRange(arr,0,7,148),
  first15:matchRange(arr,0,14,198),
  cuneiform7:matchRange(arr,33,39,155),
  cuneiformPlus8:matchRange(arr,33,40,112),
  finalFirst50:matchRange(arr,0,49,82),
  finalLast5:matchRange(arr,51,55,128),
  lastFloral5:matchRange(arr,45,49,163),
  tree32:arr[32]===73,
  directionHeading40:arr[40]===112,
  redP15Cell:arr[15]===105,
  numeric50:arr[50]===201,
  solved56:arr[56]===74,
  solved57:arr[57]===205
 };
}
function bySize(n){return rev[n].slice().sort((a,b)=>S[b].size-S[a].size||a-b)}
for(const n of branchNodes)chosen[n]=bySize(n);
const sizeOrder=order(),fixed=flags(sizeOrder);
assert(Object.values(fixed).every(Boolean));
assert.deepEqual(selected.map(n=>sizeOrder.indexOf(n)),[40,32,43,44,50,56,57]);
assert.deepEqual(routeFromP15.map(n=>sizeOrder.indexOf(n)),[15,20,21,25,31,32,43,44,50,56,57]);
const largestFirstOrder=sizeOrder.slice();
for(const n of branchNodes)chosen[n]=rev[n].slice().sort((a,b)=>a-b);
const ascending=order();
const low=flags(ascending);
assert.equal(low.tree32,false);
assert.equal(low.cuneiform7,false);
assert.equal(low.first8,false);
chosen[201]=[82,128];
const counts={};
for(const key of Object.keys(fixed))counts[key]=0;
counts.triple=0;
counts.quintet=0;
counts.tripleWithSignedDirection=0;
counts.tripleWithTree=0;
counts.signedPair=0;
counts.redAndSigned=0;
counts.redSignedAndVisual=0;
counts.quadruple=0;
counts.quadrupleWithRedAndSigned=0;
let completed=0;
function enumerate(depth){
 if(depth===choiceNodes.length){
  const page=order(),q=flags(page);
  completed++;
  for(const key of Object.keys(fixed))counts[key]+=Number(q[key]);
  const triple=q.first8&&q.first15&&q.cuneiform7;
  const quadruple=triple&&q.first3;
  counts.quadruple+=Number(quadruple);
  counts.quadrupleWithRedAndSigned+=Number(quadruple&&q.redP15Cell&&q.directionHeading40&&q.tree32);
  counts.triple+=Number(triple);
  counts.tripleWithSignedDirection+=Number(triple&&q.directionHeading40);
  counts.tripleWithTree+=Number(triple&&q.tree32);
  counts.signedPair+=Number(q.directionHeading40&&q.tree32);
  counts.redAndSigned+=Number(q.redP15Cell&&q.directionHeading40&&q.tree32);
  counts.redSignedAndVisual+=Number(q.redP15Cell&&q.directionHeading40&&q.tree32&&q.first8&&q.first15&&q.cuneiform7);
  counts.quintet+=Number(q.first8&&q.first15&&q.cuneiform7&&q.lastFloral5&&q.finalLast5);
  return;
 }
 const n=choiceNodes[depth];
 for(const sequence of choiceSets[depth]){
  chosen[n]=sequence;
  enumerate(depth+1);
 }
}
enumerate(0);
assert.equal(completed,totalChoices);
console.log(JSON.stringify({
  status:'PASS',
  originalSource:{
    primeClauseOrdinals:[205,173,201],sourceClosureSizes:[58,8,56],
    direction2016LatinGP0:98,directionWithIOLigatureGP0:112,
    directionTableEdge:[112,73],
    originalP15RedHeadingGP0:redSum,
    originalP15PrintedTableToken:'1j',
    redP15ToSolvedPageGraphRoute:routeFromP15,
    exactPublicPageArt:[0,7,14,15,32,33,39,40,45,49,50,51,55,56,57]
  },
  frozenLargestSubtreeFirst:{
    graphNodeToPhysical:selected.map(n=>({node:n,page:largestFirstOrder.indexOf(n)})),
    p15HeadingToLastSolvedPhysicalPages:routeFromP15.map(n=>largestFirstOrder.indexOf(n)),
    page0to14:largestFirstOrder.slice(0,15),
    page33to40:largestFirstOrder.slice(33,41),
    exactSourceGeometricMatches:fixed
  },
  sourcePrintedAddressAscending:{page0to14:ascending.slice(0,15),page33to40:ascending.slice(33,41),exactSourceGeometricMatches:low},
  allPossibleInorderSiblingOrdersConditionedOnNumericalPage50:{
    enumerated:completed,branchingNodes:branchNodes.length-1,
    matches:counts
  },
  caveat:'No first-party instruction authorizes largest-first sibling priority. The section coincidences were recognized post-hoc. No original ciphertext operation or unknown plaintext has been identified.'
},null,2));
