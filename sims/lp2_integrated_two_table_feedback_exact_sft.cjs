"use strict";
/**
 * Exact dictionary attack on globally shared two-table integrated feedback.
 * C[j]-C[j-1] = G(P[j])-H(P[j-1]) mod 29.
 * G arbitrary permutation; H arbitrary lookup; independent word starts.
 * Windows Node.js 22, read-only. No authentic LP2 key is implied.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const read = file => fs.readFileSync(path.join(__dirname,"..",file),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph = new Map(gp.runes.map((r,i)=>[r,i]));
const mod = n => (n%29+29)%29;
const layout = parseSharedCorpus();
const seq = layout.words.map(w=>[...w.runes].map(r=>glyph.get(r)));
assert.equal(seq.length,2896);
assert.equal(layout.crossPageWords,32);
assert.deepEqual(seq.flat(),gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const trans = gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
/** @param {string} str */
function native(str) {
  return (str.toUpperCase().match(/[A-Z]+/g)||[]).map(original=>{
    let w=original.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const p=[];
    while(w.length) {
      const t=trans.find(t=>w.startsWith(t.t));
      assert(t, "unmapped spelling "+w);
      p.push(t.i); w=w.slice(t.t.length);
    }
    return {p,original};
  });
}
const dict=new Map();
for(const file of ["shakespeare_first300k.txt","emerson_essays_2944.txt","gibran_prophet_58585.txt"]) {
  for(const w of native(read("resources/control/"+file))) {
    if(!dict.has(w.p.join(","))) dict.set(w.p.join(","),w);
  }
}
assert.equal(dict.size,12231);
const by=Array.from({length:30},()=>[]);
for(const w of dict.values()) if(w.p.length<30) by[w.p.length].push(w);
const MASK=(1<<29)-1;
// Weighted union-find: variable x<29 is G(x); x>=29 is H(x-29).
// d[x] = value[x] - value[parent[x]]. bits[root] marks all G residues
// relative to that root. Different G variables cannot share a residue.
const fresh=()=>({p:Int8Array.from({length:58},(_,i)=>i),
  d:new Int8Array(58),size:new Int8Array(58).fill(1),
  bits:Int32Array.from({length:58},(_,i)=>i<29?1:0)});
const clone=s=>({p:s.p.slice(),d:s.d.slice(),size:s.size.slice(),bits:s.bits.slice()});
function find(s,x) {
  let d=0; while(s.p[x]!==x){d+=s.d[x];x=s.p[x]}
  return [x,d%29];
}
function rotate(b,k){return k?((b<<k)|(b>>>(29-k)))&MASK:b}
function add(s,x,y,d) {
  let [a,u]=find(s,x),[b,v]=find(s,y);
  let k=mod(d-u+v);
  if(a===b)return k===0;
  if(s.size[a]>s.size[b]){[a,b]=[b,a];k=mod(-k)}
  const shifted=rotate(s.bits[a],k);
  if(shifted&s.bits[b])return false;
  s.p[a]=b;s.d[a]=k;s.size[b]+=s.size[a];s.bits[b]|=shifted;
  return true;
}
function insert(s,C,P) {
  for(let i=1;i<C.length;i++) {
    if(!add(s,P[i],29+P[i-1],mod(C[i]-C[i-1])))return false;
  }
  return true;
}
const long=seq.map((C,index)=>({C,index})).filter(x=>x.C.length>=10);
assert.equal(long.length,109);
const G=Array.from({length:29},(_,i)=>(i*11+7)%29);
const H=gp.prime.map((v,i)=>mod(v*v+3*i));
const inv=Array(29);G.forEach((v,i)=>inv[v]=i);
function enc(P,i) {
  const C=[mod(P[0]+i*7)];
  for(let j=1;j<P.length;j++)C.push(mod(C[j-1]+G[P[j]]-H[P[j-1]]));
  const recovered=[P[0]];
  for(let j=1;j<C.length;j++)recovered.push(inv[mod(C[j]-C[j-1]+H[recovered[j-1]])]);
  assert.deepEqual(recovered,P);
  return C;
}
const plants=long.map(({C,index},i)=>{
  const b=by[C.length],P=b[(i*17+11)%b.length].p;
  return {C:enc(P,i),P,index};
});
function solve(rows,n) {
  const gs=rows.map(r=>({...r,cands:by[r.C.length].filter(w=>insert(fresh(),r.C,w.p))}))
    .sort((a,b)=>a.cands.length-b.cands.length||b.C.length-a.C.length);
  const train=gs.slice(0,n),test=gs.slice(n);
  let states=[{s:fresh(),words:[]}],log=[];
  for(const r of train){
    const next=[];
    for(const state of states) for(const w of r.cands){
      const s=clone(state.s);
      if(insert(s,r.C,w.p)){
        next.push({s,words:state.words.concat(w.original)});
        assert(next.length<=200000,"state cap; no exclusion may be reported");
      }
    }
    log.push({index:r.index,length:r.C.length,candidates:r.cands.length,survivors:next.length});
    states=next;if(!next.length)break;
  }
  const evaluation=states.slice(0,100).map(st=>{
    let compatible=0,unique=0,correct=0;
    for(const r of test){
      const cs=r.cands.filter(w=>insert(clone(st.s),r.C,w.p));
      compatible+=!!cs.length;unique+=cs.length===1;
      if(cs.length===1&&r.P&&cs[0].p.join(",")===r.P.join(","))correct++;
    }
    const rootCounts=new Map();
    for(let i=0;i<58;i++){const [root]=find(st.s,i);rootCounts.set(root,(rootCounts.get(root)||0)+1)}
    return {compatible,unique,correct,largestComponent:Math.max(...rootCounts.values()),words:st.words};
  });
  return {log,remaining:states.length,test:test.length,evaluation};
}
const original=solve(long,25),plant=solve(plants,25);
assert.deepEqual(original.log.map(x=>[x.index,x.candidates,x.survivors]),[[754,23,23],[2341,27,5],[1353,33,0]]);
assert.equal(original.remaining,0);
assert.equal(plant.remaining,1);
assert.equal(plant.evaluation[0].correct,84);
assert.equal(plant.evaluation[0].unique,84);
assert.equal(plant.evaluation[0].largestComponent,46);
const lp1=read("resources/liber-primus/lp1-plaintext-reference.txt").split(/\r?\n/u)
  .filter(line=>{const s=line.trim();return s&&!s.startsWith("#")&&!s.startsWith("[")
  &&!/^[0-9a-f]{25,}$/iu.test(s)&&!/^\d+[\s\d]+$/.test(s)}).join(" ");
const covered=native(lp1).filter(w=>w.p.length>=10&&dict.has(w.p.join(",")));
assert.equal(covered.length,14);
const solved=solve(covered.map(({p:P},index)=>({C:enc(P,index),P,index})),8);
assert.equal(solved.remaining,2);
assert(solved.evaluation.every(e=>e.compatible===6&&e.correct===2));
console.log(JSON.stringify({original,plant,solved},null,2));
