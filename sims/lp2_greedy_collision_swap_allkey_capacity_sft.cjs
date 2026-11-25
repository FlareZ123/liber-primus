'use strict';
const fs=require('node:fs'),path=require('node:path');
function capacity(gp,refs){
 const check=(b,m)=>{if(!b)throw Error(m)},e=gp.translit.indexOf("E");
 const sym=gp.translit.map((name,index)=>({name,index})).sort((a,b)=>b.name.length-a.name.length);
 function encode(text){return (text.replace(/^#.*$/gm," ").toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C").match(/[A-Z]+/g)||[]).flatMap(w=>{const a=[];for(let i=0;i<w.length;){const h=sym.find(x=>w.startsWith(x.name,i));check(h,"unmapped");a.push(h.index);i+=h.name.length;}return a;});}
 const reference=refs.map(encode);
 function floor(n){return reference.map(a=>{let c=0,m=Infinity;for(let i=0;i<a.length;i++){c+=Number(a[i]===e);if(i>=n)c-=Number(a[i-n]===e);if(i>=n-1)m=Math.min(m,c);}return {n:a.length,windows:a.length-n+1,min:m};});}
 function edges(y){return y.flatMap((v,i)=>i>0&&i+1<y.length&&y[i-1]===y[i+1]&&v!==y[i-1]?[i]:[]);}
 function cap(y,q,N=29){
   const b=Array.from({length:q},()=>new Int32Array(N)),g=Array.from({length:q},()=>Array.from({length:N},()=>new Int32Array(N)));
   const es=edges(y);for(let i=0;i<y.length;i++)b[i%q][y[i]]++;
   for(const i of es){const r=i%q,x=y[i],z=y[i+1];for(let u=0;u<N;u++)for(let v=0;v<N;v++)g[r][u][v]+=Math.max(0,Number(z===u)+Number(x===v)-Number(x===u)-Number(z===v));}
   let upper=-1,witness=null;
   for(let first=0;first<N;first++){
     let prev=new Int32Array(N).fill(-100000000);prev[first]=b[0][first];const parent=[];
     for(let r=1;r<q;r++){const next=new Int32Array(N).fill(-100000000),par=new Int32Array(N).fill(-1);for(let v=0;v<N;v++)for(let u=0;u<N;u++){const sc=prev[u]+g[r-1][u][v]+b[r][v];if(sc>next[v]){next[v]=sc;par[v]=u;}}parent.push(par);prev=next;}
     for(let last=0;last<N;last++){const sc=prev[last]+g[q-1][last][first];if(sc>upper){upper=sc;const w=[last];for(let r=q-2;r>=0;r--)w.unshift(parent[r][w[0]]);witness=w;}}
   }
   const score=(w,exact=true)=>{
     let s=y.reduce((a,v,i)=>a+Number(v===w[i%q]),0);
     if(!exact)return s+es.reduce((a,i)=>a+Math.max(0,Number(y[i+1]===w[i%q])+Number(y[i]===w[(i+1)%q])-Number(y[i]===w[i%q])-Number(y[i+1]===w[(i+1)%q])),0);
     const elig=new Set(es),dp=new Int32Array(y.length+2);
     for(let i=y.length-1;i>=0;i--){dp[i]=dp[i+1];if(elig.has(i)){const d=Number(y[i+1]===w[i%q])+Number(y[i]===w[(i+1)%q])-Number(y[i]===w[i%q])-Number(y[i+1]===w[(i+1)%q]);dp[i]=Math.max(dp[i],d+dp[i+2]);}}
     return s+dp[0];
   };
   check(score(witness,false)===upper,"wrong cycle witness");
   return {upper,attained:score(witness),eligible:es.length,code:witness};
 }
 // Small exhaustive complete forward encoder and all phase-code vectors.
 let cases=0;
 for(let n=3;n<=7;n++)for(let u=0;u<3**n;u+=17){
   let z=u,y=Array.from({length:n},()=>{const a=z%3;z=Math.floor(z/3);return a;});
   const q=2+u%2,A=cap(y,q,3),es=edges(y);let trueMax=-1;
   function paths(i,raw){if(i===n){for(let k=0;k<3**q;k++){let z=k,w=Array.from({length:q},()=>{const a=z%3;z=Math.floor(z/3);return a;});trueMax=Math.max(trueMax,raw.filter((v,j)=>v===w[j%q]).length);}return;}
   paths(i+1,raw.concat(y[i]));if(es.includes(i))paths(i+2,raw.concat(y[i+1],y[i]));}
   paths(0,[]);check(A.upper>=trueMax&&A.attained<=trueMax,"toy bound incorrect");cases++;
 }
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapters=ranges.map(([a,b])=>({name:`p${a}-${b}`,y:gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));
 const full=chapters.flatMap(x=>x.y);check(full.length===12956&&e===18,"input");
 const fullFloor=floor(full.length);check(Math.min(...fullFloor.map(z=>z.min))===1397,"ref floor");
 const originals=[8,13,29].map(q=>({q,full:cap(full,q),chapterPrivate:chapters.map(({name,y})=>({name,n:y.length,...cap(y,q),floor:Math.min(...floor(y.length).map(z=>z.min))}))}));
 // Independently keyed literary plants: ordinary consuming, local greedy optional collision swaps.
 let s=0x3301;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/2**32;};
 const plants=[];
 for(let j=0;j<reference.length;j++)for(const q of [8,13,29]){
   const p=reference[j].slice(10000,10000+full.length),key=Array.from({length:q},()=>Math.floor(rnd()*29)),raw=p.map((v,i)=>(v+key[i%q])%29),y=[],sw=[];
   for(let i=0;i<raw.length;){if(i+1<raw.length&&raw[i]===y.at(-1)&&raw[i+1]!==y.at(-1)&&rnd()<.8){sw.push(i);y.push(raw[i+1],raw[i]);i+=2;}else y.push(raw[i++]);}
   const inv=y.slice();for(const i of sw)[inv[i],inv[i+1]]=[inv[i+1],inv[i]];
   check(inv.every((v,i)=>(v-key[i%q]+29)%29===p[i]),"control replay");
   const trueE=p.filter(v=>v===e).length,A=cap(y,q);check(A.upper>=trueE,"planted key excluded");
   plants.push({source:j,q,trueE,upper:A.upper,swaps:sw.length});
 }
 return {n:full.length,fullFloor,cases,originals,plants};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(capacity(JSON.parse(read(paths[0])),paths.slice(1).map(read)),null,2));
