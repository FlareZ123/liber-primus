"use strict";
/**
 * Source-original LP2 paired-complete-word low-29-digit equality:
 * all-secret chapter × ordered-length maps, original and native GP controls.
 * Node.js22 CJS read-only, with actual arbitrary 841-state secret permutations
 * and exact inverse reconstruction of 12,956 rune positive.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const src=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lookup=new Map(src.runes.map((r,i)=>[r,i]));
const transcript=read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n]/g,"");
const words=[];
let current=[],position=0;
for(const c of transcript){
  if(lookup.has(c))current.push(lookup.get(c));
  else if(current.length){words.push({start:position,codes:current});position+=current.length;current=[];}
}
if(current.length){words.push({start:position,codes:current});position+=current.length;}
assert.equal(words.length,2896);
assert.equal(position,12956);
assert.deepEqual(words.flatMap(w=>w.codes),src.pages.slice(0,56).flatMap(p=>p.indices));
const pageStart=[];
let n=0;
for(const p of src.pages){pageStart.push(n);n+=p.indices.length;}
const chapterStarts=[0,3,8,15,23,27,33,40,54].map(p=>pageStart[p]);
assert.deepEqual(chapterStarts,[0,729,1874,3603,5506,6527,7960,9640,12648]);
/** @param {number} location */
function chapter(location){let out=0;for(let i=0;i<chapterStarts.length;i++)if(location>=chapterStarts[i])out=i;return out;}
/** @param {number} i @param {"book"|"length"|"chapterLength"} mode */
function group(i,mode){
  if(mode==="book")return "all";
  const a=words[i],b=words[i+1];
  const lens=a.codes.length+"/"+b.codes.length;
  return mode==="length"?lens:chapter(a.start)+"/"+lens;
}
/** @param {number[][]} code @param {number} parity @param {"book"|"length"|"chapterLength"} mode */
function equality(code,parity,mode){
  const groups=new Map();let total=0,pairs=0;
  for(let i=parity;i+1<code.length;i+=2){
    const key=group(i,mode);
    let bins=groups.get(key);
    if(!bins){bins=new Uint16Array(841);groups.set(key,bins);}
    const x=29*code[i].at(-1)+code[i+1].at(-1);
    total+=bins[x];bins[x]++;pairs++;
  }
  return {total,groups:groups.size,pairs};
}
const raw=words.map(w=>w.codes);
const modes=["book","length","chapterLength"];
const observed=[0,1].map(parity=>Object.fromEntries(modes.map(m=>[m,equality(raw,parity,m)])));
assert.deepEqual([observed[0].book.total,observed[0].length.total,observed[0].chapterLength.total],[1234,33,6]);
assert.deepEqual([observed[1].book.total,observed[1].length.total],[1300,38]);
assert.equal(observed[0].length.groups,129);
assert.equal(observed[0].chapterLength.groups,537);
assert.equal(observed[0].book.pairs,1448);
assert.equal(observed[1].book.pairs,1447);
/** @param {number} init */
function rng(init){let seed=init;return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};}
const token=src.translit.map((str,v)=>({str,v})).sort((a,b)=>b.str.length-a.str.length);
/** @param {string} word */
function gp(word){
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const runes=[];
  for(let i=0;i<s.length;){
    if(s.startsWith("ING",i)){runes.push(21);i+=3;}
    else if(s.startsWith("IO",i)){runes.push(27);i+=2;}
    else{const t=token.find(x=>s.startsWith(x.str,i));assert(t);runes.push(t.v);i+=t.str.length;}
  }
  return runes;
}
const controls=[
  {name:"Shakespeare",file:"resources/control/shakespeare_first300k.txt",seed:0x33012650},
  {name:"Gibran",file:"resources/control/gibran_prophet_58585.txt",seed:0x33012651},
  {name:"Emerson",file:"resources/control/emerson_essays_2944.txt",seed:0x33012652}
];
const count=2000,reports=[];
let planted;
for(const c of controls){
  const pools=new Map();
  for(const s of read(c.file).match(/[A-Za-z]+/g)||[]){
    const code=gp(s),bucket=pools.get(code.length)||[];
    bucket.push(code);pools.set(code.length,bucket);
  }
  for(const word of words)assert(pools.get(word.codes.length)?.length);
  const random=rng(c.seed);
  const tests=[0,1].flatMap(parity=>modes.map(mode=>({
    parity,mode,original:observed[parity][mode].total,
    min:Infinity,max:0,total:0,atMost:0
  })));
  for(let i=0;i<count;i++){
    const book=words.map(w=>{
      const b=pools.get(w.codes.length);
      return b[random()%b.length];
    });
    if(!i&&c.name==="Shakespeare")planted=book.map(w=>[...w]);
    for(const t of tests){
      const k=equality(book,t.parity,t.mode).total;
      t.min=Math.min(t.min,k);
      t.max=Math.max(t.max,k);
      t.total+=k;
      t.atMost+=k<=t.original;
    }
  }
  const summary=tests.map(({parity,mode,original,min,max,total,atMost})=>({
    parity,grouping:mode,original,min,max,mean:total/count,
    atMost,samples:count,addOneP:(atMost+1)/(count+1)
  }));
  assert(summary.every(t=>t.atMost===0));
  reports.push({donor:c.name,summary});
}
assert(planted);
const r=rng(0x33012683),secret=new Map(),reverse=new Map();
for(let i=0;i+1<words.length;i+=2){
  const key=group(i,"chapterLength");
  if(secret.has(key))continue;
  const perm=Array.from({length:841},(_,j)=>j);
  for(let j=840;j>0;j--){const k=r()%(j+1);[perm[k],perm[j]]=[perm[j],perm[k]];}
  const inv=Array(841);
  for(let j=0;j<841;j++)inv[perm[j]]=j;
  secret.set(key,perm);reverse.set(key,inv);
}
assert.equal(secret.size,537);
/** @param {number[][]} input @param {Map<string,number[]>} mapping */
function transform(input,mapping){
  const out=input.map(w=>[...w]);
  for(let i=0;i+1<out.length;i+=2){
    const key=group(i,"chapterLength"),perm=mapping.get(key);
    assert(perm);
    const v=29*out[i].at(-1)+out[i+1].at(-1);
    const encoded=perm[v];
    out[i][out[i].length-1]=Math.floor(encoded/29);
    out[i+1][out[i+1].length-1]=encoded%29;
  }
  return out;
}
const encoded=transform(planted,secret);
assert.deepEqual(transform(encoded,reverse),planted);
assert.deepEqual(equality(encoded,0,"chapterLength"),equality(planted,0,"chapterLength"));
/** @param {number[]} arr */
function ioc(arr){
  const f=Array(29).fill(0);
  for(const x of arr)f[x]++;
  return f.reduce((sum,x)=>sum+x*(x-1),0)/(arr.length*(arr.length-1));
}
console.log(JSON.stringify({
  premise:"2013 signed BASE29 integers, 2016 signed words/numbers; one source-p0-red anchored pair of COMPLETE words",
  source:"12,956 exact original runes, 2,896 printed words including all original page carries",
  invariant:"any fixed bijection on two word-terminal GP29 residues preserves same-context endpoint-pair collisions, despite arbitrary unknown key and map",
  observed,controls:reports,
  genuineGPPlant:{
    source:"genuine Shakespeare native GP29 word lengths matched to every printed LP2 word",
    originalRunes:planted.flat().length,
    independentSecret841WayMaps:secret.size,
    exactRecovery:transform(encoded,reverse).flat().length,
    equalPairsBefore:equality(planted,0,"chapterLength").total,
    equalPairsAfter:equality(encoded,0,"chapterLength").total,
    nativeIoc:ioc(planted.flat()),encodedIoc:ioc(encoded.flat())
  },
  scope:"Only fixed-in-context deterministic bijections of endpoint digit PAIRS, including all two-shear BASE29 integers with chapter×ordered-length secret coefficients. Per-pair secret state, head-to-tail mixing or word resegmentation lie outside. The donor resampling is a conditional English register test, not universal impossibility."
},null,2));
