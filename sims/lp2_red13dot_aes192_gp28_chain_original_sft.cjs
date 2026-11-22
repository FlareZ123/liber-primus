'use strict';
/*
 * One source-derived GP29 chain inverse, AES192-CTR key from the 32
 * base60 red-rune/13-dot gap counts. Single frozen mode:
 *  - GP delta is 0 only for plaintext EA (index28).
 *  - For deltas 1..28, plaintext 0..27 is (delta-1-K)%28.
 *  - K is AES-192-CTR(zero IV) bytes with unbiased <252 rejection.
 *  - Key stream continuous over p0..55; chapter markers do not consume.
 * A positive control checks actual encryption/decryption on solved p57.
 * These precise assumptions are exploratory, not Cicada-authenticated.
 * Run: node sims/lp2_red13dot_aes192_gp28_chain_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pass=execFileSync(process.execPath,[path.join(__dirname,'lp2_red13dot_base60_openpuff_key_sft.cjs'),'--password-only'],{encoding:'utf8'}).trim();
const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(pass.length,32);
let big=0n;
for(const ch of pass){const pos=alphabet.indexOf(ch);assert.ok(pos>=0);big=big*60n+BigInt(pos);}
const key=Buffer.alloc(24);
for(let i=23;i>=0;i--){key[i]=Number(big&255n);big>>=8n;}
assert.equal(big,0n);
assert.equal(key.toString('hex'),'0708f2dc76072a5a0f18c0858c4f7deddc78acb448284864');
const keyBytes=crypto.createCipheriv('aes-192-ctr',key,Buffer.alloc(16)).update(Buffer.alloc(25000));
const mod=(n,m)=>((n%m)+m)%m;
function generator(){let i=0;return()=>{while(i<keyBytes.length){const b=keyBytes[i++];if(b<252)return b%28;}throw Error('Need more AES counter bytes');};}
function encrypt(plain){const keygen=generator();let last=0;return plain.map(p=>{if(p===28)return last;assert.ok(p>=0&&p<28);last=mod(last+1+mod(p+keygen(),28),29);return last;});}
function decrypt(cipher){const keygen=generator();let last=0;return cipher.map(c=>{const d=mod(c-last,29);last=c;return d===0?28:mod(d-1-keygen(),28);});}
function ioc(a){const count=Array(29).fill(0);for(const p of a)count[p]++;return count.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));}
function show(a,n=45){return a.slice(0,n).map(x=>corpus.translit[x]).join(' ');}
const solved=corpus.pages.find(p=>p.page===57).indices;
const planted=encrypt(solved);
assert.deepEqual(decrypt(planted),solved);
assert.notDeepEqual(planted,solved);
const source=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(source.length,12956);
const decoded=decrypt(source);
const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
let offset=0;
const sectionsOut=sections.map(([from,to])=>{
  const n=corpus.pages.filter(p=>p.page>=from&&p.page<=to).reduce((x,p)=>x+p.indices.length,0);
  const part=decoded.slice(offset,offset+n),original=source.slice(offset,offset+n);
  const o={chapter:`p${from}-${to}`,runes:n,
    cipherIoc:+ioc(original).toFixed(8),
    decodedIoc:+ioc(part).toFixed(8),
    opening:show(part),
    asciiLike:false};
  offset+=n;return o;
});
assert.equal(offset,source.length);
const overall=ioc(decoded);
const strong=sectionsOut.filter(x=>x.decodedIoc>=0.05);
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-ink-annotations.json + base60-grid.json',
  keySource:pass,keyAes192Hex:key.toString('hex'),keyStream:'AES-192-CTR, all-zero IV, bytes>=252 rejected',
  cipher:'GP29 previous-cipher modulo29 step; delta0->EA, nonzero delta1..28->mod28 additive inverse',
  stream:'single continuous p0..55 key, no reset',
  solvedP57Positive: '95/95 exact AES-192/GP28 encryption/decryption',
  solvedP57PlainIoc:+ioc(solved).toFixed(8),
  decodedOriginalOverallIoc:+overall.toFixed(8),
  decodedOriginalByChapter:sectionsOut,
  humanReadableRecovery:strong.length>0?'Statistical elevation only, verify explicit text':'none; no section reaches IoC 0.05',
  evidenceClassification:'frozen hypothesis not author-selected; exact inverse alone never proves plaintext'
},null,2));
