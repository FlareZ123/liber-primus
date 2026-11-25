'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,transcript,gold,dict){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,idx=new Map(gp.runes.map((x,i)=>[x,i])),primes=[];
 for(let x=2;primes.length<13000;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x);}
 const phase=primes.map(x=>x%29),native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>idx.get(r)))}));
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function spell(s,alt){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let i=0;i<s.length;){if(alt&&s.startsWith("ING",i)){p.push(21);i+=3;continue}if(alt&&s.startsWith("IO",i)){p.push(27);i+=2;continue}const t=tokens.find(t=>s.startsWith(t[0],i));if(!t)return [];p.push(t[1]);i+=t[0].length}return p}
 function lex(exclude){const L=new Map();function add(p){if(!p.length)return;const d=L.get(p.length)||new Map();d.set(p.join(),p);L.set(p.length,d)}for(const line of dict.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true])add(spell(m[1],alt));}for(const s of native)if(s.name!==exclude)for(const w of s.words)add(w);for(let x=0;x<29;x++)add([x]);return L}
 function enc(p,K,start=0){let j=start;return p.map(x=>!x?0:mod(x+K[phase[j++]]))}
 const p56=gp.pages.find(p=>p.page===56).indices,plain56=native.find(x=>x.name==="p56_an_end").words.flat(),actual=Array.from({length:29},(_,r)=>mod(r-1));assert(enc(plain56,actual).join()===p56.join(),"p56 actual replay");
 const all=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let pos=0,w=[];for(const ch of transcript){if(idx.has(ch)){w.push(idx.get(ch));pos++;}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push({start:pos-w.length,w});w=[];}}if(w.length)words.push({start:pos-w.length,w});assert(words.flatMap(x=>x.w).slice(0,12956).join()===all.join(),"canonical groups");
 function masks(c){const z=c.map((x,i)=>!x?i:-1).filter(x=>x>=0);assert(z.length<=15,"mask cap");return Array.from({length:2**z.length},(_,m)=>{const hold=new Set(z.filter((_,i)=>m&(1<<i)));let j=0;return {hold:[...hold],r:c.map((_,i)=>hold.has(i)?-1:phase[j++]),active:j};})}
 function domains(c,lens,r,L){let off=0;return lens.map(n=>{const cc=c.slice(off,off+n),rr=r.slice(off,off+n),start=off;off+=n;const slots=[...new Set(rr.filter(x=>x>=0))].sort((a,b)=>a-b),at=rr.map(x=>slots.indexOf(x));const d=[];for(const P of L.get(n)?.values()||[]){const a=Array(slots.length).fill(-1);let ok=true;for(let i=0;i<n;i++){if((rr[i]<0)!==(P[i]===0)){ok=false;break;}if(rr[i]<0)continue;const k=mod(cc[i]-P[i]);if(a[at[i]]>=0&&a[at[i]]!==k){ok=false;break;}a[at[i]]=k;}if(ok)d.push({a,P});}return {start,slots,d};})}
 function arcs(v){const a=[];for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++){const s=v[i].slots.filter(x=>v[j].slots.includes(x));if(s.length)a.push({i,j,pi:s.map(x=>v[i].slots.indexOf(x)),pj:s.map(x=>v[j].slots.indexOf(x))});}a.sort((x,y)=>y.pi.length-x.pi.length);return a}
 function prop(d,a){let changed=true;while(changed){changed=false;if(d.some(x=>!x.length))return false;for(const {i,j,pi,pj} of a){if(d[i].length===1&&d[j].length===1){if(pi.some((x,k)=>d[i][0].a[x]!==d[j][0].a[pj[k]]))return false;continue;}const sig=(x,p)=>p.map(k=>String.fromCharCode(65+x.a[k])).join("");const A=new Set(d[i].map(x=>sig(x,pi))),B=new Set(d[j].map(x=>sig(x,pj)));const di=d[i].filter(x=>B.has(sig(x,pi))),dj=d[j].filter(x=>A.has(sig(x,pj)));if(!di.length||!dj.length)return false;if(di.length!==d[i].length||dj.length!==d[j].length)changed=true;d[i]=di;d[j]=dj;}}return true}
 function solve(c,lens,L,{cap=20000,maxSolutions=1000}={}){let nodes=0,capped=false,solutions=[],rows=[];for(const m of masks(c)){
 const v=domains(c,lens,m.r,L),a=arcs(v),d=v.map(x=>x.d),before=d.map(x=>x.length);
 if(!prop(d,a)){rows.push({hold:m.hold,before,gate:false});continue;}
 rows.push({hold:m.hold,before,after:d.map(x=>x.length),gate:true});
 function dfs(ds){if(++nodes>cap||solutions.length>=maxSolutions){capped=true;return;}let b=-1;for(let i=0;i<ds.length;i++)if(ds[i].length>1&&(b<0||ds[i].length<ds[b].length))b=i;
 if(b<0){const K=Array(29).fill(-1),P=ds.flatMap(x=>x[0].P);for(let i=0;i<v.length;i++)v[i].slots.forEach((r,j)=>K[r]=ds[i][0].a[j]);assert(enc(P,K).join()===c.join(),"solution replay");solutions.push({K,P,hold:m.hold,active:m.active});return;}
 for(const x of ds[b]){const dn=ds.slice();dn[b]=[x];if(prop(dn,a))dfs(dn);if(capped)return;}
 }dfs(d);if(capped)break;
 }return {nodes,capped,solutions,rows};}
 const start=gp.pages.filter(p=>p.page<40).reduce((n,p)=>n+p.indices.length,0),C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 const originalWords=words.filter(w=>w.start>=start&&w.start+w.w.length<=start+162);const c=originalWords.flatMap(x=>x.w),lens=originalWords.map(x=>x.w.length);assert(c.length===162&&c.join()===C.slice(0,162).join(),"original fixed prefix");
 const L=lex(null),original=solve(c,lens,L);
 const controls=[];for(const name of ["0_welcome","0_koan_1"]){const s=native.find(s=>s.name===name),L=lex(name),K=Array.from({length:29},(_,i)=>mod(i*i*7+11*i+3));const w=s.words.slice(name==="0_welcome"?1:2);let fitN=0,len=0;while(len<130&&fitN<w.length){len+=w[fitN++].length;}const fit=w.slice(0,fitN),hold=w.slice(fitN,fitN+12),P=fit.flat(),H=hold.flat(),full=enc(P.concat(H),K),OOV=fit.concat(hold).filter(x=>!L.get(x.length)?.has(x.join())).map(x=>x.map(i=>gp.translit[i]).join(""));
 const z=full.slice(0,P.length).filter(x=>x===0).length;const r=solve(full.slice(0,P.length),fit.map(x=>x.length),L,{cap:20000,maxSolutions:1000});const matches=r.solutions.filter(x=>x.P.join()===P.join()&&x.K.every((k,i)=>k<0||k===K[i]));let held=null;
 if(r.solutions.length===1&&!r.capped){const s=r.solutions[0],out=[],a=[];let nodes=0;function go(i,j){if(++nodes>100000)return;if(i===H.length){let off=0;if(hold.every(w=>{const p=a.slice(off,off+w.length);off+=w.length;return L.get(w.length)?.has(p.join());}))out.push([...a]);return;}const x=full[P.length+i];if(!x){a.push(0);go(i+1,j);a.pop();}const k=s.K[phase[j]];if(k>=0){const p=mod(x-k);if(p){a.push(p);go(i+1,j+1);a.pop();}}}go(0,s.active);held={paths:out.length,hits:out.length===1?out[0].filter((x,i)=>x===H[i]).length:0,runes:H.length,unseen:s.K.flatMap((x,i)=>x<0?[i]:[]),tableExact:s.K.every((x,i)=>x===K[i])};}
 controls.push({name,fitRunes:P.length,zeros:z,trueF:P.filter(x=>!x).length,consumingZeros:z-P.filter(x=>!x).length,tableDistinct:new Set(K).size,OOV,fitMasks:r.rows.length,gateMasks:r.rows.filter(x=>x.gate).length,solutions:r.solutions.length,correct:matches.length,capped:r.capped,nodes:r.nodes,held});
 }
 return {p56Replay:p56.length,lexicon:[...L.values()].reduce((a,x)=>a+x.size,0),original:{start,length:c.length,groups:lens,zeros:c.filter(x=>!x).length,...original},controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),raw[1],JSON.parse(raw[2]),raw[3]),null,2));
