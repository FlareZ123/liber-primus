"use strict";

/**
 * Historical 2014 three-square "shed the middle circumference" gives
 * 75 source key numbers, exactly the full words on original p55 after
 * the actual one-rune p54-to-p55 carry. Here the carried GP rune 21 is
 * a literal unmasked IV and the last 75 follow a GP29 PLAINTEXT-autokey
 * recurrence, distinct from previously tested ciphertext feedback.
 *
 * For non-F plaintext: C_i=P_i+P_(i-1)-sign*K_cursor (mod29), consume key.
 * For P_i=F=0: C_i=0, do NOT consume key, update previous plaintext to 0.
 * Enumerate every skip-consume branch at the actual source ciphertext Fs.
 * Exact forward replay requires all 76 physical ciphertext symbols.
 *
 * Source-locked numbers or Euler phi mod29, chronological/reversed key
 * tapes, both signs; no key fitting, guessed shift, or text-optimized IV.
 *
 * Windows Node.js 22, CommonJS, read-only SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const matrices=read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u).map(block=>
    block.trim().split(/\r?\n/u).map(line=>line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(matrices.map(m=>m.length),[5,7,5]);
const trimmed=[matrices[0],
  matrices[1].slice(1,-1).map(row=>row.slice(1,-1)),
  matrices[2]];
assert(trimmed.every(m=>m.length===5&&m.every(row=>row.length===5)));
const values=trimmed.flatMap(m=>m.flat());
assert.equal(values.length,75);
const p55=book.pages.find(p=>p.page===55).indices;
assert.equal(p55.length,76);
const IV=p55[0];
assert.equal(IV,21);
const body=p55.slice(1);
const transcription=read("resources/lp2-transcription.txt").split("%")[54]
  .replace(/\/\r?\n/gu,"").replace(/\r?\n/gu,"");
const words=transcription.match(/[\u16A0-\u16FF]+/gu)||[];
assert.deepEqual(words.map(w=>[...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(words.flatMap(w=>[...w].map(g=>book.runes.indexOf(g))),p55);
const p56=book.pages.find(p=>p.page===56).indices;
const primes=[];
for(let n=2;primes.length<84;n++){
  let prime=true;for(let j=2;j*j<=n;j++)if(n%j===0){prime=false;break;}
  if(prime)primes.push(n);
}
let used=0;
const solved=p56.map((c,i)=>i===56?0:(c-primes[used++]+1+29000)%29);
assert.equal(used,84);
assert.deepEqual(solved.slice(0,5),[24,9,18,9,23]);
const nativeLexicon=require("./lp2_source_native_longword_lexicon.cjs")
  .sourceNativeLongwords().get(13);
assert.equal(nativeLexicon.length,426);
const dictionary=new Set(nativeLexicon.map(w=>w.indices.join(",")));
const totient=n=>{
  let x=n,v=n;
  for(let q=2;q*q<=x;q++)if(x%q===0) {
    while(x%q===0)x/=q;
    v-=v/q;
  }
  if(x>1)v-=v/x;
  return v;
};
const mod=n=>((n%29)+29)%29;
/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {number} prior
 */
function encrypt(plain,key,sign,prior) {
  let cursor=0;
  return plain.map(p=>{
    if(p===0){prior=0;return 0;}
    const cipher=mod(p+prior-sign*key[cursor]);
    prior=p;cursor++;
    return cipher;
  });
}
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {number} prior
 * @param {number} mask
 * @param {number[]} zeros
 */
function decrypt(cipher,key,sign,prior,mask,zeros) {
  let cursor=0,valid=true;
  const plain=cipher.map((c,i)=>{
    const index=zeros.indexOf(i);
    const bypass=index>=0&&Boolean(mask&(1<<index));
    if(bypass){prior=0;return 0;}
    const value=mod(c+sign*key[cursor]-prior);
    if(value===0)valid=false;
    cursor++;
    prior=value;
    return value;
  });
  return {plain,cursor,valid};
}
const allZeros=body.map((v,i)=>v===0?i:null).filter(v=>v!==null);
assert.deepEqual(allZeros,[14,24,40]);
const wordStart=[4,2,2,6,6,2].reduce((s,n)=>s+n,0);
assert.equal(wordStart,22);
const observed=[];
let controls=0;
for(const reading of ["numbers","totient"]){
  const raw=values.map(n=>mod(reading==="numbers"?n:totient(n)));
  for(const direction of ["forward","reverse"]){
    const key=direction==="reverse"?raw.slice().reverse():raw;
    for(const sign of [-1,1]){
      const viable=[];
      for(let mask=0;mask<(1<<allZeros.length);mask++){
        const p=decrypt(body,key,sign,IV,mask,allZeros);
        if(!p.valid)continue;
        assert.deepEqual(encrypt(p.plain,key,sign,IV),body);
        const word13=p.plain.slice(wordStart,wordStart+13);
        const counts=Array(29).fill(0);
        p.plain.forEach(x=>counts[x]++);
        const ioc=counts.reduce((sum,n)=>sum+n*(n-1),0)/(75*74);
        viable.push({
          mask,consumed:p.cursor,
          longWord:word13.map(v=>book.translit[v]).join(""),
          dictionaryWord:dictionary.has(word13.join(",")),
          ioc:Number(ioc.toFixed(6))
        });
      }
      observed.push({reading,direction,sign,viable});
      const clean=solved.slice(0,75);
      assert.equal(clean[56],0);
      const encrypted=encrypt(clean,key,sign,IV);
      const zeros=encrypted.map((v,i)=>v===0?i:null).filter(v=>v!==null);
      assert(zeros.length<11);
      let recovered=false;
      for(let mask=0;mask<1<<zeros.length;mask++){
        const candidate=decrypt(encrypted,key,sign,IV,mask,zeros);
        if(candidate.valid&&candidate.plain.every((v,i)=>v===clean[i])){
          assert.deepEqual(encrypt(candidate.plain,key,sign,IV),encrypted);
          recovered=true;break;
        }
      }
      assert(recovered,"Authentic solved-p56 75-rune planted control");
      controls++;
    }
  }
}
assert.equal(observed.length,8);
assert.equal(controls,8);
assert(observed.every(x=>x.viable.every(v=>!v.dictionaryWord)));
const possible=observed.flatMap(x=>x.viable.map(v=>({
  reading:x.reading,direction:x.direction,sign:x.sign,...v
})));
console.log(JSON.stringify({
 source:"2014 square raw/totient75 as source of original p55 full-physical76 plaintext-feedback",
 sourceIV:IV,originalFPositions:allZeros,
 hypotheses:8,skippaths:64,
 FCompatibleDecodings:possible.length,
 viable:possible,
 solvedP56NativeGPPlanted:controls,
 verdict:"No p55 source-native long-word candidate recovered; full76 cipher and p56 genuine-plaintext planted controls replay"
},null,2));
