#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function main(corpus,native){
  const q=29,mod=x=>(x%q+q)%q,inv=Array.from({length:q},(_,x)=>Array.from({length:q},(_,i)=>i).find(i=>mod(i*x)===1)),check=(x,m)=>{if(!x)throw Error(m)};
  const pages=corpus.pages.map(p=>p.indices),o=pages.slice(0,3).flat();
  check(o.length===729&&o[13]===2,"partition");
  const a=[null,...Array.from({length:55},(_,i)=>mod(o.slice(14+13*i,27+13*i).reduce((x,y)=>x+y,0)))];
  check(a[50]===0&&a.slice(1).filter(x=>x===0).length===1,"scalar");
  const all=(1<<29)-1;
  function gate(d,k,b,holdUpdates){
    let state=all;
    for(let i=0;i<d.c.length;i++){
      const c=d.c[i];let next=0;
      // A transparent F always has a literal zero output.
      if(c===0)next=holdUpdates?1:state;
      // Every ordinary transition emits a consuming ciphertext and updates feedback to c.
      // In a bijective shared alphabet the only forbidden ordinary residual is S(F)=b.
      for(let s=0;s<q;s++)if((state&(1<<s))&&mod((c-k*s)*inv[a[d.page]])!==b){next|=1<<c;break;}
      state=next;
      if(state===0)return i;
    }
    return -1;
  }
  function search(ds,holdUpdates){
    const survivors=[],failed=[];
    for(let k=0;k<q;k++)for(let b=0;b<q;b++){
      let hit=null;
      for(const d of ds){const i=gate(d,k,b,holdUpdates);if(i>=0){hit={page:d.page,offset:i};break;}}
      if(hit===null)survivors.push({k,b});else failed.push({k,b,...hit});
    }
    return {holdUpdates,survivors,failed};
  }
  const original=pages.slice(3,56).map((c,i)=>({page:i+3,c})).filter(d=>d.c.length);
  const controlNames=["0_warning","jpg107-167","p56_an_end","p57_parable"];
  const ss=native.sections.filter(s=>controlNames.includes(s.name)).map(s=>({name:s.name,x:[...s.source_text].map(v=>native.runes.indexOf(v)).filter(v=>v>=0)}));
  let state=0x91ac36bf;const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
  const perm=()=>{const s=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[s[i],s[j]]=[s[j],s[i]];}return s;};
  function plant(k,holdUpdates){
    const S=perm(),ds=[];let p=3,fs=0;
    for(const {x} of ss)for(let i=0;i<x.length;i+=70){const seq=x.slice(i,i+70),page=p++;let last=Math.floor(rnd()*q);const c=[];for(const v of seq){if(v===0){c.push(0);fs++;if(holdUpdates)last=0;}else{last=mod(a[page]*S[v]+k*last);c.push(last);}}ds.push({page,c});}
    const res=search(ds,holdUpdates);check(res.survivors.some(x=>x.k===k&&x.b===S[0]),"truth rejected");return {k,b:S[0],S,holdUpdates,fs,n:ds.reduce((s,d)=>s+d.c.length,0),survivors:res.survivors};
  }
  return {schema:1,model:"C=a_page*S(P)+k*previous consuming C; literal plaintext F outputs 0",a,controls:[false,true].flatMap(h=>[0,1,22].map(k=>plant(k,h))),original:[false,true].map(h=>search(original,h)),seed:0x91ac36bf};
}
console.log(JSON.stringify(main(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
