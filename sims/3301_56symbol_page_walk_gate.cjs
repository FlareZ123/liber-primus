#!/usr/bin/env node
"use strict";

// Bounded test of the conditional 56-symbol stream derived from the
// 2013 5x5/3301 square. Map each GP rune to its canonical prime weight,
// reduce each step mod56, and cumulatively walk LP2 pages from page 0.
const sequence = "OIUWHUCRDUOHUGONTOTHOUOGIDTHIWATHIIDUOGTHOTOONUGUOHRDUCUWHOI";
const translit = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const tokens = [...translit].sort((a,b) => b.length-a.length);
const parsed = [];
for (let pos=0; pos<sequence.length;) {
  const token = tokens.find(t => sequence.startsWith(t,pos));
  if (!token) throw new Error(`unparsed sequence at ${pos}`);
  parsed.push(token);
  pos += token.length;
}
if (parsed.length !== 56) throw new Error(`expected 56 tokens, got ${parsed.length}`);
const indices = parsed.map(t => translit.indexOf(t));
const steps = indices.map(i => primes[i] % 56);
let page = 0;
const route = [page];
for (const step of steps) { page = (page + step) % 56; route.push(page); }
const first56 = route.slice(0,56);
const unique = [...new Set(first56)];
const missing = Array.from({length:56},(_,i)=>i).filter(i=>!unique.includes(i));
console.log(JSON.stringify({parsed,indices,steps,route:first56,uniquePages:unique.length,missing},null,2));
