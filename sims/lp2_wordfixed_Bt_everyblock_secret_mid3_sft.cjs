"use strict";
/**
 * Original LP1 word-fixed B(t) has one numeric key digit t in GF29.
 * For a five-rune Hill packet, even if EVERY packet changes t independently,
 * three genuine plaintext indices (1,2,3) are EXACTLY invariant to t.
 *
 * Test 1680 original p33-39 runes and independent 3008 p40-53 runes,
 * full source GP word prime family, three native GP literary donors,
 * and positive planted original-matrix encrypted variable-t plaintext.
 *
 * Windows 11 Node22 CommonJS, standard library, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
// Run the first-party LP1 rune-word source family proof in the SAME test.
require("./lp1_p05_wordfixed_change_spectrum_29invariant_sft.cjs");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squares=read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/).map(s=>
    s.trim().split(/\r?\n/).map(row=>row.trim().split(/\s+/).map(Number)));
const B=squares[2];
const P=29,md=x=>(x%P+P)%P;
const D=[
  [0,1,0,-1,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,-1,0,1,0]
];
const identity=Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,j)=>Number(i===j)));
function mul(A,vec){
  return A.map(row=>md(row.reduce((s,v,i)=>s+v*vec[i],0)));
}
function inverse5(X) {
  const a=X.map((row,i)=>row.map(md).concat(identity[i]));
  for(let j=0;j<5;j++) {
    let pivot=j;
    while(pivot<5&&!a[pivot][j])pivot++;
    assert.ok(pivot<5);
    [a[j],a[pivot]]=[a[pivot],a[j]];
    const iv=Array.from({length:28},(_,i)=>i+1)
      .find(v=>md(v*a[j][j])===1);
    assert.ok(iv);
    a[j]=a[j].map(v=>md(v*iv));
    for(let i=0;i<5;i++)if(i!==j) {
      const z=a[i][j];
      a[i]=a[i].map((v,k)=>md(v-z*a[j][k]));
    }
  }
  return a.map(row=>row.slice(5));
}
function Bof(t){
  return B.map((row,i)=>row.map((v,j)=>v+(t-138)*D[i][j]));
}
const BI=inverse5(B),free=mul(BI,[1,0,0,0,28]);
assert.deepEqual(free,[6,0,0,0,23]);
assert.deepEqual(Bof(138),B);
for(let i=0;i<29;i++){
  const V=Bof(138+i),VI=inverse5(V);
  for(let k=0;k<5;k++)
    assert.deepEqual(mul(VI,mul(V,identity[k])),
      identity[k]);
}
const translit=new Map(corpus.translit.map((name,index)=>[name,index]));
function englishGP(text) {
  const source=text.toUpperCase().replace(/QU/g,"CW")
    .replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S")
    .replace(/[^A-Z]/g," ");
  const a=[];
  for(const word of source.split(" "))for(let j=0;j<word.length;){
    const value=translit.get(word.slice(j,j+2));
    if(value!==undefined) {a.push(value);j+=2;}
    else {const v=translit.get(word[j]);assert.notEqual(v,undefined);a.push(v);j++;}
  }
  return a;
}
const donors=[
  {name:"Gibran",path:"resources/control/gibran_prophet_58585.txt"},
  {name:"Shakespeare",path:"resources/control/shakespeare_first300k.txt"},
  {name:"Emerson",path:"resources/control/emerson_essays_2944.txt"}
].map(({name,path})=>({name,values:englishGP(read(path))}));
function originalPages(start,end) {
  const pages=corpus.pages.filter(x=>x.page>=start&&x.page<=end);
  assert.equal(pages.length,end-start+1);
  return pages.flatMap(p=>p.indices);
}
function lanes(input,decoded) {
  const out=Array.from({length:5},()=>[]);
  for(let i=0;i+5<=input.length;i+=5) {
    const packet=input.slice(i,i+5);
    const v=decoded?mul(BI,packet):packet;
    for(let k=0;k<5;k++)out[k].push(v[k]);
  }
  return out;
}
function middle(lanes) {return lanes.slice(1,4).flat();}
function ioc(values) {
  assert.ok(values.length>30);
  let count=Array(29).fill(0);
  for(const v of values) {assert.ok(v>=0&&v<29);count[v]++;}
  return count.reduce((s,x)=>s+x*(x-1),0)/(values.length*(values.length-1));
}
function inject(plaintext){
  let cipher=[];
  for(let i=0;i+5<=plaintext.length;i+=5) {
    const block=Math.floor(i/5), t=138+(block*7+3)%29;
    cipher.push(...mul(Bof(t),plaintext.slice(i,i+5)));
  }
  cipher.push(...plaintext.slice(cipher.length));
  return cipher;
}
function fullKnownKeyInverse(cipher){
  let plain=[];
  for(let i=0;i+5<=cipher.length;i+=5) {
    const block=Math.floor(i/5), t=138+(block*7+3)%29;
    plain.push(...mul(inverse5(Bof(t)),cipher.slice(i,i+5)));
  }
  plain.push(...cipher.slice(plain.length));
  return plain;
}
const sections=[
  {start:33,end:39,total:1680,mid:1008,
    expected:0.034360665815482104,
    minimumControls:[0.056723963998045426,0.05476742169890134,0.05762243659463123]},
  {start:40,end:53,total:3008,mid:1803,
    expected:0.034555799527609364,
    minimumControls:[0.05723781365746939,0.055819533728161785,0.05873550248906897]}
];
const outputs=[];
for(const section of sections){
  const source=originalPages(section.start,section.end);
  assert.equal(source.length,section.total);
  const x=middle(lanes(source,true));
  assert.equal(x.length,section.mid);
  const actual=ioc(x);
  assert.ok(Math.abs(actual-section.expected)<1e-14);
  const controls=donors.map((donor,k)=>{
    const sample=[];
    for(let i=0;i+source.length<=donor.values.length;i+=137)
      sample.push(ioc(middle(lanes(donor.values.slice(i,i+source.length),false))));
    const min=Math.min(...sample);
    assert.ok(Math.abs(min-section.minimumControls[k])<1e-14);
    assert.ok(actual<min);
    return {name:donor.name,windows:sample.length,nativeMinimum:min};
  });
  const native=donors[1].values.slice(251,251+source.length);
  assert.equal(native.length,source.length);
  const encrypted=inject(native);
  assert.notDeepEqual(encrypted,native);
  assert.deepEqual(fullKnownKeyInverse(encrypted),native);
  assert.deepEqual(middle(lanes(encrypted,true)),middle(lanes(native,false)));
  assert.ok(ioc(middle(lanes(encrypted,true)))>0.05);
  outputs.push({section:[section.start,section.end],runes:source.length,
    exactlyRecoveredPlaintextSlots:section.mid,
    trueSourceInvariants:[1,2,3],
    sourceIoC:actual,controls,variableTPositivePlant:true});
}
console.log(JSON.stringify({sourceFamily:"13 LP1 GP word cells B(t), 29 t choices per block",
  secretKeySearch:"NONE; middle 3/5 plaintext coordinates independent of every t_i",
  firstOriginal:outputs[0],untouchedHoldout:outputs[1],
  interpretation:"finite original-input conditional exclusion, no unknown plaintext"
},null,2));
console.log("PASS: arbitrary change of source-free numeral per five-rune packet still fails native middle-three plaintext");
