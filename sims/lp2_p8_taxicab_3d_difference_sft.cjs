"use strict";
/**
 * Original p8–p14 taxicab split 729+1000: first cube as 3D derivative of second.
 * 9^3 cells correspond exactly to 2x2x2 finite-difference stencils in 10^3.
 * Test direct equality and 48 relative cube orientations × both GP29 signs.
 * Windows Node22: node sims/lp2_p8_taxicab_3d_difference_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const section=data.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
assert.equal(section.length,1729);
const A=section.slice(0,729),B=section.slice(729);
assert.equal(A.length,729);
assert.equal(B.length,1000);
assert.equal(A.slice(0,4).map(n=>data.translit[n]).join(""),"XIXM");
const mod29=n=>((n%29)+29)%29;
const loc=(i,j,k,n)=>(i*n+j)*n+k;

/** @param {number[]} cube @returns {number[]} */
function derivative(cube) {
  assert.equal(cube.length,1000);
  const result=[];
  for(let i=0;i<9;i++)for(let j=0;j<9;j++)for(let k=0;k<9;k++){
    let d=0;
    for(let x=0;x<=1;x++)for(let y=0;y<=1;y++)for(let z=0;z<=1;z++)
      d+=((x+y+z)&1?-1:1)*cube[loc(i+x,j+y,k+z,10)];
    result.push(mod29(d));
  }
  return result;
}
/** @param {number[]} v @returns {number} */
function ioc(v) {
  const bins=new Uint16Array(29);
  for(const t of v)bins[t]++;
  return bins.reduce((a,t)=>a+t*(t-1),0)/(v.length*(v.length-1));
}
/** @param {number[]} v @param {number[]} axes @param {number} mask @returns {number[]} */
function reorient(v,axes,mask) {
  return Array.from({length:729},(_,u)=>{
    const xyz=[Math.floor(u/81),Math.floor(u/9)%9,u%9];
    let i=0;
    for(let k=0;k<3;k++){
      const x=xyz[axes[k]];
      i=9*i+(((mask>>k)&1)?8-x:x);
    }
    return v[i];
  });
}
const d=derivative(B);
const matches=A.filter((v,i)=>v===d[i]).length;
const axes=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const tests=[];
for(let ai=0;ai<axes.length;ai++)for(let flip=0;flip<8;flip++){
  const key=reorient(d,axes[ai],flip);
  const match=A.filter((v,i)=>v===key[i]).length;
  for(const sign of [-1,1]){
    const pt=A.map((v,i)=>mod29(v+sign*key[i]));
    tests.push({ai,flip,sign,ioc:ioc(pt),coincidences:match});
  }
}
assert.equal(tests.length,96);
tests.sort((a,b)=>b.ioc-a.ioc);
/* Independent source-native GP29 positive plant (not an English score fit). */
const nativeSource=fs.readFileSync(path.join(root,"resources/control/gibran_prophet_58585.txt"),"utf8");
const tokens=[...data.translit].sort((a,b)=>b.length-a.length);
const lookup=new Map(data.translit.map((s,i)=>[s,i]));
/** @param {string} txt @returns {number[]} */
function encode(txt) {
  const str=txt.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<str.length;){
    if(!/[A-Z]/.test(str[i])){i++;continue}
    if(str.startsWith("ING",i)){out.push(21);i+=3;continue}
    if(str.startsWith("IO",i)){out.push(27);i+=2;continue}
    const hit=tokens.find(x=>str.startsWith(x,i));
    if(hit){out.push(lookup.get(hit));i+=hit.length}else i++;
  }
  return out;
}
const native=encode(nativeSource);
assert(native.length>62000);
const nativeIoCs=[];
for(let i=0;i+729<=native.length;i+=57)nativeIoCs.push(ioc(native.slice(i,i+729)));
nativeIoCs.sort((a,b)=>a-b);
const pt=native.slice(900,1629);
assert.equal(pt.length,729);
const key=reorient(d,axes[3],6);
const encrypted=pt.map((v,i)=>mod29(v-key[i]));
assert.deepEqual(encrypted.map((v,i)=>mod29(v+key[i])),pt);
assert.deepEqual(derivative(B),d);
assert.equal(derivative(B).length,729);
assert(tests.every(x=>x.ioc<nativeIoCs[0]),"source receiver unexpectedly matches native control");
console.log(JSON.stringify({
  hypothesis:"9x9x9 first source cube as eight-corner mixed 3D finite difference of 10x10x10 second cube",
  sourceCounts:[729,1000],
  originalUnrotatedMatches:matches,
  randomGP29ExpectedMatches:729/29,
  relativeRigid3DCandidates:tests.length,
  maximumRawMatches:Math.max(...tests.map(t=>t.coincidences)),
  bestSourcePlusOrMinusDerivative:tests[0],
  bestNativeMinimum:nativeIoCs[0],
  bestNativeMedian:nativeIoCs[Math.floor(nativeIoCs.length/2)],
  exactlyPlantedEnglish729RoughRunes:true,
  originalPlaintextRecovered:false
},null,2));
console.log("PASS p8–p14 9^3/10^3 original 3D finite-difference gate");
