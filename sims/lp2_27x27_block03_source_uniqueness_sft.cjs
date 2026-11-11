"use strict";
/**
 * Single-file test (Node 22, CommonJS). Source-only uniqueness decision for
 * the published LP2 27x27 block03; no plaintext wordlist or language tuning.
 *
 * Recompute Reports 01, 03-07, 09-10, 12-15 from the original selected
 * block02, then exhaust complete admissible block03 original nodes/paths.
 * The predecessor is an unverified, externally selected candidate; passing
 * its own rules does NOT authenticate the candidate as Cicada plaintext.
 *
 * Source: original GP29 indices, physical pp0-2, in the canonical corpus.
 * Report rules: https://github.com/2retooz270703/
 * Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const book = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const cipher = book.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.deepEqual(book.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(cipher.length, 729);
const mod = (x, n) => (x % n + n) % n;
/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let x = n, v = n;
  for (let p = 2; p * p <= x; p++) if (x % p === 0) {
    v -= v / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) v -= v / x;
  return v;
}
/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let x = n, s = 1;
  for (let p = 2; p * p <= x; p++) if (x % p === 0) {
    x /= p; s = -s;
    if (x % p === 0) return 0;
  }
  return x > 1 ? -s : s;
}
/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b) { while (b) [a,b] = [b,a%b]; return a; }
const n0 = ([r,c]) => 27 * (r-1) + c;
const n1 = ([r,c]) => 27 * (c-1) + 28-r;
const n2 = p => 730-n0(p);
const n3 = p => 730-n1(p);
const flat = p => n0(p)-1;
const at = p => cipher[flat(p)];
const spell = a => a.map(v => book.translit[v]).join("-");
const signature = a => a.map(v => mu(phi(v)));
const leftmost = cells => cells.reduce((a,b) =>
  b[1] < a[1] || (b[1] === a[1] && b[0] > a[0]) ? b : a);
const deviation = (a,b) => {
  const dr = Math.abs(a[0]-b[0]), dc = Math.abs(a[1]-b[1]);
  return Math.min(dr, dc, Math.abs(dr-dc));
};
const decoded = (cells,key) => cells.map((p,j) => mod(at(p)-key[j%3],29));
/** @param {number[]} key @param {number[]} plaintext @returns {number[]} */
const encrypted = (key,plaintext) => plaintext.map((p,j) => mod(p+key[j%3],29));

/* Establish the predecessor from the unchanged original 729-rune source. */
const p0Node = cipher.slice(334,337);
const p0Key = [p0Node[0],phi(p0Node[1]),p0Node[2]];
assert.equal(spell(p0Node), "AE-J-EA");
assert.equal(spell(decoded([[13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4]],p0Key)), "A-S-I-G-O-TH-E");
const currentNode = [[14,4],[14,5],[14,6]];
const originalKey = currentNode.map(at), transformedKey =
  [originalKey[0],phi(originalKey[1]),originalKey[2]];
assert.equal(spell(originalKey),"X-OE-X");
assert.equal(spell(transformedKey),"X-I-X");
const phase = mod(signature(transformedKey).reduce((a,b) => a+b,0),3);
assert.equal(phase,2);
const currentKey = transformedKey.slice(phase).concat(transformedKey.slice(0,phase));
assert.equal(spell(currentKey),"X-X-I");
const currentCipher = [[14,14],[14,15],[14,16],[14,17],[14,18]];
assert.equal(spell(decoded(currentCipher,currentKey)),"W-EA-TH-E-R");

const B=currentCipher[0],E=currentCipher.at(-1),L=leftmost(currentCipher);
const M=currentNode[1],Z=currentNode[2];
const mirror=Number(originalKey[0]===originalKey[2]);
const prevOuter=1, prevS=2;

/* Report 01: next signature, phase, outer state. */
const sum0=currentCipher.reduce((s,p)=>s+mu(n0(p)),0);
const nextPhase=mod(1+sum0,3);
const nextOuter=mod(prevOuter+mu(n1(L)),2);
const expectedSig=[0,0,0];
assert.deepEqual([sum0,nextPhase,nextOuter],[-1,0,0]);
assert.equal(prevS%7===6 && nextPhase===2,false);

/* Report 03: next ciphertext axis and leftmost-first boundary. */
const A3=n2(B)+n0(M),G3=gcd(n1(E),n2(E));
const axisScore=mu(A3)+mu(G3);
const leftmostFirst=mod(mu(n3(E))+phi(originalKey[1]),2)===1;
assert.deepEqual([A3,G3,axisScore,leftmostFirst],[721,1,2,true]);

/* Reports 04 and 05: next source-center and ciphertext-row parities. */
const keyRow=mod(1+B[1]+E[0]+M[0]+mu(n2(B)),2);
const keyCol=mod(1+B[0]+E[0]+M[0],2);
const endRow=mod(1+phase+mu(n2(M)),2);
const leftRow=mod(keyRow+1+phase+mu(M[0]),2);
assert.deepEqual([keyRow,keyCol,endRow,leftRow],[0,1,0,0]);

/* Reports 06 and 12: exact eight-ray deviation from current leftmost. */
const allowance=Number(mu(n0(E))===0 && mu(n3(E))===0);
const beginBit=Number(mu(n0(B))===0 && mu(n1(B))===0);
const exactDeviation=allowance*(1-beginBit);
assert.equal(exactDeviation,0);

/* Report 07: next original node's mirror status. */
const distance=Math.max(Math.abs(Z[0]-L[0]),Math.abs(Z[1]-L[1]));
const nextMirror=distance%3!==2;
assert.deepEqual([distance,nextMirror],[8,false]);

/* Report 09: IMPORTANT phase=2 selects mu(n0(M)), not mu(n2(M)). */
const sum90=currentCipher.reduce((s,p)=>s+mu(n1(p)),0);
const centerTerm=mu([n2(M),n3(M),n0(M)][phase]);
const leftCol=mod(B[0]+sum90+mirror+centerTerm,2);
assert.deepEqual([sum90,centerTerm,leftCol],[2,0,1]);

/* Reports 13-14: exact undirected source axis. */
const X=n1(M)+n2(Z),Y=n1(L)+n2(Z);
const group=Number((mu(X)<0)===(mu(Y)<0));
const G14=gcd(n1(M),n3(Z));
const T14=originalKey.reduce((s,i)=>s+book.prime[i],0);
const A14=n0(M)+n3(Z);
const diagonalBit=Number(mu(G14)<0)^Number(mu(T14)>0)^Number(mu(A14)!==0);
const sourceAxis=2*group+diagonalBit;
assert.deepEqual([X,Y,group,T14,sourceAxis],[495,738,1,177,2]);

/* Report 15: next source's radius parity. */
const a=(Math.abs(M[0]-B[0])+Math.abs(M[1]-B[1]))%2;
const g=gcd(n2(Z),n2(L));
const b=Number(mu(g)<0),s=n1(B)+n1(E),cc=Number(mu(s)>0);
const radiusParity=a^b^cc;
assert.equal(radiusParity,0);

/* Report 10: four squarefree GCD gates on a proposed source center and path. */
function report10(center,cells) {
  const start=cells[0],end=cells.at(-1),left=leftmost(cells);
  return [
    gcd(n0(center),n0(start)),
    gcd(n0(center),n0(left)),
    gcd(n1(center),n3(end)),
    gcd(n0(center),n2(end)),
  ].every(v=>mu(v)!==0);
}

/*
 * Source-only enumeration: all vertical three-cell original nodes with
 * center parity, even radius, nonmatching outers, optional center totient,
 * and required next-key signature/phase; no word or rune-language tests.
 */
const nodes=[];
for(let row=1;row<=27;row++)for(let column=1;column<=27;column++) {
  if(row%2!==keyRow || column%2!==keyCol)continue;
  for(let radius=1;radius<=13;radius++) {
    if(radius%2!==radiusParity || row-radius<1 || row+radius>27)continue;
    const geometry=[[row-radius,column],[row,column],[row+radius,column]];
    const original=geometry.map(at);
    if(original.includes(0)||Number(original[0]===original[2])!==Number(nextMirror))continue;
    for(const transformCenter of [false,true]) {
      const key=original.slice();
      if(transformCenter)key[1]=phi(key[1]);
      if(key.includes(0))continue;
      if(signature(key).join(",")!==expectedSig.join(","))continue;
      const canonicalPhase=mod(signature(key).reduce((x,y)=>x+y,0),3);
      if(canonicalPhase!==nextPhase)continue;
      const aligned=key.slice(canonicalPhase).concat(key.slice(0,canonicalPhase));
      nodes.push({geometry,original,key,aligned,center:[row,column],radius,transformCenter});
    }
  }
}

/*
 * Enumerate all vertical paths in leftmost-first (bottommost-first) order.
 * Reports 03, 05, 06/12, 09 constrain beginning, endpoint, and ray.
 * The published Report 16 assumes complete words of >=2 runes; no
 * unprovided word boundaries/English vocabulary constrain their lengths.
 */
const paths=[];
for(let row=1;row<=27;row++)for(let column=1;column<=27;column++) {
  const start=[row,column];
  if(row%2!==leftRow || column%2!==leftCol || deviation(L,start)!==exactDeviation)continue;
  for(let len=2;len<=row;len++) {
    const cells=Array.from({length:len},(_,i)=>[row-i,column]);
    if(cells.at(-1)[0]%2!==endRow)continue;
    paths.push({start,len,cells});
  }
}
assert.equal(nodes.length,129);
assert.equal(new Set(nodes.map(n=>n.geometry.map(flat).join(","))).size,86);
assert.equal(paths.length,84);
assert.equal(new Set(paths.map(p=>p.start.join(","))).size,14);
assert.ok(paths.every(p=>p.start[0]===14 && p.start[1]%2===1));
assert.deepEqual([...new Set(paths.map(p=>p.len))].sort((a,b)=>a-b),[3,5,7,9,11,13]);

let assignments=0;
const usedNodes=new Set(),usedPaths=new Set();
const byLength={};
for(let i=0;i<nodes.length;i++)for(let j=0;j<paths.length;j++) {
  if(!report10(nodes[i].center,paths[j].cells))continue;
  assignments++;
  usedNodes.add(i);usedPaths.add(j);
  byLength[paths[j].len]=(byLength[paths[j].len]||0)+1;
}
assert.equal(assignments,4108);
assert.equal(usedNodes.size,129);
assert.equal(usedPaths.size,63);
assert.deepEqual(byLength,{"3":859,"5":510,"7":859,"9":513,"11":857,"13":510});

/* Independent restriction: grant the external route its exact path and length. */
const alleged=[[14,19],[13,19],[12,19],[11,19],[10,19]];
assert.deepEqual(alleged.map(flat),[369,342,315,288,261]);
const fixedPathKeys=nodes.filter(n=>report10(n.center,alleged));
assert.equal(fixedPathKeys.length,64);
assert.equal(new Set(fixedPathKeys.map(n=>n.geometry.map(flat).join(","))).size,40);
const published=fixedPathKeys.filter(n=>n.center[0]===14 &&
  n.center[1]===23 && n.radius===10 && spell(n.original)==="H-NG-C");
assert.equal(published.length,2);
assert.deepEqual(published.map(n=>n.transformCenter),[false,true]);
const outputs=published.map(n=>spell(decoded(alleged,n.aligned)));
assert.deepEqual(outputs,["T-U-R-N-S","T-I-R-N-A"]);
for(const node of published) {
  const plain=decoded(alleged,node.aligned);
  assert.deepEqual(encrypted(node.aligned,plain),alleged.map(at));
}
/* No downstream unique transform can be inferred from unchanged source. */
console.log(JSON.stringify({
  classification:"conditional third-block source-selector ambiguity; no authenticated LP2 plaintext",
  originalSource:"physical LP2 pp0-2, 729 original runes",
  assumedPredecessor:{sourceOriginal:spell(originalKey),
    sourceCenter:M,sourcePhase:phase,derivedKey:spell(currentKey),
    ciphertextIndices:currentCipher.map(flat),conditionalReading:"WEATHER"},
  frozenNextConstraints:{
    signature:expectedSig,phase:nextPhase,outer:nextOuter,
    ciphertextAxis:"vertical",leftmostFirst,
    sourceAxis:"vertical",sourceCenterParity:[keyRow,keyCol],
    sourceMirror:nextMirror,sourceRadiusParity:radiusParity,
    ciphertextEndpointRowParity:endRow,ciphertextLeftmostRowParity:leftRow,
    ciphertextLeftmostColParity:leftCol,exactRayDeviation:exactDeviation
  },
  originalEnumeration:{
    keyVariants:nodes.length,distinctSourceNodes:86,
    pathVariants:paths.length,starts:14,postGcdAssignments:assignments,
    retainedSourceVariants:usedNodes.size,retainedPaths:usedPaths.size,
    byLength
  },
  publishedPathGranted:{
    originalCipherPositions:alleged.map(flat),
    matchingKeyVariants:fixedPathKeys.length,distinctGeometricKeyNodes:40,
    rawNode:"H-NG-C",sourcePositions:published[0].geometry.map(flat),
    centerTotientAlternatives:outputs,
    bothForwardReencrypt:true
  },
  decision:"Reports 01-15 and actual image clue inventory select neither a unique exact source node nor a unique path/length; even granting both leaves a source-unselected center-totient choice."
},null,2));
