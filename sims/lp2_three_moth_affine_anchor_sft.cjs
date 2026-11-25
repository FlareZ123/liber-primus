"use strict";

/** Exact three-moth affine-anchor CSP; native lexical domains reused from the existing shared-pad experiment. */
const assert=Object.assign((x,m)=>{if(!x)throw Error(m??"assertion");},{equal:(a,b)=>{if(a!==b)throw Error("equal "+a+" "+b);},notEqual:(a,b)=>{if(a===b)throw Error("notEqual");},deepEqual:(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error("deepEqual");}});
function run(read) {
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const textPages = read("resources/lp2-transcription.txt").split("%");
const p53 = corpus.pages.find(page => page.page === 53).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
const translit = new Map(corpus.translit.map((s, i) => [s, i]));
const RUNES = new Set(corpus.runes);
const multi = ["ING", "TH", "NG", "EO", "OE", "AE", "EA", "IA", "IO"];

/** @param {number} physicalPage @returns {number[][]} */
function originalWords(physicalPage) {
  const source = textPages[physicalPage <= 49 ? physicalPage : physicalPage - 1];
  return source.replace(/\/\r?\n/gu, "").replace(/\r?\n/gu, "")
    .replace(/[&$]/gu, "-").split(/[-.\s]+/gu)
    .filter(Boolean).map(item => [...item].filter(glyph => RUNES.has(glyph))
      .map(glyph => corpus.runes.indexOf(glyph))).filter(item => item.length);
}
const words53 = originalWords(53);
const words55 = originalWords(55);
assert.deepEqual(words53.flat(), p53);
assert.deepEqual(words55.flat(), p55);
const lengths53 = words53.map(word => word.length);
const lengths55 = words55.map(word => word.length);
assert.deepEqual(lengths53, [
  5,3,7,3,3,4,8,6,4,4,4,2,5,7,2,3,4,10,3,9,7,3,7,
  4,3,3,2,3,5,4,4,11,2,3,2,6,5,5,2,2
]);
assert.deepEqual(lengths55, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

/**
 * Enumerate all common GP spellings of a Roman word, including the historical
 * 2014 ING=>NG and IO=>IA rune conventions and optional two-letter ligatures.
 * @param {string} sourceWord
 * @param {Set<number>} lengths
 * @returns {number[][]}
 */
function gpForms(sourceWord, lengths) {
  if (!/^[a-z]+$/iu.test(sourceWord)) return [];
  const word = sourceWord.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KQ]/gu, "C").replace(/V/gu, "U").replace(/Z/gu, "S");
  const maxLength = Math.max(...lengths);
  /** @type {[number,number[]][]} */
  const stack = [[0, []]];
  /** @type {Map<string,number[]>} */
  const result = new Map();
  while (stack.length) {
    const [position, current] = stack.pop();
    if (current.length > maxLength) continue;
    if (position === word.length) {
      if (lengths.has(current.length)) result.set(current.join(","), current);
      continue;
    }
    const single = translit.get(word[position]);
    if (single !== undefined) stack.push([position + 1, [...current, single]]);
    for (const group of multi) {
      if (!word.startsWith(group, position)) continue;
      const rune = translit.get(group === "ING" ? "NG" : group === "IO" ? "IA" : group);
      assert.notEqual(rune, undefined);
      stack.push([position + group.length, [...current, rune]]);
    }
  }
  return [...result.values()];
}
const lengthSet = new Set([...lengths53, ...lengths55]);
const sourceTexts = [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/blake_song_of_liberty_train.txt"
];
/** @type {Map<number,Map<string,number[]>>} */
const formsByLength = new Map([...lengthSet].map(length => [length, new Map()]));
let rawEnglishWords = 0;
for (const file of sourceTexts) {
  const source = read(file);
  const words = file.endsWith("english_wordfreq_textblob.txt")
    ? source.split(/\r?\n/gu).filter(line => !line.startsWith(";")).map(line => line.split(/\s+/u)[0])
    : (source.match(/[A-Za-z]+/gu) || []);
  for (const word of words) {
    if (!/^[A-Za-z]+$/u.test(word)) continue;
    rawEnglishWords++;
    for (const form of gpForms(word, lengthSet)) {
      formsByLength.get(form.length).set(form.join(","), form);
    }
  }
}
const lexicon = new Map([...formsByLength].map(([n,forms]) => [n,[...forms.values()]]));
assert(lexicon.get(13).length > 100, "source-native 13-rune vocabulary absent");
assert(gpForms("CIRCUMFERENCES", new Set([14])).some(
  seq => seq.join(",") === [5,10,4,5,1,19,0,18,4,18,9,5,18,15].join(",")));
assert(gpForms("TUNNELING", new Set([7])).some(
  seq => seq.join(",") === [16,1,9,9,18,20,21].join(",")));


const A=[...read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%")[3].split("&")[0]].filter(g=>RUNES.has(g)).map(g=>corpus.runes.indexOf(g));
assert.equal(A.length,74);
const n=A.length,off=[p53.length-n,p55.length-n],lengths=[lengths53,lengths55];
const mod=x=>(x%29+29)%29;
const inverse=Array.from({length:29},(_,a)=>Array.from({length:29},(_,i)=>i).find(i=>mod(i*a)===1));
function solve(c,truth=null){
 const nodes=[],owner=[[],[]];
 for(let side=0;side<2;side++){let k=-off[side];for(let w=0;w<lengths[side].length;w++){
 const len=lengths[side][w],start=k,end=k+len;k=end;
 if(start>=n||end<=0)continue;
 const domain=lexicon.get(len).filter(p=>{
 for(let i=Math.max(0,start);i<Math.min(n,end);i++)if((c[side][i]===A[i])!==(p[i-start]===A[i]))return false;
 return true;
 });
 const node={side,w,start,end,domain,initial:domain.length};nodes.push(node);for(let i=Math.max(0,start);i<Math.min(n,end);i++)owner[side][i]=node;
 }}
 const edges=[];for(let i=0;i<n;i++){let x=owner[0][i],y=owner[1][i],last=edges.at(-1);if(!last||last.x!==x||last.y!==y){last={x,y,sites:[]};edges.push(last);}
 if(c[0][i]!==A[i]&&c[1][i]!==A[i])last.sites.push([i,mod((c[1][i]-A[i])*inverse[mod(c[0][i]-A[i])])]);}
 const parent=new Map(nodes.map(x=>[x,x]));function find(x){while(parent.get(x)!==x)x=parent.get(x);return x;}
 for(const {x,y} of edges){assert(find(x)!==find(y),"cycle");parent.set(find(x),find(y));}
 let removed;const trace=[];
 do{removed=0;for(const {x,y,sites} of edges){
 const l=x.domain.map(p=>sites.map(([i,r])=>mod(A[i]+r*(p[i-x.start]-A[i]))).join(","));
 const rr=y.domain.map(p=>sites.map(([i])=>p[i-y.start]).join(","));
 const rs=new Set(rr),ls=new Set(l);const nx=x.domain.filter((_,i)=>rs.has(l[i])),ny=y.domain.filter((_,i)=>ls.has(rr[i]));
 removed+=x.domain.length+y.domain.length-nx.length-ny.length;x.domain=nx;y.domain=ny;
 }trace.push(removed);}while(removed);
 let forced=0,correct=0;for(let side=0;side<2;side++)for(let i=0;i<n;i++){const x=owner[side][i],values=new Set(x.domain.map(p=>p[i-x.start]));if(values.size===1){forced++;if(truth&&values.has(truth[side][i]))correct++;}}
 if(truth)for(const node of nodes){const lo=Math.max(0,node.start),hi=Math.min(n,node.end);assert(node.domain.some(p=>p.slice(lo-node.start,hi-node.start).every((v,j)=>v===truth[node.side][lo+j])),"lost planted word");}
 return {feasible:nodes.every(x=>x.domain.length),forced,correct,trace,nodes:nodes.map(({side,w,start,end,domain,initial})=>({side,w,start,end,initial,remaining:domain.length,unique:domain.length===1?domain[0]:undefined}))};
}
let seed=0x53a055;const rnd=m=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%m;};
function plant(independent){const P=lengths.map((ls,s)=>ls.flatMap(len=>{const d=lexicon.get(len);return d[rnd(d.length)];}).slice(off[s]));
 const a=A.map(()=>rnd(28)+1),b=independent?A.map(()=>rnd(28)+1):a;
 const C=P.map((p,s)=>p.map((v,i)=>mod(A[i]+(s?b:a)[i]*(v-A[i]))));
 return solve(C,independent?null:P);
}
const positive=Array.from({length:8},()=>plant(false)),nulls=Array.from({length:8},()=>plant(true));
assert(positive.every(x=>x.feasible&&x.forced===x.correct),"positive calibration");
const original=solve([p53.slice(off[0]),p55.slice(off[1])]);
return {anchor:A,offsets:off,vocabulary:Object.fromEntries([...lexicon].map(([n,d])=>[n,d.length])),positive,nulls,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(run(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),null,2));}
module.exports=run;
