'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const q = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const C = c.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const spans = q.quotes.map(x=>({start:x.start,end:x.end,length:x.end-x.start}));
assert.deepEqual(spans.map(x=>x.length),[18,19,12,58,68,160,70]);
const Q = spans.flatMap(x=>C.slice(x.start,x.end));
const A = [...C.slice(spans[2].start,spans[2].end),...C.slice(spans[3].start,spans[3].end)];
const B = C.slice(spans[6].start,spans[6].end);
assert.equal(Q.length,405); assert.equal(A.length,70); assert.equal(B.length,70);
assert.equal(spans[3].start-spans[2].end,84);
const words = parseSharedCorpus().words;
let cursor=0;
const ranges=words.map((w,i)=>{const n=[...w.runes].length;const r={i,start:cursor,end:cursor+n,n};cursor+=n;return r;});
assert.equal(cursor,12956);
function lengths(start,end){const x=ranges.filter(w=>w.start>=start&&w.end<=end);assert.equal(x[0]?.start,start);assert.equal(x.at(-1)?.end,end);return x.map(w=>w.n);}
const AL=[...lengths(spans[2].start,spans[2].end),...lengths(spans[3].start,spans[3].end)];
const BL=lengths(spans[6].start,spans[6].end);
const quad=new Map();let total=0;
for(const line of read('resources/control/duko_round27_english_quadgrams.txt').trim().split(/\r?\n/u)){
 const m=line.trim().match(/^([A-Z]{4})\s+(\d+)$/u);if(m){quad.set(m[1],+m[2]);total+=+m[2];}
}
assert.ok(quad.size>70000);
const expand=x=>x.map(i=>c.translit[i]).join('');
function score(x){const s=expand(x);let z=0,n=0;for(let i=0;i+4<=s.length;i++){z+=Math.log10((quad.get(s.slice(i,i+4))||.01)/total);n++;}return z/n;}
const ioc=x=>{const f=Array(29).fill(0);for(const v of x)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));};
const add=(a,b)=>a.map((x,i)=>(x+b[i])%29);
const sub=(a,b)=>a.map((x,i)=>(x-b[i]+29)%29);
const plus=add(A,B), ab=sub(A,B), ba=sub(B,A);
const observed={plus:score(plus),aMinusB:score(ab),bMinusA:score(ba)};
const observedMax=Math.max(...Object.values(observed));
function mult(values){const m=new Map();for(const v of values)m.set(v,(m.get(v)||0)+1);return [...m.values()].sort((a,b)=>b-a);}
function histBound(a,b){const x=mult(a),y=mult(b);return x.reduce((s,v,i)=>s+Math.min(v,y[i]||0),0);}
const cmd=[...'GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO'];
const pairScores={plus:[],aMinusB:[],bMinusA:[]};
for(let i=0;i<=Q.length-70;i++){const a=Q.slice(i,i+70);for(let j=i+70;j<=Q.length-70;j++){const b=Q.slice(j,j+70);pairScores.plus.push(score(add(a,b)));pairScores.aMinusB.push(score(sub(a,b)));pairScores.bMinusA.push(score(sub(b,a)));}}
function rank(a,s){return {n:a.length,percentile:100*a.filter(x=>x<=s).length/a.length,upperTail:a.filter(x=>x>=s).length};}
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
const random=rng(3301), N=100000;let exceed=0;const nulls=[];
for(let t=0;t<N;t++){const b=B.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}const m=Math.max(score(add(A,b)),score(sub(A,b)),score(sub(b,A)));nulls.push(m);if(m>=observedMax)exceed++;}
nulls.sort((a,b)=>a-b);
const output={
 classification:'Provisional 70+70 alignment diagnostic; no plaintext or mechanism recovered',
 spanLengths:spans.map(x=>x.length),quoteRuneTotal:Q.length,p40Gap:84,
 p40WordLengths:AL,p53WordLengths:BL,
 rawIoC:{quotes:ioc(Q),p40:ioc(A),p53:ioc(B)},
 scores:observed,ioc:{plus:ioc(plus),aMinusB:ioc(ab),bMinusA:ioc(ba)},
 output:{plus:expand(plus),aMinusB:expand(ab),bMinusA:expand(ba)},
 pairWindowRanks:{plus:rank(pairScores.plus,observed.plus),aMinusB:rank(pairScores.aMinusB,observed.aMinusB),bMinusA:rank(pairScores.bMinusA,observed.bMinusA),pairs:pairScores.plus.length},
 permutationNull:{seed:3301,shuffles:N,statistic:'max(A+B,A-B,B-A)',exceedances:exceed,addOneP:(exceed+1)/(N+1),median:nulls[Math.floor(N*.5)],p95:nulls[Math.floor(N*.95)],p99:nulls[Math.floor(N*.99)]},
 historical2014HistogramBounds:{plus:histBound(plus,cmd),aMinusB:histBound(ab,cmd),bMinusA:histBound(ba,cmd)},
 countIdentity:'405 = 14*29 - 1 (observation only; not used as a cipher rule)'
};
assert.equal(output.pairWindowRanks.pairs,35511);
assert.equal(output.pairWindowRanks.plus.upperTail,152);
assert.equal(output.pairWindowRanks.aMinusB.upperTail,578);
assert.equal(exceed,519);
assert.equal(output.historical2014HistogramBounds.plus,64);
assert(Math.abs(output.permutationNull.addOneP-0.005199948000519995)<1e-12);
console.log(JSON.stringify(output,null,2));
