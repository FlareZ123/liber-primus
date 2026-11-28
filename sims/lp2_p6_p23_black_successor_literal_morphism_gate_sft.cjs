"use strict";
/** SFT: reject literal one-field p6-successor -> p23-successor H morphism. */
const assert=require("node:assert/strict"),m=x=>((x%29)+29)%29,half=15;
const S=[6,9,28,25,6,21,23],T=[28,6,15,25,13,7,19,28];
const atoms=[1,2,3,4,5,6,8,20,23];
function Hout(v){const o=[];for(let i=0;i<Math.floor(v.length/2);i++)o.push(m(v[i]-v[v.length-1-i]),m(v[i]+v[v.length-1-i]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;}
function HoutInv(v){const odd=v.length%2,p=odd?v.slice(0,-1):v,left=[],right=[];for(let i=0;i<p.length;i+=2){left.push(m(half*(p[i]+p[i+1])));right.push(m(half*(p[i+1]-p[i])));}return left.concat(odd?[v[v.length-1]]:[],right.reverse());}
function Hadj(v){assert.equal(v.length%2,0);const o=[];for(let i=0;i<v.length;i+=2)o.push(m(v[i]-v[i+1]),m(v[i]+v[i+1]));return o;}
function HadjInv(v){assert.equal(v.length%2,0);const o=[];for(let i=0;i<v.length;i+=2)o.push(m(half*(v[i]+v[i+1])),m(half*(v[i+1]-v[i])));return o;}
const seven={
 raw:S,
 reverse:[...S].reverse(),
 H:Hout(S),
 Hreverse:Hout([...S].reverse()),
 Hinv:HoutInv(S),
 HinvReverse:HoutInv([...S].reverse())
};
for(const v of Object.values(seven))assert.deepEqual(HoutInv(Hout(v)),v);
const eightFns={
 direct:v=>v,
 reverse:v=>[...v].reverse(),
 H:v=>Hout(v),
 Hreverse:v=>Hout([...v].reverse()),
 Hinv:v=>HoutInv(v),
 HinvReverse:v=>HoutInv([...v].reverse()),
 Hadj:v=>Hadj(v),
 HadjReverse:v=>Hadj([...v].reverse()),
 HadjInv:v=>HadjInv(v),
 HadjInvReverse:v=>HadjInv([...v].reverse()),
 halfSwap:v=>v.slice(4).concat(v.slice(0,4)),
 halfSwapReverse:v=>{const r=[...v].reverse();return r.slice(4).concat(r.slice(0,4));}
};
let tested=0;const hits=[];
for(const [sourcePresentation,sv] of Object.entries(seven))
 for(const atom of atoms)
  for(let pos=0;pos<8;pos++){
   const inserted=sv.slice(0,pos).concat([atom],sv.slice(pos));
   for(const [targetPresentation,fn] of Object.entries(eightFns)){
    tested++;const out=fn(inserted);
    if(out.every((x,i)=>x===T[i]))hits.push({sourcePresentation,atom,pos,targetPresentation});
   }
  }
assert.equal(tested,5184);assert.deepEqual(hits,[]);
console.log(JSON.stringify({source:S,target:T,atoms,sevenPresentations:Object.keys(seven),eightPresentations:Object.keys(eightFns),tested,hits,decision:"literal one-field insertion plus small H presentation family rejected"},null,2));
