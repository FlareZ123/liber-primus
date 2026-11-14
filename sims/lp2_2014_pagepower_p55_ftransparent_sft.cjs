'use strict';

/**
 * Source-era 2014 June 15 page-number prime-power key.
 * Historical participant conjecture, not an authenticated Cicada instruction.
 *
 * nikkler in original 2014 #cicadasolvers, line 200887:
 * (nth_prime(character position) ** (pagenumber-57))-1 [sic].
 *
 * This frozen, human-executable continuation fits solved p56 for exponent1,
 * and clear p57 for exponent0. Test direct next unknown p55 exponent2.
 *
 * node sims/lp2_2014_pagepower_p55_ftransparent_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const filename=path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json');
const raw=fs.readFileSync(filename);
const sourceSHA256=crypto.createHash('sha256').update(raw).digest('hex');
const book=JSON.parse(raw.toString('utf8'));
const gp=book.translit;
const pageNo=n=>book.pages.find(p=>p.page===n);
const p55=pageNo(55).indices,p56=pageNo(56).indices,p57=pageNo(57).indices;
const mod=x=>(x%29+29)%29;

function primesThrough(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}
const primes=primesThrough(100);

/** @param {number} n @param {number} exponent */
function powerMod29(n,exponent){
  let out=1;
  for(let i=0;i<exponent;i++)out=mod(out*n);
  return out;
}
/**
 * An F cipher glyph may be a bypassed literal-F or encrypted non-F.
 * The bypass consumes no prime-key position. For strict authentic
 * encoding, plaintext F MUST emit ciphertext F via bypass.
 *
 * @param {number[]} ciphertext
 * @param {number} exponent
 * @param {number} mask
 */
function decode(ciphertext,exponent,mask){
  let clock=0,seenF=0;
  const original=[];
  for(let i=0;i<ciphertext.length;i++){
    const c=ciphertext[i];
    const isBypass=c===0 && (mask&(1<<seenF))!==0;
    if(c===0)seenF++;
    if(isBypass){original.push(0);continue;}
    const step=mod(powerMod29(primes[clock++],exponent)-1);
    original.push(mod(c-step));
  }
  return original;
}
/**
 * @param {number[]} plaintext
 * @param {number} exponent
 */
function encode(plaintext,exponent){
  let clock=0;
  return plaintext.map(p=>{
    if(p===0)return 0;
    return mod(p+powerMod29(primes[clock++],exponent)-1);
  });
}
function nativeWords(s){
  const alphabet=gp.map((r,i)=>[r,i]).sort((a,b)=>b[0].length-a[0].length);
  const answer=[];
  for(const word of s.split(' ')){
    for(let i=0;i<word.length;){
      const pair=alphabet.find(x=>word.startsWith(x[0],i));
      assert(pair,'Unencodable source spelling '+word.slice(i));
      answer.push(pair[1]);i+=pair[0].length;
    }
  }
  return answer;
}
function ioc(indices){
  const counts=Array(29).fill(0);
  for(const c of indices)counts[c]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(indices.length*(indices.length-1));
}

assert.equal(p55.length,76);
assert.equal(p56.length,85);
assert.equal(p57.length,95);
const p56Known=nativeWords('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.deepEqual(decode(p56,1,8),p56Known,'Solved p56 must decode exactly');
assert.deepEqual(encode(p56Known,1),p56,'Solved p56 must reencrypt exactly');
assert.deepEqual(decode(p57,0,0),p57,'Clear p57 must remain unchanged');
assert.deepEqual(encode(p57,0),p57,'Clear p57 must reencrypt exactly');

const fPositions=p55.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
assert.deepEqual(fPositions,[15,25,41]);
const outcomes=[];
for(let mask=0;mask<1<<fPositions.length;mask++){
  const plain=decode(p55,2,mask);
  const forbidden=plain.map((p,i)=>p===0&&p55[i]!==0?i:-1).filter(i=>i>=0);
  const roundTrip=encode(plain,2).every((v,i)=>v===p55[i]);
  assert(forbidden.length>0,'Original p55 unexpectedly admits a strict-F inverse');
  assert(!roundTrip,'Illegal plaintext-F must prevent strict native reencryption');
  outcomes.push({mask,unrecoverablePlaintextFPositions:forbidden,
    ioc:+ioc(plain).toFixed(8),
    first50GP:plain.slice(0,50).map(i=>gp[i]).join('')});
}
assert.equal(outcomes.length,8);
// Independently original-era July 28's proposed stacked layers must contain
// one strict p56 phi(prime) outer layer. This stronger necessary condition is
// violated by all original p55 ciphertext-F skip choices before any inner
// layer can be reached, regardless of what that inner layer would be.
const outerLayerOutcomes=[];
for(let mask=0;mask<1<<fPositions.length;mask++){
  const intermediate=decode(p55,1,mask);
  const forbidden=intermediate.map((p,i)=>p===0&&p55[i]!==0?i:-1).filter(i=>i>=0);
  assert(forbidden.length>0,'Original p55 admits an unexpected strict phi outer layer');
  assert.notDeepEqual(encode(intermediate,1),p55);
  outerLayerOutcomes.push({mask,unrecoverableIntermediateFPositions:forbidden});
}
assert.equal(outerLayerOutcomes.length,8);
console.log(JSON.stringify({
  source:'#cicadasolvers 2014 Jun 15 line 200887, source Git blob bdd277c14f94c34b5ae714cd00c238065beeed4e',
  model:'K(page,i)=prime(i)^(57-page)-1 mod29, page-reset prime clock, source-native transparent plaintext F',
  sourceSHA256,p55CipherLength:p55.length,p55CipherFPositions:fPositions,
  p56NativeSolvedControl:'85/85 original GP symbols exact; strict forward reencryption',
  p57NativeClearControl:'95/95 original GP symbols unchanged; strict forward reencryption',
  testedOriginalP55Masks:outcomes,
  p56PhiOuterLayerOriginalMasks:outerLayerOutcomes,
  decision:'8/8 page-power inverses impossible; independently 8/8 outer phi(prime) strict-F inverses impossible, excluding any extra-layer model with precisely that outermost source-native p56 step on page-reset p55.',
  noUnknownPlaintextOrKeyRecovered:true
},null,2));
