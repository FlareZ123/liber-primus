'use strict';
/**
 * A key proposed by the complete original p8 red word read backwards:
 * XIXM -> canonical Roman MXIX -> prime1019, whose zero-based prime index170
 * gives an unambiguous native p56 phi(prime)-F-skip key start.
 *
 * Test the correct p56 solved key machine, then all legal actual-source F masks
 * of the original p8 243 black runes in both source directions and ± signs.
 * Every reported failure means NO legal full original GP29 inverse under the
 * exact proposed model, independent of language or a fitted exception.
 * Windows11/Node22/CommonJS, read-only, no external modules.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const c=JSON.parse(fs.readFileSync(path.resolve(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p8=c.pages.find(x=>x.page===8).indices;
assert.equal(p8.length,255);
assert.deepEqual(p8.slice(0,4),[14,10,14,19]);
const body=p8.slice(12);
assert.equal(body.length,243);
const primes=[];
for(let number=2;primes.length<5400;number++){
  let good=true;
  for(let d=2;d*d<=number;d++)if(number%d===0){good=false;break}
  if(good)primes.push(number);
}
const start=primes.indexOf(1019);
assert.equal(start,170);
assert.deepEqual(primes.slice(168,173),[1009,1013,1019,1021,1031]);
const mod=n=>(n%29+29)%29;
/**
 * Legal native p56 transparent-F inverse, with EVERY possible authentic
 * literal-F bypass mask retained exactly via consumed-key state merging.
 * @param {number[]} tape Original GP29 symbols.
 * @param {number} primeIndex Source-selected 0-based prime cursor.
 * @param {1|-1} sign Inverse additive key sign.
 * @returns {{matched:number,terminal:number[],blocker?:number}}
 */
function reach(tape,primeIndex,sign){
  let states=new Set([0]);
  for(let i=0;i<tape.length;i++){
    const cipher=tape[i],next=new Set();
    for(const used of states){
      const plaintext=mod(cipher-sign*(primes[primeIndex+used]-1));
      if(plaintext!==0)next.add(used+1);
      if(cipher===0)next.add(used);
    }
    if(next.size===0)return {matched:i,terminal:[],blocker:cipher};
    states=next;
  }
  return {matched:tape.length,terminal:[...states]};
}
// Complete authentic p56 calibration with source plaintext and true one-F skip.
const gpTokens=c.translit.map((token,value)=>({token,value})).sort((a,b)=>b.token.length-a.token.length);
function word(text){
  const out=[];
  const s=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  for(let at=0;at<s.length;){
    const chosen=gpTokens.find(t=>s.startsWith(t.token,at));
    assert.ok(chosen,'Unrecognized GP rune');
    out.push(chosen.value);
    at+=chosen.token.length;
  }
  return out;
}
const clear=('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '
  +'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(word);
assert.equal(clear.length,85);
let used=0;
const encrypted=clear.map(p=>p===0?0:mod(p+primes[used++]-1));
assert.equal(used,84);
assert.deepEqual(encrypted,c.pages.find(p=>p.page===56).indices);
const positive=reach(encrypted,0,1);
assert.equal(positive.matched,85);
assert(positive.terminal.includes(84));

const rows=[];
for(const reversed of [false,true]){
  const tape=reversed?body.slice().reverse():body;
  for(const sign of [1,-1]){
    const r=reach(tape,start,sign);
    assert(r.matched<body.length);
    rows.push({reversed,sign,originalRunes:body.length,
      firstImpossibleOffset:r.matched,
      impossibleCipherRune:c.translit[r.blocker]});
  }
}
assert.deepEqual(rows,[
  {reversed:false,sign:1,originalRunes:243,firstImpossibleOffset:37,impossibleCipherRune:'TH'},
  {reversed:false,sign:-1,originalRunes:243,firstImpossibleOffset:9,impossibleCipherRune:'C'},
  {reversed:true,sign:1,originalRunes:243,firstImpossibleOffset:43,impossibleCipherRune:'U'},
  {reversed:true,sign:-1,originalRunes:243,firstImpossibleOffset:50,impossibleCipherRune:'L'}
]);
// The *literal Roman integer* 1019 is a separate, equally source-typed
// p56 prime CURSOR, rather than the zero-based cursor170 of prime VALUE1019.
// Prime[1019]=8111, and phi(8111) mod29=19, independently echoing XIX.
// This is a genuine full-original cipher arithmetic survivor, but the
// resulting runes remain near-uniform gibberish. Preserve both observations.
const directCursor=1019;
assert.equal(primes[directCursor],8111);
assert.equal((primes[directCursor]-1)%29,19);
const sourceCursorModes=[];
for(const reversed of [false,true]) {
  const tape=reversed?body.slice().reverse():body;
  for(const sign of [1,-1]) {
    const result=reach(tape,directCursor,sign);
    sourceCursorModes.push({reversed,sign,reached:result.matched,
      glyph:result.blocker===undefined?null:c.translit[result.blocker],
      terminals:result.terminal});
  }
}
assert.deepEqual(sourceCursorModes,[
  {reversed:false,sign:1,reached:243,glyph:null,terminals:[240,239,235]},
  {reversed:false,sign:-1,reached:153,glyph:'NG',terminals:[]},
  {reversed:true,sign:1,reached:18,glyph:'O',terminals:[]},
  {reversed:true,sign:-1,reached:131,glyph:'J',terminals:[]}
]);
// Resolve ALL 8 authentic ciphertext-F events directly (all 256 masks);
// there is no fitting to plaintext frequency or to a desired passage.
const fSites=body.map((x,i)=>x===0?i:-1).filter(x=>x>=0);
assert.deepEqual(fSites,[22,149,171,177,180,184,191,233]);
const candidates=[];
for(let mask=0;mask<2**fSites.length;mask++){
  let used=0,bit=0,legal=true;
  const plaintext=[];
  for(const cipher of body){
    let plain;
    if(cipher===0&&(mask&(1<<bit)))plain=0;
    else{
      plain=mod(cipher-(primes[directCursor+used]-1));
      used++;
      if(plain===0){legal=false;break}
    }
    if(cipher===0)bit++;
    plaintext.push(plain);
  }
  if(!legal)continue;
  assert.equal(plaintext.length,body.length);
  // Exactly re-encrypt all 243 original ciphertext runes with the native
  // F-bypass and the same prime cursor, no hidden missing symbols.
  let checkUsed=0;
  const replay=plaintext.map(p=>p===0?0:mod(p+primes[directCursor+checkUsed++]-1));
  assert.deepEqual(replay,body);
  assert.equal(checkUsed,used);
  const freq=new Array(29).fill(0);
  for(const value of plaintext)freq[value]++;
  const ioc=freq.reduce((sum,n)=>sum+n*(n-1),0)/(body.length*(body.length-1));
  candidates.push({mask,used,ioc,first3:plaintext.slice(0,3).map(v=>c.translit[v]).join(' ')});
}
assert.deepEqual(candidates.map(z=>[z.mask,z.used]),[[7,240],[135,239],[255,235]]);
assert(candidates.every(z=>z.ioc<0.04 && z.first3==='H P X'));
// Against a frozen, complete 5000-start finite reference, only 24 cursors
// survive this exact original black243 receiver; only 3 of those have the
// printed source XIX=19 as their first totient residue.
const sourceStarts=[];
let matchingFirstKey=0;
for(let start=0;start<5000;start++){
  const firstKey=(primes[start]-1)%29;
  if(firstKey===19)matchingFirstKey++;
  const result=reach(body,start,1);
  if(result.matched===243)sourceStarts.push({start,firstKey,terminal:result.terminal});
}
assert.equal(sourceStarts.length,24);
assert.equal(matchingFirstKey,181);
assert.deepEqual(sourceStarts.filter(x=>x.firstKey===19).map(x=>x.start),[156,605,1019]);

console.log(JSON.stringify({
  firstRedWholeWord:'XIXM',reverseRoman:'MXIX',decodedPrime:1019,
  GP0FirstWordProduct:4,originalSecondWholeWordProduct:3,
  originalPrimeOffset:start,originalPrimeAtOffset:primes[start],
  solvedP56:{runes:85,nonFConsumed:84,inverseTerminalStates:positive.terminal},
  failedSourceSelectedP8BlackDirectConsumers:rows,
  literalPrimeCursor1019:{actualPrime:primes[1019],firstKeyResidue19:true,
    fourDirections:sourceCursorModes,legalOriginalMasks:candidates,
    starts0to4999:5000,arithmeticallyLegalStarts:sourceStarts.length,
    startsWithFirstKeyResidue19:matchingFirstKey,
    jointSurvivorStarts:sourceStarts.filter(x=>x.firstKey===19).map(x=>x.start)},
  classification:'prime-value cursor170 excluded; prime-index cursor1019 algebraically survives on p8 black243 but all 3 outputs nonprose'
},null,2));
console.log('PASS p56 known source and prime1019 170/1019-cursor 243-rune full-mask gates');
