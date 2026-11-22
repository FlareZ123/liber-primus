"use strict";
/**
 * Original LP2 marked-root Hensel key through a skip-aware additive decoder.
 *
 * A true repeat-rejection sampler can consume a key symbol without
 * emitting any ciphertext, so a rigid alignment may falsely reject
 * the right key. A small exact beam over these *hidden key skips*
 * gives the source-derived 29-adic stream a fairer direct test.
 *
 * The positive control plants 350 genuine LP1 reference runes withheld
 * from all fitted n-gram statistics, encrypts with the true source pad,
 * and applies a fixed-seed 82% rejection of repeated output. All
 * decoding uses the unmodified original grid, rune input, heldout
 * language model, and four source-independent sign/order choices.
 *
 * Scope: additive GP29 with a soft repeat rejection/key-consumption
 * mechanism. A rewrite filter, different plaintext register, or
 * non-additive state is not rejected. No authentic LP2 key/plaintext.
 *
 * Run: node sims/lp2_grid_hensel29_skipbeam_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {lift,digits}=require("./lp2_grid_hensel29_inverse_sft.cjs");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
/** @param {string} p */
const load=p=>JSON.parse(read(p));
const MOD=29;
const mod=n=>((n%MOD)+MOD)%MOD;
/** @typedef {{t:number,a:number,b:number,s:number,prev:BeamState|null,letter:number}} BeamState */

/** @param {number[]} values */
function makeModel(values){
  const count=values.length,alpha=0.4;
  const uni=Array(MOD).fill(0);
  const bi=Array(MOD*MOD).fill(0);
  const tri=Array(MOD*MOD*MOD).fill(0);
  for(let i=0;i<count;i++){
    const v=values[i];
    uni[v]++;
    if(i>0)bi[values[i-1]*MOD+v]++;
    if(i>1)tri[(values[i-2]*MOD+values[i-1])*MOD+v]++;
  }
  /** @param {number} a @param {number} b @param {number} v */
  const score=(a,b,v)=>{
    const u=Math.log((uni[v]+alpha)/(count+alpha*MOD));
    if(b<0)return u;
    const two=Math.log((bi[b*MOD+v]+alpha)/(uni[b]+alpha*MOD));
    if(a<0)return 0.65*two+0.35*u;
    const three=Math.log((tri[(a*MOD+b)*MOD+v]+alpha)/
      (bi[a*MOD+b]+alpha*MOD));
    return 0.60*three+0.27*two+0.13*u;
  };
  return {score,count};
}

/**
 * Greedy longest GP transliteration (the canonical 29-rune alphabet).
 * @param {string} word
 * @param {Map<string,number>} symbols
 */
function encode(word,symbols){
  const w=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<w.length;){
    const pair=symbols.get(w.slice(i,i+2));
    if(pair!==undefined){result.push(pair);i+=2;continue;}
    const one=symbols.get(w[i]);
    assert.notEqual(one,undefined,"GP model cannot encode "+w[i]);
    result.push(one);
    i++;
  }
  return result;
}

/** @param {number} seed */
function random(seed){
  let s=seed>>>0;
  return ()=>{
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return (s>>>0)/4294967296;
  };
}

/**
 * @param {number[]} native
 * @param {number[]} key
 * @param {number} sign
 * @param {number} seed
 */
function encryptWithRejection(native,key,sign,seed){
  const r=random(seed),out=[];
  let t=0,skips=0;
  for(const plain of native){
    for(;;){
      assert.ok(t<key.length,"key must exceed planted stream");
      const emitted=mod(plain+sign*key[t++]);
      if(out.length&&out[out.length-1]===emitted&&r()<0.82){
        skips++;
        continue;
      }
      out.push(emitted);
      break;
    }
  }
  return {cipher:out,keyConsumed:t,skips};
}

/**
 * Exact skip consistency: rejected proposals must equal the last
 * emitted ciphertext, and accepted proposed output must equal C[i].
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {(a:number,b:number,v:number)=>number} lm
 * @param {number} width
 */
function decode(cipher,key,sign,lm,width=600){
  /** @type {BeamState[]} */
  let beam=[{t:0,a:-1,b:-1,s:0,prev:null,letter:-1}];
  let expanded=0;
  for(let i=0;i<cipher.length;i++){
    const prevCipher=i===0?null:cipher[i-1];
    /** @type {Map<string,BeamState>} */
    const candidates=new Map();
    for(const old of beam){
      for(let skip=0;skip<=(prevCipher===null?0:2);skip++){
        const at=old.t+skip;
        if(at>=key.length)continue;
        const plain=mod(cipher[i]-sign*key[at]);
        let okay=true;
        for(let s=0;s<skip;s++)
          if(mod(plain+sign*key[old.t+s])!==prevCipher){
            okay=false;break;
          }
        if(!okay)continue;
        const score=old.s+lm(old.a,old.b,plain)
          +skip*Math.log(0.82)
          +(cipher[i]===prevCipher?Math.log(0.18):0);
        /** @type {BeamState} */
        const candidate={
          t:at+1,a:old.b,b:plain,s:score,prev:old,letter:plain
        };
        const id=candidate.t+","+candidate.a+","+candidate.b;
        const prior=candidates.get(id);
        if(!prior||prior.s<score)candidates.set(id,candidate);
        expanded++;
      }
    }
    beam=[...candidates.values()].sort((a,b)=>b.s-a.s).slice(0,width);
    assert.ok(beam.length,"No admissible path at ciphertext position "+i);
  }
  const top=beam[0],plain=[];
  for(let state=top;state.prev!==null;state=state.prev)
    plain.push(state.letter);
  plain.reverse();
  assert.equal(plain.length,cipher.length);
  return {plain,keyConsumed:top.t,
    hiddenSkips:top.t-cipher.length,
    score:top.s,perRune:top.s/cipher.length,expanded};
}

/**
 * Rigid inverse, provided solely as an alignment comparator.
 * @param {number[]} cipher @param {number[]} key @param {number} sign
 */
function rigid(cipher,key,sign){
  return cipher.map((v,i)=>mod(v-sign*key[i]));
}

/** @param {number[]} values */
function ioc(values){
  const c=Array(MOD).fill(0);
  for(const v of values)c[v]++;
  return c.reduce((a,n)=>a+n*(n-1),0)/
    (values.length*(values.length-1));
}

/** @param {number[]} values @param {string[]} symbols */
function translit(values,symbols){
  return values.slice(0,110).map(v=>symbols[v]).join("");
}

function main(){
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const grid=load("resources/liber-primus/base60-grid.json");
  const source=read("resources/liber-primus/lp1-plaintext-reference.txt");
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  const sha=crypto.createHash("sha256")
    .update(Buffer.from(bytes)).digest("hex");
  assert.equal(sha,
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const symbolMap=new Map(corpus.translit.map((symbol,i)=>[symbol,i]));
  const reference=(source.match(/[A-Za-z]+/g)||[])
    .flatMap(word=>encode(word,symbolMap));
  assert.ok(reference.length>2000);
  const heldout=reference.slice(600,950);
  const model=makeModel(reference.slice(0,600).concat(reference.slice(950)));
  assert.equal(heldout.length,350);
  const originalPages=corpus.pages.filter(p=>p.status==="unsolved").slice(0,4);
  const original=originalPages.flatMap(p=>p.indices);
  assert.equal(originalPages.length,4);
  const markedOffsets=[0,120]; // two marked triples begin at one-based rune 120.
  const pairs=Math.ceil((original.length+720)/2);
  const liftResult=lift(bytes.map(BigInt),pairs);
  const keys=digits(liftResult.x,pairs);

  const planted=encryptWithRejection(heldout,keys.AB,1,0x15ac1234);
  assert.equal(planted.cipher.length,heldout.length);
  assert.ok(planted.skips>=2,"positive plant must exercise hidden skips");
  const recovered=decode(planted.cipher,keys.AB,1,model.score,600);
  const matched=recovered.plain.filter((v,i)=>v===heldout[i]).length;
  const accuracy=matched/heldout.length;
  // Validated decoding is essential: low-power instruments cannot
  // support a negative claim on original ciphertext.
  assert.ok(accuracy>=0.9,
    "Heldout native-GP skip-aware positive control accuracy "+accuracy);

  const wrong=decode(planted.cipher,keys.BA,1,model.score,600);
  const markedPlant=encryptWithRejection(
    heldout,keys.AB.slice(120),1,0x15ac1234^120
  );
  const markedRecovered=decode(
    markedPlant.cipher,keys.AB.slice(120),1,model.score,600
  );
  const markedAccuracy=markedRecovered.plain.filter(
    (v,i)=>v===heldout[i]
  ).length/heldout.length;
  assert.ok(markedAccuracy>=0.9,
    "marked offset 120 positive plant recovery "+markedAccuracy);

  const originalCandidates=[];
  for(const phase of markedOffsets)
    for(const order of ["AB","BA"])
      for(const sign of [-1,1]){
      const clock=keys[order].slice(phase);
      const decoded=decode(original,clock,sign,model.score,600);
      const fixed=rigid(original,clock,sign);
      originalCandidates.push({
        phase,order,sign,length:original.length,
        beamScorePerRune:decoded.perRune,
        rigidScorePerRune:fixed.reduce(
          (sum,v,i)=>sum+model.score(
            i>=2?fixed[i-2]:-1,i>=1?fixed[i-1]:-1,v),0
        )/fixed.length,
        hiddenSkips:decoded.hiddenSkips,
        keyConsumed:decoded.keyConsumed,
        ioc:ioc(decoded.plain),
        first110:translit(decoded.plain,corpus.translit)
      });
    }
  originalCandidates.sort((a,b)=>b.beamScorePerRune-a.beamScorePerRune);

  console.log(JSON.stringify({
    classification:"Source-fixed skip-aware GP29 additive original negative",
    originalGridSha256:sha,
    originalPages:originalPages.map(p=>p.page),
    originalLength:original.length,numberOfHenselPairs:pairs,
    heldoutPlant:{
      sourceIndices:[600,950],nativeLength:350,
      hiddenOriginalSkips:planted.skips,
      actualKeyConsumed:planted.keyConsumed,
      recoveredKeyConsumed:recovered.keyConsumed,
      recoveredAccuracy:accuracy,
      positiveScorePerRune:recovered.perRune,
      wrongCoordinateScorePerRune:wrong.perRune
    },
    markedPlant:{phase:120,hiddenSkips:markedPlant.skips,accuracy:markedAccuracy},
    originalCandidates,
    limits:"Conditional additive with rejection-skip filter; not rewrite/non-GP",
    status:"No original LP2 plaintext recovered"
  },null,2));
}
if(require.main===module)main();
