'use strict';
/**
 * Original-input test of the 2014 Cicada bytewise Euler-totient treatment
 * of three historical onion-service 256-byte strings and the printed LP2
 * 256-byte table. Freeze the nonlinear source transform before AES/ChaCha
 * decryption. This is a bounded cipher-family test, not an LP2 decipherment.
 *
 * Native data: resources/cicada-hiddenservice-256-candidates.json,
 * resources/liber-primus/base60-grid.json and lp2 original transcript.
 *
 * Run through the manual-only grid-keyskip workflow (totient-onion).
 * @module onion_totient_original_inverse
 */
const assert=require('node:assert/strict');
const {sourceArrays,candidates,invert,planted}=
  require('./onion256_grid_xor_source_inverse.cjs');
const {inputs,cipherBytes}=require('./grid_section_column_keys.cjs');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const nullTrials=40;

/**
 * Euler's totient of an exact unsigned byte (phi(0)=0 by sentinel convention).
 * @param {number} value
 * @returns {number}
 */
function phi(value){
  assert.ok(Number.isInteger(value)&&value>=0&&value<256);
  if(value===0)return 0;
  let n=value,result=value;
  for(let p=2;p*p<=n;p++)if(n%p===0){
    do{n/=p;}while(n%p===0);
    result=result/p*(p-1);
  }
  if(n>1)result=result/n*(n-1);
  return result;
}

/**
 * Historical 2014 source-led choice: phi on each original service byte and
 * printed grid byte, then XOR nonempty subsets exactly as in existing study.
 * @param {boolean} corrected
 * @returns {number[][]}
 */
function totientSources(corrected=true){
  const arr=sourceArrays(corrected).map(src=>src.map(phi));
  assert.deepEqual(arr.map(x=>x.length),[256,256,256,256]);
  assert.deepEqual(arr[0].slice(0,8),[60,20,72,60,72,126,32,40]);
  return arr;
}

/** @param {number} seed */
function random(seed){
  return ()=>{
    seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
    return (seed>>>0)/4294967296;
  };
}

/**
 * Null preserves exact byte histogram of each phi-transformed source.
 * @param {number[][]} arrays
 * @param {()=>number} next
 */
function permute(arrays,next){
  return arrays.map(source=>{
    const a=source.slice();
    for(let i=255;i>0;i--){
      const j=Math.floor(next()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  });
}

/**
 * Exact original-rune preview under the source-fitted candidate inverse.
 * Forward re-encryption is algebraic and cannot authenticate the key.
 * @param {number[]} cipher
 * @param {object} setting
 * @param {object[]} pool
 */
function preview(cipher,setting,pool){
  const key=pool[setting.chosen[0]].key;
  const pad=cipherBytes(setting.reverse?key.slice().reverse():key,
    setting.algorithm,70);
  const alphabet=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
  const plain=cipher.slice(0,70).map((c,i)=>{
    const k=setting.scaled?Math.floor(pad[i]*MOD/256):pad[i]%MOD;
    return (c+setting.sign*k+MOD)%MOD;
  });
  assert.deepEqual(plain.map((p,i)=>{
    const k=setting.scaled?Math.floor(pad[i]*MOD/256):pad[i]%MOD;
    return (p-setting.sign*k+MOD)%MOD;
  }),cipher.slice(0,70));
  return {first70:plain.map(i=>alphabet[i]).join(''),
    fittedKey:setting.keys[0],exactRoundTrip:70};
}

function main(){
  const {groups}=inputs();
  const source=totientSources(true);
  const pool=candidates(source);
  assert.equal(pool.length,240);
  const positive=planted(source);
  const actual=invert(groups,pool);
  const initial=preview(groups[0],actual,pool);
  const canonical=invert(groups,candidates(totientSources(false)));
  const next=random(0x3301f129);
  const nullThird=[],nullHeld=[];
  for(let i=0;i<nullTrials;i++){
    const found=invert(groups,candidates(permute(source,next)));
    nullThird.push(found.third);
    nullHeld.push(found.held);
  }
  const outrankThird=nullThird.filter(x=>x>=actual.third).length;
  const outrankHeld=nullHeld.filter(x=>x>=actual.held).length;
  const answer={
    experiment:'Historical 2014 bytewise totient on four 256-byte sources, all 15 XOR subsets, 240 AES/ChaCha256 candidate keys',
    note:'Source-derived bounded original-input inverse; no authentic plaintext/key is asserted',
    sourceArrayLabels:['phi(onion2)','phi(onion3)','phi(onion4)','phi(correctedLP2grid)'],
    phi0Convention:0,
    originalRunes:groups.reduce((n,x)=>n+x.length,0),
    sourcePool:pool.length,groupCount:groups.length,
    trainRunes:2400,heldoutRunes:2400,thirdBlockRunes:2100,
    positive,original:actual,originalFirst70:initial,
    uncorrectedGrid:{train:canonical.train,held:canonical.held,third:canonical.third},
    matchedNull:{trials:nullTrials,seed:'0x3301f129',
      heldMean:nullHeld.reduce((a,b)=>a+b,0)/nullTrials,
      thirdMean:nullThird.reduce((a,b)=>a+b,0)/nullTrials,
      outrankHeld,heldTail:(outrankHeld+1)/(nullTrials+1),
      outrankThird,thirdTail:(outrankThird+1)/(nullTrials+1),
      thirdMin:Math.min(...nullThird),thirdMax:Math.max(...nullThird)},
    decision:'Only full original held-out natural GP plaintext with independently justified source key and exact forward cipher can authenticate this family'
  };
  console.log(JSON.stringify(answer,null,2));
  return answer;
}
if(require.main===module)main();
module.exports={phi,totientSources,permute,main};
