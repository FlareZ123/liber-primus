"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, "resources/liber-primus", name), "utf8");
const corpus = JSON.parse(read("lp2-corpus.json"));
const text = read("lp2-transcription.txt");
const mod = x => (x % 29 + 29) % 29;
const glyph = new Map(corpus.runes.map((r,i) => [r,i]));
/** @param {string} input @returns {number[][]} */
function parse(input) {
  const words = []; let cur = [];
  for (const ch of input) {
    if (glyph.has(ch)) cur.push(glyph.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) continue;
    else if (cur.length) { words.push(cur); cur = []; }
  }
  if (cur.length) words.push(cur);
  return words;
}
const parts = text.split("%");
const opening = parse(parts.slice(0,3).join("%"));
assert.deepEqual(opening.flat(), corpus.pages.slice(0,3).flatMap(p=>p.indices));
const [k8,k5] = opening, body = opening.slice(2);
assert.deepEqual(k8,[15,8,18,3,6,19,27,0]);
assert.deepEqual(k5,[15,26,18,21,5]);
assert.equal(body.flat().length,716);
assert.equal(body.length,156);
assert.equal(body.filter(w=>w.length===1).length,5);
const control = parts.map(parse).filter(w=>w.length).at(-1);
assert.deepEqual(control.flat(), corpus.pages[57].indices);
assert.equal(control.flat().length,95);
assert(control.filter(w=>w.length===1).every(w=>[24,10].includes(w[0])));

/** Exact single-layer encoder and all possible inverse transitions. */
function enc(p,k,t,s,h) {
  return h && p===0 ? [0,t] : [mod(p+s*k[t]),(t+1)%k.length];
}
function inv(c,k,t,s,h) {
  const p=mod(c-s*k[t]);
  if (!h) return [[p,(t+1)%k.length]];
  return [...(c===0?[[0,t]]:[]),...(p!==0?[[p,(t+1)%k.length]]:[])];
}
/** Exact joint inverse; plaintext zero may be literal F or a consuming ciphertext zero. */
function transitions(c,a,b,k1,k2,s1,s2,mode) {
  if (mode==="sharedF") {
    const p=mod(c-s1*k1[a]-s2*k2[b]);
    return [...(c===0?[[0,a,b]]:[]),...(p!==0?[[p,(a+1)%k1.length,(b+1)%k2.length]]:[])];
  }
  return inv(c,k2,b,s2,mode[1]==="F").flatMap(([q,bb])=>
    inv(q,k1,a,s1,mode[0]==="F").map(([p,aa])=>[p,aa,bb]));
}
function forward(p,a,b,k1,k2,s1,s2,mode) {
  if (mode==="sharedF") return p===0?[0,a,b]:[mod(p+s1*k1[a]+s2*k2[b]),(a+1)%k1.length,(b+1)%k2.length];
  const [q,aa]=enc(p,k1,a,s1,mode[0]==="F");
  const [c,bb]=enc(q,k2,b,s2,mode[1]==="F");
  return [c,aa,bb];
}
function encode(words,k1,k2,s1,s2,mode,initial) {
  let [a,b]=initial;
  return words.map(w=>w.map(p=>{let c;[c,a,b]=forward(p,a,b,k1,k2,s1,s2,mode);return c}));
}
/** Reachability is exact because future transitions depend only on both clock phases. */
function solve(words,k1,k2,s1,s2,mode,start,restrict) {
  let states=new Map(start.map(([a,b])=>[a*k2.length+b,{a,b,n:1,prev:null,p:null}]));
  let pos=0;
  for (const w of words) for (const c of w) {
    const next=new Map();
    for (const v of states.values()) for (const [p,a,b] of transitions(c,v.a,v.b,k1,k2,s1,s2,mode)) {
      if (restrict && w.length===1 && p!==24 && p!==10) continue;
      const id=a*k2.length+b, old=next.get(id);
      if(old) old.n=Math.min(2,old.n+v.n);
      else next.set(id,{a,b,n:v.n,prev:v,p});
    }
    pos++;
    if(!next.size) return {failure:pos,states:0,paths:0};
    states=next;
  }
  let node=states.values().next().value, out=[];
  while(node.prev){out.push(node.p);node=node.prev;}
  out.reverse();
  let off=0;
  const decoded=words.map(w=>{const r=out.slice(off,off+w.length);off+=w.length;return r;});
  assert.deepEqual(encode(decoded,k1,k2,s1,s2,mode,[node.a,node.b]),words);
  return {failure:null,states:states.size,paths:Math.min(2,[...states.values()].reduce((s,v)=>s+v.n,0)),decoded};
}
function verifyPlantPath(cipher,plain,k1,k2,s1,s2,mode) {
  let a=0,b=0;
  for(let i=0;i<plain.length;i++) for(let j=0;j<plain[i].length;j++){
    const p=plain[i][j], [c,aa,bb]=forward(p,a,b,k1,k2,s1,s2,mode);
    assert.equal(c,cipher[i][j]);
    assert(transitions(c,a,b,k1,k2,s1,s2,mode).some(([v,x,y])=>v===p&&x===aa&&y===bb));
    a=aa;b=bb;
  }
}
const rows=[];
for(const [k1,k2] of [[k8,k5],[k5,k8]]) for(const s1 of [1,-1]) for(const s2 of [1,-1]) for(const mode of ["FF","FC","CF","CC","sharedF"]){
  const phases=Array.from({length:k1.length},(_,a)=>Array.from({length:k2.length},(_,b)=>[a,b])).flat();
  const plant=encode(control,k1,k2,s1,s2,mode,[0,0]);
  verifyPlantPath(plant,control,k1,k2,s1,s2,mode);
  const positive=solve(plant,k1,k2,s1,s2,mode,[[0,0]],true);
  assert(positive.paths>0);
  const zero=solve(body,k1,k2,s1,s2,mode,[[0,0]],false);
  const arbitrary=solve(body,k1,k2,s1,s2,mode,phases,false);
  const native=solve(body,k1,k2,s1,s2,mode,phases,true);
  const row={order:k1.length+"+"+k2.length,signs:[s1,s2],mode,zeroPhaseFailure:zero.failure,allPhaseFailure:arbitrary.failure,singletonFailure:native.failure,controlPaths:positive.paths,controlWitnessExact:JSON.stringify(positive.decoded)===JSON.stringify(control)};
  rows.push(row);console.log(JSON.stringify(row));
}
assert.equal(rows.length,40);
assert.equal(rows.filter(r=>r.mode!=="CC"&&r.allPhaseFailure!==null).length,32);
assert.equal(rows.filter(r=>r.singletonFailure!==null).length,40);
assert.deepEqual(rows.filter(r=>r.mode==="FF").map(r=>r.allPhaseFailure),[94,40,78,40,155,101,73,101]);
console.log("PASS: original body 716/716, 156 printed groups, 40 p57 plants admitted; 32 language-independent failures and 8 additional native singleton failures.");
