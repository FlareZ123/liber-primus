'use strict';
function main(c,native,gibran,emerson){
 const idx=new Map(c.translit.map((x,i)=>[x,i]));
 const runeWords=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>c.runes.indexOf(x)));
 const latinWords=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){let x=idx.get(w.slice(i,i+2));if(x!==undefined){a.push(x);i+=2}else{let y=idx.get(w[i++]);if(y!==undefined)a.push(y)}}return a}).filter(w=>w.length);
 const cuts=s=>s.slice(s.indexOf("\n",s.indexOf("*** START OF")),s.indexOf("*** END OF")).split(/[.!?]+/).map(latinWords).filter(w=>w.length);
 const sources=[["native",native.sections.flatMap(z=>z.source_text.split(/[⁘⁜]+/u).map(runeWords)).filter(w=>w.length)],["gibran",cuts(gibran)],["emerson",cuts(emerson)]];
 const count=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h}, repeat=a=>a.reduce((s,x,i)=>s+(i>0&&a[i-1]===x),0);
 const target=c.pages.slice(0,56).flatMap(p=>p.indices),targetCounts=count(target),min=Math.min(...targetCounts), maxMultiplicity=5;
 const results=[];
 for(const [source,ss] of sources){for(const [grammar,b] of [["ordinary",Infinity],["strict",0],["near",1]]){const pool=ss.filter(w=>{const p=w.flat();return p.length>=10&&repeat(p)<=b});const vocab=[...new Map(pool.flat().map(w=>[w.join(","),w])).values()];const all=count(vocab.flat());const partial=Array(29).fill(0);for(const w of vocab){const h=count(w);for(let i=0;i<29;i++)partial[i]=Math.max(partial[i],h[i])}
 const upper=all.map((x,i)=>maxMultiplicity*x+partial[i]),minUpper=Math.min(...upper);results.push({source,grammar,words:vocab.length,maxUniqueIncludingOnePartial:vocab.length+1,maxRunesIncludingOnePartial:maxMultiplicity*vocab.flat().length+Math.max(...vocab.map(w=>w.length)),minUpper,upper,rare:upper.map((v,i)=>[c.translit[i],v]).filter(x=>x[1]<min),excludesStaticPermutation:minUpper<min})}}
 return {targetCounts,min,maxMultiplicity,targetWordTypes:2731,results,notes:"Assumes printed groups correspond to source words up to permutation, with one partial word allowed at trailing length cutoff. Gives upper bound for arbitrary source vocabulary word mixing and stationary rune bijection, not just sampled sentence grammar."}
}
const fs=require('node:fs');
const s=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(main(JSON.parse(s[0]),JSON.parse(s[1]),s[2],s[3]),null,2));
