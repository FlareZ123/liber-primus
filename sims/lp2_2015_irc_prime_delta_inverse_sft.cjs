'use strict';

/**
 * Original 2015 IRC participant's prime-then-difference observation
 * reconstructed exactly, plus nine visual-chapter prospective controls.
 *
 * L89874 and L89887–905 in original dated #cicadasolvers.freenode.2.log,
 * 4 Feb 2015, specify an imagined GP F rune before p0, shift by successive
 * primes and take neighboring rune differences. A negative prime shift and
 * the leading imagined F→prime2 establish a precise phase. Recover 40
 * neighboring derived-repeat pairs, as the participant independently said.
 *
 * Executable on Windows with Node.js 22, CommonJS, no external packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const lengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
const mod29=x=>(x%29+29)%29;

/** @param {number} length @returns {number[]} */
function primes(length) {
  const out=[];
  for(let n=2;out.length<length;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}

/**
 * Exact historic proposal: prepend hypothetical GP F=0, shift every rune
 * by the negative of the following prime, then take modular differences.
 * @param {number[]} cipher
 * @param {number[]} prime
 * @returns {number[]}
 */
function inverse(cipher,prime) {
  assert(prime.length>cipher.length);
  let prev=mod29(-prime[0]);
  return cipher.map((v,i)=>{
    const s=mod29(v-prime[i+1]);
    const delta=mod29(s-prev);
    prev=s;
    return delta;
  });
}

/**
 * Invert the literal historic proposed operation; it works on every GP29
 * original input and preserves exactly the number of runes.
 * @param {number[]} plain
 * @param {number[]} prime
 * @returns {number[]}
 */
function forward(plain,prime) {
  assert(prime.length>plain.length);
  let prev=mod29(-prime[0]);
  return plain.map((v,i)=>{
    prev=mod29(prev+v);
    return mod29(prev+prime[i+1]);
  });
}

/** @param {number[]} source */
function equalsAdjacent(source) {
  let n=0;
  for(let i=1;i<source.length;i++)if(source[i]===source[i-1])n++;
  return n;
}
/** @param {number[]} source */
function ioc(source) {
  const count=new Array(29).fill(0);
  for(const rune of source)count[rune]++;
  return count.reduce((a,n)=>a+n*(n-1),0)/(source.length*(source.length-1));
}

/**
 * Control: rotate intact source GP ciphertext relative to the exact prime
 * stream. Retains its unigram profile, adjacency transitions, printed runes
 * and its fixed rare-repetition property. A significance claim is conditional
 * on this alignment ensemble and does not correct hypothesis discovery.
 * @param {number[]} source
 * @param {number[]} prime
 */
function circularAudit(source,prime) {
  const len=source.length;
  const tests=[];
  for(let rotation=0;rotation<len;rotation++){
    let beforeShift=mod29(-prime[0]),beforeStep=-1,count=0;
    for(let i=0;i<len;i++){
      const shifted=mod29(source[(rotation+i)%len]-prime[i+1]);
      const step=mod29(shifted-beforeShift);
      if(i>0&&step===beforeStep)count++;
      beforeStep=step;
      beforeShift=shifted;
    }
    tests.push(count);
  }
  const observed=tests[0],mean=tests.reduce((a,b)=>a+b,0)/len;
  const sigma=Math.sqrt(tests.reduce((a,b)=>a+(b-mean)**2,0)/len);
  return {n:len,observed,rotatedMean:+mean.toFixed(6),
    rotatedSd:+sigma.toFixed(6),
    z:+((observed-mean)/sigma).toFixed(6),
    exactUpperTail:tests.filter(c=>c>=observed).length+'/'+len,
    phaseZeroIsUniqueMaximum:observed===Math.max(...tests)&&
      tests.filter(c=>c===observed).length===1,
    max:Math.max(...tests)};
}

/**
 * Restrict choice to two literal prime signs and two source-natural starts:
 * first real rune paired with prime2 or prime3. Source F prepending selects
 * prime3, while the other phase is the unprefixed control. Compare the
 * four-way best score at original alignment with every intact rotation.
 * @param {number[]} source
 * @param {number[]} prime
 */
function fourWayRotationAudit(source,prime){
  const len=source.length;
  /** @param {number} rotation @param {number} sign @param {number} offset */
  const score=(rotation,sign,offset)=>{
    let prev=offset===1?mod29(sign*prime[0]):0;
    let last=-1;
    let events=0;
    for(let i=0;i<len;i++){
      const shifted=mod29(source[(i+rotation)%len]+sign*prime[i+offset]);
      const delta=mod29(shifted-prev);
      if(i>0&&delta===last)events++;
      prev=shifted;
      last=delta;
    }
    return events;
  };
  const all=[];
  for(let r=0;r<len;r++){
    const counts=[score(r,1,0),score(r,1,1),
      score(r,-1,0),score(r,-1,1)];
    all.push({rotation:r,counts,max:Math.max(...counts)});
  }
  const observed=all[0].max;
  return {options:['plus/prime2','plus/prime3','minus/prime2',
      'minus/prime3-after-fictitious-F'],
    sourceScores:all[0].counts,observed,
    upperTailOverCompleteCyclicPhases:
      all.filter(x=>x.max>=observed).length+'/'+len,
    exactTiedPhases:all.filter(x=>x.max>=observed)
      .map(x=>({rotation:x.rotation,scores:x.counts})),
    allPhasesMaximum:Math.max(...all.map(x=>x.max))};
}

function main(){
  assert.equal(corpus.runes.length,29);
  const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert.equal(original.length,12956);
  assert.equal(lengths.reduce((a,b)=>a+b,0),original.length);
  assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
  const ps=primes(Math.max(...lengths)+1);
  assert.deepEqual(ps.slice(0,7),[2,3,5,7,11,13,17]);
  const page0to2=original.slice(0,729);
  const recovered=inverse(page0to2,ps);
  assert.equal(equalsAdjacent(page0to2),4);
  assert.equal(equalsAdjacent(recovered),40);
  assert.equal(ioc(recovered),0.03450459006014561);
  const evenDerived=recovered.filter(v=>v%2===0).length;
  assert.equal(evenDerived,376);
  assert.equal(recovered.length-evenDerived,353);
  assert.deepEqual(forward(recovered,ps),page0to2);

  // A genuine original-LP2 solved control, preserved as a literal GP rune
  // tape of p57; the cipher is shown to invert a separate known plaintext,
  // rather than "decrypting" arbitrary synthetic gibberish.
  const known=corpus.pages.find(p=>p.page===57);
  assert(known && known.indices.length===95);
  const plant=Array.from({length:729},(_,i)=>known.indices[i%95]);
  assert.deepEqual(inverse(forward(plant,ps),ps),plant);
  assert(ioc(plant)>0.05);

  const chapters=[];
  let start=0;
  for(let i=0;i<lengths.length;i++){
    const n=lengths[i],sequence=original.slice(start,start+n);
    assert.equal(sequence.length,n);
    const decoded=inverse(sequence,ps);
    assert.deepEqual(forward(decoded,ps),sequence);
    chapters.push({chapter:i+1,startRune:start,...circularAudit(sequence,ps),
      originalDoublets:equalsAdjacent(sequence),decodedIoC:+ioc(decoded).toFixed(9)});
    start+=n;
  }
  assert.equal(start,12956);
  assert.deepEqual(chapters.map(c=>c.observed),[40,39,64,78,37,48,60,99,11]);
  assert.deepEqual(chapters.map(c=>c.exactUpperTail),
    ['1/729','735/1145','580/1729','78/1903','327/1021',
      '919/1433','585/1680','2410/3008','101/308']);
  // Alternative unbroken prime clock: source text without any extra resets.
  // Its first chapter is identical to the independently reconstructed one.
  const global=inverse(original,primes(original.length+1));
  assert.deepEqual(global.slice(0,729),recovered);
  assert.equal(equalsAdjacent(global),472);
  assert(Math.abs(ioc(global)-0.034509200096422304)<1e-12);
  const fullBookContinuousClock={length:global.length,
    derivedAdjacentEquals:equalsAdjacent(global),decodedIoC:ioc(global)};
  const fourWays=fourWayRotationAudit(page0to2,ps);
  assert.deepEqual(fourWays.sourceScores,[26,25,34,40]);
  assert.equal(fourWays.upperTailOverCompleteCyclicPhases,'2/729');
  assert.equal(chapters.filter(c=>c.phaseZeroIsUniqueMaximum).length,1);
  assert(chapters[0].phaseZeroIsUniqueMaximum);
  const sha=crypto.createHash('sha256').update(Buffer.from(original)).digest('hex');
  console.log('PASS original GP 12956; p0–2 source 729 and exactly 40 prime-delta echoes');
  console.log('PASS p57 genuine known-GP plant exact inverse/forward for 729 runes');
  console.log(JSON.stringify({source:'2015 Feb 04 original IRC L89874, L89887–905',
    operation:'F=0 prepended; shift C_i by -prime(i+2), output consecutive modular difference',
    originalBytesSha256:sha,phaseZeroUniqueMaximumInFirstChapter:true,
    realP0to2:{cipherDoublets:4,primeDeltaDoublets:40,IoC:ioc(recovered),
      evenDerived,oddDerived:recovered.length-evenDerived,
      uniformGP29EvenExpectation:recovered.length*15/29},
    sourceConstrainedFourWayPhaseControl:fourWays,
    fullBookContinuousClock,
    plantedP57:{length:plant.length,IoC:ioc(plant),exactRecovered:true},
    visualChapterHoldout:chapters,
    interpretation:'2015 participant count reproduced exactly; original first visual chapter phase singled out against its 729 rotations, but eight held-out chapters show no repeated global phase effect and none yields source-native plaintext.'},null,2));
}
main();
