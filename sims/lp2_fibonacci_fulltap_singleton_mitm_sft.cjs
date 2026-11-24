"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const gp = JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const source=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const singleton=[];
let cursor=0;
const parsed=parseSharedCorpus();
const byRune=new Map(gp.runes.map((r,i)=>[r,i]));
assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(x=>byRune.get(x))),source);
for(const w of parsed.words){
  if(w.length===1)singleton.push(cursor);
  cursor+=w.length;
}
assert.deepEqual([cursor,source.length,singleton.length],[12956,12956,83]);
const Q=29, mod=x=>(x%Q+Q)%Q, inv=Array.from({length:Q},(_,i)=>i?Array.from({length:Q},(_,j)=>j).find(j=>i*j%Q===1):0);
const LAGS=[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const D=LAGS.length+2, AIO=[24,10,3];
const prime=[];
for(let n=2;prime.length<source.length;n++){
  if(prime.every(p=>p*p>n||n%p!==0))prime.push(n);
}
/** @param {number[]} starts @returns {number[]} */
function origins(starts){
  let k=0;
  return source.map((_,i)=>{while(k+1<starts.length&&i>=starts[k+1])k++;return starts[k]});
}
let acc=0;
const pages=[];
for(const p of gp.pages.filter(p=>p.page<=55)){if(p.indices.length)pages.push(acc);acc+=p.indices.length;}
const sections=[0,729,1874,3603,5506,6527,7960,9640,12648];
const clocks={book:origins([0]),chapter:origins(sections),page:origins(pages)};
/** @param {number[]} c @param {number} i @param {number} o */
function row(c,i,o){
  return [...LAGS.map(l=>i-l>=o?c[i-l]:0),1,mod(prime[i-o]-1)];
}
/** @param {number[]} a @param {number[]} b */
const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
/** @param {number[][]} rows */
function basisFor(rows){
  const basis=[],independent=[],dependent=[];
  for(let i=0;i<rows.length;i++){
    const w=rows[i].slice(),coord=Array(D).fill(0);
    for(const p of basis){
      const k=w[p.col];
      for(let j=0;j<D;j++){w[j]=mod(w[j]-k*p.w[j]);coord[j]=mod(coord[j]+k*p.coord[j]);}
    }
    const col=w.findIndex(Boolean);
    if(col<0){dependent.push({i,coord});continue;}
    const k=inv[w[col]], index=basis.length;
    coord[index]=mod(coord[index]-1);
    basis.push({col,w:w.map(x=>mod(k*x)),coord:coord.map(x=>mod(-k*x))});
    independent.push(i);
  }
  for(const {i,coord} of dependent){
    for(let j=0;j<D;j++)assert.equal(mod(independent.reduce((s,t,k)=>s+coord[k]*rows[t][j],0)),rows[i][j]);
  }
  return {basis,independent,dependent};
}
/** @param {number[][]} options @param {number} start @param {number} end @param {(v:number[])=>void} visit */
function enumerate(options,start,end,visit){
  const v=[];
  function rec(i){if(i===end){visit(v.slice());return;}for(const x of options[i]){v.push(x);rec(i+1);v.pop();}}
  rec(start);
}
/** @param {number[]} c @param {number[]} clock */
function solve(c,clock){
  const rows=singleton.map(i=>row(c,i,clock[i]));
  const allowed=singleton.map(i=>AIO.map(p=>mod(c[i]-p)));
  const {basis,independent,dependent}=basisFor(rows);
  const r=basis.length,mid=Math.floor(r/2),options=independent.map(i=>allowed[i]);
  const join=dependent.slice(0,5);
  assert.equal(join.length,5);
  const pack=v=>v.reduce((s,x)=>s*Q+x,0);
  const contribution=(v,start)=>join.map(d=>mod(v.reduce((s,x,j)=>s+x*d.coord[start+j],0)));
  const map=new Map();
  let leftCount=0,rightCount=0,joined=0,solutions=0;
  enumerate(options,mid,r,v=>{
    rightCount++;
    const k=pack(contribution(v,mid));
    const bucket=map.get(k);
    if(bucket)bucket.push(v);else map.set(k,[v]);
  });
  const wanted=join.map(d=>allowed[d.i]),targets=[];
  enumerate(wanted,0,wanted.length,v=>targets.push(v));
  const recovered=[];
  enumerate(options,0,mid,left=>{
    leftCount++;
    const a=contribution(left,0);
    for(const target of targets){
      const bucket=map.get(pack(target.map((x,i)=>mod(x-a[i]))));
      if(!bucket)continue;
      for(const right of bucket){
        joined++;
        const vals=left.concat(right,Array(D-r).fill(0));
        if(!dependent.every(d=>allowed[d.i].includes(dot(d.coord,vals))))continue;
        solutions++;
        const key=Array(D).fill(0);
        for(let i=r-1;i>=0;i--){
          const p=basis[i];
          key[p.col]=mod(dot(p.coord,vals)-dot(p.w,key));
        }
        assert.ok(rows.every((rr,i)=>allowed[i].includes(dot(rr,key))));
        recovered.push(key);
      }
    }
  });
  return {rank:r,free:D-r,leftCount,rightCount,joined,solutions,recovered};
}
function encrypt(p,key,clock){
  const c=[];
  for(let i=0;i<p.length;i++)c.push(mod(p[i]+dot(row(c,i,clock[i]),key)));
  return c;
}
function decrypt(c,key,clock){return c.map((x,i)=>mod(x-dot(row(c,i,clock[i]),key)));}
function main(){
  const result={};
  const p57=gp.pages.find(p=>p.page===57).indices;
  const p=source.map((_,i)=>p57[i%p57.length]);
  singleton.forEach((x,i)=>p[x]=AIO[i%3]);
  const key=Array.from({length:D},(_,i)=>mod(7*i*i+3*i+11));
  for(const [name,clock] of Object.entries(clocks)){
    const original=solve(source,clock);
    const c=encrypt(p,key,clock);
    const plant=solve(c,clock);
    assert.equal(plant.solutions,1);
    const decoded=decrypt(c,plant.recovered[0],clock);
    assert.deepEqual(decoded,p);
    result[name]={original,plant:{...plant,exactRunes:decoded.length,withheld:decoded.length-singleton.length}};
  }
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={main,solve};
