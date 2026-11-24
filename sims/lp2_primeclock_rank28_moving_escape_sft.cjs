'use strict';
// Agent5: prime-clock rank28 moving-escape inverse and lexical all-secret gate.
const fs=require('node:fs'), path=require('node:path');
function experiment(corpus,transcript,solved,lexicon) {
 const check=(v,m)=>{if(!v)throw Error(m)};
 const mod=(x,n)=>((x%n)+n)%n, same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 check(words.length===2896&&same(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"source shape");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const key=p=>p.join(",");
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
 const lex=new Map(),known=new Set(),frequency=new Map();
 const bigram=Array.from({length:30},()=>Array(30).fill(.5));
 for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p)continue;const f=Number(m[2]),s=key(p);frequency.set(s,(frequency.get(s)||0)+f);let prev=29;for(const x of p.concat(29)){bigram[prev][x]+=Math.sqrt(f);prev=x;}if(known.has(s))continue;known.add(s);if(!lex.has(p.length))lex.set(p.length,[]);lex.get(p.length).push(p);}
 const logBigram=bigram.map(row=>{const n=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/n));});
 const primes=[];for(let n=2;primes.length<14000;n++){if(primes.every(q=>q*q>n||n%q!==0))primes.push(n);}
 check(primes[463]===3301,"prime clock");
 const pow=[],log=Array(29).fill(-1);let a=1;for(let i=0;i<28;i++){pow.push(a);log[a]=i;a=a*15%29;}check(new Set(pow).size===28,"root");
 const ALL=(1<<28)-1;
 const identity=Array.from({length:28},(_,i)=>i);
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 // S maps de-shifted ciphertext ranks to plaintext exclusion ranks.
 function transform(ws,S,encode,hold=true,order='shift-then-map'){const inv=Array(28);S.forEach((r,q)=>inv[r]=q);let prev=0,t=0;return ws.map(w=>w.map(x=>{const p=primes[t],e=p%29,k=(p-1)%28;let c,y,d;
 if(encode){y=x;d=y===e?0:pow[order==='shift-then-map'?mod(inv[y-(y>e)]+k,28):inv[mod(y-(y>e)+k,28)]];c=mod(prev+d,29);}
 else{c=x;d=mod(c-prev,29);if(!d)y=e;else{const r=order==='shift-then-map'?S[mod(log[d]-k,28)]:mod(S[log[d]]-k,28);y=r+(r>=e);}}
 prev=c;if(!hold||d)t++;return encode?c:y;}));}
 function observations(ws,hold=true,order='shift-then-map',start=0,unit=1){let prev=0,t=start;return ws.map(w=>w.map(c=>{const d=mod(c-prev,29),p=primes[t],q=d?mod(unit*log[d]-(order==='shift-then-map'?p-1:0),28):-1,e=p%29,k=order==='shift-then-map'?0:(p-1)%28;prev=c;if(!hold||d)t++;return {q,e,k};}));}
 // Every compatible word constrains the same unknown 28! substitution.
 // In the broad envelope, escape is allowed to be arbitrary at EACH position.
 function constraints(obs,p,broad){const m=Array(28).fill(ALL);
 for(let i=0;i<p.length;i++){const {q,e,k}=obs[i],y=p[i];if(q<0){if(!broad&&y!==e)return null;continue;}
 let mask=0;
 if(broad){if(y<28)mask|=1<<mod(y+k,28);if(y>0)mask|=1<<mod(y-1+k,28);}
 else {if(y===e)return null;mask=1<<mod(y-(y>e)+k,28);}
 m[q]&=mask;if(!m[q])return null;}
 return matching(m)?m:null;}
 function matching(m){const owner=Array(28).fill(-1);
 const order=identity.filter(i=>m[i]!==ALL).sort((i,j)=>pop(m[i])-pop(m[j]));
 function augment(q,seen){let bits=m[q]&~seen.bits;while(bits){const bit=bits&-bits;bits^=bit;if(seen.bits&bit)continue;seen.bits|=bit;const r=31-Math.clz32(bit);if(owner[r]<0||augment(owner[r],seen)){owner[r]=q;return true;}}return false;}
 return order.every(q=>augment(q,{bits:0}));}
 function pop(x){let n=0;while(x){x&=x-1;n++;}return n;}
 function candidates(obs,broad){const out=[];for(const p of lex.get(obs.length)||[]){const m=constraints(obs,p,broad);if(m)out.push({p,m});}return out;}
 function merge(a,b){const z=a.map((v,i)=>v&b[i]);return z.every(Boolean)&&matching(z)?z:null;}
 function propagate(rows){let ds=Array(28).fill(ALL),rounds=0,changed=true;while(changed){rounds++;changed=false;
 for(let i=0;i<rows.length;i++){const row=rows[i].filter(x=>merge(x.m,ds));if(!row.length)return {failure:i,rounds};rows[i]=row;const u=Array(28).fill(0);for(const x of row)for(let j=0;j<28;j++)u[j]|=x.m[j];const nd=merge(ds,u);if(!nd)return {failure:i,rounds};
 // All-different singleton propagation is exact.
 let repeat=true;while(repeat){repeat=false;for(let j=0;j<28;j++)if(pop(nd[j])===1)for(let k=0;k<28;k++)if(j!==k&&(nd[k]&nd[j])){nd[k]&=~nd[j];if(!nd[k])return {failure:i,rounds};repeat=true;}}
 if(nd.some((v,j)=>v!==ds[j]))changed=true;ds=nd;
 }}return {rounds,domains:ds,remaining:rows.map(x=>x.length)};}
 // Maximum weight bijection, exact O(28^3) Hungarian assignment.
 function assignment(W){
 const N=W.length,u=Array(N+1).fill(0),v=Array(N+1).fill(0),p=Array(N+1).fill(0),way=Array(N+1).fill(0);
 for(let i=1;i<=N;i++){
 p[0]=i;let j0=0;const min=Array(N+1).fill(Infinity),used=Array(N+1).fill(false);
 do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
 for(let j=1;j<=N;j++)if(!used[j]){const cur=-W[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}
 for(let j=0;j<=N;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;
 j0=j1;}while(p[j0]!==0);
 do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
 }
 const S=Array(N);for(let j=1;j<=N;j++)S[p[j]-1]=j-1;
 return {S,weight:S.reduce((s,r,q)=>s+W[q][r],0)};
 }
 check(assignment([[3,1,0],[2,0,4],[0,5,1]]).weight===12,"assignment positive");
 function decodeObs(obs,S){return obs.map(({q,e,k})=>{if(q<0)return e;const r=mod(S[q]-k,28);return r+(r>=e);});}
 function scoreWord(p){let prev=29,score=0;for(const x of p.concat(29)){score+=.1*logBigram[prev][x];prev=x;}
 const f=frequency.get(key(p));return score+(f?(p.length>=3?p.length:.25*p.length)+.05*Math.log1p(f):0);}
 // Plaintext-blind: every training word participates. No true-word or holdout oracle.
 function attack(obs){
 const votes=Array.from({length:28},()=>Array(28).fill(0));let usable=0;
 for(const o of obs){const row=candidates(o,false);if(!row.length)continue;usable++;
 const weight=Math.max(1,o.length-1)/row.length;
 for(const {m} of row)for(let q=0;q<28;q++)if(m[q]!==ALL)votes[q][31-Math.clz32(m[q])]+=weight;}
 let {S}=assignment(votes);const score=s=>obs.reduce((n,o)=>n+scoreWord(decodeObs(o,s)),0);
 let best=score(S),initial=best,steps=0;
 for(;steps<30;steps++){let next=best,pair=null;
 for(let i=0;i<28;i++)for(let j=i+1;j<28;j++){[S[i],S[j]]=[S[j],S[i]];const x=score(S);[S[i],S[j]]=[S[j],S[i]];if(x>next+1e-9){next=x;pair=[i,j];}}
 if(!pair)break;const [i,j]=pair;[S[i],S[j]]=[S[j],S[i]];best=next;
 }
 return {S,usable,steps,initial,score:best};
 }
 function stats(ws){const p=ws.flat(),freq=Array(29).fill(0);p.forEach(x=>freq[x]++);return {runes:p.length,ioc:freq.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1)),lexical:ws.filter(w=>known.has(key(w))).length,words:ws.length,longLexical:ws.filter(w=>w.length>=5&&known.has(key(w))).length,longWords:ws.filter(w=>w.length>=5).length};}
 const offsets=[];let n=0;for(const w of words){offsets.push(n);n+=w.length;}
 const pages=[];n=0;for(const p of corpus.pages.filter(p=>p.page<=55)){if(p.indices.length)pages.push([p.page,n]);n+=p.indices.length;}
 const pageAt=i=>pages.filter(p=>p[1]<=i).at(-1)[0];
 const results=[];
 for(const order of ['shift-then-map','map-then-shift'])for(const hold of [true,false]){
 const obs=observations(words,hold,order);const byLen={},failed=[],exactFailed=[];
 for(let j=0;j<words.length;j++){if(words[j].length<7)continue;const cs=candidates(obs[j],true),ex=candidates(obs[j],false);const z=byLen[words[j].length]??={n:0,broad:0,exact:0};z.n++;if(cs.length)z.broad++;else failed.push(j);if(ex.length)z.exact++;else exactFailed.push(j);}
 const witness=j=>({word:j,page:pageAt(offsets[j]),offset:offsets[j],cipher:render(words[j]),q:obs[j].map(x=>x.q),e:obs[j].map(x=>x.e),dictionary:lex.get(words[j].length)?.length||0});
 const firstByLength={};for(const j of failed)firstByLength[words[j].length]??=witness(j);
 const dec=transform(words,identity,false,hold,order);check(same(transform(dec,identity,true,hold,order),words),"original replay");
 const region=(lo,hi,tape=dec)=>tape.filter((w,i)=>pageAt(offsets[i])>=lo&&pageAt(offsets[i])<=hi);
 const learned=attack(obs.slice(0,158)),learnedDec=transform(words,learned.S,false,hold,order);
 check(same(transform(learnedDec,learned.S,true,hold,order),words),"learned original replay");
 const learnedResult={...learned,opening:stats(region(0,2,learnedDec)),holdout16:stats(region(16,21,learnedDec)),holdout40:stats(region(40,53,learnedDec)),full:stats(learnedDec),openingWords:learnedDec.slice(0,25).map(render).join(" "),holdoutWords:region(40,53,learnedDec).slice(0,25).map(render).join(" ")};
 results.push({order,hold,learned:learnedResult,repeatCount:obs.flat().filter(x=>x.q<0).length,byLen,broadFailed:failed.length,exactFailed:exactFailed.length,firstByLength,firstExactFailure:exactFailed.length?witness(exactFailed[0]):null,canonical:stats(dec),opening:stats(region(0,2)),holdout:stats(region(40,53)),openingWords:dec.slice(0,25).map(render).join(" "),holdoutWords:region(40,53).slice(0,25).map(render).join(" ")});
 }
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const plants=[];
 for(const order of ['shift-then-map','map-then-shift'])for(let j=0;j<3;j++){
 const p=donor.slice(j*200,j*200+200),S=identity.slice();let state=(3301+j)>>>0;for(let i=27;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const t=state%(i+1);[S[i],S[t]]=[S[t],S[i]];}
 const c=transform(p,S,true,true,order),o=observations(c,true,order);check(same(transform(c,S,false,true,order),p),"plant replay");
 // Train on only the first 150 words whose GP spellings are in the pinned lexicon.
 const train=[];for(let i=0;i<150;i++)if(p[i].length>=3&&known.has(key(p[i]))){const row=candidates(o[i],false);check(row.some(x=>same(x.p,p[i])),"true candidate");train.push(row);}
 const sol=propagate(train);check(sol.domains&&S.every((r,q)=>sol.domains[q]&(1<<r)),"true key retained");
 const single=sol.domains.every(x=>pop(x)===1);const recovered=single?sol.domains.map(x=>31-Math.clz32(x)):null;
 const plain=recovered?transform(c,recovered,false,true,order):null;
 const blind=attack(o.slice(0,150)),blindPlain=transform(c,blind.S,false,true,order);
 check(same(transform(blindPlain,blind.S,true,true,order),c),"blind plant replay");
 plants.push({order,blind:{...blind,correctRankEntries:blind.S.filter((r,q)=>r===S[q]).length,exact:same(blindPlain,p),holdoutExact:same(blindPlain.slice(150),p.slice(150)),holdoutRuneAccuracy:blindPlain.slice(150).flat().filter((x,i)=>x===p.slice(150).flat()[i]).length/p.slice(150).flat().length},runes:p.flat().length,training:train.length,rounds:sol.rounds,domainSizes:sol.domains.map(pop),unique:single,exact:plain?same(plain,p):false,holdoutExact:plain?same(plain.slice(150),p.slice(150)):false});
 }
 // Singletons alone: exact all-secret matching over arbitrary moving escape,
 // plus a bounded start range independently motivated by the historical prime 3301.
 const singles=words.map((w,j)=>w.length===1?j:-1).filter(j=>j>=0);
 check(singles.length===83,"singletons");
 const singleObs=[];let prev=0,allT=0,holdT=0;for(let j=0;j<words.length;j++)for(const c of words[j]){const d=mod(c-prev,29);if(words[j].length===1)singleObs.push({d,allT,holdT});prev=c;allT++;if(d)holdT++;}
 check(singleObs.every(x=>x.d!==0),"singleton nonrepeat");
 const ordinary=[3,10,24]; // GP O,I,A
 const expanded=ordinary.concat(corpus.translit.indexOf('T'));
 check(ordinary.map(x=>corpus.translit[x]).join(",")==="O,I,A","singleton alphabet");
 const units=[1,3,5,9,11,13,15,17,19,23,25,27];
 const singletonGate=[];
 for(const order of ['shift-then-map','map-then-shift'])for(const hold of [true,false]){
 let minimumDistinct=28,survivors=0,emptyDomain=0,checked=0,examples=[],expandedSurvivors=0,maxOrdinary=0,maxExpanded=0;
 for(let start=0;start<464;start++)for(const unit of order==='shift-then-map'?units:[1]){
 const m=Array(28).fill(ALL),m2=Array(28).fill(ALL),qs=new Set(),freq=Array(28).fill(0),W=Array.from({length:28},()=>Array(28).fill(0)),W2=Array.from({length:28},()=>Array(28).fill(0));
 for(const {d,allT,holdT} of singleObs){
 const p=primes[start+(hold?holdT:allT)],k=order==='shift-then-map'?0:(p-1)%28,q=mod(unit*log[d]-(order==='shift-then-map'?p-1:0),28);
 qs.add(q);freq[q]++;let mask=0,mask2=0;for(const y of ordinary){if(y<28)mask|=1<<mod(y+k,28);if(y>0)mask|=1<<mod(y-1+k,28);}for(const y of expanded){if(y<28)mask2|=1<<mod(y+k,28);if(y>0)mask2|=1<<mod(y-1+k,28);}m[q]&=mask;m2[q]&=mask2;
 if(order==='map-then-shift')for(let r=0;r<28;r++){if(mask&(1<<r))W[q][r]++;if(mask2&(1<<r))W2[q][r]++;}
 }
 checked++;if(qs.size<minimumDistinct){minimumDistinct=qs.size;examples=[start,unit];}
 if(!m.every(Boolean))emptyDomain++;else if(matching(m))survivors++;
 if(m2.every(Boolean)&&matching(m2))expandedSurvivors++;
 if(order==='shift-then-map'){const f=freq.slice().sort((a,b)=>b-a);maxOrdinary=Math.max(maxOrdinary,f.slice(0,6).reduce((a,b)=>a+b,0));maxExpanded=Math.max(maxExpanded,f.slice(0,8).reduce((a,b)=>a+b,0));}else{maxOrdinary=Math.max(maxOrdinary,assignment(W).weight);maxExpanded=Math.max(maxExpanded,assignment(W2).weight);}
 }
 singletonGate.push({order,hold,checked,minimumDistinct,examples,emptyDomain,survivors,expandedSurvivors,maxOrdinary,maxExpanded,minPlaintextTypes:order==='shift-then-map'?Math.ceil(minimumDistinct/2):null});
 }
 const donorSingletons=[...new Set(donor.filter(w=>w.length===1).map(w=>w[0]))];
 return {lexicon:known.size,results,plants,singletonGate,donorSingletons:donorSingletons.map(i=>corpus.translit[i])};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const r=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(r(paths[0])),r(paths[1]),JSON.parse(r(paths[2])),r(paths[3])),null,2));
