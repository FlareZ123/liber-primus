"use strict";
/**
 * SFT: p15 original source spiral -> GP29 WAY -> p50 conditional WAY/MAP/HERE.
 * Run on Windows 11, Node 22: node sims/lp2_p15_first3_way_table_entry_sft.cjs
 * Evidence is an original-input candidate. No unknown LP2 text is decrypted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const source = path.join(root, "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(source, "lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(source, "base60-grid.json"), "utf8"));
const signed2016 = fs.readFileSync(path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");
const lp1 = fs.readFileSync(path.join(source, "lp1-plaintext-reference.txt"), "utf8");
assert.deepEqual(corpus.pages.map(p => p.page), Array.from({length:58}, (_, i) => i));
const stream = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(stream.length, 12956);
assert.deepEqual([corpus.pages[13].runic_count, corpus.pages[15].runic_count], [272,159]);
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every(row => row.length === 8));
// Literal original grid, pre-established in the p15 mathematical source SFT.
const printed = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const spiral = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],
].map(([r,c]) => printed[r][c]);
assert.deepEqual(spiral, [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516]);
/** Map original zero-based stream address to physical page, local offset, GP rune. */
function resolve(address) {
  assert.ok(Number.isInteger(address) && address>=0 && address<stream.length);
  let start=0;
  for(const p of corpus.pages.filter(p=>p.page<=55)){
    if(address<start+p.indices.length){
      const local=address-start;
      return {page:p.page,local,index:p.indices[local],glyph:corpus.translit[p.indices[local]]};
    }
    start+=p.indices.length;
  }
  assert.fail("unreachable");
}
const sourceNumbers=spiral.slice(1,4);
assert.deepEqual(sourceNumbers,[3298,3296,3294]);
const selected=sourceNumbers.map(resolve);
assert.deepEqual(selected.map(h=>[h.page,h.local,h.glyph]), [[13,104,"W"],[13,102,"A"],[13,100,"Y"]]);
assert.equal(selected.map(h=>h.glyph).join(""), "WAY");
assert.deepEqual(sourceNumbers.map(x=>resolve(x-1).glyph), ["G","IA","X"]);
assert.deepEqual(spiral.slice(0,4).map(x=>resolve(x).glyph), ["OE","W","A","Y"]);
const way=["W","A","Y"].map(x=>corpus.translit.indexOf(x));
const otherStarts=[];
for(let i=4;i<stream.length;i++){
  if(stream[i]===way[0] && stream[i-2]===way[1] && stream[i-4]===way[2]) otherStarts.push(i);
}
assert.deepEqual(otherStarts,[2959,3298,4126]);
/** Sum canonical GP0 indices of one normalized original English word. */
function gp0(word){
  const symbols=corpus.translit.map((name,index)=>({name,index})).sort((a,b)=>b.name.length-a.name.length);
  let n=0;
  for(let i=0;i<word.length;){
    const c=symbols.find(s=>word.startsWith(s.name,i));
    assert.ok(c, "Unknown GP rune in word");
    n+=c.index;
    i+=c.name.length;
  }
  return n;
}
assert.ok(signed2016.includes("Liber Primus is the way."));
assert.ok(signed2016.includes("Its words are the map,"));
assert.ok(signed2016.includes("their numbers are the direction."));
assert.ok(/WAY\s+HERE/i.test(lp1));
const [wayAt,mapAt,hereAt]=["WAY","MAP","HERE"].map(gp0);
assert.deepEqual([wayAt,mapAt,hereAt],[57,56,48]);
const cells=table.rows.flat();
assert.equal(cells[wayAt],"1w");
assert.equal(cells[mapAt],"4E");
const literalMove=/^([1-9])([nsew])$/i.exec(cells[wayAt]);
assert.ok(literalMove);
assert.equal(literalMove[2].toLowerCase(),"w");
const west=8*Math.floor(wayAt/8)+wayAt%8-Number(literalMove[1]);
assert.equal(west,mapAt);
assert.equal(String.fromCharCode(parseInt(cells[mapAt],16)),"N");
assert.equal(mapAt-8,hereAt);
console.log(JSON.stringify({
  claim:"Original-source candidate navigation, NOT authenticated unknown LP2 plaintext",
  red_origin:spiral[0],
  first_three_post_red:sourceNumbers,
  selected_runes:selected,
  word:"WAY",
  one_based_control:sourceNumbers.map(x=>resolve(x-1).glyph),
  repeated_spaced_WAY_starts:otherStarts,
  route:[
    {word:"WAY",gp0:wayAt,token:cells[wayAt],direction:"1 west",next:mapAt},
    {word:"MAP",gp0:mapAt,token:cells[mapAt],direction:"hex ASCII N, 1 north",next:hereAt},
    {word:"HERE",gp0:hereAt}
  ],
  recovered_unknown_plaintext:false
},null,2));
