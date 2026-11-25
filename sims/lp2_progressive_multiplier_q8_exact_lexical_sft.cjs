'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,transcript,gold,dict){
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},idx=new Map(gp.runes.map((x,i)=>[x,i]));
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>idx.get(r)))}));
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function spell(s,alt){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let i=0;i<s.length;){if(alt&&s.startsWith("ING",i)){p.push(21);i+=3;continue}if(alt&&s.startsWith("IO",i)){p.push(27);i+=2;continue}const t=tokens.find(t=>s.startsWith(t[0],i));if(!t)return [];p.push(t[1]);i+=t[0].length}return p}
 function lex(exclude){const L=new Map();function add(p){if(!p.length)return;const d=L.get(p.length)||new Map();d.set(p.join(),p);L.set(p.length,d)}for(const line of dict.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true])add(spell(m[1],alt));}for(const s of native)if(s.name!==exclude)for(const w of s.words)add(w);for(let x=0;x<29;x++)add([x]);return L}
 const powers=Array.from({length:29},(_,a)=>{const p=[1];for(let j=1;j<500;j++)p.push(mod(p.at(-1)*a));return p;});const inverse=Array.from({length:29},(_,x)=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;return 0});
 function enc(p,a,K,start=0){let j=start;return p.map(x=>{if(!x)return 0;const v=mod(powers[a][Math.floor(j/8)]*x+K[j%8]);j++;return v;});}
 const all=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let pos=0,w=[];for(const ch of transcript){if(idx.has(ch)){w.push(idx.get(ch));pos++;}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push({start:pos-w.length,w});w=[];}}if(w.length)words.push({start:pos-w.length,w});assert(words.flatMap(x=>x.w).slice(0,12956).join()===all.join(),"canonical groups");
 function solve(c,lens,L,aa,cap=10000){
  const z=c.map((x,i)=>!x?i:-1).filter(x=>x>=0);if(z.length>12)return {capped:true,why:"visible zero mask limit",zeros:z.length,solutions:[]};
  const starts=[];let off=0;for(const n of lens){starts.push(off);off+=n;}assert(off===c.length,"word framing");
  const order=lens.map((_,i)=>i).sort((i,j)=>lens[j]-lens[i]);const cache=new Map(),solutions=[];let nodes=0,capped=false,branches=0,emptyMask=0,domainReject=0,dfsReject=0,found=0;
  const row=[];
  for(let m=0;m<2**z.length;m++){const hold=new Set(z.filter((_,i)=>m&(1<<i)));let j=0;const active=c.map((_,i)=>hold.has(i)?-1:j++),allowed=Array(8).fill((1<<29)-1);
   for(let i=0;i<c.length;i++)if(active[i]>=0)allowed[active[i]%8]&=~(1<<c[i]);
   if(allowed.some(x=>!x)){emptyMask++;continue;}
   for(const a of aa){branches++;const vs=[];let possible=true;const used=Array(8).fill(0);
    for(const wi of order){
     const n=lens[wi],st=starts[wi],cc=c.slice(st,st+n),js=active.slice(st,st+n),slots=[...new Set(js.filter(x=>x>=0).map(x=>x%8))].sort((a,b)=>a-b),at=js.map(x=>x<0?-1:slots.indexOf(x%8)),mult=js.map(x=>x<0?0:powers[a][Math.floor(x/8)]),d=[];
     const ck=a+":"+wi+":"+js.join();let base=cache.get(ck);
     if(!base){base=[];for(const P of L.get(n)?.values()||[]){const k=Array(slots.length).fill(-1);let ok=true;for(let i=0;i<n;i++){if((js[i]<0)!==(P[i]===0)){ok=false;break;}if(js[i]<0)continue;const v=mod(cc[i]-mult[i]*P[i]);if(k[at[i]]>=0&&k[at[i]]!==v){ok=false;break;}k[at[i]]=v;}if(ok)base.push({k,P});}cache.set(ck,base);}
     for(const x of base)if(x.k.every((k,i)=>allowed[slots[i]]&(1<<k)))d.push(x);
     if(!d.length){possible=false;domainReject++;break;}
     vs.push({wi,slots,d});
    }
    if(!possible)continue;
    const arcs=[];for(let i=0;i<vs.length;i++)for(let j=i+1;j<vs.length;j++){const s=vs[i].slots.filter(x=>vs[j].slots.includes(x));if(s.length)arcs.push({i,j,pi:s.map(x=>vs[i].slots.indexOf(x)),pj:s.map(x=>vs[j].slots.indexOf(x))});}arcs.sort((x,y)=>y.pi.length-x.pi.length);
    const sig=(x,p)=>p.map(k=>String.fromCharCode(65+x.k[k])).join("");
    function prop(ds){let changed=true;while(changed){changed=false;for(const {i,j,pi,pj} of arcs){const A=new Set(ds[i].map(x=>sig(x,pi))),B=new Set(ds[j].map(x=>sig(x,pj)));const di=ds[i].filter(x=>B.has(sig(x,pi))),dj=ds[j].filter(x=>A.has(sig(x,pj)));if(!di.length||!dj.length)return false;if(di.length!==ds[i].length||dj.length!==ds[j].length)changed=true;ds[i]=di;ds[j]=dj;}}return true;}
    const ds=vs.map(x=>x.d);if(!prop(ds)){domainReject++;continue;}const before=solutions.length;
    function dfs(ds){if(++nodes>cap||solutions.length>=100){capped=true;return;}let i=-1;for(let k=0;k<ds.length;k++)if(ds[k].length>1&&(i<0||ds[k].length<ds[i].length))i=k;
     if(i<0){const K=Array(8).fill(-1),P=[];vs.forEach((v,i)=>{v.slots.forEach((s,k)=>K[s]=ds[i][0].k[k]);P[v.wi]=ds[i][0].P;});const p=P.flat();assert(enc(p,a,K).join()===c.join(),"solution replay");solutions.push({a,K,P:p,active:j,hold:[...hold]});return;}
     for(const x of ds[i]){const dn=ds.slice();dn[i]=[x];if(prop(dn))dfs(dn);if(capped)return;}
    }dfs(ds);if(solutions.length===before)dfsReject++;else found++;
    if(capped)return {capped,zeros:z.length,branches,nodes,emptyMask,domainReject,dfsReject,found,solutions};
   }
  }
  return {capped,zeros:z.length,branches,nodes,emptyMask,domainReject,dfsReject,found,solutions};
 }
 function decode(c,a,K,start,name){
  const uni=new Uint32Array(29),tri=new Map(),ctx=new Map();let total=0;
  for(const s of native)if(s.name!==name){const p=s.words.flat();for(let i=0;i<p.length;i++){uni[p[i]]++;total++;if(i>1){const h=p[i-2]*29+p[i-1],t=h*29+p[i];ctx.set(h,(ctx.get(h)||0)+1);tri.set(t,(tri.get(t)||0)+1);}}}
  function score(p,x){const base=(uni[x]+1)/(total+29);if(p.length<2)return Math.log(base);const h=p.at(-2)*29+p.at(-1);return Math.log(((tri.get(h*29+x)||0)+5*base)/((ctx.get(h)||0)+5));}
  let states=new Map([[String(start),{j:start,p:[],score:0}]]);for(const x of c){const next=new Map();for(const t of states.values()){function put(p,j){const v=t.score+score(t.p,p),u=t.p.concat(p),k=j+":"+u.slice(-2).join(),o=next.get(k);if(!o||v>o.score)next.set(k,{j,p:u,score:v});}if(!x)put(0,t.j);const p=mod((x-K[t.j%8])*inverse[powers[a][Math.floor(t.j/8)]]);if(p)put(p,t.j+1);}states=next;if(!states.size)return null;}return [...states.values()].sort((a,b)=>b.score-a.score)[0];
 }
 const start=gp.pages.filter(p=>p.page<40).reduce((n,p)=>n+p.indices.length,0),original=words.filter(w=>w.start>=start&&w.start+w.w.length<=start+162),c=original.flatMap(x=>x.w),lens=original.map(x=>x.w.length);assert(c.length===162,"original prefix");
 const L=lex(null),aa=Array.from({length:28},(_,i)=>i+1),orig=solve(c,lens,L,aa.slice(1));
 const controls=[];
 for(const [name,a,target,skip,seed] of [["0_welcome",28,120,1,3],["0_koan_1",7,120,2,8],["jpg107-167",2,120,2,17],["0_welcome",1,120,1,22]]){
  const L=lex(name),p=native.find(x=>x.name===name).words.slice(skip),K=Array.from({length:8},(_,i)=>mod(7*i*i+seed*i+seed));let fit=0,n=0;while(n<target&&fit<p.length)n+=p[fit++].length;const w=p.slice(0,fit),hold=p.slice(fit,fit+15),P=w.flat(),H=hold.flat(),full=enc(P.concat(H),a,K),OOV=w.filter(x=>!L.get(x.length)?.has(x.join())).map(x=>x.map(i=>gp.translit[i]).join(""));
  const r=solve(full.slice(0,n),w.map(x=>x.length),L,aa);const exact=r.solutions.filter(x=>x.a===a&&x.K.join()===K.join()&&x.P.join()===P.join());let held=null;
  if(!r.capped&&r.solutions.length===1){const s=r.solutions[0],h=decode(full.slice(n),s.a,s.K,s.active,name);held={runes:H.length,hits:h?.p.filter((x,i)=>x===H[i]).length??0,replay:h?enc(s.P.concat(h.p),s.a,s.K).join()===full.join():false};}
  controls.push({name,a,fit:n,holdout:H.length,visibleZeros:full.slice(0,n).filter(x=>!x).length,trueF:P.filter(x=>!x).length,OOV,solutions:r.solutions.length,exact:exact.length,held,capped:r.capped,branches:r.branches,nodes:r.nodes});
 }
 return {lexicon:[...L.values()].reduce((a,x)=>a+x.size,0),original:{start,length:c.length,groups:lens,...orig},controls};
}
const raw=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),raw[1],JSON.parse(raw[2]),raw[3]),null,2));
