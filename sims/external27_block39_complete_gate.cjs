'use strict';
/**
 * Frozen continuation audit of the external 27 x 27 Liber Primus route.
 * Applies Reports 00-15 to the last published block 38, I ASK, with its
 * reported geometric and state inputs. Counts all surviving successor
 * source/key/cipher placements, independent of what their plaintext says.
 *
 * English-word segmentation is a separately labelled diagnostic built
 * from a fixed Shakespeare corpus, not a decryption oracle.
 *
 * Run on Node.js 22 (CommonJS): node sims/external27_block39_complete_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GRID = corpus.pages.slice(0, 3).flatMap(p => p.indices);
const LATIN = corpus.translit;
assert.equal(GRID.length, 729);
const first = [5, 17], final = [8, 17];
const node38 = [[11, 13], [12, 13], [13, 13]];
const cells38 = [first, [6, 17], [7, 17], final];
const original38 = [16, 19, 28];
const phase38 = 0, sum38 = 32, outer38 = 0;
const n0 = x => 27 * (x[0] - 1) + x[1];
const n90 = x => 27 * (x[1] - 1) + 28 - x[0];
const n180 = x => 730 - n0(x);
const n270 = x => 730 - n90(x);
const at = (grid, cell) => grid[n0(cell) - 1];
function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let s = 1;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      n /= p;
      s = -s;
      if (n % p === 0) return 0;
    }
  }
  return n > 1 ? -s : s;
}
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let out = n, x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      out -= out / p;
      while (x % p === 0) x /= p;
    }
  }
  if (x > 1) out -= out / x;
  return out;
}
function leftmost(cells) {
  return cells.reduce((a, b) => b[1] < a[1] ||
    (b[1] === a[1] && b[0] > a[0]) ? b : a);
}
function deviation(a, b) {
  const dr = Math.abs(a[0] - b[0]), dc = Math.abs(a[1] - b[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
}
function predict() {
  assert.deepEqual(cells38.map(x => at(GRID, x)), [26, 14, 14, 21]);
  assert.deepEqual(node38.map(x => at(GRID, x)), original38);
  const B = cells38[0], E = cells38.at(-1), M = node38[1];
  const L = leftmost(cells38), Z = node38[2];
  const q = Math.floor(sum38 / 7) % 4;
  const reflected = q === 1 || q === 2;
  const off = q === 0 || q === 2 ? 1 : 0;
  const phase = (off + cells38.reduce((s, x) =>
    s + mu(reflected ? n180(x) : n0(x)), 0) % 3 + 3) % 3;
  assert.ok(!(phase === 2 && sum38 % 7 === 6));
  const outer = (outer38 + mu(n90(L)) + 2) % 2;
  const signatureTable = [
    [[0, 0, 0], [1, 1, 1]],
    [[0, 1, 0], [1, -1, 1]],
    [[0, -1, 0], [1, 0, 1]]
  ];
  const axisScore = mu(n180(B) + n0(M)) +
    mu(gcd(n90(E), n180(E)));
  const axis = axisScore === 0 ? 'horizontal' :
    axisScore > 0 ? 'vertical' : 'diagonal';
  const tau = (mu(n270(E)) + phi(original38[1]) + 2) % 2;
  const centerRow = (1 + B[1] + E[0] + M[0] + mu(n180(B)) + 2) % 2;
  const centerCol = (1 + B[0] + E[0] + M[0]) % 2;
  const endRow = (1 + phase38 + mu(n180(M)) + 2) % 2;
  const leftRow = (centerRow + 1 + phase38 + mu(M[0]) + 2) % 2;
  const t = [mu(n180(M)), mu(n270(M)), mu(n0(M))][phase38];
  const leftCol = (B[0] + cells38.reduce((s, x) => s + mu(n90(x)), 0) +
    +(original38[0] === original38[2]) + t + 20) % 2;
  const ray = +(mu(n0(E)) === 0 && mu(n270(E)) === 0 &&
    !(mu(n0(B)) === 0 && mu(n90(B)) === 0));
  const dist = Math.max(Math.abs(Z[0] - L[0]), Math.abs(Z[1] - L[1]));
  const mirror = +(dist % 3 !== 2);
  const gp = corpus.prime;
  const group = +((mu(n90(M) + n180(Z)) < 0) ===
    (mu(n90(L) + n180(Z)) < 0));
  const bit = +(mu(gcd(n90(M), n270(Z))) < 0) ^
    +(mu(original38.reduce((s, v) => s + gp[v], 0)) > 0) ^
    +(mu(n0(M) + n270(Z)) !== 0);
  const sourceAxis = 2 * group + bit;
  const radiusParity = ((M[0] + M[1] + B[0] + B[1]) % 2) ^
    +(mu(gcd(n180(Z), n180(L))) < 0) ^
    +(mu(n90(B) + n90(E)) > 0);
  return {phase, outer, signature:signatureTable[phase][outer],
    sum:sum38 + phase, axis, tau, centerRow, centerCol, endRow,
    leftRow, leftCol, ray, mirror, sourceAxis, radiusParity,
    leftmost:L};
}
const forecast = predict();
assert.deepEqual(forecast.signature, [0, 1, 0]);
assert.equal(forecast.axis, 'diagonal');
assert.equal(forecast.sourceAxis, 0);
assert.equal(forecast.tau, 1);
const directions = [[0, 1], [1, 1], [1, 0], [1, -1]];
function sources(grid) {
  const out = [];
  const [dr, dc] = directions[forecast.sourceAxis];
  for (let r = 1; r <= 27; r++) for (let c = 1; c <= 27; c++) {
    if (r % 2 !== forecast.centerRow || c % 2 !== forecast.centerCol) continue;
    for (let radius = 1; radius <= 13; radius++) {
      if (radius % 2 !== forecast.radiusParity) continue;
      const lo = [r - dr * radius, c - dc * radius];
      const hi = [r + dr * radius, c + dc * radius];
      if ([...lo, ...hi].some(v => v < 1 || v > 27)) continue;
      const original = [at(grid, lo), at(grid, [r, c]), at(grid, hi)];
      if (original.some(v => v === 0)) continue;
      if (+ (original[0] === original[2]) !== forecast.mirror) continue;
      for (const transformed of [false, true]) {
        const key = [original[0],
          transformed ? phi(original[1]) : original[1], original[2]];
        if (key.map(k => mu(phi(k))).join(',') !== forecast.signature.join(',')) continue;
        out.push({center:[r,c],radius,original,key,transformed,
          cells:[lo,[r,c],hi]});
      }
    }
  }
  return out;
}
function ciphertextShapes() {
  const out = [];
  for (let r = 1; r <= 27; r++) for (let c = 1; c <= 27; c++) {
    const B = [r,c];
    if (deviation(forecast.leftmost, B) !== forecast.ray) continue;
    // The predicted boundary is leftmost-first. For a diagonal this means rightward.
    if (r % 2 !== forecast.leftRow || c % 2 !== forecast.leftCol) continue;
    if (forecast.axis !== 'diagonal' || forecast.tau !== 1) {
      throw Error('Specialized geometry enumerator requires predicted diagonal + tau=1.');
    }
    if ((Math.floor(forecast.sum / 7) % 4 < 2) ?
        ![0,1].includes(mu(n90(B))) : ![0,-1].includes(mu(n90(B)))) continue;
    for (const dr of [-1, 1]) for (let length=2;length<=27;length++) {
      const E = [r + dr * (length-1),c + length-1];
      if ([...E].some(v => v < 1 || v > 27)) continue;
      if (E[0] % 2 !== forecast.endRow) continue;
      out.push({start:B,end:E,dr,length});
    }
  }
  return out;
}
const shapes = ciphertextShapes();
function gcdPass(center, sh) {
  const M = center, B = sh.start, E = sh.end, L = sh.start;
  return mu(gcd(n0(M),n0(B))) !== 0 &&
    mu(gcd(n0(M),n0(L))) !== 0 &&
    mu(gcd(n90(M),n270(E))) !== 0 &&
    mu(gcd(n0(M),n180(E))) !== 0;
}
function dictionary() {
  const byLabel = new Map(LATIN.map((s,i) => [s,i]));
  const aliases = {K:'C',Z:'S',V:'U',Q:'CW'};
  const encode = w => {
    const s = w.toUpperCase().split('').map(x => aliases[x] || x).join('');
    const out = [];
    for (let i=0;i<s.length;i++) {
      const two=byLabel.get(s.slice(i,i+2));
      if (two !== undefined) {out.push(two);i++;}
      else {const one=byLabel.get(s[i]);if(one===undefined)return null;out.push(one);}
    }
    return out;
  };
  const counts = new Map();
  const words = read('resources/control/shakespeare_first300k.txt')
    .match(/[A-Za-z]+/g) || [];
  for (const w of words) {
    const g=encode(w);if(!g || g.length>14)continue;
    const id=g.join(',');
    const e=counts.get(id);
    if (e) e.count++;
    else counts.set(id,{word:w.toUpperCase(),count:1,seq:g});
  }
  const dict = new Map([...counts].filter(([,x]) =>
    x.count>=3 && x.seq.length>=2));
  dict.set('10',{word:'I',count:1500,seq:[10]});
  dict.set('24',{word:'A',count:1500,seq:[24]});
  return dict;
}
function segment(p, dict) {
  const n=p.length, dp=new Float64Array(n+1).fill(-Infinity);
  const previous=new Array(n+1);
  dp[0]=0;
  for (let i=0;i<n;i++) {
    if (!Number.isFinite(dp[i])) continue;
    for(let j=i+1;j<=Math.min(n,i+14);j++) {
      const x=dict.get(p.slice(i,j).join(','));
      if (!x) continue;
      const v=dp[i]+Math.log(x.count+1)-0.75;
      if (v>dp[j]) {dp[j]=v;previous[j]=[i,x.word];}
    }
  }
  if (!Number.isFinite(dp[n])) return null;
  const words=[];
  for (let j=n;j;) {const [i,w]=previous[j];words.unshift(w);j=i;}
  return {words:words.join(' '),score:dp[n]};
}
const dict = dictionary();
function audit(grid, saveExamples=false) {
  const nodes=sources(grid);
  let passing=0,wordComplete=0;
  const counts={},examples=[];
  for(const source of nodes) for(const sh of shapes) {
    if(!gcdPass(source.center,sh))continue;
    for(const rev of [false,true]) {
      passing++;
      if(sh.length<7)continue;
      const k=rev ? [source.key[2],source.key[1],source.key[0]] : source.key;
      const aligned=[k[forecast.phase],k[(forecast.phase+1)%3],
        k[(forecast.phase+2)%3]];
      const p=[];
      for(let j=0;j<sh.length;j++) {
        const C=at(grid,[sh.start[0]+sh.dr*j,sh.start[1]+j]);
        p.push((C-aligned[j%3]+29)%29);
      }
      const result=segment(p,dict);
      if(!result)continue;
      wordComplete++;
      counts[sh.length]=(counts[sh.length] || 0)+1;
      if(saveExamples)examples.push({center:source.center,radius:source.radius,
        original:source.original,transformed:source.transformed,reverse:rev,
        start:sh.start,end:sh.end,length:sh.length,
        plaintext:result.words,raw:p.map(x=>LATIN[x]).join('')});
    }
  }
  return {nodes:nodes.length,physicalNodes:new Set(nodes.map(x =>
    x.center.join(',')+':'+x.radius)).size,
    shapes:shapes.length,passing,wordComplete,
    completeByLength:counts,examples};
}
/** 32-bit xorshift to reproduce permutation diagnostics. */
function rng(seed) {
  let state=seed>>>0;
  return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;};
}
function permuteUnfixed(grid, fixed, random) {
  const slots=[],values=[],out=grid.slice();
  for(let i=0;i<grid.length;i++)if(!fixed.has(i)){
    slots.push(i);values.push(grid[i]);
  }
  for(let j=values.length-1;j>0;j--){
    const k=random()%(j+1);[values[j],values[k]]=[values[k],values[j]];
  }
  for(let i=0;i<slots.length;i++)out[slots[i]]=values[i];
  return out;
}
function main() {
  const actual=audit(GRID,true);
  assert.equal(actual.nodes,86);
  assert.equal(actual.shapes,132);
  assert.equal(actual.passing,21818);
  assert.equal(actual.wordComplete,1);
  const fixed=new Set([...node38,...cells38].map(x=>n0(x)-1));
  const n=process.argv[2]===undefined ? 100 : Number(process.argv[2]);
  assert.ok(Number.isSafeInteger(n) && n>=0 && n<=2000);
  const random=rng(0x35002739),nullCounts=[];
  for(let t=0;t<n;t++){
    const simulated=permuteUnfixed(GRID,fixed,random);
    nullCounts.push(audit(simulated).wordComplete);
  }
  const tail=nullCounts.filter(x=>x>=actual.wordComplete).length;
  const result={
    source:'Original LP2 page0-2 729 rune grid; external reports 00-15 and block38',
    external:'https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption',
    fixedState:{source:node38,sourceRunes:original38,cipher:cells38,
      cipherRunes:cells38.map(x=>at(GRID,x)),sum:sum38,outer:outer38,
      phase:phase38}, forecast,
    lexicon:'Shakespeare first 300k, >=3 occurrences for GP words of length >=2; I,A included',
    dictionarySize:dict.size,actual,
    conditionalNull:{trials:n,seed:'0x35002739',
      fixedOriginalCells:fixed.size,
      shuffledOtherCells:GRID.length-fixed.size,
      countMean:n?nullCounts.reduce((a,b)=>a+b,0)/n:null,
      countMin:n?Math.min(...nullCounts):null,
      countMax:n?Math.max(...nullCounts):null,
      atLeastObserved:tail,plusOneTail:n?(tail+1)/(n+1):null,
      counts:nullCounts},
    interpretation:'Conditional route continuation test; no authentic LP2 decryption.'
  };
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={predict,sources,ciphertextShapes,gcdPass,audit,segment,permuteUnfixed};
