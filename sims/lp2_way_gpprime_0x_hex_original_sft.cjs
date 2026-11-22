"use strict";
/**
 * WAY's two canonical GP29 numbers select original table tokens 1w and 0x.
 * The latter supplies a candidate hex notation for the already frozen MAP
 * 4E -> N -> HERE step. Exact source-glyph and vocabulary uniqueness gates.
 * Windows11, Node22: node sims/lp2_way_gpprime_0x_hex_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","resources");
const c=JSON.parse(fs.readFileSync(path.join(root,"liber-primus","lp2-corpus.json"),"utf8"));
const g=JSON.parse(fs.readFileSync(path.join(root,"liber-primus","base60-grid.json"),"utf8"));
const solved=JSON.parse(fs.readFileSync(path.join(root,"external",
  "relikd-solved-gp29-native-v1.json"),"utf8"));
const signed=fs.readFileSync(path.join(root,"historical","cicada2016-4gq25-outguess.asc"),"utf8");
assert.equal(g.rows.length,32);
assert.ok(g.rows.every(row=>row.length===8));
const cells=g.rows.flat();
assert.equal(cells.length,256);
const values={};
for(const [word,indices] of Object.entries({
  WAY:[7,24,26],MAP:[19,24,13],HERE:[8,18,4,18]})){
  assert.equal(indices.map(i=>c.translit[i]).join(""),word);
  values[word]={indices,gp0:indices.reduce((s,v)=>s+v,0),
    prime:indices.reduce((s,v)=>s+c.prime[v],0)};
}
assert.equal(values.WAY.gp0,57);
assert.equal(values.WAY.prime,219);
assert.deepEqual(values.WAY.indices.map(i=>c.prime[i]),[19,97,103]);
assert.equal(values.MAP.gp0,56);
assert.equal(values.HERE.gp0,48);
assert.equal(cells[57],"1w");
assert.equal(cells[219],"0x");
assert.equal(cells[56],"4E");
assert.equal(cells[48],"4D");
assert.equal(cells.filter(token=>token==="1w").length,1);
assert.equal(cells.filter(token=>token==="0x").length,3);
assert.ok(signed.includes("Liber Primus is the way."));
assert.ok(signed.includes("Its words are the map,"));
// Independently obtain WAY from the first original p15 non-red spiral.
const runes=c.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(runes.length,12956);
const originalP15=[3298,3296,3294];
assert.deepEqual(originalP15.map(i=>c.translit[runes[i]]),["W","A","Y"]);
assert.deepEqual(originalP15.map(i=>c.translit[runes[i-1]]),["G","IA","X"]);
// Literal compass syntax first; 0x from the other canonical WAY number
// licenses hexadecimal ASCII on the second cell, without a fitted parser.
function step(index,direction,length){
  const row=Math.floor(index/8),col=index%8;
  const nextRow=row+(direction==="N"?-length:direction==="S"?length:0);
  const nextCol=col+(direction==="W"?-length:direction==="E"?length:0);
  return nextRow>=0&&nextRow<32&&nextCol>=0&&nextCol<8?8*nextRow+nextCol:null;
}
const first=/^([1-9])([NSEW])$/i.exec(cells[values.WAY.gp0]);
assert.ok(first);
const mapAt=step(57,first[2].toUpperCase(),Number(first[1]));
assert.equal(mapAt,values.MAP.gp0);
const second=Number(cells[mapAt].replace(/^/,"0x"));
assert.equal(second,0x4E);
const direction=String.fromCharCode(second);
assert.equal(direction,"N");
const hereAt=step(mapAt,direction,1);
assert.equal(hereAt,values.HERE.gp0);
// Across the entire original panel the frozen direct-then-hex-cardinal
// grammar yields exactly one successful in-bounds two-stage source.
const twoHop=[];
for(let i=0;i<256;i++){
  const token=/^([1-9])([NSEW])$/i.exec(cells[i]);
  if(!token)continue;
  const middle=step(i,token[2].toUpperCase(),Number(token[1]));
  if(middle===null)continue;
  const ascii=/^[0-9A-F]{2}$/i.test(cells[middle])?
    String.fromCharCode(parseInt(cells[middle],16)):null;
  if(ascii===null||!/^[NSEW]$/.test(ascii))continue;
  const dest=step(middle,ascii,1);
  if(dest!==null)twoHop.push({i,middle,dest});
}
assert.deepEqual(twoHop,[{i:57,middle:56,dest:48}]);
// Lossless original-native solved GP29 vocabulary. No Latin re-encoding,
// guessed phonemic letters, or unsolved transcription is required.
const runeIndex=new Map(c.runes.map((glyph,i)=>[glyph,i]));
const nativeWords=[];
const adjacency=[];
for(const section of solved.sections){
  let current=[],previous=null;
  for(const glyph of [...section.source_text," "]){
    if(runeIndex.has(glyph)){current.push(runeIndex.get(glyph));continue}
    if(current.length===0)continue;
    const word={name:current.map(v=>c.translit[v]).join(""),
      nativeKey:current.join(","),
      gp0:current.reduce((s,v)=>s+v,0),
      prime:current.reduce((s,v)=>s+c.prime[v],0),
      section:section.name};
    nativeWords.push(word);
    if(previous)adjacency.push([previous.name,word.name,section.name]);
    previous=word;
    current=[];
  }
}
assert.equal(nativeWords.length,740);
const distinct=[...new Map(nativeWords.map(w=>[w.nativeKey,w])).values()];
assert.equal(distinct.length,272);
const inRange=distinct.filter(w=>w.prime<256);
assert.equal(inRange.length,156);
const exact=inRange.filter(w=>cells[w.prime]==="0x");
const insensitive=inRange.filter(w=>cells[w.prime].toLowerCase()==="0x");
assert.deepEqual(exact.map(w=>w.name),["WAY"]);
assert.deepEqual(insensitive.map(w=>w.name),["WAY"]);
assert.ok(adjacency.some(([a,b,section])=>a==="WAY"&&b==="HERE"&&section==="0_welcome"));
console.log(JSON.stringify({source_word:"WAY",source_gp0:values.WAY.gp0,
  source_gpprime:values.WAY.prime,tokens:[cells[57],cells[219]],
  typed_route:[{gp0:57,token:"1w",next:56},{gp0:56,token:"0x4E",direction:"N",next:48}],
  exact_solved_native_word_total:nativeWords.length,unique_native_words:distinct.length,
  prime_index_in_table:inRange.length,only_word_selecting_0x:exact.map(w=>w.name),
  entire_table_two_hop:twoHop,
  status:"Source-selected possible hex opcode; no unknown-page ciphertext deciphered"},null,2));
