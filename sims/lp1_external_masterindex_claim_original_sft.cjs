'use strict';
/**
 * A public "complete solution" proposes a master-index/29 Vigenere key for LP1
 * WELCOME. Test it against the untouched first seven original ciphertext runes.
 *
 * External frozen claim: nexon33/cicada3301 FINAL_COMPLETE_SOLUTION.md (2025-10-28)
 * [62,102,115,181,217,218,333,566,596,625,689] mod 29.
 * Historical positive: Cicada 2014 LP1 WELCOME = "WELCOME"; genuine seed DIVINIT.
 *
 * Source-only SFT: no brute force, no unknown plaintext, no image manipulation.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%')[1];
const runeIndex=new Map(corpus.runes.map((ch,i)=>[ch,i]));
const letters=new Map(corpus.translit.map((ch,i)=>[ch,i]));
const cipher=[...original].filter(ch=>runeIndex.has(ch)).slice(0,7).map(ch=>runeIndex.get(ch));
const expected=[...'WELCOME'].map(ch=>letters.get(ch));
const claimedMasters=[62,102,115,181,217,218,333,566,596,625,689];
const claimedKey=claimedMasters.map(x=>x%29);
const decoded=cipher.map((x,i)=>(x-claimedKey[i]+29)%29);
const actualKey=cipher.map((x,i)=>(x-expected[i]+29)%29);
const text=x=>x.map(i=>corpus.translit[i]).join('');
assert.deepEqual(actualKey,[...'DIUINIT'].map(ch=>letters.get(ch)));
assert.deepEqual(expected.map((x,i)=>(x+actualKey[i])%29),cipher);
assert.equal(expected.length,7);
assert.equal(decoded.filter((x,i)=>x===expected[i]).length,0);
assert.notDeepEqual(decoded,expected);
console.log(JSON.stringify({
 externalClaim:'nexon33/cicada3301 (28 Oct 2025) key = 11 LSB master indices mod29, no skip before position29',
 original:'LP1 p3 WELCOME first seven source runes',
 originalCipherIndices:cipher,
 originalCipherGP:text(cipher),
 independentlySolvedPlainGP:text(expected),
 sourceRequiredKeyGP:text(actualKey),
 claimedKeyIndices:claimedKey,
 claimedKeyGP:text(claimedKey),
 decodedOriginalFirstSeven:text(decoded),
 matches:decoded.filter((x,i)=>x===expected[i]).length,
 authenticPositiveReencipher:true,
 decision:'The claimed key fails the preexisting authenticated solved WELCOME passage. Other unselected cipher stages cannot rescue the claim that this specific direct key was verified.'
},null,2));
