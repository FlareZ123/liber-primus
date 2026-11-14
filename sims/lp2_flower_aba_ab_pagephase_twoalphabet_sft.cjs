'use strict';
/**
 * Original-source ABAAB flower five-site model: all-secret page-local
 * two-alphabet substitution E-capacity obstruction. Windows 11, Node 22 CJS.
 * Reference and original data are local pinned repository files. No CLI args.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
/** @param {string} file */
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const PATTERN='ABAAB',N=29,E=18;
const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=48);
assert.equal(pages.length,9);
assert.equal(corpus.translit[E],'E');
const total=pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(total,2408);
/** @param {number[]} indices @param {number} phase */
function twoAlphabetCap(indices,phase){
 const counts=[new Uint32Array(N),new Uint32Array(N)];
 indices.forEach((v,i)=>{
  assert.ok(Number.isInteger(v)&&v>=0&&v<N);
  counts[PATTERN[(i+phase)%5]==='A'?0:1][v]++;
 });
 return Math.max(...counts[0])+Math.max(...counts[1]);
}
/** @param {number[]} indices */
function phaseCap(indices){return Array.from({length:5},(_,i)=>twoAlphabetCap(indices,i));}
const perPage=pages.map(p=>({page:p.page,n:p.indices.length,allFivePhaseCaps:phaseCap(p.indices)}));
const maxCap=perPage.reduce((s,p)=>s+Math.max(...p.allFivePhaseCaps),0);
const zeroCap=perPage.reduce((s,p)=>s+p.allFivePhaseCaps[0],0);
assert.equal(maxCap,174);
assert.equal(zeroCap,162);
const digraph={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const letters={
 A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,
 L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15
};
/** @param {string} value @returns {number[]} */
function gp(value){
 const s=value.toUpperCase().replace(/[^A-Z]/g,''),out=[];
 for(let i=0;i<s.length;i++){
  const d=digraph[s.slice(i,i+2)];
  if(d!==undefined){out.push(d);i++;}
  else out.push(letters[s[i]]);
 }
 return out;
}
/** @param {number[]} x @param {number} width @param {number} needle */
function minMatch(x,width,needle){
 assert.ok(x.length>=width);
 let n=0;for(let i=0;i<width;i++)n+=Number(x[i]===needle);
 let min=n,at=0;
 for(let i=width;i<x.length;i++){
  n+=Number(x[i]===needle)-Number(x[i-width]===needle);
  if(n<min){min=n;at=i-width+1;}
 }
 return {minimum:min,offset:at,windowCount:x.length-width+1};
}
const refs=[
 {name:'Gibran The Prophet',file:'resources/control/gibran_prophet_58585.txt'},
 {name:'Shakespeare fixed first300k',file:'resources/control/shakespeare_first300k.txt'}
].map(r=>{
 const seq=gp(read(r.file)),v=minMatch(seq,total,E);
 assert.ok(v.minimum>maxCap,'reference defeats claimed E bound');
 return {name:r.name,encodedRunes:seq.length,...v};
});
assert.deepEqual(refs.map(r=>r.encodedRunes),[62550,216874]);
assert.deepEqual(refs.map(r=>r.minimum),[226,197]);
// An explicit page-secret reversible positive plant with freely rotated motif
// and independent affine GP29 bijections for A and B per page.
const P=gp(read('resources/control/gibran_prophet_58585.txt')).slice(0,total);
let at=0;const recovered=[],encrypted=[],positivePageCap=[];
for(const p of pages){
 const plain=P.slice(at,at+p.indices.length),phase=p.page%5,bytes=[];
 for(let i=0;i<plain.length;i++){
  const mark=PATTERN[(i+phase)%5]==='A'?0:1;
  const a=1+((p.page*7+mark*11)%28),b=(p.page*11+mark*5)%29;
  const c=(a*plain[i]+b)%29;bytes.push(c);
  const ainv=Array.from({length:28},(_,z)=>z+1).find(v=>a*v%29===1);
  assert.ok(ainv!==undefined);
  recovered.push(((c-b+29)*ainv)%29);
 }
 encrypted.push(...bytes);
 positivePageCap.push(Math.max(...phaseCap(bytes)));
 at+=plain.length;
}
assert.equal(at,total);
assert.deepEqual(recovered,P);
assert.ok(positivePageCap.reduce((s,x)=>s+x,0)>=P.filter(v=>v===E).length);
console.log(JSON.stringify({
 status:'PASS',
 source:'original visual floral chapter p40-p48, nine rune-bearing physical pages',
 originalRunes:total,
 periodFiveMotif:PATTERN,
 model:'two independently secret GP29 bijections per page, one for each A/B class',
 pageClock:'all five source-allowed independent phase rotations per page',
 exactAllKeysGlobalEUpperBound:maxCap,
 sourceFixedZeroPhaseBound:zeroCap,
 originalByPage:perPage,
 references:refs,
 gibranPositive:{runes:P.length,Ecount:P.filter(v=>v===E).length,
  fullExactRecovery:recovered.every((v,i)=>v===P[i]),
  cipherEUpperBound:positivePageCap.reduce((s,x)=>s+x,0)},
 conclusion:'source berry two-alphabet per-page clock excludes ordinary native-GP English on nine original pages, not an unknown ciphertext solution'
},null,2));
