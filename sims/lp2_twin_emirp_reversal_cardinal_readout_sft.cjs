"use strict";
/** Director #2325: source-constrained twin-prime reversal and rune-ordinal control. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const read=(p)=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const prime=(n)=>crypto.checkPrimeSync(BigInt(n));
const reverse=(n)=>Number(String(n).split("").reverse().join(""));
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tape=c.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(tape.length,12956);
const letter=(n,base=1)=>c.translit[tape[n-base]];
const original=read("resources/cicada2014-openpuff-magic-squares.txt");
const matrices=original.trim().split(/\r?\n\s*\r?\n/).map(b=>b.trim().split(/\r?\n/).map(r=>r.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(a=>a.length),[5,7,5]);
assert.deepEqual(matrices.map(a=>a[0].reduce((s,n)=>s+n,0)),[3301,1033,1033]);
for(const a of matrices){
 const total=a[0].reduce((s,n)=>s+n,0);
 for(const row of a)assert.equal(row.reduce((s,n)=>s+n,0),total);
 for(let i=0;i<a.length;i++)assert.equal(a.reduce((s,row)=>s+row[i],0),total);
}
const image=fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/32.jpg"));
assert.equal(crypto.createHash("sha256").update(image).digest("hex"),"5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5");
const gp=[];for(let x=2;gp.length<29;x++)if(prime(x))gp.push(x);
assert.equal(3301-gp[0],3299); // Printed red origin of p15 Fibonacci-prime spiral
const runePrime=new Map(c.runes.map((r,i)=>[r,gp[i]]));
const p57=read("resources/liber-primus/lp2-transcription.txt").split("%").at(-1);
const sections=p57.replace(/[\/\r\n]/g,"").split(/[.§]/).map(x=>[...x].filter(r=>runePrime.has(r))).filter(a=>a.length);
assert.deepEqual(sections.map(a=>a.length),[7,30,30,28]);
const sums=sections.map(a=>a.reduce((s,r)=>s+runePrime.get(r),0));
assert.deepEqual(sums,[449,1259,1031,1229]);
assert.equal(sums.slice(1).reduce((p,v)=>p*v,1),1595277641);
for(const n of [1031,1033,3299,3301,1301,9923])assert.ok(prime(n));
assert.equal(reverse(1033),3301);
assert.equal(reverse(3299),9923);
assert.equal(reverse(1031),1301);
assert.deepEqual([1033,3301].map(n=>letter(n)),["F","A"]);
assert.deepEqual([1031,3299].map(n=>letter(n)),["TH","W"]);
assert.deepEqual([1301,9923].map(n=>letter(n)),["N","S"]);
assert.deepEqual([1301,9923].map(n=>letter(n,0)),["T","EO"]);
assert.deepEqual([1259,1031,1229].map(n=>letter(reverse(n))),["C","N","B"]);
const mirror=[],twins=[],emirps=[];
for(let p=1000;p<=3301;p++){
 const q=reverse(p);
 if(p<=q||!prime(p)||!prime(q))continue;
 mirror.push([p,q]);
 if(!prime(p-2)||!prime(q-2))continue;
 twins.push([p,q]);
 if(prime(reverse(p-2))&&prime(reverse(q-2)))emirps.push([p,q]);
}
assert.equal(mirror.length,17);
assert.deepEqual(twins,[[1321,1231],[3301,1033]]);
assert.deepEqual(emirps,[[3301,1033]]);
console.log("PASS 2014 squares: 3301,1033,1033; p15 red 3299; p57 prime sums:",sums);
console.log("PASS pre-LP2 PARABLE product:",sums.slice(1).reduce((p,v)=>p*v,1));
console.log("PASS reversed lower twin primes: 1031 -> 1301; 3299 -> 9923");
console.log("CONDITIONAL 1-based original unknown rune tape: N S");
console.log("RIVAL 0-based: T EO; full PARABLE prime triplet: C N B");
console.log("The reconstructed 2013 NUMBER operator would return +,+ for the emirps.");
console.log("NO first-party rune-position indexing rule, receiver, or genuine unknown plaintext.");
