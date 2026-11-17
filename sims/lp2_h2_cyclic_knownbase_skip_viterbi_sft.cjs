"use strict";
/**
 * Ciphertext-difference admissibility + exact finite-skip Viterbi for a
 * cyclic 29-row prime-totient tableau, with a KNOWN base permutation.
 *
 * A rejected H2 proposal must equal the previous emitted glyph. Therefore,
 * for r consumed/rejected keys at position i, with accepted key row j+r,
 * C[i]-C[i-1] == K[j+r]-K[j+t] (mod 29) for every t in [0,r).
 * This constraint is INDEPENDENT of the secret base permutation.
 *
 * Recover previously unknown skip positions without any oracle pointer path.
 * A known base alphabet remains a major privilege, absent on original LP2.
 * Source-native planted positives, heldout plaintext, original all-29-shift
 * negatives and exact reencryption are all computed from frozen inputs.
 *
 * Node.js 22, CommonJS, read-only, deterministic, Windows-compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const MOD = 29, LIMIT = 650, B = LIMIT + 1, LENGTH = 12956, Q = .81;
const mod = n => ((n % MOD) + MOD) % MOD;
const tokens = gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} s @returns {number[]} */
function gpWord(s) {
  s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<s.length;) {
    if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const t=tokens.find(x=>s.startsWith(x.s,i));
    assert.ok(t,"The source word must be mappable to GP29");
    out.push(t.i);i+=t.s.length;
  }
  return out;
}
/** @param {string} s @returns {number[]} */
const toGP = s => (s.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const ref=toGP(shakespeare), novel=toGP(gibran);
assert.equal(ref.length,217106);
assert.equal(novel.length,62492);
const original=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,LENGTH);
const unigram=new Int32Array(MOD);
const bigram=Array.from({length:MOD},()=>new Int32Array(MOD));
for(let i=0;i<ref.length;i++) {
  unigram[ref[i]]++;
  if(i)bigram[ref[i-1]][ref[i]]++;
}
const ln=Array.from({length:MOD},(_,p)=>
  Array.from({length:MOD},(_,v)=>
    Math.log((bigram[p][v]+3)/(unigram[p]+3*MOD))));

/** @returns {number[]} Ordinary-prime totient modulo GP29. */
function primeRows() {
  const sieve=new Uint8Array(550000),values=[];
  for(let p=2;p<sieve.length&&values.length<18000;p++){
    if(sieve[p])continue;
    values.push((p-1)%MOD);
    if(p*p<sieve.length)for(let v=p*p;v<sieve.length;v+=p)sieve[v]=1;
  }
  assert.equal(values.length,18000);
  assert.equal(values[9],28);
  assert.equal(values.filter(v=>v===28).length,1);
  assert.ok(values.every((v,i)=>i<2||i+1>=values.length||
    !(values[i]===values[i-1]&&values[i]===values[i+1])),
    "No three consecutive equal key rows are allowed in the chosen finite clock");
  return values;
}
const K=primeRows();

/** @param {number} seed @returns {{u:()=>number,index:(n:number)=>number}} */
function rng(seed) {
  let state=seed>>>0;
  const u=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return(state>>>0)/4294967296;};
  return {u,index:n=>Math.floor(u()*n)};
}
/** @param {{index:(n:number)=>number}} random @returns {number[]} */
function permute(random) {
  const a=Array.from({length:MOD},(_,i)=>i);
  for(let k=MOD-1;k>0;k--){const j=random.index(k+1);[a[k],a[j]]=[a[j],a[k]];}
  return a;
}
/** @param {number[]} seq */
function ioc(seq) {
  const f=new Int32Array(MOD);
  for(const v of seq)f[v]++;
  return f.reduce((a,v)=>a+v*(v-1),0)/(seq.length*(seq.length-1));
}
/**
 * @param {number[]} plain
 * @param {number[]} base Bijective, known cyclic-table base T_r(p)=(base[p]+r+s) mod 29
 * @param {number} shift
 * @param {number} seed
 */
function encrypt(plain,base,shift,seed) {
  const random=rng(seed),cipher=new Uint8Array(plain.length);
  const paths=new Uint16Array(plain.length),rejects=new Uint8Array(plain.length);
  let pointer=0,prev=-1,skips=0;
  for(let i=0;i<plain.length;i++){
    let value=mod(base[plain[i]]+K[pointer]+shift),skipped=0;
    while(value===prev&&random.u()<Q){
      pointer++;skipped++;skips++;
      assert.ok(skipped<=2,"The finite prime row stream has no triple repeats");
      value=mod(base[plain[i]]+K[pointer]+shift);
    }
    cipher[i]=value;paths[i]=pointer;rejects[i]=skipped;
    prev=value;pointer++;
  }
  return {cipher,paths,rejects,skips};
}
/**
 * Exact Viterbi for the source prime rows and finite 0/1/2 collision skips.
 * All secret skip positions are hidden from this function.
 * @param {number[]|Uint8Array} cipher
 * @param {number[]} base Known base permutation, NOT recovered from original
 * @param {number} shift
 * @returns {{decoded:Uint8Array,keys:Uint16Array,rejects:Uint8Array,
 * score:number,skips:number}}
 */
function recover(cipher,base,shift) {
  const n=cipher.length,inv=new Uint8Array(MOD);
  base.forEach((v,i)=>{inv[v]=i;});
  assert.equal(new Set(base).size,MOD);
  let dp=new Float64Array(B).fill(-1e100);dp[0]=0;
  const trace=new Uint8Array(n*B);trace.fill(255);
  const logReject=Math.log(Q),logKeepRepeat=Math.log(1-Q);
  for(let i=0;i<n;i++){
    const next=new Float64Array(B).fill(-1e100);
    const prior=i?cipher[i-1]:-1;
    for(let k=0;k<B;k++){
      const previousScore=dp[k];
      if(previousScore<-1e99)continue;
      const j=i+k, prevP=i?inv[mod(prior-K[j-1]-shift)]:0;
      for(let r=0;r<=2&&k+r<B;r++){
        const acceptedRow=j+r;
        const value=inv[mod(cipher[i]-K[acceptedRow]-shift)];
        let legal=true;
        for(let t=0;t<r;t++){
          if(mod(K[j+t]-K[acceptedRow]+cipher[i])!==prior){
            legal=false;break;
          }
        }
        if(!legal)break;
        const score=previousScore+r*logReject+
          (i?ln[prevP][value]:0)+
          (cipher[i]===prior?logKeepRepeat:0);
        if(score>next[k+r]){
          next[k+r]=score;trace[i*B+k+r]=r;
        }
      }
    }
    dp=next;
  }
  let best=0;
  for(let k=1;k<B;k++)if(dp[k]>dp[best])best=k;
  assert.ok(dp[best]>-1e99,"No legal key-history path");
  const total=best,decoded=new Uint8Array(n),paths=new Uint16Array(n),
    rejects=new Uint8Array(n);
  for(let i=n-1;i>=0;i--){
    const keyPosition=i+best;
    paths[i]=keyPosition;
    decoded[i]=inv[mod(cipher[i]-K[keyPosition]-shift)];
    const r=trace[i*B+best];
    assert.notEqual(r,255,"Viterbi backtrace must stay reachable");
    rejects[i]=r;
    best-=r;
  }
  assert.equal(best,0);
  return {decoded,keys:paths,rejects,score:dp[total]/n,skips:total};
}

/** Forward reencryption with the recovered path for exact reversible control. */
function reencrypt(plain,base,shift,rejects) {
  let pointer=0,prev=-1;
  const c=new Uint8Array(plain.length);
  for(let i=0;i<plain.length;i++){
    for(let r=0;r<rejects[i];r++){
      assert.equal(mod(base[plain[i]]+K[pointer]+shift),prev);
      pointer++;
    }
    const value=mod(base[plain[i]]+K[pointer]+shift);
    c[i]=value;prev=value;pointer++;
  }
  return c;
}

const trials=[];
const plants=[
  [19124,0x97173301,0x3301ade3,0],
  [3333,0x97173302,0x3301ade4,7],
  [40412,0x97173303,0x3301ade5,13],
  [28001,0x97173304,0x3301ade6,24]
];
for(let t=0;t<plants.length;t++){
  const [offset,seed,tableSeed,shift]=plants[t];
  const plain=novel.slice(offset,offset+LENGTH),base=permute(rng(tableSeed));
  const enc=encrypt(plain,base,shift,seed);
  const found=recover(enc.cipher,base,shift);
  assert.deepEqual(reencrypt(Array.from(found.decoded),base,shift,found.rejects),
    enc.cipher,"Recovered key-path forward reconstruction");
  const matches=found.decoded.reduce((sum,v,i)=>sum+Number(v===plain[i]),0);
  const matchingKeys=found.keys.reduce((sum,v,i)=>
    sum+Number(v===enc.paths[i]),0);
  const heldout=Array.from({length:150},(_,i)=>8500+i)
    .reduce((sum,i)=>sum+Number(found.decoded[i]===plain[i]),0);
  trials.push({trial:t,offset,shift,trueSkips:enc.skips,
    recoveredSkips:found.skips,matchGlyphs:matches,matchingKeys,
    heldout150:heldout,plaintextIoC:ioc(plain),
    ciphertextIoC:ioc(enc.cipher),decodedIoC:ioc(found.decoded),
    recoveredScore:found.score});
}

const identity=Array.from({length:MOD},(_,i)=>i);
const originalResults=[];
for(let shift=0;shift<MOD;shift++){
  const rec=recover(original,identity,shift);
  assert.deepEqual(reencrypt(Array.from(rec.decoded),identity,shift,rec.rejects),
    Uint8Array.from(original),"Every original candidate must forward reconstruct");
  originalResults.push({shift,score:rec.score,skips:rec.skips,
    decodedIoC:ioc(rec.decoded),
    opening:gp.translit.map((_,i)=>i).length===29?
      Array.from(rec.decoded.slice(0,70)).map(v=>gp.translit[v]).join(""):""});
}
const top=originalResults.slice().sort((a,b)=>b.score-a.score).slice(0,3);
const bestIoC=originalResults.slice().sort((a,b)=>b.decodedIoC-a.decodedIoC).slice(0,3);
const answer={
  model:"C=(secret known base[P]+phi(prime[position])+shift) mod29; skip on prior-cipher collision with probability .81",
  status:"Controlled synthetic plaintext recovery and bounded original failure, NO ORIGINAL UNKNOWN PLAINTEXT",
  original:{runes:LENGTH,cipherIoC:ioc(original),equalDoublets:
    original.slice(1).reduce((s,c,i)=>s+Number(c===original[i]),0)},
  plants:trials,originalIdentityBase:{all29Shifts:originalResults,
    topScoring:top,topDecodedIoC:bestIoC}
};
console.log(JSON.stringify(answer,null,2));
