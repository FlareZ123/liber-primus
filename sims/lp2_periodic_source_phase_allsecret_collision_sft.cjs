'use strict';

/**
 * Source-period phase-bijection detection SFT. If ciphertext
 * C[i] = sigma[i % P](P[i]) for unknown 29-symbol bijections, same-phase
 * symbol-equality pairs are invariant under every secret bijection.
 * This is an all-secret necessary-condition test, not a decryption.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runes=new Map(c.runes.map((r,i)=>[r,i]));
const cipher=c.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(cipher.length,12956);
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const nativeLP1=[3,8,9,10,11,14].flatMap(i=>[...lp1[i]].filter(ch=>runes.has(ch)).map(ch=>runes.get(ch)));
const native=nativeLP1.concat(c.pages[57].indices);
assert(native.length>1000);
assert(native.every(n=>Number.isInteger(n)&&n>=0&&n<29));
const f=new Float64Array(29);
for(const x of native) f[x]++;
const nativeEq=f.reduce((s,n)=>s+n*(n-1),0)/(native.length*(native.length-1));

/**
 * All equal-symbol pairs with equal residue modulo a source-fixed period.
 * @param {number[]} stream GP29 ordinal symbols
 * @param {number} period
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function phaseEq(stream,period) {
  const buckets=new Uint16Array(period*29),size=new Uint16Array(period);
  for(let i=0;i<stream.length;i++){buckets[(i%period)*29+stream[i]]++;size[i%period]++;}
  let equal=0,pairs=0;
  for(let a=0;a<period;a++){
    pairs+=size[a]*(size[a]-1)/2;
    for(let j=0;j<29;j++){const n=buckets[a*29+j];equal+=n*(n-1)/2;}
  }
  return {equal,pairs,rate:equal/pairs};
}
let state=0x33011984;
/** @returns {number} */
function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
/** @returns {number[]} */
function nativePlant(){const out=new Array(cipher.length);for(let i=0;i<out.length;i++)out[i]=native[rnd()%native.length];return out;}

/** @param {number} P */
function permPlant(P){
  const key=Array.from({length:P},()=>{
    const s=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){const j=rnd()%(i+1);[s[i],s[j]]=[s[j],s[i]];}
    return s;
  });
  const plain=nativePlant();
  const crypt=plain.map((x,i)=>key[i%P][x]);
  const original=phaseEq(plain,P),encrypted=phaseEq(crypt,P);
  assert.deepEqual(encrypted,original,'Any secret 29-symbol bijection preserves phase-pair equality');
  return {period:P,rate:encrypted.rate,offset_from_native_rate:encrypted.rate-nativeEq};
}
const planted=permPlant(729);
const periods=[49,76,95,121,243,256,729,1033,3301];
const trials=120,results=[];
for(const period of periods){
  const actual=phaseEq(cipher,period);
  const simulated=new Array(trials);
  for(let t=0;t<trials;t++)simulated[t]=phaseEq(nativePlant(),period).rate;
  simulated.sort((a,b)=>a-b);
  const below=simulated.filter(rate=>rate<=actual.rate).length;
  const mean=simulated.reduce((sum,x)=>sum+x,0)/trials;
  results.push({
    period,source_period:period===243?'p8 3^5':period===256?'p50 32x8':period===729?'p0 opening 27^2':period===1033?'2014 1033':period===3301?'Cicada 3301':'source-visible candidate',
    original:actual,native_expected:mean,native_min:simulated[0],
    native_max:simulated[trials-1],native_monte_carlo_left_tail:(below+1)/(trials+1)
  });
}
assert(results.every(x=>x.original.pairs>5000));
assert(planted.rate>nativeEq-0.017,'Source-native 729-plant must preserve native coincidence');
console.log(JSON.stringify({
  sample:'12956 original unsolved LP2 GP29 runes, skipped p50',
  native_controls:'LP1 original clear physical p5,pp10-13,p15 plus LP2 clear p57',
  native_count:native.length,native_eq:nativeEq,
  model:'arbitrary fixed secret GP29 bijection for each residue modulo P',
  seed:'xorshift32 0x33011984',trials,
  planted_phase729:planted,periods:results
},null,2));
