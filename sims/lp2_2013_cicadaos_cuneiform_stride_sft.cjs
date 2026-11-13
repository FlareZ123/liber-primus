"use strict";

/**
 * Full-table strided source search against authenticated CicadaOS 2013 bytes.
 *
 * Source-motivated, frozen skips: 1033 and 3301, the two sexagesimal numerals
 * visibly printed in the LP2 p33-39 rubric. Input is the original 2013 ISO
 * and its actual DATA/560.13 member. Eight layouts are the literal 32x8
 * rectangle read row/column major with reflections. We grant a uniform XOR
 * byte, uniform additive byte, one repeating eight-byte XOR/additive mask,
 * or one GP29 additive byte-residue shift.
 *
 * For each model, any complete 256-byte source match must preserve the
 * first three sample-pair differences at distance stride*maskPeriod.
 * Index these 8 exact three-difference signatures and scan each historical
 * source byte once per original skip, checking full-length candidates.
 *
 * No language model, unknown original plaintext, phase tuning or extra skip.
 * Run: node sims/lp2_2013_cicadaos_cuneiform_stride_sft.cjs 3301.iso
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const MD5 = "74062dee4093c6ca0340cda23f0e994b";
const TABLE_SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
const DATA_SIZE = 118818811;
const BLOCK = 2048;
const STRIDES = [1033, 3301];

/** @param {Buffer} image @returns {{tape:Buffer,start:number}} */
function extract2013Tape(image) {
  const pvd = 16 * BLOCK;
  assert.equal(image.subarray(pvd + 1, pvd + 6).toString(), "CD001");
  let record = pvd + 156;
  for (const segment of ["DATA", "560.13"]) {
    const lba = image.readUInt32LE(record + 2);
    const bytes = image.readUInt32LE(record + 10);
    const start = lba * BLOCK;
    let found = -1;
    for (let offset = 0; offset < bytes;) {
      const length = image[start + offset];
      if (!length) {
        offset = (Math.floor(offset / BLOCK) + 1) * BLOCK;
        continue;
      }
      const current = start + offset;
      const count = image[current + 32];
      const name = image.subarray(current + 33, current + 33 + count)
        .toString("ascii").split(";")[0].replace(/\.$/u, "");
      if (name.toUpperCase() === segment) {
        found = current;
        break;
      }
      offset += length;
    }
    assert.ok(found >= 0, "2013 ISO missing " + segment);
    record = found;
  }
  const start = image.readUInt32LE(record + 2) * BLOCK;
  const size = image.readUInt32LE(record + 10);
  assert.equal(size, DATA_SIZE);
  assert.ok(start > 0 && start + size < image.length);
  return {tape: image.subarray(start, start + size), start};
}

/** @param {Buffer} grid @returns {{name:string,values:Buffer}[]} */
function tableOrientations(grid) {
  /** @type {{name:string,values:Buffer}[]} */
  const all = [];
  for (const major of ["row", "column"]) {
    for (const flipR of [false, true]) {
      for (const flipC of [false, true]) {
        const b = Buffer.alloc(256);
        for (let i = 0; i < 256; i++) {
          const row = major === "row" ? Math.floor(i / 8) : i % 32;
          const col = major === "row" ? i % 8 : Math.floor(i / 32);
          b[i] = grid[8 * (flipR ? 31 - row : row) + (flipC ? 7 - col : col)];
        }
        all.push({name: major + "/flipR=" + flipR + "/flipC=" + flipC, values: b});
      }
    }
  }
  assert.equal(new Set(all.map(v => v.values.toString("hex"))).size, 8);
  return all;
}

/** @typedef {"xor"|"add"|"residue"} Operation */
/** @typedef {{name:string,op:Operation,lag:number,radix:number}} Model */
/** @type {Model[]} */
const MODELS = [
  {name: "xor-constant", op: "xor", lag: 1, radix: 256},
  {name: "add-constant", op: "add", lag: 1, radix: 256},
  {name: "xor-period8", op: "xor", lag: 8, radix: 256},
  {name: "add-period8", op: "add", lag: 8, radix: 256},
  {name: "gp29-add-constant", op: "residue", lag: 1, radix: 29}
];

/** @param {number} a @param {number} b @param {Operation} op @returns {number} */
function difference(a, b, op) {
  if (op === "xor") return a ^ b;
  if (op === "add") return (b - a + 256) & 255;
  return (((b % 29) - (a % 29)) + 29) % 29;
}

/** @param {number} target @param {number} src @param {Operation} op @returns {number} */
function secret(target, src, op) {
  if (op === "xor") return target ^ src;
  if (op === "add") return (target - src + 256) & 255;
  return ((target % 29) - (src % 29) + 29) % 29;
}

/** @param {number} src @param {number} key @param {Operation} op @returns {number} */
function transform(src, key, op) {
  if (op === "xor") return src ^ key;
  if (op === "add") return (src + key) & 255;
  return ((src % 29) + key) % 29;
}

/**
 * @param {number} v0 @param {number} v1 @param {number} v2
 * @param {number} u0 @param {number} u1 @param {number} u2
 * @param {Model} model @returns {number}
 */
function signature(v0, v1, v2, u0, u1, u2, model) {
  const d0 = difference(v0, u0, model.op);
  const d1 = difference(v1, u1, model.op);
  const d2 = difference(v2, u2, model.op);
  return (d0 * model.radix + d1) * model.radix + d2;
}

/**
 * @param {{name:string,values:Buffer}[]} table
 * @returns {Map<number,number>[]}
 */
function signatureIndices(table) {
  return MODELS.map(model => {
    /** @type {Map<number,number>} */
    const index = new Map();
    for (let j = 0; j < table.length; j++) {
      const b = table[j].values, k = model.lag;
      const h = signature(b[0], b[1], b[2], b[k], b[k+1], b[k+2], model);
      index.set(h, (index.get(h) || 0) | (1 << j));
    }
    return index;
  });
}

/**
 * @param {Buffer} tape
 * @param {{name:string,values:Buffer}[]} options
 * @param {number} stride
 * @param {Model[]} models
 * @returns {{sourceBytes:number,stride:number,candidateSignatures:number,fullMatches:Array<object>,modelCandidates:Record<string,number>}}
 */
function scan(tape, options, stride, models = MODELS) {
  const indexes = signatureIndices(options);
  /** @type {Array<object>} */
  const matches = [];
  const candidates = Object.fromEntries(models.map(m => [m.name, 0]));
  const end = tape.length - 255 * stride;
  for (let start = 0; start < end; start++) {
    const t0 = tape[start], t1 = tape[start + stride],
      t2 = tape[start + 2*stride], t3 = tape[start + 3*stride],
      t8 = tape[start + 8*stride], t9 = tape[start + 9*stride],
      t10 = tape[start + 10*stride];
    for (let m = 0; m < MODELS.length; m++) {
      const model = MODELS[m], lag = model.lag;
      const hash = lag === 1
        ? signature(t0, t1, t2, t1, t2, t3, model)
        : signature(t0, t1, t2, t8, t9, t10, model);
      let mask = indexes[m].get(hash) || 0;
      if (!mask) continue;
      while (mask !== 0) {
        const bit = mask & -mask;
        const idx = 31 - Math.clz32(bit);
        mask ^= bit;
        candidates[model.name]++;
        const target = options[idx].values;
        const keys = Array.from({length: lag},
          (_, j) => secret(target[j], tape[start + j*stride], model.op));
        let matchesAll = true;
        for (let j = 0; j < 256; j++) {
          if (transform(tape[start + j*stride], keys[j % lag], model.op) !==
              (model.op === "residue" ? target[j] % 29 : target[j])) {
            matchesAll = false;
            break;
          }
        }
        if (matchesAll) {
          matches.push({sourceStart: start, layout: options[idx].name,
            model: model.name, stride, secret: keys});
        }
      }
    }
  }
  return {sourceBytes: tape.length, stride,
    candidateSignatures: Object.values(candidates).reduce((a,b)=>a+b,0),
    fullMatches: matches, modelCandidates: candidates};
}

/** @param {Buffer} grid */
function positiveControls(grid) {
  const original = tableOrientations(grid)[0];
  for (const stride of STRIDES) {
    for (const model of MODELS) {
      const source = Buffer.alloc(255*stride + 80);
      const start = 37;
      const keys = Array.from({length:model.lag},
        (_, j) => (19 + 47*j + model.lag) % (model.op === "residue" ? 29 : 256));
      for (let i=0; i<256; i++) {
        const target = original.values[i];
        const key = keys[i % model.lag];
        const sample = model.op === "xor" ? target ^ key
          : model.op === "add" ? (target - key + 256) & 255
          : ((target % 29) - key + 29) % 29;
        source[start + i*stride] = sample;
      }
      const result = scan(source,[original],stride,[model]);
      assert.ok(result.fullMatches.some(m=>m.model===model.name &&
        m.layout===original.name && m.sourceStart===start),
        model.name + " missing planted original-geometry 256-cell source");
    }
  }
  console.log("Ten/ten original-layout, nonzero-stride planted controls PASS");
}

function run() {
  const table = JSON.parse(fs.readFileSync(
    "resources/liber-primus/lp2-grid-256.json", "utf8"));
  const grid = Buffer.from(table.bytes);
  assert.equal(grid.length, 256);
  assert.equal(crypto.createHash("sha256").update(grid).digest("hex"), TABLE_SHA);
  positiveControls(grid);
  const filename = process.argv[2];
  assert.ok(filename, "original 2013 3301.iso file path is required");
  const image = fs.readFileSync(filename);
  assert.equal(crypto.createHash("md5").update(image).digest("hex"), MD5);
  const {tape, start} = extract2013Tape(image);
  const sources = [
    {name:"original DATA/560.13", bytes:tape},
    {name:"raw ISO before data extent", bytes:image.subarray(0,start)},
    {name:"raw ISO after data extent", bytes:image.subarray(start+tape.length)}
  ];
  console.log(JSON.stringify({authenticISOmd5:MD5, originalGridSha256:TABLE_SHA,
    stridedSteps:STRIDES, sourceBytes:sources.map(v=>({name:v.name,bytes:v.bytes.length})),
    layoutCount:8, modeledMaskedFamilies:MODELS.map(v=>v.name)}));
  const options = tableOrientations(grid);
  for (const stride of STRIDES) {
    for (const source of sources) {
      const result = scan(source.bytes, options, stride);
      console.log(JSON.stringify({source:source.name, ...result}));
    }
  }
}
run();
