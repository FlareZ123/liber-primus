"use strict";

/**
 * Source-defined nonlinear two-rune GP29 feedback with an exact inverse:
 * z_i = C_(i-1) + u*C_(i-2), or z_i = P_(i-1) + u*P_(i-2);
 * C_i = P_i - sign*projection(F(z_i)), where F is the original 256-byte grid
 * polynomial or its exact red-p39-factor quotient Q. Both pair orientations,
 * signs, global/page state and four natural field projections are tested.
 *
 * The p3 source red triple fixes u^2=3u+8 in GF(29^2). The p39 triple
 * fixes Q=F/[15(X-24)^2]. No synthetic key, original-output fit, or arbitrary
 * nonlinear lookup is allowed. Every ciphertext original candidate is
 * re-encrypted exactly; independently encoded 12,956-rune GP-English plants
 * recover exactly with the original code and original page geometry.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {m,mul, evaluate, quotientByRedFactor, ioc} =
  require("./lp2_red_triad_polynomial_eval_inverse.cjs");
const {nativeGP} = require("./red_triad_gf841_127cycle_inverse.cjs");
const ROOT = path.resolve(__dirname,"..");

/** @param {string} name @returns {any} */
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT,name),"utf8"));

/**
 * @param {number[]} coefficients
 * @returns {Array<{a:number,b:number,trace:number,norm:number}>}
 */
function makeTable(coefficients) {
  const values = [];
  for (let b=0;b<29;b++) for (let a=0;a<29;a++) {
    const [x,y] = evaluate(coefficients,[a,b]);
    values[a+29*b] = {a:x,b:y,trace:m(2*x+3*y),
      norm:m(x*x+3*x*y-8*y*y)};
  }
  return values;
}

/**
 * @typedef {"plain"|"cipher"} Feedback
 * @typedef {"global"|"page"} Clock
 * @typedef {"trace"|"norm"|"a"|"b"} Projection
 *
 * @param {number[][]} pages
 * @param {Array<{a:number,b:number,trace:number,norm:number}>} table
 * @param {Feedback} feedback
 * @param {Clock} clock
 * @param {Projection} projection
 * @param {boolean} swap
 * @param {1|-1} sign
 * @param {boolean} encode
 * @returns {number[][]}
 */
function transform(pages,table,feedback,clock,projection,swap,sign,encode) {
  const processed=[];
  let history=[];
  for (const input of pages) {
    if (clock==="page") history=[];
    const output=[];
    for (let i=0;i<input.length;i++) {
      let key=0;
      if (history.length>=2) {
        const prev=history.at(-1), prev2=history.at(-2);
        const x=swap?prev2:prev,y=swap?prev:prev2;
        key=table[x+29*y][projection];
      }
      const value = encode?m(input[i]-sign*key):m(input[i]+sign*key);
      output.push(value);
      const plain=encode?input[i]:value;
      const cipher=encode?value:input[i];
      history.push(feedback==="plain"?plain:cipher);
    }
    processed.push(output);
  }
  return processed;
}

function main() {
  const grid=load("resources/liber-primus/lp2-grid-256.json");
  assert.equal(grid.bytes.length,256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
    .digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
    .map(p=>p.indices);
  const total=pages.flat();
  assert.equal(total.length,12956);
  const tables={
    full:makeTable(grid.bytes.map(m)),
    quotient:makeTable(quotientByRedFactor(grid.bytes))
  };
  const results=[];
  for (const [mode,table] of Object.entries(tables))
    for (const feedback of /** @type {Feedback[]} */ (["plain","cipher"]))
      for (const clock of /** @type {Clock[]} */ (["page","global"]))
        for (const projection of /** @type {Projection[]} */ (["trace","norm","a","b"]))
          for (const swap of [false,true])
            for (const sign of /** @type {(1|-1)[]} */ ([-1,1])) {
              const result=transform(pages,table,feedback,clock,projection,swap,sign,false);
              const recovered=transform(result,table,feedback,clock,projection,swap,sign,true);
              assert.deepEqual(recovered,pages);
              results.push({mode,feedback,clock,projection,swap,sign,ioc:ioc(result.flat())});
            }
  assert.equal(results.length,128);
  results.sort((a,b)=>b.ioc-a.ioc);
  assert(results.every(x=>x.ioc<0.036));

  const source=fs.readFileSync(
    path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
  const native=nativeGP(source).slice(0,total.length);
  assert.equal(native.length,total.length);
  let cursor=0;
  const nativePages=pages.map(p=>{
    const part=native.slice(cursor,cursor+p.length);
    cursor+=p.length;
    return part;
  });
  const controls=[];
  for (const [mode,table] of Object.entries(tables))
    for (const feedback of /** @type {Feedback[]} */ (["plain","cipher"])) {
      const encrypted=transform(nativePages,table,feedback,"global","trace",
        false,1,true);
      const recovered=transform(encrypted,table,feedback,"global","trace",
        false,1,false);
      assert.deepEqual(recovered,nativePages);
      assert.deepEqual(transform(recovered,table,feedback,"global","trace",
        false,1,true),encrypted);
      controls.push({mode,feedback,nativeExact:12956,
        nativeIoC:ioc(recovered.flat()),encryptedIoC:ioc(encrypted.flat())});
    }
  console.log(JSON.stringify({
    result:"Original-input bounded negative. No unknown plaintext or authentic key.",
    originalSourceRunes:total.length, sourceIoC:ioc(total),
    fieldInputStates:841,sourcePolynomialVariants:2,originalInverses:results.length,
    bestOverall:results[0],bestPerFeedback:["plain","cipher"]
      .map(f=>results.find(x=>x.feedback===f)),
    controls
  },null,2));
}

if(require.main===module)main();
module.exports={makeTable,transform};
