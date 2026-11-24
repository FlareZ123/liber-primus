'use strict';
// All-secret rectangle equality gate; read-only Node.js CJS.
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,controls,log){
  const check=(cond,msg)=>{if(!cond)throw Error(msg)};
  const mod=x=>((x%29)+29)%29;
  const symbols=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} text */
  function encode(text){
    const out=[];
    for(const w of text.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){const x=symbols.find(t=>w.startsWith(t.s,i));check(x,"unencodable word "+w);out.push(x.i);i+=x.s.length;}
    }
    return out;
  }
  /** @param {number[]} a */
  function stat(a){
    check(a.length===729,"square size");
    let q=0,top=0;
    const profile=[];
    const h=new Uint8Array(29);
    for(let r=0;r<27;r++)for(let s=r+1;s<27;s++){
      h.fill(0);
      for(let j=0;j<27;j++){const d=mod(a[r*27+j]-a[s*27+j]);q+=h[d]++;}
      const sorted=Array.from(h).sort((x,y)=>y-x);
      top+=sorted[0];profile.push(sorted.join(","));
    }
    return {q,top,profile:profile.sort().join(";")};
  }
  const transpose=a=>Array.from({length:729},(_,i)=>a[(i%27)*27+Math.floor(i/27)]);
  const C=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  check(corpus.pages.slice(0,3).map(p=>p.indices.length).join(",")==="262,266,201","source lengths");
  const cs=stat(C),ct=stat(transpose(C));
  check(cs.q===4190&&ct.q===4190&&cs.top===1156&&ct.top===1165,"source counts");
  log("Original: "+JSON.stringify({q:cs.q,rowTop:cs.top,colTop:ct.top,rectangles:351*351}));
  const results={};
  for(const [name,raw] of Object.entries(controls)){
    const text=name==="LP1"?raw.replace(/^#.*$/gm," ").replace(/\[[^\]]*\]/g," "):raw;
    const a=encode(text);
    let n=0,min=Infinity,max=0,below=0,minTop=Infinity,maxTop=0,sum=0;
    for(let j=0;j+729<=a.length;j+=729){
      const {q,top}=stat(a.slice(j,j+729));
      n++;min=Math.min(min,q);max=Math.max(max,q);sum+=q;below+=Number(q<=cs.q);
      minTop=Math.min(minTop,top);maxTop=Math.max(maxTop,top);
    }
    results[name]={n,min,max,below,mean:sum/n,minTop,maxTop};
    log(name+": "+JSON.stringify(results[name]));
  }
  const expected={"gibran_prophet_58585.txt":[86,4336,4753],"shakespeare_first300k.txt":[300,4226,4919],"emerson_essays_2944.txt":[445,4254,4827]};
  for(const [name,[n,min,max]] of Object.entries(expected)){
    const v=results[name];check(v.n===n&&v.min===min&&v.max===max&&v.below===0,"control mismatch "+name);
  }
  const P=encode(controls.LP1.replace(/^#.*$/gm," ").replace(/\[[^\]]*\]/g," ")).slice(0,729);
  check(P.length===729,"plant length");
  let state=0x33012729;
  const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
  const permutation=()=>{const a=Array.from({length:27},(_,i)=>i);for(let i=26;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
  for(let trial=0;trial<4;trial++){
    const rows=permutation(),cols=permutation(),R=Array.from({length:27},()=>rng()%29),K=Array.from({length:27},()=>rng()%29);
    const mul=1+rng()%28,inv=Array.from({length:28},(_,i)=>i+1).find(i=>mod(i*mul)===1);
    const plain=trial%2===0?P:transpose(P);
    const encrypted=Array.from({length:729},(_,i)=>{const r=Math.floor(i/27),c=i%27;return mod(mul*plain[rows[r]*27+cols[c]]+R[r]+K[c])});
    const decrypted=Array(729);
    for(let r=0;r<27;r++)for(let c=0;c<27;c++)decrypted[rows[r]*27+cols[c]]=mod(inv*(encrypted[r*27+c]-R[r]-K[c]));
    check(decrypted.every((v,i)=>v===plain[i]),"plant inversion");
    const orig=stat(plain),cipher=stat(encrypted);
    check(orig.q===cipher.q&&orig.profile===cipher.profile&&orig.top===cipher.top,"complete row-pair invariant");
    check(stat(transpose(plain)).profile===stat(transpose(encrypted)).profile,"complete column-pair invariant");
    log(`plant ${trial+1}: q=${cipher.q}; full row/column profiles invariant; 729/729 exact inverse`);
  }
  return results;
}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const controls=Object.fromEntries(["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"].map(p=>[p,read('resources/control/'+p)]));
controls.LP1=read('resources/liber-primus/lp1-plaintext-reference.txt');
experiment(corpus,controls,console.log);
