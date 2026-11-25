"use strict";
/** Exact all-tie p55 perimeter rank plus native p56 origin-zero prime/F cipher, both layer orders. CommonJS. */
const fs=require("node:fs"),path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,"../resources/liber-primus",n),"utf8");
function run(db,grid,reference){
 const mod=(x,q=29)=>(x%q+q)%q,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p))primes.push(n);
 const key=primes.map(x=>(x-1)%29),n=76,idx=Array.from({length:n},(_,i)=>i);
 const C=db.pages[55].indices;
 const train=[];
 const tokens=db.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
 function gp(word){word=word.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");const out=[];for(let j=0;j<word.length;){if(word.startsWith("ING",j)){out.push(21);j+=3;continue;}const t=tokens.find(x=>word.startsWith(x.s,j));if(!t)return [];out.push(t.i);j+=t.s.length;}return out;}
 let section=0;for(const line of reference.split(/\r?\n/)){const h=line.match(/^### (\d+)/);if(h){section=+h[1];continue;}if(!section||section>=56||[4,7,8].includes(section)||/^[#[(]/.test(line)||/\d/.test(line))continue;for(const w of line.match(/[A-Z]+/g)||[])train.push(...gp(w));}
 const u=new Uint32Array(29),b=new Uint32Array(29*29),t=new Uint32Array(29**3),bc=new Uint32Array(29),tc=new Uint32Array(29*29);
 for(let i=0;i<train.length;i++){u[train[i]]++;if(i>=1){b[29*train[i-1]+train[i]]++;bc[train[i-1]]++;}if(i>=2){const x=29*train[i-2]+train[i-1];t[29*x+train[i]]++;tc[x]++;}}
 const log=new Float64Array(29**3);
 for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const back=(b[29*y+z]+4*(u[z]+1)/(train.length+29))/(bc[y]+4);log[841*x+29*y+z]=Math.log((t[841*x+29*y+z]+4*back)/(tc[29*x+y]+4));}
 function score(p){let s=0;for(let i=2;i<p.length;i++)s+=log[841*p[i-2]+29*p[i-1]+p[i]];return s/(p.length-2);}
 function enc(p){let j=0;return p.map(x=>x===0?0:mod(x+key[j++]));}
 const p56=db.pages[56].indices.map((x,i)=>i===56?0:mod(x-key[i-(i>56?1:0)]));
 assert(eq(enc(p56),db.pages[56].indices),"native p56");
 function decode(c,cb){const z=c.reduce((n,x)=>n+(x===0),0);for(let mask=0;mask<2**z;mask++){const p=new Uint8Array(c.length);let k=0,f=0,ok=true;for(let i=0;i<c.length;i++){const x=c[i];if(x===0&&((mask>>f++)&1)){p[i]=0;continue;}const y=mod(x-key[k++]);if(y===0){ok=false;break;}p[i]=y;}if(ok)cb(p,mask);}}
 const ring=[...idx.slice(0,8)];for(let y=1;y<32;y++)ring.push(y*8+7);for(let x=6;x>=0;x--)ring.push(248+x);for(let y=30;y>=1;y--)ring.push(8*y);
 assert(ring.length===76&&new Set(ring).size===76,"ring");
 const vals=ring.map(i=>grid.bytes[i]);const groups=[...new Set(vals)].sort((a,b)=>a-b).map(v=>idx.filter(i=>vals[i]===v));
 function perms(g){if(g.length<=1)return [g];return g.flatMap((x,i)=>perms(g.filter((_,j)=>j!==i)).map(p=>[x,...p]));}
 let ranks=[[]];for(const g of groups)ranks=ranks.flatMap(p=>perms(g).map(q=>p.concat(q)));assert(ranks.length===384,"tie orders");
 function perm(p,order){return order.map(i=>p[i]);}
 function inverse(order){const o=Array(n);order.forEach((x,i)=>o[x]=i);return o;}
 function makeOrder(rank,origin,dir,desc,inv){let o=rank.map(x=>mod((x-origin)*dir,n));if(desc)o.reverse();return inv?inverse(o):o;}
 const inputs=[{label:"original",c:C},{label:"native-rank-last",p:db.pages[57].indices.slice(0,n),layer:0,rank:67,origin:23,dir:-1,desc:1,inv:1},{label:"native-prime-last",p:p56.slice(3,79),layer:1,rank:219,origin:51,dir:1,desc:0,inv:0}];
 for(const q of inputs.slice(1)){let o=makeOrder(ranks[q.rank],q.origin,q.dir,q.desc,q.inv);q.c=q.layer===0?perm(enc(q.p),inverse(o)):enc(perm(q.p,inverse(o)));}
 for(const q of inputs){q.pre=[];decode(q.c,(p,mask)=>q.pre.push({p,mask}));q.best=[null,null];q.valid=[0,0];}
 let count=0;
 for(let j=0;j<ranks.length;j++)for(let origin=0;origin<n;origin++)for(const dir of [-1,1])for(const desc of [0,1])for(const inv of [0,1]){
   const o=makeOrder(ranks[j],origin,dir,desc,inv);count++;
   for(const q of inputs){
    const consider=(p,mask,layer)=>{q.valid[layer]++;const s=score(p);if(!q.best[layer]||s>q.best[layer].score){q.best[layer]={score:s,p:Array.from(p),mask,layer,rank:j,origin,dir,desc,inv};}};
    decode(perm(q.c,o),(p,m)=>consider(p,m,0));
    for(const z of q.pre)consider(perm(z.p,o),z.mask,1);
   }
 }
 const controls=[];for(const page of [p56,db.pages[57].indices])for(let i=0;i<=page.length-n;i++)controls.push(score(page.slice(i,i+n)));
 const results=inputs.map(q=>({label:q.label,valid:q.valid,best:q.best.map(g=>{if(!g)return null;let o=makeOrder(ranks[g.rank],g.origin,g.dir,g.desc,g.inv),replay=g.layer===0?perm(enc(g.p),inverse(o)):enc(perm(g.p,inverse(o)));assert(eq(replay,q.c),"replay");return {...g,text:g.p.map(x=>db.translit[x]).join(""),matches:q.p?g.p.filter((x,i)=>x===q.p[i]).length:null};}),truthScore:q.p?score(q.p):null,rawPrimePaths:q.pre.length}));
 return {train:train.length,count,controls:{n:controls.length,min:Math.min(...controls),max:Math.max(...controls)},results};
}
console.log(JSON.stringify(run(JSON.parse(read("lp2-corpus.json")),JSON.parse(read("lp2-grid-256.json")),read("lp1-plaintext-reference.txt")),null,2));
