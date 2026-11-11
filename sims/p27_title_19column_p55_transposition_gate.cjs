"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const quadgrams=read("resources/control/duko_round27_english_quadgrams.txt");
const titleSpan=annotations.pages.find(p=>p.page===27).red_spans.find(s=>s.start===0&&s.length===19);
assert.ok(titleSpan,"p27 red title must be a 19-rune span at offset 0");
const title=[...titleSpan.runes].map(r=>corpus.runes.indexOf(r));
assert.equal(title.length,19);
const weights=title.map(i=>corpus.prime[i]);
const p55=corpus.pages[55].indices;
assert.equal(p55.length,76);
const pairs=title.map((v,i)=>({v,i}));
const ascRune=pairs.slice().sort((a,b)=>a.v-b.v||a.i-b.i).map(x=>x.i);
const descRune=pairs.slice().sort((a,b)=>b.v-a.v||a.i-b.i).map(x=>x.i);
const ascPrime=weights.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v||a.i-b.i).map(x=>x.i);
const descPrime=weights.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v||a.i-b.i).map(x=>x.i);
assert.deepEqual(ascRune,ascPrime);
assert.deepEqual(descRune,descPrime);
const decode=xs=>xs.map(i=>corpus.translit[i]).join("");
function decryptColumnsToRows(cipher,order){
 const grid=Array.from({length:4},()=>Array(19));
 let k=0;
 for(const col of order)for(let row=0;row<4;row++)grid[row][col]=cipher[k++];
 return grid.flat();
}
function readColumnsFromRows(cipher,order){
 const grid=Array.from({length:4},(_,r)=>cipher.slice(r*19,(r+1)*19));
 const out=[];
 for(const col of order)for(let row=0;row<4;row++)out.push(grid[row][col]);
 return out;
}
const outputs={
 decryptAsc:decode(decryptColumnsToRows(p55,ascPrime)),
 decryptDesc:decode(decryptColumnsToRows(p55,descPrime)),
 readAsc:decode(readColumnsFromRows(p55,ascPrime)),
 readDesc:decode(readColumnsFromRows(p55,descPrime))
};
assert.equal(outputs.decryptAsc,"PUUEAMNGCCMXMIADEOSEHWEAFWBEUAEEAXSGSATHCEOSNGSFBREICMIDEOSDBAEEOTHTHLBXHBIGPIMJGEIACFETHOEEOXI");
assert.equal(outputs.decryptDesc,"MEANGDPUMWCIAMSEHUEAEOCXUEAETHFBSSEAASEOSNGWFCXGCIMAEBEEOBIBDTHTHLRXEODSPGIFHIGXMCIATHOEEOBIEJE");
assert.equal(outputs.readAsc,"SEAHTHAMEEMIEOEADPIXGCECAEUIATHBSSIWBBSIAEOSBEOUEAMNGCDEOTHHGDIRFESMEIAENGXJFLGUBFEOOEXXCCMWPTH");
assert.equal(outputs.readDesc,"MWPTHXXCCBFEOOEIRFESMEIAENGXJFLGUNGCDEOTHHGDEOUEAMWBBSIAEOSBAEUIATHBSSIGCECDPIXMIEOEAAMEESEAHTH");
const counts=new Map(quadgrams.trim().split(/\n/).map(line=>{
 const [q,n]=line.trim().split(/\s+/);return [q,Number(n)];
}));
function quadgramScore(s){
 let total=0,n=0;
 for(let i=0;i+4<=s.length;i++){
  total+=Math.log((counts.get(s.slice(i,i+4))||0)+0.01);n++;
 }
 return total/n;
}
const raw=decode(p55);
const scores=Object.fromEntries([["raw",raw],...Object.entries(outputs)].map(([k,v])=>[k,quadgramScore(v)]));
assert.ok(scores.decryptAsc<scores.raw);
assert.ok(scores.decryptDesc<scores.raw);
assert.ok(scores.readAsc<scores.raw);
assert.ok(scores.readDesc<scores.raw);
const result={
  p27Title:{runes:title.length,transliteration:decode(title),primeWeights:weights},
  p55:{runes:p55.length,rows:4,columns:19,transliterationLength:raw.length},
  keyOrders:{ascending:ascPrime,descending:descPrime},
  outputs,
  quadgramScores:scores,
  decision:"The 19-column title-key transposition is a source-motivated fit but neither standard inverse direction, ascending or descending stable key order, yields plaintext. The outputs score below the raw p55 stream under the repository's English quadgram control."
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
