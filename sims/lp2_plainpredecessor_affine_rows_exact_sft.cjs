"use strict";
// Direct previous-plaintext affine-row inverse. All 812^29 globally shared row tables.
// Ordinary symbols, arbitrary independent word-start IVs; no authored cipher claim.
// Run from the repository root: node sims/lp2_plainpredecessor_affine_rows_exact_sft.cjs
const fs=require('node:fs'),assert=require('node:assert/strict');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
function experiment(data) {
 const j=JSON.parse(data[0]),idx=new Map(j.runes.map((x,i)=>[x,i]));
 const native=JSON.parse(data[2]).sections.map(s=>({name:s.name,words:s.source_text.split(/[^ᚠ-ᛠ]+/u).map(w=>[...w].filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(w=>w.length)}));
 let words=[],w=[],at=0,start=0;
 for(const x of data[1].split('%').slice(0,55).join('%')){if(idx.has(x)){if(!w.length)start=at;w.push(idx.get(x));at++}else if(!' %/\n\r\t'.includes(x)&&w.length){words.push({start,w});w=[]}}if(w.length)words.push({start,w});
 if(words.length!==2896||at!==12956||words.flatMap(x=>x.w).join(',')!==j.pages.slice(0,56).flatMap(p=>p.indices).join(','))throw Error('source parse');
 const tokens=j.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 /** @param {string} word @returns {number[]} */
 function encode(word){let s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA'),p=[];while(s.length){const t=tokens.find(t=>s.startsWith(t.s));if(!t)throw Error(s);p.push(t.i);s=s.slice(t.s.length)}return p}
 const corpora=data.slice(3).map(f=>(f.match(/[A-Za-z]+/g)||[]).map(encode));
 /** @param {number} ex */
 const lexicon=ex=>{const m=new Map();for(let i=0;i<corpora.length;i++)if(i!==ex)for(const w of corpora[i])m.set(w.join(','),w);for(const n of native)for(const w of n.words)m.set(w.join(','),w);return m};
 const mod=x=>((x%29)+29)%29,inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
 // A row-domain is unrestricted (0), one point (1..841), or a fixed affine map (842..1653).
 const M=1654,T=new Int16Array(M*M);
 for(let i=0;i<M;i++){T[i]=i;T[i*M]=i;for(let k=1;k<=i;k++){let z=-1;if(i<842){const x=(i-1)/29|0,y=(i-1)%29,u=(k-1)/29|0,v=(k-1)%29;if(x===u){if(y===v)z=i}else if(y!==v){const a=mod((y-v)*inv[mod(x-u)]);z=842+(a-1)*29+mod(y-a*x)}}else if(k>=842){if(i===k)z=i}else{const a=((i-842)/29|0)+1,b=(i-842)%29,x=(k-1)/29|0,y=(k-1)%29;if(mod(a*x+b)===y)z=i}T[i*M+k]=T[k*M+i]=z}}
 /** @param {number[]} C @param {number[]} P */
 function candidate(C,P){const row=new Int16Array(29);let m=0;for(let k=1;k<C.length;k++){const x=P[k-1],point=1+29*P[k]+C[k],v=T[row[x]*M+point];if(v<0)return null;row[x]=v;m|=1<<x}const fields=[];for(let x=0;x<29;x++)if(m&(1<<x))fields.push(x,row[x]);return {p:P,f:fields}}
 /** @param {{f:number[]}} c @param {Int16Array} s */
 function fit(c,s){for(let j=0;j<c.f.length;j+=2)if(T[s[c.f[j]]*M+c.f[j+1]]<0)return false;return true}
 /** @param {{f:number[]}} c @param {Int16Array} s */
 function merge(c,s){const t=s.slice();for(let j=0;j<c.f.length;j+=2){const x=c.f[j];t[x]=T[t[x]*M+c.f[j+1]]}return t}
 /** @param {{w:number[],start:number}[]} rows @param {Map<string,number[]>} L */
 function listsFor(rows,L){const by=new Map();for(const p of L.values()){if(!by.has(p.length))by.set(p.length,[]);by.get(p.length).push(p)}return rows.map(r=>({r,c:(by.get(r.w.length)||[]).map(p=>candidate(r.w,p)).filter(Boolean)}))}
 /** @param {ReturnType<typeof listsFor>} lists @param {number} cap @param {number} limit */
 function solve(lists,cap=200000,limit=2){let nodes=0,checks=0,best=0,answers=[],capped=false;
 function dfs(S,rest,chosen){if(++nodes>cap){capped=true;return true}if(chosen.length>best)best=chosen.length;if(!rest.length){answers.push({S,chosen});return answers.length>=limit}let k=0;for(let j=1;j<rest.length;j++)if(rest[j].c.length<rest[k].c.length)k=j;if(!rest[k].c.length)return false;const R=rest[k],other=rest.filter((_,i)=>i!==k);for(const c of R.c){const U=merge(c,S),next=[];let ok=true;for(const x of other){const C=x.c.filter(v=>{checks++;return fit(v,U)});if(!C.length){ok=false;break}next.push({r:x.r,c:C})}if(ok&&dfs(U,next,[...chosen,{r:R.r,p:c.p}]))return true}return false}
 dfs(new Int16Array(29),lists,[]);return{nodes,checks,best,capped,answers,rootSizes:lists.map(x=>x.c.length)}}
 const sort=(a,b)=>b.w.length-a.w.length||a.start-b.start;
 const selected=words.filter(r=>r.w.length>=12).sort(sort);
 const L=lexicon(-1),originalLists=listsFor(selected,L);
 const parts=[];
 for(let k=0;k<24;k+=6){const R=originalLists.slice(k,k+6);let max=-1,totalNodes=0,totalChecks=0,survivor=null;outer:for(let n=6;n>=1;n--){for(let mask=1;mask<64;mask++){if(mask.toString(2).replace(/0/g,'').length!==n)continue;const S=solve(R.filter((_,i)=>mask&(1<<i)),200000,1);totalNodes+=S.nodes;totalChecks+=S.checks;if(S.capped)throw Error('original cap');if(S.answers.length){max=n;survivor={mask,words:S.answers[0].chosen.map(x=>[x.r.start,x.p.map(n=>j.translit[n]).join('')])};break outer}}}parts.push({rows:R.map(x=>[x.r.start,x.r.w.length]),rootSizes:R.map(x=>x.c.length),max,totalNodes,totalChecks,survivor})}
 const controls=[];
 let seed=0x4733a41;
 const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 for(const ex of [1,2]){const L=lexicon(ex),source=corpora[ex],K=Array.from({length:29},()=>[1+rng()%28,rng()%29]);const encrypt=(p,start)=>{const C=[mod(p[0]+start)];for(let i=1;i<p.length;i++){const [a,b]=K[p[i-1]];C.push(mod(a*p[i]+b))}return C};
 const prep=source.slice(0,1600).map((p,i)=>({p,start:i,w:encrypt(p,rng()%29)})).filter(r=>r.p.length>=8&&L.has(r.p.join(','))).sort(sort).slice(0,30);
 const training=solve(listsFor(prep,L),200000,2);const a=training.answers[0];if(!a)throw Error('control failed');const keyRows=[...a.S].map((v,x)=>v>=842?{x,a:((v-842)/29|0)+1,b:(v-842)%29}:null).filter(Boolean);const knownCorrect=keyRows.filter(r=>r.a===K[r.x][0]&&r.b===K[r.x][1]).length;
 const trainCorrect=a.chosen.filter(r=>r.p.join(',')===r.r.p.join(',')).length;
 const test=source.slice(1600,1900).map((p,i)=>({p,start:1600+i,w:encrypt(p,rng()%29)})).filter(r=>r.p.length>=6);
 const hold=listsFor(test,L);let unique=0,correct=0,totalRunes=0,correctRunes=0,inLex=0,covered=0;
 for(const x of hold){const p=x.r.p;if(L.has(p.join(',')))inLex++;const matches=x.c.filter(c=>fit(c,a.S));if(matches.length)covered++;if(matches.length===1){unique++;totalRunes+=p.length;if(matches[0].p.join(',')===p.join(',')){correct++;correctRunes+=p.length}}}
 controls.push({ex,lex:L.size,train:prep.length,trainCorrect,solutions:training.answers.length,capped:training.capped,nodes:training.nodes,checks:training.checks,keyRows:keyRows.length,knownCorrect,hold:hold.length,inLex,covered,unique,correct,totalRunes,correctRunes,rows:keyRows});}
 return {lex:L.size,originalParts:parts,originalOovLower:parts.reduce((a,p)=>a+6-p.max,0),controls};
}
const r=experiment(paths.map(p=>fs.readFileSync(p,'utf8')));
assert.equal(r.lex,32131);assert.deepEqual(r.originalParts.map(p=>p.max),[2,3,3,3]);assert.equal(r.originalOovLower,13);assert.deepEqual(r.controls.map(c=>[c.train,c.trainCorrect,c.solutions,c.capped,c.keyRows,c.knownCorrect,c.hold,c.inLex,c.unique,c.correct,c.correctRunes]),[[30,30,1,false,18,18,48,41,37,37,253],[30,30,1,false,19,19,67,46,45,45,329]]);
console.log(JSON.stringify(r,null,2));
