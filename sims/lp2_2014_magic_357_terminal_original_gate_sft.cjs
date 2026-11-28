#!/usr/bin/env node
'use strict';
// Source-fixed terminal p54/p55 3/7/5 register and 2014 magic-square Hill inverse.
// No inferred plaintext or fitted cipher parameter; direct terminal consumer gate.
const fs=require('fs'),path=require('path'),os=require('os');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const matrices=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\r?\n/)
     .map(line=>line.trim().split(/\s+/).map(Number)));
const assert=require('assert').strict;
const P=29,mod=x=>(x%P+P)%P;
assert.deepEqual(matrices.map(m=>m.length),[5,7,5]);
for(const m of matrices) assert(m.every(row=>row.length===m.length));
const pages=Object.fromEntries(corpus.pages.map(p=>[p.page,p.indices]));
const p54=pages[54],p55=pages[55],p57=pages[57];
assert.deepEqual([p54.length,p55.length,p57.length],[232,76,95]);
const red9=p54.slice(0,9);
assert.deepEqual(red9,[24,19,21,23,27,2,14,10,19]);
const seven=p54.slice(9).concat(p55.slice(0,1));
const five=p55.slice(1);
assert.deepEqual([red9.length,seven.length,five.length],[9,224,75]);
assert.equal(red9.length+seven.length+five.length,p54.length+p55.length);
const core3=matrices[0].slice(1,4).map(row=>row.slice(1,4));
function inverse(matrix){
 const n=matrix.length;
 const a=matrix.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>+(i===j))));
 let det=1;
 for(let col=0;col<n;col++){
  let piv=col; while(piv<n && a[piv][col]===0)piv++;
  assert(piv<n,'matrix must be invertible mod29');
  if(piv!==col){[a[col],a[piv]]=[a[piv],a[col]];det=mod(-det);}
  const v=a[col][col];det=mod(det*v);
  let reciprocal=1;while(mod(v*reciprocal)!==1)reciprocal++;
  a[col]=a[col].map(z=>mod(z*reciprocal));
  for(let j=0;j<n;j++)if(j!==col){
   const factor=a[j][col];a[j]=a[j].map((z,k)=>mod(z-factor*a[col][k]));
  }
 }
 return {det,m:a.map(r=>r.slice(n))};
}
function transform(data,matrix,orientation){
 const n=matrix.length;
 assert.equal(data.length%n,0,'block framing mismatch');
 const out=[];
 for(let base=0;base<data.length;base+=n){
  const block=data.slice(base,base+n);
  for(let i=0;i<n;i++){
   let v=0;
   for(let j=0;j<n;j++)v+=block[j]*(orientation==='row'?matrix[j][i]:matrix[i][j]);
   out.push(mod(v));
  }
 }
 return out;
}
function ioc(a){const bins=Array(29).fill(0);for(const x of a)bins[x]++;
 return bins.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));}
function latin(a){return a.map(i=>corpus.translit[i]).join(' ');}
function segmentReport(name,data,matrix){
 const invert=inverse(matrix);
 const outcomes=[];
 for(const orientation of ['column','row']){
  const decoded=transform(data,invert.m,orientation);
  assert.deepEqual(transform(decoded,matrix,orientation),data);
  // Positive control from authentic directly readable p57, repeated only to align length.
  const planted=Array.from({length:data.length},(_,i)=>p57[i%p57.length]);
  const enc=transform(planted,matrix,orientation);
  assert.deepEqual(transform(enc,invert.m,orientation),planted);
  outcomes.push({orientation,decoded_ioc:ioc(decoded),decoded_F_count:decoded.filter(x=>x===0).length,
   decoded_first_45_latin:latin(decoded.slice(0,45)),decoded_last_20_latin:latin(decoded.slice(-20)),
   exact_original_reencryption:true,exact_p57_positive_plant:true});
 }
 return {name,runes:data.length,width:matrix.length,det_mod29:invert.det,outcomes};
}
// Census all original page-to-next-page word carries whose current page has an opening red span.
// Scan the actual printed hyphen/period grammar, preserving page separators and original rune indices.
const runeSet=new Set(corpus.runes);
const positions=[];
for(let i=0;i<transcription.length;i++)if(runeSet.has(transcription[i]))positions.push(i);
assert.equal(positions.length,corpus.pages.reduce((n,p)=>n+p.indices.length,0));
const carryCensus=[];
let offset=0;
for(const page of corpus.pages){
 const p=page.page;
 if(p<=55){
  const inkPage=ink.pages.find(x=>x.page===p);
  const opening=(inkPage && inkPage.red_spans || []).find(span=>span.start===0);
  const openingRed=opening?opening.length:0;
  const last=positions[offset+page.indices.length-1];
  const next=positions[offset+page.indices.length];
  const between=transcription.slice(last+1,next);
  if(openingRed && !/[-.]/.test(between)){
   let carry=0;
   for(let k=next;k<transcription.length;k++){
    const ch=transcription[k];
    if(runeSet.has(ch))carry++;
    else if(ch==='-'||ch==='.')break;
   }
   const nextPage=pages[p+1]||[];
   const body=page.indices.length-openingRed;
   const nextTail=nextPage.length-carry;
   carryCensus.push({p,red:openingRed,body,carry,next_tail:nextTail,
    divisible_7:(body+carry)%7===0,divisible_5:nextTail%5===0});
  }
 }
 offset+=page.indices.length;
}
const both=carryCensus.filter(r=>r.divisible_7&&r.divisible_5);
assert.equal(carryCensus.length,8);
assert.deepEqual(both.map(x=>x.p),[54]);
const result={
 scope:'Original p54 red9; p54 black223+p55 carry1; p55 residual75',
 source_squares:[5,7,5],source_det_mod29:matrices.map(x=>inverse(x).det),
 boundaries:{p54_red:9,p54_black:223,p55_first_carry:1,p55_tail:75},
 candidate_widths:[3,7,5],red_head_carry_census:carryCensus,
 tests:[segmentReport('red9:first_source_inner3',red9,core3),
        segmentReport('black224:second_source_full7',seven,matrices[1]),
        segmentReport('terminal75:third_source_full5',five,matrices[2])],
 controls:{p57_native_ioc:ioc(p57),unknown_p54_ioc:ioc(p54),unknown_p55_ioc:ioc(p55)}
};
console.log(JSON.stringify(result,null,2));
if(process.env.RUNNER_TEMP)
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(result,null,2)+'\n');
