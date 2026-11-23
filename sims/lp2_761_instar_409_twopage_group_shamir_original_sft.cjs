'use strict';
/*
 * Source clue: 2013 761.MP3 title THE INSTAR EMERGENCE, prime sums
 * [72,280,409], total761. p7=208 (280-72) runes; p13+p14
 * =272+137=409. Literal source FOLD starts at p14 rune offset2;
 * skipping its first GP F leaves 408 = 409-1 original runes.
 *
 * 280 is a primitive root mod the prime 409; starting at72 gives
 * a source-numbered 408-state complete GF409 multiplicative cycle.
 * Test it as GP29 modular +/- one-step pad, and as title-point
 * GF29 3-of-3 quadratic sharing of three 136-rune source strips.
 *
 * No instruction selecting these receiver mechanisms survives;
 * this is a clue-constrained trial, not an authenticated key.
 * node sims/lp2_761_instar_409_twopage_group_shamir_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const d=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gpprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
assert.deepEqual(solved.runes,d.runes);
const alphabet=new Map(d.translit.map((x,i)=>[x,i]));
function gpSum(s){
 let n=0;
 for(let i=0;i<s.length;){
  const digraph=s.slice(i,i+2);
  if(alphabet.has(digraph)){n+=gpprimes[alphabet.get(digraph)];i+=2;}
  else{assert.ok(alphabet.has(s[i]));n+=gpprimes[alphabet.get(s[i])];i++;}
 }
 return n;
}
const title=['THE','INSTAR','EMERGENCE'];
const sums=title.map(gpSum);
assert.deepEqual(sums,[72,280,409]);
const [seed,g,m]=sums;
const length=p=>d.pages[p].indices.length;
assert.equal(sums.reduce((a,b)=>a+b,0),761);
assert.equal(length(7),g-seed);
assert.deepEqual([length(13),length(14)],[272,137]);
assert.equal(length(13)+length(14),m);
assert.equal(m-g-seed,57);
assert.deepEqual(d.pages[14].indices.slice(2,6),[0,3,20,23]);
const original=[...d.pages[13].indices,...d.pages[14].indices];
const fslot=274;
assert.equal(original[fslot],0);
const body=original.filter((_,i)=>i!==fslot);
assert.equal(body.length,408);
const mod=x=>((x%29)+29)%29;
const ioc=v=>{
 const h=Array(29).fill(0);
 for(const x of v)h[x]++;
 return h.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1));
};
let s=seed,orbit=[];
for(let i=0;i<408;i++){orbit.push(s);s=s*g%m;}
assert.equal(s,seed);
assert.equal(new Set(orbit).size,408);
assert.ok(orbit.every(x=>x>0&&x<m));
const key=orbit.map(v=>v%29);
const subtract=body.map((v,i)=>mod(v-key[i]));
const add=body.map((v,i)=>mod(v+key[i]));
assert.deepEqual(subtract.map((v,i)=>mod(v+key[i])),body);
assert.deepEqual(add.map((v,i)=>mod(v-key[i])),body);
const replay=subtract.map((v,i)=>mod(v+key[i]));
replay.splice(fslot,0,0);
assert.deepEqual(replay,original);
const native57=d.pages[57].indices;
assert.equal(native57.length,95);
const planted=native57.map((v,i)=>mod(v+key[i]));
assert.deepEqual(planted.map((v,i)=>mod(v-key[i])),native57);
const native=[];
for(const section of solved.sections)
 for(const r of section.source_text)
  if(d.runes.includes(r))native.push(d.runes.indexOf(r));
assert.equal(native.length,2979);
function nativeFloor(n){
 let lo=Infinity;
 for(let i=0;i+n<=native.length;i++)
  lo=Math.min(lo,ioc(native.slice(i,i+n)));
 return lo;
}
const floor408=nativeFloor(408),floor136=nativeFloor(136);
assert.ok(floor408>0.056&&floor136>0.05);
const top=d.pages[13].indices.slice(0,136);
const bottom=d.pages[13].indices.slice(136);
const third=d.pages[14].indices.filter((_,i)=>i!==2);
assert.deepEqual([top.length,bottom.length,third.length],[136,136,136]);
const xs=sums.map(mod);
assert.deepEqual(xs,[14,19,3]);
function inv(x){let a=1;for(let i=0;i<27;i++)a=mod(a*x);return a;}
const weights=xs.map((x,i)=>xs.reduce((s,y,j)=>
 i===j?s:mod(s*mod(-y)*inv(mod(x-y))),1));
assert.deepEqual(weights,[19,23,17]);
const shamir=(a,b,c)=>mod(weights[0]*a+weights[1]*b+weights[2]*c);
const secret=top.map((a,i)=>shamir(a,bottom[i],third[i]));
for(let i=0;i<136;i++){
 const restored=mod(inv(weights[2])*
  (secret[i]-weights[0]*top[i]-weights[1]*bottom[i]));
 assert.equal(restored,third[i]);
 const plain=native57[i%95],ca=mod(11+7*i),cb=mod(5+13*i);
 const samples=xs.map(x=>mod(plain+ca*x+cb*x*x));
 assert.equal(shamir(...samples),plain);
}
const gp=v=>v.map(x=>d.translit[x]).join('-');
console.log('TITLE',[72,280,409],'p7=208,p13+p14=409,original FOLD-F slot274');
console.log('GF409 generator280 seed72 orbit408; original p13/p14 nonF408');
console.log('GP29 IoC',JSON.stringify({original:ioc(body),
 minus:ioc(subtract),plus:ioc(add),shamir:ioc(secret),
 nativeFloor408:floor408,nativeFloor136:floor136,
 nativeP57:ioc(native57)}));
console.log('minus prefix60',gp(subtract.slice(0,60)));
console.log('Shamir prefix60',gp(secret.slice(0,60)));
assert.ok(ioc(subtract)<floor408&&ioc(add)<floor408&&ioc(secret)<floor136);

// A further *source-contingent* lossless packing test, not a fitted cipher:
// concatenate the three original same-column GP29 digits into radix 29^3,
// then divide by the titled modulus 409. Quotient fits radix60 (0..59),
// the otherwise unselected numeric alphabet used by p50 table proposals.
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
assert.equal(grid.alphabet.length,60);
const digits=top.map((v,i)=>v*29*29+bottom[i]*29+third[i]);
const quotient=digits.map(v=>Math.floor(v/409));
const residue=digits.map(v=>v%409);
assert.ok(quotient.every(v=>v>=0&&v<60));
const qText=quotient.map(v=>grid.alphabet[v]).join('');
assert.equal(qText.length,136);
const exactResidue=orbit.slice(0,136).filter((v,i)=>v===residue[i]).length;
assert.equal(exactResidue,0);
assert.equal(quotient.filter(v=>v===59).length,1);
// Full dual-radix reconstruction; no information discarded.
assert.deepEqual(quotient.map((q,i)=>409*q+residue[i]),digits);
// A natural order-three Fourier mode over GF409 is not a direct GP word.
const omega=53;
assert.equal((1+omega+omega*omega)%409,0);
assert.equal(280**1%409,280);
const omega2=omega*omega%409;
const mode=top.map((v,i)=>(v+omega*bottom[i]+omega2*third[i])%409);
assert.equal(mode.filter(v=>v<29).length,14);
console.log('RADIX409 original 136 triples quotient ASCII-base60 prefix40',
  qText.slice(0,40),'states exactly matched',exactResidue,'of 136');
console.log('GF409 order-three Fourier mode: only',
  mode.filter(v=>v<29).length,'of 136 elements are GP29 rune indices');


/**
 * Historical original Cicada 2013 XOR was a genuine byte operation. These
 * original source strips also allow a *fixed* five-bit GP symbol readout:
 * 136 columnwise XOR results become exactly 680 bits = 85 bytes, the
 * known deciphered physical p56 source length.
 */
const xorFive=top.map((v,i)=>v^bottom[i]^third[i]);
assert.ok(xorFive.every(v=>v>=0&&v<=31));
const xorBits=xorFive.map(v=>v.toString(2).padStart(5,'0')).join('');
assert.equal(xorBits.length,680);
const xorBytes=Array.from({length:85},(_,i)=>
 parseInt(xorBits.slice(8*i,8*i+8),2));
const p56Plain=[...solved.sections.find(x=>x.name==='p56_an_end').source_text]
 .filter(ch=>d.runes.includes(ch)).map(ch=>d.runes.indexOf(ch));
const p56Cipher=d.pages[56].indices;
assert.deepEqual([p56Plain.length,p56Cipher.length,xorBytes.length],[85,85,85]);
const actualP56Key=p56Cipher.map((v,i)=>mod(v-p56Plain[i]));
const xorExactKeyMatches=xorBytes.filter((v,i)=>v%29===actualP56Key[i]).length;
const xorGPRange=xorBytes.filter(v=>v<29).length;
const xorASCII=xorBytes.filter(v=>v>=32&&v<127).length;
assert.deepEqual([xorExactKeyMatches,xorGPRange,xorASCII],[3,8,31]);
const decodeXorBits=xorBytes.map(v=>v.toString(2).padStart(8,'0')).join('');
assert.deepEqual(Array.from({length:136},(_,i)=>
 parseInt(decodeXorBits.slice(i*5,i*5+5),2)),xorFive);
console.log('P13/P14 source XOR 3x136 -> 136 base32 -> 85 bytes; authentic p56 key mod29 matches',
 xorExactKeyMatches,'/85; 85-byte result ASCII-printable',xorASCII,
 '/85; direct GP29 byte code range',xorGPRange,'/85');

/**
 * A separate full source-natural packing is 409*5=2045 bits, with exactly
 * three terminal zero pad bits -> 256 bytes, equal to printed p50 cell count.
 * Compare without fitted offset or key to both current source-compatible
 * token alphabets, and enforce exact inverse GP29 codeword constraints.
 */
const encoded=original.map(v=>v.toString(2).padStart(5,'0')).join('')+'000';
assert.equal(encoded.length,2048);
const packed409=Array.from({length:256},(_,i)=>
 parseInt(encoded.slice(i*8,i*8+8),2));
const gridAlphabet=grid.alphabet,grid59=gridAlphabet.replace('f','');
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const byteStreams=[gridAlphabet,grid59].map(a=>
 tokens.map(t=>a.length*a.indexOf(t[0])+a.indexOf(t[1])));
for(const [j,stream] of byteStreams.entries()) {
 assert.ok(stream.every(v=>v>=0&&v<256));
 const exact=packed409.filter((v,i)=>v===stream[i]).length;
 const bits=stream.map(v=>v.toString(2).padStart(8,'0')).join('');
 const runeCodes=Array.from({length:409},(_,i)=>
  parseInt(bits.slice(i*5,i*5+5),2));
 const invalid=runeCodes.filter(v=>v>=29).length;
 const pad=bits.slice(2045);
 assert.equal(exact,1);
 assert.equal(invalid,j===0?30:36);
 assert.equal(pad,j===0?'000':'111');
 console.log('409 rune 5bit -> 256 byte vs printed p50 radix',
  j===0?60:59,': exact byte equal',exact,
  '/256, attempted reverse decoding invalid GP29 words',invalid,
  '/409, last three bits',pad);
}
assert.deepEqual(Array.from({length:409},(_,i)=>
 parseInt(encoded.slice(i*5,i*5+5),2)),original);

console.log('PASS: original 409/409 replay, 408-orbit, 136-slot retained-share Shamir inverse, authentic p57 plant');
console.log('DECISION: no original unknown plaintext or creator-selected decoder');
