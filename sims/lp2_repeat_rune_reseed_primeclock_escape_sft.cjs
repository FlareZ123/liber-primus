'use strict';
/** LP2 repeat-rune reseeded prime-clock moving escape; exact all-key singleton gate. */
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,raw,donor){
 const check=(b,m)=>{if(!b)throw Error(m)},mod=(x,n)=>(x%n+n)%n,gp=new Map(corpus.runes.map((x,i)=>[x,i]));
 const words=[];let w=[];for(const c of raw.split("%").slice(0,55).join("%")){if(gp.has(c))w.push(gp.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 const tape=words.flat(),actual=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);check(JSON.stringify(tape)===JSON.stringify(actual)&&words.length===2896&&tape.length===12956,"source");
 const primes=[];for(let n=2;primes.length<13000;n++){let yes=true;for(const p of primes){if(p*p>n)break;if(n%p===0){yes=false;break}}if(yes)primes.push(n)}
 check(corpus.prime.every((x,i)=>x===primes[i]),"GP prime table");
 const pow=[],log=Array(29).fill(-1);let x=1;for(let j=0;j<28;j++){pow.push(x);log[x]=j;x=x*15%29}check(new Set(pow).size===28,"root");
 const identity=Array.from({length:28},(_,i)=>i),ALL=(1<<28)-1,alphabet=[3,10,16,24];
 function observations(seq,order){let prev=0,t=0;return seq.map(c=>{const p=primes[t],d=mod(c-prev,29),o={c,d,t,e:p%29,k:order==="map-then-shift"?(p-1)%28:0,q:d?mod(log[d]-(order==="shift-then-map"?p-1:0),28):-1};prev=c;t=d?t+1:c;return o})}
 function transform(seq,S,encode,order){let prev=0,t=0;const inv=[];S.forEach((x,i)=>inv[x]=i);return seq.map(x=>{const p=primes[t],e=p%29,k=(p-1)%28;let c,y,d;if(encode){y=x;const r=y-(y>e);d=y===e?0:pow[order==="shift-then-map"?mod(inv[r]+k,28):inv[mod(r+k,28)]];c=mod(prev+d,29)}else{c=x;d=mod(c-prev,29);if(!d)y=e;else{const r=order==="shift-then-map"?S[mod(log[d]-k,28)]:mod(S[log[d]]-k,28);y=r+(r>=e)}}prev=c;t=d?t+1:c;return encode?c:y})}
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function matching(m){const owner=Array(28).fill(-1);function augment(q,seen){for(let r=0;r<28;r++)if((m[q]&(1<<r))&&!seen[r]){seen[r]=true;if(owner[r]<0||augment(owner[r],seen)){owner[r]=q;return true}}return false}return m.map((_,i)=>i).sort((a,b)=>pop(m[a])-pop(m[b])).every(q=>augment(q,Array(28).fill(false)))}
 function mask(o,broad){if(o.q<0)return broad||alphabet.includes(o.e)?ALL:0;let v=0;for(const y of alphabet){if(broad){if(y<28)v|=1<<mod(y+o.k,28);if(y>0)v|=1<<mod(y-1+o.k,28)}else if(y!==o.e)v|=1<<mod(y-(y>o.e)+o.k,28)}return v}
 function domains(obs,sites,broad){const m=Array(28).fill(ALL);for(const i of sites){const o=obs[i],v=mask(o,broad);if(o.q<0){if(!v)return null}else m[o.q]&=v}return m}
 function feasible(obs,sites,broad){const m=domains(obs,sites,broad);return m!==null&&matching(m)}
 function gate(obs,sites,broad){const pass=feasible(obs,sites,broad);let witness=[];if(!pass){witness=sites.slice();for(let j=witness.length-1;j>=0;j--){const candidate=witness.filter((_,k)=>k!==j);if(!feasible(obs,candidate,broad))witness=candidate}check(!feasible(obs,witness,broad)&&witness.every((_,j)=>feasible(obs,witness.filter((_,k)=>k!==j),broad)),"minimal witness");}
 return {broad,sites:sites.length,pass,witness:witness.map(i=>({i,q:obs[i].q,t:obs[i].t,c:obs[i].c,escape:obs[i].e,shift:obs[i].k,allowed:identity.filter(r=>mask(obs[i],broad)&(1<<r))}))}}
 let offset=0;const singles=[];for(const w of words){if(w.length===1)singles.push(offset);offset+=w.length}check(singles.length===83,"singletons");
 const donorWords=donor.sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>gp.get(c))));
 const out=[];for(const order of ["shift-then-map","map-then-shift"]){const obs=observations(tape,order),dec=transform(tape,identity,false,order);check(JSON.stringify(transform(dec,identity,true,order))===JSON.stringify(tape),"original replay");check(obs.filter(x=>!x.d).length===86,"repeat census");const result={order,markers:86,train:[],holdout:[],full:[],preview:dec.slice(0,60).map(x=>corpus.translit[x]).join(" "),plants:[]};for(const broad of [false,true])for(const [name,sites] of [["train",singles.filter(i=>i<9640)],["holdout",singles.filter(i=>i>=9640)],["full",singles]])result[name].push(gate(obs,sites,broad));
 for(let j=0;j<3;j++){let state=3301+j,S=identity.slice();for(let k=27;k>0;k--){state=(Math.imul(state,1664525)+1013904223)>>>0;const i=state%(k+1);[S[k],S[i]]=[S[i],S[k]]}const ws=donorWords.slice(j*200,j*200+200),p=ws.flat(),c=transform(p,S,true,order),d=transform(c,S,false,order),o=observations(c,order);check(JSON.stringify(p)===JSON.stringify(d),"plant replay");const sites=[];let off=0;for(const w of ws){if(w.length===1&&alphabet.includes(w[0]))sites.push(off);off+=w.length}for(const broad of [false,true]){const m=domains(o,sites,broad);check(m!==null&&S.every((r,q)=>m[q]&(1<<r))&&matching(m),"true plant key retained")}result.plants.push({runes:p.length,markers:o.filter(x=>!x.d).length,singletons:sites.length})}out.push(result)}return {runes:tape.length,words:words.length,singletons:singles.length,alphabet:alphabet.map(x=>corpus.translit[x]),out}
}
const read=p=>fs.readFileSync(path.join(__dirname,'..','resources',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('liber-primus/lp2-corpus.json')),read('liber-primus/lp2-transcription.txt'),JSON.parse(read('external/relikd-solved-gp29-native-v1.json'))),null,2));
