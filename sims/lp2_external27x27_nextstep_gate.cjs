"use strict";
/**
 * Frozen original-cipher next-step challenge for the published 27x27 route.
 *
 * Independent source: 2retooz270703's 38-block public LP2 p0-p2 route,
 * https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
 *
 * Reimplements Reports 00-16 as necessary constraints on a successor to
 * block 38 ("I ASK"), rather than presuming that selected route is authentic.
 * Enumerates all admissible original source nodes and contiguous ciphertext
 * paths under the externally published rules. Counts different complete
 * English words, using this repo's preexisting Shakespeare GP control.
 *
 * SFT for Node.js 22 on Windows 11:
 * node sims/lp2_external27x27_nextstep_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(path.join(ROOT,
  "resources", "control", "shakespeare_first300k.txt"), "utf8");
const grid = source.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.equal(grid.length, 729);

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n, x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}

/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = 1, x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    x /= p;
    result = -result;
    if (x % p === 0) return 0;
    while (x % p === 0) x /= p;
  }
  return x > 1 ? -result : result;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b) {
  while (b) [a,b] = [b,a % b];
  return a;
}

/** @param {number[]} c @returns {number} */
function n0(c) { return 27 * (c[0] - 1) + c[1]; }
/** @param {number[]} c @returns {number} */
function n1(c) { return 27 * (c[1] - 1) + 28 - c[0]; }
/** @param {number[]} c @returns {number} */
function n2(c) { return 730 - n0(c); }
/** @param {number[]} c @returns {number} */
function n3(c) { return 730 - n1(c); }
/** @param {number[]} c @returns {number} */
function glyph(c) { return grid[n0(c) - 1]; }
/** @param {number} x @returns {number} */
function mod29(x) { return (x % 29 + 29) % 29; }

const current = {
  source:[[11,13],[12,13],[13,13]], sourceRunes:[16,19,28],
  cipher:[[5,17],[6,17],[7,17],[8,17]], phase:0, S:32, outer:0
};

/**
 * All forecasts refer to the previous block, as the external method states.
 * This is not a separate fit to the unknown following plaintext.
 * @returns {object}
 */
function forecast() {
  const C=current.cipher, B=C[0], E=C[C.length-1];
  const M=current.source[1], Z=current.source[2], L=[8,17];
  const mode=Math.floor(current.S/7)%4;
  assert.equal(mode,0);
  const phase=mod29(1+C.reduce((sum,cell)=>sum+mu(n0(cell)),0))%3;
  const outer=(current.outer+mu(n1(L))+4)%2;
  const signatures=[
    [[0,0,0],[1,1,1]],
    [[0,1,0],[1,-1,1]],
    [[0,-1,0],[1,0,1]]
  ];
  const boundary=mod29(mu(n3(E))+phi(current.sourceRunes[1]))%2;
  const axisValue=mu(n2(B)+n0(M))+mu(gcd(n1(E),n2(E)));
  const axis=axisValue===0?"horizontal":axisValue>0?"vertical":"diagonal";
  const centerRow=mod29(1+B[1]+E[0]+M[0]+mu(n2(B)))%2;
  const centerCol=(1+B[0]+E[0]+M[0])%2;
  const endpointRow=mod29(1+current.phase+mu(n2(M)))%2;
  const leftmostRow=mod29(centerRow+1+current.phase+mu(M[0]))%2;
  const mirrorBit=0;
  const centerMu=mu(n2(M));
  const leftmostCol=mod29(B[0]+C.reduce((v,c)=>v+mu(n1(c)),0)+
    mirrorBit+centerMu)%2;
  const q=+(mu(n0(E))===0&&mu(n3(E))===0);
  const z=+(mu(n0(B))===0&&mu(n1(B))===0);
  const exactRayOffset=q*(1-z);
  const cheb=Math.max(Math.abs(Z[0]-L[0]),Math.abs(Z[1]-L[1]));
  const mirror=cheb%3!==2;
  const b=+((mu(n1(M)+n2(Z))<0)===(mu(n1(L)+n2(Z))<0));
  const T=current.sourceRunes.reduce((s,r)=>s+source.prime[r],0);
  const d=+(mu(gcd(n1(M),n3(Z)))<0) ^
    +(mu(T)>0) ^ +(mu(n0(M)+n3(Z))!==0);
  const sourceAxis=2*b+d;
  const radiusParity=((M[0]+M[1]+B[0]+B[1])%2) ^
    +(mu(gcd(n2(Z),n2(L)))<0) ^
    +(mu(n1(B)+n1(E))>0);
  return {phase,signature:signatures[phase][outer],
    S:current.S+phase,outer,boundary,axis,
    sourceCenterParity:[centerRow,centerCol],
    endpointRow,leftmostParity:[leftmostRow,leftmostCol],
    exactRayOffset,mirror,sourceAxis,radiusParity};
}

/** @returns {object[]} */
function sourceCandidates(rule) {
  const found=[];
  assert.equal(rule.sourceAxis,0); // horizontal
  for(let r=2;r<=26;r+=2)
    for(let col=2;col<=26;col+=2)
      for(let radius=2;radius<=12;radius+=2) {
        if(col-radius<1||col+radius>27)continue;
        const center=[r,col], left=[r,col-radius],right=[r,col+radius];
        const raw=[glyph(left),glyph(center),glyph(right)];
        if(raw[0]===raw[2]||raw.some(v=>v===0))continue;
        for(const transformed of [false,true]) {
          for(const reverse of [false,true]) {
            const initial=reverse?[raw[2],raw[1],raw[0]]:raw.slice();
            const key=initial.slice();
            if(transformed)key[1]=phi(key[1]);
            if(key.some(v=>v===0))continue;
            const signature=key.map(v=>mu(phi(v)));
            if(!signature.every((x,j)=>x===rule.signature[j]))continue;
            const aligned=key.slice(rule.phase).concat(key.slice(0,rule.phase));
            found.push({center,radius,transformed,reverse,
              initial,key,aligned});
          }
        }
      }
  return found;
}

/** @returns {object[]} */
function ciphertextCandidates(rule) {
  assert.equal(rule.axis,"diagonal");
  assert.equal(rule.boundary,1); // leftmost must be beginning
  const found=[],L=[8,17];
  for(let r=1;r<=27;r++)for(let col=1;col<=27;col++) {
    const B=[r,col];
    if(r%2!==rule.leftmostParity[0]||
       col%2!==rule.leftmostParity[1])continue;
    const dr=Math.abs(r-L[0]),dc=Math.abs(col-L[1]);
    const d8=Math.min(dr,dc,Math.abs(dr-dc));
    if(d8!==rule.exactRayOffset)continue;
    if((rule.S>=28&&Math.floor(rule.S/7)%4===0)&&mu(n1(B))<0)
      continue;
    for(const slope of [-1,1]){
      const path=[B];
      for(let offset=1;offset<=26;offset++) {
        const rr=r+slope*offset,cc=col+offset;
        if(rr<1||rr>27||cc>27)break;
        path.push([rr,cc]);
        if(path.length<2)continue;
        const E=path[path.length-1];
        if(E[0]%2!==rule.endpointRow)continue;
        found.push({B,E,slope,length:path.length,
          values:path.map(glyph),cells:path.slice()});
      }
    }
  }
  return found;
}

/** @param {string} word @returns {number[]|null} */
function encodeWord(word) {
  const tokens=source.translit.map((t,i)=>[t,i])
    .sort((a,b)=>b[0].length-a[0].length);
  const value=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let pos=0;pos<value.length;){
    const match=tokens.find(([token])=>value.startsWith(token,pos));
    if(!match)return null;
    out.push(match[1]);
    pos+=match[0].length;
  }
  return out;
}

/** @returns {Map<string,{word:string,count:number}>} */
function englishDictionary() {
  const result=new Map();
  for(const token of english.match(/[A-Za-z]+/g)||[]){
    const seq=encodeWord(token);
    if(!seq||![3,5,7,9].includes(seq.length))continue;
    const key=seq.join(",");
    const item=result.get(key)||{word:token.toUpperCase(),count:0};
    item.count++;
    result.set(key,item);
  }
  return result;
}

/** @returns {object} */
function run() {
  const rule=forecast();
  assert.deepEqual(rule,{phase:1,signature:[0,1,0],
    S:33,outer:0,boundary:1,axis:"diagonal",
    sourceCenterParity:[0,0],endpointRow:1,
    leftmostParity:[1,0],exactRayOffset:0,
    mirror:false,sourceAxis:0,radiusParity:0});
  assert.ok(!(rule.phase===2&&current.S%7===6));
  const nodes=sourceCandidates(rule);
  const paths=ciphertextCandidates(rule);
  const dictionary=englishDictionary();
  let afterGcd=0,allHits=0;
  const words=new Map(),examples=[];
  for(const node of nodes)for(const span of paths) {
    const M=node.center,B=span.B,E=span.E;
    if([gcd(n0(M),n0(B)),gcd(n0(M),n0(B)),
        gcd(n1(M),n3(E)),gcd(n0(M),n2(E))]
      .some(v=>mu(v)===0))continue;
    afterGcd++;
    const plain=span.values.map((cipher,i)=>
      mod29(cipher-node.aligned[i%3]));
    const match=dictionary.get(plain.join(","));
    if(!match)continue;
    allHits++;
    const count=words.get(match.word)||0;
    words.set(match.word,count+1);
    assert.deepEqual(plain.map((p,i)=>
      mod29(p+node.aligned[i%3])),span.values);
    if(examples.length<150)examples.push({
      word:match.word,center:node.center,radius:node.radius,
      transform:node.transformed,reverse:node.reverse,
      start:B,end:E,sourceKey:node.initial,
      alignedKey:node.aligned});
  }
  assert.equal(nodes.length,172);
  assert.equal(paths.length,132);
  assert.equal(afterGcd,21818);
  assert.equal(allHits,60);
  assert.equal(words.size,52);
  for(const item of ["OUR","HOW","DIE","EARTH","HAD"])
    assert.ok(words.has(item),item);
  const ranking=[...words.entries()]
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const summary={originalPageSet:"LP2 physical p0-p2 = 729 runes",
    externalRoute:"Published block38 I ASK (not authenticated plaintext)",
    reports:"2retooz270703 Reports 00-16",
    next:rule,sourceNodeAssignments:nodes.length,
    ciphertextPaths:paths.length,
    totalSourcePathAssignments:nodes.length*paths.length,
    afterSquarefreeGcdAssignments:afterGcd,
    ShakespeareGPdictionaryTypes:dictionary.size,
    completeSingleWordAssignments:allHits,
    distinctPossibleWords:words.size,
    topWords:ranking.slice(0,20),
    witnessWords:examples.filter(x=>["OUR","HOW","DIE","EARTH"]
      .includes(x.word)).slice(0,12),
    conclusion:"The published constraints do not determine a unique " +
      "39th text block; original ciphertext supports many distinct " +
      "complete English words. No authentic plaintext recovered."};
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={run,forecast,sourceCandidates,ciphertextCandidates,
  englishDictionary,encodeWord};
