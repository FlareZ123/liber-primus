'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(raw){
const c=JSON.parse(raw[0]),g=JSON.parse(raw[1]),tokens=g.pages.flatMap(p=>p.tokens),K=[...new Set(tokens)],ids=tokens.map(t=>K.indexOf(t)),C=c.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
if(C.length!==3008||tokens.length!==256||K.length!==161)throw Error("source dimensions");
const sum=v=>v.reduce((a,b)=>a+b,0),pair=v=>sum([...v].map(n=>n*(n-1)/2));
const hist=C=>{const h=Array.from({length:K.length},()=>new Int32Array(29));for(let i=0;i<C.length;i++)h[ids[i%256]][C[i]]++;return h;};
const h=hist(C),bound=Array(29).fill(0);for(const a of h){let s=0;[...a].sort((a,b)=>b-a).forEach((n,i)=>{s+=n;bound[i]+=s})}
const map=new Map(c.runes.map((s,i)=>[s,i])),tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token");out.push(t.i);w=w.slice(t.s.length)}}return out}
function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end);if(a<0||b<=a)throw Error("donor bounds");return s.slice(a,b)}
const ds=[["Gibran",donor(body(raw[2],"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(raw[3])],["Emerson",donor(body(raw[4],"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
const col=v=>sum(hist(v).map(pair)),phaseCol=v=>{const h=Array.from({length:256},()=>new Int32Array(29));v.forEach((x,i)=>h[i%256][x]++);return sum(h.map(pair))};
const nat=JSON.parse(raw[5]),np=nat.sections.flatMap(s=>[...s.source_text].filter(x=>map.has(x)).map(x=>map.get(x))),fh=Array(29).fill(0);np.forEach(x=>fh[x]++);const top=[...fh.keys()].sort((a,b)=>fh[b]-fh[a]);const selectedPairs=[[top[0],top[1]],[top[0],top[2]],[top[0],top[3]]];const pairBounds=selectedPairs.map(([a,b])=>({a,b,max:sum(h.map(v=>Math.max(...Array.from({length:29},(_,k)=>v[(a+k)%29]+v[(b+k)%29]))))}));
const eq=col(C);
const refs=ds.map(([name,d])=>{const windows=Array.from({length:32},(_,i)=>{const start=Math.round(i*(d.length-C.length)/31),v=d.slice(start,start+C.length),f=Array(29).fill(0);v.forEach(x=>f[x]++);let s=0;const deficits=[...f].sort((a,b)=>b-a).map((n,i)=>((s+=n)-bound[i]));return {start,col:col(v),q256Col:phaseCol(v),E:f[18],maxDef:Math.max(...deficits),pairDef:pairBounds.map(x=>f[x.a]+f[x.b]-x.max)};});return {name,n:d.length,colMin:Math.min(...windows.map(w=>w.col)),colMax:Math.max(...windows.map(w=>w.col)),q256Min:Math.min(...windows.map(w=>w.q256Col)),q256Max:Math.max(...windows.map(w=>w.q256Col)),minDef:Math.min(...windows.map(w=>w.maxDef)),passHist:windows.filter(w=>w.maxDef<=0).length,passPair:windows.filter(w=>Math.max(...w.pairDef)<=0).length,passCol:windows.filter(w=>w.col===eq).length,windows};});
let seed=0x293445;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
const controls=ds.map(([name,d])=>{const p=d.slice(0,C.length),k=K.map(()=>rng()%29),ct=p.map((x,i)=>(x+k[ids[i%256]])%29),ht=hist(ct),b=Array(29).fill(0);for(const v of ht){let s=0;[...v].sort((a,b)=>b-a).forEach((x,i)=>{s+=x;b[i]+=s})}
const f=Array(29).fill(0);p.forEach(x=>f[x]++);let s=0;const pass=[...f].sort((a,b)=>b-a).every((x,i)=>(s+=x)<=b[i]);const same=col(p)===col(ct);if(!same||!pass||ct.some((x,i)=>(x-k[ids[i%256]]+29)%29!==p[i]))throw Error("planted control failed");return {name,n:p.length,plainCollisions:col(p),cipherCollisions:col(ct),prefixBoundPass:pass,exactInverse:true};});
return {model:"One unknown additive GP29 shift per distinct case-sensitive literal grid token, 256 row-major cycle, phase0 at physical p40, ordinary consuming, no F hold",n:C.length,classes:K.length,eq,q256Eq:phaseCol(C),eligiblePairs:sum(h.map(v=>{const n=sum(v);return n*(n-1)/2})),bound,pairBounds,nativeTop:top.slice(0,8),refs,controls,scope:"Fixed ordered donor windows, exact same-token equality, sorted histogram/pair bounds independent of plaintext positional transport. No language fit after fixed native-window gate."};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
