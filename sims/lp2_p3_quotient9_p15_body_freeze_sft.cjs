'use strict';
// Pretarget original-body trial of the exact nine-rune p3/p15/p57 quotient.
// This generator intentionally does not read language models, solved-source
// plaintext targets, or score decryptions. It freezes BOTH signs at phase0,
// black p15 original body offset20 through 158 inclusive, and exact replay.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const mod=x=>((x%29)+29)%29;
const span=(page,index=0)=>{
 const i=ink.pages.find(x=>x.page===page).red_spans[index];
 return corpus.pages[page].indices.slice(i.start,i.start+i.length);
};
const p3=span(3,1),r15=span(15,1),r57=span(57,0),r15first=span(15,0);
assert.deepEqual(p3,[13,23,2]);
assert.deepEqual([r15.length,r15first.length,r57.length],[11,9,7]);
const delta=Array.from({length:r15.length},(_,i)=>mod(r15[i]-(r57[i]||0)));
const work=delta.slice(),key=Array(r15.length-p3.length+1).fill(0);
for(let i=key.length-1;i>=0;i--){
 const k=mod(work[i+2]*15);key[i]=k;
 for(let j=0;j<p3.length;j++)work[i+j]=mod(work[i+j]-k*p3[j]);
}
assert.deepEqual(work.slice(0,2),[0,0]);
assert.deepEqual(key,[5,5,14,9,10,4,27,17,25]);
// The original red heading ends exactly at offset20. No alternate phase,
// page selection or sign is opened after the result is inspected.
const original=corpus.pages[15].indices;
assert.equal(original.length,159);
const body=original.slice(20);
assert.equal(body.length,139);
const variants=[-1,1].map(sign=>{
 const plaintext=body.map((c,i)=>mod(c+sign*key[i%key.length]));
 assert(plaintext.every((p,i)=>mod(p-sign*key[i%key.length])===body[i]));
 return {sign,phase:0,offset:20,rawInverse:plaintext};
});
// Synthetic solved-rune positive control; not graded against original output.
const solved=corpus.pages[57].indices;
const planted=Array.from({length:139},(_,i)=>solved[i%solved.length]);
const enc=planted.map((x,i)=>mod(x+key[i%key.length]));
const dec=enc.map((x,i)=>mod(x-key[i%key.length]));
assert.deepEqual(dec,planted);
console.log(JSON.stringify({schema:1,classification:'TARGET-BLIND ORIGINAL P15 BLACK BODY; no language scoring',
 source:'physical p3 double-red13 triad, p15 double-red13 second red, solved p57 red',
 operand:'quotient(p15second-p57red)/p3triad',
 key,originalReceiver:{page:15,start:20,length:body.length,indices:body},
 mechanism:'period9 GF29 additive, key phase0, both signs, unreversed',
 variants,control:'139/139 planted solved-native GP runes invert exactly'},null,2));
