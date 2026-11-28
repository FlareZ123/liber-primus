#!/usr/bin/env node
"use strict";
/*
 * A source-typed, KEY-INDEPENDENT necessary-condition gate for a new
 * reversible GP29 predecessor-PLAINTEXT Atbash marker architecture.
 *
 * No phase/marker/key/word fitting:
 *      C_0=P_0
 *      C_i=C_(i-1)+k_i*(P_i-(28-P_(i-1))) mod29, k_i in GP29*
 * and its inverse force
 *      C_i=C_(i-1) <=> P_i+P_(i-1)=28.
 *
 * The established GP29 Atbash reverses the 29-rune alphabet (x -> 28-x).
 * The GP29 symbolwise nonzero k_i may be secret, changing and arbitrary;
 * it cannot change this exact pair-event invariant. k_i=1 below supplies
 * a single fully invertible demonstrator, NOT an authenticated LP2 key.
 *
 * Comparison: original 12,901 within-physical-page rune edges versus
 * all available full-length windows of the original 2019 Project Gutenberg
 * Gibran book, with the EXACT same 54 physical-page cut offsets omitted.
 * The independent solved LP1 source provides another shorter calibration.
 *
 * Usage: node sims/lp2_atbash_previous_plaintext_marker_gate_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page>=0&&p.page<=55);
assert.equal(pages.length,56);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const starts=[];let ptr=0;
for(const p of pages){if(ptr>0&&!starts.includes(ptr))starts.push(ptr);ptr+=p.indices.length;}
assert.equal(ptr,original.length);
assert.equal(starts.length,54);
const boundaries=new Set(starts);
const marker=(prev)=>(28-prev);
const mod=x=>((x%29)+29)%29;
function encrypt(plain){
  if(!plain.length)return [];
  const cipher=[plain[0]];
  for(let i=1;i<plain.length;i++)
    cipher.push(mod(cipher[i-1]+mod(plain[i]-marker(plain[i-1]))));
  return cipher;
}
function decrypt(cipher){
  if(!cipher.length)return [];
  const plain=[cipher[0]];
  for(let i=1;i<cipher.length;i++)
    plain.push(mod(mod(cipher[i]-cipher[i-1])+marker(plain[i-1])));
  return plain;
}
function countRepeatedCipher(input){
  let n=0;
  for(let i=1;i<input.length;i++)if(!boundaries.has(i)&&input[i]===input[i-1])n++;
  return n;
}
function countAtbashPlain(input){
  let n=0;
  for(let i=1;i<input.length;i++)if(!boundaries.has(i)&&input[i]+input[i-1]===28)n++;
  return n;
}
const originalEvents=countRepeatedCipher(original);
assert.equal(originalEvents,86);
const inverse=decrypt(original);
assert.deepEqual(encrypt(inverse),original);
assert.equal(countAtbashPlain(inverse),originalEvents);
const counts=Array(29).fill(0);
for(const i of inverse)counts[i]++;
const invIoC=counts.reduce((n,x)=>n+x*(x-1),0)/(inverse.length*(inverse.length-1));
assert.ok(invIoC>0.034&&invIoC<0.035);

// Source-native GP29 orthography. It handles actual digraphs TH,NG,EO,
// OE,AE,IA,EA, plus historical ING->NG and IO->IA from the solved corpus.
const glyphs=new Map(corpus.translit.map((t,i)=>[t,i]));
for(const [from,to] of [["ING","NG"],["IO","IA"],["K","C"],["Z","S"],["V","U"]])
  glyphs.set(from,glyphs.get(to));
const digraphs=["ING","TH","NG","EO","OE","AE","IA","EA","IO"];
function encodeWord(raw){
  const s=raw.toUpperCase().replace(/QU/g,"KW");
  const nums=[];
  for(let j=0;j<s.length;){
    const tok=digraphs.find(g=>s.startsWith(g,j))||s[j];
    if(!glyphs.has(tok))return null;
    nums.push(glyphs.get(tok));j+=tok.length;
  }
  return nums;
}
const solved=read("resources/liber-primus/lp1-plaintext-reference.txt");
const sections=solved.split(/###\s+(\d+)\s*\n/);
const allowed=new Set([1,3,5,6,9,10,11,12,13,14,15]);
const sourcePlain=[];
for(let i=1;i+1<sections.length;i+=2){
  if(!allowed.has(+sections[i]))continue;
  const raw=sections[i+1].split(/\r?\n/)
    .filter(line=>line.length&&!line.startsWith("[")&&!line.startsWith("#")
      &&!/^\d/.test(line)).join(" ");
  for(const word of raw.match(/[A-Za-z]+/g)||[]){
    const a=encodeWord(word);if(a)sourcePlain.push(...a);
  }
}
assert.equal(sourcePlain.length,2648);
let solvedPairs=0;
for(let i=1;i<sourcePlain.length;i++)
  if(sourcePlain[i]+sourcePlain[i-1]===28)solvedPairs++;
assert.equal(solvedPairs,82);

const donor=read("resources/control/gibran_prophet_58585.txt");
const first=/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*/i.exec(donor);
const last=/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*/i.exec(donor);
assert.ok(first&&last&&last.index>first.index);
const excerpt=donor.slice(first.index+first[0].length,last.index);
const english=[];
for(const word of excerpt.match(/[A-Za-z]+/g)||[]){
  const a=encodeWord(word);if(a)english.push(...a);
}
assert.equal(english.length,47629);
const event=Array(english.length).fill(0),prefix=[0];
for(let i=1;i<english.length;i++)
  event[i]=Number(english[i]+english[i-1]===28);
for(const x of event)prefix.push(prefix.at(-1)+x);
let min=Infinity,max=0,total=0,windows=0,atMin=[];
for(let s=0;s+original.length<=english.length;s++){
  let n=prefix[s+original.length]-prefix[s+1];
  for(const b of starts)n-=event[s+b];
  total+=n;windows++;
  if(n<min){min=n;atMin=[s];}
  else if(n===min)atMin.push(s);
  if(n>max)max=n;
}
assert.equal(windows,34674);
assert.equal(min,285);
assert.equal(max,359);
assert.ok(originalEvents<min);
// A genuine native-GP plant must roundtrip and generate precisely the same
// publicly predictable equality events, regardless of its other symbols.
const sourcePlant=english.slice(0,original.length);
const plantedCipher=encrypt(sourcePlant);
assert.deepEqual(decrypt(plantedCipher),sourcePlant);
assert.equal(countRepeatedCipher(plantedCipher),countAtbashPlain(sourcePlant));

console.log(JSON.stringify({
  model:"nonzero-key GP29 Atbash(previous plaintext) zero-step marker",
  algebra:"C_i=C_(i-1) iff P_i+P_(i-1)=28 mod29 for i>=1",
  original:{
    runes:original.length,within_page_edges:original.length-1-starts.length,
    observed_zero_steps:originalEvents,demonstrator_inverse_ioc:invIoC,
    forward_recovery_runes:original.length
  },
  solved_control:{runes:sourcePlain.length,Atbash_pairs:solvedPairs},
  gibran_control:{runes:english.length,window_length:original.length,
    excluded_page_seams:starts.length,windows,min,mean:total/windows,max,
    min_window_starts:atMin},
  decision:"reject direct word/page-preserving Atbash-predecessor marker over these exact native-GP registers; no unknown plaintext"
},null,2));
