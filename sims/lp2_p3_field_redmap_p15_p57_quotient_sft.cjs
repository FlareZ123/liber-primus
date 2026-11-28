'use strict';
// Original LP2 p3 polynomial quotient on independently selected red page pairs.
// Deliberately no plaintext scoring, no target-dependent byte/rune key fitting.
// Companion evidence: p15 BASE29 p6<->p8/p7 fixed; p15 M5N7 -> p57;
// p15 DH public A=8,B=19 and chapter-opening title-length pair p40/p27.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json'),ink=read('resources/liber-primus/lp2-ink-annotations.json');
const mod=x=>((x%29)+29)%29;
const red=[];
for(const p of ink.pages)for(const [j,s] of (p.red_spans||[]).entries()){
 const raw=corpus.pages[p.page].indices.slice(s.start,s.start+s.length);
 assert.equal(raw.length,s.length);
 red.push({page:p.page,span:j,start:s.start,length:s.length,raw});
}
assert.equal(red.length,18);
// Independent original-ink receiver type, established in the earlier #3389
// manuscript-wide control: p6 and p15 SECOND are the only length-11 red spans
// flanked by large red 13-dot punctuation at both ends. Select p15b by this
// physical type, not by its eventual field residue or solved-page match.
const hasRed13=(page,offset)=>{
 const marks=ink.pages.find(x=>x.page===page)?.large_punctuation||[];
 return marks.some(([at,dots,color])=>at===offset&&dots===13&&color==='red');
};
const double13=red.filter(s=>hasRed13(s.page,s.start)&&hasRed13(s.page,s.start+s.length));
assert.equal(double13.length,7);
assert.deepEqual(double13.filter(s=>s.length===11).map(s=>[s.page,s.span,s.start,s.length]),[
 [6,0,71,11],[15,1,9,11]
]);
function span(page,j=0){const a=red.find(s=>s.page===page&&s.span===j);assert(a,'missing red span');return a;}
const p3=span(3,1);assert.deepEqual([p3.start,...p3.raw],[119,13,23,2]);
const DH={p:23,g:5,a:6,b:15,A:8,B:19,K:2,q:4};
const chapter=[0,3,8,15,23,27,33,40,54];
const openingLength=page=>{
 let end=0;
 for(const s of red.filter(x=>x.page===page).sort((a,b)=>a.start-b.start)){if(s.start===end)end+=s.length;}
 return end;
};
const titles=chapter.map(page=>({page,length:openingLength(page)}));
assert.deepEqual(titles,[
 {page:0,length:13},{page:3,length:16},{page:8,length:12},{page:15,length:20},
 {page:23,length:16},{page:27,length:19},{page:33,length:10},{page:40,length:8},{page:54,length:9}
]);
assert.deepEqual(titles.filter(x=>x.length===DH.B).map(x=>x.page),[27]);
assert.deepEqual(titles.filter(x=>x.length===DH.A).map(x=>x.page),[40]);
// The independently documented p15 integer BASE29 page-count map is F(6)=8,
// F(7)=7, F(8)=6. Assert its recipient types only, never their raw rune values.
assert.deepEqual([span(6).length,span(7).length,span(8).length],[11,14,12]);
const M5N7=[6,7,8,9].map(page=>corpus.pages[page].indices.length%29);
assert.deepEqual(M5N7,[22,5,23,7]);assert.equal(M5N7.reduce((a,b)=>a+b,0),57);
assert.deepEqual(red.filter(x=>x.page===15).map(x=>[x.start,x.length]),[[0,9],[9,11]]);
assert.deepEqual([span(57).start,span(57).length],[0,7]);
// The p3 original red trinomial [13,23,2] has 2 invertible mod29:
// 2*u^2 + 23*u + 13=0 means u^2 = 3*u + 8.
const evaluate=(coeff,r,t,reverse=false)=>{
 let a=0,b=0;
 for(const v of (reverse?coeff:coeff.slice().reverse()))[a,b]=[mod(t*b+v),mod(a+r*b)];
 return [a,b];
};
assert.deepEqual(evaluate(p3.raw,3,8),[0,0]);
assert.notDeepEqual(evaluate(p3.raw,3,8,true),[0,0]);
const needed=[3,6,7,8,15,23,27,40,54,57];
const picked=Object.fromEntries(needed.map(page=>[page,span(page).raw]));
picked['15b']=span(15,1).raw;
const E=Object.fromEntries(Object.entries(picked).map(([k,v])=>[k,evaluate(v,3,8)]));
assert.deepEqual([E['6'],E['7'],E['8'],E['27'],E['40'],E['15b'],E['57']],[
 [10,18],[1,6],[10,4],[18,19],[18,21],[14,25],[14,25]
]);
assert.deepEqual([mod(E['8'][0]-E['6'][0]),mod(E['8'][1]-E['6'][1])],[0,DH.b]);
assert.deepEqual([mod(E['40'][0]-E['27'][0]),mod(E['40'][1]-E['27'][1])],[0,DH.K]);
assert.deepEqual(E['7'],[1,DH.a]);
// Full red-span remainder duplicate census: p15 second / p57 opener only.
const all=red.map(s=>({...s,eval:evaluate(s.raw,3,8)}));
const collisions=[];
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)
 if(all[i].eval.join(',')===all[j].eval.join(','))collisions.push(
 [[all[i].page,all[i].span],[all[j].page,all[j].span]]);
assert.deepEqual(collisions,[[[15,1],[57,0]]]);
// Charge every field coefficient pair (r,t) in GF29^2 without fitting an
// original plaintext or changing any selected red span contents/coordinates.
const census=[];
for(const reverse of [false,true]){
 const count={A:0,B:0,C:0,AB:0,AC:0,BC:0,ABC:0},hits=[];
 for(let r=0;r<29;r++)for(let t=0;t<29;t++){
  const f={};for(const key of ['6','8','27','40','15b','57'])f[key]=evaluate(picked[key],r,t,reverse);
  const A=f['6'][0]===f['8'][0];  // p15 6<->8 map: constant coordinate
  const B=f['27'][0]===f['40'][0]; // DH B/A title lengths select p27/p40
  const C=f['15b'][0]===f['57'][0]&&f['15b'][1]===f['57'][1]; // exact remainder
  for(const [key,pass] of Object.entries({A,B,C,AB:A&&B,AC:A&&C,BC:B&&C,ABC:A&&B&&C}))
   if(pass)count[key]++;
  if(A&&B&&C)hits.push({r,t,field:{
   p6:f['6'],p8:f['8'],p27:f['27'],p40:f['40'],p15second:f['15b'],p57:f['57']
  }});
 }
 census.push({coefficientOrientation:reverse?'reversed':'original left-to-right',count,hits});
}
assert.deepEqual(census.map(x=>x.count),[
 {A:31,B:35,C:2,AB:2,AC:1,BC:1,ABC:1},
 {A:24,B:27,C:3,AB:0,AC:1,BC:0,ABC:0}
]);
assert.deepEqual(census[0].hits.map(x=>[x.r,x.t]),[[3,8]]);
assert.deepEqual(census[1].hits,[]);
// The p3 triad also divides the polynomial difference of the p15 second
// (11 rune) and solved p57 red opener (7 rune) with ZERO remainder.
const p15b=picked['15b'],p57=picked['57'],divisor=p3.raw;
const difference=Array.from({length:p15b.length},(_,i)=>mod(p15b[i]-(p57[i]||0)));
const remainder=difference.slice(),quotient=Array(p15b.length-divisor.length+1).fill(0);
for(let i=quotient.length-1;i>=0;i--){
 const v=mod(remainder[i+2]*15);quotient[i]=v;
 for(let j=0;j<divisor.length;j++)remainder[i+j]=mod(remainder[i+j]-v*divisor[j]);
}
assert.deepEqual(remainder.slice(0,2),[0,0]);assert(remainder.every(x=>x===0));
assert.deepEqual(quotient,[5,5,14,9,10,4,27,17,25]);
const recomposed=Array(p15b.length).fill(0);
for(let i=0;i<quotient.length;i++)for(let j=0;j<divisor.length;j++)
 recomposed[i+j]=mod(recomposed[i+j]+quotient[i]*divisor[j]);
assert.deepEqual(recomposed,difference);
// Matched source-phase controls: rotate complete original red spans but preserve
// every rune, length and field law. This is calibration, not an authorship p-value.
const rotate=(x,i)=>x.slice(i).concat(x.slice(0,i));
const phase=[];
for(const [left,right,criterion] of [['6','8','constant'],['27','40','constant'],['15b','57','full']]){
 const u=picked[left],v=picked[right],matches=[];
 for(let i=0;i<u.length;i++)for(let j=0;j<v.length;j++){
  const a=evaluate(rotate(u,i),3,8),b=evaluate(rotate(v,j),3,8);
  if(criterion==='constant'?a[0]===b[0]:a[0]===b[0]&&a[1]===b[1])matches.push([i,j]);
 }
 assert(matches.some(x=>x[0]===0&&x[1]===0));
 phase.push({pair:[left,right],criterion,total:u.length*v.length,hits:matches.length,printedPhaseIncluded:true});
}
assert.deepEqual(phase.map(x=>[x.total,x.hits]),[[132,6],[152,6],[77,1]]);
const fixedPointPhases=Array.from({length:picked['7'].length},(_,i)=>evaluate(rotate(picked['7'],i),3,8))
 .filter(x=>x[0]===1&&x[1]===DH.a).length;
assert.equal(fixedPointPhases,1);
const result={classification:'source-selected red-span GF29 quadratic quotient; structural original-input operand, no plaintext',
 field:{p3Triad:p3.raw,rule:'u^2=3u+8',degree2MonicModuliCharged:841},
 sourceSelectors:{p15PageMap:'6<->8;7 fixed',DHtitleLengthPair:[27,40],p15RemainderSumToPage:57,
  p15RedCandidates:2,p15UniqueBracket11:1,p57RedCandidates:1},
 DH,redEvaluations:E,onlyCompleteRedSpanCollision:collisions,
 census,phase,fixedPointPhases,
 quotient:{dividendPage:15,dividendRedSpan:1,subtractPage:57,subtractRedSpan:0,
  divisorPage:3,divisorRedSpan:1,coefficientOrder:'printed GP0 powers from zero',
  keyCandidate:quotient,translit:quotient.map(x=>corpus.translit[x]).join(''),
  zeroRemainder:true},
 caution:'Equalities and state labels recognized after original values were open; controls measure structural specificity, not a prospective authored cipher or deciphered body.'};
console.log(JSON.stringify(result,null,2));
