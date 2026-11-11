"use strict";
/**
 * Original-source generative test: PARABLE residues [361,133,331] = 
 * [19^2,7*19,p_(p_19)] select the 7x7 square center, 2014 HTML pair,
 * and first LP2 red heading 662=2*331.
 * Run Node.js 22: node sims/onion7_parable19_nestedprime_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
/** @param {number} count @returns {number[]} */
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let yes=true;for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break;}
    if(yes)out.push(n);
  }
  return out;
}
/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function main(){
  const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const html=read("resources/cicada2014-onion7-index.html");
  const title=Number(html.match(/<title>(\d+)<\/title>/)[1]);
  const div=Number(html.match(/<div id="(\d+)">/)[1]);
  assert.deepEqual([title,div],[133,331]);

  const runePrime=new Map(c.runes.map((r,i)=>[r,c.prime[i]]));
  const transcript=read("resources/lp2-transcription.txt").split("%");
  assert.equal(transcript.length,57);
  const clauses=transcript[56].split(".")
    .map(t=>[...t].filter(ch=>runePrime.has(ch)))
    .filter(r=>r.length>0);
  assert.deepEqual(clauses.map(x=>x.length),[7,30,30,28]);
  const sums=clauses.map(runes=>runes.reduce((s,r)=>s+runePrime.get(r),0));
  assert.deepEqual(sums,[449,1259,1031,1229]);
  const residual=sums.slice(1).map(x=>x%sums[0]);
  assert.deepEqual(residual,[361,133,331]);

  const blocks=read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  assert.equal(blocks.length,3);
  const squares=blocks.map(b=>b.trim().split(/\r?\n/)
    .map(line=>line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map(x=>x.length),[5,7,5]);
  assert.deepEqual(squares.map(a=>a[Math.floor(a.length/2)][Math.floor(a.length/2)]),
    [809,331,91]);

  const common=gcd(residual[0],residual[1]);
  assert.equal(common,19);
  assert.equal(common**2,residual[0]);
  const order=residual[1]/common;
  assert.equal(order,7);
  const matches=squares.filter(a=>a.length===order);
  assert.equal(matches.length,1);
  const center=matches[0][Math.floor(order/2)][Math.floor(order/2)];
  assert.equal(center,residual[2]);
  assert.equal(center,div);
  assert.equal(common*order,title);

  const p=primes(464);
  assert.equal(p[18],67);
  assert.equal(p[p[18]-1],331);
  assert.equal(p[463],3301);
  assert.equal(title+div,464);
  // The first input can also be predicted without looking at PARABLE:
  // HTML title / earlier unique square order => 19 => 19^2 = 361.
  assert.equal((title/order)**2,residual[0]);
  assert.equal(p[p[title/order-1]-1],div);

  const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const red0=ink.pages.find(x=>x.page===0).red_spans.find(x=>
    x.start===0&&x.length===13);
  assert.ok(red0);
  const redIndices=c.pages.find(x=>x.page===0).indices
    .slice(red0.start,red0.start+red0.length);
  assert.equal(redIndices.reduce((s,i)=>s+c.prime[i],0),662);
  assert.equal(662,2*div);

  assert.equal(c.translit[c.prime.indexOf(19)],"W");
  console.log(JSON.stringify({
    sources:["2014 seventh-onion delivery HTML", "three OpenPuff magic squares",
      "solved original LP2 p57 PARABLE", "original LP2 p0 red-ink span"],
    parableHeadingPrimeSum:sums[0],bodyGPPrimeSums:sums.slice(1),
    bodyResiduals:residual,
    generativeCandidate:{commonFactor:common,first:common**2,
      order:order,second:common*order,
      prime19:p[18],doublePrime19:p[p[18]-1],third:center,
      sourceHtml:{title,div},squareIndex:1,squareCenter:center},
    additionalOriginalCiphertextNumerology:{p0RedHeadingRunes:red0.length,
      gpPrimeSum:662,ratioToHtmlDiv:2},
    independentPredictionsAfterSelection:"Conditional algebraic fit; " +
      "no authored operation, unknown plaintext, or cryptographic key established."
  },null,2));
}
if(require.main===module)main();
module.exports={main,gcd,primes};
