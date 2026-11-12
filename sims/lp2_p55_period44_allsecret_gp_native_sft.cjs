'use strict';
/**
 * Exact arbitrary-secret 44-period GF29 additive-key test on original p55.
 * A 44-period additive key implies C[i]-P[i]=C[i+44]-P[i+44].
 * Test every contiguous 76-rune original-language control, no key fitting.
 * Run: node sims/lp2_p55_period44_allsecret_gp_native_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=db.pages.find(p=>p.page===55).indices;
assert.equal(original.length,76);
const mod=n=>(n%29+29)%29;
const token=db.translit.map((name,i)=>({name,i})).sort((a,b)=>b.name.length-a.name.length);
/** @param {string} text @returns {number[]} */
function gp(text){
  const out=[];
  const words=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[];
  for(const word of words){
    for(let i=0;i<word.length;){
      const t=token.find(k=>word.startsWith(k.name,i));
      assert(t,'unknown source token '+word.slice(i));
      out.push(t.i);i+=t.name.length;
    }
  }
  return out;
}
/** @param {number[]} cipher @param {number[]} plain @returns {number} */
function consistency(cipher,plain){
  assert.equal(cipher.length,76);assert.equal(plain.length,76);
  let matches=0;
  for(let i=0;i<32;i++)if(mod(cipher[i]-plain[i])===mod(cipher[i+44]-plain[i+44]))matches++;
  return matches;
}
const native=db.pages.find(p=>p.page===57).indices.slice(0,76);
const key=Array.from({length:44},(_,i)=>mod(7*i*i+11*i+5));
const planted=native.map((v,i)=>mod(v+key[i%44]));
assert.equal(consistency(planted,native),32);
assert.deepEqual(native.map((v,i)=>mod(planted[i]-key[i%44])),native);
const samples=[
 ['Shakespeare',read('resources/control/shakespeare_first300k.txt')],
 ['Gibran',read('resources/control/gibran_prophet_58585.txt')],
 ['Emerson',read('resources/control/emerson_essays_2944.txt')]
];
const outputs=[];
for(const [name,text] of samples){
  const a=gp(text);
  let max=0,perfect=0,n=0;
  for(let start=0;start+76<=a.length;start++){
    const window=a.slice(start,start+76);
    const score=consistency(original,window);
    max=Math.max(max,score);
    perfect+=+(score===32);
    n++;
  }
  outputs.push({name,gpRunes:a.length,windows:n,max32Matches:max,compatibleWindows:perfect});
}
assert.equal(outputs.reduce((s,x)=>s+x.compatibleWindows,0),0);
console.log(JSON.stringify({originalP55Length:76,period:44,comparisonPairs:32,
  nativePlantCompatible:32,originalNativeSourceWindows:outputs,
  conclusion:'No contiguous original-source-native plaintext in 3 pinned corpora under any secret 44-period additive GP29 key'}));
