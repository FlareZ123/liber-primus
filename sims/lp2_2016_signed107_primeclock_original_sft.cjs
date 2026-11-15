"use strict";
/**
 * Use the independently authenticated 2016 GPG signature's exact
 * six-digit UTC HHMMSS timestamp string (000107) as a literal prime ordinal start for the
 * historical, p56-proven phi(prime)-1 GP29 cipher with transparent F.
 *
 * Test original first 729-rune chapter and p55 76-rune body.
 * Every legal choice of transparent F is explored by an exact-state DP.
 *
 * Node22 CJS SFT: node sims/lp2_2016_signed107_primeclock_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source = fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const signatureText = source.split("-----BEGIN PGP SIGNATURE-----")[1].split("-----END PGP SIGNATURE-----")[0];
const lines = signatureText.split(/\r?\n/);
const sep = lines.findIndex(x=>x.trim()==="");
assert(sep>=0);
const armored=lines.slice(sep+1).filter(x=>/^[A-Za-z0-9+/]+={0,2}$/.test(x)).join("");
const packet=Buffer.from(armored,"base64");
assert.equal(packet.length,543);
assert.equal(packet[0],0x89);
assert.equal(packet.readUInt16BE(1),540);
const body=packet.subarray(3);
assert.deepEqual([...body.subarray(0,8)],[4,1,1,2,0,6,5,2]);
const timestamp=body.readUInt32BE(8);
assert.equal(timestamp,1451606467);
const time=new Date(timestamp*1000);
assert.equal(time.toISOString(),"2016-01-01T00:01:07.000Z");
const ordinal=time.getUTCHours()*10000+time.getUTCMinutes()*100+time.getUTCSeconds();
assert.equal(ordinal,107);
const mod=x=>(x%29+29)%29;

/** @param {number} total */
function firstPrimes(total) {
  const primes=[];
  for(let x=2;primes.length<total;x++) {
    let prime=true;
    for(const p of primes) {if(p*p>x)break;if(x%p===0){prime=false;break;}}
    if(prime)primes.push(x);
  }
  return primes;
}
const primes=firstPrimes(ordinal+12956+90);
const p56=corpus.pages.find(p=>p.page===56).indices;
assert.equal(p56.length,85);
assert.equal(p56[56],0);
let clock=0;
const expectedPlain=[];
for(let i=0;i<p56.length;i++){
  if(i===56){expectedPlain.push(0);continue;}
  const shift=mod(primes[clock]-1);
  const plain=mod(p56[i]-shift);
  assert.notEqual(plain,0,"Non-transparent p56 positions must not decode as F");
  expectedPlain.push(plain);
  clock++;
}
assert.equal(clock,84);
const knownText=expectedPlain.map(x=>corpus.translit[x]).join("");
assert.ok(knownText.startsWith("ANENDWITHINTHEDEEPWEB"),knownText.slice(0,40));
let reconstructed=[];
clock=0;
for(const p of expectedPlain) {
  if(p===0){reconstructed.push(0);continue;}
  reconstructed.push(mod(p+primes[clock++]-1));
}
assert.deepEqual(reconstructed,p56);
/**
 * Exact dynamic feasibility for the original transparent-F prime stream.
 * The state is the number of prime steps consumed after k original runes;
 * distinct paths with the same k are equivalent for future validity.
 * @param {number[]} cipher
 * @param {number} initialOrdinal
 */
function allTransparentFStates(cipher,initialOrdinal) {
  let states=new Set([0]);
  let most=1;
  let finalAt=-1;
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    for(const clock of states){
      const shift=mod(primes[initialOrdinal-1+clock]-1);
      const v=mod(cipher[i]-shift);
      if(v!==0)next.add(clock+1); // encrypted non-F consumes prime
      if(cipher[i]===0)next.add(clock); // only literal F is transparent
    }
    if(!next.size){finalAt=i;return {valid:false,earliestFailureRune:i,statesAtFailure:states.size,maximumStates:most};}
    states=next;
    most=Math.max(most,states.size);
  }
  return {valid:true,survivingPrimeClocks:[...states].sort((a,b)=>a-b),stateCount:states.size,maximumStates:most};
}
const solved=allTransparentFStates(p56,1);
assert.equal(solved.valid,true);
assert.ok(solved.survivingPrimeClocks.includes(84));
const unknown=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
const p55=corpus.pages.find(p=>p.page===55).indices;
assert.equal(p55.length,76);
const test={
  signatureTimestamp:time.toISOString(),
  exactSignedMetadataOrdinal:ordinal,
  originalKnownPlaintextFirst:knownText.slice(0,55),
  p56KnownPositive:solved,
  firstRite729:allTransparentFStates(unknown.slice(0,729),ordinal),
  firstPhysicalPage:allTransparentFStates(corpus.pages.find(p=>p.page===0).indices,ordinal),
  p55:allTransparentFStates(p55,ordinal)
};
console.log(JSON.stringify({
  premise:"The 2016 genuine signed message was signed at 00:01:07 UTC on 1 January; the decimal HHMMSS string is 000107, a source-native possible prime ordinal. Trial transfers the established p56 prime-totient/F-transparent cipher with start rank 107, no other fitted key.",
  weakestAssumption:"The signature timestamp is historically authentic but no original Cicada instruction transfers its HHMMSS decimal digits into a GP29 prime start for encrypted LP2 pages.",
  source:test,
  result:"A legal F-mask is an algebraic feasibility gate, not a recovered plaintext; require actual readable original text and full forward inversion for success."
},null,2));
