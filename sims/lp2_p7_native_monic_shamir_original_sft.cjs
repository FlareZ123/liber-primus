'use strict';
// Native SSSS monic-degree-five analogue over GP29, not GF(2^176).
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
function probe(corpus) {
  const mod=x=>(x%29+29)%29;
  const inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse");};
  const get=p=>corpus.pages.find(x=>x.page===p).indices,p7=get(7),p8=get(8),p57=get(57);
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  assert(JSON.stringify(p7.slice(194))==="[23,3,22,16,2,25,5,7,11,14,28,6,28,19]","p7 source");
  assert(p8.length===255&&p57.length===95,"page lengths");
  let k=194;const y=[2,4,3,2,3].map(n=>{const v=p7.slice(k,k+n).reduce((a,b)=>mod(a*b),1);k+=n;return v;});
  const out=[];
  for(const xs of [[1,2,3,4,5],[3,5,1,4,2],y]){
    const w=xs.map((x,i)=>xs.reduce((a,v,j)=>i===j?a:mod(a*(-v)*inv(mod(x-v))),1));
    const correction=mod(w.reduce((s,v,i)=>s+v*xs[i]**5,0)),quartic=mod(w.reduce((s,v,i)=>s+v*y[i],0));
    assert(correction===mod(xs.reduce((a,b)=>a*b,1)),"product identity");
    for(const lanes of [false,true]){
      const read=t=>Array.from({length:51},(_,j)=>mod(w.reduce((s,v,i)=>s+v*t[lanes?51*i+j:5*j+i],0)-correction));
      const planted=Array(255).fill(0);for(let j=0;j<51;j++)for(let i=0;i<5;i++){const x=xs[i];planted[lanes?51*i+j:5*j+i]=mod(x**5+p57[j]+(j+7)*x+(3*j+11)*x**2+(5*j+13)*x**3+(7*j+17)*x**4);}
      assert(JSON.stringify(read(planted))===JSON.stringify(p57.slice(0,51)),"monic plant");
      const a=read(p8),counts=Array(29).fill(0);for(const n of a)counts[n]++;
      out.push({xs,w,quartic,correction,monic:mod(quartic-correction),lanes,ioc:counts.reduce((s,n)=>s+n*(n-1),0)/(51*50),actual:a,translit:a.map(x=>corpus.translit[x]).join("")});
    }
  }
  return out;
}
console.log(JSON.stringify(probe(corpus),null,2));
