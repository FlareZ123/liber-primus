"use strict";
/**
 * Source-native GP29 terminal GF257 76-erasure spiral SFT.
 * Run: node sims/lp2_terminal256_ring_gf257_erasure_sft.cjs
 */
const a=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const g=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const m=x=>((x%257)+257)%257;
/** @param {number} x @param {number} e @returns {number} */
function pow(x,e){let v=1;for(;e;e=Math.floor(e/2),x=m(x*x))if(e%2)v=m(v*x);return v}
/** @param {number} d @returns {number[]} */
function ring(d){let t=d,l=d,b=31-d,r=7-d,o=[];for(let x=l;x<=r;x++)o.push(t*8+x);for(let y=t+1;y<=b;y++)o.push(y*8+r);for(let x=r-1;x>=l;x--)o.push(b*8+x);for(let y=b-1;y>t;y--)o.push(y*8+l);return o}
/** @param {number} d @param {number} corner @param {number} dir @returns {number[]} */
function orient(d,corner,dir){let o=ring(d),q=[d*8+d,d*8+7-d,(31-d)*8+7-d,(31-d)*8+d],j=o.indexOf(q[corner]);a(j>=0);return o.map((_,i)=>o[(j+dir*i+o.length*2)%o.length])}
/** @param {number[]} xs @param {number[]} ys @param {number[]} miss @returns {number[]} */
function interp(xs,ys,miss){a.equal(xs.length,180);a.equal(ys.length,180);let w=xs.map((x,j)=>{let z=1;for(let k=0;k<180;k++)if(j!==k)z=m(z*m(x-xs[k]));return pow(z,255)});return miss.map(x=>{let p=1,v=0;for(let j=0;j<180;j++){let d=m(x-xs[j]);p=m(p*d);v=m(v+m(ys[j]*w[j])*pow(d,255))}return m(p*v)})}
/** @param {number[]} v @param {number} x @returns {number} */
function evalPoly(v,x){let z=0;for(let j=v.length-1;j>=0;j--)z=m(z*x+v[j]);return z}
a.equal(g.bytes.length,256);a.deepEqual([0,1,2,3].map(r=>ring(r).length),[76,68,60,52]);
const p55=c.pages.find(p=>p.page===55).indices,p56c=c.pages.find(p=>p.page===56).indices,p57=c.pages.find(p=>p.page===57).indices;
a.deepEqual([p55.length,p56c.length,p57.length],[76,85,95]);let ps=[];for(let z=2;ps.length<85;z++)if(ps.every(q=>z%q!==0))ps.push(z);
let clock=0,p56=p56c.map((z,i)=>i===56?0:((z-ps[clock++]+1)%29+29)%29);
a.equal(clock,84);a.equal(p56.slice(0,12).map(x=>c.translit[x]).join(""),"ANENDWITHINTHE");
let cases=0,maximum=[0,0,0],canonical=[];
for(const [register,known] of Object.entries({plain:p56.concat(p57),printed:p56c.concat(p57)}))for(let corner=0;corner<4;corner++)for(let direction of [1,-1])for(let innerReversed of [false,true]){
 let xs=(innerReversed?[3,2,1]:[1,2,3]).flatMap(d=>orient(d,corner,direction)),outer=orient(0,corner,direction),p=interp(xs,known,outer);
 let counts=[p.filter(v=>v<29).length,p.filter((v,i)=>v===p55[i]).length,p.filter((v,i)=>v%29===p55[i]).length];cases++;counts.forEach((z,i)=>maximum[i]=Math.max(z,maximum[i]));
 if(corner===0&&direction===1&&!innerReversed){canonical.push({register,counts});if(register==="plain"){let code=Array.from({length:256},(_,x)=>evalPoly(known,x));a.deepEqual(interp(xs,xs.map(x=>code[x]),outer),outer.map(x=>code[x]))}}
}
a.equal(cases,32);a.deepEqual(maximum,[16,2,5]);a.deepEqual(canonical.map(x=>x.counts),[[8,0,1],[10,0,2]]);
console.log(JSON.stringify({source:{tableDimensions:[32,8],perimeters:[76,68,60,52],knownGP29:180,unknownP55:76},original:{cases,maxValidGP29:maximum[0],maxExactP55Cipher:maximum[1],maxP55Modulo29:maximum[2],canonical},nativePositive:{erasureValuesRecovered:76,passed:true},conclusion:"No original GP29 page55 is recoverable with direct GF257 degree179 ring interpolation"},null,2));
