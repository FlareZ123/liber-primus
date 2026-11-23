'use strict';
/**
 * Original-source Pascal/plaintext-feedback continuation of provisional p36
 * "MEANING" under historical Stage11 HTML numbers 133 | 331 -> 1331.
 *
 * Hypothesis: after four directly keyed runes, run a fourth-order, plaintext-
 * dependent binomial register using coefficients [1,3,3,1].
 * This is distinct from repeating 1331, a Pascal KEYSCHEDULE recurrence, and
 * the standard one-rune/four-rune plaintext autokey already tested.
 * There are no fitted phases/IVs, resets inside the five printed numbered
 * units, alphabet reductions, skipped F symbols, or ciphertext-driven keys.
 *
 * Node.js 22: node sims/lp2_stage11_1331_pascal_plainfeedback_original_sft.cjs
 * Read-only, no writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const html=read('resources/historical/stage11-2014-index.html');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tape=read('resources/liber-primus/lp2-transcription.txt');
const solved=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const a=/<title>(\d+)<\/title>/.exec(html)?.[1];
const b=/<div id="(\d+)">/.exec(html)?.[1];
assert.equal(a,'133');
assert.equal(b,'331');
let overlap=0;
for(let i=1;i<=Math.min(a.length,b.length);i++)
 if(a.endsWith(b.slice(0,i)))overlap=i;
const key=Array.from(a+b.slice(overlap),Number);
assert.deepEqual(key,[1,3,3,1]);
const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
const pages=tape.split('%').map(s=>s.replace(/\$/g,'')).filter(s=>s.trim());
assert.equal(pages.length,57);
const raw=[
 pages[36].split('1-')[1],
 pages[37].split('2-')[1].split('3-')[0],
 pages[37].split('3-')[1].split('4-')[0],
 pages[37].split('4-')[1]+pages[38].split('5-')[0],
 pages[38].split('5-')[1].split('&')[0]
];
/** @param {string} section */
const words=section=>section.replace(/[\/\r\n]/g,'').split(/[-.]/)
 .filter(Boolean).map(token=>[...token].filter(r=>idx.has(r)).map(r=>idx.get(r))).filter(w=>w.length);
const sections=raw.map(words);
assert.deepEqual(sections.map(x=>x.length),[30,20,25,19,28]);
assert.deepEqual(sections.map(x=>x.flat().length),[139,91,98,96,129]);
/** @param {number} n */
const mod=n=>((n%29)+29)%29;
/** @param {number[]} stream @param {number} i */
const tap=(stream,i)=>stream[i-1]+3*stream[i-2]+3*stream[i-3]+stream[i-4];
/** @param {number[]} cipher */
function decode(cipher) {
 const plain=[];
 for(let i=0;i<cipher.length;i++)
  plain.push(mod(cipher[i]-(i<4?key[i]:tap(plain,i))));
 return plain;
}
/** @param {number[]} plain */
function encode(plain) {
 const cipher=[];
 for(let i=0;i<plain.length;i++)
  cipher.push(mod(plain[i]+(i<4?key[i]:tap(plain,i))));
 return cipher;
}
/** @param {number[]} runes */
function ioc(runes) {
 const f=Array(29).fill(0);
 for(const r of runes)f[r]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}
/** @param {number[]} indices */
const text=indices=>indices.map(n=>corpus.translit[n]).join('-');
const known=corpus.pages.find(x=>x.page===57).indices;
assert.equal(known.length,95);
const planted=encode(known);
assert.deepEqual(decode(planted),known);
const wrong=planted.map((x,i)=>mod(x-key[i%4]));
const wrongMatches=wrong.reduce((s,n,i)=>s+Number(n===known[i]),0);
assert.equal(wrongMatches,7);
console.log('Native genuine-GP p57 plant:',known.length+'/95 correct; repeating-1331 wrong-op only '+wrongMatches+'/95');
for(let item=0;item<sections.length;item++) {
 const cipher=sections[item].flat();
 const plain=decode(cipher);
 assert.deepEqual(encode(plain),cipher,'exact original forward replay, item '+(item+1));
 assert.ok(ioc(plain)<0.045);
 if(item===0) {
  assert.deepEqual(cipher.slice(0,4),[20,2,12,22]);
  assert.deepEqual(plain.slice(0,4),[19,28,9,21]);
 }
 let offset=0;
 const opening=sections[item].slice(0,6).map(w=>{
  const result=text(plain.slice(offset,offset+w.length));offset+=w.length;return result;
 });
 console.log('ORIGINAL item'+(item+1)+' length='+cipher.length+
  ' words='+sections[item].length+' decodedIoC='+ioc(plain).toFixed(9)+
  ' first6='+opening.join(' / '));
}
console.log('PASS 553/553 original rune replay; 95/95 native plant; no nonlocal prose.');
