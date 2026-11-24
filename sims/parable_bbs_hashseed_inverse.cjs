#!/usr/bin/env node
"use strict";
/*
 * Fixed SHA-512 KDF test for the 2013 Parable-prime BBS hypothesis.
 * Inputs are only the canonical p57 GP29 index bytes and the corresponding
 * 16-bit big-endian GP-prime values. Digests are interpreted big-endian and
 * reduced modulo the source three-prime modulus or its two-factor Blum subset.
 * The existing collision-only GP29 Viterbi and six-page split are reused.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {pad,twoStage}=require("./parable_bbs_keyskip_inverse.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p57=corpus.pages.find(p=>p.page===57);
assert(p57 && p57.indices.length===95);
const pageIds=[0,3,8,23,27,40];
const original=pageIds.map(page=>corpus.pages[page].indices.slice(0,210));
assert(original.every(p=>p.length===210));
const N3=BigInt(1259*1031*1229);
const N2=BigInt(1259*1031);
const moduli=[{label:"threeprime",N:N3},{label:"blum-twofactor",N:N2}];
const formats=["state-low8","state-low5","bits5-lsb","bits5-msb","bits8-msb"];
const primeBytes=Buffer.alloc(p57.indices.length*2);
p57.indices.forEach((rune,i)=>primeBytes.writeUInt16BE(corpus.prime[rune],i*2));
const hashInputs=[
  {label:"p57-gp29-index-bytes",bytes:Buffer.from(p57.indices)},
  {label:"p57-gp-prime-values-u16be",bytes:primeBytes}
];
const derived=[];
for(const input of hashInputs){
  const digest=crypto.createHash("sha512").update(input.bytes).digest();
  const digestHex=digest.toString("hex");
  const digestInt=BigInt("0x"+digestHex);
  for(const {label,N} of moduli){
    const seed=Number(digestInt%N);
    derived.push({
      input:input.label,input_bytes:input.bytes.length,
      sha512:digestHex,modulus:label,modulus_decimal:N.toString(),seed
    });
  }
}
assert.equal(derived.length,4);
const results=[];
for(const d of derived){
  const N=d.modulus==="threeprime"?N3:N2;
  for(const format of formats){
    const key=pad(N,d.seed,format);
    for(const sign of [-1,1]){
      let train=0,hold=0,skips=0;
      const heads=[];
      for(const cipher of original){
        const r=twoStage(cipher,key,sign);
        train+=r.train;hold+=r.hold;skips+=r.guessedSkips;
        if(heads.length<2)heads.push(r.head);
      }
      results.push({
        input:d.input,sha512:d.sha512,modulus:d.modulus,
        modulus_decimal:d.modulus_decimal,seed:d.seed,
        format,sign,train:train/original.length,hold:hold/original.length,
        inferredSkips:skips,heldoutHeads:heads
      });
    }
  }
}
assert.equal(results.length,40);
const bestTrain=[...results].sort((a,b)=>b.train-a.train);
const bestHold=[...results].sort((a,b)=>b.hold-a.hold);
console.log(JSON.stringify({
  question:"Does SHA-512 of the solved p57 Parable supply a source-derived BBS seed?",
  status:"fixed bounded experiment; no hash, endian or representation search",
  source:{
    p57_page:57,p57_runes:p57.indices.length,
    body_clause_gp_prime_sums:[1031,1229,1259],
    audio_parable_product:1595277641,
    audio_title_gp_prime_sum:761
  },
  hash_rule:"SHA-512 bytes interpreted as one big-endian integer, reduced modulo N",
  encodings:hashInputs.map(x=>({label:x.label,bytes:x.bytes.length})),
  derivedSeeds:derived,
  receiver:{
    pages:pageIds,train_per_page:130,heldout_per_page:80,
    clock:"page-reset",cipher:"GP29 additive with collision-only hidden key skips",
    formats,signs:[-1,1],models:results.length
  },
  bestTrain:bestTrain.slice(0,10),
  bestHeldout:bestHold.slice(0,10),
  decision:"No plaintext or authentic key is established by a score alone; inspect heldout text and require independent linguistic coherence."
},null,2));
