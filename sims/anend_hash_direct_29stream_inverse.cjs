"use strict";

/**
 * Original-source direct continuation challenge:
 * Does the solved page56's authentic 64-byte printed hash act as
 * the source key of a GP29 additive or GP28 no-adjacent-repeat
 * differential stream across still-unsolved LP2 text?
 *
 * Three frozen cryptographic stream expanders: SHAKE256 hash XOF,
 * HMAC-SHA512 with a 32-bit BE counter, and SHA-512(hash||counter).
 * Both unmodified continuous/page-reset clocks, both additive
 * signs, and direct/remainder or range-scaled byte reduction.
 * Exactly 48 configurations per English/Latin GP register.
 *
 * Original physical pages0-27 select the mode; pages28-55 are
 * untouched and report honest frozen heldout GP trigram evidence.
 * Seven eight-byte rotated hash controls repeat the same selection.
 *
 * One blind English GP28 plant validates true source-key mode
 * recovery, every rune's invertibility and full re-encryption.
 * This is a conditional ciphertext inversion, not an authentic key.
 *
 * CJS Node22. Official crypto.createHash SHAKE outputLength and
 * createHmac APIs documented in Node22 crypto reference.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {createHash,createHmac}=require("node:crypto");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {latinModel,plainScore}=require("./grid_latin_register_inverse.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const hash=Buffer.from(JSON.parse(read(
  "resources/cicada2014-archive-hash-manifest.json")).targetHex,"hex");
assert.equal(hash.length,64);
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=source.pages.filter(p=>p.page<56&&p.indices.length)
  .map(p=>({page:p.page,indices:p.indices}));
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const ENGLISH=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const LATIN=latinModel();
const REF=encode(read("resources/control/shakespeare_first300k.txt").slice(205000,270000))
  .slice(0,12956);
assert.equal(REF.length,12956);
const mod=(x,n)=>(x%n+n)%n;

/** @param {Buffer} digest 64 original or rotated source bytes. @param {number} shift */
function rotateHash(digest,shift){
  return Buffer.concat([digest.subarray(shift),digest.subarray(0,shift)]);
}

/**
 * @param {Buffer} digest Fixed external hash.
 * @param {"shake256"|"hmac-sha512"|"sha512-counter"} algorithm
 * @param {number} outputLength
 */
function expand(digest,algorithm,outputLength){
  if(algorithm==="shake256")
    return createHash("shake256",{outputLength})
      .update(digest).digest();
  const blocks=[];
  for(let counter=0;blocks.length*64<outputLength;counter++){
    const block=Buffer.alloc(4);
    block.writeUInt32BE(counter);
    if(algorithm==="hmac-sha512")
      blocks.push(createHmac("sha512",digest).update(block).digest());
    else{
      assert.equal(algorithm,"sha512-counter");
      blocks.push(createHash("sha512").update(digest).update(block).digest());
    }
  }
  return Buffer.concat(blocks,blocks.length*64).subarray(0,outputLength);
}

/** Fixed source-only keystream for all physical pages. */
function pad(digest,algorithm,clock){
  assert.ok(clock==="global"||clock==="page");
  const total=12956,longest=Math.max(...pages.map(p=>p.indices.length));
  const seed=expand(digest,algorithm,clock==="page"?longest:total);
  let index=0;
  return pages.map(p=>{
    const bytes=seed.subarray(clock==="page"?0:index,
      (clock==="page"?0:index)+p.indices.length);
    index+=p.indices.length;
    return bytes;
  });
}

/** @param {number} byte @param {number} base @param {"remainder"|"scaled"} reducer */
function effectiveKey(byte,base,reducer){
  return reducer==="remainder"?byte%base:Math.floor(byte*base/256);
}

/**
 * Every mode changes the symbolic representation, not the source input.
 * @param {number[][]} ciphertextPageArrays
 * @param {Buffer[]} pads
 * @param {{format:string,sign:number,reducer:string}} mode
 */
function decode(ciphertextPageArrays,pads,mode){
  return ciphertextPageArrays.map((cipher,p)=>{
    const out=[];
    for(let i=0;i<cipher.length;i++){
      const c=cipher[i],k=effectiveKey(pads[p][i],
        mode.format==="direct29"||i===0?29:28,mode.reducer);
      if(mode.format==="direct29"||i===0)
        out.push(mod(c+mode.sign*k,29));
      else if(c===cipher[i-1])out.push(28);
      else out.push(mod(mod(c-cipher[i-1]-1,29)+mode.sign*k,28));
    }
    return out;
  });
}

/** Exact reciprocal source-runic forward encoder. */
function encrypt(plainPageArrays,pads,mode){
  return plainPageArrays.map((plain,p)=>{
    const out=[];
    for(let i=0;i<plain.length;i++){
      const q=plain[i];
      const k=effectiveKey(pads[p][i],
        mode.format==="direct29"||i===0?29:28,mode.reducer);
      if(mode.format==="direct29"||i===0)
        out.push(mod(q-mode.sign*k,29));
      else if(q===28)out.push(out[i-1]);
      else out.push(mod(out[i-1]+1+mod(q-mode.sign*k,28),29));
    }
    return out;
  });
}

const MODES=[];
for(const algorithm of ["shake256","hmac-sha512","sha512-counter"])
  for(const clock of ["global","page"])
    for(const format of ["direct29","differential28"])
      for(const sign of [-1,1])
        for(const reducer of ["remainder","scaled"])
          MODES.push({algorithm,clock,format,sign,reducer});
assert.equal(MODES.length,48);

function segments(rows){
  const trainRows=[],testRows=[];
  for(let i=0;i<rows.length;i++)
    (pages[i].page<28?trainRows:testRows).push(...rows[i]);
  return {training:trainRows,heldout:testRows};
}

/**
 * Source-trained selection, frozen heldout evaluation; no original
 * heldout optimization even when comparing all wrong-source hashes.
 * @param {Buffer} digest
 * @param {number[][]} ciphertext
 * @param {{englishGP:object,latinGP:object}} models
 */
function candidate(digest,ciphertext,models){
  const streams={};
  for(const algorithm of ["shake256","hmac-sha512","sha512-counter"])
    for(const clock of ["global","page"])
      streams[algorithm+":"+clock]=pad(digest,algorithm,clock);
  const scores={};
  for(const [name,model] of Object.entries(models))scores[name]=[];
  for(const mode of MODES){
    const k=streams[mode.algorithm+":"+mode.clock];
    const original=segments(decode(ciphertext,k,mode));
    for(const [register,model] of Object.entries(models))
      scores[register].push({mode,
        train:plainScore(original.training,model),
        heldout:plainScore(original.heldout,model),
        prefix:decode(ciphertext,k,mode)[0].slice(0,70).map(v=>source.runes[v]).join("")});
  }
  return Object.fromEntries(Object.entries(scores).map(([name,values])=>{
    values.sort((a,b)=>b.train-a.train);
    return [name,{best:values[0],
      topTrainingScore:values[0].train,
      heldoutScoreWithFrozenMode:values[0].heldout}];
  }));
}

function plant(){
  const truth={algorithm:"hmac-sha512",clock:"global",
    format:"differential28",sign:-1,reducer:"scaled"};
  const sourceRows=[];let cursor=0;
  for(const p of pages){sourceRows.push(REF.slice(cursor,cursor+p.indices.length));cursor+=p.indices.length;}
  const sourceCipher=encrypt(sourceRows,pad(hash,truth.algorithm,truth.clock),truth);
  const decoded=decode(sourceCipher,pad(hash,truth.algorithm,truth.clock),truth);
  assert.deepEqual(decoded,sourceRows);
  assert.deepEqual(encrypt(decoded,pad(hash,truth.algorithm,truth.clock),truth),sourceCipher);
  const fitted=candidate(hash,sourceCipher,{englishGP:ENGLISH}).englishGP;
  assert.deepEqual(fitted.best.mode,truth);
  const native=segments(sourceRows);
  return {trueMode:truth,recoveredMode:fitted.best.mode,
    exactRecoveredRuneCount:decoded.flat().length,
    exactReencryptedRuneCount:sourceCipher.flat().length,
    nativeOriginalLengthHeldoutGP:plainScore(native.heldout,ENGLISH),
    detectedNativeHeldoutGP:fitted.heldoutScoreWithFrozenMode,
    plantedEAOutputRepeats:sourceCipher.reduce((n,p)=>
      n+p.slice(1).filter((v,i)=>v===p[i]).length,0)};
}

function run(){
  const original=pages.map(p=>p.indices);
  const models={englishGP:ENGLISH,latinGP:LATIN};
  const genuine=candidate(hash,original,models);
  const wrong=[];
  for(let q=1;q<8;q++){
    const alt=candidate(rotateHash(hash,q*8),original,models);
    wrong.push({shiftBytes:q*8,englishHeldout:alt.englishGP.heldoutScoreWithFrozenMode,
      latinHeldout:alt.latinGP.heldoutScoreWithFrozenMode});
  }
  const positive=plant();
  const englishHoldout=plainScore(segments(pages.map(p=>p.indices)).heldout,ENGLISH);
  return {
    source:"Exact solved p56 64-byte digest, original unsolved p0–55 12956 runes",
    experiment:"Direct SHAKE256/HMAC-SHA512/SHA512-counter native-GP stream inverse",
    configurationsPerRegister:MODES.length,
    trainingPhysicalPages:"0–27",heldoutPhysicalPages:"28–55",
    result:genuine,
    wrongDigestRotations:wrong,
    rotationExceedances:{
      english:wrong.filter(x=>x.englishHeldout>=genuine.englishGP.heldoutScoreWithFrozenMode).length,
      latin:wrong.filter(x=>x.latinHeldout>=genuine.latinGP.heldoutScoreWithFrozenMode).length,
    },
    originalCipherAsRawGpEnglishBaseline:englishHoldout,
    independentGpEnglishSourceHeldout:positive.nativeOriginalLengthHeldoutGP,
    syntheticDirectDigestKeyPositive:positive,
    conclusion:"Native-register original digest-seeded direct GP29/GP28 source stream tests are conditional; only candidate GP content and frozen heldout scores can authenticate a historical key. No source-key identity or plaintext inferred from synthetic roundtrip."
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+"\n");
module.exports={expand,pad,decode,encrypt,candidate,plant,run};
