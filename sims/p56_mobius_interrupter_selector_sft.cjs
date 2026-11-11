'use strict';
const fs=require('fs');
const assert=require('assert');
const {ciphertextWords,plaintextWords,decipher}=require('./authentic_decryption_regression.cjs');
function mu(n){
  if(!Number.isInteger(n)||n<1)return null;
  let s=1;
  for(let p=2;p*p<=n;p++){
    if(n%(p*p)===0)return 0;
    if(n%p===0){s=-s;while(n%p===0)n/=p;}
  }
  if(n>1)s=-s;
  return s;
}
const flat=x=>x.flat();
const pos=(a,v)=>a.flatMap((x,i)=>x===v?[i]:[]);
const mismatches=(a,b)=>{
  assert.strictEqual(a.length,b.length);
  return a.reduce((n,x,i)=>n+Number(x!==b[i]),0);
};
const mask=(f,s)=>f.reduce((m,x,i)=>m|(s.has(x)?1<<i:0),0);

const master=fs.readFileSync('resources/transcriptions/liber_primus_master.txt','utf8');
const start=master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
assert(start>=0,'LP2 start marker missing');
const pages=master.slice(start).split('%');
const cipher=flat(ciphertextWords(pages[56]));
const plain=flat(plaintextWords('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE'));
assert.strictEqual(cipher.length,85);
assert.strictEqual(plain.length,85);

const f=pos(cipher,0);
const z0=new Set(f.filter(i=>mu(i)===0));
const z1=new Set(f.filter(i=>mu(i+1)===0));
const d0=decipher(cipher,'totient',[],z0);
const d1=decipher(cipher,'totient',[],z1);
const dn=decipher(cipher,'totient',[],new Set());
assert.deepStrictEqual([...z0],[56]);
assert.deepStrictEqual([...z1],[35,47,51,74]);
assert.deepStrictEqual(d0.plaintext,plain);
assert.strictEqual(d0.consumed,84);
assert.strictEqual(d1.consumed,81);
assert.strictEqual(dn.consumed,85);
assert.strictEqual(mismatches(d1.plaintext,plain),50);
assert.strictEqual(mismatches(dn.plaintext,plain),29);
assert.strictEqual(mask(f,z0),8);
assert.strictEqual(mask(f,z1),23);

const sections=fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt','utf8').split('$');
const controls=[
  {name:'WELCOME',section:1,text:'WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE'},
  {name:'KOAN',section:5,text:'A KOAN DURING A LESSON THE MASTER EXPLAINED THE I THE I IS THE VOICE OF THE CIRCUMFERENCE HE SAID WHEN ASKED BY A STUDENT TO EXPLAIN WHAT THAT MEANT'},
].map(v=>{
  const p=flat(plaintextWords(v.text));
  const c=flat(ciphertextWords(sections[v.section]).slice(0,plaintextWords(v.text).length));
  const cf=pos(c,0),pf=pos(p,0),selected=cf.filter(i=>mu(i)===0);
  return {name:v.name,cipherF:cf,knownLiteralF:pf,mobiusSelected:selected,exactMatch:JSON.stringify(pf)===JSON.stringify(selected)};
});
assert.deepStrictEqual(controls[0].cipherF,[5,14,47,48,74,84]);
assert.deepStrictEqual(controls[0].knownLiteralF,[48,74,84]);
assert.deepStrictEqual(controls[0].mobiusSelected,[48,84]);
assert.deepStrictEqual(controls[1].cipherF,[10,49,58]);
assert.deepStrictEqual(controls[1].knownLiteralF,[49,58]);
assert.deepStrictEqual(controls[1].mobiusSelected,[49]);
assert(controls.every(x=>!x.exactMatch));

console.log(JSON.stringify({
  p56:{runes:cipher.length,ciphertextFOffsets:f,muAtF:f.map(i=>({offset:i,mu:mu(i),muOneBased:mu(i+1)})),zeroBasedSkips:[...z0],oneBasedSkips:[...z1],zeroBasedMask:mask(f,z0),oneBasedMask:mask(f,z1),exact85:mismatches(d0.plaintext,plain)===0,zeroBasedKeySymbolsConsumed:d0.consumed,oneBasedMismatches:mismatches(d1.plaintext,plain),oneBasedKeySymbolsConsumed:d1.consumed,noSkipMismatches:mismatches(dn.plaintext,plain),noSkipKeySymbolsConsumed:dn.consumed},
  lp1VigenereScopeControls:controls
},null,2));
console.log('PASS: zero-based Mobius selector reproduces the known p56 interrupter only.');
