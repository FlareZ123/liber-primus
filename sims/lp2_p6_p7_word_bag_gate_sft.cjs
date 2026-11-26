// Run from repository root: node sims/lp2_p6_p7_word_bag_gate_sft.cjs
// Necessary invariant for every value-preserving word-local permutation.
const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = p => fs.readFileSync(p, "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tr = read("resources/liber-primus/lp2-transcription.txt").split("%");
const f = read("resources/control/english_wordfreq_textblob.txt");
const sol = read("resources/liber-primus/lp1-plaintext-reference.txt");
const idx = new Map(gp.runes.map((v,i)=>[v,i]));
const latin = gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {number[]} a */
const bag = a => [...a].sort((a,b)=>a-b).join(",");
/** @param {string} s */
function enc(s) {
  const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const a=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith("ING",i)){a.push(21);i+=3}
    else if(w.startsWith("IO",i)){a.push(27);i+=2}
    else {const x=latin.find(z=>w.startsWith(z.s,i));assert(x,w);a.push(x.i);i+=x.s.length}
  }
  return a;
}
const lex=new Map();let count=0;
for(const line of f.split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(line);if(!m)continue;
  const k=bag(enc(m[1]));if(!lex.has(k))lex.set(k,[]);lex.get(k).push(m[1]);count++;
}
let body="";
for(const [p,a,b] of [[6,82,196],[7,0,194]]){
  let off=0;
  for(const c of tr[p]){
    if(idx.has(c)){if(off>=a&&off<b)body+=c;off++}
    else if(off>=a&&off<=b)body+=c;
  }
}
const groups=body.replace(/[\/\s]/gu,"").match(/[\u16A0-\u16FF]+/gu).map(s=>[...s].map(c=>idx.get(c)));
assert.deepEqual(groups.flat(),[...gp.pages[6].indices.slice(82),...gp.pages[7].indices.slice(0,194)]);
let offset=0;
const rows=groups.map((a,i)=>{const start=offset;offset+=a.length;return {i,start,end:offset,a,hits:lex.get(bag(a))||[]}});
const summaries=Object.fromEntries([["p6",rows.filter(r=>r.end<=114)],["carry",rows.filter(r=>r.start<114&&r.end>114)],["p7",rows.filter(r=>r.start>=114)],["all",rows]].map(([n,rs])=>[n,{words:rs.length,runes:rs.reduce((s,r)=>s+r.a.length,0),long:rs.filter(r=>r.a.length>=4).length,longhits:rs.filter(r=>r.a.length>=4&&r.hits.length).length,hitWords:rs.filter(r=>r.hits.length).length,hitRunes:rs.filter(r=>r.hits.length).reduce((s,r)=>s+r.a.length,0)}]));
const p57=sol.replace(/\r\n/g,"\n").split("### 57\n")[1];
const clear=p57.match(/[A-Z]+/g).map(enc);
assert.deepEqual(clear.flat(),gp.pages[57].indices);
const clong=clear.filter(a=>a.length>=4);
const control={words:clear.length,long:clong.length,longhits:clong.filter(a=>lex.has(bag(a))).length,allhits:clear.filter(a=>lex.has(bag(a))).length,permInvariant:clear.every(a=>bag(a)===bag([...a].reverse()))};
const red=[[[6,27,15,17],[22,16,2,25]],[[14,12],[23,3]]].map(([a,b])=>({sameBag:bag(a)===bag(b),intersection:a.filter(v=>b.includes(v)),sumA:a.reduce((s,x)=>s+x,0),sumB:b.reduce((s,x)=>s+x,0)}));
assert.equal(count,29157);assert.equal(lex.size,27351);
assert.equal(summaries.all.longhits,1);assert.equal(summaries.all.long,40);
assert.equal(summaries.all.hitRunes,26);assert.equal(control.longhits,9);
assert(red.every(x=>!x.sameBag&&x.intersection.length===0&&x.sumA===x.sumB));
console.log(JSON.stringify({dict:count,bags:lex.size,summaries,control,carry:rows.filter(r=>r.start<114&&r.end>114),longHits:rows.filter(r=>r.a.length>=4&&r.hits.length),red,singletons:rows.filter(r=>r.a.length===1)},null,2));
