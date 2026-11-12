"use strict";
/**
 * Original LP2 p2 / p23–26 binary SSSS six-share consistency gate.
 * Fully enumerates 10P6 historical decimal share-label assignments,
 * two uniform p23 lane directions, and two p2 directions.
 *
 * Depends on the existing exact enumerative GP29/SSSS implementation.
 * Run: node sims/lp2_p2_p23_ssss201_sixshare_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pack,gf,decodeDiffusion}=require("./lp2_p23_201_122byte_ssss_codec_sft.cjs");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"),"utf8"));
const field=gf(976,[17,10,6]);
const page2=corpus.pages[2].indices;
const section=corpus.pages.slice(23,27).flatMap(p=>p.indices);
assert.deepEqual(corpus.pages.slice(23,27).map(p=>p.indices.length),[213,270,273,265]);
assert.equal(page2.length,201);
assert.equal(section.length,1021);
const body=section.slice(16);
assert.equal(body.length,1005);
const strands=Array.from({length:5},(_,k)=>body.slice(k*201,(k+1)*201));
const repeatCount=a=>a.slice(1).reduce((n,v,i)=>n+Number(v===a[i]),0);
assert.deepEqual(strands.map(repeatCount),[1,4,3,2,1]);
assert.equal(repeatCount(page2),1);
const p2=[pack(page2).value,pack([...page2].reverse()).value];
const lanes={
  forward:strands.map(s=>pack(s).value),
  reverse:strands.map(s=>pack([...s].reverse()).value)
};
const choices5=[],choices6=[];
for(let a=1;a<=10;a++)for(let b=a+1;b<=10;b++)
for(let c=b+1;c<=10;c++)for(let d=c+1;d<=10;d++)
for(let e=d+1;e<=10;e++){
  choices5.push([a,b,c,d,e]);
  for(let f=e+1;f<=10;f++)choices6.push([a,b,c,d,e,f]);
}
assert.equal(choices5.length,252);
assert.equal(choices6.length,210);
function stats(buf){
  let printable=0,run=0,longest=0,gpBytes=0;
  for(const b of buf){
    const good=(b>=32&&b<=126)||b===9||b===10||b===13;
    if(good){printable++;run++;longest=Math.max(longest,run);}
    else run=0;
    if(b<29)gpBytes++;
  }
  return {printable,longest,gpBytes};
}
// The exact historical five-share inverse gives a binary output for
// every five-share selection. Its invertibility alone is no evidence.
let fiveCount=0,maxPrintable=0,maxLongest=0,highest=null;
const known={};
for(const ids of choices5)for(const [direction,ys] of Object.entries(lanes)){
  const secret=field.restore(ids.map(BigInt),ys);
  const bytes=decodeDiffusion(secret,122);
  const s=stats(bytes);
  fiveCount++;
  if(s.printable>maxPrintable){
    maxPrintable=s.printable;
    highest={ids,direction,...s,first16:bytes.subarray(0,16).toString("hex")};
  }
  maxLongest=Math.max(maxLongest,s.longest);
  if(ids.join(",")==="2,3,5,7,8"){
    known[direction]=bytes.subarray(0,16).toString("hex");
  }
}
assert.equal(fiveCount,504);
assert.equal(known.forward,"839dc666c476dd982cb521b25fe3c944");
assert.equal(known.reverse,"f34c85f94532b8b77de2ccbbd37d920f");
assert.equal(maxPrintable,63);
assert.equal(maxLongest,11);
assert.deepEqual(highest.ids,[3,4,5,6,7]);
assert.equal(highest.direction,"reverse");
// Let f(x)=x^5+a4*x^4+...+a0 in GF(2^976). For six distinct x_i,
// the fifth divided difference is one. Multiply its equation by the
// product D over all fifteen pairwise x_i XOR x_j differences.
// Coefficient B_i is the product of the ten differences excluding i.
// Six source objects are valid shares iff XOR_i B_i*y_i = D.
function coeff(xs){
  let D=1n;
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)
    D=field.mul(D,BigInt(xs[i]^xs[j]));
  const B=xs.map((_,k)=>{
    let v=1n;
    for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)
      if(i!==k&&j!==k)v=field.mul(v,BigInt(xs[i]^xs[j]));
    return v;
  });
  return {D,B};
}
// Synthetic native-field positive control, independent of LP2 text.
const controlIds=[1,2,3,5,7,10];
const control=coeff(controlIds);
const secret=0x8877665544332211n;
const ys=controlIds.map(x=>{
  let x5=1n;for(let j=0;j<5;j++)x5=field.mul(x5,BigInt(x));
  return secret^x5;
});
let positive=control.D;
for(let i=0;i<6;i++)positive^=field.mul(control.B[i],ys[i]);
assert.equal(positive,0n,"valid planted degree-five scheme must match");
// Enumerate the 6! assignments of the original six strings to each
// six-element subset of the historical identifiers 1..10.
const perms=[];
function rec(prefix,remaining){
  if(!remaining.length){perms.push(prefix);return;}
  for(let k=0;k<remaining.length;k++)
    rec([...prefix,remaining[k]],remaining.filter((_,j)=>j!==k));
}
rec([],[0,1,2,3,4,5]);
assert.equal(perms.length,720);
let tested=0,matches=0,low16Matches=0,low24Matches=0,maxLeadingZeroBits=0;
for(const ids of choices6){
  const {D,B}=coeff(ids);
  for(const group of Object.values(lanes))for(const additional of p2){
    const values=[...group,additional];
    const matrix=values.map(y=>B.map(b=>field.mul(y,b)));
    for(const perm of perms){
      let residual=D;
      for(let i=0;i<6;i++)residual^=matrix[perm[i]][i];
      tested++;
      if(residual===0n)matches++;
      if((residual&0xffffn)===0n)low16Matches++;
      if((residual&0xffffffn)===0n)low24Matches++;
      const leading=976-residual.toString(2).length;
      if(leading>maxLeadingZeroBits)maxLeadingZeroBits=leading;
    }
  }
}
assert.equal(tested,604800);
assert.equal(matches,0);
assert.equal(low16Matches,6);
assert.equal(low24Matches,0);
assert.equal(maxLeadingZeroBits,18);
console.log(JSON.stringify({
  source:"p2 and p23–26 original GP29, 6 x 201 runes",
  packing:"lossless predecessor-difference enumerative rank; <=7 repeats per lane",
  field:"GF(2^976), x^976+x^17+x^10+x^6+1, monic five-degree SSSS",
  fiveShare:{tested:fiveCount,maxPrintable,maxLongest,highest,known},
  sixShare:{idSets:choices6.length,assignmentsPerSet:perms.length,
    directions:4,tested,matches,low16Matches,low24Matches,
    maxLeadingZeroBits,syntheticControl:positive===0n},
  verdict:"No exact original six-share match in the frozen source-native family"
},null,2));
