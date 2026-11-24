// Agent50, 2026-11-24: arbitrary shared lag-eight ciphertext feedback shift bound
const fs=require("node:fs");
function run(d,n){
 const pages=d.pages.filter(p=>p.page<=55&&p.indices.length),N=pages.reduce((a,p)=>a+p.indices.length,0),h=Array(29).fill(0);
 const pairs=Array.from({length:29},()=>Array(29).fill(null));let witnesses=0;
 for(const {page,indices:c} of pages){
 for(const v of c)h[v]++;
 for(let i=8;i<c.length;i++)if(c.slice(i-8,i+1).every(v=>v!==0)){witnesses++;pairs[c[i-8]][c[i]]??=[page,i];}
 }
 const missing=[];for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(pairs[x][y]===null)missing.push([x,y]);
 if(missing.length)throw Error("Incomplete pair coverage");
 const top=(a,k)=>a.slice().sort((x,y)=>y-x).slice(0,k).reduce((x,y)=>x+y,0);
 const ks=[3,5,8,10],bounds=ks.map(k=>({k,count:top(h.slice(1),k)+h[0]+16*pages.length,share:(top(h.slice(1),k)+h[0]+16*pages.length)/N}));
 const controls=n.sections.map(s=>{const hist=Array(29).fill(0);let len=0;for(const rune of s.source_text){const i=n.runes.indexOf(rune);if(i>=0){hist[i]++;len++;}}return {name:s.name,n:len,shares:ks.map(k=>top(hist,k)/len)};});
 return {N,pages:pages.length,witnesses,distinctPairs:784-missing.length,missing,h,bounds,controls,witnessCoordinates:pairs.slice(1).map(row=>row.slice(1))};
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
