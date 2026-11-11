"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "resources");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("liber-primus/lp2-corpus.json"));
const latin = JSON.parse(read("control/latin-vulgate-heldout-gp.json"));
const squareText = read("cicada2014-openpuff-magic-squares.txt");
const square = squareText.trim().split(/\n\s*\n/)[1].trim()
  .split(/\n/).map(row => row.trim().split(/\s+/).map(Number));
const R = 7, C = 227, N = R * C;
const mod = n => (n % 29 + 29) % 29;
assert.equal(square.length, 7);
assert.ok(square.every(row => row.length === 7 && row.reduce((a,b) => a+b,0) === 1033));
assert.equal(square[3][3], 331);
const span = corpus.pages.slice(33, 40);
const complete = span.reduce((a,p) => a+p.indices.length, 0);
assert.equal(complete, 1680);
const ct = span.flatMap((p,i) => i === 0 ? p.indices.slice(91) : p.indices);
assert.equal(ct.length, N);
assert.equal(91, 7*13);

const pi = [0,0];
for (let n=2, count=0; n<=C; n++) {
  let prime = true;
  for (let j=2; j*j<=n; j++) if (n%j===0) {prime=false;break;}
  if (prime) count++;
  pi[n] = count;
}
assert.equal(pi[227], 49);
assert.equal(pi[223], 48);
assert.equal(pi[226], 48);
assert.equal(pi.filter((v,i) => i>0 && v>pi[i-1]).length, 49);

function invert(matrix) {
  const rows=matrix.map((row,r)=>[
    ...row.map(mod), ...Array.from({length:R},(_,j)=>Number(r===j))]);
  for (let c=0; c<R; c++) {
    const p=rows.findIndex((row,r)=>r>=c && row[c]!==0);
    assert.ok(p>=c, "source matrix is invertible mod29");
    [rows[c], rows[p]]=[rows[p], rows[c]];
    const a=rows[c][c];
    const inverse=Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*a)===1);
    rows[c]=rows[c].map(x=>mod(x*inverse));
    for (let r=0;r<R;r++) if(r!==c){
      const k=rows[r][c];
      rows[r]=rows[r].map((x,j)=>mod(x-k*rows[c][j]));
    }
  }
  return rows.map(row=>row.slice(R));
}
const m= square.map(row=>row.map(mod));
assert.ok(invert(m));

function transform(sequence, layout, operation, direction, encode) {
  assert.equal(sequence.length, N);
  const result = new Array(N);
  for (let t=0;t<C;t++) {
    const readAt=r=>sequence[layout==="rows" ? r*C+t : t*R+r];
    const vec=Array.from({length:R},(_,r)=>readAt(r));
    const rank=pi[t+1];
    let out;
    if(operation==="add") {
      out=vec.map((x,r)=>mod(x+(encode?-direction:direction)*m[r][(rank+6)%7]));
    } else {
      const matrix=operation==="rotate" ?
        Array.from({length:R},(_,r)=>Array.from({length:R},(_,c)=>m[(r+rank)%R][(c+rank)%R])) : m;
      const chosen=(direction===1)===encode ? invert(matrix):matrix;
      out=chosen.map(row=>mod(row.reduce((a,x,j)=>a+x*vec[j],0)));
    }
    for(let r=0;r<R;r++)result[layout==="rows" ? r*C+t : t*R+r]=out[r];
  }
  return result;
}
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const n of a){assert.ok(Number.isInteger(n)&&n>=0&&n<29);counts[n]++;}
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const train=latin.runes.slice(0,10000);
const native=latin.runes.slice(-N);
assert.equal(native.length,N);
const freq=Array(29).fill(1);
for(const n of train)freq[n]++;
const norm=Math.log(freq.reduce((a,b)=>a+b,0));
const score=a=>a.reduce((s,n)=>s+Math.log(freq[n])-norm,0)/a.length;
const baseline={count:N,ioc:ioc(ct),score:score(ct)};
const nativeBaseline={count:N,ioc:ioc(native),score:score(native)};
const candidates=[];
for(const layout of ["rows","columns"])
 for(const operation of ["add","hill","rotate"])
  for(const direction of [-1,1]) {
    const decoded=transform(ct,layout,operation,direction,false);
    assert.deepEqual(transform(decoded,layout,operation,direction,true),ct);
    const encrypted=transform(native,layout,operation,direction,true);
    assert.deepEqual(transform(encrypted,layout,operation,direction,false),native);
    candidates.push({layout,operation,direction,ioc:ioc(decoded),
      score:score(decoded),preview:decoded.slice(0,40).map(i=>corpus.translit[i]).join("")});
  }
candidates.sort((a,b)=>b.score-a.score);
assert.equal(candidates.length,12);
console.log(JSON.stringify({
  source:"Seven identical 1033/3301 illustrated LP2 page headers on pp33-39; later red heading starts p33 rune91; middle OpenPuff 7x7 square",
  exact:"1680 - (7*13) = 1589 = 7*227, and prime(7*7)=227; pi(227)=49",
  note:"These prime-index clock and square transforms are hypotheses, not authenticated author instructions",
  baseline,nativeBaseline,
  best:candidates[0],worst:candidates[candidates.length-1],
  all12:candidates,
  validation:"All twelve variants exactly round-trip original input and a held-out native-GP plant; this only checks implementation",
  conclusion:"No original passage reaches native-GP unigram or collision levels. These twelve direct source-clock inverses produce no authentic LP2 plaintext."
},null,2));
