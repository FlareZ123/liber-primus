"use strict";
// Exact all-secret two-cipher-lag scalar projection/residual bound.
// Run: node sims/lp2_two_cipher_lag_projective_scalar_capacity_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function experiment(gp, sources) {
  const check=(v,m)=>{if(!v)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
  const ends=[2,7,14,22,26,32,39,53,55];
  const groups=ends.map((e,j)=>pages.filter(p=>p.page<=e&&(j===0||p.page>ends[j-1])));
  const lengths=groups.map(g=>g.reduce((n,p)=>n+p.indices.length,0));
  check(pages.length===55&&lengths.join(",")==="729,1145,1729,1903,1021,1433,1680,3008,308","physical frame");
  function shape(group,t,k) {
    const m=new Uint16Array(841);
    let N=0,heads=0;
    for(const p of group){
      const a=p.indices;N+=a.length;heads+=Math.min(2,a.length);
      for(let i=2;i<a.length;i++){
        const x=a[i-1],y=a[i-2],s=t<29?mod(x+t*y):y,z=mod(a[i]+k*(t<29?y:x));
        m[29*s+z]++;
      }
    }
    const U=Array(5).fill(heads);
    for(let a=0;a<29;a++){
      const row=m.slice(29*a,29*(a+1)).sort().reverse();
      let sum=0;for(let j=0;j<5;j++){sum+=row[j];U[j]+=sum}
    }
    check(m.reduce((a,b)=>a+b,0)===N-heads,"edge accounting");
    return {N,heads,U};
  }
  function cap(group){
    const maximum=Array(5).fill(-1),argmax=Array(5),shapes=[];
    for(let t=0;t<30;t++)for(let k=0;k<29;k++){
      const r=shape(group,t,k);
      for(let j=0;j<5;j++)if(r.U[j]>maximum[j]){maximum[j]=r.U[j];argmax[j]=[t,k]}
      shapes.push({t,k,U:r.U});
    }
    return {N:group.reduce((n,p)=>n+p.indices.length,0),heads:group.reduce((n,p)=>n+Math.min(2,p.indices.length),0),maximum,argmax,fib:shapes.find(x=>x.t===1&&x.k===0).U,shapes};
  }
  const target=cap(groups[7]),whole=cap(pages),chapters=groups.map((g,j)=>j===7?target:cap(g));
  const chapterPrivate=Array.from({length:5},(_,k)=>chapters.reduce((n,g)=>n+g.maximum[k],0));
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function native(s){let out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
    for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));check(t,"spelling "+w);out.push(t.i);i+=t.s.length}}
  }return out}
  function counts(a){const h=new Uint16Array(29);for(const x of a)h[x]++;let r=[...h].sort((x,y)=>y-x),sum=0;return r.slice(0,5).map(x=>sum+=x)}
  const refs=sources.map(({name,source})=>{
    const p=native(source);const all=[];
    for(const [g,step,bounds,label] of [[target,503,target.maximum,"p40-53"],[whole,1703,whole.maximum,"whole-global"],[whole,1703,chapterPrivate,"whole-private"]]){
      const min=Array(5).fill(Infinity),failByK=Array(5).fill(0);let n=0,pass=0,joint=0;
      for(let i=0;i+g.N<=p.length;i+=step){
        const b=counts(p.slice(i,i+g.N));n++;
        for(let k=0;k<5;k++){min[k]=Math.min(min[k],b[k]);if(b[k]>bounds[k])failByK[k]++}
        if(b.every((x,k)=>x<=bounds[k]))pass++;
        if(label!=="whole-private"&&g.shapes.some(s=>b.every((x,k)=>x<=s.U[k])))joint++;
      }
      all.push({label,n,min,failByK,pass,jointShapePass:label==="whole-private"?null:joint});
    }
    return {name,length:p.length,all};
  });
  // Source-native planted receiver: independent row maps, arbitrary two free
  // heads per page, nonzero projective state representative and residual.
  const plants=[];
  for(const [j,[t,k]] of [[1,0],[23,18],[29,12]].entries()){
    const source=native(sources[j%2].source).slice(1000*j,1000*j+target.N);
    let seed=(0x3301abcd+j)>>>0;
    function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
    const maps=Array.from({length:29},()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const r=rand(i+1);[a[i],a[r]]=[a[r],a[i]]}return a});
    const inv=maps.map(a=>{const b=[];a.forEach((z,p)=>b[z]=p);return b});
    let pos=0,match=0;
    const encrypted=groups[7].map(p=>{
      const c=[],plain=source.slice(pos,pos+p.indices.length);pos+=plain.length;
      for(let i=0;i<plain.length;i++){
        if(i<2){c.push(plain[i]);match++;continue}
        const x=c[i-1],y=c[i-2],s=t<29?mod(x+t*y):y,offset=k*(t<29?y:x);
        c.push(mod(maps[s][plain[i]]-offset));
        const recovered=inv[s][mod(c[i]+offset)];
        check(recovered===plain[i],"plant exact inverse");match++;
      }
      return {page:p.page,indices:c};
    });
    const u=shape(encrypted,t,k).U,actual=counts(source);
    check(actual.every((x,i)=>x<=u[i]),"plant capacity");
    plants.push({t,k,exactRecovered:match,actual,U:u});
  }
  const compact=({shapes,...r})=>r;
  return {target:compact(target),whole:compact(whole),chapters:chapters.map(compact),chapterPrivate,refs,plants};
}
const result=experiment(JSON.parse(read(files[0])),files.slice(1).map(name=>({name,source:read(name)})));
console.log(JSON.stringify(result,null,2));
