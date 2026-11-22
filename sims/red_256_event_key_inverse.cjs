"use strict";
/**
 * Source-exact LP2 red-rune/13-dot 256-event key experiment.
 *
 * Run from the repository root:
 *   node sims/red_256_event_key_inverse.cjs
 *
 * Node.js 22, CommonJS, source files read only, no side effects.
 * The 256-event relationship is a hypothesis, not an authenticated key.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json").byte_rows;
const reference = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const mod = (a, n) => (a % n + n) % n;

/**
 * @typedef {{page:number, offset:number, kind:number, value:number,
 *   inkColor:string}} Event
 * kind=1 is a red rune; kind=0 is any 13-dot stencil, including black.
 * A stencil at offset k is placed before rune k, after rune k-1.
 * @returns {Event[]}
 */
function events() {
  /** @type {Event[]} */
  const out = [];
  for (const record of ink.pages) {
    const pg = corpus.pages[record.page];
    assert.equal(record.rune_count, pg.indices.length);
    for (const span of record.red_spans || []) {
      assert.equal([...span.runes].length, span.length);
      for (let i = 0; i < span.length; i++) {
        const value = pg.indices[span.start + i];
        assert.equal(corpus.runes[value], [...span.runes][i]);
        out.push({page:record.page, offset:span.start + i,
          kind:1, value, inkColor:"red"});
      }
    }
    for (const mark of record.large_punctuation || []) {
      if (mark[1] === 13) out.push({page:record.page, offset:mark[0],
        kind:0, value:29, inkColor:mark[2]});
    }
  }
  out.sort((a,b) => a.page - b.page || a.offset - b.offset ||
    a.kind - b.kind);
  assert.equal(out.length,256);
  assert.equal(out.filter(e => e.kind === 1).length,225);
  assert.equal(out.filter(e => e.kind === 0).length,31);
  assert.equal(out.filter(e => e.kind === 0 && e.inkColor === "black").length,1);
  return out;
}

/** @param {Event[]} stream */
function keyTables(stream) {
  const values = {
    literal:stream.map(e => e.value),
    prime:stream.map(e => e.kind ? corpus.prime[e.value] % 29 : 13),
    mark:stream.map(e => Number(e.kind === 0)),
    primeParity:stream.map(e => e.kind ? corpus.prime[e.value] % 2 : 1)
  };
  const out = new Map();
  for (const [label, bytes] of Object.entries(values)) {
    out.set(label + "/chronological",bytes);
    // Interpret the 256 events as an 8-by-32 row-major array, then
    // read one of its eight 32-entry columns at a time.
    out.set(label + "/gridTranspose",Array.from({length:256},(_,i) =>
      bytes[(i % 32)*8 + Math.floor(i / 32)]));
  }
  // Each of the 31 13-dot stencils separates two red-rune runs.
  // Including leading/trailing and empty intervals yields 32 base-60 digits.
  const lengths=[];
  let count=0;
  for(const symbol of stream) {
    if(symbol.kind===1) count++;
    else {lengths.push(count);count=0;}
  }
  lengths.push(count);
  assert.equal(lengths.length,32);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  assert.equal(Math.max(...lengths),59);
  out.set("redRun32/forward",lengths);
  out.set("redRun32/reverse",lengths.slice().reverse());
  return out;
}

const pageno = [];
const ciphertext = [];
for (const p of corpus.pages) {
  if (p.page >= 56) continue;
  for (const v of p.indices) {
    ciphertext.push(v);
    pageno.push(p.page);
  }
}
assert.equal(ciphertext.length,12956);
assert.equal(pageno.filter(v => v === 50).length,0);

const pow = [];
const log = new Array(29).fill(-1);
for (let i = 0, value = 1; i < 28; i++, value = value*15 % 29) {
  pow.push(value);
  assert.equal(log[value],-1);
  log[value] = i;
}
assert.deepEqual(pow.slice().sort((a,b)=>a-b),
  Array.from({length:28},(_,i)=>i+1));

/**
 * Strictly bijective encrypt/decrypt for two fixed candidate families:
 * - GP29 additive output shift;
 * - GP28 discrete-log ciphertext differences, EA transparent as zero step.
 * The former transforms page heads; the latter publishes them verbatim.
 *
 * @param {number[]} input
 * @param {number[]} key
 * @param {{family:string,sign:number,reset:string}} mode
 * @param {boolean} encode
 * @returns {number[]}
 */
function transform(input,key,mode,encode) {
  assert.equal(input.length,pageno.length);
  const result = [];
  let previous=-1, previousPage=-1, clock=0;
  for(let i=0;i<input.length;i++) {
    const page=pageno[i];
    if(page!==previousPage) {
      previous=-1;
      if(mode.reset==="page") clock=0;
    }
    const k=key[clock++ % key.length];
    const v=input[i];
    let x;
    if(mode.family==="add") {
      x=mod(v+(encode?-1:1)*mode.sign*(k%29),29);
    } else if(previous<0) {
      x=v;
    } else if(encode) {
      x=v===28?previous:mod(previous+
        pow[mod(v-mode.sign*(k%28),28)],29);
    } else {
      x=v===previous?28:mod(log[mod(v-previous,29)]+
        mode.sign*(k%28),28);
      assert.ok(x>=0);
    }
    result.push(x);
    if(mode.family==="ea") previous=encode?x:v;
    previousPage=page;
  }
  return result;
}

/** @param {number[]} input */
function ioc(input) {
  const counts=new Array(29).fill(0);
  for(const v of input)counts[v]++;
  return counts.reduce((sum,c)=>sum+c*(c-1),0)/
    (input.length*(input.length-1));
}

/** Greedy GP transliteration of solved native Cicada text for a control. */
function solvedControl() {
  const tokens=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const lines=reference.split(/\r?\n/).filter(line=>!line.startsWith("#"));
  const result=[];
  for(let word of (lines.join(" ").toUpperCase().match(/[A-Z]+/g)||[])) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const values=[];
    for(let j=0;j<word.length;) {
      const t=tokens.find(t=>word.startsWith(t.s,j));
      if(!t){values.length=0;break;}
      values.push(t.i);
      j+=t.s.length;
    }
    result.push(...values);
  }
  assert.ok(result.length>=3000);
  // Repeated source symbols preserve native one-point statistics. Repetition
  // itself is a test fixture only, not a model of a book's natural language.
  return Array.from({length:ciphertext.length},(_,i)=>result[i%result.length]);
}

function run() {
  const stream=events(), tables=keyTables(stream);
  const native=solvedControl(), rows=[];
  let allPlantRecovered=0, allOriginalReplay=0;
  for(const [label,key] of tables) {
    for(const family of ["add","ea"])
      for(const sign of [-1,1])
        for(const reset of ["book","page"]) {
          const mode={family,sign,reset};
          const decoded=transform(ciphertext,key,mode,false);
          const replay=transform(decoded,key,mode,true);
          assert.deepEqual(replay,ciphertext);
          allOriginalReplay+=replay.length;
          const plant=transform(native,key,mode,true);
          const recovered=transform(plant,key,mode,false);
          assert.deepEqual(recovered,native);
          allPlantRecovered+=recovered.length;
          rows.push({key:label,...mode,IoC:ioc(decoded),
            E:decoded.filter(x=>x===18).length});
        }
  }
  rows.sort((a,b)=>b.IoC-a.IoC);
  const originalKey=stream.map(e=>e.value);
  const gridByte=grid.flat();
  assert.equal(gridByte.length,256);
  const strict=originalKey.reduce((n,v,i)=>n+Number(gridByte[i]===v),0);
  const low5=originalKey.reduce((n,v,i)=>n+Number((gridByte[i]&31)===v),0);
  return {status:"conditional candidate, not LP2 decryption",
    sourceCounts:{red:225,thirteenDot:31,blackThirteenDot:1,total:256},
    sourceSha256:crypto.createHash("sha256")
      .update(Buffer.from(originalKey)).digest("hex"),
    gridBytes:gridByte.length,
    stencilRunLengths:tables.get("redRun32/forward"),
    stencilRunBase60:tables.get("redRun32/forward")
      .map(v=>"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"[v]).join(""),
    exactFixedClockGridMatches:{directByte:strict,lowFiveBits:low5},
    originalRunes:ciphertext.length,
    variants:rows.length,
    sourceNativeControlIoC:ioc(native),
    originalIoC:ioc(ciphertext),
    allPlantRecovered,allOriginalReplay,
    strongest:rows.slice(0,8),
    last:rows.slice(-2)};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={events,keyTables,transform,ioc,run};
