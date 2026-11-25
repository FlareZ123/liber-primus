"use strict";
const fs=require("node:fs");
function experiment(gp, corpus) {
 const q=29,mod=x=>(x%q+q)%q;
 const sym=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){return (s.replace(/^#.*$/gm,"").toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C").match(/[A-Z]+/g)||[]).flatMap(w=>{let a=[];for(let j=0;j<w.length;){const x=sym.find(x=>w.startsWith(x.s,j));if(!x)throw Error(w);a.push(x.i);j+=x.s.length}return a})}
 const key=encode("MENE MENE TEKEL UPHARSIN"),orig=gp.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
 function enc(p,sign,start){let j=start;return p.map(x=>x===0?0:mod(x+sign*key[j++%key.length]))}
 function reach(c,sign,start){let states=new Map([[start,1n]]);for(let i=0;i<c.length;i++){let next=new Map();function add(k,n){next.set(k,(next.get(k)||0n)+n)}for(let [j,n] of states){if(c[i]===0)add(j,n);if(mod(c[i]-sign*key[j])!==0)add((j+1)%key.length,n)}states=next;if(!states.size)return {deadAt:i,paths:"0"}}return {deadAt:null,paths:[...states.values()].reduce((x,y)=>x+y,0n).toString()}}
 const p=encode(corpus).slice(5000,5000+orig.length);
 const tests=[1,-1].flatMap(sign=>key.map((_,start)=>({sign,start,original:reach(orig,sign,start),control:reach(enc(p,sign,start),sign,start)})));
 return {key,keyRunes:key.map(i=>gp.translit[i]).join(" "),originalLength:orig.length,controlLength:p.length,controlContainsF:p.includes(0),tests};
}
const result=experiment(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),fs.readFileSync("resources/control/emerson_essays_2944.txt","utf8"));
console.log(JSON.stringify(result,null,2));
if(result.tests.some(t=>t.original.deadAt===null||t.control.deadAt!==null))process.exitCode=1;
