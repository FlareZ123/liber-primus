'use strict';
const fs=require('fs');
function main(lex,fixture,profile){
const S="0123456789abcdefghijklmnopqrs",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],idx=new Map(A.map((x,i)=>[x,i])),D=new Set();
for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(!m)continue;const w=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,s){if(i===w.length){D.add(s);return}for(let k=1;k<=3&&i+k<=w.length;k++){const t=w.slice(i,i+k),v=k===3?(t==="ING"?21:undefined):idx.get(t);if(v!==undefined)rec(i+k,s+S[v])}}rec(0,"")}
for(const x of fixture.added.split(/\s+/))if(x)D.add(x);if(D.size!==38938)throw Error("dictionary "+D.size);
const by=Array.from({length:64},()=>[]);for(const w of D)by[w.length].push(w);const prefix=[...new Set(by[11].map(w=>w.slice(0,10)))];

const K=[19,21,23,27,2,14,10,19],line=[10,31,48,71,93,115,136,159,180,202];
const gs=profile.p54.body_groups, t=[...gs.join("")].map(x=>S.indexOf(x));
if(t.length!==223||gs.length!==48||gs[47]!=="63g2eis46q")throw Error("profile");
const seam=gs.slice(0,-1).map((_,i)=>gs.slice(0,i+1).reduce((s,w)=>s+w.length,0));
function schedules(t,boundaries){
 const B=new Set(boundaries),n=t.length,d=Array.from({length:n+1},()=>Array(8).fill(0));
 for(let i=n-1;i>=0;i--)for(let p=0;p<8;p++){
  let v=Infinity;for(let j=0;j<8;j++){if(j!==p&&!B.has(i))continue;let z=+(j!==p);
   if(t[i]===0)v=Math.min(v,z+d[i+1][j]);
   if(t[i]!==K[j])v=Math.min(v,z+d[i+1][(j+1)%8]);}d[i][p]=v;
 }
 const cost=Math.min(...d[0]),paths=[],tokens=[],resets=[];
 if(!Number.isFinite(cost))return {cost:null,paths};
 function visit(i,p,start){
  if(i===n){paths.push({start,end:p,tokens:[...tokens],resets:[...resets]});return}
  for(let j=0;j<8;j++){if(j!==p&&!B.has(i))continue;let z=+(j!==p);if(z)resets.push(i);
   if(t[i]===0&&z+d[i+1][j]===d[i][p]){tokens.push(-1);visit(i+1,j,start);tokens.pop()}
   if(t[i]!==K[j]&&z+d[i+1][(j+1)%8]===d[i][p]){tokens.push(t[i]*29+K[j]);visit(i+1,(j+1)%8,start);tokens.pop()}
   if(z)resets.pop();
  }
 }
 for(let p=0;p<8;p++)if(d[0][p]===cost)visit(0,p,p);
 return {cost,paths};
}
function compatible(t,p,u,q){
 const c=Math.floor(t/29),k=t%29,d=Math.floor(u/29),l=u%29;
 if(c===d)return (p===q&&k===l)||(p===l&&q===k)||(p!==q&&k!==l&&p!==l&&q!==k);
 return !(p===q&&k===l)&&!(p===l&&q===k);
}
const pop=x=>{x>>>=0;x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
const cache=new Map();
function domain(g,ts){
 const key=g+":"+ts.join(",");if(cache.has(key))return cache.get(key);
 const opts=[];for(const w of g===47?prefix:by[ts.length]){
  const es=[];let ok=true;for(let i=0;i<w.length;i++){
   const p=S.indexOf(w[i]),t=ts[i];if(t===-1){if(p!==0){ok=false;break}continue}
   if(p===0||p===Math.floor(t/29)||es.some(([u,q])=>!compatible(t,p,u,q))){ok=false;break}
   if(!es.some(([u,q])=>u===t&&q===p))es.push([t,p]);
  }if(ok)opts.push({w,es});
 }cache.set(key,opts);return opts;
}
function gate(groups,path,budget,truth){
 let i=0;const dom=groups.map((w,g)=>({g,options:domain(g,path.tokens.slice(i,i+=w.length))}));
 const size=()=>dom.reduce((s,g)=>s+g.options.length,0),initial=size();let rounds=0;
 const tokens=[...new Set(path.tokens.filter(x=>x>=0))];
 const compat=new Map();for(const t of tokens)for(let p=1;p<29;p++){
  const a=new Uint32Array(841);for(const u of tokens){let m=0;for(let q=1;q<29;q++)if(compatible(t,p,u,q))m|=1<<q;a[u]=m}compat.set(t*29+p,a);
 }
 for(;;){
  if(truth&&dom.some((g,i)=>!g.options.some(o=>o.w===truth[i])))throw Error("lost plant");
  const forced=dom.filter(g=>!g.options.length).map(g=>g.g);
  if(forced.includes(47)||forced.length>budget)return {excluded:true,initial,final:size(),rounds,forced};
  rounds++;
  const lo=new Uint32Array(841*29),hi=new Uint32Array(841*29);
  for(const g of dom){
   if(!g.options.length)continue;const sup=new Map();
   for(const o of g.options)for(const [u,q] of o.es)sup.set(u,(sup.get(u)||0)|(1<<q));
   const flags=g.g<32?lo:hi,bit=1<<(g.g%32);
   for(const [id,masks] of compat)for(const [u,m] of sup)if(!(masks[u]&m)){flags[id]|=bit;break}
  }
  let change=0;for(const g of dom){
   const n=g.options.length;g.options=g.options.filter(o=>{let a=0,b=0;for(const [t,p] of o.es){a|=lo[t*29+p];b|=hi[t*29+p]}return !(b&(1<<15))&&pop(a)+pop(b)+forced.length<=budget});change+=n-g.options.length;
  }
  if(!change)return {excluded:false,initial,final:size(),rounds,forced};
 }
}
const structure={};for(const [name,b] of [["none",[]],["line",line],["word",seam],["any",Array.from({length:222},(_,i)=>i+1)]]){
 const z=schedules(t,b);structure[name]={cost:z.cost,paths:z.paths.length,pairs:[...new Set(z.paths.map(p=>p.resets.join(",")))],ends:[...new Set(z.paths.map(p=>p.end))]};
 if(name==="line"||name==="word"){
  const results=z.paths.map(p=>gate(gs,p,3));
  structure[name].excluded=results.filter(x=>x.excluded).length;
  structure[name].final=[Math.min(...results.map(x=>x.final)),Math.max(...results.map(x=>x.final))];
 }
}
return {dictionary:D.size,prefix:prefix.length,structure};
}
const files=["resources/control/english_wordfreq_textblob.txt","im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json","resources/liber-primus/lp2-page-groups-54-55-derived.json"];const v=files.map(p=>fs.readFileSync(p,'utf8'));console.log(JSON.stringify(main(v[0],JSON.parse(v[1]),JSON.parse(v[2])),null,2));
