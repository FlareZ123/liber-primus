"use strict";
/**
 * Key-independent entropy obstruction for previous-ciphertext-DIFFERENCE
 * GP29 feedback, not prior absolute ciphertext.
 *
 * Hypothetical stationary sender:
 *   D_i = pi[state_i](P_i), C_i=C_(i-1)+D_i mod29;
 *   D_(i-1)=(C_(i-1)-C_(i-2)) mod29
 * state_i = D_(i-1), optionally + authentic chapter or public phase8.
 * pi is any secret 29-symbol permutation, independently at each state.
 *
 * The exact entropy identity H_emp(D|state)=H_emp(P|state)
 * implies H_emp(P) >= H_emp(D|state) for ALL SECRET KEY TABLES.
 *
 * node sims/lp2_prevdelta_allsecret_entropy_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p=>p.page<=55);
const all = pages.flatMap(p=>p.indices);
assert.equal(all.length,12956);
assert.equal(pages.length,56); // original pp0..55 include runeless p50
assert.equal(pages.filter(p=>p.indices.length>0).length,55);
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterOf = p=>{
  let chapter=-1;
  for(let i=0;i<chapterStarts.length;i++)if(p>=chapterStarts[i])chapter=i;
  assert(chapter>=0);return chapter;
};
const cases=["global","chapter","page8","book8"];
const mod=x=>((x%29)+29)%29;
const log2=x=>Math.log(x)/Math.LN2;
function entropy(arr) {
  const hist=new Map();
  for(const v of arr)hist.set(v,(hist.get(v)||0)+1);
  let n=arr.length;
  return [...hist.values()].reduce((a,count)=>{
    const p=count/n;return a-p*log2(p);
  },0);
}
function events(source,mode) {
  let off=0;const rows=[];
  for(const page of pages) {
    const n=page.indices.length, p=source.slice(off,off+n);
    assert.equal(p.length,n);
    for(let i=2;i<n;i++){
      const last=mod(p[i-1]-p[i-2]);
      const delta=mod(p[i]-p[i-1]);
      const pub=mode==="chapter" ? chapterOf(page.page)
        : mode==="page8" ? i%8
        : mode==="book8" ? (off+i)%8 : -1;
      rows.push({state:last+"/"+pub,delta,offset:off+i,local:i,page:page.page});
    }
    off+=n;
  }
  assert.equal(off,source.length);
  assert.equal(rows.length,12846);
  return rows;
}
function conditionalEntropy(rows) {
  const groups=new Map();
  for(const row of rows) {
    if(!groups.has(row.state))groups.set(row.state,[]);
    groups.get(row.state).push(row.delta);
  }
  let h=0;
  for(const group of groups.values())h+=group.length/rows.length*entropy(group);
  return {entropy:h,states:groups.size,n:rows.length};
}
function sourceRunePositions(){
  let indices=[],off=0;
  for(const p of pages) {
    for(let i=2;i<p.indices.length;i++)indices.push(off+i);
    off+=p.indices.length;
  }
  assert.equal(indices.length,12846);
  return indices;
}
const eligible=sourceRunePositions();
const actual=cases.map(mode=>({mode,...conditionalEntropy(events(all,mode))}));
assert.equal(actual[0].states,29);
assert.equal(actual[1].states,261);
assert.equal(actual[2].states,232);
assert.equal(actual[3].states,232);
const expected=[4.789175641,4.381641124,4.420565410,4.418357442];
for(let i=0;i<4;i++)assert(Math.abs(actual[i].entropy-expected[i])<5e-9);
const digraphs=["TH","NG","EO","OE","AE","IA","EA"];
function gpEncode(source) {
  const text=source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const a=[];
  for(let i=0;i<text.length;) {
    const t=digraphs.find(s=>text.startsWith(s,i));
    if(t){a.push(corpus.translit.indexOf(t));i+=t.length;}
    else {const j=corpus.translit.indexOf(text[i]);if(j>=0)a.push(j);i++;}
  }
  return a;
}
const refs=[
  ["Shakespeare",gpEncode(read("resources/control/shakespeare_first300k.txt"))],
  ["Gibran",gpEncode(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson",gpEncode(read("resources/control/emerson_essays_2944.txt"))]
];
const stats=refs.map(([name,stream])=>{
  const entropies=[];
  for(let o=0;o+all.length<=stream.length;o+=1301){
    const slice=stream.slice(o,o+all.length);
    entropies.push(entropy(eligible.map(i=>slice[i])));
  }
  assert(entropies.length>=30 || name==="Gibran");
  return {source:name,streamLength:stream.length,matchedWindows:entropies.length,
    minimum:Math.min(...entropies),maximum:Math.max(...entropies),
    median:entropies.sort((a,b)=>a-b)[Math.floor(entropies.length/2)]};
});
const maxNative=Math.max(...stats.map(s=>s.maximum));
assert(actual.every(a=>a.entropy>maxNative));
function inverse(a) {
  assert(a!==0);
  for(let k=1;k<29;k++)if((a*k)%29===1)return k;
  throw Error("Expected GF29 unit");
}
function params(state,mode) {
  const [delta,phase]=state.split("/").map(Number);
  const k=phase+1;
  const a=1+mod(5*delta+7*k)%28, b=mod(11*delta+3*k+mode.length);
  return {a,b,inv:inverse(a)};
}
function positivePlant(mode,plain) {
  const cipher=[],decoded=[];
  let off=0;
  for(const page of pages){
    const len=page.indices.length;
    if(len===0)continue; // original p50 numeric-only physical page
    const p=plain.slice(off,off+len);
    const c=[page.indices[0],page.indices[1]];
    const got=[p[0],p[1]];
    for(let i=2;i<len;i++){
      const prevD=mod(c[i-1]-c[i-2]);
      const pub=mode==="chapter" ? chapterOf(page.page)
        : mode==="page8" ? i%8
        : mode==="book8" ? (off+i)%8 : -1;
      const state=prevD+"/"+pub,{a,b,inv}=params(state,mode);
      const d=mod(a*p[i]+b);
      const symbol=mod(c[i-1]+d);
      c.push(symbol);
      const decodedRune=mod(inv*(mod(c[i]-c[i-1])-b));
      got.push(decodedRune);
      assert.equal(decodedRune,p[i]);
      assert.equal(mod(a*decodedRune+b),d);
    }
    cipher.push(...c);decoded.push(...got);off+=len;
  }
  assert.deepEqual(decoded,plain);
  const cipherEvents=events(cipher,mode);
  const groups=new Map();
  for(const row of cipherEvents) {
    if(!groups.has(row.state))groups.set(row.state,[]);
    groups.get(row.state).push({delta:row.delta,plain:plain[row.offset]});
  }
  const hd=conditionalEntropy(cipherEvents).entropy;
  let hp=0;
  for(const group of groups.values())
    hp+=group.length/cipherEvents.length*entropy(group.map(v=>v.plain));
  assert(Math.abs(hd-hp)<1e-12);
  assert(hd <= entropy(eligible.map(i=>plain[i]))+1e-12);
  return {mode,recovered:eligible.length,secretStates:groups.size,
    conditionalCipherStepEntropy:hd,conditionalPlaintextEntropy:hp,
    plaintextMarginalEntropy:entropy(eligible.map(i=>plain[i]))};
}
const plantText=refs[0][1].slice(0,all.length);
assert.equal(plantText.length,all.length);
const controls=cases.map(mode=>positivePlant(mode,plantText));
const output={
  model:"D_i=secretPermutation[previous D, optional public clock/chapter](P_i)",
  original:{runes:all.length,eligible:eligible.length,
    sourceRemainder:all.length-eligible.length,
    entropyBounds:actual},
  languageControls:stats,
  maximumNativeEntropy:maxNative,
  minimumOriginalSurplus:Math.min(...actual.map(a=>a.entropy-maxNative)),
  originalVsModels:actual.map(a=>({mode:a.mode,empiricalPlaintextEntropyLower:a.entropy,
    extraBitsAboveHighestNative:a.entropy-maxNative})),
  genuineEncryptedGpControls:controls,
  conclusion:"Every stationary per-state secret 29-symbol permutation model using prior ciphertext difference plus these fixed public state qualifiers entails GP29 plaintext marginal entropy exceeding every matched original-length English GP control. This is a finite English-register exclusion, not an unknown plaintext or source-selected cipher."
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
