'use strict';
/**
 * First genuinely prospective block after the public 38-block 27x27 route.
 *
 * Applies every applicable published Report 00-15 rule to original LP2 p0-2
 * after selected block 38 ("I ASK"), independently of any proposed word 39.
 * This enumerator is a constraint and ambiguity study, not a plaintext claim.
 * Usage: node sims/route27_unseen_nextblock.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(grid.length, 729);
const n0 = ([r, c]) => 27 * (r - 1) + c;
const n1 = ([r, c]) => 27 * (c - 1) + 28 - r;
const n2 = x => 730 - n0(x);
const n3 = x => 730 - n1(x);
const at = x => grid[n0(x) - 1];
const mod = (a, n) => (a % n + n) % n;
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const mobius = Array(1600).fill(1);
const phi = Array(29).fill(0);
mobius[0] = 0;
for (let x = 2; x < mobius.length; x++) {
  let n = x, sign = 1;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    n /= p;
    sign = -sign;
    if (n % p === 0) { sign = 0; break; }
    while (n % p === 0) n /= p;
  }
  if (sign && n > 1) sign = -sign;
  mobius[x] = sign;
}
for (let n = 1; n < 29; n++) {
  for (let k = 1; k <= n; k++) if (gcd(n, k) === 1) phi[n]++;
}
const mu = n => mobius[n];
const leftmost = cells => cells.reduce((a, b) =>
  a[1] < b[1] || (a[1] === b[1] && a[0] > b[0]) ? a : b);
const GP = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,
  53,59,61,67,71,73,79,83,89,97,101,103,107,109];

/** All source geometry is fixed by the published selected block 38. */
const current = {
  cipher: [[5,17], [6,17], [7,17], [8,17]],
  source: [[11,13], [12,13], [13,13]],
  phase: 0,
  S: 32,
  outerSignature: 0,
};
assert.deepEqual(current.cipher.map(at), [26,14,14,21]);
assert.deepEqual(current.source.map(at), [16,19,28]);

/** Return the fully frozen prospective forecasts from Reports 01-15. */
function forecast() {
  const C = current.cipher, N = current.source;
  const B = C[0], E = C[C.length - 1], L = leftmost(C);
  const M = N[1], Z = N.reduce((a,b) =>
    b[0] > a[0] || (b[0] === a[0] && b[1] > a[1]) ? b : a);
  const cycle = Math.floor(current.S / 7) % 4;
  const reflected = cycle === 1 || cycle === 2;
  const offset = cycle === 0 || cycle === 2 ? 1 : 0;
  const phase = mod(offset + C.reduce((sum,p) =>
    sum + mu(reflected ? n2(p) : n0(p)), 0), 3);
  assert.ok(!(phase === 2 && current.S % 7 === 6));
  const outer = mod(current.outerSignature + mu(n1(L)), 2);
  const signatures = [
    [[0,0,0],[1,1,1]],
    [[0,1,0],[1,-1,1]],
    [[0,-1,0],[1,0,1]]
  ];
  const signature = signatures[phase][outer];
  const axisScore = mu(n2(B) + n0(M)) + mu(gcd(n1(E), n2(E)));
  const cipherAxis = axisScore < 0 ? 'diagonal' :
    axisScore > 0 ? 'vertical' : 'horizontal';
  const boundary = mod(mu(n3(E)) + phi[at(M)], 2);
  const centerRow = mod(1 + B[1] + E[0] + M[0] + mu(n2(B)), 2);
  const centerColumn = mod(1 + B[0] + E[0] + M[0], 2);
  const endpointRow = mod(1 + current.phase + mu(n2(M)), 2);
  const leftmostRow = mod(centerRow + 1 + current.phase + mu(M[0]), 2);
  const mirrorCurrent = Number(at(N[0]) === at(N[2]));
  const leftmostColumn = mod(B[0] + C.reduce((sum,p) =>
    sum + mu(n1(p)), 0) + mirrorCurrent + mu(n2(M)), 2);
  const radiusMirror = Math.max(Math.abs(Z[0] - L[0]),
    Math.abs(Z[1] - L[1])) % 3 !== 2;
  const group = Number((mu(n1(M) + n2(Z)) < 0) ===
    (mu(n1(L) + n2(Z)) < 0));
  const delta = Number(mu(gcd(n1(M),n3(Z))) < 0) ^
    Number(mu(N.map(v => GP[at(v)]).reduce((a,b)=>a+b,0)) > 0) ^
    Number(mu(n0(M)+n3(Z)) !== 0);
  const sourceAxis = 2 * group + delta;
  const sourceRadiusParity = mod(M[0]+M[1]+B[0]+B[1],2) ^
    Number(mu(gcd(n2(Z),n2(L))) < 0) ^
    Number(mu(n1(B)+n1(E)) > 0);
  const q = Number(mu(n0(E)) === 0 && mu(n3(E)) === 0);
  const z = Number(mu(n0(B)) === 0 && mu(n1(B)) === 0);
  return {
    phase, outer, signature, cipherAxis, boundary,
    centerRow, centerColumn, endpointRow, leftmostRow,
    leftmostColumn, mirror: Number(radiusMirror),
    sourceAxis, sourceRadiusParity, rayOffset: q * (1 - z),
    modeReflectedAfter: Math.floor((current.S + phase) / 7) % 4 === 1 ||
      Math.floor((current.S + phase) / 7) % 4 === 2,
    S_after: current.S + phase
  };
}
/** Enumerate all allowed original source triples, including both orders. */
function sources(f) {
  assert.equal(f.sourceAxis, 0); // block 39 predicts horizontal.
  const out = [];
  for (let r = 1; r <= 27; r++)
    for (let c = 1; c <= 27; c++) {
      if (r % 2 !== f.centerRow || c % 2 !== f.centerColumn) continue;
      for (let radius = 1; radius <= 13; radius++) {
        if (radius % 2 !== f.sourceRadiusParity ||
            c - radius < 1 || c + radius > 27) continue;
        for (const reversed of [false, true]) {
          const source = [
            [r,c + (reversed ? radius : -radius)],
            [r,c], [r,c + (reversed ? -radius : radius)]
          ];
          const raw = source.map(at);
          if (Number(raw[0] === raw[2]) !== f.mirror) continue;
          for (const transformed of [false,true]) {
            const key = [raw[0],transformed ? phi[raw[1]] : raw[1],raw[2]];
            if (key.some(v => v < 1)) continue;
            const signature = key.map(v => mu(phi[v]));
            if (signature.some((v,i) => v !== f.signature[i])) continue;
            const phase = mod(signature.reduce((a,b)=>a+b,0),3);
            assert.equal(phase,f.phase);
            out.push({source,raw,key,aligned:key.slice(phase).concat(key.slice(0,phase)),
              transformed,reversed,radius});
          }
        }
      }
    }
  return out;
}
const d8 = (p,q) => {
  const dr=Math.abs(p[0]-q[0]), dc=Math.abs(p[1]-q[1]);
  return Math.min(dr,dc,Math.abs(dr-dc));
};
/** Enumerate all straight ciphertext runs, without looking for English. */
function ciphertextSegments(f) {
  assert.equal(f.cipherAxis, 'diagonal');
  const out=[], oldL=leftmost(current.cipher);
  for (let row=1;row<=27;row++) for(let col=1;col<=27;col++) {
    const B=[row,col];
    if (d8(oldL,B)!==f.rayOffset) continue;
    if (mu(n1(B)) !== 0 && (f.modeReflectedAfter ?
      mu(n1(B)) !== -1 : mu(n1(B)) !== 1)) continue;
    for (const up of [-1,1]) {
      for (let len=2;len<=27;len++) {
        const E=[row+up*(len-1),col+len-1];
        if (E[0]<1||E[0]>27||E[1]>27) break;
        const C=Array.from({length:len},(_,i)=>[row+up*i,col+i]);
        const L=leftmost(C);
        const tau=Number(B[0]===L[0]&&B[1]===L[1]);
        if(tau!==f.boundary || E[0]%2!==f.endpointRow ||
           L[0]%2!==f.leftmostRow || L[1]%2!==f.leftmostColumn) continue;
        out.push(C);
      }
    }
  }
  return out;
}
function gcdCompatible(center,C) {
  const B=C[0], E=C[C.length-1],L=leftmost(C);
  return [
    gcd(n0(center),n0(B)),
    gcd(n0(center),n0(L)),
    gcd(n1(center),n3(E)),
    gcd(n0(center),n2(E))
  ].every(x=>mu(x)!==0);
}
/** Encode a word under source-native GP ambiguities; capped by token count. */
function spellings(english) {
  const multi={TH:2,ING:21,NG:21,EA:28,EO:12,OE:22,IA:27};
  const single={F:0,U:1,V:1,O:3,R:4,C:5,K:5,Q:5,G:6,
    W:7,H:8,N:9,I:10,J:11,P:13,X:14,S:15,Z:15,T:16,
    B:17,E:18,M:19,L:20,D:23,A:24,Y:26};
  const out=[];
  function walk(i,seq) {
    if(out.length>25)return;
    if(i===english.length) {out.push(seq.join(','));return;}
    for(const [token,value] of Object.entries(multi))
      if(english.startsWith(token,i))walk(i+token.length,[...seq,value]);
    if(single[english[i]]!==undefined)
      walk(i+1,[...seq,single[english[i]]]);
  }
  walk(0,[]);
  return out;
}
function dictionary() {
  const words = new Map();
  for(const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
    const match=/^([a-z]+)\s+(\d+)$/.exec(line);
    if(!match)continue;
    const [,word,frequency]=match;
    if(word.length>13 || Number(frequency)<2)continue;
    for(const code of spellings(word.toUpperCase())) {
      const old=words.get(code);
      if(!old || Number(frequency)>old.frequency)
        words.set(code,{word,frequency:Number(frequency)});
    }
  }
  return words;
}
function main() {
  const f=forecast();
  assert.deepEqual([f.phase,f.outer,f.signature,f.cipherAxis,
    f.boundary,f.sourceAxis,f.sourceRadiusParity,f.rayOffset,f.S_after],
    [1,0,[0,1,0],'diagonal',1,0,0,0,33]);
  const keys=sources(f),segments=ciphertextSegments(f),lexicon=dictionary();
  const byLength=new Map(),words=new Map();
  let pairs=0,lexiconMatches=0;
  const witness={};
  for(const C of segments) {
    const ciphertext=C.map(at);
    for(const key of keys) {
      if(!gcdCompatible(key.source[1],C))continue;
      pairs++;
      byLength.set(C.length,(byLength.get(C.length)||0)+1);
      const indices=ciphertext.map((v,i)=>mod(v-key.aligned[i%3],29));
      assert.ok(indices.every((v,i)=>mod(v+key.aligned[i%3],29)===ciphertext[i]));
      const word=lexicon.get(indices.join(','));
      if(!word)continue;
      lexiconMatches++;
      const record={word:word.word,frequency:word.frequency,
        start:C[0],end:C[C.length-1],keyCenter:key.source[1],
        radius:key.radius,sourceRough:key.raw,
        centerTotient:key.transformed,sourceReversed:key.reversed,
        alignedKey:key.aligned,ciphertext,plaintext:indices};
      if(!words.has(word.word))words.set(word.word,[]);
      words.get(word.word).push(record);
      for(const target of ['had','who','how','our','war','die','the'])
        if(record.word===target&&!witness[target])witness[target]=record;
    }
  }
  const top=[...words].map(([word,matches])=>({
    word,frequency:matches[0].frequency,count:matches.length
  })).sort((a,b)=>b.frequency-a.frequency).slice(0,30);
  const result={status:'Prospective route: no authenticated plaintext or unique block 39',
    input:'Original GP ciphertext p0-p2 and block38 frozen geometry',
    forecast:f,sourceCandidates:keys.length,ciphertextSegments:segments.length,
    admissibleSourceCipherPairs:pairs,byLength:Object.fromEntries(byLength),
    GPdictionaryTypes:words.size,GPdictionaryAssignments:lexiconMatches,
    top,witness};
  assert.equal(keys.length,172);
  assert.equal(segments.length,132);
  assert.equal(pairs,21818);
  assert.equal(words.size,101);
  assert.equal(lexiconMatches,122);
  assert.ok(['had','who','how','our'].every(x=>witness[x]));
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main===module)main();
module.exports={forecast,sources,ciphertextSegments,gcdCompatible,spellings,main};
