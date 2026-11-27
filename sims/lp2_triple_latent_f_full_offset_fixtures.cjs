"use strict";
const fs=require("node:fs"),path=require("node:path");
function offsetFixtures(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[4]),Q=29,L=76,H=48,Q2=Q*Q,Q3=Q2*Q;
 const mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"encode");out.push(q.i);j+=q.t.length;}}return out;}
 function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
 const lit=raw.slice(1,4).map(s=>encode(body(s)));
 const train=[...lit.map(p=>p.slice(0,Math.floor(p.length*.65))),...gold.sections.filter(s=>s.name!=="p57_parable").map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)))];
 const n1=new Float64Array(Q),n2=new Float64Array(Q2),n3=new Float64Array(Q3),d2=new Float64Array(Q),d3=new Float64Array(Q2),n4=new Float64Array(Q3*Q),d4=new Float64Array(Q3);
 let total=0;
 for(const p of train)for(let i=0;i<p.length;i++){const c=p[i];n1[c]++;total++;if(i){const a=p[i-1];n2[a*Q+c]++;d2[a]++;if(i>1){const ab=p[i-2]*Q+a;n3[ab*Q+c]++;d3[ab]++;if(i>2){const abc=p[i-3]*Q2+ab;n4[abc*Q+c]++;d4[abc]++;}}}}
 const U=Float64Array.from(n1,n=>(n+.5)/(total+14.5)),B=Float64Array.from(n2,(n,i)=>(n+12*U[i%Q])/(d2[Math.floor(i/Q)]+12)),T=Float64Array.from(n3,(n,i)=>(n+9*B[i%Q2])/(d3[Math.floor(i/Q)]+9));
 const F=Float64Array.from(n4,(n,i)=>(n+7*T[i%Q3])/(d4[Math.floor(i/Q)]+7));
 const lu=U.map(Math.log),lb=B.map(Math.log),lt=T.map(Math.log),lf=F.map(Math.log);


 const zeros=s=>s.filter(x=>!x).length,enc=(p,k)=>{let j=0;return p.map(x=>x?(x+k[j++])%Q:0);};
 const orig=[32,53,55].map(i=>gp.pages[i].indices),counts=[3,2,3],totalCounts=orig.map(zeros);
 const controls=[];
 for(let trial=0;trial<8;trial++){
  let rng=(0x73a97c41+trial*0x1f123bb5)>>>0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
  const off=[rand(46),rand(104),0],offsets=[];
  const p=lit.map((s,j)=>{for(let n=0;n<10000;n++){const a=Math.floor(s.length*.7)+rand(Math.floor(s.length*.25)),v=s.slice(a,a+L);if(zeros(v)<=counts[j]){offsets.push(a);return v;}}throw Error("donor counts");});
  const randpad=()=>Array.from({length:L},()=>rand(Q));let k,tapes,tries=0;
  do{k=randpad();tapes=p.map(s=>enc(s,k));if(++tries>500000)throw Error("shared count matching");}while(tapes.some((s,j)=>zeros(s)!==counts[j]));
  const independent=p.map((s,j)=>{for(let n=0;n<100000;n++){const v=enc(s,randpad());if(zeros(v)===counts[j])return v;}throw Error("independent count matching");});
  const flanks=orig.map((s,j)=>{const f=Array.from({length:s.length},()=>1+rand(28)),pos=[...Array(s.length).keys()].filter(i=>i<off[j]||i>=off[j]+L);
   for(let i=pos.length-1;i>0;i--){const k=rand(i+1);[pos[i],pos[k]]=[pos[k],pos[i]];}for(let i=0;i<totalCounts[j]-counts[j];i++)f[pos[i]]=0;return f;});
  function wrap(t){return flanks.map((s,j)=>{const x=s.slice();x.splice(off[j],L,...t[j]);check(zeros(x)===totalCounts[j],"full F");return x;});}
  controls.push({trial,off,offsets,tries,p,k,positive:wrap(tapes),negative:wrap(independent)});
 }
 return {n1:[...n1],n2:[...n2],trainRunes:total,original:orig,controls};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(offsetFixtures(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
