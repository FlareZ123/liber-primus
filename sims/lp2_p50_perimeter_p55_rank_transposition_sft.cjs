#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const english=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const bytes=Buffer.from(grid.byte_rows.flat());
assert.equal(bytes.length,256);
const gridSha=crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(gridSha,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const alphabet=corpus.translit;
const tokenIndex=new Map(alphabet.map((t,i)=>[t,i]));
function encodeWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  const pair=s.slice(i,i+2);
  if(tokenIndex.has(pair)){out.push(tokenIndex.get(pair));i+=2;}
  else{if(tokenIndex.has(s[i]))out.push(tokenIndex.get(s[i]));i++;}
 }
 return out;
}
function trainBigram(text){
 const w=31,start=29,end=30,counts=new Float64Array(w*w),totals=new Float64Array(w),uni=new Float64Array(w);
 for(const word of (text.slice(0,240000).match(/[A-Za-z]+/g)||[])){
  let prev=start;
  for(const cur of [...encodeWord(word),end]){counts[prev*w+cur]++;totals[prev]++;uni[cur]++;prev=cur;}
 }
 const total=uni.reduce((a,b)=>a+b,0),prior=Float64Array.from(uni,x=>(x+1)/(total+w)),lm=new Float64Array(w*w);
 for(let p=0;p<w;p++)for(let c=0;c<w;c++)lm[p*w+c]=Math.log((counts[p*w+c]+5*prior[c])/(totals[p]+5));
 return lm;
}
const rawPage=transcription.split('%')[54],cipher=[],starts=[],ends=[];
let active=false;
for(const ch of rawPage){
 if(runeIndex.has(ch)){cipher.push(runeIndex.get(ch));starts.push(!active);ends.push(false);active=true;}
 else if('-.$&§'.includes(ch)){if(ends.length)ends[ends.length-1]=true;active=false;}
}
if(ends.length)ends[ends.length-1]=true;
assert.equal(cipher.length,76);
assert.deepEqual(cipher,corpus.pages[55].indices);
starts[0]=false;ends[0]=true;
assert.equal(starts.filter(Boolean).length,16);
assert.equal(ends.filter(Boolean).length,17);

const ring=[
 ...Array.from({length:8},(_,c)=>c),
 ...Array.from({length:31},(_,r)=>(r+1)*8+7),
 ...Array.from({length:7},(_,i)=>31*8+6-i),
 ...Array.from({length:30},(_,i)=>(30-i)*8)
];
assert.equal(ring.length,76);
const key=new Map(ring.map(pos=>[pos,bytes[pos]]));
const unique=new Set(ring.map(pos=>key.get(pos)));
assert.equal(unique.size,68);

const lm=trainBigram(english),W=31,START=29,END=30;
function score(plain){
 let s=0,n=0;
 for(let i=0;i<plain.length;i++){
  if(i===0&&!starts[i]){if(ends[i]){s+=lm[plain[i]*W+END];n++;}}
  else{
   const prev=starts[i]?START:plain[i-1];
   s+=lm[prev*W+plain[i]];n++;
   if(ends[i]){s+=lm[plain[i]*W+END];n++;}
  }
 }
 return {score:s,events:n,perEvent:s/n,perRune:s/plain.length};
}
function preview(a){
 let s='';
 for(let i=0;i<a.length;i++){if(starts[i]&&i>0)s+=' ';s+=alphabet[a[i]];}
 return s;
}
const rawScore=score(cipher),candidates=[],uniqueOrders=new Set();
for(let offset=0;offset<76;offset++)for(const direction of [1,-1]){
 const traversal=Array.from({length:76},(_,i)=>ring[(offset+direction*i+152)%76]);
 const tieRank=new Map(traversal.map((pos,i)=>[pos,i]));
 for(const sortDirection of [1,-1]){
  const sorted=[...ring].sort((a,b)=>{
   const d=key.get(a)-key.get(b);
   return d!==0?sortDirection*d:tieRank.get(a)-tieRank.get(b);
  });
  uniqueOrders.add(sorted.join(','));
  for(const mapping of ['scatter','gather']){
   let plain;
   if(mapping==='scatter'){
    plain=Array(76);
    for(let r=0;r<76;r++)plain[ring.indexOf(sorted[r])]=cipher[r];
   }else plain=Array.from({length:76},(_,r)=>cipher[ring.indexOf(sorted[r])]);
   candidates.push({offset,direction,sort:sortDirection===1?'ascending':'descending',mapping,...score(plain),preview:preview(plain)});
  }
 }
}
candidates.sort((a,b)=>b.perEvent-a.perEvent);

const control=(english.slice(0,500).match(/[A-Za-z]+/g)||[]).flatMap(encodeWord).slice(0,76);
assert.equal(control.length,76);
const controlOrder=[...ring].sort((a,b)=>key.get(a)-key.get(b));
const encrypted=Array(76),recovered=Array(76);
for(let r=0;r<76;r++)encrypted[r]=control[ring.indexOf(controlOrder[r])];
for(let r=0;r<76;r++)recovered[ring.indexOf(controlOrder[r])]=encrypted[r];
assert.deepEqual(recovered,control);

const p56='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'.split(' ');
let p56Score=0,p56Events=0;
for(const word of p56){let prev=START;for(const cur of encodeWord(word)){p56Score+=lm[prev*W+cur];p56Events++;prev=cur;}p56Score+=lm[prev*W+END];p56Events++;}
console.log(JSON.stringify({
 base60_grid_sha256:gridSha,p55_runes:cipher.length,word_starts:starts.filter(Boolean).length,word_ends:ends.filter(Boolean).length,
 perimeter_cells:ring.length,unique_values:unique.size,duplicate_cells:ring.length-unique.size,
 candidates:candidates.length,unique_sorted_orders:uniqueOrders.size,
 raw_score_per_event:rawScore.perEvent,known_p56_score_per_event:p56Score/p56Events,
 best:candidates.slice(0,12),positive_control:'76-symbol transposition inverse recovered exact synthetic plaintext'
},null,2));
