"use strict";

/**
 * Terminal 256-cell four-ring, all-secret additive LFSR rank gate.
 *
 * SFT: node sims/lp2_terminal256_inner_lfsr_sft.cjs
 *
 * Hypothesis: table bytes mod 29 contribute directly to the output glyphs,
 * but a shared linear recurrence supplies the missing additive GP29 mask.
 * Exact independent p56/p57 plaintext fixes its 180 inner positions.
 *
 * The one source-motivated recurrence is the degree-four product of the
 * signed 2013 BASE29-example quadratic H and the original p39 red triad G.
 * The all-secret Berlekamp-Massey computation goes further: it determines
 * the minimum order of *any* additive GF29 LFSR, for every 512 original
 * independent-ring corner/winding assignments.
 *
 * Results are conditional on the speculative 256-cell terminal layout and
 * conventional base60 table bytes. No source instructs this cipher inverse.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname,"..");
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const db = read("resources/liber-primus/lp2-corpus.json");
const bytes = read("resources/liber-primus/lp2-grid-256.json").bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
 "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const Q=29;
/** @param {number} x */
const mod=x=>((x%Q)+Q)%Q;
const inverses=Array.from({length:Q},(_,x)=>{
 if(!x)return 0;
 for(let y=1;y<Q;y++)if(x*y%Q===1)return y;
 throw Error("Noninvertible nonzero GF29 value");
});
/** @param {number} n */
function primes(n) {
 const out=[];
 for(let x=2;out.length<n;x++) {
  let prime=true;
  for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}
  if(prime)out.push(x);
 }
 return out;
}
const pp=primes(100);
let pi=0;
const p55=db.pages[55].indices;
const p56=db.pages[56].indices;
const p57=db.pages[57].indices;
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const plain56=p56.map((c,i)=>i===56?0:mod(c-pp[pi++]+1));
assert.equal(pi,84);
const known=plain56.concat(p57);
assert.equal(known.length,180);

/** Berlekamp-Massey returns exact finite-sequence LFSR minimum order.
 * @param {number[]} s
 */
function berlekampMassey(s) {
 let C=[1],B=[1],L=0,m=1,b=1;
 for(let n=0;n<s.length;n++){
  let delta=s[n];
  for(let i=1;i<=L;i++)delta=mod(delta+(C[i]||0)*s[n-i]);
  if(delta===0){m++;continue;}
  const old=C.slice(),factor=mod(delta*inverses[b]);
  for(let i=0;i<B.length;i++)C[i+m]=mod((C[i+m]||0)-factor*B[i]);
  if(2*L<=n){
   L=n+1-L;B=old;b=delta;m=1;
  }else m++;
 }
 return {order:L,coefficients:C.slice(0,L+1)};
}
const rings=[];
for(let d=0;d<4;d++){
 const ring=[];
 for(let x=d;x<=7-d;x++)ring.push(8*d+x);
 for(let y=d+1;y<=31-d;y++)ring.push(8*y+7-d);
 for(let x=6-d;x>=d;x--)ring.push(8*(31-d)+x);
 for(let y=30-d;y>d;y--)ring.push(8*y+d);
 rings.push(ring);
}
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
const corners=[[0,0],[0,7],[31,7],[31,0]];
const routes=[[],[],[],[]];
for(let d=1;d<4;d++){
 const ring=rings[d];
 for(let corner=0;corner<4;corner++)for(const dir of [-1,1]){
  const [y0,x0]=corners[corner];
  const y=Math.max(d,Math.min(31-d,y0));
  const x=Math.max(d,Math.min(7-d,x0));
  const start=ring.indexOf(y*8+x);
  assert.ok(start>=0);
  routes[d].push(ring.map((_,i)=>
   ring[(start+dir*i+ring.length*2)%ring.length]));
 }
}
// F=H*G, source-printed ascending powers 23+21X+11X²+17X³+12X⁴.
// Its monic form is [14,9,13,28,1]. Both conventions are checked.
const F=[14,9,13,28,1];
const FR=[1,28,13,9,14];
function recurrenceViolations(s,coefficients) {
 let failures=0;
 for(let i=0;i+coefficients.length<=s.length;i++){
  if(mod(coefficients.reduce((sum,c,j)=>sum+c*s[i+j],0))!==0)failures++;
 }
 return failures;
}
// Plant a 4-state GF29 recurrence chosen by the independently printed F.
const plant=[3,18,24,7];
while(plant.length<180) {
 const n=plant.length-4;
 const val=mod(-F.slice(0,4).reduce((sum,c,j)=>sum+c*plant[n+j],0));
 plant.push(val);
}
assert.equal(recurrenceViolations(plant,F),0);
assert.equal(berlekampMassey(plant).order,4);
const planted=plant.map((x,i)=>mod(x+bytes[routes[1][0].concat(
 routes[2][0],routes[3][0])[i]]));
assert.deepEqual(planted.map((p,i)=>mod(p-bytes[routes[1][0].concat(
 routes[2][0],routes[3][0])[i]])),plant);

const histogram=new Map();
let minimumOrder=Infinity,bestRoute=null;
let minSourceFail=Infinity,minSourceReversedFail=Infinity;
let exactSource=0,tests=0;
for(let a=0;a<8;a++)for(let b=0;b<8;b++)for(let c=0;c<8;c++){
 const route=routes[1][a].concat(routes[2][b],routes[3][c]);
 assert.equal(new Set(route).size,180);
 const stream=route.map((pos,i)=>mod(known[i]-bytes[pos]));
 const L=berlekampMassey(stream).order;
 histogram.set(L,(histogram.get(L)||0)+1);
 if(L<minimumOrder){minimumOrder=L;bestRoute=[a,b,c];}
 const forwardFail=recurrenceViolations(stream,F);
 const backwardFail=recurrenceViolations(stream,FR);
 minSourceFail=Math.min(minSourceFail,forwardFail);
 minSourceReversedFail=Math.min(minSourceReversedFail,backwardFail);
 if(!forwardFail)exactSource++;
 tests++;
}
assert.equal(tests,512);
assert.equal(minimumOrder,89);
assert.deepEqual(bestRoute,[0,5,7]);
assert.deepEqual([...histogram.entries()].sort((a,b)=>a[0]-b[0]),
 [[89,1],[90,497],[91,14]]);
assert.equal(minSourceFail,160);
assert.equal(minSourceReversedFail,164);
assert.equal(exactSource,0);
process.stdout.write(JSON.stringify({
  sourceFile:"resources/liber-primus/lp2-grid-256.json",
  knownPlain:180,ringOrientations:tests,minimumOrder,bestRoute,
  histogram:Object.fromEntries([...histogram].sort((a,b)=>a[0]-b[0])),
  sourceProductMonicF:F,sourceProductReverse:FR,
  degreeFourMinViolation:{source:minSourceFail,reverse:minSourceReversedFail,
    possibleEquations:176},
  syntheticDegreeFourPlant:{length:plant.length,
    order:berlekampMassey(plant).order,errors:recurrenceViolations(plant,F)}
 },null,2)+"\n");
