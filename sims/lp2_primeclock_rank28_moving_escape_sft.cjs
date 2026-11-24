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
 const lex=new Map(),known=new Set();
 for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p||known.has(key(p)))continue;known.add(key(p));if(!lex.has(p.length))lex.set(p.length,[]);lex.get(p.length).push(p);}
 const primes=[];for(let n=2;primes.length<14000;n++){if(primes.every(q=>q*q>n||n%q!==0))primes.push(n);}
 check(primes[463]===3301,"prime clock");
 const pow=[],log=Array(29).fill(-1);let a=1;for(let i=0;i<28;i++){pow.push(a);log[a]=i;a=a*15%29;}check(new Set(pow).size===28,"root");
 const ALL=(1<<28)-1;
 const identity=Array.from({length:28},(_,i)=>i);
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 // S maps de-shifted ciphertext ranks to plaintext exclusion ranks.
 function transform(ws,S,encode,hold=true){const inv=Array(28);S.forEach((r,q)=>inv[r]=q);let prev=0,t=0;return ws.map(w=>w.map(x=>{const p=primes[t],e=p%29,k=(p-1)%28;let c,y,d;
 if(encode){y=x;d=y===e?0:pow[mod(inv[y-(y>e)]+k,28)];c=mod(prev+d,29);}
 else{c=x;d=mod(c-prev,29);if(!d)y=e;else{const r=S[mod(log[d]-k,28)];y=r+(r>=e);}}
 prev=c;if(!hold||d)t++;return encode?c:y;}));}
 function observations(ws,hold=true){let prev=0,t=0;return ws.map(w=>w.map(c=>{const d=mod(c-prev,29),p=primes[t],q=d?mod(log[d]-(p-1),28):-1,e=p%29;prev=c;if(!hold||d)t++;return {q,e};}));}
 // Every compatible word constrains the same unknown 28! substitution.
 // In the broad envelope, escape is allowed to be arbitrary at EACH position.
 function constraints(obs,p,broad){const m=Array(28).fill(ALL);
 for(let i=0;i<p.length;i++){const {q,e}=obs[i],y=p[i];if(q<0){if(!broad&&y!==e)return null;continue;}
 let mask=0;
 if(broad){if(y<28)mask|=1<<y;if(y>0)mask|=1<<(y-1);}
 else {if(y===e)return null;mask=1<<(y-(y>e));}
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
 function stats(ws){const p=ws.flat(),freq=Array(29).fill(0);p.forEach(x=>freq[x]++);return {runes:p.length,ioc:freq.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1)),lexical:ws.filter(w=>known.has(key(w))).length,words:ws.length};}
 const offsets=[];let n=0;for(const w of words){offsets.push(n);n+=w.length;}
 const pages=[];n=0;for(const p of corpus.pages.filter(p=>p.page<=55)){if(p.indices.length)pages.push([p.page,n]);n+=p.indices.length;}
 const pageAt=i=>pages.filter(p=>p[1]<=i).at(-1)[0];
 const results=[];
 for(const hold of [true,false]){
 const obs=observations(words,hold);const byLen={},failed=[],exactFailed=[],broadRows=[];
 for(let j=0;j<words.length;j++){if(words[j].length<7)continue;const cs=candidates(obs[j],true),ex=candidates(obs[j],false);const z=byLen[words[j].length]??={n:0,broad:0,exact:0};z.n++;if(cs.length){z.broad++;broadRows.push([j,cs]);}else failed.push(j);if(ex.length)z.exact++;else exactFailed.push(j);}
 const witness=j=>({word:j,page:pageAt(offsets[j]),offset:offsets[j],cipher:render(words[j]),q:obs[j].map(x=>x.q),e:obs[j].map(x=>x.e),dictionary:lex.get(words[j].length)?.length||0});
 const firstByLength={};for(const j of failed)firstByLength[words[j].length]??=witness(j);
 const dec=transform(words,identity,false,hold);check(same(transform(dec,identity,true,hold),words),"original replay");
 const region=(lo,hi)=>dec.filter((w,i)=>pageAt(offsets[i])>=lo&&pageAt(offsets[i])<=hi);
 results.push({hold,repeatCount:obs.flat().filter(x=>x.q<0).length,byLen,broadFailed:failed.length,exactFailed:exactFailed.length,firstByLength,firstExactFailure:exactFailed.length?witness(exactFailed[0]):null,canonical:stats(dec),opening:stats(region(0,2)),holdout:stats(region(40,53)),openingWords:dec.slice(0,25).map(render).join(" "),holdoutWords:region(40,53).slice(0,25).map(render).join(" ")});
 }
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const plants=[];
 for(let j=0;j<3;j++){
 const p=donor.slice(j*200,j*200+200),S=identity.slice();let state=(3301+j)>>>0;for(let i=27;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const t=state%(i+1);[S[i],S[t]]=[S[t],S[i]];}
 const c=transform(p,S,true,true),o=observations(c,true);check(same(transform(c,S,false,true),p),"plant replay");
 // Train on only the first 150 words whose GP spellings are in the pinned lexicon.
 const train=[];for(let i=0;i<150;i++)if(p[i].length>=3&&known.has(key(p[i]))){const row=candidates(o[i],false);check(row.some(x=>same(x.p,p[i])),"true candidate");train.push(row);}
 const sol=propagate(train);check(sol.domains&&S.every((r,q)=>sol.domains[q]&(1<<r)),"true key retained");
 const single=sol.domains.every(x=>pop(x)===1);const recovered=single?sol.domains.map(x=>31-Math.clz32(x)):null;
 const plain=recovered?transform(c,recovered,false,true):null;
 plants.push({runes:p.flat().length,training:train.length,rounds:sol.rounds,domainSizes:sol.domains.map(pop),unique:single,exact:plain?same(plain,p):false,holdoutExact:plain?same(plain.slice(150),p.slice(150)):false});
 }
 return {lexicon:known.size,results,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const r=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(r(paths[0])),r(paths[1]),JSON.parse(r(paths[2])),r(paths[3])),null,2));
