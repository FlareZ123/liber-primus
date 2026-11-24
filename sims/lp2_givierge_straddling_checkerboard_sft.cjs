"use strict";
const fs=require("node:fs"),path=require("node:path");
function exhaustive(data,n=29){
 let nodes=0,leaf=0,fail=0,solutions=[];const hist=new Array(n+1).fill(0);
 function rec(pos,status,par,xor){
  nodes++;
  function find(a){let v=0;while(par[a]!==a){v^=xor[a];a=par[a]}return[a,v]}
  while(pos<data.length){
   const a=data[pos];
   if(status[a]===0){pos++;continue}
   if(status[a]===-1){const s=status.slice();s[a]=0;rec(pos+1,s,par.slice(),xor.slice());status[a]=1;}
   if(pos+1===data.length){fail++;return}
   const b=data[pos+1];
   if(a===b||status[b]===0){fail++;return}
   status[b]=1;const [u,x]=find(a),[v,y]=find(b);
   if(u===v){if((x^y)!==1){fail++;return}}else{par[u]=v;xor[u]=x^y^1}
   pos+=2;
  }
  leaf++;let mask=0,k=0;for(let i=0;i<n;i++){if(status[i]===0){mask|=1<<i;k++}}
  hist[k]++;solutions.push(mask);
 }
 rec(0,Array(n).fill(-1),Array.from({length:n},(_,i)=>i),Array(n).fill(0));
 return {nodes,leaf,fail,hist,solutions}
}

function brute(data,n){
 let masks=[];for(let m=0;m<(1<<n);m++){
  const edges=[];let ok=true;
  for(let i=0;i<data.length;){const a=data[i++];if(m&(1<<a))continue;if(i===data.length){ok=false;break}const b=data[i++];if((m&(1<<b))||a===b){ok=false;break}edges.push([a,b])}
  if(ok){for(let col=0;col<(1<<n);col++){if(edges.every(([a,b])=>((col>>a)^(col>>b))&1)){masks.push(m);break}}}
 }return masks;
}

function kat(){
 const rows=["AES","BPT","CQU","DR"],cols=["KF","LG","MH","NI","OJ"],grid=["ABCDE","FGHIK","LMNOP","QRSTU"],S="VWXYZ",P="ZVWXY",tokens=["AG","EF","Y","NR","DI","SK","KU","TI","CN","HQ"];
 function decode(t){if(t.length===1)return P[S.indexOf(t)];let r=rows.findIndex(s=>s.includes(t[0])),c=cols.findIndex(s=>s.includes(t[1]));if(r<0){r=rows.findIndex(s=>s.includes(t[1]));c=cols.findIndex(s=>s.includes(t[0]))}if(r<0||c<0)throw Error("KAT pair");return grid[r][c]}
 const wire=tokens.join(""),parsed=[];for(let i=0;i<wire.length;){const n=S.includes(wire[i])?1:2;parsed.push(wire.slice(i,i+n));i+=n}
 const text=parsed.map(decode).join("");if(text!=="BAXTTALION"||parsed.join("|")!==tokens.join("|"))throw Error("KAT");
 return {wire,text,normalized:"BATTALION",tokens}
}

function gp(text,translit){
 const ts=translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),out=[];
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){const x=ts.find(x=>w.startsWith(x.t));if(!x)throw Error("token "+w);out.push(x.i);w=w.slice(x.t.length)}}
 return out;
}

function plant(data,singletons,offset){
 const S=new Set(singletons),R=Array.from({length:29},(_,i)=>i).filter(i=>!S.has(i)),A=R.slice(0,12),B=R.slice(12),slots=A.flatMap(a=>B.map(b=>[a,b])),enc=new Map(),dec=new Map();
 for(let i=0;i<R.length;i++){const c=slots[(i*5+offset)%slots.length];enc.set(R[i],c);dec.set(c.join(","),R[i]);dec.set([...c].reverse().join(","),R[i])}
 for(const s of S){enc.set(s,[s]);dec.set(String(s),s)}
 const wire=data.flatMap((p,i)=>{const c=enc.get(p);return i%2&&c.length===2?[...c].reverse():c}),recovered=[];
 for(let i=0;i<wire.length;){const k=S.has(wire[i])?1:2;recovered.push(dec.get(wire.slice(i,i+k).join(",")));i+=k}
 if(recovered.length!==data.length||recovered.some((x,i)=>x!==data[i]))throw Error("plant decode");
 const mask=singletons.reduce((m,s)=>m|(1<<s),0),observed=wire.reduce((m,s)=>m|(1<<s),0),g=exhaustive(wire);
 if(!g.solutions.includes(mask&observed))throw Error("plant mask not retained");
 const replay=recovered.flatMap((p,i)=>{const c=enc.get(p);return i%2&&c.length===2?[...c].reverse():c});
 if(replay.some((x,i)=>x!==wire[i])||replay.length!==wire.length)throw Error("plant replay");
 return {native:data.length,wire:wire.length,exact:recovered.length,mask,observed,solutions:g.leaf,truthRetained:true};
}

function main(j,lp1){
 const span=(a,b)=>j.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
 const historical=kat();let toys=0;
 for(let code=0;code<5**5;code++){let k=code,d=[0,1,2,3,4];for(let i=0;i<5;i++){d.push(k%5);k=Math.floor(k/5)}
 const a=exhaustive(d,5).solutions.sort((x,y)=>x-y),b=brute(d,5);if(a.join()!==b.join())throw Error("toy mismatch "+code);toys++}
 const warning=lp1.split("### 1\n")[1].split("### 3\n")[0];
 const controls=[plant(span(57,57),[0,3,7,18,24],1),plant(gp(warning,j.translit),[0,1,10,15,28],2)];
 const regions=[[0,2],[16,21],[40,53]].map(([a,b])=>{const data=span(a,b);if(new Set(data).size!==29)throw Error("absent original symbol");const g=exhaustive(data);if(g.leaf!==1||g.solutions[0]!==((1<<29)-1))throw Error("unexpected new solution");return{pages:[a,b],runes:data.length,...g}});
 return{historical,toys,controls,regions}
}
const root=path.resolve(__dirname,"..");
const j=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const lp1=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
console.log(JSON.stringify(main(j,lp1),null,2));
