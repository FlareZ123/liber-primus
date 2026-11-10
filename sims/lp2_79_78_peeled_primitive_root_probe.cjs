"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {encodeEnglish}=require("./outer_permutation_assignment.cjs");
const ROOT=path.resolve(__dirname,".."),read=n=>fs.readFileSync(path.join(ROOT,n),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const INK=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const SHAKESPEARE=read("resources/control/shakespeare_first300k.txt");
const M=29,N=78,mod=x=>((x%M)+M)%M;
function languageModel(){
 const training=encodeEnglish(SHAKESPEARE.slice(0,200000)),test=encodeEnglish(SHAKESPEARE.slice(240000));
 const uni=new Float64Array(M),bi=new Float64Array(M*M),tri=new Float64Array(M*M*M);
 for(let i=0;i<training.length;i++){const c=training[i];uni[c]++;if(i>0)bi[training[i-1]*M+c]++;if(i>1)tri[(training[i-2]*M+training[i-1])*M+c]++;}
 const logP=(a,b,c)=>Math.log(.8*(tri[(a*M+b)*M+c]+.25)/(bi[a*M+b]+7.25)+.2*(bi[b*M+c]+.25)/(uni[b]+7.25));
 const score=s=>{let v=0;for(let i=2;i<s.length;i++)v+=logP(s[i-2],s[i-1],s[i]);return v/(s.length-2);};
 return{training,test,score};
}
function redSum(page){const a=INK.pages.find(p=>p.page===page).red_spans[0],d=[...a.runes].map(r=>GP.runes.indexOf(r));assert(d.every(x=>x>=0));return{length:d.length,sum:d.reduce((s,x)=>s+GP.prime[x],0)};} // sum is prime-value sum, not rune-index sum
function multiply(A,B){const n=A.length,m=B[0].length,k=B.length,O=Array.from({length:n},()=>Array(m).fill(0));for(let i=0;i<n;i++)for(let t=0;t<k;t++){const v=A[i][t];if(v)for(let j=0;j<m;j++)O[i][j]=(O[i][j]+v*B[t][j])%M;}return O;}
function inverseMod(a){let r=1,b=a,n=27;while(n){if(n&1)r=r*b%M;b=b*b%M;n>>=1;}return r;}
function invert(A){const n=A.length,Z=A.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>Number(i===j))]);let rank=0;for(let col=0;col<n;col++){let p=rank;while(p<n&&Z[p][col]===0)p++;if(p===n)continue;[Z[rank],Z[p]]=[Z[p],Z[rank]];const inv=inverseMod(Z[rank][col]);for(let j=0;j<2*n;j++)Z[rank][j]=mod(Z[rank][j]*inv);for(let i=0;i<n;i++)if(i!==rank){const f=Z[i][col];if(f)for(let j=0;j<2*n;j++)Z[i][j]=mod(Z[i][j]-f*Z[rank][j]);}rank++;}return{rank,inverse:rank===n?Z.map(row=>row.slice(n)):null};}
function pairStats(key,cipher){const ca=Array(M).fill(0),cb=Array(M).fill(0),ct=Array(M*M).fill(0);let eq=0;for(let i=0;i<key.length;i++){ca[key[i]]++;cb[cipher[i]]++;ct[key[i]*M+cipher[i]]++;eq+=Number(key[i]===cipher[i]);}let mi=0,row=0;for(let a=0;a<M;a++){let mx=0;for(let b=0;b<M;b++){const n=ct[a*M+b];if(n){mi+=n*Math.log(n*key.length/(ca[a]*cb[b]));mx=Math.max(mx,n);}}row+=mx;}return{mutualInformation:mi/key.length,rowAccuracy:row/key.length,equality:eq/key.length};}
function run(){
 const stream=GP.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert.equal(stream.length,12956);
 const first=stream.slice(0,6561),second=stream.slice(6561);assert.equal(first.length,6561);assert.equal(second.length,6395);
 const markerA=stream.slice(6555,6561),markerB=stream.slice(12950,12956);
 const p15=redSum(15),p40=redSum(40),p53=redSum(53);
 assert.deepEqual(p15,{length:9,sum:638});assert.deepEqual(p40,{length:8,sum:435});assert.deepEqual(p53,{length:51,sum:2262});
 const A=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>first[(r+1)*81+c+1]));
 const B=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>second[(r+1)*80+c+1])),Bflat=B.flat();
 let g=1;const powers=[];for(let i=0;i<N;i++){powers.push(g);g=g*53%79;}assert.equal(new Set(powers).size,N);assert.equal(g,1);
 const parable=1595277641;
 assert.equal(parable%79,68);
 assert.equal(parable%3301,70);
 const powmod=(a,e,m)=>{let out=1;while(e){if(e&1)out=out*a%m;a=a*a%m;e>>=1;}return out;};
 let h=1;const powers68=[];for(let i=0;i<N;i++){powers68.push(h);h=h*68%79;}
 assert.equal(new Set(powers68).size,N);assert.equal(h,1);
 assert.equal(powmod(68,78,79),1);
 for(const q of [2,3,13])assert.notEqual(powmod(68,78/q,79),1);
 const rev=powers.slice().reverse(),rev68=powers68.slice().reverse();
 const orderA=(order,rs=0,cs=0)=>Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>A[order[(i+rs)%N]-1][order[(j+cs)%N]-1]));
 const maps=[
  {name:"raw-coordinate",matrix:A},
  {name:"pow53",matrix:orderA(powers)},
  {name:"pow53-phase22-15",matrix:orderA(powers,22,15)},
  {name:"pow53-phase15-22",matrix:orderA(powers,15,22)},
  {name:"pow53-reverse",matrix:orderA(rev)},
  {name:"pow53-reverse-phase22-15",matrix:orderA(rev,22,15)},
  {name:"pow53-reverse-phase15-22",matrix:orderA(rev,15,22)},
  {name:"pow68-parable-2013",matrix:orderA(powers68)},
  {name:"pow68-parable-2013-reverse",matrix:orderA(rev68)}
 ];
 const lang=languageModel(),cellwise=[];
 for(const m of maps){const key=m.matrix.flat(),stats=pairStats(key,Bflat);for(const sign of [1,-1]){const p=key.map((v,i)=>mod(sign*(Bflat[i]-v)));cellwise.push({mapping:m.name,sign,meanLogProbability:lang.score(p),...stats,preview:p.slice(0,90).map(v=>GP.translit[v]).join("")});}}
 const hill=[];
 const hillMaps=[...maps.slice(0,4),...maps.filter(m=>m.name.startsWith("pow68"))];
 for(const m of hillMaps){const inv=invert(m.matrix);if(!inv.inverse){hill.push({mapping:m.name,rank:inv.rank,invertible:false});continue;}for(const side of ["Ainv-times-B","B-times-Ainv"]){const P=side==="Ainv-times-B"?multiply(inv.inverse,B):multiply(B,inv.inverse),flat=P.flat();hill.push({mapping:m.name,rank:inv.rank,invertible:true,side,meanLogProbability:lang.score(flat),preview:flat.slice(0,100).map(v=>GP.translit[v]).join("")});}}
 const plant=Array.from({length:N},(_,r)=>lang.test.slice(r*N,(r+1)*N));
 const testKey=maps[1].matrix.flat(),cellCipher=plant.flat().map((v,i)=>mod(v+testKey[i]));
 assert.deepEqual(cellCipher.map((v,i)=>mod(v-testKey[i])),plant.flat());
 const inv=invert(maps[1].matrix).inverse,hillCipher=multiply(maps[1].matrix,plant);
 assert.deepEqual(multiply(inv,hillCipher),plant);
 const map68=maps.find(m=>m.name==="pow68-parable-2013");
 const testKey68=map68.matrix.flat(),cellCipher68=plant.flat().map((v,i)=>mod(v+testKey68[i]));
 assert.deepEqual(cellCipher68.map((v,i)=>mod(v-testKey68[i])),plant.flat());
 const inv68Result=invert(map68.matrix);
 let root68HillExact=null;
 if(inv68Result.inverse){
  const hillCipher68=multiply(map68.matrix,plant);
  assert.deepEqual(multiply(inv68Result.inverse,hillCipher68),plant);
  root68HillExact=true;
 }
 const bestCell=[...cellwise].sort((a,b)=>b.meanLogProbability-a.meanLogProbability),bestHill=hill.filter(x=>x.invertible).sort((a,b)=>b.meanLogProbability-a.meanLogProbability);
 const result={
  classification:"source-constrained 79/78 peel test of red-derived root53 and 2013 Parable-derived root68; direct mod-29 cellwise and Hill-matrix relations",
  source:{totalRunes:stream.length,firstBlock:first.length,secondBlock:second.length,markerA:markerA.map(v=>GP.translit[v]).join(""),markerAOffsets:[6555,6560],markerB:markerB.map(v=>GP.translit[v]).join(""),markerBOffsets:[12950,12955],secondBlockMarkerOffsets:[6389,6394],assumedMissingSecondBlockCells:[6395,6399],redSpanSums:{p15,p40,p53},peeledDimensions:{first79:79*79,aligned78:N*N,second78:N*N},primitiveRoot:53,powerPrefix:powers.slice(0,12),powerLast:powers.at(-1),parableProduct:parable,parableResidue79:parable%79,parableResidue3301:parable%3301,parableRoot68Order:78,parableRoot68PowerPrefix:powers68.slice(0,12),parableRoot68PowerLast:powers68.at(-1)},
  language:{nativeShakespeareTest:lang.score(lang.test),originalCipher:lang.score(stream),model:"continuous GP trigram: 0.8 smoothed trigram + 0.2 smoothed bigram; train first 200k Shakespeare chars, test from char 240k"},
  cellwise:{tested:cellwise.length,best:bestCell.slice(0,5),scoreRange:[Math.min(...cellwise.map(x=>x.meanLogProbability)),Math.max(...cellwise.map(x=>x.meanLogProbability))],MIRange:[Math.min(...cellwise.map(x=>x.mutualInformation)),Math.max(...cellwise.map(x=>x.mutualInformation))],rowAccuracyRange:[Math.min(...cellwise.map(x=>x.rowAccuracy)),Math.max(...cellwise.map(x=>x.rowAccuracy))]},
  hillMatrix:{tested:hill.length,fullRank:hill.filter(x=>x.invertible).length,best:bestHill.slice(0,5),scoreRange:[Math.min(...bestHill.map(x=>x.meanLogProbability)),Math.max(...bestHill.map(x=>x.meanLogProbability))]},
  positiveControl:{root53CellwiseExact:true,root53HillExact:true,root68CellwiseExact:true,root68HillExact,runeRoundtrip:N*N},
  interpretation:"Neither the red-derived 53-power maps nor the independently sourced 2013 Parable residue 68 creates a language-bearing cellwise pad or 78x78 Hill inverse under the tested natural power order. The 2013 number supplies a genuine primitive root modulo79, but this direct matrix use fails. This rejects only these direct matrix relations under the stated terminal-five and residue-zero conventions; other transpositions/stateful transforms remain open."
 };
 console.log(JSON.stringify(result,null,2));return result;
}
if(require.main===module)run();
module.exports={run,invert,multiply};
