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
// Full original p15 rectangle: one red origin plus five non-red triples.
const groups=[];
for(let k=1;k<16;k+=3){
  const source=spiral.slice(k,k+3);
  const runes=source.map(x=>resolve(x).index);
  const address=runes.reduce((a,b)=>a+b,0);
  groups.push({source,word:runes.map(x=>corpus.translit[x]),address,token:cells[address]});
}
assert.deepEqual(groups.map(g=>g.address),[57,40,29,47,37]);
assert.deepEqual(groups.map(g=>g.token),["1w","1K","16","1G","1K"]);
const base59=table.alphabet.replace("f","");
assert.equal(base59.length,59);
function tokenAscii(token,alphabet){
  assert.equal(token.length,2);
  const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
  assert.ok(a>=0&&b>=0);
  const value=a*alphabet.length+b;
  assert.ok(value>=0&&value<=255);
  return String.fromCharCode(value);
}
const read60=groups.map(g=>tokenAscii(g.token,table.alphabet)).join("");
const read59=groups.map(g=>tokenAscii(g.token,base59)).join("");
assert.equal(read60,"vPBLP");
assert.equal(read59,"tOAKO");
assert.equal(groups[3].address,47);
assert.deepEqual([47,55,63].map(i=>cells[i]),["1G","1K","0p"]);
assert.equal([47,55,63].map(i=>tokenAscii(cells[i],base59)).join(""),"KO2");
assert.equal([47,55,63].map(i=>tokenAscii(cells[i],table.alphabet)).join(""),"LP3");
const continuationValues=[10176,19866,36490,64632,112536,193398];
const continued=[0,1].map(i=>{
  const numbers=continuationValues.slice(3*i,3*i+3);
  const offsets=numbers.map(n=>n%stream.length);
  const addr=offsets.reduce((s,n)=>s+resolve(n).index,0);
  return {numbers,offsets,addr,token:cells[addr],char:tokenAscii(cells[addr],base59)};
});
assert.deepEqual(continued.map(c=>[c.addr,c.token,c.char]),[[52,"1Q","U"],[43,"1D","H"]]);
assert.equal(read59+continued.map(x=>x.char).join(""),"tOAKOUH");
// Independent authentic LP1 second Koan direct source-key control on p15.
const known=JSON.parse(fs.readFileSync(path.join(root,"resources","external",
  "relikd-solved-gp29-native-v1.json"),"utf8"));
assert.deepEqual(known.runes,corpus.runes);
const koan=known.sections.find(s=>s.name==="jpg107-167");
assert.ok(koan);
const fullKey=[...koan.source_text].filter(c=>corpus.runes.includes(c))
  .map(c=>corpus.runes.indexOf(c));
assert.equal(fullKey.length,319);
assert.deepEqual(fullKey.slice(0,5).map(i=>corpus.translit[i]),["A","C","O","A","N"]);
const sourceKeys=[fullKey,fullKey.slice(5)];
function ioc(arr){
  const freq=Array(29).fill(0);
  for(const i of arr)freq[i]++;
  return freq.reduce((s,v)=>s+v*(v-1),0)/(arr.length*(arr.length-1));
}
const p15=corpus.pages[15].indices;
const inverse=[];
for(const [keyVariant,key] of sourceKeys.entries()){
  for(const sign of [-1,1]){
    const out=p15.map((v,i)=>(v+29+sign*key[i])%29);
    assert.deepEqual(out.map((v,i)=>(v-sign*key[i]+29)%29),p15);
    inverse.push({includeTitle:keyVariant===0,sign,ioc:ioc(out)});
  }
}
assert.deepEqual(inverse.map(x=>Number(x.ioc.toFixed(12))),
  [0.03359605127,0.036064007643,0.034153331741,0.034153331741]);
assert.ok(inverse.every(x=>x.ioc<0.046));
const p57=corpus.pages[57].indices;
const planted=p57.map((v,i)=>(v+fullKey[i])%29);
assert.deepEqual(planted.map((v,i)=>(v-fullKey[i]+29)%29),p57);
console.log(JSON.stringify({fiveTripleSourceGroups:groups,read60,read59,
  infinityWrapContinuation:continued,koanDirectVigenereInverse:inverse,
  originalUnknownPlaintextRecovered:false},null,2));

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
