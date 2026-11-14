'use strict';
/**
 * Independent original-cipher reproduction of the first two selected 27x27
 * plaintext examples in 2retooz270703's public LP2 p0-2 claim.
 * It tests source arithmetic; it deliberately does not assume the claimant
 * supplied a unique next-node/next-ciphertext selector.
 * Node22: node sims/lp2_external_27x27_firstblocks_source_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const source=d.pages.filter(page=>page.page>=0&&page.page<=2);
assert.deepEqual(source.map(page=>page.indices.length),[262,266,201]);
const runes=source.flatMap(page=>page.indices);assert.equal(runes.length,729);
const at=(r,c)=>runes[27*(r-1)+c-1];
const phi=n=>Array.from({length:n},(_,i)=>i+1)
 .filter(k=>{let a=k,b=n;while(b){const t=a%b;a=b;b=t}return a===1}).length;
const mobius=n=>{if(n===1)return 1;let rem=n,sign=1;
 for(let f=2;f*f<=rem;f++){if(rem%f===0){rem/=f;sign=-sign;if(rem%f===0)return 0;
 while(rem%f===0)rem/=f}}
 return rem>1?-sign:sign;
};
/** @param {number[]} node @returns {{key:number[],phase:number}} */
const makeKey=node=>{const unrotated=[node[0],phi(node[1]),node[2]];
 const phase=((unrotated.reduce((sum,k)=>sum+mobius(phi(k)),0)%3)+3)%3;
 return{key:unrotated.slice(phase).concat(unrotated.slice(0,phase)),phase};
};
/** @param {[number,number][]} cells @param {number[]} key @returns {number[]} */
const decrypt=(cells,key)=>cells.map(([r,c],i)=>(at(r,c)-key[i%3]+29)%29);
const cases=[
 {name:'AS I GO THE',node:[[13,11],[13,12],[13,13]],
  cells:[[13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4]],
  expected:[24,15,10,6,3,2,18],expectedKey:[25,10,28],expectedPhase:0},
 {name:'WEATHER',node:[[14,4],[14,5],[14,6]],
  cells:[[14,14],[14,15],[14,16],[14,17],[14,18]],
  expected:[7,28,2,18,4],expectedKey:[14,14,10],expectedPhase:2},
];
const verified=cases.map(item=>{
 const n=item.node.map(([r,c])=>at(r,c));
 const {key,phase}=makeKey(n);
 assert.deepEqual(key,item.expectedKey);assert.equal(phase,item.expectedPhase);
 const plain=decrypt(item.cells,key);
 assert.deepEqual(plain,item.expected);
 const sourceCipher=item.cells.map(([r,c])=>at(r,c));
 assert.deepEqual(plain.map((v,i)=>(v+key[i%3])%29),sourceCipher);
 return{name:item.name,originalCipher:sourceCipher,derivedKey:key,
  selectedCells:item.cells.length,originalPlain:plain};
});
// The fixed first key ceases producing plaintext immediately after the author's
// first 7-rune block. The model requires an independent source selection for
// every subsequent block, and no 729-cell page-independent rule is provided.
const continuous=[];
for(let i=0;i<20;i++){
 const idx=(13-1)*27+24+i;
 continuous.push((runes[idx]-cases[0].expectedKey[i%3]+29)%29);
}
assert.deepEqual(continuous.slice(0,7),cases[0].expected);
console.log(JSON.stringify({originalPages:[0,1,2],sourceRunes:729,
 examples:verified,firstKeyContinuousNext13:continuous.slice(7),
 projectClaimedPlainRunes:115,minimumUntouchedCells:614,
 decision:'Selected examples reproduce; no complete source-selected decoder or heldout prediction'},null,2));
