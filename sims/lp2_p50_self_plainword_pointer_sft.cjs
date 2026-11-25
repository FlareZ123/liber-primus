'use strict';
const fs=require('node:fs');
const path=require('node:path');
function selfAddress(t,c,g,n){
 const idx=new Map(c.runes.map((x,i)=>[x,i])), mod=x=>(x%29+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function parse(t,solved=false){let a=[],w=[];for(const ch of t){if(idx.has(ch))w.push(idx.get(ch));else if((solved||"-.'".includes(ch))&&w.length){a.push(w);w=[]}}if(w.length)a.push(w);return a}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pages=t.split("%"),chapters=ranges.map(([a,b])=>{const w=parse(pages.slice(a-(a>=51?1:0),b+1-(b>=50?1:0)).join(""));assert(eq(w.flat(),c.pages.slice(a,b+1).flatMap(p=>p.indices)),"cipher mismatch");return w});
 assert(chapters.flat().length===2896&&chapters.flat(2).length===12956,"counts");
 const maps=[59,60].map(radix=>{const a=radix===59?g.alphabet.replace("f",""):g.alphabet;return g.pages.flatMap(p=>p.tokens.map(t=>radix*a.indexOf(t[0])+a.indexOf(t[1])))});
 const sum=(w,weight)=>w.reduce((s,x)=>s+(weight==="GP0"?x:c.prime[x]),0)%256;
 /** Forward map: own plaintext sum is the public graph walk start, no side data. */
 function enc(p,map,weight,sign,hold){let s=sum(p,weight);return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+sign*(s%29));s=map[s];return y})}
 /** Exhaust every address and legal transparent-F inverse, retaining exact self-address fixed points. */
 function inverse(cipher,map,weight,sign,hold){let out=[];for(let start=0;start<256;start++){let w=[];function walk(i,s){if(i===cipher.length){if(sum(w,weight)===start)out.push(w.slice());return}if(hold&&cipher[i]===0){w.push(0);walk(i+1,s);w.pop()}const p=mod(cipher[i]-sign*(s%29));if(!hold||p!==0){w.push(p);walk(i+1,map[s]);w.pop()}}walk(0,start)}return out}
 const controls=[0,3,8].map(i=>({name:n.sections[i].name,w:parse(n.sections[i].source_text,true)})), results=[];
 for(const [mi,map] of maps.entries())for(const weight of ["GP0","prime"])for(const sign of [1,-1])for(const hold of [false,true]){
   const ctl=controls.map(({name,w})=>{let unique=0,ambiguous=0,max=0;for(const p of w){const cipher=enc(p,map,weight,sign,hold),inv=inverse(cipher,map,weight,sign,hold);assert(inv.some(x=>eq(x,p)),"missing true control");for(const x of inv)assert(eq(enc(x,map,weight,sign,hold),cipher),"control replay");if(inv.length===1)unique++;else ambiguous++;max=Math.max(max,inv.length)}return {name,words:w.length,unique,ambiguous,max}});
   const original=chapters.map((words,i)=>{let zero=0,unique=0,ambiguous=0,max=0,zeroExamples=[];for(const [j,cipher] of words.entries()){const inv=inverse(cipher,map,weight,sign,hold);for(const x of inv)assert(eq(enc(x,map,weight,sign,hold),cipher),"original replay");if(!inv.length){zero++;if(zeroExamples.length<3)zeroExamples.push({index:j,cipher})}else if(inv.length===1)unique++;else ambiguous++;max=Math.max(max,inv.length)}return {range:ranges[i],words:words.length,zero,unique,ambiguous,max,zeroExamples}});
   results.push({radix:mi+59,weight,sign,hold,controls:ctl,original})
 }
 return {results}
}
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(selfAddress(read(paths[0]),...paths.slice(1).map(p=>JSON.parse(read(p)))),null,2));
