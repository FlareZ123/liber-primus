'use strict';

// Agent11, 28 Nov 2026 — source-only bridge gate for Agent8's chapter route.
// Tests the cheapest literal consumer: map each chapter first-black-word
// (sum mod29, product mod29) pair to the identically indexed two-symbol
// p50 table token alphabet and ask whether that printed token exists.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-grid-256.json'),'utf8'));
const A=grid.alphabet;
const tokens=grid.pages.flatMap(page=>page.tokens);
assert.equal(tokens.length,256);

const pages=[0,3,8,15,23,27,33,40,54];
const input=[15,9,23,22,25,2,5,27,19];
const output=[23,11,2,13,16,19,3,3,27];
const routePages=new Set([0,8,27,54,40]);

function positions(token){const out=[];tokens.forEach((t,i)=>{if(t===token)out.push(i);});return out;}
const rows=pages.map((page,i)=>{
 const token=A[input[i]]+A[output[i]],reverse=A[output[i]]+A[input[i]];
 return {page,input:input[i],output:output[i],onRoute:routePages.has(page),token,positions:positions(token),reverse,reversePositions:positions(reverse)};
});

assert.equal(rows.filter(r=>r.positions.length>0).length,0);
assert.equal(rows.filter(r=>r.reversePositions.length>0).length,1);
assert.deepEqual(rows.filter(r=>r.reversePositions.length>0).map(r=>({page:r.page,reverse:r.reverse,positions:r.reversePositions})),[{page:8,reverse:'2N',positions:[113]}]);
assert.equal(rows.filter(r=>r.onRoute&&r.positions.length>0).length,0);
assert.equal(rows.filter(r=>r.onRoute&&r.reversePositions.length>0).length,1);

// Values are all <=28, so their digit glyph/index mapping is unchanged by
// the repo's live radix59-vs-radix60 numerical interpretation dispute.
assert.ok([...input,...output].every(x=>x>=0&&x<=28));

console.log(JSON.stringify({status:'PASS',alphabetPrefix:A.slice(0,29),rows,forwardMatches:0,reverseMatches:1,decision:'reject literal (sum,product) -> printed p50 two-symbol-token bridge'},null,2));
