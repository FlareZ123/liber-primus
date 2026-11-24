"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const map=new Map(gp.runes.map((r,i)=>[r,i]));
const words=[];let cursor=0;
const parsed=parseSharedCorpus();
assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(x=>map.get(x))),source);
for(const w of parsed.words){words.push({start:cursor,len:w.length});cursor+=w.length;}
const Q=29,D=5,B=4,mod=x=>(x%Q+Q)%Q;
const inv=Array.from({length:Q},(_,i)=>i?Array.from({length:Q},(_,j)=>j).find(j=>i*j%Q===1):0);
const tokens=new Map(gp.translit.map((x,i)=>[x,i]));tokens.set("ING",21);tokens.set("IO",27);
function native(s){
  s=s.toUpperCase().replace(/QU/g,"CW").replace(/Q/g,"C").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<s.length;){
    const n=[3,2,1].find(n=>s.slice(i,i+n).length===n&&tokens.has(s.slice(i,i+n)));
    if(!n)return null;
    out.push(tokens.get(s.slice(i,i+n)));i+=n;
  }
  return out;
}
const spelling=new Map();
function add(s){
  const v=native(s);if(!v||!v.length)return;
  const k=v.join(",");
  if(!spelling.has(k))spelling.set(k,{v,s});
}
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
  const m=line.match(/^([a-z]+)\s+\d+$/);if(m)add(m[1]);
}
for(const file of ["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"]){
  for(const w of read("resources/control/"+file).match(/[A-Za-z]+/g)||[])add(w);
}
const dict=new Map();
for(const w of spelling.values()){
  if(!dict.has(w.v.length))dict.set(w.v.length,[]);
  dict.get(w.v.length).push(w);
}
const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
function basisFor(rows,d=D){
  const basis=[],dependent=[];
  for(let i=0;i<rows.length;i++){
    const w=rows[i].slice(),coord=Array(rows.length).fill(0);coord[i]=1;
    for(const p of basis){const k=w[p.col];for(let j=0;j<d;j++)w[j]=mod(w[j]-k*p.w[j]);for(let j=0;j<coord.length;j++)coord[j]=mod(coord[j]-k*p.coord[j]);}
    const col=w.findIndex(Boolean);
    if(col<0){dependent.push(coord);continue;}
    const k=inv[w[col]];basis.push({col,w:w.map(x=>mod(k*x)),coord:coord.map(x=>mod(k*x))});
  }
  return {basis,dependent};
}
function recover(basis,y,d=D){
  const key=Array(d).fill(0);
  for(let i=basis.length-1;i>=0;i--){
    const p=basis[i];key[p.col]=mod(dot(p.coord,y)-dot(p.w,key));
  }
  return key;
}
function feature(c,i,s){
  const p=s+B*Math.floor((i-s)/B);return c.slice(p,p+B).concat(1);
}
function constraints(c,s,anchors){
  const positions=anchors.flatMap(w=>Array.from({length:w.len},(_,i)=>w.start+i));
  const groups=Array.from({length:B},()=>[]);
  positions.forEach((pos,j)=>groups[(pos-s)%B].push({pos,j}));
  const systems=groups.map(g=>basisFor(g.map(x=>feature(c,x.pos,s))));
  const checks=[];
  systems.forEach((sys,r)=>{
    for(const dep of sys.dependent){
      const check=Array(positions.length).fill(0);
      dep.forEach((x,j)=>check[groups[r][j].j]=x);checks.push(check);
    }
  });
  return {groups,systems,checks};
}
function keyFrom(sys,y){
  const key=sys.systems.map((x,r)=>recover(x.basis,sys.groups[r].map(g=>y[g.j])));
  return basisFor(key.map(x=>x.slice(0,B)),B).basis.length===B?key:null;
}
function decodeWord(c,key,s,w){
  return Array.from({length:w.len},(_,j)=>{const i=w.start+j;return dot(feature(c,i,s),key[(i-s)%B]);});
}
function search(c,s,e,bodyStart){
  const eligible=words.filter(w=>w.start>=Math.max(s,bodyStart)&&w.start+w.len<=e).sort((a,b)=>b.len-a.len||a.start-b.start);
  const longs=eligible.filter(w=>w.len>=8);
  const result={pairs:[],joined:0,invertible:0,holdoutSurvivors:0,keys:[]};
  const seen=new Set();
  for(let a=0;a<longs.length;a++)for(let b=a+1;b<longs.length;b++){
    const anchors=[longs[a],longs[b]],n=anchors[0].len+anchors[1].len;
    if(n<21)continue;
    const sys=constraints(c,s,anchors);
    if(sys.systems.some(x=>x.basis.length!==D))continue;
    const held=eligible.find(w=>!anchors.includes(w));
    const left=dict.get(anchors[0].len),right=dict.get(anchors[1].len);
    const contribution=(w,offset)=>sys.checks.map(h=>dot(h.slice(offset,offset+w.v.length),w.v));
    const hmap=new Map();
    for(const w of right){
      const k=contribution(w,anchors[0].len).join(",");
      if(!hmap.has(k))hmap.set(k,[]);hmap.get(k).push(w);
    }
    const count={anchors:anchors.map(w=>[w.start,w.len]),held:[held.start,held.len],checks:sys.checks.length,left:left.length,right:right.length,joined:0,invertible:0,holdoutSurvivors:0};
    for(const u of left){
      const k=contribution(u,0).map(x=>mod(-x)).join(",");
      for(const v of hmap.get(k)||[]){
        count.joined++;
        const y=u.v.concat(v.v),key=keyFrom(sys,y);
        if(!key)continue;
        count.invertible++;
        const h=decodeWord(c,key,s,held);
        if(!spelling.has(h.join(",")))continue;
        count.holdoutSurvivors++;
        const id=key.flat().join(",");
        if(seen.has(id))continue;seen.add(id);
        const known=eligible.filter(w=>spelling.has(decodeWord(c,key,s,w).join(","))).length;
        result.keys.push({key,known,eligible:eligible.length,anchorWords:[u.s,v.s],heldWord:spelling.get(h.join(",")).s});
      }
    }
    result.pairs.push(count);
    for(const k of ["joined","invertible","holdoutSurvivors"])result[k]+=count[k];
  }
  return result;
}
const TRUE=[[3,7,19,11,9],[0,5,2,13,4],[0,0,9,17,26],[0,0,0,21,12]];
function encrypt(p,s,e){
  const c=p.slice(),basis=basisFor(TRUE.map(r=>r.slice(0,B)),B).basis;
  for(let i=s;i<e;i+=B){
    const y=p.slice(i,i+B).map((x,j)=>mod(x-TRUE[j][B]));
    const v=recover(basis,y,B);
    c.splice(i,B,...v);
  }
  return c;
}
function main(){
  const results=[];
  const p=source.slice();let seed=3301;
  for(const w of words.filter(w=>w.start>=12648)){
    const options=dict.get(w.len);assert.ok(options&&options.length);
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    p.splice(w.start,w.len,...options[seed%options.length].v);
  }
  for(let phase=0;phase<4;phase++){
    const s=12648+phase,e=s+B*Math.floor((12956-s)/B);
    const original=search(source,s,e,12657);
    const c=encrypt(p,s,e);
    const plant=search(c,s,e,12657);
    const recovered=plant.keys.find(k=>JSON.stringify(k.key)===JSON.stringify(TRUE));
    assert.ok(recovered,"hidden matrix did not survive");
    for(let i=s;i<e;i++)assert.equal(dot(feature(c,i,s),recovered.key[(i-s)%B]),p[i]);
    results.push({phase,s,e,original,plant:{...plant,keys:plant.keys.slice(0,5),exactRunes:e-s,recovered:true}});
  }
  const output={dictionary:spelling.size,results};
  console.log(JSON.stringify(output,null,2));return output;
}
if(require.main===module)main();
module.exports={main};
