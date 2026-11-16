'use strict';

/**
 * SFT: exact LP2 32x8 mixed-media shell alignment against original source inputs.
 * The printed table shells have 76/68/60/52 cells. The middle 128 cells are
 * compared to p56's 128 hexadecimal hash characters, and the inner 52 cells
 * to the clear p57 suffix beginning SHED. The 2013 telnet missing-prime tape
 * supplies a separate, historically conditional 180-symbol key experiment.
 *
 * All models are frozen before scoring original data. No unknown plaintext
 * or previously unavailable key is inferred from a best-fitting alignment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const book = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const bytes = table.bytes;
const hash = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const hex = Array.from(hash, ch => parseInt(ch, 16));
const gp55 = book.pages.find(p => p.page === 55).indices;
const gp57 = book.pages.find(p => p.page === 57).indices;
const suffix = gp57.slice(43);
const mod = (x, n) => ((x % n) + n) % n;

assert.equal(bytes.length, 256);
assert.equal(gp55.length, 76);
assert.equal(gp57.length, 95);
assert.equal(suffix.length, 52);
assert.equal(hash.length, 128);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} depth @returns {number[]} Original row-major table indices. */
function ring(depth) {
  const out = [];
  const top = depth;
  const bottom = 31 - depth;
  const left = depth;
  const right = 7 - depth;
  for (let x = left; x <= right; x++) out.push(8 * top + x);
  for (let y = top + 1; y <= bottom; y++) out.push(8 * y + right);
  for (let x = right - 1; x >= left; x--) out.push(8 * bottom + x);
  for (let y = bottom - 1; y > top; y--) out.push(8 * y + left);
  return out;
}
const shells = Array.from({length: 4}, (_, d) => ring(d));
assert.deepEqual(shells.map(x => x.length), [76, 68, 60, 52]);
assert.deepEqual(shells.flat().slice().sort((a,b) => a-b),
  Array.from({length: 256}, (_,i) => i));

/** @param {number} d @param {number} corner 0 NW, 1 NE, 2 SE, 3 SW
 * @param {number} direction 1 clockwise, -1 anticlockwise
 * @returns {number[]} */
function traversal(d, corner, direction) {
  const a = shells[d];
  const w = 8 - 2*d;
  const h = 32 - 2*d;
  const starts = [0, w-1, w+h-2, 2*w+h-3];
  const s = starts[corner];
  return a.map((_, i) => a[mod(s + direction*i, a.length)]);
}

/** Optimal matches over all deterministic, unconstrained input->symbol codebooks. */
function lookupFit(input, target) {
  assert.equal(input.length, target.length);
  const groups = new Map();
  for (let i=0; i<input.length; i++) {
    const a = groups.get(input[i]) || new Map();
    a.set(target[i], (a.get(target[i]) || 0)+1);
    groups.set(input[i], a);
  }
  let hit=0, contradictions=0;
  for (const counts of groups.values()) {
    hit += Math.max(...counts.values());
    contradictions += counts.size > 1 ? 1 : 0;
  }
  return {hit, contradictions, inputKinds: groups.size};
}

/** @param {number[]} a */
function ioc29(a) {
  const counts = new Array(29).fill(0);
  a.forEach(x => { assert.ok(x>=0 && x<29); counts[x]++; });
  return counts.reduce((s,n) => s+n*(n-1),0)/(a.length*(a.length-1));
}
function primes256() {
  const a=[];
  for (let n=2; a.length<256; n++) {
    let prime=true;
    for (const p of a) {
      if (p*p>n) break;
      if (n%p===0) { prime=false; break; }
    }
    if (prime) a.push(n);
  }
  return a;
}
const primes = primes256();
assert.deepEqual([primes[19], primes[20], primes[199], primes[200], primes[255]],
  [71,73,1223,1229,1619]);
const omitted = primes.slice(20, 200);
const visible = primes.slice(0,20).concat(primes.slice(200));
assert.equal(omitted.length, 180);
assert.equal(visible.length, 76);

const hashMethods = ['sha512', 'sha3-512', 'blake2b512'];
const direct = {tested:0, preimages: {}, maxLow:0, maxHigh:0, maxResidue:0, maxLookup:0};
for (const alg of hashMethods) direct.preimages[alg] = 0;
for (let c2=0; c2<4; c2++) for (const d2 of [1,-1]) {
  const outerMiddle = traversal(1,c2,d2);
  for (let c3=0; c3<4; c3++) for (const d3 of [1,-1]) {
    const indices = outerMiddle.concat(traversal(2,c3,d3));
    const vals = indices.map(i => bytes[i]);
    direct.tested++;
    for (const alg of hashMethods) {
      if (crypto.createHash(alg).update(Buffer.from(vals)).digest('hex')===hash)
        direct.preimages[alg]++;
    }
    direct.maxLow = Math.max(direct.maxLow,
      vals.reduce((s,x,i)=>s+((x & 15)===hex[i]), 0));
    direct.maxHigh = Math.max(direct.maxHigh,
      vals.reduce((s,x,i)=>s+((x >>> 4)===hex[i]), 0));
    direct.maxResidue = Math.max(direct.maxResidue,
      vals.reduce((s,x,i)=>s+(((x%29)%16)===hex[i]), 0));
    direct.maxLookup = Math.max(direct.maxLookup, lookupFit(vals,hex).hit);
    assert.equal(lookupFit(vals,vals.map(x=>x%16)).hit, 128);
  }
}
assert.deepEqual(direct, {
  tested:64, preimages: {'sha512':0,'sha3-512':0,'blake2b512':0},
  maxLow:15, maxHigh:12, maxResidue:13, maxLookup:105
});

const inner = {tested:0, maxMod29:0, maxLookup:0};
for (let c=0; c<4; c++) for (const d of [1,-1]) {
  const vals=traversal(3,c,d).map(i=>bytes[i]);
  inner.tested++;
  inner.maxMod29 = Math.max(inner.maxMod29,
    vals.reduce((s,x,i)=>s+(x%29===suffix[i]),0));
  inner.maxLookup = Math.max(inner.maxLookup,lookupFit(vals,suffix).hit);
  assert.equal(lookupFit(vals,vals.map(x=>x%29)).hit,52);
}
assert.deepEqual(inner,{tested:8,maxMod29:5,maxLookup:47});

const hybrid=[];
for(let c=0;c<4;c++)for(const direction of [1,-1]){
  const outer=traversal(0,c,direction).map(i=>bytes[i]);
  const middle=traversal(1,c,direction)
    .concat(traversal(2,c,direction), traversal(3,c,direction))
    .map(i=>bytes[i]);
  for(const sign of [-1,1]) for(const sub of [1,0]) {
    const kh=omitted.map(q=>q-sub);
    const ko=visible.map(q=>q-sub);
    const gph=middle.slice(128).map((x,i)=>mod(x+sign*kh[i+128],29));
    const hh=middle.slice(0,128).map((x,i)=>mod(x+sign*kh[i],16));
    const p55=outer.map((x,i)=>mod(x+sign*ko[i],29));
    const hashHits=hh.reduce((s,x,i)=>s+(x===hex[i]),0);
    const gpHits=gph.reduce((s,x,i)=>s+(x===suffix[i]),0);
    hybrid.push({
      corner:['NW','NE','SE','SW'][c],
      direction:direction===1?'cw':'ccw',
      operation:sign===-1?'subtract':'add',
      primeKey:sub===1?'prime-1':'prime',
      hashHits,gpHits, p55Ioc:ioc29(p55),
      p55Prefix:p55.slice(0,25).map(x=>book.translit[x]).join('')
    });
  }
}
const canonical = hybrid.find(x=>x.corner==='NW' && x.direction==='cw'
  && x.operation==='subtract' && x.primeKey==='prime-1');
const mixed = {
  tested:hybrid.length,
  canonicalHash:canonical.hashHits,
  canonicalGP:canonical.gpHits,
  canonicalP55Ioc:canonical.p55Ioc,
  canonicalP55Prefix:canonical.p55Prefix,
  bestHash:Math.max(...hybrid.map(x=>x.hashHits)),
  bestGP:Math.max(...hybrid.map(x=>x.gpHits)),
  bestTotal:Math.max(...hybrid.map(x=>x.hashHits+x.gpHits)),
  bestP55Ioc:Math.max(...hybrid.map(x=>x.p55Ioc))
};
assert.equal(mixed.tested,32);
assert.equal(mixed.canonicalHash,5);
assert.equal(mixed.canonicalGP,1);
assert.equal(mixed.bestHash,16);
assert.equal(mixed.bestGP,4);
assert.equal(mixed.bestTotal,17);
assert.ok(mixed.bestP55Ioc < 0.04);

// Genuine inverse positive plant of this exact mixed modulus/prime schedule.
// Construct 128 encrypted nibble slots and 52 encrypted GP slots on the
// very same source prime clock, plus 76 outer GP values on its complement.
const first128=hex.map((x,i)=>mod(x+(omitted[i]-1),16));
const last52=suffix.map((x,i)=>mod(x+(omitted[i+128]-1),29));
const outer76=gp55.map((x,i)=>mod(x+(visible[i]-1),29));
assert.deepEqual(first128.map((x,i)=>mod(x-(omitted[i]-1),16)),hex);
assert.deepEqual(last52.map((x,i)=>mod(x-(omitted[i+128]-1),29)),suffix);
assert.deepEqual(outer76.map((x,i)=>mod(x-(visible[i]-1),29)),gp55);
assert.equal(crypto.createHash('sha512').update(Buffer.from(first128.concat(last52)))
  .digest('hex').length,128);


/**
 * Recover candidate XOR keystream independently from the 128 known digest
 * characters. For every physical ring route, train an arbitrary binary LFSR
 * separately on the first 64 keystream bytes (eight bitplanes) and predict
 * the untouched final 64. This actually attempts unknown-key recovery, rather
 * than ranking source-phrase or random-seed coincidences on original output.
 */
function berlekampMassey(bits) {
  const n=bits.length;
  const current=new Array(n+1).fill(0);
  let prior=new Array(n+1).fill(0);
  current[0]=1; prior[0]=1;
  let order=0, priorChange=-1;
  for(let t=0;t<n;t++) {
    let error=bits[t];
    for(let i=1;i<=order;i++) error^=current[i]&bits[t-i];
    if(error) {
      const before=current.slice();
      const offset=t-priorChange;
      for(let j=0;j<n+1-offset;j++) current[j+offset]^=prior[j];
      if(2*order<=t) {
        order=t+1-order;
        prior=before;
        priorChange=t;
      }
    }
  }
  return {order, coefficients:current.slice(0,order+1)};
}
function predictLfsr(prefix,model,n) {
  const seq=prefix.slice();
  for(let t=0;t<n;t++) {
    let next=0;
    for(let i=1;i<=model.order;i++)
      next^=model.coefficients[i]&seq[seq.length-i];
    seq.push(next);
  }
  return seq.slice(-n);
}
function lfsrAttempt(key) {
  assert.equal(key.length,128);
  const estimates=[];
  const orders=[];
  for(let bit=0;bit<8;bit++) {
    const pre=key.slice(0,64).map(x=>(x>>>bit)&1);
    const model=berlekampMassey(pre);
    orders.push(model.order);
    estimates.push(predictLfsr(pre,model,64));
  }
  const predicted=Array.from({length:64},(_,i)=>
    estimates.reduce((s,layer,bit)=>s|(layer[i]<<bit),0));
  const original=key.slice(64);
  return {
    minOrder:Math.min(...orders),
    bytes:predicted.reduce((s,x,i)=>s+(x===original[i]),0),
    bits:predicted.reduce((s,x,i)=>s+(8-(x^original[i]).toString(2)
      .split('1').length+1),0)
  };
}
const recovered={testedPerRegister:0,ascii:{minOrder:Infinity,bestBytes:0,bestBits:0},
  nibble:{minOrder:Infinity,bestBytes:0,bestBits:0}};
for(let c2=0;c2<4;c2++)for(const d2 of [1,-1])
  for(let c3=0;c3<4;c3++)for(const d3 of [1,-1]) {
    const values=traversal(1,c2,d2).concat(traversal(2,c3,d3))
      .map(i=>bytes[i]);
    recovered.testedPerRegister++;
    for(const kind of ['ascii','nibble']) {
      const key=values.map((v,i)=>v^(kind==='ascii'?
        hash.charCodeAt(i):hex[i]));
      const attempt=lfsrAttempt(key);
      const summary=recovered[kind];
      summary.minOrder=Math.min(summary.minOrder,attempt.minOrder);
      summary.bestBytes=Math.max(summary.bestBytes,attempt.bytes);
      summary.bestBits=Math.max(summary.bestBits,attempt.bits);
    }
  }
assert.equal(recovered.testedPerRegister,64);
assert.deepEqual(recovered.ascii,{minOrder:30,bestBytes:2,bestBits:281});
assert.deepEqual(recovered.nibble,{minOrder:29,bestBytes:2,bestBits:286});
// Eight independent short binary recurrent channels form an exact positive.
const syntheticLayers=[];
for(let bit=0;bit<8;bit++) {
  const n=bit+3;
  const seq=Array.from({length:n},(_,i)=>i===0?1:((i+bit)&1));
  while(seq.length<128) seq.push(seq.at(-1)^seq.at(-n));
  syntheticLayers.push(seq);
}
const synthetic=Array.from({length:128},(_,i)=>syntheticLayers
  .reduce((s,v,bit)=>s|(v[i]<<bit),0));
assert.equal(lfsrAttempt(synthetic).bytes,64);
assert.equal(lfsrAttempt(synthetic).bits,512);

console.log(JSON.stringify({
  source:'Original LP2 p49-51 table, p55, p56 printed hash, p57 clear text; 2013 180-prime skip',
  shellLengths:shells.map(x=>x.length),
  mixedKnownPayloadLengths:[128,52],
  primeRankComplement:[20,180,56],
  fixedByteChecks:direct,
  innermostKnownGP:inner,
  primeTotientHybrid:mixed,
  digestXorLinearKeyRecovery:recovered,
  conclusion:'No digest preimage, exact nibble codebook, direct prime consumer or unknown GP plaintext recovered'
},null,2));
