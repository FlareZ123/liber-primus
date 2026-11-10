"use strict";
/**
 * May 2 2014 Cicada source-whitespace GP29 direct-key gate.
 * Run with Node 20+ in repo root: node sims/may2_historical_source_gate.cjs
 * A finite original-LP2 exclusion, not a recovered key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
/** @param {string} envelope */
function extract(envelope) {
  const lines = envelope.split(/\r?\n/);
  const start = lines.indexOf("") + 1;
  const end = lines.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(start > 2 && end > start);
  const events = [];
  for (let i = start; i < end; i++) {
    const line = lines[i];
    const lead = (line.match(/^ +/) || [""])[0].length;
    const tail = (line.match(/ +$/) || [""])[0].length;
    if (lead && line.trim()) events.push({ line: i + 1, side: "leading", count: lead, coveredBySignature: true });
    if (tail) events.push({ line: i + 1, side: "trailing", count: tail, coveredBySignature: false });
  }
  assert.deepEqual(events.map(e => e.count), [2,3,5,7,11,13,17,23,29,31,37]);
  assert.equal(events.filter(e => e.coveredBySignature).length, 1);
  return events;
}
/** @param {string} input @param {{translit:string[]}} corpus */
function gp(input, corpus) {
  const dict = new Map(corpus.translit.map((t,i) => [t,i]));
  dict.set("ING",21);
  const output = [];
  for (const token of input.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = token.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const len of [3,2,1]) {
        const symbol = word.slice(i,i+len);
        if (dict.has(symbol)) {
          output.push(dict.get(symbol)); i += len; found = true; break;
        }
      }
      assert.ok(found, "untransliterable GP token");
    }
  }
  return output;
}
/** @param {number[]} training */
function train(training) {
  const N=29, u=new Float64Array(N), b=new Float64Array(N*N), t=new Float64Array(N*N*N);
  for(let i=0;i<training.length;i++) {
    const v=training[i]; u[v]++;
    if(i) b[training[i-1]*N+v]++;
    if(i>1) t[(training[i-2]*N+training[i-1])*N+v]++;
  }
  const lu=Array.from(u,v=>Math.log((v+1)/(training.length+N)));
  const lb=Array.from(b,(v,j)=>Math.log((v+12*Math.exp(lu[j%N]))/(u[Math.floor(j/N)]+12)));
  const lt=Array.from(t,(v,j)=>Math.log((v+9*Math.exp(lb[j%(N*N)]))/(b[Math.floor(j/N)]+9)));
  /** @param {number[]} text */
  return text=>{
    let sum=lu[text[0]]+lb[text[0]*N+text[1]];
    for(let i=2;i<text.length;i++) sum+=lt[(text[i-2]*N+text[i-1])*N+text[i]];
    return sum/text.length;
  };
}
/** @param {number[]} cipher @param {number[]} key @param {(input:number[])=>number} score */
function exhaustive(cipher,key,score) {
  const fs=cipher.flatMap((v,i)=>v===0?[i]:[]);
  assert.equal(fs.length,14);
  let top={mask:-1,score:-Infinity,plain:[]};
  for(let mask=0;mask<(1<<fs.length);mask++) {
    const literal=new Uint8Array(cipher.length);
    for(let j=0;j<fs.length;j++) if((mask>>>j)&1) literal[fs[j]]=1;
    let step=0;
    const plain=cipher.map((v,i)=>literal[i]?0:(v-key[(step++)%key.length]+29)%29);
    const z=score(plain);
    if(z>top.score) top={mask,score:z,plain};
  }
  return top;
}
function run() {
  const events=extract(read("resources/cicada2014-may2-signed-message.asc"));
  const primes=events.map(e=>e.count);
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const cipher=corpus.pages.find(p=>p.page===0).indices;
  assert.equal(cipher.length,262);
  const control=gp(read("resources/control/gibran_prophet_58585.txt"),corpus);
  assert.equal(control.length,62696);
  const score=train(control);
  const windows=[];
  for(let i=0;i+cipher.length<=control.length;i++) windows.push(score(control.slice(i,i+cipher.length)));
  windows.sort((a,b)=>a-b);
  assert.equal(windows.length,62435);
  const sourceKeys={
    phi:primes.map(v=>(v-1)%29),
    gpOrdinal:primes.map(v=>corpus.prime.indexOf(v)),
    primeResidue:primes.map(v=>v%29),
    alternativeFirst11Primes:[2,3,5,7,11,13,17,19,23,29,31].map(v=>(v-1)%29)
  };
  assert.ok(sourceKeys.gpOrdinal.every(v=>v>=0));
  const trials={};
  for(const [name,key] of Object.entries(sourceKeys)) {
    const out=exhaustive(cipher,key,score);
    assert.ok(out.score<windows[0],name+" must fail the independently specified original-source language gate");
    trials[name]={key,bestMask:out.mask,score:out.score,windowsAtMostThisScore:windows.filter(v=>v<=out.score).length,preview:out.plain.slice(0,70).map(v=>corpus.translit[v]).join("")};
  }
  assert.equal(trials.phi.bestMask,13416);
  assert.equal(trials.gpOrdinal.bestMask,1728);
  assert.equal(trials.primeResidue.bestMask,14542);
  assert.equal(trials.alternativeFirst11Primes.bestMask,4416);
  return {outcome:"No recovered LP2 plaintext or authentic key",sourceEvents:events,originalPage:0,runicCount:262,allVisibleFMasksPerKey:16384,reference:{title:"Gibran The Prophet",runes:control.length,windows:windows.length,min:windows[0],median:windows[Math.floor(windows.length/2)],max:windows[windows.length-1]},cipherScore:score(cipher),trials};
}
if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={run,extract,gp,train,exhaustive};
