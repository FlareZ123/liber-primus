'use strict';
// Exact reverse whole-word autokey: affine GP0/prime-minus-one key maps.
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,trans,solved,lextext){
const check=(v,msg)=>{if(!v)throw Error(msg);};
const mod=x=>((x%29)+29)%29,code=p=>String.fromCharCode(...p),decode=s=>Array.from(s,c=>c.charCodeAt(0)),eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const idx=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let word=[];
for(const c of trans.split('%').slice(0,55).join('%')){if(idx.has(c))word.push(idx.get(c));else if(!'%/'.includes(c)&&!/\s/u.test(c)&&word.length){words.push(word);word=[];}}
if(word.length)words.push(word);
check(words.length===2896&&eq(words.flat(),corpus.pages.slice(0,56).flatMap(p=>p.indices))&&words.flat().length===12956,'original tape');
const offsets=[0],bounds=[0];for(const w of words)offsets.push(offsets.at(-1)+w.length);for(const p of corpus.pages.slice(0,56))bounds.push(bounds.at(-1)+p.indices.length);
const singles=words.flatMap((w,i)=>w.length===1?[i]:[]),seeds=Array.from({length:29},(_,i)=>code([i]));check(singles.length===83,'singleton count');
const anchor=[...solved.sections[7].source_text.match(/[\u16a0-\u16ff]+/gu)[0]].map(c=>idx.get(c));check(eq(anchor,[24,9]),'AN anchor');
const map=(a,b,c=0)=>corpus.prime.map((p,i)=>mod(a*i+b+c*(p-1)));
function emit(p,k,f,hold=true){let t=0;return p.map(v=>hold&&v===0?0:mod(v+f[k[t++%k.length]]));}
function one(c,k,f){const dest=new Set(),key=Array.from(k,x=>f[x.charCodeAt(0)]);function dfs(i,t,p){if(i===c.length){check(eq(emit(decode(p),decode(k),f),c),'forward replay');dest.add(p);return;}const v=mod(c[i]-key[t%key.length]);if(c[i]===0)dfs(i+1,t,p+'\0');if(v!==0)dfs(i+1,t+1,p+seeds[v]);}dfs(0,0,'');return dest;}
function step(c,states,f){const out=new Set();for(const k of states)for(const p of one(c,k,f))out.add(p);return out;}
function trace(ws,start,seed,f,end=0){let states=new Set(seed),max=states.size;for(let j=start;j>=end;j--){states=step(ws[j],states,f);max=Math.max(max,states.size);if(!states.size)return{death:j,max};}return{death:null,max,states:states.size};}
const summarize=(arr,start)=>({tested:arr.length,survivors:arr.filter(r=>r.death===null),longest:arr.filter(r=>r.death!==null).sort((a,b)=>a.death-b.death).slice(0,5).map(r=>({...r,runes:offsets[start+1]-offsets[r.death]})),maxStates:Math.max(...arr.map(r=>r.max))});
const affine=[],free=[],primeAnchor=[],primeFree=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++){const f=map(a,b);affine.push({a,b,...trace(words,words.length-1,[code(anchor)],f)});free.push({a,b,...trace(words,singles.at(-1)-1,seeds,f)});}
for(let c=1;c<29;c++)for(let a=0;a<29;a++)for(let b=0;b<29;b++){const f=map(a,b,c);primeAnchor.push({a,b,c,...trace(words,words.length-1,[code(anchor)],f)});primeFree.push({a,b,c,...trace(words,singles.at(-1)-1,seeds,f)});}
const donors=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(s){s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');const p=[];while(s.length){const m=tok.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
const lex=new Set(donors.map(code));for(const l of lextext.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const p=encode(m[1]);if(p)lex.add(code(p));}}check(lex.size===29081,'frozen lexicon count');
function best(start,end,f,initial=seeds){let states=new Map(initial.map(s=>[s,{matched:0,n:0,count:1n,path:[s]}]));for(let j=start;j>=end;j--){const dest=new Map();for(const [k,x] of states)for(const p of one(words[j],k,f)){const h=lex.has(p)&&p.length>=4,n=x.n+(h?1:0),matched=x.matched+(h?p.length:0),old=dest.get(p),count=(old?.count??0n)+x.count;if(!old||matched>old.matched||(matched===old.matched&&n>old.n))dest.set(p,{matched,n,count,path:[...x.path,p]});else old.count=count;}states=dest;}if(!states.size)return null;const v=[...states.values()].sort((a,b)=>b.matched-a.matched||b.n-a.n)[0];for(let i=1;i<v.path.length;i++)check(eq(emit(decode(v.path[i]),decode(v.path[i-1]),f),words[start+1-i]),'best replay');return {matched:v.matched,n:v.n,paths:[...states.values()].reduce((s,x)=>s+x.count,0n).toString(),output:v.path.slice(1).reverse().map(w=>decode(w).map(i=>corpus.translit[i]).join('')).join(' ')};}
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([p,q])=>{const end=words.findIndex((w,i)=>offsets[i]>=bounds[p]),seed=singles.filter(i=>offsets[i]>=bounds[p]&&offsets[i+1]<=bounds[q+1]).at(-1);const surv=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){const f=map(a,b),r=trace(words,seed-1,seeds,f,end);if(r.death===null)surv.push({a,b,...best(seed-1,end,f)});}const nonnull=surv.filter(x=>x.a||x.b).sort((a,b)=>b.matched-a.matched||b.n-a.n);return {p,q,end,seed,groups:seed-end,runes:offsets[seed]-offsets[end],eligible:words.slice(end,seed).filter(w=>w.length>=4).length,surv:surv.length,nonnull:nonnull.length,totalPaths:nonnull.reduce((s,x)=>s+BigInt(x.paths),0n).toString(),best:nonnull[0]??null};});
function ordinary(ws,start){const hist={};for(let a=0;a<29;a++){let k=[[1,0,0]],sing=[[1,0,0]];for(let j=start-1;j>=0;j--){k=ws[j].map((v,i)=>{const [x,y,z]=k[i%k.length];return[mod(-a*x),mod(-a*y-1),mod(v-a*z)];});if(k.length===1)sing.push(k[0]);}for(let b=0;b<29;b++)for(let s=0;s<29;s++){const types=new Set(sing.map(([x,y,z])=>mod(x*s+y*b+z))).size;hist[types]=(hist[types]??0)+1;}}return hist;}
const controls=[[0,3,7,0],[150,17,21,1],[300,28,12,11]].map(([i,a,b,c])=>{const p=donors.slice(i,i+150),f=map(a,b,c),cipher=p.map((w,j)=>j===p.length-1?w:emit(w,p[j+1],f));let states=new Set([code(p.at(-1))]),max=1,n=0;for(let j=p.length-2;j>=0;j--){states=step(cipher[j],states,f);check(states.has(code(p[j])),'true branch lost');max=Math.max(max,states.size);n+=cipher[j].length;}return {a,b,c,runes:n,max,states:states.size};});

const privatePrimeChapters=chapters.map(({p,q,end,seed,groups,runes,eligible})=>{
 const live=[];
 for(let c=1;c<29;c++)for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const f=map(a,b,c),r=trace(words,seed-1,seeds,f,end);
  if(r.death===null)live.push({a,b,c,...best(seed-1,end,f)});
 }
 live.sort((x,y)=>y.matched-x.matched||y.n-x.n);
 return {p,q,groups,runes,eligible,live:live.length,paths:live.reduce((s,x)=>s+BigInt(x.paths),0n).toString(),best:live[0]??null};
});
const terminalAnchorChapter=chapters.at(-1);
const anchoredLocal=[...affine,...primeAnchor].filter(x=>(x.a||x.b||x.c)&&(x.death===null||x.death<terminalAnchorChapter.end)).map(x=>({a:x.a,b:x.b,c:x.c??0,...best(words.length-1,terminalAnchorChapter.end,map(x.a,x.b,x.c??0),[code(anchor)])}));

const hist=ordinary(words,singles.at(-1));
return {wordCount:words.length,runeCount:offsets.at(-1),anchor,singletons:singles.length,affine:summarize(affine,words.length-1),free:summarize(free,singles.at(-1)-1),primeAnchor:summarize(primeAnchor,words.length-1),primeFree:summarize(primeFree,singles.at(-1)-1),chapters,privatePrimeChapters,anchoredLocal,ordinaryHist:hist,controls,lexiconSize:lex.size};
}
const out=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(out,null,2));
