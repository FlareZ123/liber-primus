"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,book){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);


 const K=book.key,L=K.length,modK=x=>(x%L+L)%L;
 function plant(ws,sgn,stride,seed,need=100,extra=40,maxNodes=2e6){
  const P=ws.flat(),bounds=[0];for(const w of ws)bounds.push(bounds.at(-1)+w.length);
  const word=new Int32Array(P.length);for(let q=0;q<ws.length;q++)word.fill(q,bounds[q],bounds[q+1]);
  const C=new Int16Array(P.length),D=new Int16Array(ws.length);D.fill(-1);D[0]=0;const J=new Int32Array(ws.length),consumed=new Int32Array(P.length),skips=new Uint8Array(P.length);
  const residues=[...new Set(gp.prime.map(x=>x%29))],possible=[new Set([0])];for(let m=1;m<=24;m++)possible[m]=new Set([...possible[m-1]].flatMap(a=>residues.map(b=>mod(a+b))));
  let nodes=0,answer=null,halt=false;
  const coin=(i,j)=>((Math.imul(i+1,0x9e3779b1)^Math.imul(j+seed,0x85ebca6b))>>>0)/4294967296;
  function go(i,j,rejects){
   if(halt)return false;
   if(++nodes>maxNodes){halt=true;return false}
   if(i>=need+extra){
    const last=word[consumed[need-1]];
    if(i>=bounds[last+1]){answer={C:Array.from(C.slice(0,i)),P:P.slice(0,i),lens:ws.map(w=>w.length),skips:Array.from(skips.slice(0,i)),consumed:Array.from(consumed.slice(0,i)),D:Array.from(D),lastUsedKeyWord:last,nodes,seed,sgn,stride,need};return true}
   }
   if(i>=P.length||j>=P.length||rejects>10||j-i>36)return false;
   const q=word[j];
   if(D[q]===-1){
    let v=0;const a=bounds[q-1],b=bounds[q],end=Math.min(i,b);
    for(let t=a;t<end;t++)v+=gp.prime[C[t]];
    const rem=b-end,options=rem<=0?[mod(v)]:[...possible[rem]].map(z=>mod(z+v));
    // fixed seed order, no tuning to any original; choose candidate hypothesis and enforce when actual cipher word closes.
    options.sort((a,b)=>((a*13+seed*7+q)%29)-((b*13+seed*7+q)%29));
    for(const d of options){D[q]=d;J[q]=modK(J[q-1]+sgn*d);if(go(i,j,rejects))return true;D[q]=-1;if(halt)return false;}
    return false;
   }
   const k=K[modK(j+J[q])],c=mod(P[i]+k),prev=i?C[i-1]:-1;
   if(c===prev&&coin(i,j)<.83)return go(i,j+stride,rejects+1);
   C[i]=c;consumed[i]=j;skips[i]=rejects;
   const oq=word[i];
   if(i+1===bounds[oq+1]&&oq+1<ws.length&&D[oq+1]!==-1){let v=0;for(let t=bounds[oq];t<=i;t++)v+=gp.prime[C[t]];if(mod(v)!==D[oq+1])return false;}
   return go(i+1,j+1,0);
  }
  go(0,0,0);
  if(answer){
   // Verify K' built from actual full ciphertext and lengths. Replay the whole selected prefix including each rejected key proposal.
   const C=answer.C,tail=answer.consumed[need-1]+1,keys=[];let j=0,J=0,prev=0;
   for(const l of answer.lens){J=modK(J+sgn*prev);for(let t=0;t<l;t++)keys.push(K[modK(j+J+t)]);prev=sum(C.slice(j,j+l));j+=l;if(j>=tail)break;}
   j=0;for(let i=0;i<need;i++){for(let k=0;k<answer.skips[i];k++){if(mod(P[i]+keys[j])!==C[i-1])throw Error("invalid rejected proposal");j+=stride;}if(mod(P[i]+keys[j])!==C[i]||j!==answer.consumed[i])throw Error("sender replay mismatch");j++;}
   answer.realSkips=answer.skips.slice(0,need).reduce((s,x)=>s+x,0);return answer;
  }
  return {failed:true,halt,nodes,seed,sgn,stride,need};
 }
 const plants=[];
 for(let donor=0;donor<3;donor++){
  const ws=donors[donor].slice(Math.floor(donors[donor].length*.85),Math.floor(donors[donor].length*.85)+100);
  for(const stride of [1,2]){const seed=5191+donor*409+stride*173,sgn=donor===1?-1:1;let b=plant(ws,sgn,stride,seed,80,30,5e5);plants.push({donor,...b});}
 }
 return {keyLength:L,plants};
}

const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"))),null,2));
