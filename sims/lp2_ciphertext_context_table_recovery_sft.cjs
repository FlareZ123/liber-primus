/* Agent 9: shared ciphertext-feedback additive table, blind inference and page holdout. */
const fs=require('node:fs');
const experiment=function experiment(ct,tx,lex,lp){
const corp=JSON.parse(ct),runeMap=new Map(corp.runes.map((r,i)=>[r,i])),alias=corp.translit,mod=x=>(x+29)%29;
const tokenMap=new Map(alias.map((x,i)=>[x,i]));for(const [x,i] of [["ING",21],["IO",27],["K",5],["V",1],["Z",15]])tokenMap.set(x,i);
const tokens=[...tokenMap.keys()].sort((a,b)=>b.length-a.length);
function enc(w){let out=[];w=w.toUpperCase();while(w.length){let t=tokens.find(t=>w.startsWith(t));if(!t)return null;out.push(tokenMap.get(t));w=w.slice(t.length)}return out}
const str=a=>String.fromCharCode(...a.map(x=>65+x));
const D=new Map(), tri=new Float64Array(30**3), bi=new Float64Array(900), pos=Array.from({length:4},()=>new Float64Array(29));
const cat=(i,n)=>n===1?0:i===0?1:i===n-1?3:2;
for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+) (\d+)$/);if(!m)continue;const a=enc(m[1]);if(!a)continue;let f=+m[2];D.set(str(a),(D.get(str(a))||0)+f);let u=29,v=29;for(let i=0;i<=a.length;i++){let w=i===a.length?29:a[i];tri[(u*30+v)*30+w]+=f;bi[u*30+v]+=f;if(i<a.length)pos[cat(i,a.length)][w]+=f;u=v;v=w}}
for(let i=0;i<900;i++)for(let j=0;j<30;j++)tri[i*30+j]=Math.log((tri[i*30+j]+0.5)/(bi[i]+15));
for(let row of pos){let total=row.reduce((x,y)=>x+y,0)+29;for(let i=0;i<29;i++)row[i]=Math.log((row[i]+1)/total)}
function wordscore(p){let u=29,v=29,s=0;for(let i=0;i<=p.length;i++){let w=i===p.length?29:p[i];s+=tri[(u*30+v)*30+w];u=v;v=w}const f=D.get(str(p));return s+(f?5+0.25*Math.log1p(f):0)}
const pages=tx.split("%"),source=[];
for(let p=0;p<58;p++){if(p===50){source[p]=[];continue}const words=pages[p<50?p:p-1].replace(/[/\s]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>Array.from(w,x=>runeMap.get(x)));if(words.flat().join()!==corp.pages[p].indices.join())throw Error("source mismatch "+p);source[p]=words}
function pairs(groups){let out=[];for(let words of groups){let prev=0;for(let j=0;j<words.length;j++){let w=words[j],states=[];for(let c of w){states.push(prev);prev=c}if(j>0&&j<words.length-1)out.push({c:w,states})}}return out}
function plant(groups,k){return groups.map(words=>{let prev=0;return words.map(w=>w.map(p=>{let c=mod(p+k[prev]);prev=c;return c}))})}
function dec(w,k){return w.c.map((c,i)=>mod(c-k[w.states[i]]))}
function stats(data,k){let n=0,hit=0,wn=0,wh=0,s=0,preview=[];for(let w of data){let p=dec(w,k);n+=p.length;wn++;s+=wordscore(p);if(D.has(str(p))){hit+=p.length;wh++}if(preview.length<18)preview.push(p.map(x=>alias[x]).join(""))}return {n,hit,wn,wh,coverage:hit/n,score:s/n,preview:preview.join(" ")}}
let seed=918273;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32}
function fit(data,restarts=4){const groups=Array.from({length:29},()=>[]),u=Array.from({length:29},()=>new Float64Array(29));for(let w of data){for(let s of new Set(w.states))groups[s].push(w);for(let i=0;i<w.c.length;i++){let s=w.states[i],c=w.c[i];for(let d=0;d<29;d++)u[s][d]+=pos[cat(i,w.c.length)][mod(c-d)]}}
const ranked=u.map(a=>Array.from({length:29},(_,i)=>i).sort((i,j)=>a[j]-a[i]));let best=null,attempts=[];
for(let r=0;r<restarts;r++){let k=ranked.map(a=>a[r===0?0:Math.floor(rnd()*(r===1?3:9))]);for(let it=0;it<9;it++){let changed=0,order=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=Math.floor(rnd()*(i+1));[order[i],order[j]]=[order[j],order[i]]}for(let s of order){let old=k[s],win=old,top=-Infinity;for(let d=0;d<29;d++){k[s]=d;let v=0;for(let w of groups[s])v+=wordscore(dec(w,k));if(v>top){top=v;win=d}}k[s]=win;if(old!==win)changed++}if(!changed)break}
let st=stats(data,k);attempts.push({score:st.score,coverage:st.coverage});if(!best||st.score>best.stats.score)best={k,stats:st}}
return {...best,attempts}}
const lpGroups=lp.split(/^### \d+/m).slice(1).filter(s=>!s.includes("A WEBPAGE")&&!s.includes("PARABLE")).map(s=>(s.match(/[A-Z]+/g)||[]).map(enc).filter(Boolean)).filter(a=>a.length>5);
const key=Array.from({length:29},()=>Math.floor(rnd()*29));const trainControl=pairs(plant(lpGroups,key)),testControl=pairs(plant([source[57]],key));
const control=fit(trainControl);const holdControl=stats(testControl,control.k);const exact=control.k.filter((x,i)=>x===key[i]).length;
const orig=fit(pairs(source.slice(0,40)));const hold=stats(pairs(source.slice(40,56)),orig.k);
return {model:"C_i=P_i+K[C_(i-1)] mod29",lexicon:D.size,control:{trueKey:key,recoveredKey:control.k,exactKeyEntries:exact,train:control.stats,holdout:holdControl,attempts:control.attempts},original:{key:orig.k,train:orig.stats,holdout:hold,attempts:orig.attempts},originalReplay:pairs(source.slice(0,56)).every(w=>dec(w,orig.k).every((p,i)=>mod(p+orig.k[w.states[i]])===w.c[i]))}
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
console.log(JSON.stringify(experiment(...paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
