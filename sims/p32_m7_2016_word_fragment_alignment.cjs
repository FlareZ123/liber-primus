#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const trans=read('resources/lp2-transcription.txt');
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
// An original page line-break '/' is layout only: consume its following newline.
// The legacy parser stripped '/' but left '\n', spuriously splitting four words.
const p32Raw=trans.split('%')[32]||'';
const p32=p32Raw.replace(/\/\s*/gu,'').match(/[\u16A0-\u16FF]+/gu)||[];
const legacy=p32Raw.replace(/\//g,'').match(/[\u16A0-\u16FF]+/gu)||[];
assert.strictEqual(p32.length,22);
assert.strictEqual(legacy.length,26);
assert.strictEqual(p32.reduce((n,w)=>n+[...w].length,0),121);
assert.strictEqual(legacy.reduce((n,w)=>n+[...w].length,0),121);
const prime=new Map(c.runes.map((r,i)=>[r,c.prime[i]]));
const ords=[13,24,19,3,6,20,17];
// The old 7-cycle uses one-based word 24. Correct p32 has only 22 words.
// Retain its numeric legacy output as a regression artifact, never as a
// source-selected address or decryption instruction.
assert.ok(ords.some(n=>n>p32.length));
const selected=ords.map(n=>legacy[n-1]);
const lengths=selected.map(w=>[...w].length);
const sums=selected.map(w=>[...w].reduce((s,r)=>s+prime.get(r),0));
assert.deepStrictEqual(lengths,[7,2,5,5,5,2,4]);
assert.deepStrictEqual(sums,[345,62,277,267,184,98,160]);
const body=(signed.split('-----BEGIN PGP SIGNATURE-----')[0].split('Hash: SHA1')[1]||'').replace(/\r/g,' ');
const tokens=body.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)||[];
const alpha=body.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[];
assert.strictEqual(tokens.length,45);assert.strictEqual(alpha.length,44);
const select=(a,ix)=>ix.map(n=>a[n-1]);
const Awords=select(tokens,ords),A=Awords.join('').toUpperCase();
const Bpos=sums.map(s=>((s-1)%tokens.length)+1),Bwords=select(tokens,Bpos),B=Bwords.join('').toUpperCase();
const B44=select(alpha,sums.map(s=>((s-1)%alpha.length)+1)).join('').toUpperCase();
assert.strictEqual(A,'THEROADMAPPATHEPIPHANYTHEIRARE');
assert.strictEqual(B,'DIRECTIONARESEEKSPATHSLIESTHEAND');
const marks=ink.pages.flatMap(p=>(p.large_punctuation||[]).filter(m=>m[1]===13).map(m=>({page:p.page,offset:m[0],ink:m[2]})))
 .sort((a,b)=>a.page-b.page||a.offset-b.offset||(a.ink==='black'?-1:b.ink==='black'?1:0));
assert.strictEqual(marks.length,31);
const starts=[0];let base=0;
for(const p of c.pages){for(const m of marks.filter(x=>x.page===p.page))starts.push(base+m.offset);base+=p.indices.length;}
const full=c.pages.flatMap(p=>p.indices);
assert.strictEqual(full.length,13136);assert.strictEqual(starts.length,32);assert.strictEqual(starts[28],12956);
const frags=starts.map((s,i)=>full.slice(s,i+1<starts.length?starts[i+1]:full.length));
const empty=frags.map((f,i)=>f.length===0?i:-1).filter(i=>i>=0);
const non=frags.map((f,i)=>({id:i,f})).filter(x=>x.f.length);
assert.deepStrictEqual(empty,[8,11]);assert.strictEqual(non.length,30);
const AwordLengths=Awords.map(w=>w.length),BwordLengths=Bwords.map(w=>w.length);
const cum=a=>a.reduce((o,n)=>{o.push((o.at(-1)||0)+n);return o;},[]);
const Aends=cum(AwordLengths),Bends=cum(BwordLengths);
assert.deepStrictEqual(AwordLengths,[3,4,3,4,8,5,3]);
assert.deepStrictEqual(BwordLengths,[9,3,5,5,4,3,3]);
assert.deepStrictEqual(Bends,[9,12,17,22,26,29,32]);
assert.strictEqual(empty.map(i=>B[i]).join(''),'NE');
const B30=[...B].filter((_,i)=>!empty.includes(i)).join('');
assert.strictEqual(B30,'DIRECTIOARSEEKSPATHSLIESTHEAND');
const AendIds=Aends.map(n=>non[n-1].id),BendIds=Bends.map(n=>n-1);
assert.deepStrictEqual(AendIds,[2,6,10,15,23,28,31]);
assert.deepStrictEqual(BendIds,[8,11,16,21,25,28,31]);

// Treat A-words as seven row groups and B-words as seven column groups.
// Each stream partitions the same chronological 30 nonempty fragments.
const cells=Array.from({length:7},()=>Array.from({length:7},()=>[]));
for(let rank=0;rank<non.length;rank++){
 const item=non[rank];
 const ag=Aends.findIndex(end=>rank<end);
 const bg=Bends.findIndex(end=>item.id<end);
 cells[ag][bg].push(item.id);
}
const rowMajor=cells.flat().flat();
const columnMajor=Array.from({length:7},(_,b)=>Array.from({length:7},(_,a)=>cells[a][b]).flat()).flat();
const chronological=non.map(x=>x.id);
assert.deepStrictEqual(rowMajor,chronological);
assert.deepStrictEqual(columnMajor,chronological);
const overlapMatrix=cells.map(row=>row.map(cell=>cell.length));
console.log(JSON.stringify({
 status:'RETIRED: invalid p32 source word indexing caused by layout newlines',
 correctedP32WordCount:p32.length,legacyP32WordCount:legacy.length,
 invalidOneBasedP32Ordinals:ords.filter(n=>n>p32.length),
 correctedP32Words:p32.map(w=>[...w].map(r=>c.translit[c.runes.indexOf(r)]).join('')),
 m7Ordinals:ords,p32Words:selected,p32Lengths:lengths,p32PrimeSums:sums,
 messageTokenCount:tokens.length,alphaOnlyCount:alpha.length,A,AwordLengths,B,BwordLengths,B44,
 fragmentCount:frags.length,fullRuneCount:full.length,unknownEnd:starts[28],empty,nonemptyCount:non.length,
 emptyLetters:empty.map(i=>B[i]).join(''),B30,AendIds,BendIds,
 overlapMatrix,rowMajorIds:rowMajor,columnMajorIds:columnMajor,
 bothGridReadingsEqualChronological:true,
 interpretation:'Legacy line-break split invalidates word 24 and the entire purported p32-selected A/B chain. The two conditional legacy partitions are interval overlaps and yield only chronological fragment order, not a permutation.'},null,2));
