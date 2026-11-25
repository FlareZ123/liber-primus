"use strict";
const fs=require("node:fs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw,spec) {
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const hold=new Set(["0_koan_1","0_loss_of_divinity"]);
 const train=gold.sections.filter(s=>!hold.has(s.name)).map(s=>words(s.source_text));
 const types=new Set();for(const a of train)for(const w of a)types.add(id(w));for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const lex=Array.from({length:30},()=>[]);for(const w of types)if(w.length<30)lex[w.length].push(nums(w));
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3);let total=0;for(const a of train){const t=a.flat();for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i)bi[t[i-1]*29+t[i]]++;if(i>1)tri[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
 const lm=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const p0=(uni[c]+0.5)/(total+14.5),p1=(bi[b*29+c]+8*p0)/(uni[b]+8),p2=(tri[(a*29+b)*29+c]+8*p1)/(bi[a*29+b]+8);lm[(a*29+b)*29+c]=Math.log(p2);}
 const score=t=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 const M=n=>29n**BigInt(n),mod=(x,m)=>(x%m+m)%m;
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}if(r!==1n)throw Error("nonunit "+a);return mod(t,m);}
 function int(a,orient){const v=orient==="BE"?a:a.slice().reverse();return v.reduce((n,x)=>n*29n+BigInt(x),0n);}
 function dig(v,n,orient){const a=Array(n);for(let i=0;i<n;i++){a[orient==="BE"?n-1-i:i]=Number(v%29n);v/=29n;}if(v)throw Error("overflow");return a;}
 function transform(a,k,orient,mode,decode){const m=M(a.length);const mul=(mode==="encMultiplier")===decode?inv(k,m):k;return dig(int(a,orient)*mul%m,a.length,orient);}
 function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
 const fmt=t=>t.map(x=>gp.translit[x]).join(""),span=(a,lo,hi)=>a.filter(w=>w.start>=lo&&w.start+w.w.length<=hi);
 function wordScore(p,ws,base){let hit=0,all=0;for(const w of ws){all+=w.w.length;if(types.has(id(p.slice(w.start-base,w.start-base+w.w.length))))hit+=w.w.length;}return {hit,all};}
 function layout(a){let off=0;return a.map(w=>{const p={w,start:off};off+=w.length;return p;});}
 const W=[];let w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(W.length!==2896||tape.length!==12956||!same(W.flat(),tape))throw Error("source mismatch");
 



const I=Array.from({length:29},(_,i)=>i?Number(inv(BigInt(i),29n)):0),md=x=>(x%29+29)%29;
const project=a=>{const p=a.find(x=>x);return p?Uint8Array.from(a,x=>x*I[p]%29):null;};
const linekey=(a,b)=>{let p0=a.p,p1=b.p;if(p1<p0){[a,b]=[b,a];p0=a.p;}const u=a.v,v=b.v,t=v[p0];p1=-1;let den=0;for(let j=p0+1;j<7;j++){den=md(v[j]-t*u[j]);if(den){p1=j;break;}}if(p1<0)return -1;const iv=I[den],q=u[p1];let k=(p0*(13-p0)/2+p1-p0-1),s=0;for(let j=0;j<7;j++)if(j!==p0&&j!==p1){const z=md((v[j]-t*u[j])*iv);k=k*29+md(u[j]-q*z);s=s*29+z;}return k*29**5+s;};
const groupSpecs=[[275,8,1],[465,7,0],[653,9,1],[708,10,0]];
const {plant=false}=spec;let ct=tape;
if(plant){const C=Array.from(tape.slice(0,729)),rowA=Array.from({length:27},(_,i)=>(i*7+3)%29),rowB=Array.from({length:27},(_,i)=>(i*i+5)%29),colA=Array.from({length:27},(_,i)=>(i*3+4)%29),colB=Array.from({length:27},(_,i)=>(i*i*2+7)%29);for(const [start,n]of groupSpecs){const w=lex[n][Math.floor(lex[n].length/3)];for(let i=0;i<n;i++){const k=start+i,row=Math.floor(k/27),col=k%27;C[k]=md(w[i]+rowA[row]*colA[col]+rowB[row]*colB[col]);}}ct=C;}
const rank1=[];if(!plant)for(const aff of [false,true]){const d=[95,203].map(start=>{const m=new Map();for(const w of lex[8]){let v=w.map((x,i)=>md(tape[start+i]-x));if(aff){const z=v[0];v=v.map(x=>md(x-z));}const q=project(v),k=q?id(q):"zero";m.set(k,(m.get(k)??0)+1);}return m;});let pairs=0;for(const [k,a]of d[0]){if(k==="zero"){pairs+=a*lex[8].length;continue;}pairs+=a*((d[1].get(k)??0)+(d[1].get("zero")??0));}rank1.push({aff,pairs,zeros:d.map(m=>m.get("zero")??0)});}
const domains=groupSpecs.map(([start,n,cut])=>{const M=new Map();let zero=0;for(const w of lex[n]){const v=project(w.slice(cut,cut+7).map((x,i)=>md(ct[start+cut+i]-x)));if(!v){zero++;continue;}M.set(id(v),{v,p:v.findIndex(Boolean)});}return {start,n,cut,zero,values:[...M.values()],keys:new Set(M.keys())};});
const intersects=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)intersects.push([i,j,[...domains[i].keys].filter(k=>domains[j].keys.has(k)).length]);if(domains.some(d=>d.zero)||intersects.some(q=>q[2]))throw Error("dependent case not covered");
const d=domains.map(x=>x.values),a=d[2],b=d[3],c=d[0],e=d[1],pairA=a.length*b.length,pairB=c.length*e.length;const size=2**Math.ceil(Math.log2(pairA*1.5)),mask=size-1,table=new Float64Array(size);
const hash=k=>(Math.imul(k>>>0,0x9e3779b1)^Math.imul(Math.floor(k/4294967296),0x85ebca6b))>>>0&mask;
let inserted=0,hits=0,examples=new Set();const start=Date.now();
for(const u of a)for(const v of b){const key=linekey(u,v)+1;if(key===0)throw Error("dependent");let i=hash(key);while(table[i]&&table[i]!==key)i=(i+1)&mask;if(!table[i]){table[i]=key;inserted++;}}
for(const u of c)for(const v of e){const key=linekey(u,v)+1;if(key===0)throw Error("dependent");let i=hash(key);while(table[i]&&table[i]!==key)i=(i+1)&mask;if(table[i]){hits++;examples.add(key);}}
return {plant,rank1,domains:domains.map(d=>({start:d.start,n:d.n,cut:d.cut,zero:d.zero,directions:d.values.length})),intersects,pairA,pairB,inserted,hits,lines:examples.size,exampleKeys:[...examples].slice(0,20),ms:Date.now()-start};
}

const specs=[{plant:false},{plant:true}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
for(const spec of specs)console.log(JSON.stringify(run(raw,spec)));
