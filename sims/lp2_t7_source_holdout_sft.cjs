#!/usr/bin/env node
"use strict";

/** LP2 T7 source-feature holdout SFT. CJS, deterministic, read-only. */
const fs=require("fs"), path=require("path"), assert=require("assert/strict");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const solved=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const tape=pages.flatMap(p=>p.indices); assert.equal(tape.length,12956);
const mask=grid.rows.flat().map(t=>t[0]==="0"); assert.equal(mask.filter(Boolean).length,60);
const seams=new Set(); let off=0; for(const p of pages){off+=p.indices.length; seams.add(off-1)} seams.delete(tape.length-1);
const sites=[]; for(let i=0;i<tape.length-1;i++) if(tape[i]===tape[i+1]) sites.push(i);
assert.equal(sites.length,86);
let eligible=0, obsMask=0;
for(let i=0;i<tape.length-1;i++) if(!seams.has(i)&&mask[i%256]) eligible++;
for(const i of sites) if(!seams.has(i)&&mask[i%256]) obsMask++;
assert.equal(eligible,3025); assert.equal(obsMask,33);

let state=0x3301, spare=null;
function uniform(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296}
function normal(){if(spare!==null){const z=spare;spare=null;return z}const u=Math.max(uniform(),1e-12),v=uniform(),r=Math.sqrt(-2*Math.log(u));spare=r*Math.sin(2*Math.PI*v);return r*Math.cos(2*Math.PI*v)}
function gamma(a){if(a<1)return gamma(a+1)*Math.pow(Math.max(uniform(),1e-12),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){const z=normal(),w=1+c*z;if(w<=0)continue;const v=w*w*w,u=uniform();if(u<1-.0331*z**4||Math.log(u)<.5*z*z+d*(1-v+Math.log(v)))return d*v}}
const TH=.460664260759037, AL=.6366617848820242, BE=161.83681183502893;
function drawTwoTap(){let prev=gamma(AL)*BE,pos=0,total=0,within=0,z=0;for(;;){const cur=gamma(AL)*BE;pos+=Math.max(1,Math.round(cur+TH*prev));if(pos>=tape.length-1)break;total++;if(!seams.has(pos)){within++;if(mask[pos%256])z++;}prev=cur}return{total,within,z}}
let n86=0,ge86=0,seamfree=0,geSeamfree=0;
for(let d=0;d<30000;d++){const q=drawTwoTap();if(q.total===86){n86++;if(q.z>=33)ge86++;if(q.within===86){seamfree++;if(q.z>=33)geSeamfree++;}}}
assert.equal(n86,1062); assert.equal(ge86,2); assert.equal(seamfree,750); assert.equal(geSeamfree,0);

function primes(n){const out=[];for(let x=2;out.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)out.push(x)}return out}
const p=primes(4000), runeIndex=new Map(solved.runes.map((r,i)=>[r,i]));
const sections=solved.sections.map(s=>[...s.source_text].filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch)));
assert.equal(sections.flat().length,2979);
function enc(seq,start=0){let k=start,out=[];for(const v of seq){if(v===0)out.push(0);else out.push((v+(p[k++]-1))%29)}return{out,k}}
let continuous=[],k=0;for(const s of sections){const e=enc(s,k);continuous.push(...e.out);k=e.k}
const reset=sections.flatMap(s=>enc(s,0).out);
function gapStats(a){const q=[];for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1])q.push(i);const g=q.slice(1).map((v,i)=>v-q[i]);const mean=x=>x.reduce((s,v)=>s+v,0)/x.length;const ma=mean(g.slice(0,-1)),mb=mean(g.slice(1));let cov=0,aa=0,bb=0;for(let i=0;i<g.length-1;i++){const x=g[i]-ma,y=g[i+1]-mb;cov+=x*y;aa+=x*x;bb+=y*y}return{n:q.length,ac1:cov/Math.sqrt(aa*bb)}}
const c=gapStats(continuous), r=gapStats(reset);
assert.equal(c.n,95); assert.ok(Math.abs(c.ac1-(-0.021865304543858387))<1e-12);
assert.equal(r.n,99); assert.ok(Math.abs(r.ac1-0.055260254555791595)<1e-12);

console.log(JSON.stringify({source:{equalitySites:86,p50ZeroMaskOpportunities:3025,p50ZeroMaskEvents:33},
twoTapHoldout:{draws:30000,n86,ge86,pUpperN86:(ge86+1)/(n86+1),n86Seamfree:seamfree,geSeamfree,pUpperSeamfree:(geSeamfree+1)/(seamfree+1)},
knownP56Controls:{continuous:c,resetPerSection:r},status:"PASS"},null,2));
