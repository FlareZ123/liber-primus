'use strict';
// Source-constrained 2x2 Hill-consumer gate for the p50 GF(29^2) element
// and the p15 dual-number element. Run from repository root or this file's
// directory: node sims/lp2_p50_gf29_squaredh_hill_gate_sft.cjs
const fs = require('fs');
const path = require('path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const P = 29;
const mod = n => ((n % P) + P) % P;
const invScalar = a => { for (let x = 1; x < P; x++) if (mod(a*x) === 1) return x; throw new Error('non-unit'); };
const mm = (A,B) => [
  [mod(A[0][0]*B[0][0]+A[0][1]*B[1][0]), mod(A[0][0]*B[0][1]+A[0][1]*B[1][1])],
  [mod(A[1][0]*B[0][0]+A[1][1]*B[1][0]), mod(A[1][0]*B[0][1]+A[1][1]*B[1][1])]
];
const mpow = (A,n) => { let R=[[1,0],[0,1]], B=A; while(n){ if(n&1)R=mm(R,B); B=mm(B,B); n>>=1; } return R; };
const minv = A => { const d=mod(A[0][0]*A[1][1]-A[0][1]*A[1][0]), di=invScalar(d); return [[mod(A[1][1]*di),mod(-A[0][1]*di)],[mod(-A[1][0]*di),mod(A[0][0]*di)]]; };
const transpose = A => [[A[0][0],A[1][0]],[A[0][1],A[1][1]]];
const eq = (A,B) => JSON.stringify(A)===JSON.stringify(B);

// f(u)=u^2-3u-8, so u^2=3u+8. Multiplication by 19+13u
// in basis (1,u) is G. In dual numbers epsilon^2=0, 19+13epsilon
// acts by H. The p0 DH candidate (a,b)=(7,16) gives G^(ab).
const G = [[19,17],[13,0]];
const H = [[19,0],[13,19]];
const K = mpow(G, 7*16);
if (!eq(mpow(G,840), [[1,0],[0,1]])) throw new Error('G order check failed');
if (!eq(mpow(H,812), [[1,0],[0,1]])) throw new Error('H order check failed');
if (!eq(K, [[27,28],[18,23]])) throw new Error('G^112 check failed');

const matrices = [
  ['G',G], ['G^-1',minv(G)], ['G^T',transpose(G)], ['(G^-1)^T',transpose(minv(G))],
  ['H',H], ['H^-1',minv(H)], ['H^T',transpose(H)], ['(H^-1)^T',transpose(minv(H))],
  ['K=G^112',K], ['K^-1',minv(K)], ['K^T',transpose(K)], ['(K^-1)^T',transpose(minv(K))]
];
const render = xs => xs.map(i => corpus.translit[i]).join('');
const ioc = xs => { const f=Array(P).fill(0); for(const x of xs)f[x]++; return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1)); };
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && Array.isArray(p.indices));
const results = matrices.map(([name,A]) => {
  const scored = pages.map(page => {
    const c=page.indices, out=[];
    for(let i=0;i+1<c.length;i+=2){
      const x=c[i], y=c[i+1];
      out.push(mod(A[0][0]*x+A[0][1]*y), mod(A[1][0]*x+A[1][1]*y));
    }
    if(c.length%2) out.push(c[c.length-1]); // preserve unpaired tail; no padding fit
    return {page:page.page, n:c.length, ioc:ioc(out), prefix:render(out).slice(0,90)};
  }).sort((a,b)=>b.ioc-a.ioc);
  return {name, top:scored.slice(0,5)};
});
console.log(JSON.stringify({fieldRelation:'u^2=3u+8',G,H,K, testedPages:pages.length, blockRule:'adjacent two-rune column blocks; odd tail unchanged', results},null,2));
