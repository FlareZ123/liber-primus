'use strict';
// Original LP2 pp49-51 32x8 table / terminal solved pp56-57 inverse gate.
// Windows: node sims/lp2_terminal256_local_3x3_stencil_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file @returns {any} */
const load = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json').pages.flatMap(p => p.bytes);
const c55 = corpus.pages[55].indices, c56 = corpus.pages[56].indices, c57 = corpus.pages[57].indices;
assert.deepEqual([grid.length, c55.length, c56.length, c57.length], [256, 76, 85, 95]);
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} n @returns {number[]} */
function primes(n) {
  const out = [];
  for (let v = 2; out.length < n; v++) {
    let ok = true;
    for (let d = 2; d * d <= v; d++) if (v % d === 0) { ok = false; break; }
    if (ok) out.push(v);
  }
  return out;
}
/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const alpha = corpus.translit.map((s,i) => ({s,i})).sort((a,b) => b.s.length - a.s.length);
  const output = [];
  for (const word of text.split(' ')) for (let i = 0; i < word.length;) {
    const found = alpha.find(t => word.startsWith(t.s,i));
    assert.ok(found);
    output.push(found.i); i += found.s.length;
  }
  return output;
}
const primes85 = primes(85);
let tick = 0;
const p56 = c56.map((c,i) => i === 56 ? 0 : mod(c - primes85[tick++] + 1));
assert.equal(tick, 84);
const known56 = encodeNative('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.deepEqual(p56, known56);
const plain = p56.concat(c57), visible = c56.concat(c57);
const rowMajor = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) rowMajor.push(r * 8 + c);
const spiral = [];
for (let top = 0, bottom = 31, left = 0, right = 7; top <= bottom && left <= right; top++, bottom--, left++, right--) {
  for (let c = left; c <= right; c++) spiral.push(top * 8 + c);
  for (let r = top + 1; r <= bottom; r++) spiral.push(r * 8 + right);
  if (bottom > top) for (let c = right - 1; c >= left; c--) spiral.push(bottom * 8 + c);
  if (right > left) for (let r = bottom - 1; r > top; r--) spiral.push(r * 8 + left);
}
assert.equal(spiral.length, 256);
assert.equal(new Set(spiral).size, 256);
/** @param {number} pos @returns {number[]} */
function features(pos) {
  const r = Math.floor(pos / 8), c = pos % 8, x = [1];
  for (const dr of [-1,0,1]) for (const dc of [-1,0,1]) {
    const rr = r + dr, cc = c + dc;
    x.push(rr >= 0 && rr < 32 && cc >= 0 && cc < 8 ? mod(grid[rr*8+cc]) : 0);
  }
  return x;
}
/** @param {number} x @returns {number} */
function inverse(x) { for (let i=1;i<29;i++) if (mod(i*x)===1) return i; throw Error('not invertible'); }
/** @param {number[][]} data @returns {number} */
function rank(data) {
  const a = data.map(row => row.slice()); let row=0;
  for (let c=0;c<a[0].length&&row<a.length;c++) {
    let v=row; while(v<a.length&&!a[v][c])v++;
    if(v===a.length)continue;
    [a[row],a[v]]=[a[v],a[row]]; const factor=inverse(a[row][c]);
    for(let j=c;j<a[0].length;j++)a[row][j]=mod(a[row][j]*factor);
    for(let i=row+1;i<a.length;i++){const k=a[i][c];for(let j=c;j<a[0].length;j++)a[i][j]=mod(a[i][j]-k*a[row][j]);}
    row++;
  } return row;
}
/** @param {number[][]} features10 @param {number[]} targets @returns {number[]} */
function solve(features10,targets) {
  const a = features10.slice(0,10).map((r,i)=>[...r,targets[i]]);
  assert.equal(rank(a.map(r=>r.slice(0,10))),10);
  for(let c=0;c<10;c++){
    let j=c;while(j<10&&!a[j][c])j++;
    [a[c],a[j]]=[a[j],a[c]];const k=inverse(a[c][c]);
    for(let m=c;m<=10;m++)a[c][m]=mod(a[c][m]*k);
    for(let r=0;r<10;r++)if(r!==c){const v=a[r][c];for(let m=c;m<=10;m++)a[r][m]=mod(a[r][m]-v*a[c][m]);}
  }
  return a.map(r=>r[10]);
}
/** @param {number[]} x @param {number[]} key @returns {number} */
const decode=(x,key)=>mod(x.reduce((sum,v,i)=>sum+v*key[i],0));
const secret=[2,3,5,7,11,13,17,19,23,0];
const result=[];
for(const [order,positions] of [['row-major',rowMajor],['outer-to-inner spiral',spiral.slice(76)]]) {
  assert.equal(positions.length,180);
  const x=positions.map(features);
  for(const [register,target] of [['solved p56 + clear p57',plain],['visible p56 + clear p57',visible]]) {
    const k=solve(x,target);
    assert.deepEqual(x.slice(0,10).map(v=>decode(v,k)),target.slice(0,10));
    const guessed11=decode(x[10],k),source11=target[10];
    assert.notEqual(guessed11,source11);
    assert.deepEqual([rank(x.slice(0,120)),rank(x.slice(0,120).map((row,i)=>[...row,target[i]]))],[10,11]);
    const plant=x.map(v=>decode(v,secret));
    const recovered=solve(x,plant);
    assert.deepEqual(recovered,secret);
    assert.deepEqual(x.map(v=>decode(v,recovered)),plant);
    const outer=spiral.slice(0,76);
    const withheld=outer.map(i=>decode(features(i),secret));
    assert.deepEqual(outer.map(i=>decode(features(i),recovered)),withheld);
    result.push({order,register,first_mismatch_1based:11,source11,guessed11,
      coefficient_rank:10,augmented_rank:11,
      heldout_60_matches:x.slice(120).filter((v,i)=>decode(v,k)===target[120+i]).length,
      planted_coefficients_recovered:10,planted_hidden_border_recovered:76});
  }
}
assert.equal(result.length,4);
console.log(JSON.stringify({original_grid:256,unknown_border:76,known_interior:180,
  authentic_p56_check:85,authentic_p56_key_ticks:84,all_secret_linear_models:result,
  genuine_unknown_plaintext_recovered:false},null,2));
