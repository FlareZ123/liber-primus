'use strict';

/**
 * Key-independent exact GP29 equality gate for a phi(29)=28 phase-key
 * repeated across the original art-selected LP2 moth 256-event register.
 *
 * Positive: arbitrary 28-position additive secret reused at every phase
 * preserves equal-rune pairs EXACTLY. Controls: authentic English GP-native
 * windows of the original 128+126 rune/2 physical punctuation shape.
 *
 * Node.js 22 CommonJS SFT; read-only; no external packages or guessed keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p53=corpus.pages.find(p=>p.page===53).indices;
const p55=corpus.pages.find(p=>p.page===55).indices;
assert.deepEqual([p53.length,p55.length],[179,76]);
assert.equal(p55[0],21);
const events=[...p53.slice(0,128),...p53.slice(128),null,
  ...p55.slice(1),null];
assert.equal(events.length,256);
assert.equal(events.filter(v=>v!==null).length,254);
assert.deepEqual(events.flatMap((v,i)=>v===null?[i]:[]),[179,255]);

const pairs={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const letters={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,
  J:11,L:20,M:19,N:9,O:3,P:13,R:4,S:15,T:16,U:1,W:7,X:14,Y:26};
const aliases={K:'C',Q:'C',V:'U',Z:'S'};
function toGP(text) {
  const source=text.toUpperCase().replace(/[^A-Z]/g,'')
    .replace(/[KQVZ]/g,x=>aliases[x]);
  const out=[];
  for(let i=0;i<source.length;) {
    const digraph=pairs[source.slice(i,i+2)];
    if(digraph!==undefined){out.push(digraph);i+=2;}
    else{
      assert.ok(letters[source[i]]!==undefined);
      out.push(letters[source[i++]]);
    }
  }
  return out;
}
/** @param {(number|null)[]} seq @returns {{collisions:number,eligible:number}} */
function matchedPhase28(seq) {
  const frequencies=Array.from({length:28},()=>Array(29).fill(0));
  for(let i=0;i<seq.length;i++)if(seq[i]!==null){
    assert.ok(seq[i]>=0&&seq[i]<29);
    frequencies[i%28][seq[i]]++;
  }
  let collisions=0,eligible=0;
  for(const counts of frequencies) {
    const n=counts.reduce((a,b)=>a+b,0);
    eligible+=n*(n-1)/2;
    for(const k of counts)collisions+=k*(k-1)/2;
  }
  return {collisions,eligible};
}
const original=matchedPhase28(events);
assert.deepEqual(original,{collisions:39,eligible:1027});
const transparent=matchedPhase28(events.filter(v=>v!==null));
assert.deepEqual(transparent,{collisions:34,eligible:1026});

/** Positive: a completely arbitrary periodic28 additive key. */
const mod=n=>(n%29+29)%29;
const shakespeare=toGP(read('resources/control/shakespeare_first300k.txt'));
const planted=[...shakespeare.slice(10000,10128),
  ...shakespeare.slice(30000,30051),null,
  ...shakespeare.slice(30051,30126),null];
assert.equal(planted.length,256);
let secret=0x20142928;
const next=()=>{
  secret^=secret<<13;
  secret^=secret>>>17;
  secret^=secret<<5;
  return secret>>>0;
};
const phaseKey=Array.from({length:28},()=>next()%29);
const cipher=planted.map((v,i)=>v===null?null:mod(v+phaseKey[i%28]));
assert.deepEqual(matchedPhase28(cipher),matchedPhase28(planted));
const recovered=cipher.map((v,i)=>v===null?null:mod(v-phaseKey[i%28]));
assert.deepEqual(recovered,planted);

// Original punctuation is not a GP29 rune. The first source clock
// consumes its positions; the second ignores them, two natural readings.
const controls=[];
const paths=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
secret=0x29e0128;
for(const source of paths) {
  const gp=source.includes('shakespeare_')?shakespeare:toGP(read(source));
  const full=[],skip=[];
  for(let trial=0;trial<5000;trial++) {
    const start1=next()%(gp.length-128);
    const start2=next()%(gp.length-126);
    const native=[...gp.slice(start1,start1+128),
      ...gp.slice(start2,start2+51),null,
      ...gp.slice(start2+51,start2+126),null];
    full.push(matchedPhase28(native).collisions);
    skip.push(matchedPhase28(native.filter(v=>v!==null)).collisions);
  }
  full.sort((a,b)=>a-b);
  skip.sort((a,b)=>a-b);
  controls.push({reference:source,models:5000,
    with_markers:{
      original:original.collisions,minimum:full[0],
      median:full[2500],at_or_below:full.filter(v=>
        v<=original.collisions).length
    },
    nonconsuming_markers:{
      original:transparent.collisions,minimum:skip[0],
      median:skip[2500],at_or_below:skip.filter(v=>
        v<=transparent.collisions).length
    }});
}
assert.ok(controls.every(c=>c.with_markers.median>=55));
assert.ok(controls.every(c=>c.with_markers.at_or_below<80));
assert.ok(controls.every(c=>c.nonconsuming_markers.at_or_below<80));
console.log(JSON.stringify({
  authored_selector:'LP1 same moth: Euler totient; phi(29)=28; original red ink p53 at128',
  original:{with_markers:original,nonconsuming_markers:transparent},
  native_secret_period28_exact_positive:true,
  independent_native_controls:controls,
  decision:'A shared deterministic phase28 key across these 256 source events is strongly incompatible with native GP29 English under both punctuation clocks; no unknown plaintext recovered.'
},null,2));
