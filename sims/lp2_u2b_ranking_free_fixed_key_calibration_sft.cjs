"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),Q=29,M=(1n<<64n)-1n,SALT=0xC10C4702B1A50000n,ix=new Map(gp.runes.map((x,i)=>[x,i])),id=a=>String.fromCharCode(...a.map(x=>65+x)),from=s=>Array.from(s,c=>c.charCodeAt(0)-65),mod=x=>(x+Q)%Q;
 const names=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const z=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:names.find(z=>w.startsWith(z.t,j));if(!z)throw Error("unknown "+w);o.push(z.i);j+=z.t.length;}return id(o);}
 const lex=new Set(Array.from({length:Q},(_,x)=>id([x])));
 for(const l of raw[1].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){lex.add(word(m[1],true));lex.add(word(m[1],false));}}
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,c=>ix.get(c))))}));
 for(const s of native)for(const w of s.words)lex.add(w);
 function key(s,len){const base=SALT+(BigInt(s)<<32n);return Uint8Array.from({length:len},(_,t)=>{let z=(base+BigInt(t)+0x9E3779B97F4A7C15n)&M;z=((z^(z>>30n))*0xBF58476D1CE4E5B9n)&M;z=((z^(z>>27n))*0x94D049BB133111EBn)&M;return Number((z^(z>>31n))%29n);});}
 function jump(W){let j=0;return Array.from({length:W},(_,k)=>j+=gp.prime[k%Q]);}
 const F=256,keys=Array.from({length:F},(_,s)=>key(s,5000));
 function encode(words,K){const J=jump(words.length);let p=0;return words.flatMap((w,k)=>from(w).map(x=>(x+K[p+++J[k]])%Q));}
 function positions(lens){const J=jump(lens.length);let p=0;return lens.flatMap((l,k)=>Array.from({length:l},()=>p+++J[k]));}
 function rand(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function inventory(lengths){const N=lengths.reduce((a,b)=>a+b,0),W=lengths.length,L=[...new Set(lengths)].sort((a,b)=>a-b),S=N+1,counts=L.map(l=>lengths.filter(x=>x===l).length),J=jump(W),E=new Int32Array(W*S);
  for(let a=0;a<L.length;a++){const l=L[a],D=new Uint8Array(W*S);D[0]=1;let n=0;for(let b=0;b<L.length;b++)for(let t=0;t<counts[b]-(a===b?1:0);t++){const v=L[b];n++;for(let k=n;k>=1;k--)for(let p=N-l;p>=v;p--)if(D[(k-1)*S+p-v])D[k*S+p]=1;}for(let k=0;k<W;k++)for(let p=0;p<=N-l;p++)if(D[k*S+p])E[k*S+p]|=1<<a;}
  return {N,W,L,S,J,E};
 }
 function relaxed(C,I,K,B){const {N,W,L,S,J,E}=I;let f=new Uint8Array(S).fill(255),h=new Uint8Array(S).fill(255),active=[0],visits=0;f[0]=0;
  for(let k=0;k<W;k++){h.fill(255);const next=[];for(const p of active){visits++;let mask=E[k*S+p];if(!mask)continue;let w="",j=0;for(let l=1;l<=L.at(-1)&&p+l<=N;l++){w+=String.fromCharCode(65+mod(C[p+l-1]-K[p+l-1+J[k]]));if(l!==L[j])continue;const bit=1<<j++;if(!(mask&bit))continue;const np=p+l,c=f[p]+Number(!lex.has(w));if(c<=B&&c<h[np]){if(h[np]===255)next.push(np);h[np]=c;}}}[f,h]=[h,f];active=next;if(!active.length)return {cost:null,visits};}return {cost:f[N]===255?null:f[N],visits};
 }
 function train(skip){const a=Array.from({length:Q},()=>Array(Q).fill(.5));for(const s of native)if(s.name!==skip){const p=from(s.words.join(""));for(let i=1;i<p.length;i++)a[p[i-1]][p[i]]++;}return a.map(r=>{const z=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/z));});}
 function rank(C,printed,bg){const ps=positions(printed);return keys.map((K,s)=>{let sc=0,prev=mod(C[0]-K[ps[0]]);for(let i=1;i<C.length;i++){const x=mod(C[i]-K[ps[i]]);sc+=bg[prev][x];prev=x;}return {s,sc};}).sort((a,b)=>b.sc-a.sc||a.s-b.s);}
 const cases=[];
 const sections=native.filter(s=>s.words.length>=64);
 for(let i=0;i<24;i++){const s=sections[i%sections.length],R=rand(0x28870100+i),start=Math.floor(R()*(s.words.length-63)),words=s.words.slice(start,start+64),truth=Math.floor(R()*F),C=encode(words,keys[truth]),printed=shuffle(words.map(w=>w.length),R),bg=train(s.name),r=rank(C,printed,bg).findIndex(x=>x.s===truth)+1;cases.push({i,section:s.name,start,truth,C,printed,rank:r});}
 // Predeclared diagnostic strata: first two top-eight misses, first two hits; all seeds enumerated in chosen controls.
 const chosen=[...cases.filter(x=>x.rank>8).slice(0,2),...cases.filter(x=>x.rank<=8).slice(0,2)];
 const tests=[];
 for(const c of chosen){const I=inventory(c.printed),survivors=[];let visits=0;for(let s=0;s<F;s++){const r=relaxed(c.C,I,keys[s],3);visits+=r.visits;if(r.cost!==null)survivors.push({s,cost:r.cost});}if(!survivors.some(s=>s.s===c.truth&&s.cost===0))throw Error("truth pruned");tests.push({i:c.i,section:c.section,start:c.start,rank:c.rank,trueKey:c.truth,N:c.C.length,W:c.printed.length,survivors,visits});}
 return {family:"H2 splitmix64 counter stream, prefix s=0..255, not a historical key claim",lexicon:lex.size,scoring:"native leave-section-out rune bigram; top eight surrogate cutoff, not actual H2 ranking",budget:3,ranks:cases.map(c=>({i:c.i,section:c.section,rank:c.rank})),tests};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment,paths};
