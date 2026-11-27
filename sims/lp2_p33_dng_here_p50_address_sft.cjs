'use strict';
// A conditional original-artifact coordinate candidate, NOT a decipherment:
// p33 giant D / NG primes -> solved HERE prime sum -> p50 0x40 -> p8 local64.
// Includes an independently original duplicated D.NG D.NG at p7,
// every canonical 2,896-word recipient, and all 256 wrong-phase table controls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const trans=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const idx=d.runes.map((r,i)=>[r,i]);
const table=grid.pages.flatMap(p=>p.tokens.flat());
assert.equal(table.length,256);assert.equal(d.pages[50].indices.length,0);
const p33=d.pages[33].indices;
const p33ink=ink.pages.find(p=>p.page===33);
assert.deepEqual(p33ink.red_spans.map(s=>[s.start,s.length]),[[0,10],[91,8]]);
const giant=[p33[0],p33[91]];
assert.deepEqual(giant,[23,21]);
assert.deepEqual(giant.map(i=>d.translit[i]),['D','NG']);
const giantGp0=giant.reduce((s,i)=>s+i,0),giantGpprime=giant.reduce((s,i)=>s+d.prime[i],0);
assert.equal(giantGp0,44);assert.equal(giantGpprime,168);
const HERE=[8,18,4,18],WAY=[7,24,26];
assert.equal(HERE.reduce((s,i)=>s+i,0),48);
assert.equal(HERE.reduce((s,i)=>s+d.prime[i],0),168);
assert.equal(WAY.reduce((s,i)=>s+d.prime[i],0),219);
assert.ok(solved.sections.find(s=>s.name==='0_welcome').source_text.includes(HERE.map(i=>d.runes[i]).join('')));
assert.equal(table[219],'0x');
assert.equal(table[168],'40');
const selectedOneBased=parseInt(table[168],16);assert.equal(selectedOneBased,64);
// Actual complete-word parser: page breaks and line wraps do not cut words.
const concat=trans.split('%').slice(0,55).join('');
const runeSet=new Set(d.runes);
const tape=d.pages.slice(0,56).flatMap(p=>p.indices);
let pos=0,word=[],words=[];
function end(){if(word.length){words.push({start:pos-word.length,indices:word});word=[];}}
for(const ch of concat){
 if(runeSet.has(ch)){assert.equal(d.runes[tape[pos]],ch,'transcription/corpus agreement');word.push(tape[pos++]);}
 else if('-.&$'.includes(ch))end();
}
end();
assert.equal(pos,12956);assert.equal(words.length,2896);
const pageStarts=[0];for(let p=0;p<56;p++)pageStarts.push(pageStarts[p]+d.pages[p].indices.length);
function locate(start){
 let page=0;
 while(page<55&&pageStarts[page+1]<=start)page++;
 return {page,localStart:start-pageStarts[page]};
}
function features(w){return {n:w.indices.length,GP0:w.indices.reduce((s,i)=>s+i,0),GPprime:w.indices.reduce((s,i)=>s+d.prime[i],0)};}
const aliases=words.filter(w=>features(w).GP0===48&&features(w).GPprime===168)
 .map(w=>({...locate(w.start),...features(w),runes:w.indices.map(i=>d.translit[i])}));
assert.deepEqual(aliases.map(w=>[w.page,w.localStart,w.n]),[[8,63,4],[27,40,4],[41,13,4]]);
const hits=aliases.filter(w=>w.localStart===selectedOneBased-1);
assert.deepEqual(hits.map(w=>w.page),[8]);
assert.deepEqual(hits[0].runes,['P','NG','U','P']);
const duplicated=[];
for(let i=1;i<words.length;i++){
 const a=words[i-1].indices,b=words[i].indices;
 if(a.length===b.length&&a.every((v,j)=>v===b[j]))
   duplicated.push({left:locate(words[i-1].start),right:locate(words[i].start),
     symbols:a.map(j=>d.translit[j])});
}
assert.equal(duplicated.length,1);
assert.deepEqual(duplicated[0],{
 left:{page:7,localStart:134},right:{page:7,localStart:136},symbols:['D','NG']});
// Honest conditional wrong-phase comparison: all table entries read as a hex
// byte; count those landing at one-based starts of any HERE dual-checksum alias.
const startAddresses=new Set(aliases.map(a=>a.localStart+1));
const wrongPhases=table.flatMap((token,i)=>/^[0-9a-fA-F]{2}$/.test(token)
  &&startAddresses.has(parseInt(token,16))?[{tableIndex:i,token,oneBased:parseInt(token,16)}]:[]);
assert.deepEqual(wrongPhases.map(x=>x.tableIndex),[108,137,154,168,181,238]);
// Strongest direct cipher temptation: the source marker's prime sum 168
// as a p15-style zero-based starting rank in the authenticated p56
// successive-prime/totient additive cipher, seeded AT the selected p8 word.
// It must recover exact HERE and continuation, not merely a checksum alias.
const primes=[];
for(let n=2;primes.length<240;n++){
 let q=true;for(let j=2;j*j<=n;j++)if(n%j===0){q=false;break}
 if(q)primes.push(n);
}
const c8=d.pages[8].indices;
const cipherStart=c8.slice(63,70);
assert.deepEqual(cipherStart.slice(0,4),['P','NG','U','P'].map(t=>d.translit.indexOf(t)));
const plusPrime=cipherStart.map((c,i)=>(c+primes[168+i]-1)%29);
const minusPrime=cipherStart.map((c,i)=>(c-(primes[168+i]-1)%29+29)%29);
assert.deepEqual(plusPrime.slice(0,4),[6,18,4,18]); // GERE, not HERE
assert.deepEqual(plusPrime.slice(4,7),[18,19,8]); // EMH, not native GP-English
assert.notDeepEqual(plusPrime.slice(0,4),HERE);
assert.notDeepEqual(minusPrime.slice(0,4),HERE);
const nativePlant=HERE.map((p,i)=>(p-(primes[168+i]-1)%29+29)%29);
assert.deepEqual(nativePlant.map((c,i)=>(c+primes[168+i]-1)%29),HERE);
console.log(JSON.stringify({
 p33Giant:['D','NG'],primeSum:giantGpprime,ordinalSum:giantGp0,
 signedReference:'HERE',referencePrimeSum:168,
 publishedHexSelector:{word:'WAY',GPprime:219,tableToken:table[219]},
 selectedGridEntry:{index:168,token:table[168],hexOneBased:selectedOneBased},
 recipientAliases:aliases,selectedRecipient:hits,onlyConsecutiveRepeatedPrintedWord:duplicated,
 primeTotientDirect:{startIndexZeroBased:168,firstFour:plusPrime.slice(0,4).map(i=>d.translit[i]),nextThree:plusPrime.slice(4,7).map(i=>d.translit[i]),exactHERE:false},
 conditionalWrongTablePhaseHits:wrongPhases.length+'/256',
 status:'candidate numeric page/word address; NOT verified ciphertext-to-plaintext decryption'
},null,2));
