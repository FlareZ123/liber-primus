"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const run=function run(corpus,txt){
 const mod=x=>(x+29)%29;
 const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
 const N=pages.reduce((s,p)=>s+p.indices.length-1,0);
 const ds=pages.map(p=>p.indices.slice(1).map((v,i)=>mod(v-p.indices[i])));
 const counts=(arrays,k,filter=false)=>{const m=new Map();let pairs=0,n=0;for(const a of arrays)for(let i=0;i+k<=a.length;i++){let v=0;for(let j=0;j<k;j++){if(filter&&a[i+j]===0){v=-1;break;}v=v*29+a[i+j];}if(v<0)continue;let z=m.get(v)||0;pairs+=z;m.set(v,z+1);n++;}return {pairs,n};};
 const caps=[3,4,5,6].map(k=>({k,...counts(ds,k)}));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const words=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const x=tokens.find(x=>w.startsWith(x.s,i));if(!x)throw Error(w);out.push(x.i);i+=x.s.length;}}return out;});
 const n=words.reduce((s,w)=>s+w.length,0);
 const rows=caps.map(({k,pairs})=>{const L=k+1,B=(pages.length-1)*(L-1);let seq=new Int32Array(n).fill(-1),m=new Map(),offset=0;
 for(const w of words){for(let i=0;i+L<=w.length;i++){let v=0;for(let j=0;j<L;j++){if(w[i+j]===0){v=-1;break;}v=v*29+w[i+j];}if(v>=0){if(!m.has(v))m.set(v,m.size);seq[offset+i]=m.get(v);}}offset+=w.length;}
 let hist=new Int32Array(m.size),freq=new Int32Array(N+1),E=0,P=0,max=0;const add=v=>{if(v<0)return;const h=hist[v]++;if(h)E++;P+=h;if(h)freq[h]--;freq[h+1]++;max=Math.max(max,h+1);};const rem=v=>{if(v<0)return;const h=--hist[v];if(h)E--;P-=h;freq[h+1]--;if(h)freq[h]++;while(max&&freq[max]===0)max--;};
 for(let i=0;i<N-L+1;i++)add(seq[i]);let minE=Infinity,minP=Infinity,minLower=Infinity,weakSurvive=0,exactSurvive=0,first=null,minBudget=Infinity;
 for(let s=0;s+N<=n;s++){if(s){rem(seq[s-1]);add(seq[s+N-L]);}minE=Math.min(minE,E);minP=Math.min(minP,P);
 let lower=Math.max(0,E-B);if(lower<=pairs)weakSurvive++;
 let budget=B,remaining=P,carried=0;for(let f=max;f>=2&&budget;f--){const use=Math.min(budget,freq[f]+carried);remaining-=use*(f-1);budget-=use;carried=use;}lower=Math.max(lower,remaining);
 if(lower<=pairs){exactSurvive++;if(first===null)first=s;}
 minLower=Math.min(minLower,lower);
 let need=P-pairs,used=0,carry=0;for(let f=max;f>=2&&need>0;f--){const use=Math.min(freq[f]+carry,Math.ceil(need/(f-1)));need-=use*(f-1);used+=use;carry=use;}minBudget=Math.min(minBudget,used);
 }
 return {k,L,B,cap:pairs,windows:n-N+1,minE,minP,minLower,weakSurvive,exactSurvive,first,minBudget};});
 const w=[];let len=0;for(const v of words){if(len>=N)break;const part=v.slice(0,N-len);w.push(part);len+=part.length;}let seed=3045;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 for(let i=w.length-1;i>0;i--){const j=rng()%(i+1);[w[i],w[j]]=[w[j],w[i]];}
 const p=w.flat(),K=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rng()%(i+1);[K[i],K[j]]=[K[j],K[i]];}
 let off=0,F=0,consume0=0,recovered=Array(29).fill(-1);const plants=[],plain=[];
 for(const page of pages){const a=p.slice(off,off+page.indices.length-1);off+=a.length;plain.push(a);let c=page.indices[0],q=0,d=[];for(const x of a){let next=x===0?0:mod(c+x-K[q]);d.push(mod(next-c));if(x===0)F++;else{if(next===0)consume0++;const k=mod(x-d[d.length-1]);if(recovered[q]>=0&&recovered[q]!==k)throw Error("key contradiction");recovered[q]=k;q=x;}c=next;}plants.push(d);}
 if(off!==N||recovered.some((x,i)=>x>=0&&x!==K[i]))throw Error("plant recovery");
 const control=caps.map(({k})=>{const input=counts(plain,k+1,true).pairs,output=counts(plants,k).pairs;if(input>output)throw Error("plant inequality");return {k,input,output};});
 return {N,pages:pages.length,caps,n,rows,control:{F,consume0,keyRowsRecovered:recovered.filter(x=>x>=0).length,comparison:control}};
};
const donors=["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"];
module.exports={run};
if(require.main===module)for(const file of donors){const r=run(corpus,read("resources/control/"+file));console.log(JSON.stringify({file,...r}));}
