"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
/** Conditional p15 Fibonacci to p32 reversed-column address; no decrypted LP2. */
const c = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const page = c.pages.find(p => p.page === 32).indices;
assert.equal(page.length, 121);
const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const addresses = [fib, fib.map(i => 11*(i%11)+Math.floor(i/11)), fib.map(i => 120-i), fib.map(i => 120-11*(i%11)-Math.floor(i/11))];
/** @param {number[]} a @param {number[]} p @returns {number} */
const sum = (a,p) => p.reduce((t,i) => t+c.prime[a[i]], 0);
/** @param {number[]} a @returns {number} */
const ioc = a => { const h = Array(29).fill(0); for (const x of a) h[x]++; return h.reduce((s,v) => s+v*(v-1),0)/(a.length*(a.length-1)); };
/** @param {number[]} a @param {number[]} k @param {number} sign @returns {number[]} */
const vig = (a,k,sign) => a.map((v,i) => ((v+sign*k[i%k.length])%29+29)%29);
const sums = addresses.map(a => sum(page,a));
assert.deepEqual(sums,[443,549,479,463]);
assert.equal(sum(page,Array.from({length:11},(_,i)=>i)),563);
assert.equal(sum(page,Array.from({length:11},(_,i)=>i*11)),569);
const key = addresses[3].map(i => page[i]);
assert.equal(key.map(i=>c.translit[i]).join(" "),"EO A J TH B TH B W G J OE");
const eligible=c.pages.filter(p=>p.page<=55&&p.indices.length>=121);
assert.equal(eligible.length,52);
assert.deepEqual(eligible.filter(p=>addresses.some(a=>sum(p.indices,a)===463)).map(p=>p.page),[32]);
let seed=0x11f1b5c;
/** @returns {number} */
function random() { seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296; }
const mutable=[];for(let i=11;i<121;i++)if(i%11!==0)mutable.push(i);
assert.equal(mutable.length,100);
const counts=[0,0,0,0];let any=0;
for(let r=0;r<100000;r++){
 const copy=page.slice(),values=mutable.map(i=>page[i]);
 for(let k=values.length-1;k>0;k--){const j=Math.floor(random()*(k+1));[values[j],values[k]]=[values[k],values[j]];}
 mutable.forEach((i,j)=>{copy[i]=values[j];});
 let hit=false;
 for(let j=0;j<4;j++)if(sum(copy,addresses[j])===463){counts[j]++;hit=true;}
 if(hit)any++;
}
assert.deepEqual(counts,[956,896,179,416]);assert.equal(any,2426);
const unknown=c.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
const passage=c.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const bracket=passage.slice(91,passage.length-(c.pages.find(p=>p.page===39).indices.length-119));
assert.equal(bracket.length,1468);
const controls=[["p32",page],["three-dot bracket p33:91..p39:119",bracket],["full unknown",unknown]];
const out=controls.map(([name,v])=>({name,runicCount:v.length,sourceIoC:ioc(v),minus:ioc(vig(v,key,-1)),plus:ioc(vig(v,key,1))}));
const plant=c.pages.find(p=>p.page===57).indices;
assert.deepEqual(vig(vig(plant,key,1),key,-1),plant);
assert.deepEqual(vig(vig(plant,key,-1),key,1),plant);
console.log(JSON.stringify({source:"original p15 Fibonacci prime ordinals and p32 11x11 source",fibonacciPositions:fib.map(i=>i+1),orientationPrimeSums:sums,readout:key.map(i=>c.translit[i]).join(" "),pagesTested:eligible.length,pageMatches:[32],sourceConstraint:"first row/column p32 GP prime sums 563/569",conditionalPermutationCounts:counts,anyFourMatches:any,conditionalPlusOneP:(any+1)/100001,directIoCs:out,positivePlaintextPlantRecovered:plant.length,unknownPlaintextRecovered:false},null,2));
