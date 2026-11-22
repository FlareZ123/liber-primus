'use strict';
/**
 * Source-original 27x27 opening two-block and frozen endpoint-key carry gate.
 * The tested continuation is conditional and not an authenticated plaintext.
 * Run: node sims/lp2_27x27_endcell_carry_gate.cjs
 * @module lp2_27x27_endcell_carry_gate
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const book = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = book.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.deepEqual(book.pages.slice(0,3).map(p => p.indices.length), [262,266,201]);
assert.equal(source.length, 729);
const gp = v => v.map(x => book.translit[x]).join(' ');
const field = n => ((n % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let x=n, out=n;
  for (let p=2; p*p<=x; p++) if (x%p===0) {
    out-=out/p;
    while(x%p===0) x/=p;
  }
  if(x>1) out-=out/x;
  return out;
}
/** @param {number} n @returns {number} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let x=n, s=1;
  for (let p=2; p*p<=x; p++) if(x%p===0) {
    x/=p; s=-s;
    if(x%p===0) return 0;
  }
  return x>1 ? -s : s;
}
const at=(r,c)=>source[27*(r-1)+c-1];
const sig = k => k.map(v => mu(phi(v)));
const plain = (pos,key) => pos.map((i,j)=>field(source[i]-key[j%key.length]));
const initial = book.pages[0].indices.slice(0,13);
assert.deepEqual(initial,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(at(1,14),2); // original black TH at column 14, following 13 heading runes
const firstNode=source.slice(334,337),firstKey=[firstNode[0],phi(firstNode[1]),firstNode[2]];
assert.deepEqual(firstNode,[25,11,28]);
assert.deepEqual(firstKey,[25,10,28]);
assert.deepEqual(sig(firstKey),[0,0,0]);
assert.equal(gp(plain([348,349,350,351,352,353,354],firstKey)), 'A S I G O TH E');
const secondNode=source.slice(354,357),unrotated=[secondNode[0],phi(secondNode[1]),secondNode[2]];
assert.equal(gp(secondNode), 'X OE X');
assert.deepEqual(sig(unrotated),[1,0,1]);
const rotated=[unrotated[2],unrotated[0],unrotated[1]];
assert.deepEqual(rotated,[14,14,10]);
assert.deepEqual([at(14,5), at(14,14)],[22,21]);
assert.equal(gp(plain([364,365,366,367,368],rotated)),'W EA TH E R');
// Source-fixed Report 01 successor after the original second cipher block.
const secondCells=Array.from({length:5},(_,i)=>[14,14+i]);
const mobiusSum=secondCells.reduce((s,[r,c])=>s+mu(27*(r-1)+c),0);
const S=2,outer=1;
assert.ok(S>=0 && S<7);  // published direct/+1 mode
const nextPhase=((1+mobiusSum)%3+3)%3;
const leftmost=secondCells[0];
const n90=27*(leftmost[1]-1)+28-leftmost[0];
const nextOuter=((outer+mu(n90))%2+2)%2;
const signatures=[[[0,0,0],[1,1,1]],[[0,1,0],[1,-1,1]],[[0,-1,0],[1,0,1]]];
const required=signatures[nextPhase][nextOuter];
assert.deepEqual({mobiusSum,n90,nextPhase,nextOuter,required},
 {mobiusSum:-1,n90:365,nextPhase:0,nextOuter:0,required:[0,0,0]});
// The tempting source-node carry uses last glyph of previous cipher block.
const thirdNode=source.slice(368,371);
assert.equal(gp(thirdNode),'E A G');
const thirdTransformed=[thirdNode[0],phi(thirdNode[1]),thirdNode[2]];
assert.equal(gp(thirdTransformed),'E H G');
for(const key of [thirdNode,thirdTransformed]){
 assert.deepEqual(sig(key),[1,0,-1]);
 assert.notDeepEqual(sig(key),required);
}
// Published nonlocal alternative passes the same signature but has an extra selector.
const alternate=[at(4,23),at(14,23),at(24,23)];
assert.equal(gp(alternate),'H NG C');
assert.deepEqual(sig(alternate),required);
const thirdCipher=Array.from({length:5},(_,j)=>at(14-j,19));
const alternativePlain=thirdCipher.map((v,i)=>field(v-alternate[i%3]));
assert.equal(gp(alternativePlain),'T U R N S');
console.log(JSON.stringify({
 classification:'conditional opening fit and falsified simple third-node carry; no authenticated LP2 plaintext',
 first:'AS I GO THE',second:'WEATHER',boundaryAfterHeading:'TH',
 block2:{start:[14,14],keyCenter:[14,5],length:5},
 successorForecast:{mobiusSum,n90,nextPhase,nextOuter,requiredSignature:required},
 simpleCarry:{positions:[368,369,370],source:gp(thirdNode),centerTotient:gp(thirdTransformed),signature:sig(thirdNode),passes:false},
 publishedAlternative:{source:gp(alternate),signature:sig(alternate),conditionalOutput:gp(alternativePlain)}
},null,2));
