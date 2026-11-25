"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const A=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans=read("resources/transcriptions/lp2-image-corrected.txt");
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const G=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const mod=x=>(x%29+29)%29,primes=A.prime;
const glyph=new Map(A.runes.map((x,i)=>[x,i]));
const tape=s=>[...s].filter(c=>glyph.has(c)).map(c=>glyph.get(c));
const split=(s,re)=>s.split(re).map(tape).filter(x=>x.length);
const q=trans.trim().split("%");q.splice(50,0,"");
for(let i=0;i<58;i++)assert.deepEqual(tape(q[i]),A.pages[i].indices,"original page "+i);
const ps=split(q[57],/[.&$]+/).slice(1);
const rawSum=p=>p.reduce((s,x)=>s+primes[x],0);
assert.deepEqual(ps.map(rawSum),[1259,1031,1229]);
assert.equal(ps.map(rawSum).reduce((a,b)=>a*b,1),1595277641);
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters=ranges.map(([a,b])=>{
 const spans=ink.pages.find(p=>p.page===a)?.red_spans||[];
 let title=0;
 for(const s of spans)if(s.start===title)title+=s.length;
 const ch=split(q.slice(a,b+1).join(""),/[.&$]+/);
 let remaining=title;
 while(remaining){
  if(ch[0].length<=remaining)remaining-=ch.shift().length;
  else{ch[0]=ch[0].slice(remaining);remaining=0;}
 }
 assert.deepEqual(ch.flat(),A.pages.slice(a,b+1).flatMap(p=>p.indices).slice(title));
 return {range:[a,b],title,ch};
});
const sum=p=>mod(rawSum(p));
const encode=(ch,s)=>ch.map(p=>{const c=p.map(x=>x===0?0:mod(x+s));s=sum(p);return c;});
const all=Array.from({length:29},(_,i)=>i);
/** All outgoing residues and exact multiplicities for a fixed clause shift. */
function edges(c,s){
 if(s&&c.includes(s))return new Map();
 let base=0,z=0;
 for(const v of c){if(v===0){z++;base+=primes[0];}else base+=primes[mod(v-s)];}
 if(!s)return new Map([[mod(base),1n]]);
 const d=primes[mod(-s)]-primes[0];let choose=1n;
 const out=new Map();
 for(let k=0;k<=z;k++){
  const t=mod(base+k*d);out.set(t,(out.get(t)||0n)+choose);
  if(k<z)choose=choose*BigInt(z-k)/BigInt(k+1);
 }
 return out;
}
function exact(ch,start=all){
 let cur=new Map(start.map(s=>[s,1n])),hist=[];
 for(let i=0;i<ch.length;i++){
  const out=new Map();
  for(const [s,n] of cur)for(const [t,m] of edges(ch[i],s))out.set(t,(out.get(t)||0n)+n*m);
  hist.push({i,len:ch[i].length,allowed:all.filter(s=>edges(ch[i],s).size),incoming:[...cur.keys()].sort((a,b)=>a-b),outgoing:[...out.keys()].sort((a,b)=>a-b),paths:[...out.values()].reduce((a,b)=>a+b,0n).toString()});
  cur=out;if(!cur.size)break;
 }
 return hist;
}
const native=G.sections.map(s=>split(s.source_text,/[⁘⁜]+/));
/** Target-excluded, clause-reset trigram model; start sentinel 29. */
function lm(ex){
 const t=new Float64Array(30*30*29),n=new Float64Array(30*30);
 for(let i=0;i<native.length;i++)if(i!==ex)for(const u of native[i]){
  let a=29,b=29;for(const p of u){const k=a*30+b;t[k*29+p]++;n[k]++;a=b;b=p;}
 }
 return t.map((v,i)=>Math.log((v+.5)/(n[Math.floor(i/29)]+14.5)));
}
function bestEdges(c,s,log){
 if(s&&c.includes(s))return new Map();
 let states=new Map([[29*30+29,{r:0,a:29,b:29,z:0,p:[]}]]);
 for(const v of c){
  const next=new Map(),p=mod(v-s),opts=v===0?(p?[0,p]:[0]):[p];
  for(const o of states.values())for(const x of opts){
   const rr=mod(o.r+primes[x]),key=(rr*30+o.b)*30+x,score=o.z+log[(o.a*30+o.b)*29+x];
   if(!next.has(key)||score>next.get(key).z)next.set(key,{r:rr,a:o.b,b:x,z:score,p:o.p.concat(x)});
  }
  states=next;
 }
 const out=new Map();
 for(const v of states.values())if(!out.has(v.r)||v.z>out.get(v.r).z)out.set(v.r,v);
 return out;
}
function best(ch,log,start=all){
 let cur=new Map(start.map(s=>[s,{z:0,p:[],seed:s,states:[]}]));
 for(const c of ch){
  const next=new Map();
  for(const [s,b] of cur)for(const [r,e] of bestEdges(c,s,log)){
   const z=b.z+e.z;
   if(!next.has(r)||z>next.get(r).z)next.set(r,{z,p:b.p.concat([e.p]),seed:b.seed,states:b.states.concat(s)});
  }
  cur=next;if(!cur.size)return null;
 }
 const [state,b]=[...cur].sort((a,b)=>b[1].z-a[1].z)[0];
 assert.deepEqual(encode(b.p,b.seed),ch);
 return {...b,state};
}
const errors=(p,q)=>p.flat().filter((v,i)=>v!==q.flat()[i]).length;
const controls=[[0,13],[4,17]].map(([ex,seed])=>{
 const p=native[ex].slice(1),k=Math.ceil(p.length/2),c=encode(p,seed),log=lm(ex);
 const pre=best(c.slice(0,k),log),post=best(c.slice(k),log,[pre.state]),hist=exact(c);
 assert.notEqual(hist.at(-1).paths,"0");
 return {name:G.sections[ex].name,seed,units:p.map(x=>x.length),split:k,initial:pre.seed,prefixErrors:errors(pre.p,p.slice(0,k)),prefixN:p.slice(0,k).flat().length,trueState:sum(p[k-1]),recoveredState:pre.state,heldErrors:post?errors(post.p,p.slice(k)):null,heldN:p.slice(k).flat().length,heldScore:post?post.z/p.slice(k).flat().length:null,exactPaths:hist.at(-1).paths,allReplay:!!post};
});
assert.deepEqual(controls.map(c=>[c.initial,c.prefixErrors,c.heldErrors,c.heldN]),[[13,0,0,87],[17,0,2,327]]);
const data=chapters.map(({range,title,ch})=>{
 const h=exact(ch),b=h.length===ch.length&&h.at(-1).paths!=="0"?best(ch,lm(-1)):null;
 return {range,title,n:ch.flat().length,units:ch.map(x=>x.length),hist:h,score:b?b.z/ch.flat().length:null,initial:b?.seed,readout:b?.p.flat().slice(0,100).map(x=>A.translit[x]).join("")};
});
assert.deepEqual(data.map(x=>x.hist.at(-1).paths),["0","0","0","0","0","0","0","0","1"]);
assert.deepEqual(data.map(x=>x.hist.at(-1).i),[1,2,2,2,1,1,2,3,0]);
const t=chapters.at(-1),preN=A.pages[54].indices.length-t.title,pre=t.ch[0].slice(0,preN),post=t.ch[0].slice(preN);
assert.equal(t.ch.length,1);assert.equal(post.length,76);
const allowed=all.filter(s=>edges(pre,s).size),pbest=best([pre],lm(-1));
assert.deepEqual(allowed,[0]);assert.equal(pbest.seed,0);
const held=post.map(c=>c===0?0:mod(c-pbest.seed));
assert.deepEqual(held,post);
console.log(JSON.stringify({controls,original:data,terminal:{preN,heldN:post.length,allowed,selected:pbest.seed,held:held.map(x=>A.translit[x]).join(""),cipherIdentity:true}},null,2));
