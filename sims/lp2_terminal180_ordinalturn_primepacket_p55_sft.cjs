"use strict";
/**
 * Source-conditioned direct-key inverse, not a claim of LP2 decryption.
 * The solved p56 and clear p57 have 180 GP29 runes with index sum 29*76.
 * Divide their unmodified text into 76 consecutive packets at each GP29
 * ordinal-wheel carry; use the GP-prime SUM of each complete packet mod29
 * as the next putative p55 key digit.
 *
 * This is deliberately distinct from the pre-existing carry-trigger,
 * pre/post-wheel and trigger-prime keys. It uses the two FIRST-PARTY
 * GP numeral registers as segmentation and payload, respectively.
 *
 * Run: node sims/lp2_terminal180_ordinalturn_primepacket_p55_sft.cjs
 * Requires only resources/liber-primus/lp2-corpus.json and
 * resources/liber-primus/lp2-grid-256.json.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json");
const table=read("resources/liber-primus/lp2-grid-256.json")
  .pages.flatMap(page=>page.bytes);
const mod=x=>((x%29)+29)%29;
const translits=gp.translit.map((str,i)=>({str,i}))
  .sort((a,b)=>b.str.length-a.str.length);
function gpWord(word){
 word=word.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let i=0;i<word.length;){
  if(word.startsWith("ING",i)){out.push(21);i+=3;continue}
  if(word.startsWith("IO",i)){out.push(27);i+=2;continue}
  const token=translits.find(t=>word.startsWith(t.str,i));
  assert.ok(token,"unknown GP word: "+word.slice(i));
  out.push(token.i);i+=token.str.length;
 }
 return out;
}
const source56="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
 .split(" ").flatMap(gpWord);
const source57=gp.pages[57].indices;
const original55=gp.pages[55].indices;
assert.deepEqual([source56.length,source57.length,original55.length,table.length],
 [85,95,76,256]);
assert.deepEqual(gp.pages[55].indices.filter(x=>x===0).length,3);
const primes=[];
for(let n=2;primes.length<84;n++){
 let prime=true;
 for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}
 if(prime)primes.push(n-1);
}
let clk=0;
assert.deepEqual(source56.map(x=>x===0?0:mod(x+primes[clk++])),
 gp.pages[56].indices);
assert.equal(clk,84);
const solved=source56.concat(source57);
assert.equal(solved.reduce((a,b)=>a+b,0),2204);
assert.equal(solved.reduce((a,x)=>a+gp.prime[x],0),7888);
const packets=[],crossingIndices=[];
let wheel=0,packet=[];
for(let i=0;i<solved.length;i++){
 wheel+=solved[i];packet.push(solved[i]);
 if(wheel>=29){
  assert.ok(wheel<58,"one carry per source rune");
  wheel-=29;
  packets.push(packet);crossingIndices.push(i);
  packet=[];
 }
}
assert.equal(wheel,0);assert.deepEqual(packet,[]);
assert.equal(packets.length,76);
const key=packets.map(a=>a.reduce((sum,x)=>sum+gp.prime[x],0)%29);
assert.deepEqual(key.slice(0,10),[10,9,21,9,16,9,23,28,17,20]);
assert.equal(key.reduce((a,b)=>a+b,0),1131);
function phi(n){
 let k=n;
 for(let d=2;d*d<=n;d++){
  if(n%d===0){
   while(n%d===0)n/=d;
   k-=Math.floor(k/d);
  }
 }
 if(n>1)k-=Math.floor(k/n);
 return k;
}
const primePacketSums=packets.map(a=>a.reduce((sum,x)=>sum+gp.prime[x],0));
const totientKey=primePacketSums.map(n=>phi(n)%29);
assert.deepEqual(primePacketSums.slice(0,10),[126,96,108,96,161,67,110,86,133,78]);
assert.deepEqual(totientKey.slice(0,10),[7,3,7,3,16,8,11,13,21,24]);
assert.equal(totientKey.reduce((a,b)=>a+b,0),1028);
const gpText=a=>a.map(x=>gp.translit[x]).join(" ");
const ioc=a=>{
 const hist=Array(29).fill(0);
 for(const x of a)hist[x]++;
 return 29*hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
/** Historical GP additive cipher, plaintext F=0 literal and nonconsuming. */
function encrypt(plain,k=key){
 let keyAt=0;
 return plain.map(x=>x===0?0:mod(x+k[keyAt++]));
}
function inverse(cipher,k=key){
 const zeroSlots=cipher.flatMap((v,i)=>v===0?[i]:[]);
 assert.ok(zeroSlots.length<14,"small exhaustive F mask");
 const variants=[];
 for(let mask=0;mask<(1<<zeroSlots.length);mask++){
  let used=0,ok=true,plain=[];
  for(let i=0;i<cipher.length;i++){
   const fbit=zeroSlots.indexOf(i);
   if(fbit>=0 && (mask&(1<<fbit))){plain.push(0);continue}
   const x=mod(cipher[i]-k[used++]);
   if(x===0){ok=false;break}
   plain.push(x);
  }
  if(ok){
   assert.deepEqual(encrypt(plain,k),cipher);
   variants.push({mask,used,scaledIoC:+ioc(plain).toFixed(9),
    runeText:gpText(plain),indices:plain});
  }
 }
 return {zeroSlots,variants};
}
const sourceNativeControl=source57.slice(0,76);
const plantedCipher=encrypt(sourceNativeControl);
const recoveredPlant=inverse(plantedCipher);
assert.ok(recoveredPlant.variants.some(c=>
 c.indices.every((x,i)=>x===sourceNativeControl[i])));
const original=inverse(original55);
assert.deepEqual(original.zeroSlots,[15,25,41]);
assert.deepEqual(original.variants.map(x=>x.mask),[0,3,7]);
assert.deepEqual(original.variants.map(x=>x.used),[76,74,73]);
const phiPlantPlain=source57.slice(0,76);
const phiRecoveredPlant=inverse(encrypt(phiPlantPlain,totientKey),totientKey);
assert.ok(phiRecoveredPlant.variants.some(v=>v.indices.every((x,i)=>x===phiPlantPlain[i])));
const phiOriginal=inverse(original55,totientKey);
assert.deepEqual(phiOriginal.zeroSlots,[15,25,41]);
assert.deepEqual(phiOriginal.variants.map(x=>x.mask),[1,2,7]);
assert.deepEqual(phiOriginal.variants.map(x=>x.used),[75,75,73]);
assert.deepEqual(phiOriginal.variants.map(x=>x.scaledIoC),
 [0.946315789,0.915789474,1.058245614]);
// Independent printed-geometry control: compare this SAME 76-pad to the
// 76 outer cells of the 32x8 table under the original row-major perimeter.
const border=[];
for(let r=0;r<32;r++)for(let c=0;c<8;c++)
 if(r===0||r===31||c===0||c===7)border.push(table[r*8+c]%29);
assert.equal(border.length,76);
const exact=key.filter((x,i)=>x===border[i]).length;
const add=key.filter((x,i)=>mod(x+border[i])===original55[i]).length;
const sub=key.filter((x,i)=>mod(x-border[i])===original55[i]).length;
assert.deepEqual([exact,add,sub],[2,1,3]);
console.log(JSON.stringify({
 source:"p56 deciphered 85 GP29 plus clear p57 95 GP29",
 totalOrdinal:2204,totalPrime:7888,
 ordinalWheel:29,packetCount:76,
 packetLengths:packets.map(p=>p.length),
 first20Key:key.slice(0,20),
 p55OriginalZeroSlots:original.zeroSlots,
 nativeP57Plant:{runes:76,scaledIoC:+ioc(sourceNativeControl).toFixed(9),
  exactInverse:true},
 originalVariants:original.variants.map(({mask,used,scaledIoC,runeText})=>
  ({mask,used,scaledIoC,runeText})),
 totientPacketVariant:{
  keyPrefix:totientKey.slice(0,20),
  nativePlant:true,
  originalVariants:phiOriginal.variants.map(({mask,used,scaledIoC,runeText})=>
   ({mask,used,scaledIoC,runeText}))
 },
 originalP50Ring:{mod29Equal:exact,additiveEqualP55:add,
  subtractiveEqualP55:sub},
 decision:"No authentic p55 plaintext. Three direct prime-packet and three source-selected totient-prime-packet exact F-hold inverses are all nonprose; no selected decoder."
},null,2));
