"use strict";
/**
 * SFT: independently check all 38 published 27x27 selected routes on
 * the unmodified, canonical LP2 physical pages 0-2.
 * Node 22 / CommonJS; no network, no dependencies, no file writes.
 * Source of numerical route selections (not code):
 * https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
 * External main snapshot inspected: f2090da0a4470a3fec648a684171b452a9ada3ae
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const c=data.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(c.length,729);
const sources=[
"334,335,336","354,355,356","103,373,643","666,693,720","331,385,439","636,663,690",
"474,501,528","201,285,369","397,449,501","474,501,528","501,605,709","556,561,566",
"501,605,709","649,653,657","123,420,717","392,527,651,654,655,657,661,662,667",
"669,696,723","448,529,610","285,312,339","434,440,446","132,213,294","121,310,499",
"280,448,616","273,354,435","144,340,536","485,511,537","594,621,648","386,413,440",
"282,363,444","365,521,677","158,262,366","351,357,363","228,232,236","556,561,566",
"69,181,293","324,334,344","94,150,206","282,309,336"];
const paths=[
"348,349,350,351,352,353,354","364,365,366,367,368","369,342,315,288,261",
"357,330,303,276","693,692,691,690","501,474,447","285,313,341,369,397","397,423,449",
"473,474","502,501","508,535,562","548,549","677,676,675","663,689,715","719,691,663",
"663,664,665,666","672,673,674","587,559","543,516,489","465,491","231,205","235,236",
"319,318","234,233","374,400,426","146,174","524,525","496,470,444,418,392,366,340",
"469,470,471","659,685","280,281","252,278,304","314,313","145,146,147","163,189",
"702,703","568,567","124,151,178,205"];
const keys=[
"AE I EA","X X I","H NG C","U H H","NG T NG","G E E","OE OE I","U A A",
"J OE J","OE OE I","J J T","TH H H","J J T","EA I EA","TH P P","EA L R",
"E IA IA","N E N","R TH TH","R W W","X E X","TH TH TH","G D D","X S L",
"O D E","H H H","J TH U","X I EO","T I AE","P S C","NG A EO","G OE TH",
"C AE R","TH H H","Y Y G","C L AE","X J B","T M EA"];
// GP transliteration uses C for the ambiguous C/K rune (KEY -> CEY, ASK -> ASC).
const expected=[
"ASIGOTHE","WEATHER","TURNS","COLD","IMAY","CRY","NOWTHE","IDEA","OF","THE",
"END","IS","DEATH","SEE","YOU","SOON","THEN","THE","CEY","IS","TO","GO","TO","THE",
"EAST","OF","THE","MAPLIFE","MAY","BE","THE","DEATH","OF","YOU","GO","DO","AS","IASC"];
const parse=s=>s.split(",").map(Number);
function phi(n){
  assert.ok(Number.isInteger(n)&&n>0);
  let total=n,rest=n;
  for(let p=2;p*p<=rest;p++)if(rest%p===0){
    while(rest%p===0)rest/=p;
    total-=total/p;
  }
  if(rest>1)total-=total/rest;
  return total;
}
function mu(n){
  assert.ok(Number.isInteger(n)&&n>0);
  let rest=n,sign=1;
  for(let p=2;p*p<=rest;p++)if(rest%p===0){
    rest/=p;sign=-sign;
    if(rest%p===0)return 0;
  }
  return rest>1?-sign:sign;
}
function geometry(a){
  const r=a.map(x=>Math.floor(x/27)),col=a.map(x=>x%27);
  return r[0]+r[2]===2*r[1]&&col[0]+col[2]===2*col[1]&&
  (r[0]===r[1]||col[0]===col[1]||Math.abs(r[1]-r[0])===Math.abs(col[1]-col[0]));
}
function candidateNodes(marked,key){
  const matches=[];
  for(let i=0;i<marked.length;i++)
  for(let j=i+1;j<marked.length;j++)
  for(let k=j+1;k<marked.length;k++){
    const a=[marked[i],marked[j],marked[k]];
    if(!geometry(a))continue;
    for(const reverse of [false,true])for(const transform of [false,true]){
      const raw=a.map(x=>c[x]);
      if(reverse)raw.reverse();
      if(transform)raw[1]=phi(raw[1]);
      if(raw.some(x=>x===0))continue;
      const phase=((raw.reduce((s,x)=>s+mu(phi(x)),0)%3)+3)%3;
      const aligned=raw.slice(phase).concat(raw.slice(0,phase));
      if(aligned.every((x,n)=>x===key[n]))matches.push({a,reverse,transform,phase});
    }
  }
  return matches;
}
const uses=new Map(),prefix=new Set();
let reads=0,sourceChoices=0;
for(let n=0;n<38;n++){
  const spots=parse(paths[n]),marked=parse(sources[n]);
  const key=keys[n].split(" ").map(x=>data.translit.indexOf(x));
  assert.ok(key.length===3&&key.every(x=>x>=0));
  for(const q of [...spots,...marked])assert.ok(Number.isInteger(q)&&q>=0&&q<729);
  const sourceCandidates=candidateNodes(marked,key);
  assert.ok(sourceCandidates.length>0,"source key mismatch at block "+(n+1));
  const distinct=new Set(sourceCandidates.map(x=>x.a.join(",")));
  if(distinct.size>1)sourceChoices++;
  const plaintext=spots.map((q,j)=>(c[q]-key[j%3]+29)%29);
  assert.equal(plaintext.map(x=>data.translit[x]).join(""),expected[n],"plaintext mismatch at block "+(n+1));
  for(let j=0;j<spots.length;j++){
    const pos=spots[j];
    assert.equal((plaintext[j]+key[j%3])%29,c[pos]);
    if(!uses.has(pos))uses.set(pos,[]);
    uses.get(pos).push([n+1,plaintext[j]]);
    if(n<17)prefix.add(pos);
  }
  reads+=spots.length;
  console.log(String(n+1).padStart(2,"0"),expected[n],"length",spots.length,"key-node-options",distinct.size);
}
const repeats=[...uses].filter(([,a])=>a.length>1);
const conflicts=repeats.filter(([,a])=>new Set(a.map(t=>t[1])).size>1);
assert.equal(reads,115);
assert.equal(uses.size,103);
assert.equal(prefix.size,54);
assert.equal(repeats.length,11);
assert.equal(conflicts.length,9);
assert.equal(sourceChoices,1);
console.log("First 17: 61 readings / 54 unique positions");
console.log("All 38: 115 readings / 103 unique positions, 11 reused cells, 12 extra reads");
console.log("Conflicting plaintext assignments:",conflicts.length);
for(const [pos,assigned] of conflicts)console.log(
  "(",Math.floor(pos/27)+1,",",pos%27+1,")",
  assigned.map(x=>x[0]+":"+data.translit[x[1]]).join(" "));

// Source-constrained first-key ambiguity: actual page-0 red 13-rune heading
// gives (13, phi(13)) or its axis-transposed coordinate (12,13).
// Even granting radius one and the external phase-zero opening, it does not
// uniquely select the original HORIZONTAL node or center-transform choice.
const ink=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources","liber-primus","lp2-ink-annotations.json"),"utf8"));
const redCount=ink.pages.find(x=>x.page===0).red_spans[0].length;
assert.equal(redCount,13);
const anchor=phi(redCount);
assert.equal(anchor,12);
const firstCandidates=[];
for(const [cy,cx] of [[redCount,anchor],[anchor,redCount]]) {
  for(const [axis,dr,dc] of [["H",0,1],["V",1,0],["NWSE",1,1],["NESW",1,-1]]) {
    const pts=[-1,0,1].map(t=>(cy+t*dr-1)*27+cx+t*dc-1);
    const source=pts.map(i=>c[i]);
    for(const transform of [false,true]) {
      const key=source.slice();
      if(transform)key[1]=phi(key[1]);
      if(key.some(n=>n===0))continue;
      const phase=((key.reduce((s,x)=>s+mu(phi(x)),0)%3)+3)%3;
      if(phase!==0)continue;
      const word=parse(paths[0]).map((p,j)=>
        data.translit[(c[p]-key[j%3]+29)%29]).join("");
      firstCandidates.push({center:[cy,cx],axis,transform,word,key});
    }
  }
}
assert.equal(firstCandidates.length,5);
assert.equal(new Set(firstCandidates.map(x=>x.word)).size,5);
assert.equal(firstCandidates.filter(x=>x.word==="ASIGOTHE").length,1);
assert.ok(firstCandidates.some(x=>x.center[0]===12&&x.center[1]===13
  &&x.axis==="V"&&!x.transform&&x.key.join(",")==="16,19,28"));
console.log("Source-constrained first-key ambiguity:",firstCandidates);

console.log("PASS: conditional inverse, positive source-triple check and exact forward re-encryption.");
console.log("No source-prospective selector or authentic plaintext established.");
