'use strict';
/**
 * Source-locked 4-of-4 Shamir interpolation of the four historical 256-byte
 * artifacts as candidate LP2 AES/ChaCha section keys. A cubic interpolant
 * always exists, so original GP plaintext recovery is the ONLY evidence
 * capable of authenticating the interpolated key.
 *
 * Frozen source coordinates: grid x=1, hidden services 2,3,4 at x=2,3,4.
 * Two GF256 irreducible polynomials, canonical/corrected grid and four
 * predeclared byte layouts; each reconstructed 256B secret yields eight
 * 32B grid-column or eight contiguous-block keys.
 *
 * Fit on first 300 runes per section, freeze a single model and one key per
 * section, test second 300 and an untouched third 300 in seven sections.
 * Run node sims/onion256_shamir4_original_inverse.cjs in Node22.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gf256,interpolate}=require('./grid_shamir_rs_inverse.cjs');
const {sourceArrays,invert}=require('./onion256_grid_xor_source_inverse.cjs');
const {cipherBytes,inputs}=require('./grid_section_column_keys.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');

const ROOT=path.join(__dirname,'..'),N=29,WIDTH=900,TRAIN=300;
const mod=x=>(x%N+N)%N;
const layouts=bytes=>({
  row:bytes,
  reverseRow:bytes.slice().reverse(),
  column:Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]),
  reverseColumn:Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]).reverse()
});

/**
 * Source-locked natural 4-of-4 cubic interpolation. Each byte is independent.
 * @param {number[][]} shares Hidden service 2,3,4 then grid = 4 arrays.
 */
function pool(shares) {
  assert.ok(shares.length===4&&shares.every(x=>x.length===256));
  const fields=[gf256(0x11b),gf256(0x11d)];
  const candidates=[];
  const [one,two,three,grid]=shares;
  for(let fi=0;fi<fields.length;fi++){
    const field=fields[fi];
    for(const [reading,table] of Object.entries(layouts(grid))){
      const secret=table.map((byte,j)=>
        interpolate([1,2,3,4],[byte,one[j],two[j],three[j]],0,field));
      assert.equal(secret.length,256);
      for(const form of ['column','block'])for(let slot=0;slot<8;slot++){
        const key=form==='column'
          ?Array.from({length:32},(_,i)=>secret[8*i+slot])
          :secret.slice(32*slot,32*(slot+1));
        assert.ok(key.every(x=>x>=0&&x<256));
        candidates.push({mask:fi*4+Object.keys(layouts(grid)).indexOf(reading)+1,
          field:field.id,reading,layout:form,slot,key});
      }
    }
  }
  assert.equal(candidates.length,128);
  assert.equal(new Set(candidates.map(c=>Buffer.from(c.key).toString('hex'))).size,128);
  return candidates;
}

function random(seed){
  return ()=>{
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return seed>>>0;
  };
}

/** Native English oracle source and independently chosen eight actual keys. */
function planted(candidatePool){
  const source=encode(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8'));
  assert.ok(source.length>=8*WIDTH);
  const selected=candidatePool
    .map((v,i)=>({...v,index:i}))
    .filter(x=>x.mask===1&&x.layout==='column')
    .sort((a,b)=>a.slot-b.slot);
  assert.deepEqual(selected.map(s=>s.slot),[0,1,2,3,4,5,6,7]);
  const groups=[];
  for(let s=0;s<8;s++){
    const p=source.slice(s*WIDTH,(s+1)*WIDTH);
    const pad=cipherBytes(selected[s].key,'aes-256-ctr',WIDTH);
    groups.push(p.map((v,i)=>mod(v+pad[i]%N)));
    const plain=p.map((_,i)=>mod(groups[s][i]-pad[i]%N));
    assert.deepEqual(plain,p);
  }
  const result=invert(groups,candidatePool);
  assert.equal(result.algorithm,'aes-256-ctr');
  assert.equal(result.reverse,false);
  assert.equal(result.scaled,false);
  assert.equal(result.sign,-1);
  assert.deepEqual(result.chosen,selected.map(s=>s.index));
  assert.ok(result.held>0.045&&result.third>0.045);
  return {source:'Shakespeare GP-encoded',correctModeRecovered:true,
    correctKeyForAllSections:true,exactPlantPlaintext:8*WIDTH,
    train:result.train,held:result.held,third:result.third};
}

/** Deterministic matched-null shuffles preserving four original byte histograms. */
function shuffle(shares,rand){
  return shares.map(bytes=>{
    const arr=bytes.slice();
    for(let i=arr.length-1;i>0;i--){
      const j=rand()%(i+1);
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  });
}

function run(){
  const {groups}=inputs();
  const original=sourceArrays(true);
  const canonical=sourceArrays(false);
  assert.equal(original.length,4);
  const patchedPool=pool(original);
  const positive=planted(patchedPool);
  const corrected=invert(groups,patchedPool);
  const standard=invert(groups,pool(canonical));
  const best=corrected.keys.map(x=>{
    const c=patchedPool.find(v=>v.mask===x.mask&&v.layout===x.layout&&v.slot===x.slot);
    return {field:c.field,reading:c.reading,keyLayout:c.layout,slot:c.slot};
  });
  const rand=random(0x33014a54), trials=25,thirdNull=[],heldNull=[];
  for(let i=0;i<trials;i++){
    const fake=pool(shuffle(original,rand));
    const res=invert(groups,fake);
    thirdNull.push(res.third);
    heldNull.push(res.held);
  }
  const headRuneCounts=groups[0].slice(0,40);
  const firstKey=patchedPool[corrected.chosen[0]];
  const stream=cipherBytes(
    corrected.reverse?firstKey.key.slice().reverse():firstKey.key,
    corrected.algorithm,40);
  const recoveredFirst40=headRuneCounts.map((v,i)=>mod(v+corrected.sign*
    (corrected.scaled?Math.floor(stream[i]*N/256):stream[i]%N)));
  const output={
    hypothesis:'Unverified 4-of-4 degree3 Shamir secret over 4 historical 256-byte sources',
    sourceCoordinates:{grid:1,services:[2,3,4]},
    fields:['GF256/0x11b','GF256/0x11d'],
    candidateSecretBytes:8,sourceKeyVariants:patchedPool.length,
    modeSettings:16,fullOriginalCipherRunes:12956,
    fitRunes:8*TRAIN,heldoutRunes:8*TRAIN,thirdRunes:7*TRAIN,
    originalFiveCellCorrected:{...corrected,keys:best,first40:recoveredFirst40},
    originalCanonical:{train:standard.train,held:standard.held,third:standard.third},
    plantedEnglishControl:positive,
    matchedNull:{trials,originalThird:corrected.third,
      nullThirdMean:thirdNull.reduce((a,b)=>a+b,0)/trials,
      atLeastRealThird:thirdNull.filter(x=>x>=corrected.third).length,
      empiricalUpperTail:(1+thirdNull.filter(x=>x>=corrected.third).length)/(trials+1),
      originalHeld:corrected.held,
      nullHeldMean:heldNull.reduce((a,b)=>a+b,0)/trials},
    conclusion:'A cubic interpolant always exists. No authentic key or plaintext is claimed unless full original heldout and ciphertext reproduction warrants it.'
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)run();
module.exports={pool,planted,shuffle,run};
