"use strict";
/**
 * Original LP2 p0-p2 word-level red13 12x13 transposition gate.
 * Read-only Windows 11 / Node 22 CommonJS single-file test.
 * It tests whole printed word permutations, distinct from prior rune-column and
 * stationary-alphabet p0 models; it claims no plaintext or cipher key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/liber-primus/lp2-transcription.txt");
const fragment=text.split("&")[0].replace(/[/%\s]/g,"");
const all=fragment.split(/[-.]/).filter(Boolean);
const title=[...all.slice(0,2).join("")];
const body=all.slice(2);
const source=body.map(x=>[...x].length);
const titleIndices=title.map(c=>gp.runes.indexOf(c));
assert.equal(title.length,13);
assert.deepEqual(titleIndices,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(all.length,158);
assert.equal(body.length,156);
assert.equal(source.reduce((a,b)=>a+b),716);
const asc=Array.from({length:13},(_,i)=>i)
 .sort((a,b)=>titleIndices[a]-titleIndices[b]||a-b);
const desc=[...asc].reverse();
assert.deepEqual(asc,[7,3,12,4,1,0,8,2,10,5,11,9,6]);
/** @template T @param {T[]} data @param {number[]} order @returns {T[]} */
function columnRead(data,order) {
 assert.equal(data.length,156);
 const result=[];
 for(const c of order)for(let r=0;r<12;r++)result.push(data[r*13+c]);
 return result;
}
/** @template T @param {T[]} data @param {number[]} order @returns {T[]} */
function rowRead(data,order) {
 assert.equal(data.length,156);
 const columns=Array.from({length:13},()=>[]);
 for(let i=0;i<13;i++)columns[order[i]]=data.slice(12*i,12*(i+1));
 return Array.from({length:12},(_,r)=>Array.from({length:13},(_,c)=>columns[c][r])).flat();
}
const splitAsc=[...Array(8).keys()]
 .sort((a,b)=>titleIndices[a]-titleIndices[b]||a-b)
 .concat([...Array(5).keys()].map(i=>i+8)
 .sort((a,b)=>titleIndices[a]-titleIndices[b]||a-b));
const splitDesc=[...splitAsc.slice(0,8)].reverse()
 .concat([...splitAsc.slice(8)].reverse());
assert.deepEqual(splitAsc,[7,3,4,1,0,2,5,6,12,8,10,11,9]);
const splitModes={
 split_asc_column:a=>columnRead(a,splitAsc),
 split_asc_row:a=>rowRead(a,splitAsc),
 split_desc_column:a=>columnRead(a,splitDesc),
 split_desc_row:a=>rowRead(a,splitDesc)
};
const modes={
 asc_column:a=>columnRead(a,asc),
 asc_row:a=>rowRead(a,asc),
 desc_column:a=>columnRead(a,desc),
 desc_row:a=>rowRead(a,desc)
};
for(const order of [asc,desc,splitAsc,splitDesc]) {
 assert.deepEqual(rowRead(columnRead(source,order),order),source);
 assert.deepEqual(columnRead(rowRead(source,order),order),source);
}
const gpTokens=gp.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} word @returns {number} */
function gpLength(word) {
 const s=word.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 let n=0;
 for(let i=0;i<s.length;) {
  const k=s.startsWith("ING",i)?3:s.startsWith("IO",i)?2:
   (gpTokens.find(t=>s.startsWith(t,i))||"").length;
  assert.ok(k>0,"Unhandled letter in "+word);
  i+=k;n++;
 }
 return n;
}
const corpora=[
 read("resources/control/gibran_prophet_58585.txt"),
 read("resources/control/shakespeare_first300k.txt")
].map(t=>(t.match(/[A-Za-z]+/g)||[]).map(gpLength));
assert.deepEqual(corpora.map(a=>a.length),[15733,55407]);
const K=12, bin=n=>Math.min(K-1,n-1);
const count=Array.from({length:K},()=>new Float64Array(K));
const row=new Float64Array(K),col=new Float64Array(K);
let total=0;
corpora.forEach((words,g)=>{
 for(let i=1;i<[8500,40000][g];i++) {
  const a=bin(words[i-1]),b=bin(words[i]);
  count[a][b]++;row[a]++;col[b]++;total++;
 }
});
const model=count.map((line,i)=>Array.from(line,(v,j)=>
 Math.log((v+2)/(row[i]+2*K))-Math.log((col[j]+2)/(total+2*K))));
/** @param {number[]} a @returns {number} */
function score(a) {
 let s=0;
 for(let i=1;i<a.length;i++)s+=model[bin(a[i-1])][bin(a[i])];
 return s/(a.length-1);
}
/** @param {number[]} a @returns {number} */
function mi(a) {
 const x=new Float64Array(K),y=new Float64Array(K),xy=new Float64Array(K*K);
 const n=a.length-1;
 for(let i=1;i<a.length;i++){
  const p=bin(a[i-1]),q=bin(a[i]);
  x[p]++;y[q]++;xy[p*K+q]++;
 }
 let value=0;
 for(let i=0;i<K;i++)for(let j=0;j<K;j++){
  const count=xy[i*K+j];
  if(count)value+=(count/n)*Math.log(count*n/(x[i]*y[j]));
 }
 return value;
}
const original={llr:score(source),mi:mi(source)};
const cases=Object.fromEntries(Object.entries(modes).map(([k,fn])=>
 [k,{llr:score(fn(source)),mi:mi(fn(source))}]));
const splitCases=Object.fromEntries(Object.entries(splitModes).map(([k,fn])=>
 [k,{llr:score(fn(source)),mi:mi(fn(source))}]));
assert.ok(Math.abs(splitCases.split_asc_column.llr-0.0016098436362878006)<1e-12);
assert.ok(Math.abs(original.llr-(-0.014982245190371262))<1e-12);
assert.ok(Math.abs(cases.desc_column.llr-0.006647303468616497)<1e-12);
let seed=0x3301abcd;
/** @returns {number} */
function random() {
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return (seed>>>0)/4294967296;
}
/** @param {number[]} a @returns {number[]} */
function shuffle(a) {
 const b=a.slice();
 for(let i=b.length-1;i>0;i--) {
  const j=Math.floor(random()*(i+1));
  [b[i],b[j]]=[b[j],b[i]];
 }
 return b;
}
const iterations=25000,exceed=Object.fromEntries(Object.keys(modes).map(k=>[k,0]));
const bestOriginal=Math.max(...Object.values(cases).map(x=>x.llr));
let anyExceed=0;
for(let i=0;i<iterations;i++){
 const candidate=shuffle(source);
 let best=-Infinity;
 for(const [key,fn] of Object.entries(modes)){
  const s=score(fn(candidate));
  if(s>=cases[key].llr)exceed[key]++;
  if(s>best)best=s;
 }
 if(best>=bestOriginal)anyExceed++;
}
// Physically separated red title words (8+5) provide two independently
// key-sorted column groups, rather than one re-sorted 13-column heading.
seed=0x3301abcd;
const splitExceed=Object.fromEntries(Object.keys(splitModes).map(k=>[k,0]));
let splitAnyExceed=0;
const splitBest=Math.max(...Object.values(splitCases).map(x=>x.llr));
for(let i=0;i<iterations;i++) {
 const candidate=shuffle(source);
 let best=-Infinity;
 for(const [key,fn] of Object.entries(splitModes)) {
  const s=score(fn(candidate));
  if(s>=splitCases[key].llr)splitExceed[key]++;
  if(s>best)best=s;
 }
 if(best>=splitBest)splitAnyExceed++;
}
assert.equal(splitAnyExceed,8465);
assert.deepEqual(splitExceed,{
 split_asc_column:3138,split_asc_row:6729,
 split_desc_column:4841,split_desc_row:16884
});
const controls={};
corpora.forEach((words,g)=>{
 const name=g?"Shakespeare":"Gibran",native=[],transformed={};
 for(const key of Object.keys({...modes,...splitModes}))transformed[key]=[];
 for(let i=0;i<100;i++){
  const start=[10000,45000][g]+i*13;
  const a=words.slice(start,start+156);
  assert.equal(a.length,156);
  native.push(score(a));
  for(const [key,fn] of Object.entries({...modes,...splitModes}))transformed[key].push(score(fn(a)));
 }
 const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
 controls[name]={nativeMean:avg(native),transposedMeans:
  Object.fromEntries(Object.entries(transformed).map(([k,v])=>[k,avg(v)]))};
 assert.ok(controls[name].nativeMean>0);
 assert.ok(Object.values(controls[name].transposedMeans).every(v=>v<0));
});
const sourceWords=body;
const equalEdges=words=>words.slice(1).reduce((n,w,i)=>n+Number(words[i].slice(-1)===w[0]),0);
const repeatedWordEdges={
 original:equalEdges(sourceWords),
 ...Object.fromEntries(Object.entries(modes)
  .map(([key,fn])=>[key,equalEdges(fn(sourceWords))]))
};
assert.deepEqual(repeatedWordEdges,
 {original:2,asc_column:5,asc_row:3,desc_column:5,desc_row:6});
assert.equal(anyExceed,5035);
assert.deepEqual(exceed,{asc_column:12405,asc_row:12353,desc_column:1670,desc_row:8442});
console.log(JSON.stringify({
 input:"untouched 13-rune red heading + 156 complete original body words in LP2 p0–p2",
 titleIndices,bodyRunes:716,grid:[12,13],asc,desc,splitAsc,splitDesc,
 original,cases,splitCases,repeatedWordEdges,iterations,exceed,splitExceed,
 bestOfFourRandomUpperTail:(1+anyExceed)/(iterations+1),
 splitBestOfFourRandomUpperTail:(1+splitAnyExceed)/(iterations+1),
 controls,decision:"Source-keyed whole-word transpositions do not show selective GP-English word-order restoration; no unknown plaintext."
},null,2));
