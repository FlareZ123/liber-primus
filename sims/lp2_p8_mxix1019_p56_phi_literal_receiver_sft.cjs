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
for(let number=2;primes.length<750;number++){
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
console.log(JSON.stringify({
  firstRedWholeWord:'XIXM',reverseRoman:'MXIX',decodedPrime:1019,
  GP0FirstWordProduct:4,originalSecondWholeWordProduct:3,
  originalPrimeOffset:start,originalPrimeAtOffset:primes[start],
  solvedP56:{runes:85,nonFConsumed:84,inverseTerminalStates:positive.terminal},
  failedSourceSelectedP8BlackDirectConsumers:rows,
  classification:'exact original-cipher illegal F, no plaintext and no rescued key'
},null,2));
console.log('PASS p56 authentic calibration and four complete p8 prime1019 exclusion gates');
