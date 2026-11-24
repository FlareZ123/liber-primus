'use strict';
// Agent4 #2467. Reproduce exact GP29 reciprocal prime feedback + word-boundary shift.
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,transcript,solved,lexicon){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const index=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[]; let w=[],page=0,start=0,cross=0;
 const finish=()=>{if(w.length){words.push({p:w,page:start});if(start!==page)cross++;w=[];}};
 for(const c of transcript.split("%").slice(0,55).join("%")){if(index.has(c)){if(!w.length)start=page;w.push(index.get(c));}else if(c==="%")page++;else if(c!=="/"&&!/\s/u.test(c))finish();}
 finish();assert(words.length===2896,"words");assert(words.flatMap(w=>w.p).length===12956,"runes");
 const actual=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 assert(words.flatMap(w=>w.p).every((v,i)=>v===actual[i]),"original indices");
 const textWords=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>index.get(c))));
 assert(textWords.flat().every(Number.isInteger),"donor");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const code=p=>String.fromCharCode(...p);
 const gp=s=>{s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length)}return p;};
 const lex=new Set();for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const p=gp(m[1]);if(p)lex.add(code(p));}}
 assert(lex.size>20000,"lexicon");
 const inv=Array(29).fill(0);for(let s=1;s<29;s++)for(let t=1;t<29;t++)if(s*t%29===1)inv[s]=t;
 const tr=Array.from({length:29},(_,a)=>Array.from({length:29},(_,s)=>Array.from({length:29},(_,c)=>mod(inv[mod(s+corpus.prime[mod(c-s)])]+a))));
 /** @param {number[][]} input @param {number[]} key @param {boolean} enc */
 function transform(input,key,enc){let [s,a,b]=key;const out=[];for(const word of input){const z=[];for(const v of word){const p=enc?v:mod(v-s),c=enc?mod(p+s):v;z.push(enc?c:p);s=tr[a][s][c];}s=mod(s+b);out.push(z);}return out;}
 function metrics(ws){let hit=0,n=0,score=0,long=0;for(const p of ws){n+=p.length;if(lex.has(code(p))){hit+=p.length;score+=p.length*p.length;if(p.length>=5)long++;}}const cnt=Array(29).fill(0);for(const p of ws)for(const x of p)cnt[x]++;return {words:ws.length,runes:n,score,coverage:hit/n,long,IoC:cnt.reduce((v,x)=>v+x*(x-1),0)/(n*(n-1))};}
 function search(input,n){let best=-1,keys=[];const single=[3,10,24];let validTrain=0,validAll=0;for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let seed=0;seed<29;seed++){let s=seed,score=0,okay=true;for(let j=0;j<n;j++){let word=input[j],p=[];for(const c of word){p.push(mod(c-s));s=tr[a][s][c];}s=mod(s+b);if(lex.has(code(p)))score+=p.length*p.length;if(p.length===1&&!single.includes(p[0]))okay=false;}if(okay){validTrain++;for(let j=n;j<input.length&&okay;j++){let w=input[j];for(const c of w){if(w.length===1&&!single.includes(mod(c-s)))okay=false;s=tr[a][s][c];}s=mod(s+b);}if(okay)validAll++;}if(score>best){best=score;keys=[[seed,a,b]];}else if(score===best)keys.push([seed,a,b]);}return {best,keys,validTrain,validAll};}
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const plants=[];for(let i=0;i<4;i++){const p=textWords.slice(i*180,i*180+180);assert(p.length===180,"plant");const key=[[4,7,11],[23,3,19],[15,26,2],[28,0,17]][i];const c=transform(p,key,true);const f=search(c,100);const rec=transform(c,f.keys[0],false);assert(equal(transform(rec,f.keys[0],true),c),"plant replay");plants.push({key,best:f.best,top:f.keys,exact:equal(rec,p),train:metrics(rec.slice(0,100)),holdout:metrics(rec.slice(100)),singleTrain:f.validTrain,singleAll:f.validAll});}
 const cw=words.map(w=>w.p),n=words.findIndex(w=>w.page>=3),end=words.findIndex(w=>w.page>=8);
 const f=search(cw,n),key=f.keys[0],dec=transform(cw,key,false);assert(equal(transform(dec,key,true),cw),"original replay");
 return {lex:lex.size,donorWords:textWords.length,trainWords:n,holdoutEnd:end,plants,original:{key,top:f.keys,train:metrics(dec.slice(0,n)),holdout:metrics(dec.slice(n,end)),all:metrics(dec),singleTrain:f.validTrain,singleAll:f.validAll,prefix:dec.slice(0,20).map(p=>p.map(i=>corpus.translit[i]).join("")).join(" ")}};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const p=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(JSON.parse(read(p[0])),read(p[1]),JSON.parse(read(p[2])),read(p[3])),null,2));
