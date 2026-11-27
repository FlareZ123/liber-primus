"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} s @returns {number[]} */
function encode(s){
  const a=[];
  for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){a.push(21);i+=3}
      else if(w.startsWith("IO",i)){a.push(27);i+=2}
      else{const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,w);a.push(t.i);i+=t.s.length}
    }
  }
  return a;
}
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,i)=>Array.from({length:29},(_,j)=>j).find(j=>i*j%29===1)||0);
/** Determinant of A+tA^T, 11x11, GF29.
 * @param {number[]} a @param {number} t @returns {number}
 */
function det(a,t=0){
  const m=new Int16Array(121);
  for(let i=0;i<11;i++)for(let j=0;j<11;j++)m[i*11+j]=(a[i*11+j]+t*a[j*11+i])%29;
  let d=1;
  for(let i=0;i<11;i++){
    let k=i;while(k<11&&!m[k*11+i])k++;
    if(k===11)return 0;
    if(k!==i){for(let j=i;j<11;j++){const z=m[i*11+j];m[i*11+j]=m[k*11+j];m[k*11+j]=z}d=29-d}
    const p=m[i*11+i];d=d*p%29;
    for(let k=i+1;k<11;k++){
      const q=m[k*11+i]*inv[p]%29;if(!q)continue;
      for(let j=i+1;j<11;j++)m[k*11+j]=mod(m[k*11+j]-q*m[i*11+j]);
    }
  }
  return d;
}
/** @param {number[]} a */
function signature(a){
  const d=det(a);return d?Array.from({length:11},(_,i)=>det(a,i+1)*inv[d]%29):null;
}
/** @param {number[]} target @param {number[]} seq */
function scan(target,seq){
  const s=signature(target);assert(s,"singular target");
  let windows=0;const survive=Array(12).fill(0),matches=[];
  for(let i=0;i+121<=seq.length;i++){
    windows++;const a=seq.slice(i,i+121);const d=det(a);if(!d)continue;survive[0]++;
    let j=0;for(;j<11;j++){if(det(a,j+1)*inv[d]%29!==s[j])break;survive[j+1]++}
    if(j===11)matches.push(i);
  }
  return {windows,survive,matches};
}
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc").split(/\r?\n\r?\n/).slice(1).join("\n\n").split("-----BEGIN PGP SIGNATURE-----")[0].split("3301")[0];
const lp1=read("resources/liber-primus/lp1-plaintext-reference.txt").split(/### \d+\n/).slice(1).map(s=>s.replace(/^\[[^\n]*\]$/gm,""));
const donors=[["signed2016",encode(signed)],...lp1.map((s,i)=>["solvedSection"+i,encode(s)]),["Gibran",encode(read("resources/control/gibran_prophet_58585.txt"))],["Shakespeare",encode(read("resources/control/shakespeare_first300k.txt"))],["Emerson",encode(read("resources/control/emerson_essays_2944.txt"))]];
const original=gp.pages.find(p=>p.page===32).indices;
assert.equal(det(original),8);assert.deepEqual(signature(original),[15,12,18,9,24,13,16,7,17,7,12]);
const out=donors.map(([name,a])=>({name,length:a.length,...scan(original,a)}));
assert(out.every(r=>r.matches.length===0));
const mat=a=>Array.from({length:11},(_,i)=>a.slice(11*i,11*i+11));
const tr=a=>a[0].map((_,i)=>a.map(r=>r[i]));
const mul=(a,b)=>a.map(r=>tr(b).map(col=>mod(r.reduce((s,x,i)=>s+x*col[i],0))));
let seed=0x332711;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)%29);
const plants=[];
for(const [name,a] of [donors[0],donors.find(d=>d[0]==="Gibran")]){
  let start=name==="signed2016"?0:1942;
  while(!det(a.slice(start,start+121)))start++;
  const P=a.slice(start,start+121);
  let T;do{T=Array.from({length:121},rng)}while(!det(T));
  const C=mul(mul(mat(T),mat(P)),tr(mat(T))).flat();
  assert.deepEqual(signature(C),signature(P));
  const result=scan(C,a);
  assert.deepEqual(result.matches,[start]);
  plants.push({name,start,signature:signature(C),...result});
}
console.log(JSON.stringify({det:det(original),signature:signature(original),original:out.filter(r=>r.windows),plants},null,2));
