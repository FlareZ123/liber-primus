'use strict';
// Original LP2 p55 word-7 → terminal-word q7 key-recovery decision.
// All candidate plaintexts are unverified conditional cribs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const C=read('resources/liber-primus/lp2-corpus.json'),mod=29;
const p55=C.pages.find(x=>x.page===55).indices;
const donor=C.pages.find(x=>x.page===57).indices.slice(0,76);
assert.equal(p55.length,76);assert.equal(donor.length,76);
assert.equal(p55[0],21);assert.deepEqual(p55.slice(70),[23,11,1,17,18,10]);
const letter=Object.fromEntries(C.translit.map((c,i)=>[c,i]));
function plain(s){return [...s].map(x=>{assert.notEqual(letter[x],undefined,'raw Latin letter unknown '+x);return letter[x]})}
const guesses=[
 ['ENLIGHTENMENT','2014 historical witness'],
 ['MULTIBRANCHED','2014 historical witness'],
 ['CIRCUMFERENCE','p57 SHED thematic candidate (not historical)']
];
const terminal=plain('THEEND');assert.equal(terminal.length,6);
for(const [g] of guesses)assert.equal(plain(g).length,13);
const norm=x=>((x%mod)+mod)%mod,inv=x=>{assert.notEqual(norm(x),0);return (()=>{
 for(let i=1;i<29;i++)if(norm(i*x)===1)return i;
 throw Error('no inverse')})()};
function knownKey(Cipher,P,i,law){
 if(law==='direct')return norm(Cipher[i]-P);
 if(law==='feedback')return norm(Cipher[i]-Cipher[i-1]-P);
 if(law==='beaufort')return norm(Cipher[i]+P);
 throw Error('law');
}
function solveAffine(s){
 // order-seven linear recurrence K_n=sum_{j=1}^7 a_j*K_{n-j} over GF29.
 // 13 known successive K leave six equations in seven coefficients.
 const M=Array.from({length:6},(_,i)=>{
 const n=7+i;return [...Array.from({length:7},(_,j)=>s[n-j-1]),s[n]];
 });
 let rank=0;const pivots=[];
 for(let col=0;col<7;col++){
  const pivot=Array.from({length:6-rank},(_,i)=>i+rank).find(i=>M[i][col]!==0);
  if(pivot===undefined)continue;
  [M[rank],M[pivot]]=[M[pivot],M[rank]];
  const k=inv(M[rank][col]);M[rank]=M[rank].map(x=>norm(k*x));
  for(let r=0;r<6;r++)if(r!==rank&&M[r][col]){
   const z=M[r][col];M[r]=M[r].map((x,j)=>norm(x-z*M[rank][j]));
  }
  pivots.push(col);rank++;if(rank===6)break;
 }
 for(let r=rank;r<6;r++)if(M[r][7]!==0)return null;
 const free=Array.from({length:7},(_,i)=>i).filter(i=>!pivots.includes(i));
 if(free.length!==1)return {rank,free,solutions:null};
 const a=Array(7).fill(0),v=Array(7).fill(0);v[free[0]]=1;
 for(let i=0;i<rank;i++){a[pivots[i]]=M[i][7];v[pivots[i]]=norm(-M[i][free[0]])}
 return{rank,free,a,v};
}
function expandKey(start,coef){
 const K=Array(76).fill(null);
 for(let i=0;i<13;i++)K[23+i]=start[i];
 for(let i=36;i<76;i++)K[i]=norm(coef.reduce((s,a,j)=>s+a*K[i-j-1],0));
 if(!coef[6])return {K,prefixDecoded:false};
 const r=inv(coef[6]);
 for(let i=29;i>=7;i--){
  let z=K[i];for(let j=0;j<6;j++)z-=coef[j]*K[i-j-1];
  K[i-7]=norm(z*r);
 }
 for(let i=7;i<76;i++)assert.equal(K[i],norm(coef.reduce((s,a,j)=>s+a*K[i-j-1],0)));
 return{K,prefixDecoded:true};
}
function encrypt(P,K,law){
 const C=Array(P.length);for(let i=0;i<P.length;i++){
  if(law==='direct')C[i]=norm(P[i]+K[i]);
  if(law==='feedback')C[i]=norm(P[i]+K[i]+(i?C[i-1]:0));
  if(law==='beaufort')C[i]=norm(K[i]-P[i]);
 }
 return C;
}
function decrypt(C,K,law){
 return C.map((x,i)=>{
  if(law==='direct')return norm(x-K[i]);
  if(law==='feedback')return norm(x-(i?C[i-1]:0)-K[i]);
  if(law==='beaufort')return norm(K[i]-x);
 });
}
function recover(Cipher,crib,tail,law){
 const start=crib.map((p,i)=>knownKey(Cipher,p,23+i,law));
 const sourceTail=tail.map((p,i)=>knownKey(Cipher,p,70+i,law));
 const affine=solveAffine(start);
 if(!affine||!affine.solutions&&affine.free.length!==1)return{rank:affine?.rank,dim:affine?.free?.length,survivors:[],best:-1};
 const survivors=[],hist=Array(7).fill(0);let best=-1,bestT=null;
 for(let t=0;t<29;t++){
  const a=affine.a.map((x,i)=>norm(x+t*affine.v[i]));
  const ext=expandKey(start,a);
  const predictions=ext.K.slice(70,76);
  const matches=predictions.filter((x,i)=>x===sourceTail[i]).length;
  hist[matches]++;
  if(matches>best){best=matches;bestT=t;}
  if(matches===6)survivors.push({t,a,key:ext.K,prefixDecoded:ext.prefixDecoded});
 }
 return{rank:affine.rank,dim:affine.free.length,survivors,best,bestT,hist};
}
const results=[];
for(const law of ['direct','feedback','beaufort']){
 // Source-native unseen key plant: candidate recovery needs *both* disjoint cribs,
 // never fits the 57 unexposed p57 GP runes.
 const K=[2,3,5,7,11,13,17],a=[1,4,2,3,8,6,9];
 for(let i=7;i<76;i++)K[i]=norm(a.reduce((s,x,j)=>s+x*K[i-j-1],0));
 const encrypted=encrypt(donor,K,law);
 const pc=recover(encrypted,donor.slice(23,36),donor.slice(70,76),law);
 assert.equal(pc.rank,6);assert.equal(pc.dim,1);assert.equal(pc.survivors.length,1);
 assert.deepEqual(pc.survivors[0].a,a);
 assert.equal(pc.survivors[0].prefixDecoded,true);
 assert.deepEqual(pc.survivors[0].key,K);
 assert.deepEqual(decrypt(encrypted,pc.survivors[0].key,law),donor);
 for(const [guess,source] of guesses){
  const actual=recover(p55,plain(guess),terminal,law);
  assert.equal(actual.rank,6);
  assert.equal(actual.dim,1);
  assert.equal(actual.survivors.length,0);
  results.push({crib:guess,source,law,rank:actual.rank,dim:actual.dim,
   tested:29,matchingAll6:actual.survivors.length,bestOf6:actual.best,bestParameter:actual.bestT});
 }
}
assert.deepEqual(results.map(x=>x.bestOf6),[2,2,1,2,2,1,2,2,1]);
assert.equal(p55[29],1); // CIRCUMFERENCE plaintext F falls here; p56 literal-F bypass would emit 0.
console.log(JSON.stringify({
 target:'canonical physical p55 original 76 GP29 cipher runes, unmodified',
 firstCribOffsets:[23,35],terminalOffsets:[70,75],conditionalTerminal:'THEEND',
 family:'order7 GF29 linear additive key, with direct / ciphertext-feedback / Beaufort',
 authenticSolves:'three independent planted 76-rune p57 native-language controls recovered 76/76 with unique 7-tap key',
 results, status:'No full six-symbol held-out prediction; no unknown LP2 plaintext or key recovered'
},null,2));
