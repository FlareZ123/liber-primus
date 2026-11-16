"use strict";

/**
 * Original p50 32x8 byte grid versus 225 red GP29 runes and 31 thirteen-dot
 * marks. Test the source-motivated 16x16 boundary/15x15 interior model:
 * 31 cells in a first row and first column, and 225 interior differences.
 *
 * Both consecutive-row pairing and half-grid side-by-side reflows, all eight
 * symmetries, 2D finite differences modulo 29, and 2D XOR are tested.
 * Every possible stationary secret rune->difference table is excluded
 * exactly if its minimum conflict count is nonzero.
 * Windows-compatible standalone test: node sims/lp2_red225_square_delta_sft.cjs
 * No file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative */
const readJson = relative => JSON.parse(fs.readFileSync(
  path.join(ROOT, relative), "utf8"
));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const table = readJson("resources/liber-primus/lp2-grid-256.json");
const byPage = new Map(corpus.pages.map(page => [page.page, page]));
/** @type {number[]} */
const red = [];
for (const page of ink.pages) {
  const original = byPage.get(page.page);
  assert.ok(original);
  for (const span of page.red_spans || []) {
    const values = original.indices.slice(span.start, span.start + span.length);
    assert.equal(values.length, span.length);
    red.push(...values);
  }
}
assert.equal(red.length, 225);
assert.equal(table.bytes.length, 256);
assert.equal(ink.counts.red13 + ink.counts.black13, 31);
assert.equal(new Set(red).size, 29);

/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @type {Array<[string, (r:number,c:number)=>[number,number]]>} */
const symmetries = [
  ["id", (r,c) => [r,c]],
  ["rot90", (r,c) => [15-c,r]],
  ["rot180", (r,c) => [15-r,15-c]],
  ["rot270", (r,c) => [c,15-r]],
  ["flipH", (r,c) => [r,15-c]],
  ["flipV", (r,c) => [15-r,c]],
  ["transpose", (r,c) => [c,r]],
  ["antitranspose", (r,c) => [15-c,15-r]]
];

/**
 * Two natural reversible square reflows of the printed 32x8 layout.
 * @param {"paired"|"halves"} kind
 * @param {number} r
 * @param {number} c
 */
function sourceByte(kind,r,c) {
  if (kind === "paired") return table.bytes[(r * 2 + Math.floor(c / 8)) * 8 + c % 8];
  return table.bytes[(r + 16 * Math.floor(c / 8)) * 8 + c % 8];
}

/**
 * @param {"paired"|"halves"} reflow
 * @param {(r:number,c:number)=>[number,number]} transform
 * @returns {number[][]}
 */
function square(reflow,transform) {
  return Array.from({length:16},(_,r) =>
    Array.from({length:16},(_,c) => {
      const [i,j] = transform(r,c);
      return sourceByte(reflow,i,j);
    })
  );
}

/**
 * Return the 225 2D mixed first-differences in row-major interior order.
 * @param {number[][]} grid
 * @param {"gp29"|"xor256"} mode
 * @returns {number[]}
 */
function mixed(grid,mode) {
  const out = [];
  for (let r=1;r<16;r++) for (let c=1;c<16;c++) {
    const a=grid[r][c], b=grid[r-1][c], d=grid[r][c-1], e=grid[r-1][c-1];
    out.push(mode==="gp29" ? mod29(a-b-d+e) : a^b^d^e);
  }
  return out;
}

/**
 * Exact minimum disagreements of an arbitrary deterministic GP rune lookup:
 * for each of 29 rune classes choose the output value with maximum count.
 * @param {number[]} output
 */
function bestStationaryLookup(output) {
  const counts = Array.from({length:29},() => new Map());
  for (let i=0;i<225;i++) {
    const row=counts[red[i]], v=output[i];
    row.set(v,(row.get(v)||0)+1);
  }
  return counts.reduce((sum,row) => {
    const kept=Math.max(...row.values());
    return sum + [...row.values()].reduce((s,n)=>s+n,0) - kept;
  },0);
}

/**
 * Construct a planted exact positive using arbitrary original 31-cell border.
 * For modulo-29 and XOR, the 2D mixed difference is the original 225 red runes.
 * @param {number[][]} original
 * @param {"gp29"|"xor256"} mode
 */
function planted(original,mode) {
  const out=original.map(row=>row.map(v=>mode==="gp29"?mod29(v):v));
  let i=0;
  for (let r=1;r<16;r++) for (let c=1;c<16;c++) {
    const p=red[i++];
    out[r][c]=mode==="gp29"
      ? mod29(p+out[r-1][c]+out[r][c-1]-out[r-1][c-1])
      : (p^out[r-1][c]^out[r][c-1]^out[r-1][c-1]);
  }
  assert.deepEqual(mixed(out,mode),red);
  for (let k=0;k<16;k++) {
    assert.equal(out[0][k],mode==="gp29"?mod29(original[0][k]):original[0][k]);
    assert.equal(out[k][0],mode==="gp29"?mod29(original[k][0]):original[k][0]);
  }
  return true;
}

const report = [];
for (const reflow of ["paired","halves"]) {
  for (const [orientation,transform] of symmetries) {
    const source=square(reflow,transform);
    for (const mode of ["gp29","xor256"]) {
      const derivative=mixed(source,mode);
      report.push({
        reflow, orientation,mode,
        directMatches: derivative.filter((x,i)=>x===red[i]).length,
        distinctDifferences: new Set(derivative).size,
        minimumChangedCellsForAnyStationaryRuneLookup:bestStationaryLookup(derivative)
      });
    }
  }
}
assert.equal(report.length,32);
assert.deepEqual(report[0],{
  reflow:"paired", orientation:"id", mode:"gp29", directMatches:10,
  distinctDifferences:29, minimumChangedCellsForAnyStationaryRuneLookup:174
});
assert.deepEqual(report[1],{
  reflow:"paired", orientation:"id", mode:"xor256", directMatches:0,
  distinctDifferences:144, minimumChangedCellsForAnyStationaryRuneLookup:193
});
assert.equal(Math.min(...report.filter(x=>x.mode==="gp29")
  .map(x=>x.minimumChangedCellsForAnyStationaryRuneLookup)),172);
assert.equal(Math.min(...report.filter(x=>x.mode==="xor256")
  .map(x=>x.minimumChangedCellsForAnyStationaryRuneLookup)),192);
assert.ok(report.every(x=>x.minimumChangedCellsForAnyStationaryRuneLookup>0));
assert.ok(planted(square("paired",symmetries[0][1]),"gp29"));
assert.ok(planted(square("paired",symmetries[0][1]),"xor256"));
console.log(JSON.stringify({
  source:{redRunes:red.length,thirteenDotMarks:31,gridBytes:table.bytes.length},
  hypothesis:"16x16 border 31 + 15x15 interior 225",
  tested:report.length,minimumMismatchGP29:172,minimumMismatchXOR256:192,
  plantedModesPassed:["gp29","xor256"],details:report
},null,2));
