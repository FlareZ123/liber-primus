"use strict";
/**
 * Original LP2 source-selected 7x7 square inverse on the seven-page illustrated
 * block, with synthetic native-language positive controls. Node.js 22.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
const text=(p)=>fs.readFileSync(path.join(base,p),"utf8");
const mod=(x)=>(x%29+29)%29;
/** @param {number} x */
const reverse=(x)=>Number(String(x).split("").reverse().join(""));
/** @param {number} x */
function invScalar(x) {
  for(let i=1;i<29;i++)if(mod(x*i)===1)return i;
  throw Error("noninvertible");
}
/** @param {number[][]} a */
function invMatrix(a){
  const n=a.length, m=a.map((r,i)=>r.map(mod).concat(
    Array.from({length:n},(_,j)=>Number(i===j))));
  for(let c=0;c<n;c++){
    const p=m.findIndex((r,i)=>i>=c&&r[c]!==0);
    assert.ok(p>=c);
    [m[p],m[c]]=[m[c],m[p]];
    const scale=invScalar(m[c][c]);
    for(let j=0;j<2*n;j++)m[c][j]=mod(m[c][j]*scale);
    for(let i=0;i<n;i++)if(i!==c){
      const f=m[i][c];
      for(let j=0;j<2*n;j++)m[i][j]=mod(m[i][j]-f*m[c][j]);
    }
  }
  return m.map(r=>r.slice(n));
}
/** @param {number[]} data @param {number[][]} key @param {"adjacent"|"seven-lanes"} layout */
function apply(data,key,layout){
  assert.equal(data.length%7,0);
  const out=Array(data.length),n=data.length/7;
  for(let b=0;b<n;b++){
    const v=Array.from({length:7},(_,i)=>data[
      layout==="adjacent"?b*7+i:i*n+b]);
    const z=key.map(row=>mod(row.reduce((s,x,i)=>s+x*v[i],0)));
    for(let i=0;i<7;i++)out[layout==="adjacent"?b*7+i:i*n+b]=z[i];
  }
  return out;
}
/** @param {number[][]} a */
function orientations(a){
  const out=[],seen=new Set();
  for(const t of [false,true])for(const r of [false,true])for(const c of [false,true]){
    let v=a.map(row=>row.slice());
    if(t)v=v[0].map((_,j)=>v.map(row=>row[j]));
    if(r)v=v.reverse();
    if(c)v=v.map(row=>row.reverse());
    const key=JSON.stringify(v);
    if(!seen.has(key)){seen.add(key);out.push({
      variant:"transpose="+t+",rows="+r+",cols="+c,matrix:v
    });}
  }
  return out;
}
/** @param {string} textSource @param {string[]} glyphs */
function encode(textSource,glyphs){
  const tokens=glyphs.map((g,i)=>({g,i})).sort((a,b)=>b.g.length-a.g.length);
  const t=textSource.toUpperCase().replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Q/g,"CU").replace(/Z/g,"S");
  let out=[];
  for(let j=0;j<t.length;){
    if(t[j]<"A"||t[j]>"Z"){j++;continue;}
    const v=tokens.find(e=>t.startsWith(e.g,j));
    if(v){out.push(v.i);j+=v.g.length;}else j++;
  }
  return out;
}
/** @param {number[]} x */
function ioc(x){
  const n=Array(29).fill(0);for(const a of x)n[a]++;
  return n.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
/** @param {number[]} native */
function scoreModel(native){
  const bi=new Uint32Array(29*29),tri=new Uint32Array(29**3);
  for(let i=2;i<native.length;i++){
    const k=native[i-2]*29+native[i-1];bi[k]++;tri[k*29+native[i]]++;
  }
  const lp=Float64Array.from(tri,(x,k)=>
    Math.log((x+0.5)/(bi[Math.floor(k/29)]+14.5)));
  return (a)=>{
    let s=0;
    for(let i=2;i<a.length;i++)s+=lp[(a[i-2]*29+a[i-1])*29+a[i]];
    return s/(a.length-2);
  };
}
function main(){
  const html=text("resources/cicada2014-onion7-index.html");
  const title=Number(html.match(/<title>(\d+)<\/title>/)[1]);
  const id=Number(html.match(/<div id="(\d+)">/)[1]);
  const parts=text("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  const m=parts[1].trim().split(/\r?\n/)
    .map(line=>line.trim().split(/\s+/).map(Number));
  assert.deepEqual([title,id,m[3][3]],[133,331,331]);
  const rev=m.map(row=>row.map(reverse));
  assert.equal(rev[3][3],title);
  const inverse=invMatrix(rev);
  const identity=rev.map((row,i)=>inverse[0].map((_,j)=>
    mod(row.reduce((s,v,k)=>s+v*inverse[k][j],0))));
  assert.deepEqual(identity,Array.from({length:7},(_,i)=>
    Array.from({length:7},(_,j)=>Number(i===j))));
  const corpus=JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
  const original=corpus.pages.filter(p=>p.page>=33&&p.page<=39)
    .flatMap(p=>p.page===33?p.indices.slice(91):p.indices);
  assert.equal(original.length,1589);
  const score=scoreModel(encode(text("resources/control/emerson_essays_2944.txt"),
    corpus.translit));
  const native=encode(text("resources/control/shakespeare_first300k.txt"),
    corpus.translit).slice(10000,11589);
  assert.equal(native.length,1589);
  const plants=["adjacent","seven-lanes"].map(layout=>{
    const pt=apply(apply(native,rev,layout),inverse,layout);
    assert.deepEqual(pt,native);
    return {layout,recovered:pt.length,ioc:ioc(pt),score:score(pt)};
  });
  let results=[];
  for(const [name,square] of [["unmodified",m],["digit-reversed",rev]])
    for(const variant of orientations(square))
      for(const layout of ["adjacent","seven-lanes"])
        for(const direction of ["inverse","forward"]){
          const forward=variant.matrix.map(r=>r.map(mod));
          const backward=invMatrix(forward);
          const decoder=direction==="inverse"?backward:forward;
          const encoder=direction==="inverse"?forward:backward;
          const plain=apply(original,decoder,layout);
          assert.deepEqual(apply(plain,encoder,layout),original);
          results.push({name,variant:variant.variant,layout,direction,
            score:score(plain),ioc:ioc(plain),prefix:plain.slice(0,80)
              .map(i=>corpus.translit[i]).join("")});
        }
  results.sort((a,b)=>b.score-a.score);
  console.log(JSON.stringify({sourceHtml:[title,id],matrixDeterminantUnit:true,
    physicalRunes:"LP2 page33 offset91 onward through page39",
    nRunes:original.length,raw:{score:score(original),ioc:ioc(original)},
    plantControls:plants,nModels:results.length,top:results.slice(0,12),
    bestBySquare:["unmodified","digit-reversed"].map(name=>
      results.find(r=>r.name===name)),
    interpretation:"Bounded source-matrix GP29 inversions, not historical key."},null,2));
}
if(require.main===module)main();
module.exports={main,reverse,invMatrix,apply,orientations};
