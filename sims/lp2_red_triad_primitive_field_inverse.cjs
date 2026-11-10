'use strict';

/**
 * LP2 original-cipher field gate from the only two three-rune red spans.
 *
 * Page 3: 13 + 23u + 2u^2 = 2(u^2 - 3u + 21) mod 29.
 * Its root is primitive in GF(29^2), of exact order 840, and has
 * Trace(u)=3, Norm(u)=21. Page 15 independently selects 79 mod 29 = 21.
 *
 * Every nonzero initial GF(29^2) state and every nonzero GF29-linear
 * output functional generates a cyclic shift of Trace(u^n). Therefore
 * all 840 source-fixed phases exhaust this all-secret-state family.
 *
 * Page 39: 27 + 5u + 15u^2 = 15(u-24)^2. Original numeric-grid
 * polynomial division by (X-24)^2 leaves 254 GF29 coefficients.
 *
 * Run from the repository root with Node 22:
 *   node sims/lp2_red_triad_primitive_field_inverse.cjs
 *
 * No secret key, LP2 plaintext or historical cipher is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = 29;
const FIELD_ORDER = 840;
const RUNES = 12956;

/** @param {string} name */
function resource(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
/** @param {string} name */
function json(name) {
  return JSON.parse(resource(name));
}
/** @param {number} x */
function mod(x) {
  return (x % P + P) % P;
}
/**
 * GF(29^2) representation [a,b] = a + bu, where u^2=3u+8.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number[]}
 */
function multiply(x, y) {
  const [a,b] = x, [c,d] = y;
  return [mod(a*c + 8*b*d), mod(a*d + b*c + 3*b*d)];
}
/** @param {number[]} z @param {number} n */
function power(z, n) {
  let acc = [1,0];
  while (n > 0) {
    if (n % 2) acc = multiply(acc,z);
    z = multiply(z,z);
    n = Math.floor(n / 2);
  }
  return acc;
}
/** @param {number[]} z */
function trace(z) {
  return mod(2*z[0] + 3*z[1]);
}
/** @param {number[]} z */
function norm(z) {
  return mod(z[0]*z[0] + 3*z[0]*z[1] - 8*z[1]*z[1]);
}
/** @param {number[]} x */
function divideByXMinus24(x) {
  const q = [x[0]];
  for (let i=1; i<x.length-1; i++) q.push(mod(x[i] + 24*q[i-1]));
  assert.equal(mod(x[x.length-1] + 24*q[q.length-1]), 0);
  return q;
}
/** @param {number[]} q */
function multiplyByXMinus24(q) {
  const out = [q[0]];
  for (let i=1; i<q.length; i++) out.push(mod(q[i] - 24*q[i-1]));
  out.push(mod(-24*q[q.length-1]));
  return out;
}
/** @param {number[]} arr */
function ioc(arr) {
  assert.ok(arr.length > 1);
  const hist = new Uint32Array(29);
  for (const v of arr) {
    assert.ok(Number.isInteger(v) && v >= 0 && v <= 28);
    hist[v]++;
  }
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(arr.length*(arr.length-1));
}
/**
 * Compute exact source gates once. No candidate selection at this stage.
 */
function source() {
  const corpus = json('resources/liber-primus/lp2-corpus.json');
  const ink = json('resources/liber-primus/lp2-ink-annotations.json');
  const grid = json('resources/liber-primus/base60-grid.json');
  const page = n => corpus.pages.find(p=>p.page===n);
  const span = n => ink.pages.find(p=>p.page===n).red_spans
    .filter(s=>s.length===3);
  const indices = runes => [...runes].map(r=>corpus.runes.indexOf(r));
  assert.deepEqual(span(3).map(s=>indices(s.runes)), [[13,23,2]]);
  assert.deepEqual(span(39).map(s=>indices(s.runes)), [[27,5,15]]);
  const squares = new Set(Array.from({length:29},(_,n)=>n*n%29));
  assert.equal(squares.has(19),false,'page3 polynomial discriminant');
  assert.equal(mod(23*15), 26);
  assert.equal(mod(13*15), 21);
  assert.deepEqual(power([0,1],30),[21,0]);
  assert.deepEqual(power([0,1],420),[28,0]);
  assert.deepEqual(power([0,1],840),[1,0]);
  for (const n of [420,280,168,120]) {
    assert.notDeepEqual(power([0,1],n),[1,0],
      'primitive root must have order 840');
  }
  assert.equal(trace([0,1]),3);
  assert.equal(norm([0,1]),21);
  assert.equal(79%29,norm([0,1]));

  const original = grid.byte_rows.flat().map(n=>mod(n));
  assert.equal(original.length,256);
  const quotient = divideByXMinus24(divideByXMinus24(original));
  assert.equal(quotient.length,254);
  assert.deepEqual(multiplyByXMinus24(
    multiplyByXMinus24(quotient)), original);

  const black = page(53).indices.slice(0,128);
  const terminal = page(53).indices.slice(128).concat(page(55).indices);
  assert.equal(page(53).indices.length,179);
  assert.equal(black.length,128);
  assert.equal(terminal.length,127);
  assert.equal(page(54).indices[0],24);
  assert.equal(page(55).indices.length,76);

  const marks=[];
  for (const p of ink.pages) for (const mark of p.large_punctuation||[])
    if (mark[1]===13) marks.push(mark[2]);
  assert.equal(marks.length,31);
  assert.equal(marks.filter(color=>color==='red').length,30);
  assert.equal(marks.filter(color=>color==='black').length,1);

  const pages = corpus.pages.filter(p=>p.page<=55 && p.indices.length);
  const cipher = pages.flatMap(p=>p.indices);
  assert.equal(pages.length,55);
  assert.equal(cipher.length,RUNES);
  return {original,quotient,black,terminal,cipher,pages};
}
/**
 * The primitive root makes every nonzero element a unique phase.
 * @returns {{pad:number[], logs:Int16Array}}
 */
function primitiveTable() {
  const pad=[],logs = new Int16Array(P*P).fill(-1);
  let element=[1,0];
  for (let i=0; i<FIELD_ORDER; i++) {
    const key=element[0]*P+element[1];
    assert.equal(logs[key],-1);
    logs[key]=i;
    pad.push(trace(element));
    element=multiply(element,[0,1]);
  }
  assert.deepEqual(element,[1,0]);
  logs[0]=FIELD_ORDER; // unique all-29-digit sentinel for zero
  assert.equal(new Set(logs).size, P*P);
  return {pad,logs};
}
/**
 * Test a natural direct 127-pair finite-field logarithm serialization
 * against 127 black runes and 127 terminal red/last-page runes.
 * @param {ReturnType<typeof source>} input
 * @param {Int16Array} logs
 */
function terminalPairGate(input,logs) {
  const {quotient,black,terminal}=input;
  let best={matches:-1},tested=0;
  for (const layout of ['adjacent','halves'])
    for (const order of ['ab','ba'])
      for (const reverse of [false,true])
        for (const gap of ['first','last'])
          for (const blackHigh of [true,false]) {
            const pairs=Array.from({length:127},(_,i)=>layout==='adjacent'
              ?[quotient[2*i],quotient[2*i+1]]
              :[quotient[i],quotient[i+127]]);
            if (order==='ba') pairs.forEach(pair=>pair.reverse());
            if (reverse) pairs.reverse();
            const B=gap==='first'?black.slice(1):black.slice(0,127);
            let matchBlack=0,matchTerminal=0,matchingPairs=0;
            for (let i=0; i<127; i++) {
              const e=logs[pairs[i][0]*P+pairs[i][1]];
              const high=Math.floor(e/P),low=e%P;
              const b=blackHigh?high:low,c=blackHigh?low:high;
              const bMatch=Number(b===B[i]),cMatch=Number(c===terminal[i]);
              matchBlack+=bMatch;
              matchTerminal+=cMatch;
              matchingPairs+=bMatch*cMatch;
            }
            tested++;
            const row={layout,order,reverse,gap,blackHigh,
              matchBlack,matchTerminal,matchingPairs,
              matches:matchBlack+matchTerminal};
            if (row.matches>best.matches) best=row;
          }
  assert.equal(tested,32);
  return {models:tested,best,expectedIndependentMatches:254/29};
}
/**
 * Any hidden nonzero initial field state, and any nonzero linear observation
 * functional over GF29, is equivalent to a phase in 0..839 of this stream.
 * @param {ReturnType<typeof source>} input
 * @param {number[]} pad
 */
function directGP29Gate(input,pad) {
  const {cipher,pages}=input;
  const local=new Uint16Array(cipher.length);
  let pos=0;
  for (const page of pages) for (let i=0;i<page.indices.length;i++)
    local[pos++]=i;
  const out=[];
  for (const reset of ['book','page']) {
    let best={ioc:-1};
    for (let phase=0;phase<FIELD_ORDER;phase++) {
      const hist=new Uint32Array(P);
      for (let i=0;i<cipher.length;i++) {
        const t=(reset==='book'?i:local[i]);
        hist[mod(cipher[i]-pad[(t+phase)%FIELD_ORDER])]++;
      }
      const score=hist.reduce((sum,n)=>sum+n*(n-1),0)/
        (cipher.length*(cipher.length-1));
      if (score>best.ioc) best={phase,ioc:score};
    }
    out.push({reset,models:FIELD_ORDER,best});
  }
  return out;
}
/**
 * Nonzero ciphertext delta uses the 28-step field29 generator 15.
 * An exact repeated ciphertext value becomes GP EA (28); the state clock
 * may consume 0, 1, or 2 trace elements at that marker.
 * @param {ReturnType<typeof source>} input
 * @param {number[]} pad
 */
function deltaGP28Gate(input,pad) {
  const {cipher,pages}=input;
  const beginnings=new Uint8Array(cipher.length);
  let pos=0;
  for (const page of pages) for (let i=0;i<page.indices.length;i++)
    beginnings[pos++]=Number(i===0);
  const logs=new Int8Array(P).fill(-1);
  let r=1;
  for (let i=0;i<28;i++) {
    assert.equal(logs[r],-1);
    logs[r]=i;
    r=r*15%29;
  }
  assert.equal(r,1);
  const delta=new Int8Array(cipher.length);
  let markers=0;
  for (let i=0;i<cipher.length;i++) {
    delta[i]=beginnings[i]?-1:logs[mod(cipher[i]-cipher[i-1])];
    if (i&&!beginnings[i]&&delta[i]===-1) markers++;
  }
  assert.equal(markers,86);
  const output=[];
  for (const reset of ['book','page'])
    for (const markerAdvances of [0,1,2])
      for (const sign of [-1,1]) {
        const clock=new Uint16Array(cipher.length);
        let counter=0;
        for (let i=0;i<cipher.length;i++) {
          if (beginnings[i]&&reset==='page')counter=0;
          clock[i]=counter%FIELD_ORDER;
          counter+=beginnings[i]?1:delta[i]===-1?markerAdvances:1;
        }
        let best={ioc:-1};
        for (let phase=0;phase<FIELD_ORDER;phase++) {
          const hist=new Uint32Array(P);
          for (let i=0;i<cipher.length;i++) {
            const plain=beginnings[i]?cipher[i]:delta[i]===-1?28:
              (delta[i]+sign*pad[(clock[i]+phase)%FIELD_ORDER]+28)%28;
            hist[plain]++;
          }
          const score=hist.reduce((sum,n)=>sum+n*(n-1),0)/
            (cipher.length*(cipher.length-1));
          if (score>best.ioc)best={phase,ioc:score};
        }
        output.push({reset,markerAdvances,sign,
          models:FIELD_ORDER,best});
      }
  return output;
}
/**
 * Full-length source-native positive for the declared unmasked phase.
 * @param {number[]} pad
 */
function nativePlant(pad) {
  const sourceText=resource('resources/control/shakespeare_first300k.txt');
  const plain=encode(sourceText).slice(50000,50000+RUNES);
  assert.equal(plain.length,RUNES);
  const truePhase=391;
  const original=plain.map((p,i)=>mod(p+pad[(i+truePhase)%FIELD_ORDER]));
  let recovered=0,best={ioc:-1};
  for (let phase=0;phase<FIELD_ORDER;phase++) {
    const decoded=original.map((c,i)=>mod(c-pad[(i+phase)%FIELD_ORDER]));
    if (phase===truePhase)
      recovered=decoded.filter((p,i)=>p===plain[i]).length;
    const score=ioc(decoded);
    if (score>best.ioc)best={phase,ioc:score};
  }
  assert.equal(recovered,RUNES);
  assert.equal(best.phase,truePhase);
  return {source:'Shakespeare heldout GP',sourceIoc:ioc(plain),
    truePhase,exhaustiveBest:best,recovered,sourceLength:RUNES};
}
function main() {
  const input=source();
  const {pad,logs}=primitiveTable();
  const direct=directGP29Gate(input,pad);
  const relative=deltaGP28Gate(input,pad);
  const pair=terminalPairGate(input,logs);
  const plant=nativePlant(pad);
  assert.equal(direct.length,2);
  assert.equal(relative.length,12);
  assert.equal(direct[0].best.ioc,0.034567980525839974);
  assert.equal(direct[1].best.ioc,0.03458554435169881);
  assert.equal(Math.max(...relative.map(x=>x.best.ioc)),0.035367706558754396);
  assert.equal(pair.best.matches,16);
  const result={
    classification:'Conditional original-cipher exclusions; no recovered LP2 plaintext',
    source:{red3:[13,23,2],irreducibleMonic:[21,26,1],
      red39:[27,5,15],doubleRoot:24,fieldDegree:2,
      primitiveElementOrder:FIELD_ORDER,fieldTrace:3,fieldNorm:21,
      rootPower30:power([0,1],30),
      terminalBlack:input.black.length,terminalRedAndLast:input.terminal.length,
      gridQuotientCoefficients:input.quotient.length,
      redThirteenDotMarks:30,blackThirteenDotMarks:1},
    original:{runes:RUNES,rawIoc:ioc(input.cipher),
      directGP29:direct,relativeGP28:relative,
      maxDirectIoc:Math.max(...direct.map(x=>x.best.ioc)),
      maxRelativeIoc:Math.max(...relative.map(x=>x.best.ioc)),
      logPairSerialization:pair},
    knownKeyPlant:plant,
    caveat:'Finite direct GP29 / relative GP28 source clocks only. Source coincidence does not establish author intent.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main===module)main();
module.exports={source,primitiveTable,directGP29Gate,deltaGP28Gate,
  terminalPairGate,nativePlant,multiply,power,trace,norm,main};
