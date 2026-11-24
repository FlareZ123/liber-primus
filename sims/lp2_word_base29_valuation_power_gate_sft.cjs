"use strict";

// Agent 5, issue #2619. Canonical complete words, exact power map and endpoint gate.
const fs = require("node:fs");
const path = require("node:path");
function experiment(transcription){
  const glyphs=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
  const words=s=>(s.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>glyphs.indexOf(x)));
  const pages=transcription.split("%");
  const original=words(pages.slice(0,55).join("").replace(/\/\s*/gu,""));
  const development=words(pages.slice(0,3).join("").replace(/\/\s*/gu,""));
  const holdout=original.slice(development.length);
  const check=(condition,msg)=>{if(!condition)throw Error(msg)};
  check(original.length===2896&&original.flat().length===12956,"canonical original size");
  check(development.every((w,i)=>w.join(",")===original[i].join(",")),"chapter prefix");
  const hist=ws=>{const c=Array(29).fill(0);for(const w of ws)if(w.length===1)c[w[0]]++;return c};
  const counts=hist(original),train=hist(development),test=hist(holdout);
  const pow=(x,e,m)=>{let y=1n;while(e>0n){if(e&1n)y=y*x%m;x=x*x%m;e>>=1n;}return y};
  const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
  const power=(x,e,n)=>{if(x===0n)return 0n;let factor=1n;while(x%29n===0n){x/=29n;factor*=29n;}return factor*pow(x,e,29n**BigInt(n)/factor)};
  const es=Array.from({length:28},(_,i)=>i+1).filter(e=>gcd(BigInt(e),28n)===1n);
  const score=(cs,e,alphabet)=>alphabet.reduce((s,p)=>s+cs[Number(power(BigInt(p),BigInt(e),1))],0);
  const rows=es.map(e=>({e,strict:score(counts,e,[24,10,3]),generous:score(counts,e,[24,10,3,16]),train:score(train,e,[24,10,3,16]),holdout:score(test,e,[24,10,3,16])}));
  const selected=rows.reduce((a,b)=>b.train>a.train?b:a);
  const native=words(pages[56].replace(/\/\s*/gu,""));
  const plants=[];
  for(const e of [3301n,1033n,15n,17n]){
    for(const lsd of [false,true]){
      let checked=0,zeroEdge=0;
      for(const w of native){
        const order=lsd?[...w].reverse():w;
        const x=order.reduce((s,d)=>s*29n+BigInt(d),0n),n=w.length;
        const phi=28n*29n**BigInt(n-1);
        let inv=1n; // extended Euclid below
        let [a,b,s,t]=[e,phi,1n,0n];
        while(b){const q=a/b;[a,b]=[b,a%b];[s,t]=[t,s-q*t]}
        check(a===1n,"unit exponent");inv=(s%phi+phi)%phi;
        const y=power(x,e,n);
        check(power(y,inv,n)===x,"native full-word inverse");
        check(y%29n===pow(x%29n,e,29n),"endpoint equality");
        checked+=n;zeroEdge+=Number(x%29n===0n);
      }
      plants.push({e:Number(e),lsd,checked,zeroEdge});
    }
  }
  const total=c=>c.reduce((a,b)=>a+b,0);
  check(total(counts)===83&&counts.filter(Boolean).length===28,"singleton census");
  return {words:original.length,runes:original.flat().length,counts,trainSingletons:total(train),holdoutSingletons:total(test),rows,selected,minimumForcedOOV:{strict:83-Math.max(...rows.map(x=>x.strict)),generous:83-Math.max(...rows.map(x=>x.generous))},plants};
}
if (require.main === module) console.log(JSON.stringify(experiment(fs.readFileSync(path.resolve(__dirname, "../resources/liber-primus/lp2-transcription.txt"),"utf8")),null,2));
module.exports = { experiment };
