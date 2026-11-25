'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function setup(raw){
 const c=JSON.parse(raw[0]),native=JSON.parse(raw[3]),runes=c.runes,parse=s=>s.split(new RegExp("[^"+runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>runes.indexOf(x))),tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){let a=[];w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tok.find(t=>w.startsWith(t.s,i));if(!t)throw Error("unknown word "+w);a.push(t.i);i+=t.s.length}}return a}
 const dict=new Map();function add(a){if(!dict.has(a.length))dict.set(a.length,new Map());dict.get(a.length).set(a.map(x=>x.toString(29)).join(""),a)}
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+[1-9]\d*$/i);if(m)add(gp(m[1]))}
 // Exact known LP1 spellings supplement the general-purpose lexicon.
 for(const s of native.sections)for(const w of parse(s.source_text))add(w);
 const all=c.pages.filter(p=>p.page<56).flatMap(p=>p.indices),words=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,""));if(words.flat().join(",")!==all.join(","))throw Error("source mismatch");
 let i=0,spans=words.map(w=>{let a=i;i+=w.length;return[a,i]});const pages=[];i=0;for(const p of c.pages.filter(p=>p.page<56)){const a=i;i+=p.indices.length;pages.push({page:p.page,C:p.indices,spans:spans.filter(([u,v])=>u>=a&&v<=i).map(([u,v])=>[u-a,v-a])})}
 return{c,native,parse,gp,dict,pages};
}
function rowSearch(S,target,phase,budget){
 const C=target.C,limit=phase+4*Math.floor((C.length-phase)/4),n=(limit-phase)/4;
 const spans=target.spans.filter(([a,b])=>a>=phase&&b<=limit);
 const masks=Array.from({length:4},(_,lane)=>{const out=[];for(let w=0;w<spans.length;w++){const [a,b]=spans[w],pos=[];for(let j=0;j<b-a;j++)if((a+j-phase)%4===lane)pos.push(j);if(!pos.length)continue;
  const m=new Uint8Array(29**pos.length);let k=0;for(const v of (S.dict.get(b-a)||new Map()).values()){let z=0;for(const p of pos)z=z*29+v[p];if(!m[z]){m[z]=1;k++}}
  const idx=pos.map(p=>Math.floor((a+p-phase)/4));out.push({word:w,idx,m,prob:k/m.length})
 }return out.sort((a,b)=>a.prob-b.prob)});
 const affine=Array.from({length:812},(_,i)=>{let a=1+Math.floor(i/29),b=i%29;return Uint8Array.from({length:29},(_,x)=>(a*x+b)%29)});
 const output=Array.from({length:4},()=>[]),counts=Array.from({length:4},()=>Array(budget+1).fill(0)),v=new Uint8Array(n);
 const time=Date.now();
 for(let j=0;j<4;j++)for(let z=0;z<29**(3-j);z++){
  let u=z,a=[0,0,0,0];a[j]=1;for(let k=j+1;k<4;k++){a[k]=u%29;u=Math.floor(u/29)}
  const [x,y,w,t]=a;for(let i=0;i<n;i++){const p=phase+4*i;v[i]=(x*C[p]+y*C[p+1]+w*C[p+2]+t*C[p+3])%29}
  for(let lane=0;lane<4;lane++)for(let q=0;q<812;q++){
   const aff=affine[q];let misses=0;
   for(const d of masks[lane]){
    const p=d.idx;let key=aff[v[p[0]]];for(let i=1;i<p.length;i++)key=key*29+aff[v[p[i]]];
    if(!d.m[key]&&++misses>budget)break;
   }
   if(misses<=budget){const scale=1+Math.floor(q/29),b=q%29;counts[lane][misses]++;output[lane].push({a:a.map(x=>x*scale%29),b,misses})}
  }
 }
 return{phase,budget,n,spans,counts,output,elapsed:(Date.now()-time)/1000,mostSelective:masks.map(m=>m.slice(0,8).map(x=>[x.idx.length,x.prob]))};
}
const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
const S=setup(raw);
if(require.main===module){const target=S.pages.find(p=>p.page===Number(process.argv[2]||21));const v=rowSearch(S,target,Number(process.argv[3]||0),Number(process.argv[4]||2));console.log(JSON.stringify(v,null,2));}
module.exports={setup,rowSearch};
