'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const INPUTS = {
  corpus:'resources/liber-primus/lp2-corpus.json',
  grid:'resources/liber-primus/lp2-grid-256.json',
  gibran:'resources/control/gibran_prophet_58585.txt',
  shakespeare:'resources/control/shakespeare_first300k.txt',
  emerson:'resources/control/emerson_essays_2944.txt',
  combined:'im-results/lp2-p50-fhold-combined-certificate.json',
  sliding:'im-results/lp2-p50-fhold-all-sliding-native.json'
};
const EXPECTED_BLOBS = {
  'resources/liber-primus/lp2-corpus.json':'054f2a0f780b7d46901acbe3d9bf4f0ac1801165',
  'resources/liber-primus/lp2-grid-256.json':'2550eae357442912220e05dc51147523a61dd75a',
  'resources/control/gibran_prophet_58585.txt':'df260a07d56bf5998d40a6360b6132c35c252d10',
  'resources/control/shakespeare_first300k.txt':'94c677ad9dd50771c6670e0c4e4dad9052b46d85',
  'resources/control/emerson_essays_2944.txt':'a92be8ba5b3511a003a22ba31523c14397aaa83a',
  'im-results/lp2-p50-fhold-combined-certificate.json':'0a8a0f537cdcec629832a9400ed546f5911a9a4e',
  'im-results/lp2-p50-fhold-all-sliding-native.json':'1abfa177afa3b7f35186c488228f81b4eea53dcd'
};
function readInput(name) {
  const buf=fs.readFileSync(path.join(ROOT,INPUTS[name]));
  const header=Buffer.from('blob '+buf.length+'\0');
  const sha=crypto.createHash('sha1').update(header).update(buf).digest('hex');
  assert.equal(sha,EXPECTED_BLOBS[INPUTS[name]],'pinned Git blob changed: '+INPUTS[name]);
  return {buf,text:buf.toString('utf8'),sha};
}
const input=Object.fromEntries(Object.keys(INPUTS).map(k=>[k,readInput(k)]));
const sourceGitBlobShas=Object.fromEntries(Object.entries(input).map(([k,v])=>[INPUTS[k],v.sha]));
const corpus=JSON.parse(input.corpus.text),grid=JSON.parse(input.grid.text);
const certificate=JSON.parse(input.combined.text),slidingSource=JSON.parse(input.sliding.text);
const tokenCells=grid.pages.flatMap(p=>p.tokens),tokenNames=[...new Set(tokenCells)];
const tokenIds=Uint8Array.from(tokenCells.map(t=>tokenNames.indexOf(t)));
const ciphertext=Uint8Array.from(corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices));
const N=ciphertext.length,Q=tokenIds.length,T=tokenNames.length,L=T*29;
assert.equal(N,3008);assert.equal(Q,256);assert.equal(T,161);
assert.equal(ciphertext.reduce((n,v)=>n+(v===0),0),125);
assert.equal(certificate.B.length,126);assert.equal(slidingSource.n,N);
const transliterations=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeDonor(text){
 const out=[];
 for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  while(word.length){const token=transliterations.find(t=>word.startsWith(t.s));if(!token)throw new Error('unencodable donor fragment: '+word);out.push(token.i);word=word.slice(token.s.length);}
 }
 return Uint8Array.from(out);
}
function between(text,start,end){const a=text.indexOf(start),b=text.indexOf(end);if(a<0||b<=a)throw new Error('donor framing changed');return text.slice(a,b);}
const donors=[
 ['Gibran',encodeDonor(between(input.gibran.text,'Almustafa, the{7} chosen','End of the Project Gutenberg EBook of The Prophet'))],
 ['Shakespeare',encodeDonor(input.shakespeare.text)],
 ['Emerson',encodeDonor(between(input.emerson.text,'THERE is one mind','*** END OF THIS PROJECT GUTENBERG EBOOK'))]
];
const expectedRefs=certificate.sliding.refs;
assert.deepEqual(expectedRefs.map(r=>r.name),slidingSource.refs.map(r=>r.name));
for(let i=0;i<expectedRefs.length;i++){assert.equal(expectedRefs[i].windows,slidingSource.refs[i].windows);assert.deepEqual(expectedRefs[i].byH,slidingSource.refs[i].byH);}
const totalWindows=expectedRefs.reduce((s,r)=>s+r.windows,0);
const totalExcluded=expectedRefs.reduce((s,r)=>s+r.excluded,0);
const expectedScalar=totalWindows-totalExcluded;
assert.equal(totalWindows,561456);assert.equal(totalExcluded,536843);assert.equal(expectedScalar,24613);
const forward=new Int8Array(L),reverse=new Int8Array(L);
function checkBijection(plain,start,cipher=ciphertext){
 forward.fill(-1);reverse.fill(-1);let holds=0,edges=0,consumingZeros=0;
 for(let i=0;i<N;i++){
  const p=plain[start+i],c=cipher[i];
  if(p===0){if(c!==0)return {ok:false,reason:'hold-mismatch',at:i,H:holds};holds++;continue;}
  const cls=tokenIds[(i-holds)%Q],fi=cls*29+p,ri=cls*29+c;if(c===0)consumingZeros++;
  if(forward[fi]!==-1&&forward[fi]!==c)return {ok:false,reason:'forward-conflict',at:i,H:holds,token:tokenNames[cls],plain:p,cipher:c,existing:forward[fi]};
  if(reverse[ri]!==-1&&reverse[ri]!==p)return {ok:false,reason:'reverse-conflict',at:i,H:holds,token:tokenNames[cls],plain:p,cipher:c,existing:reverse[ri]};
  forward[fi]=c;reverse[ri]=p;edges++;
 }
 const edgesByClass=[],edgeList=[];let mappedClasses=0;
 for(let cls=0;cls<T;cls++){let count=0;for(let p=1;p<29;p++){const c=forward[cls*29+p];if(c!==-1){count++;edgeList.push([cls,p,c]);}}if(count)mappedClasses++;edgesByClass.push(count);}
 return {ok:true,H:holds,edges,consumingZeros,mappedClasses,unobservedEntries:T*29-edges,edgesByClass,edgeList};
}
const rejectionCounts={'hold-mismatch':0,'forward-conflict':0,'reverse-conflict':0};
const byDonor=[],witnesses=[];let scalarSurvivors=0,exactSurvivors=0;
for(const [name,donor] of donors){
 const counts=Array.from({length:Q},()=>new Int16Array(L)),scores=new Int32Array(Q);
 let leftNonF=0,rightNonF=0,H=0,windows=0,donorScalar=0,donorExact=0;
 function update(index,value,sign){for(let phase=0;phase<Q;phase++){const cell=tokenIds[(index-phase+Q)%Q]*29+value,count=counts[phase][cell];scores[phase]+=sign===1?count:1-count;counts[phase][cell]+=sign;}}
 for(let j=0;j<N;j++){const v=donor[j];if(v===0)H++;else update(rightNonF++,v,1);}
 const lastStart=donor.length-N;
 for(let start=0;start<=lastStart;start++){
  windows++;const collisionScore=scores[leftNonF%Q];
  if(H<=125&&collisionScore<=certificate.B[H]){
   scalarSurvivors++;donorScalar++;const result=checkBijection(donor,start,ciphertext);
   if(result.ok){exactSurvivors++;donorExact++;if(witnesses.length<100)witnesses.push({donor:name,start,H:result.H,edges:result.edges,consumingZeros:result.consumingZeros,mappedClasses:result.mappedClasses,unobservedEntries:result.unobservedEntries,edgesByClass:result.edgesByClass,edgeList:result.edgeList});}
   else rejectionCounts[result.reason]++;
  }
  if(start===lastStart)break;
  const leaving=donor[start],entering=donor[start+N];
  if(leaving===0)H--;else update(leftNonF++,leaving,-1);
  if(entering===0)H++;else update(rightNonF++,entering,1);
 }
 byDonor.push({name,windows,scalarSurvivors:donorScalar,exactBijections:donorExact});
}
assert.equal(scalarSurvivors,expectedScalar);assert.equal(exactSurvivors,0);
assert.deepEqual(rejectionCounts,{'hold-mismatch':18087,'forward-conflict':5946,'reverse-conflict':580});
assert.deepEqual(byDonor,[
 {name:'Gibran',windows:43774,scalarSurvivors:213,exactBijections:0},
 {name:'Shakespeare',windows:214099,scalarSurvivors:21695,exactBijections:0},
 {name:'Emerson',windows:303583,scalarSurvivors:2705,exactBijections:0}
]);
assert.equal(witnesses.length,0);
function rngOf(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function shuffle(array,rng){for(let i=array.length-1;i>0;i--){const j=rng()%(i+1);[array[i],array[j]]=[array[j],array[i]];}return array;}
function plantPermutation(plain,transparent,seed){
 const rng=rngOf(seed),holds=Array.from(plain,p=>transparent&&p===0),histogram=new Int32Array(L);let H=0;
 for(let i=0;i<N;i++){if(holds[i]){H++;continue;}histogram[tokenIds[(i-H)%Q]*29+plain[i]]++;}
 const goal=125-H;if(goal<0)throw new Error('control has too many held Fs');
 let reachable=new Uint8Array(goal+1);reachable[0]=1;const backPointers=[];
 for(let cls=0;cls<T;cls++){
  const next=new Uint8Array(goal+1),back=new Int8Array(goal+1).fill(-1),order=shuffle(Array.from({length:29},(_,i)=>i),rng);
  for(const p0 of order){const contribution=histogram[cls*29+p0];for(let sum=0;sum+contribution<=goal;sum++){if(reachable[sum]&&!next[sum+contribution]){next[sum+contribution]=1;back[sum+contribution]=p0;}}}
  backPointers.push(back);reachable=next;
 }
 if(!reachable[goal])throw new Error('control zero count is not reachable');
 const zeroPlain=new Int8Array(T);let remaining=goal;
 for(let cls=T-1;cls>=0;cls--){const p0=backPointers[cls][remaining];if(p0<0)throw new Error('control subset-sum backtrack failed');zeroPlain[cls]=p0;remaining-=histogram[cls*29+p0];}
 const permutations=Array.from({length:T},()=>new Uint8Array(29));
 for(let cls=0;cls<T;cls++){const p0=zeroPlain[cls],plainOrder=shuffle(Array.from({length:29},(_,i)=>i).filter(p=>p!==p0),rng),cipherOrder=shuffle(Array.from({length:29},(_,i)=>i).filter(c=>c!==0),rng);permutations[cls][p0]=0;for(let j=0;j<28;j++)permutations[cls][plainOrder[j]]=cipherOrder[j];}
 const cipher=new Uint8Array(N);let h=0,consumingZeros=0;
 for(let i=0;i<N;i++){if(holds[i]){cipher[i]=0;h++;}else{const cls=tokenIds[(i-h)%Q];cipher[i]=permutations[cls][plain[i]];if(cipher[i]===0)consumingZeros++;}}
 const visibleZeros=cipher.reduce((n,v)=>n+(v===0),0);assert.equal(visibleZeros,125);
 return {cipher,H,consumingZeros,visibleZeros};
}
function withheldPrediction(plain,cipher){
 const learned=new Int8Array(L).fill(-1);let h=0,heldout=0,holdChecks=0,predicted=0,correct=0,unknown=0;
 for(let i=0;i<N;i++){const p=plain[i],c=cipher[i],test=i%5===0;if(p===0){if(test){holdChecks++;assert.equal(c,0);}h++;continue;}
  const cls=tokenIds[(i-h)%Q],index=cls*29+p;
  if(test){heldout++;if(learned[index]!==-1){predicted++;if(learned[index]===c)correct++;}else unknown++;}
  else{if(learned[index]!==-1&&learned[index]!==c)throw new Error('control training map is inconsistent');learned[index]=c;}
 }
 return {heldout,holdChecks,predicted,correct,unknown,coverage:predicted/heldout,accuracy:correct/predicted};
}
const starts=[1234,4567,7890],seeds=[0x12345678,0x9e3779b9,0xdecafbad],controls=[];
for(let i=0;i<3;i++){
 const [name,donor]=donors[i],plain=donor.subarray(starts[i],starts[i]+N);
 const positive=plantPermutation(plain,true,seeds[i]),positiveCheck=checkBijection(plain,0,positive.cipher);
 assert.equal(positiveCheck.ok,true);
 controls.push({donor:name,start:starts[i],clock:'native-F-hold',H:positive.H,visibleCipherF:positive.visibleZeros,consumingZeros:positive.consumingZeros,exact:{ok:true,edges:positiveCheck.edges},withheld:withheldPrediction(plain,positive.cipher)});
 const negative=plantPermutation(plain,false,(seeds[i]+0x13579bdf)>>>0),negativeCheck=checkBijection(plain,0,negative.cipher);
 assert.equal(negativeCheck.ok,false);
 controls.push({donor:name,start:starts[i],clock:'ordinary-consuming-wrong-clock',H:negative.H,visibleCipherF:negative.visibleZeros,consumingZeros:negative.consumingZeros,exact:{ok:false,reason:negativeCheck.reason,at:negativeCheck.at}});
}
assert.deepEqual(controls.map(c=>c.clock==='native-F-hold'?[c.H,c.consumingZeros,c.exact.edges,c.withheld.heldout,c.withheld.holdChecks,c.withheld.predicted,c.withheld.correct,c.withheld.unknown]:[c.exact.reason,c.exact.at]),[
 [66,59,2942,591,11,214,214,377],['hold-mismatch',0],
 [60,65,2948,589,13,218,218,371],['forward-conflict',52],
 [91,34,2917,582,20,203,203,379],['hold-mismatch',29]
]);
const output={
 schema:'lp2-p50-literal-token-fhold-bijection-sft-v1',
 sourceGitBlobShas,
 dimensions:{ciphertextRunes:N,visibleCipherF:125,tokenCells:Q,tokenClasses:T,donorWindowRunes:N},
 scalarBound:{totalWindows,excluded:totalExcluded,survivors:scalarSurvivors,byDonor:byDonor.map(({name,windows,scalarSurvivors})=>({name,windows,scalarSurvivors}))},
 exactBijection:{survivors:exactSurvivors,firstConflictCounts:rejectionCounts,byDonor,witnesses,witnessesTruncated:false},
 controls,
 decision:'Reject the fixed p50 literal-token F-hold per-class-bijection receiver on the frozen Gibran, Shakespeare and Emerson donor corpus. This does not exclude other donors, other clocks, or unrelated p50 semantics.'
};
console.log(JSON.stringify(output,null,2));
