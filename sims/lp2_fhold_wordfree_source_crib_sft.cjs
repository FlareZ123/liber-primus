'use strict';
// Exact word-free F-subset source crib screen. Node.js 22, read only.
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(gp,donors){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const alphabet=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 /** @param {string} text @returns {number[]} */
 const encode=text=>{
  const out=[];
  const latin=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(const w of latin.match(/[A-Z]+/g)||[]){
   for(let i=0;i<w.length;){
    const a=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:alphabet.find(x=>w.startsWith(x.s,i));
    assert(a,"unmapped GP spelling");out.push(a.i);i+=a.s.length;
   }
  }return out;
 };
 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const ff=a=>a.reduce((n,x,i)=>n+Number(x===0&&a[i-1]===0),0);
 assert(tape.length===12956&&tape.filter(x=>x===0).length===458&&ff(tape)===4,"source counts");
 const lengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
 let start=0;
 const scopes=lengths.map((n,i)=>{let a=tape.slice(start,start+n);start+=n;return ["chapter"+(i+1),a]});
 assert(start===tape.length,"chapter total");
 scopes.push(["opening-black",tape.slice(13,729)],["p55",gp.pages.find(p=>p.page===55).indices],["full",tape]);
 /** @param {number[]} c @param {number[]} p */
 const scan=(c,p)=>{
  const next=new Int32Array(p.length+1);let nf=p.length;next[p.length]=nf;
  for(let j=p.length-1;j>=0;j--){if(p[j]===0)nf=j;next[j]=nf;}
  let tested=0,hits=0,zeroF=0,first=-1,minFF=Infinity,ffCompatible=0;
  const prefix=new Int32Array(p.length+1);
  for(let j=0;j<p.length;j++)prefix[j+1]=prefix[j]+Number(p[j]===0&&p[j-1]===0);
  const limit=ff(c);
  for(let off=0;off+c.length<=p.length;off++){
   tested++;
   const adjacent=prefix[off+c.length]-prefix[off+1];
   minFF=Math.min(minFF,adjacent);if(adjacent<=limit)ffCompatible++;
   let f=next[off],ok=true;const empty=f>=off+c.length;
   while(f<off+c.length){if(c[f-off]!==0){ok=false;break;}f=next[f+1];}
   if(ok){if(first<0)first=off;hits++;if(empty)zeroF++;}
  }
  return {tested,hits,zeroF,first,minFF:Number.isFinite(minFF)?minFF:null,ffCompatible};
 };
 // Authentic p56: only the fourth visible zero, at local 56, is literal F.
 const c56=gp.pages.find(p=>p.page===56).indices,pr=[];
 for(let n=2;pr.length<85;n++)if(!pr.some(p=>p*p<=n&&n%p===0))pr.push(n);
 let k=0;const p56=c56.map((c,i)=>i===56?0:(c-(pr[k++]-1)%29+29)%29);
 assert(k===84&&p56[56]===0&&p56.filter(x=>!x).length===1,"native p56");
 const forward=(p,key)=>{let j=0;return p.map(x=>x===0?0:(x+key(j++))%29);};
 assert(forward(p56,i=>(pr[i]-1)%29).every((x,i)=>x===c56[i]),"p56 replay");
 const rows=[], totals=Object.fromEntries(scopes.map(([name])=>[name,{tested:0,hits:0,zeroF:0,ffCompatible:0}]));
 let native0;
 for(const [path,raw] of donors){
  const p=encode(raw);if(!native0)native0=p;
  const row={path,length:p.length,scopes:{}};
  for(const [direction,seq] of [["forward",p],["reverse",p.slice().reverse()]]){
   for(const [name,c] of scopes){
    const a=scan(c,seq);row.scopes[name+"/"+direction]=a;
    for(const field of ["tested","hits","zeroF","ffCompatible"])totals[name][field]+=a[field];
   }
  }
  rows.push(row);
 }
 const plants=[12345,54321].map(off=>{
  const plain=native0.slice(off,off+729);let seed=0x3301+off;
  const key=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29;};
  const cipher=forward(plain,key);const a=scan(cipher,native0);
  assert(plain.every((x,i)=>x!==0||cipher[i]===0),"subset invariant");
  assert(a.hits>=1,"plant missing");
  // Confirm chosen source survives; first need not be unique.
  assert(plain.every((x,i)=>x!==0||cipher[i]===0),"true offset");
  return {off,F:plain.filter(x=>!x).length,FF:ff(plain),...a,unique:a.hits===1&&a.first===off};
 });
 const info=scopes.map(([name,c])=>({name,length:c.length,F:c.filter(x=>!x).length,FF:ff(c)}));
 return {info,totals,plants,p56:{length:p56.length,F:p56.filter(x=>!x).length,forwardReplay:true},rows};
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
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),sources.map(p=>[p,read(p)])),null,2));
