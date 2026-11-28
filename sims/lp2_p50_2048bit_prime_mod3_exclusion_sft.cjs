"use strict";
/** SFT: every ordering of the 256 p50 decoded bytes is composite mod3. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const tokens=grid.pages.flatMap(p=>p.tokens),base60=grid.pages.flatMap(p=>p.bytes);
assert.equal(tokens.length,256);assert.equal(base60.length,256);
const a60="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const a59=a60.replace("f","");
function decode(t,a){const x=a.indexOf(t[0]),y=a.indexOf(t[1]);assert.ok(x>=0&&y>=0,t);return a.length*x+y;}
const base59=tokens.map(t=>decode(t,a59));
function check(name,xs,expectedSum,expectedMax){
 assert.equal(xs.length,256);assert.equal(Math.min(...xs),0);assert.equal(Math.max(...xs),expectedMax);
 assert.ok(xs.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
 const sum=xs.reduce((a,b)=>a+b,0);assert.equal(sum,expectedSum);assert.equal(sum%3,0);
 assert.equal(new Set(xs).size,161);
 // For any permutation pi: N=sum_i b_pi(i)*256^i == sum(bytes) mod3 since 256==1 mod3.
 assert.equal(256%3,1);
 // Check representative traversals as an implementation sanity check; theorem covers all 256!.
 for(const ys of [xs,[...xs].reverse(),xs.filter((_,i)=>i%2===0).concat(xs.filter((_,i)=>i%2===1))]){
   let r=0,p=1;for(const b of ys){r=(r+b*p)%3;p=p*(256%3)%3;}assert.equal(r,0);
 }
 return {name,min:0,max:expectedMax,sum,mod3:0,distinct:161};
}
const out=[check("base60",base60,33006,255),check("base59",base59,32499,251)];
console.log(JSON.stringify({codecs:out,theorem:"N mod3 = byte-sum mod3 for every byte permutation because 256 mod3 = 1",decision:"all 256-byte orderings are divisible by3; no byte-order DH/safe prime"},null,2));
