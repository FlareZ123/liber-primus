'use strict';
// Exact spacing-free unigram-word inverse of the coupled p33 DH family.
const fs=require('node:fs'),crypto=require('node:crypto');
function spacingFree(corpus,dict,ref,donor){
 const m=x=>(x%29+29)%29,pow=(a,n,p)=>{let x=1;for(let i=0;i<n;i++)x=x*a%p;return x},key=A=>{const K=pow(A,15,23);return [m(15*(23-K)),m(15*(A+K)),m(15*(K-A)),m(15*(-K-23))]};const keys=Array.from({length:23},(_,i)=>key(i));
 const labels=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);const normalize=s=>s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const forms=labels.concat([["ING",21],["IO",27]]).sort((a,b)=>b[0].length-a[0].length);
 function canonical(s){let a=[];let w=normalize(s);while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([q])=>w.startsWith(q));if(!t)throw Error("unmapped "+w);a.push(t[1]);w=w.slice(t[0].length)}return a}
 function alternatives(w){const s=normalize(w);let memo=new Map();function rec(i){if(i===s.length)return [[]];if(memo.has(i))return memo.get(i);let a=[];for(const [q,v] of forms)if(s.startsWith(q,i))for(const tail of rec(i+q.length)){if(tail.length<16)a.push([v,...tail])}memo.set(i,a);return a}return rec(0)}
 let wordCounts=new Map();for(const l of dict.split(/\r?\n/)){const q=l.match(/^([a-z]+)\s+(\d+)$/);if(q)wordCounts.set(q[1].toUpperCase(),+q[2])}for(const w of ref.replace(/^#.*$/gm,"").match(/[A-Z]+/g)||[])if(!wordCounts.has(w))wordCounts.set(w,1);
 // True English single-letter words only; no alphabet-name pseudo words.
 for(const w of [...wordCounts.keys()])if(w.length===1&&!"AIO".includes(w))wordCounts.delete(w);
 function build(perm){const trie=[{next:new Map(),mass:0,end:0,label:null,labelMass:0}],formMap=new Map();for(const [w,weight] of wordCounts){const aa=perm?alternatives(w):[canonical(w)];const arr=aa.filter(a=>a.length&&a.length<=16);for(const a of arr){const k=a.join(",");const obj=formMap.get(k)||{a,mass:0,label:w,labelMass:0};const add=weight/arr.length;obj.mass+=add;if(add>obj.labelMass){obj.label=w;obj.labelMass=add}formMap.set(k,obj)}}
 const total=[...formMap.values()].reduce((s,x)=>s+x.mass,0);
 for(const {a,mass,label,labelMass} of formMap.values()){let q=0;trie[q].mass+=mass;for(const p of a){if(!trie[q].next.has(p)){trie[q].next.set(p,trie.length);trie.push({next:new Map(),mass:0,end:0,label:null,labelMass:0})}q=trie[q].next.get(p);trie[q].mass+=mass}trie[q].end+=mass;trie[q].label=label;trie[q].labelMass=labelMass}
 for(const q of trie){q.endCost=q.end?Math.log(total/q.end):Infinity;q.prefixCost=Math.log(total/q.mass)}
 return {trie,formMap,total}
 }
 function inverse(input,hold,trie){let dp=new Map([["0,0,0",{phase:0,A:0,q:0,cost:0,plain:[],shares:[],words:[],pending:[]}]]),maxStates=1;
  for(let i=0;i<input.length;i++){const nd=new Map();function put(v,p,phase,A,shares){const q=trie[v.q].next.get(p);if(q===undefined)return;const pending=[...v.pending,p],plain=[...v.plain,p];function add(nextQ,cost,words,pending){let k=[phase,A,nextQ].join(","),old=nd.get(k);if(!old||cost<old.cost)nd.set(k,{phase,A,q:nextQ,cost,plain,shares,words,pending})}if(trie[q].next.size)add(q,v.cost,v.words,pending);if(trie[q].end)add(0,v.cost+trie[q].endCost,[...v.words,{label:trie[q].label,runes:pending}],[])}
   for(const v of dp.values()){if(hold&&input[i]===0)put(v,0,v.phase,v.A,v.shares);const allowed=v.phase===0?Array.from({length:22},(_,i)=>i+1):[v.A];for(const A of allowed){const p=m(input[i]-keys[A][v.phase]);if(hold&&p===0)continue;const phase=(v.phase+1)%4;put(v,p,phase,phase===0?0:A,v.phase===0?[...v.shares,A]:v.shares)}}if(!nd.size)return {dead:i,maxStates};dp=nd;maxStates=Math.max(maxStates,dp.size)
  }
  const a=[...dp.values()].map(v=>({...v,finalCost:v.cost+(v.q?trie[v.q].prefixCost:0)})).sort((a,b)=>a.finalCost-b.finalCost)[0];return {...a,perRune:a.finalCost/input.length,maxStates}
 }
 function forward(p,shares,hold){let phase=0,b=0;return p.map(x=>{if(hold&&x===0)return 0;let c=m(x+keys[shares[b]][phase]);if(++phase===4){phase=0;b++}return c})}
 function rng(seed){let x=seed>>>0;return n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n}}
 const x=corpus.pages[33].indices.slice(136),results=[];
 const dw=(donor.toUpperCase().match(/[A-Z]+/g)||[]);const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 for(const perm of [false,true]){const {trie,formMap,total}=build(perm);const donorForms=dw.map(w=>canonical(w));let plants=[];for(let i=100;i<dw.length-100&&plants.length<12;i+=73){let a=[],used=[];for(let j=i;j<dw.length&&a.length<x.length;j++){const v=donorForms[j];if(!formMap.has(v.join(",")))break;a.push(...v);used.push(dw[j])}if(a.length>=x.length)plants.push({plain:a.slice(0,x.length),words:used})}if(plants.length!==12)throw Error("donor plants "+plants.length);
  for(const hold of [false,true]){const a=inverse(x,hold,trie);if(a.plain&&!eq(forward(a.plain,a.shares,hold),x))throw Error("original replay");
   let controls=[];for(let i=0;i<plants.length;i++){const p=plants[i],r=rng(9821+i*13),shares=Array.from({length:x.length},()=>1+r(22)),ct=forward(p.plain,shares,hold),v=inverse(ct,hold,trie);if(!v.plain||!eq(forward(v.plain,v.shares,hold),ct))throw Error("positive infeasible");controls.push({cost:v.perRune,correct:v.plain.filter((r,j)=>r===p.plain[j]).length,n:p.plain.length,originalWords:p.words,outputWords:v.words.map(w=>w.label),pending:v.pending})}
   let nulls=[];for(let i=0;i<40;i++){let r=rng(1234567+i*109),y=x.slice();for(let phase=0;phase<4;phase++){let ids=[];for(let j=phase;j<y.length;j+=4)ids.push(j);for(let j=ids.length-1;j>0;j--){let k=r(j+1);[y[ids[j]],y[ids[k]]]=[y[ids[k]],y[ids[j]]]}}const v=inverse(y,hold,trie);nulls.push(v.perRune??null)}
   results.push({perm,hold,forms:formMap.size,nodes:trie.length,wordMass:total,...a,controls,nulls})
  }
 }
 return {page:33,suffixLength:x.length,results}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt"],expected=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","140e1d22b5f8c45deddd2e8b25549d9d6307d938","8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d","df260a07d56bf5998d40a6360b6132c35c252d10"];
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');const buf=paths.map(p=>fs.readFileSync(p));if(buf.some((b,i)=>blob(b)!==expected[i]))throw Error('input blob mismatch');const [c,d,r,g]=buf.map(b=>b.toString('utf8'));const o=spacingFree(JSON.parse(c),d,r,g);o.inputs=Object.fromEntries(paths.map((p,i)=>[p,expected[i]]));if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(o,null,2)+'\n');else console.log(JSON.stringify(o,null,2));
