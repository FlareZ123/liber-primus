"use strict";
/**
 * Source-locked original LP2 p50→p51 32-byte-column BIP39 word-key test.
 * BIP39 was assigned 2013-09-10; the actual p50 32×8 table permits eight
 * 256-bit entropy columns and three have NO second-character I/l ambiguity.
 * Reencode BIP39 24-word mnemonics into native GP29 and attempt only the
 * historic LP1 Vigenère cipher in its zero-phase direct +/- forms on the
 * authentic 534-rune p51–53 source-original tail.
 *
 * BIP39 encoding is deterministic for EVERY 32-byte entropy string:
 * obtaining 24 English dictionary words is NEVER a decryption itself.
 * This is a finite preselected candidate-key test, not author-authenticated.
 *
 * SFT: node sims/lp2_p50_bip39_24word_p51_original_keygate_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const list=read("resources/external/bip39-english-2013.txt").trim().split(/\r?\n/);
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
assert.equal(list.length,2048);
assert.equal(new Set(list).size,2048);
assert.equal(list[0],"abandon");
assert.equal(list[2047],"zoo");
assert.equal(grid.rows.length,32);
assert(grid.rows.every(row=>row.length===8));
assert(grid.byte_rows.every(row=>row.length===8));
const label="BIP39 exact 2013 signed 256-bit entropy";

/**
 * Standard BIP39: sha256 checksum of 256-bit entropy, appended as 8 bits,
 * then 24 indices of 11 bits into official pinned BIP39 word list.
 * @param {Buffer} entropy
 */
function mnemonic(entropy){
  assert.equal(entropy.length,32);
  const checksum=crypto.createHash("sha256").update(entropy).digest()[0];
  const bits=Array.from(entropy,b=>b.toString(2).padStart(8,"0")).join("")
     +checksum.toString(2).padStart(8,"0");
  assert.equal(bits.length,264);
  const index=[];
  for(let i=0;i<24;i++)index.push(Number.parseInt(bits.slice(11*i,11*i+11),2));
  assert(index.every(x=>x>=0&&x<2048));
  const words=index.map(i=>list[i]);
  return {phrase:words.join(" "),words,index};
}
// Official TREZOR/python-mnemonic vectors.json 256-bit zero entropy:
// pbkdf2 mnemonic with passphrase TREZOR has fixed 64-byte seed.
const zero=mnemonic(Buffer.alloc(32));
assert.equal(zero.phrase,Array(23).fill("abandon").concat(["art"]).join(" "));
const knownSeed=crypto.pbkdf2Sync(zero.phrase.normalize("NFKD"),
  "mnemonicTREZOR".normalize("NFKD"),2048,64,"sha512");
assert.equal(knownSeed.toString("hex"),
"bda85446c68413707090a52022edd26a1c9462295029f2e60cd7c4f2bbd3097170af7a4d73245cafa9c3cca8d561a7c3de6f5d4a10be8ed2a5e608d68f92fcc8");

const cipher=[51,52,53].flatMap(p=>corpus.pages[p].indices);
assert.equal(cipher.length,534);
assert.equal(corpus.pages[50].indices.length,0);
assert.equal(corpus.pages[51].indices.length,92);
const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const control=encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const counts=Array(29).fill(1);
for(const x of control)counts[x]++;
const total=counts.reduce((a,b)=>a+b,0);
const p=counts.map(x=>x/total);
/** @param {number[]} x */
function score(x){
  const h=Array(29).fill(0);
  for(const y of x)h[y]++;
  const pairs=h.reduce((s,c)=>s+c*(c-1),0);
  return {ioc:pairs/(x.length*(x.length-1)),
    logLikelihoodRatio:x.reduce((s,y)=>s+Math.log(29*p[y]),0),
    topFive:h.toSorted((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0)/x.length};
}
/** @param {number[]} c @param {number[]} key @param {number} sign */
function decrypt(c,key,sign){
  return c.map((x,i)=>(x+sign*key[i%key.length]+29)%29);
}
const candidates=[];
const fullAlphabet=grid.alphabet;
const dropFAlphabet=fullAlphabet.replace("f","");
assert.equal(fullAlphabet.length,60);
assert.equal(dropFAlphabet.length,59);
for(const [radix,alphabet] of [[60,fullAlphabet],[59,dropFAlphabet]]){
  const readByte=token=>{
    assert.equal(token.length,2);
    const first=alphabet.indexOf(token[0]),last=alphabet.indexOf(token[1]);
    assert(first>=0&&last>=0);
    const byte=radix*first+last;
    assert(byte>=0&&byte<=255);
    return byte;
  };
  assert.equal(readByte("3N"),radix===60?203:200);
  for(let c=0;c<8;c++){
    const ambiguous=grid.rows.reduce((count,row)=>count+Number(/[Il]/.test(row[c].slice(1))),0);
    const bytes=Buffer.from(grid.rows.map(row=>readByte(row[c])));
    assert.equal(bytes.length,32);
    if(radix===60)assert.deepEqual([...bytes],grid.byte_rows.map(row=>row[c]));
    const mn=mnemonic(bytes);
    const seed=crypto.pbkdf2Sync(mn.phrase.normalize("NFKD"),"mnemonic",2048,64,"sha512");
    const key=encodeSourceNativeGP(mn.phrase);
    assert(key.length>=24);
    // A complete original 95-rune solved positive uses the derived key
    // with the same historic direct Vigenère combiner, not a tuned key.
    const encrypted=decrypt(solved,key,+1);
    assert.deepEqual(decrypt(encrypted,key,-1),solved);
    for(const sign of [-1,+1]){
      const x=decrypt(cipher,key,sign);
      assert.deepEqual(decrypt(x,key,-sign),cipher);
      candidates.push({
        radix,
        column:c,
        sourceGlyphAmbiguities:ambiguous,
        sourceRobust:ambiguous===0,
        operation:sign<0?"C−K (LP1 direct Vigenere)":"C+K (inverse-sign)",
        mnemonicWords:mn.words.join(" "),
        nativeGPKeyLength:key.length,
        bip39SeedFirst16Bytes:seed.subarray(0,16).toString("hex"),
        score534:score(x),
        initialSourcePage51LatinGP:x.slice(0,92).map(y=>corpus.translit[y]).join(" "),
        first16RuneOrdinals:x.slice(0,16)
      });
    }
  }
}
const strong=candidates.filter(x=>x.sourceRobust);
assert.equal(strong.length,12);
const solvedScore=score(solved);
assert(solvedScore.logLikelihoodRatio>0, "known solved p57 must exceed native uniform likelihood");
const output={
  sourceBip39:"https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
  sourceEnglishWordlist:"https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt",
  historicUse:"BIP39 2013 mnemonic followed by Cicada LP1 documented Vigenere, no first-party LP2 selector",
  gridDimensions:[32,8],cipherRunes:534,sourceRobustColumns:[0,3,4],radices:[60,59],
  exactBIP39OfficialVector:true,knownSolved95SourceScore:solvedScore,
  fixedDirectVigenereCandidates:candidates
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
