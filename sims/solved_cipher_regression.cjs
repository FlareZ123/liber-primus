"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const RUNES="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const INDEX=new Map([...RUNES].map((r,i)=>[r,i]));
const LENGTHS=[184,515,157,778,755,319,89,729,1145,1729,9,1894,1021,1524,1589,3316,85,95];
const WARNING="A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE "+
  "TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS "+
  "BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED";
const AN_END="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "+
  "IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
const SPELLINGS={
  F:[0],U:[1],V:[1],TH:[2],O:[3],R:[4],C:[5],K:[5],Q:[5],
  G:[6],W:[7],H:[8],N:[9],I:[10],J:[11],EO:[12],P:[13],
  X:[14],S:[15],Z:[15],T:[16],B:[17],E:[18],M:[19],L:[20],
  NG:[21],ING:[21],OE:[22],D:[23],A:[24],AE:[25],Y:[26],
  IA:[27],IO:[27],EA:[28],QU:[5,7]
};

/** @param {string} master @returns {string[]} */
function parseSegments(master){
  const first=master.indexOf("\n\n");
  assert.ok(first>=0,"Missing transcription header");
  return master.slice(first+2).split(/\s*\$\s*/u)
    .filter((s)=>[...s].some((c)=>INDEX.has(c)));
}

/** @param {string} section @returns {number[][]} */
function runeWords(section){
  // Page and line boundaries never terminate a word.
  return section.replace(/[\/%\s]+/gu,"").split(/[-.&§]+/u)
    .map((token)=>[...token].filter((c)=>INDEX.has(c)).map((c)=>INDEX.get(c)))
    .filter((w)=>w.length>0);
}

/** @param {number[]} indices @param {string} english @returns {boolean} */
function wordMatches(indices,english){
  const memo=new Map();
  /** @param {number} i @param {number} j @returns {boolean} */
  function visit(i,j){
    if(i===english.length)return j===indices.length;
    const key=i+":"+j;
    if(memo.has(key))return memo.get(key);
    let ok=false;
    for(let n=1;n<=3&&!ok;n++){
      const glyphs=SPELLINGS[english.slice(i,i+n)];
      if(glyphs&&glyphs.every((v,k)=>indices[j+k]===v))
        ok=visit(i+n,j+glyphs.length);
    }
    memo.set(key,ok);
    return ok;
  }
  return visit(0,0);
}

/** @param {number[][]} words @param {string} english @returns {number} */
function matchCount(words,english){
  const targets=english.split(/\s+/u);
  assert.equal(words.length,targets.length,"Word segmentation mismatch");
  return words.filter((w,i)=>wordMatches(w,targets[i])).length;
}

/** @param {number} count @returns {number[]} */
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++)
    if(out.every((p)=>n%p!==0))out.push(n);
  return out;
}

/**
 * @param {number[]} cipher
 * @param {Set<number>} skips Unencrypted F rune positions
 * @param {number} offset Number of skipped initial primes
 * @returns {number[]}
 */
function decryptTotient(cipher,skips,offset=0){
  const p=primes(cipher.length+offset);
  let j=offset;
  return cipher.map((c,i)=>skips.has(i)?c:((c-(p[j++]-1))%29+29)%29);
}

/** @param {number[]} plain @param {Set<number>} skips @returns {number[]} */
function encryptTotient(plain,skips){
  const p=primes(plain.length);
  let j=0;
  return plain.map((c,i)=>skips.has(i)?c:(c+p[j++]-1)%29);
}

/** @param {number[]} values @param {number[][]} template @returns {number[][]} */
function splitLike(values,template){
  let pos=0;
  return template.map((word)=>{
    const out=values.slice(pos,pos+word.length);
    pos+=word.length;
    return out;
  });
}

/**
 * Authentic previously solved LP1 + LP2 regression.
 * @param {string} [master] Optional injected full transcription
 * @returns {{warningWords:number,anEndWords:number,uniqueSkip:number,alternatives:number}}
 */
function run(master=fs.readFileSync(
  path.join(__dirname,"..","resources","transcriptions","liber_primus_master.txt"),"utf8")){
  const sections=parseSegments(master).map(runeWords);
  assert.equal(sections.length,18);
  assert.deepEqual(sections.map((s)=>s.flat().length),LENGTHS);
  assert.equal(sections.flat(2).length,15933);

  // LP1 original scan 01: reverse Gematria Primus.
  const warningCipher=sections[0];
  const warningPlain=warningCipher.map((w)=>w.map((c)=>28-c));
  assert.equal(matchCount(warningPlain,WARNING),45);
  assert.deepEqual(warningPlain.map((w)=>w.map((v)=>28-v)),warningCipher);

  // LP2 original scan 73: totient of consecutive primes (p-1 mod 29).
  const endCipher=sections[16],c=endCipher.flat();
  assert.equal(c.length,85);
  const fsAt=c.flatMap((v,i)=>v===0?[i]:[]);
  assert.deepEqual(fsAt,[35,47,51,56,74]);
  // Known word OF identifies the one literal unencrypted F.
  const skip=new Set([56]),plain=decryptTotient(c,skip);
  assert.equal(matchCount(splitLike(plain,endCipher),AN_END),25);
  assert.deepEqual(encryptTotient(plain,skip),c);

  const candidates=[],alternatives=1<<fsAt.length;
  for(let mask=0;mask<alternatives;mask++){
    const testSkip=new Set(fsAt.filter((_,bit)=>mask&(1<<bit)));
    const test=decryptTotient(c,testSkip);
    if(matchCount(splitLike(test,endCipher),AN_END)===25)
      candidates.push([...testSkip]);
  }
  assert.deepEqual(candidates,[[56]]);
  assert.equal(matchCount(splitLike(decryptTotient(c,new Set()),endCipher),AN_END),17);
  assert.ok(matchCount(splitLike(decryptTotient(c,skip,1),endCipher),AN_END)<25);

  const result={warningWords:45,anEndWords:25,uniqueSkip:56,alternatives};
  console.log("AUTHENTIC SOLVED-CIPHER REGRESSION PASSED",JSON.stringify(result));
  return result;
}

if(require.main===module)run();
module.exports={run,parseSegments,runeWords,wordMatches,decryptTotient};
