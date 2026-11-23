'use strict';
/**
 * Independent p33–39 first-numbered-unit and seven-page original-input gates.
 * Source-selected numbers and historical 2014 7-square; the tested value
 * transforms are hypotheses, not author-authenticated LP2 decoders.
 * Run: node sims/lp2_agent17_p33_sevenpage_orbit_coset_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources','liber-primus','lp2-corpus.json'),'utf8'));
const source=fs.readFileSync(path.join(root,
  'resources','cicada2014-openpuff-magic-squares.txt'),'utf8');
const squares=source.trim().split(/\r?\n\s*\r?\n/).map(g=>
  g.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(m=>m.length),[5,7,5]);
const M=squares[1].map(row=>row.map(v=>v%29));
const mod=v=>(v%29+29)%29;
const ident=n=>Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>+(i===j)));
function inverse(A) {
  const n=A.length, Q=A.map((r,i)=>[...r.map(mod),...ident(n)[i]]);
  for(let j=0;j<n;j++) {
    let p=j;
    while(p<n&&!Q[p][j])p++;
    assert(p<n,'historical matrix must be invertible');
    [Q[p],Q[j]]=[Q[j],Q[p]];
    const u=Array.from({length:28},(_,i)=>i+1)
      .find(i=>mod(i*Q[j][j])===1);
    Q[j]=Q[j].map(x=>mod(x*u));
    for(let k=0;k<n;k++)if(k!==j){
      const t=Q[k][j];
      Q[k]=Q[k].map((x,i)=>mod(x-t*Q[j][i]));
    }
  }
  return Q.map(r=>r.slice(n));
}
const vector=(A,v)=>A.map(r=>
  mod(r.reduce((sum,x,i)=>sum+x*v[i],0)));
const trans=A=>A[0].map((_,j)=>A.map(r=>r[j]));
const ioc=v=>{
  const h=Array(29).fill(0);v.forEach(i=>h[i]++);
  return h.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
};
const pages=corpus.pages.filter(p=>p.page>=33&&p.page<=39);
assert.deepEqual(pages.map(p=>p.indices.length),
  [214,261,271,238,228,228,240]);
const chapter=pages.flatMap(p=>p.indices);
assert.equal(chapter.length,1680);
const rows=pages.map(p=>p.indices.slice(0,139));
assert(rows.every(r=>r.length===139));
const matrices=[
  ['M',M,inverse(M)],
  ['M-inverse',inverse(M),M],
  ['M-transpose',trans(M),trans(inverse(M))],
  ['M-inverse-transpose',trans(inverse(M)),trans(M)),
];
const prefixResults=[];
for(const [name,A,B] of matrices) {
  const encoded=Array.from({length:7},()=>[]);
  for(let col=0;col<139;col++){
    vector(A,rows.map(row=>row[col])).forEach((x,j)=>encoded[j].push(x));
  }
  const restored=Array.from({length:7},()=>[]);
  for(let col=0;col<139;col++){
    vector(B,encoded.map(row=>row[col])).forEach((x,j)=>restored[j].push(x));
  }
  assert.deepEqual(restored,rows);
  prefixResults.push({transform:name,runes:973,
    iocs:encoded.map(row=>Number(ioc(row).toFixed(8)))});
}
// Chapter starts at physical p33, whose source unit starts at local91.
// Section-relative first numbered unit begins at 754: 91+754=845.
// This is p36 local [99,238). Using global [754,893) is WRONG.
assert.deepEqual(chapter.slice(845,984),pages[3].indices.slice(99,238));
const first=chapter.slice(845,984);
const step=3301%139;
assert.equal(step,104);
const orbit=[0];let x=1;
for(let j=1;j<139;j++) {orbit.push(x);x=(x*step)%139;}
assert.equal(x,1);
assert.equal(new Set(orbit).size,139);
const decoded=Array(139).fill(0);
decoded[0]=first[0];
decoded[1]=first[1];
for(let j=2;j<139;j++)
  decoded[orbit[j]]=mod(first[orbit[j]]-first[orbit[j-1]]);
const replay=Array(139).fill(0);
replay[0]=decoded[0];replay[1]=decoded[1];
for(let j=2;j<139;j++)
  replay[orbit[j]]=mod(replay[orbit[j-1]]+decoded[orbit[j]]);
assert.deepEqual(replay,first);
function pow29(a,n){
  let t=1;for(let j=0;j<n;j++)t=(t*a)%29;return t;
}
assert.equal(pow29(18,28),1);
assert.equal(pow29(18,14),28);
assert.equal(pow29(24,7),1);
assert.equal(pow29(18,16),24);
const coset=new Map();
for(let r=0;r<4;r++)for(let k=0;k<7;k++){
  const value=mod(pow29(18,r)*pow29(24,k));
  assert(value>0&&!coset.has(value));
  coset.set(value,{r,k});
}
assert.equal(coset.size,28);
function extract(pg){
  const digits=[],states=[],hist=[0,0,0,0],statehist=Array(7).fill(0);
  let zeros=0;
  for(const p of pg)for(let i=1;i<p.indices.length;i++){
    const d=mod(p.indices[i]-p.indices[i-1]);
    if(!d){zeros++;continue;}
    const v=coset.get(d);
    assert(v);
    digits.push(v.r);states.push(v.k);
    hist[v.r]++;statehist[v.k]++;
  }
  return {digits,states,zeros,hist,statehist};
}
function bytesFromFour(digits,phase=0,reverse=false){
  const bytes=[];
  for(let i=phase;i+3<digits.length;i+=4){
    const a=digits.slice(i,i+4);
    if(reverse)a.reverse();
    bytes.push(((a[0]*4+a[1])*4+a[2])*4+a[3]);
  }
  return bytes;
}
function screen(pg){
  const v=extract(pg),variants=[];
  for(let phase=0;phase<4;phase++)for(const reverse of [false,true]){
    const bytes=bytesFromFour(v.digits,phase,reverse);
    const printable=bytes.filter(b=>b>=32&&b<=126).length;
    let longest=0,current=0;
    for(const b of bytes){
      current=(b>=32&&b<=126)?current+1:0;
      longest=Math.max(longest,current);
    }
    variants.push({phase,reverse,byteCount:bytes.length,printable,
      printableFraction:Number((printable/bytes.length).toFixed(6)),
      longestPrintableRun:longest,openingHex:bytes.slice(0,16)
        .map(b=>b.toString(16).padStart(2,'0')).join('')});
  }
  variants.sort((a,b)=>b.printableFraction-a.printableFraction);
  return {runes:pg.reduce((s,p)=>s+p.indices.length,0),
    nonzeroDiffs:v.digits.length,zeroDiffs:v.zeros,
    quotientHistogram:v.hist,subgroupHistogram:v.statehist,
    bestDirectAscii:variants[0],allEight:variants};
}
const numbered=screen([{
  page:36,indices:first
}]);
const chapterScreen=screen(pages);
const unknown=screen(corpus.pages.filter(p=>p.page<=55&&p.indices.length));
assert.equal(chapterScreen.nonzeroDiffs,1661);
assert.equal(chapterScreen.zeroDiffs,12);
assert.equal(unknown.nonzeroDiffs,12815);
assert.equal(unknown.zeroDiffs,86);
// Genuine solved p57 plaintext used ONLY as a planted receiver positive.
const authenticKnown=corpus.pages.find(p=>p.page===57).indices
  .map(v=>corpus.translit[v]).join('');
assert(/^[A-Z]+$/.test(authenticKnown));
const plant=[0];
for(const letter of authenticKnown)for(const q of
  [letter.charCodeAt(0)>>6,(letter.charCodeAt(0)>>4)&3,
    (letter.charCodeAt(0)>>2)&3,letter.charCodeAt(0)&3]){
  plant.push(mod(plant[plant.length-1]+pow29(18,q)));
}
const recovered=bytesFromFour(extract([{page:57,indices:plant}]).digits);
assert.equal(String.fromCharCode(...recovered),authenticKnown);
console.log(JSON.stringify({
  model:'three independent source-constrained gates; no unknown-page plaintext',
  prefixMatrix:prefixResults,
  firstNumbered139:{globalSourceHalfOpen:[845,984],step,order:138,
    sourceIoc:ioc(first),decodedIoc:ioc(decoded),
    opening:decoded.slice(0,25).map(i=>corpus.translit[i]).join(' ')},
  coset:{sourceNumbersModulo29:[18,24],
    relation:'24 = 18^16 mod29; order(18)=28; order(24)=7',
    numbered,chapter:chapterScreen,
    entireUnknown:{...unknown,allEight:undefined},
    plantedSolved57Ascii:authenticKnown.length+'/'+authenticKnown.length},
  verdict:'No candidate original plaintext; direct byte and linear/difference models negative. Neither value-changing operator is creator-authenticated.'
},null,2));
