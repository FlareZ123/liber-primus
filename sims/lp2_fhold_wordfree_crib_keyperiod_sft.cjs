'use strict';
// Follow up all F-compatible source offsets by exact consumed-key period; read only.
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function follow(gp,donors){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const a=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=t=>{let o=[];for(let w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){let x=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:a.find(x=>w.startsWith(x.s,i));assert(x,"unmapped");o.push(x.i);i+=x.s.length;}}return o;};
 const mod=x=>(x+29)%29;
 /** @param {number[]} k */
 const period=k=>{const p=new Int32Array(k.length);for(let i=1;i<k.length;i++){let j=p[i-1];while(j&&k[i]!==k[j])j=p[j-1];if(k[i]===k[j])j++;p[i]=j;}return k.length-p[k.length-1];};
 const tape=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
 const targets=[["chapter9",tape.slice(-308)],["p55",gp.pages.find(x=>x.page===55).indices]];
 const totals=Object.fromEntries(targets.map(([n])=>[n,{hits:0,minPeriod:Infinity,minPeriodWitness:null,q8:0,q13:0,atLeastTwoCycles:0}]));
 for(const [path,t] of donors){
  const native=encode(t);
  for(const [direction,p] of [["forward",native],["reverse",native.slice().reverse()]])for(const [name,c] of targets){
   const row=totals[name];
   for(let off=0;off+c.length<=p.length;off++){
    let ok=true;const k=[];
    for(let i=0;i<c.length;i++){
     const x=p[off+i];
     if(x===0){if(c[i]!==0){ok=false;break;}}
     else k.push(mod(c[i]-x));
    }
    if(!ok)continue;
    row.hits++;
    const q=period(k);
    if(q<row.minPeriod){row.minPeriod=q;row.minPeriodWitness={path,direction,off,consuming:k.length};}
    if(q<=k.length/2)row.atLeastTwoCycles++;
    if(k.every((x,i)=>x===k[i%8]))row.q8++;
    if(k.every((x,i)=>x===k[i%13]))row.q13++;
   }
  }
 }
 const c=targets[0][1],native=encode(donors[0][1]),off=12345,p=native.slice(off,off+c.length),keys=[[23,10,1,10,9,10,16,26],[1,4,17,2,18,11,3,19,28,5,8,7,12]];
 const plants=keys.map(key=>{let j=0;const enc=p.map(x=>x===0?0:(x+key[j++%key.length])%29);const k=p.flatMap((x,i)=>x===0?[]:[mod(enc[i]-x)]);assert(period(k)===key.length,"period plant");assert(k.every((x,i)=>x===key[i%key.length]),"key plant");return {period:period(k),consuming:k.length,keyRecovered:true};});
 return {totals,plants};
}
const sources=[
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/kjv-passion-gospels-2014.txt",
  "resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt"
];
console.log(JSON.stringify(follow(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),sources.map(p=>[p,read(p)])),null,2));
