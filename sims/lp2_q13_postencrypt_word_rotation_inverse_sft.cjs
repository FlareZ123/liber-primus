"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw){
 const Q=29,T=13,mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:Q},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 if(types.size!==35944)throw Error("lexicon "+types.size);
 const byLen=Array.from({length:25},()=>[]);for(const s of types)byLen[s.length].push(nums(s));
 const words=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);if(words.length!==2896||id(words.flat())!==id(tape))throw Error("source");
 let off=0;const terminal=[];for(const C of words){if(off>=12648)terminal.push({off,C});off+=C.length;}
 const fit=terminal.filter(x=>x.off+x.C.length<=12880),held=terminal.slice(fit.length);
 if(terminal.length!==66||fit.length!==49||held.length!==17)throw Error("split");
 const rotate=(a,r)=>a.slice(r).concat(a.slice(0,r));
 // A zero-free ciphertext group requires a zero-free plaintext and consumes its full length.
 function localDomain(C){
   const d=new Set();for(let r=0;r<C.length;r++){const c=rotate(C,r);for(const p of byLen[C.length]){if(p.includes(0))continue;d.add(id(c.map((v,i)=>mod(v-p[i]))));}}return [...d];
 }
 function domains(rows){
   const anchors=[];let pos=0,zero=0;
   for(let i=0;i<rows.length;i++){const {C,off}=rows[i];if(C.length>=7&&!C.includes(0))anchors.push({i,off,n:C.length,pos,zero,d:localDomain(C)});pos+=C.length;zero+=C.filter(x=>x===0).length;}
   return {anchors,zero};
 }
 const pop=n=>{let c=0;while(n){n&=n-1;c++;}return c;};
 function locations(a,m){const s=(a.pos-pop(m&((1<<a.zero)-1)))%T;return Array.from({length:a.n},(_,j)=>(s+j)%T);}
 const projection=(s,indices)=>indices.map(i=>s[i]).join("");
 function compatible(a,b,la,lb){const overlap=la.filter(x=>lb.includes(x));const ia=overlap.map(x=>la.indexOf(x)),ib=overlap.map(x=>lb.indexOf(x));const A=new Set(a.d.map(s=>projection(s,ia)));return {n:overlap.length,yes:b.d.some(s=>A.has(projection(s,ib)))};}
 function graph(rows){
   const {anchors,zero}=domains(rows);if(zero>12)throw Error("zero masks too large "+zero);const need=anchors.length-2,details=[];
   for(let m=0;m<(1<<zero);m++){const loc=anchors.map(a=>locations(a,m));let edges=0;const adj=anchors.map(()=>0);for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(compatible(anchors[i],anchors[j],loc[i],loc[j]).yes){adj[i]|=1<<j;adj[j]|=1<<i;edges++;}
     let max=0,cliques=[];for(let s=1;s<(1<<anchors.length);s++){const n=pop(s);if(n<max&&n<need)continue;let ok=true;for(let i=0;i<anchors.length;i++)if(s&(1<<i)){if(((s&~(1<<i))&~adj[i])!==0){ok=false;break;}}if(ok){max=Math.max(max,n);if(n===need)cliques.push(s);}}
     details.push({m,edges,max,cliques,loc});
   }
   return {anchors,zero,need,details};
 }
 // Complete all full keys for qualifying cliques. A partially specified final key is retained as unresolved.
 function solve(rows,g){
   const full=new Set(),partial=new Set();let joins=0;
   for(const d of g.details)for(const clique of d.cliques){
     const ids=g.anchors.map((_,i)=>i).filter(i=>clique&(1<<i)).sort((a,b)=>g.anchors[b].n-g.anchors[a].n);
     // Select subsequent anchors by greatest overlap with accumulated phase coverage.
     const order=[ids.shift()];let covered=new Set(d.loc[order[0]]);while(ids.length){ids.sort((a,b)=>d.loc[b].filter(x=>covered.has(x)).length-d.loc[a].filter(x=>covered.has(x)).length);const i=ids.shift();order.push(i);for(const x of d.loc[i])covered.add(x);}
     let keys=new Set(["?".repeat(T)]);
     for(const i of order){const a=g.anchors[i],loc=d.loc[i];const first=keys.values().next().value;if(first===undefined)break;const ov=loc.map((x,j)=>[x,j]).filter(([x])=>first[x]!=="?");const ix=new Map();for(const s of a.d){const p=ov.map(([,j])=>s[j]).join("");if(!ix.has(p))ix.set(p,[]);ix.get(p).push(s);}
       const next=new Set();for(const k of keys){const p=ov.map(([x])=>k[x]).join("");for(const s of ix.get(p)||[]){joins++;if(joins>10000000)throw Error("join cap");const z=k.split("");for(let j=0;j<loc.length;j++)z[loc[j]]=s[j];next.add(z.join(""));}}
       keys=next;
     }
     for(const k of keys)(k.includes("?")?partial:full).add(k);
   }
   return {full:[...full],partial:[...partial],joins};
 }
 function decodeGroup(C,K,start){const out=new Map();for(let r=0;r<C.length;r++){const c=rotate(C,r);function rec(j,s,p){if(j===c.length){const str=id(p);if(types.has(str))out.set(str+":"+s,{p:p.slice(),s,r});return;}if(c[j]===0){p.push(0);rec(j+1,s,p);p.pop();}const x=mod(c[j]-K[s]);if(x){p.push(x);rec(j+1,(s+1)%T,p);p.pop();}}rec(0,start,[]);}return [...out.values()];}
 function paths(rows,K,initial=0){
   let states=new Map([[initial,{count:1,words:[]}]]);
   for(const {C} of rows){const next=new Map();for(const [s,v] of states)for(const a of decodeGroup(C,K,s)){const prev=next.get(a.s);if(prev)prev.count=Math.min(2,prev.count+v.count);else next.set(a.s,{count:v.count,words:v.words.concat([a.p])});}states=next;if(!states.size)break;}return states;
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 function plant(seed){
   const R=rng(seed),K=Array.from({length:T},()=>R()%Q),pool=Array.from({length:25},()=>[]);for(const D of donors)for(const p of D.slice(Math.floor(D.length*.8)))if(p.length<=24&&types.has(id(p)))pool[p.length].push(p);
   let phase=0,z=0;const rows=[];
   for(let i=0;i<terminal.length;i++){const {C:shape,off}=terminal[i];const target=shape.filter(x=>x===0).length;let found;
     for(let tries=0;tries<100000;tries++){const p=pool[shape.length][R()%pool[shape.length].length];let s=phase;const c=p.map(x=>{if(x===0)return 0;const y=mod(x+K[s]);s=(s+1)%T;return y;});if(c.filter(x=>!x).length!==target)continue;found={off,C:rotate(c,R()%c.length),P:p,s};break;}if(!found)throw Error("plant word "+i);phase=found.s;rows.push(found);
   }return {rows,K};
 }
 const original=graph(fit),os=solve(fit,original);
 const output={lex:types.size,fit:fit.length,held:held.length,anchors:original.anchors.map(a=>[a.off,a.n,a.d.length]),original:{zero:original.zero,need:original.need,details:original.details.map(d=>[d.m,d.edges,d.max,d.cliques.length]),full:os.full,partial:os.partial,joins:os.joins},controls:[]};
 for(const seed of [48013,48014]){const p=plant(seed),tr=p.rows.slice(0,fit.length),ho=p.rows.slice(fit.length),g=graph(tr),s=solve(tr,g),key=id(p.K);const retained=s.full.includes(key)||s.partial.some(x=>[...x].every((v,i)=>v==="?"||v===key[i]));const fitStates=paths(tr,p.K),h=fitStates.has(tr.at(-1).s)?paths(ho,p.K,tr.at(-1).s):new Map();let exact=0,unique=0;for(const row of ho){const start=ho.indexOf(row)===0?tr.at(-1).s:ho[ho.indexOf(row)-1].s;const ds=decodeGroup(row.C,p.K,start);if(ds.some(x=>id(x.p)===id(row.P)&&x.s===row.s))exact+=row.P.length;if(ds.length===1&&id(ds[0].p)===id(row.P))unique+=row.P.length;}
 output.controls.push({seed,key,retained,full:s.full.length,partial:s.partial.length,joins:s.joins,fitEndStates:fitStates.size,heldEndStates:h.size,exactSupported:exact,uniqueAtTruePhase:unique,heldRunes:ho.flatMap(x=>x.P).length,graph:g.details.map(d=>[d.m,d.max,d.cliques.length])});if(!retained||!h.size||exact!==ho.flatMap(x=>x.P).length)throw Error("control failed");}
 return output;
}
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
