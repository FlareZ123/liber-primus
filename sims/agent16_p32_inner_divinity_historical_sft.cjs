"use strict";
/**
 * Source-led bounded transfer:
 * p57 explicitly says to shed circumferences and find "divinity within".
 * The established p32 11x11 interpretation sheds one outer circumference
 * to a 9x9 inner core. Test that 81-rune core under the authentic LP1
 * DIVINITY period-8 GP29 cipher, including its real plaintext-F bypass law.
 *
 * No phase, sign, mask, offset or key symbol is fit from p32. The historical
 * cipher has P=C-K mod29; plaintext F emits ciphertext F and consumes no key.
 * All 2^m ciphertext-F bypass masks are enumerated and strict encoder-validity
 * rejects any ordinary branch that would decode to plaintext F.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const historical=require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");
const key=historical.key;
assert.deepEqual(key,[23,10,1,10,9,10,16,26]);

const p32=gp.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const core=[];
for(let r=1;r<=9;r++)for(let c=1;c<=9;c++)core.push(p32[r*11+c]);
assert.equal(core.length,81);
const fpos=core.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
assert.deepEqual(fpos,[15,16,26]);
const mod=x=>((x%29)+29)%29;
const translit=a=>a.map(x=>gp.translit[x]).join("");
const ioc=a=>{
  const h=Array(29).fill(0);for(const x of a)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};

/**
 * Decode one candidate plaintext-F bypass mask. Returns null if it violates
 * the authentic forward law because an ordinary keyed branch yields P=F.
 */
function decode(mask){
  let phase=0;
  const out=[];
  for(let i=0;i<core.length;i++){
    const fi=fpos.indexOf(i);
    const bypass=fi>=0&&((mask>>fi)&1)!==0;
    if(bypass){out.push(0);continue;}
    const P=mod(core[i]-key[phase]);
    if(P===0)return null;
    out.push(P);
    phase=(phase+1)%key.length;
  }
  return {out,consumed:core.length-fpos.filter((_,j)=>(mask>>j)&1).length};
}

const valid=[];
for(let mask=0;mask<(1<<fpos.length);mask++){
  const d=decode(mask);
  if(d)valid.push({
    mask:mask.toString(2).padStart(fpos.length,"0"),
    consumed:d.consumed,
    ioc:ioc(d.out),
    translit:translit(d.out)
  });
}
assert.equal(valid.length,1);
assert.equal(valid[0].mask,"111");

// Strict positive control from the historical source itself is imported above:
// the authentic regression asserts all 515 original LP1 runes and 11 bypasses.
assert.equal(historical.cipher.length,515);
assert.equal(historical.plaintext.length,515);
assert.equal(historical.allRecoveredFs.length,11);

console.log("SOURCE",JSON.stringify({
  p32Runes:p32.length,peeledCoreRunes:core.length,
  ciphertextFPositions:fpos,keyIndices:key
}));
console.log("STRICT_VALID_MASKS",JSON.stringify(valid));
console.log("AUTHENTIC_LP1_CONTROL",JSON.stringify({
  runes:historical.cipher.length,bypasses:historical.allRecoveredFs.length,status:"PASS"
}));
console.log("DECISION","The only strict historical DIVINITY/F-bypass decode of the p32 inner 9x9 core is nonlinguistic.");
