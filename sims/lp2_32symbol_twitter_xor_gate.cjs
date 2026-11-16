#!/usr/bin/env node
"use strict";

// Test 29 GP runes + two text punctuation types + word separator as a 32-symbol stream.
// The relikd transcription and common-word list are fetched at runtime, not mirrored.

const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const PAGE_FILES = ["p0-2","p3-7","p8-14","p15-22","p23-26","p27-32","p33-39","p40-53","p54-55"];
const PAGE_BASE = "https://raw.githubusercontent.com/relikd/LiberPrayground/main/pages/";
const WORDLIST_URL = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/20k.txt";
const TWITTER_PATH = path.join(ROOT, "resources", "cicada2013-twitter-hex-stream.txt");
const RUNES = Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ");
const TRANSLIT = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const SPECIALS = ["⁘","⁜","•"];
const OFFSETS = [0,13,32,65,133,315,331,347,416,662];
const BYTE_OFFSETS = [0,32,133,315,331,347,662];
const ORIENTATIONS = [
  {name:"symbol-MSB/byte-MSB", bits:[4,3,2,1,0], order:"msb"},
  {name:"symbol-LSB/byte-MSB", bits:[0,1,2,3,4], order:"msb"},
  {name:"symbol-MSB/byte-LSB", bits:[4,3,2,1,0], order:"lsb"},
  {name:"symbol-LSB/byte-LSB", bits:[0,1,2,3,4], order:"lsb"}
];
const assert = (x, msg) => { if (!x) throw new Error(msg); };
async function getText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status + " fetching " + url);
  return r.text();
}
function perms(a) {
  if (a.length < 2) return [a.slice()];
  return a.flatMap((x,i) => perms(a.filter((_,j) => j !== i)).map(p => [x,...p]));
}
function readTwitter(text) {
  const chunks = [];
  let length = 0;
  for (const line of text.trim().split(/\r?\n/)) {
    const m = line.match(/^([0-9a-f]+):\s*([0-9a-f]+)$/i);
    if (!m) continue;
    const offset = parseInt(m[1],16), hex = m[2];
    assert(hex.length % 2 === 0, "odd hex record");
    chunks.push({offset,hex});
    length = Math.max(length, offset + hex.length/2);
  }
  const key = new Uint8Array(length), seen = new Uint8Array(length);
  let count = 0;
  for (const c of chunks) for (let i=0;i<c.hex.length/2;i++) {
    const at = c.offset+i;
    assert(at < length && !seen[at], "Twitter overlap/range");
    key[at] = parseInt(c.hex.slice(2*i,2*i+2),16);
    seen[at] = 1;
    count++;
  }
  assert(count === length && seen.every(Boolean), "Twitter gaps");
  return {key,records:chunks.length};
}
function pack5(values,bits,order) {
  const out = new Uint8Array(Math.ceil(values.length*5/8));
  let pos = 0;
  for (const v of values) for (const b of bits) {
    const bit = (v >> b) & 1;
    out[pos >> 3] |= bit << (order === "msb" ? 7-(pos&7) : (pos&7));
    pos++;
  }
  return out;
}
function unpack5(bytes,n,bits,order) {
  const out = new Array(n);
  for (let s=0;s<n;s++) {
    let v=0;
    for (let k=0;k<5;k++) {
      const p=s*5+k;
      const bit=(bytes[p>>3] >> (order === "msb" ? 7-(p&7) : (p&7))) & 1;
      v |= bit << bits[k];
    }
    out[s]=v;
  }
  return out;
}
function score(decoded,base,mapping,dict) {
  const freq=Array(32).fill(0);
  for (const x of decoded) freq[x]++;
  const words=[];
  let current="", letters=0;
  for (const x of decoded) {
    if (x>=base && x<base+29) {
      const t=TRANSLIT[x-base];
      current+=t; letters+=t.length;
    } else if (current) { words.push(current.toLowerCase()); current=""; }
  }
  if (current) words.push(current.toLowerCase());
  let hits=0,hits3=0,hits4=0,hitLetters=0;
  for (const w of words) if (dict.has(w)) {
    hits++; hitLetters+=w.length;
    if (w.length>=3) hits3++;
    if (w.length>=4) hits4++;
  }
  return {
    hits,hits3,hits4,hitLetters,letters,coverage:hitLetters/Math.max(1,letters),
    wordCount:words.length,decodedSpaceCount:freq[mapping["•"]],
    specialCounts:Object.fromEntries(SPECIALS.map(s=>[s,freq[mapping[s]]])),
    firstWords:words.slice(0,35)
  };
}
function inspectBytes(bytes) {
  let printable=0,run=0,longest=0;
  for (const b of bytes) {
    const ok=(b>=32&&b<=126)||b===9||b===10||b===13;
    if(ok)printable++;
    run=ok?run+1:0;
    if(run>longest)longest=run;
  }
  const hex=Array.from(bytes.slice(0,32),x=>x.toString(16).padStart(2,"0")).join("");
  const signatures=[["JPEG","ffd8ff"],["PNG","89504e470d0a1a0a"],["ZIP","504b0304"],["GZIP","1f8b08"],["PDF","25504446"],["GIF","47494638"],["RIFF","52494646"],["MP3","494433"],["ELF","7f454c46"]];
  return {printableRate:printable/bytes.length,longestPrintableRun:longest,first32Hex:hex,magic:signatures.filter(x=>hex.startsWith(x[1])).map(x=>x[0])};
}
async function main() {
  const texts=await Promise.all(PAGE_FILES.map(n=>getText(PAGE_BASE+n+".txt")));
  const runeMap=new Map(RUNES.map((r,i)=>[r,i]));
  const tokens=[], runeValues=[];
  const counts={"⁘":0,"⁜":0,"•":0,"⁚":0};
  for (const ch of texts.join("\n")) {
    if (runeMap.has(ch)) {
      const v=runeMap.get(ch);
      tokens.push({kind:"rune",value:v}); runeValues.push(v);
    } else if (SPECIALS.includes(ch)) {
      counts[ch]++; tokens.push({kind:"special",symbol:ch});
    } else if (ch==="⁚") counts["⁚"]++;
  }
  assert(runeValues.length===12956,"rune count "+runeValues.length);
  assert(counts["⁘"]===145&&counts["⁜"]===31&&counts["•"]===2731&&counts["⁚"]===4,"symbol census "+JSON.stringify(counts));
  assert(tokens.length===15863,"token count "+tokens.length);
  const twitter=readTwitter(fs.readFileSync(TWITTER_PATH,"utf8"));
  const dict=new Set((await getText(WORDLIST_URL)).trim().split(/\r?\n/).map(x=>x.toLowerCase()));
  const results=[];
  for (const convention of [{name:"0-based",base:0,codes:[29,30,31]},{name:"1-based",base:1,codes:[0,30,31]}]) {
    for (const assignment of perms(SPECIALS)) {
      const mapping={};
      assignment.forEach((s,i)=>mapping[s]=convention.codes[i]);
      const values=tokens.map(t=>t.kind==="rune"?t.value+convention.base:mapping[t.symbol]);
      for (const offset of OFFSETS) for (const o of ORIENTATIONS) {
        const packed=pack5(values,o.bits,o.order);
        assert(offset+packed.length<=twitter.key.length,"key window overrun");
        const xored=new Uint8Array(packed.length);
        for(let i=0;i<packed.length;i++)xored[i]=packed[i]^twitter.key[offset+i];
        const decoded=unpack5(xored,values.length,o.bits,o.order);
        results.push({convention:convention.name,offset,orientation:o.name,assignment:assignment.join("/"),...score(decoded,convention.base,mapping,dict)});
      }
    }
  }
  results.sort((a,b)=>b.coverage-a.coverage||b.hits3-a.hits3||b.hits4-a.hits4);
  const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const byteXor=[];
  for(const offset of BYTE_OFFSETS) for(const [representation,values] of [["ordinal",runeValues],["GP-prime",runeValues.map(x=>primes[x])]]) {
    const out=new Uint8Array(values.length);
    for(let i=0;i<values.length;i++)out[i]=values[i]^twitter.key[offset+i];
    byteXor.push({offset,representation,...inspectBytes(out)});
  }
  console.log(JSON.stringify({
    source:{runes:runeValues.length,sep1:counts["⁘"],sep2:counts["⁜"],wordSeparators:counts["•"],excludedGridDots:counts["⁚"],symbols:tokens.length},
    twitter:{records:twitter.records,bytes:twitter.key.length},
    packedBytes:Math.ceil(tokens.length*5/8),wordlistSize:dict.size,tested5Bit:results.length,
    best5Bit:results.slice(0,12),oneByteXor:byteXor
  },null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
