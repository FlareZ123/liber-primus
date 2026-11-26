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

 const K=book.key,nK=K.length,modK=x=>(x%nK+nK)%nK;
 const logF=new Map([...vocab].map(([k,f])=>[k,Math.log(f+1)])),lf=Math.log([...vocab.values()].reduce((s,f)=>s+f+1,0));
 function encode(ws,sgn){let J=0,C=[];for(const P of ws){let c=[];for(let t=0;t<P.length;t++)c.push(mod(P[t]+K[modK(C.length+J+t)]));C.push(...c);J=modK(J+sgn*sum(c));}return C}
 function solve(C,sgn){
 const N=C.length,dp=new Float64Array((N+1)*nK);dp.fill(-Infinity);dp[0]=0;const tr=new Uint8Array(dp.length);
 const deltas=Array.from({length:N},(_,i)=>{let a=[],v=0;for(let l=1;l<=24&&i+l<=N;l++){v+=gp.prime[C[i+l-1]];a.push(sgn*(v%29))}return a});
 for(let i=0;i<N;i++){
  const dl=deltas[i],base=i*nK;
  for(let J=0;J<nK;J++){let v=dp[base+J];if(!Number.isFinite(v))continue;
   let k=(i+J)%nK,p="";
   for(let l=1;l<=dl.length;l++){p+=String.fromCharCode(65+mod(C[i+l-1]-K[k]));if(++k===nK)k=0;
    const f=logF.get(p),score=f===undefined?-18-l*3.5:f-lf,nj=modK(J+dl[l-1]),z=(i+l)*nK+nj,nv=v+score;
    if(nv>dp[z]){dp[z]=nv;tr[z]=l;}
   }
  }
 }
 let J=0;for(let j=1;j<nK;j++)if(dp[N*nK+j]>dp[N*nK+J])J=j;const score=dp[N*nK+J]/N;let i=N,ws=[];
 while(i){const l=tr[i*nK+J];if(!l)throw Error("trace");const a=i-l;J=modK(J-deltas[a][l-1]);ws.push(C.slice(a,i).map((x,t)=>mod(x-K[modK(a+J+t)])));i=a}ws.reverse();
 if(encode(ws,sgn).join(",")!==C.join(","))throw Error("exact replay");
 return {score,ws,oov:ws.filter(w=>!vocab.has(key(w))).length};
 }
 const render=ws=>ws.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),controls=[];
 for(let j=0;j<3;j++){const ws=[];let n=0;for(const w of donors[j].slice(Math.floor(donors[j].length*.85))){if(n+w.length>262)break;ws.push(w);n+=w.length}const sgn=j===1?-1:1,C=encode(ws,sgn),b=[-1,1].map(sign=>({sign,...solve(C,sign)})).sort((a,b)=>b.score-a.score)[0],P=ws.flat();
 const boundaries=arr=>{let p=0;return new Set(arr.map(w=>p+=w.length))};const a=boundaries(ws),z=boundaries(b.ws);
 controls.push({donor:j,n,correct:b.ws.flat().filter((x,i)=>x===P[i]).length,F1:2*[...a].filter(x=>z.has(x)).length/(a.size+z.size),truthSign:sgn,sign:b.sign,truthGroups:ws.length,groups:b.ws.length,score:b.score,oov:b.oov,truthOov:ws.filter(w=>!vocab.has(key(w))).length,recovered:render(b.ws)});
 }
 const originals=[];
 if(controls.every(c=>c.correct/c.n>=.95&&c.F1>=.90&&c.sign===c.truthSign)){
 const best=[-1,1].map(sign=>({sign,...solve(gp.pages[0].indices,sign)})).sort((a,b)=>b.score-a.score)[0];
 for(let page=0;page<=5;page++){const C=gp.pages[page].indices,ans=page===0?best:solve(C,best.sign);originals.push({page,sign:best.sign,n:C.length,score:ans.score,groups:ans.ws.length,oov:ans.oov,plaintext:render(ans.ws),runeGroups:ans.ws});}
 }
 return {keyLength:nK,vocab:vocab.size,controls,originals};
}

const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"))),null,2));
