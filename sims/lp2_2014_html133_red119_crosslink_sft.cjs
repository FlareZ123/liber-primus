"use strict";
/**
 * Archived 2014 delivery HTML versus red119 prime-sum navigation:
 * an exact source-crosslink with a bounded authentic p56 cipher-consumer gate.
 * One-file Node.js 22 CommonJS SFT. Read-only, no third-party packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const get=p=>fs.readFileSync(path.join(root,p),"utf8");
const html=get("resources/cicada2014-onion7-index.html");
const squares=get("resources/cicada2014-openpuff-magic-squares.txt");
const ink=JSON.parse(get("resources/liber-primus/lp2-ink-annotations.json"));
const canon=JSON.parse(get("resources/liber-primus/lp2-corpus.json"));
assert.match(html,/<title>133<\/title>/);
assert.match(html,/<div id="331">/);
assert.equal((html.match(/<img src="\d+\.jpg" \/>/g)||[]).length,58);
const matrix=squares.trim().split(/\r?\n\s*\r?\n/).map(block=>
  block.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrix.map(q=>q.length),[5,7,5]);
assert.equal(matrix[1][3][3],331);
const weights=new Map(canon.runes.map((glyph,i)=>[glyph,canon.prime[i]]));
const spans=ink.pages.flatMap(p=>(p.red_spans||[]).map(s=>({
  page:p.page,start:s.start,length:s.length,runes:s.runes,
  sum:[...s.runes].reduce((sum,glyph)=>sum+weights.get(glyph),0)
})));
assert.equal(spans.length,18);
const selected=spans.filter(s=>s.length===3&&s.start===119);
assert.deepEqual(selected.map(s=>[s.page,s.sum,s.sum-s.page-1]),
  [[3,137,133],[39,173,133]]);
assert.deepEqual(spans.filter(s=>s.sum-s.page-1===133),selected);
const title=Number(html.match(/<title>(\d+)<\/title>/)[1]);
const ident=Number(html.match(/<div id="(\d+)"/)[1]);
assert.equal(title,133);assert.equal(ident,331);
assert.equal(Number(String(ident).split("").reverse().join("")),title);
let primeList=[];
for(let x=2;primeList.length<1000;x++){
  let prime=true;
  for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}
  if(prime)primeList.push(x);
}
assert.equal(primeList[66],331);
/**
 * Exact solved-page-56 F-transparent additive prime-totient feasibility.
 * All literal-F/consumed-key branches are retained without any beam pruning.
 * @param {number[]} ciphertext
 * @param {number} rank One-based starting-prime rank
 * @param {-1|1} sign Encryption sign
 * @returns {{feasible:boolean,firstImpossible:number,states:number}}
 */
function legal(ciphertext,rank,sign){
  let counts=new Set([0]);
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set();
    for(const count of counts){
      const c=ciphertext[i],shift=(primeList[rank-1+count]-1)%29;
      if(c===0)next.add(count);
      if((c-sign*shift+58)%29!==0)next.add(count+1);
    }
    counts=next;
    if(!counts.size)return {feasible:false,firstImpossible:i,states:0};
  }
  return {feasible:true,firstImpossible:ciphertext.length,states:counts.size};
}
assert.equal(legal(canon.pages[56].indices,1,1).feasible,true);
const testRanks=[67,133,331],tests=[];
for(const page of [33,40])for(const rank of testRanks)
  for(const sign of [-1,1])tests.push({
    page,rank,sign,...legal(canon.pages[page].indices,rank,sign)});
assert.deepEqual(tests.map(t=>t.firstImpossible),
  [1,41,180,32,69,54,72,84,83,28,43,33]);
assert(tests.every(t=>!t.feasible));
console.log(JSON.stringify({
  primary2014HTML:{title,divId:ident,center2014SevenSquare:matrix[1][3][3],
    divIdPrimeOrdinal:67,bookImages:58},
  printedRed:{totalSpans:spans.length,isolatedOffset119Triples:selected,
    exactPageAdjustedMatches:2},
  exactHistoricallySolvedRuleControl:{page56Feasible:true},
  consumerScope:"p33 and p40, 67th/133rd/331st prime starts, signs ±1",
  allTwelveOriginalFTransparentPrimeTotientConsumers:tests,
  conclusion:"Cross-stage 133 relation survives; this direct cipher consumer fails"
},null,2));
console.log("PASS: authenticated-stage numeric artifacts and source-derived consumer");
