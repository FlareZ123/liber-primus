'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const [c0,I,II,III,n0]=raw,c=JSON.parse(c0),native=JSON.parse(n0);
 const Q=29,mod=x=>(x%Q+Q)%Q,same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(v,m)=>{if(!v)throw Error(m)};
 const p57=c.pages[57].indices, p32=c.pages[32].indices;
 const units=[p57.slice(0,7),p57.slice(7,37),p57.slice(37,67),p57.slice(67)];
 const sums=units.map(a=>a.reduce((t,x)=>t+c.prime[x],0));
 const prime=n=>n>=2&&!Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).some(i=>n%i===0);
 const ranks=sums.map(n=>Array.from({length:n+1},(_,i)=>i).filter(prime).length);
 check(same(sums,[449,1259,1031,1229])&&same(ranks,[87,205,173,201]),"p57 sums");
 const diffs=[ranks[1]-ranks[2],ranks[3]-ranks[2]];
 const digits=diffs.join("");
 const chapters=[I,II,III].map(s=>{const a={};let v=0;for(const line of s.split(/\r?\n/)){const m=line.match(/^(\d+)\.\s+(.*)$/);if(m){v=+m[1];a[v]=m[2]}else if(v&&line.trim())a[v]+="\n"+line;}return a});
 const records=[];
 for(let i=1;i<digits.length-1;i++)for(let j=i+1;j<digits.length;j++){const a=Number(digits.slice(0,i)),b=Number(digits.slice(i,j)),k=Number(digits.slice(j));const verse=chapters[a-1]?.[b];if(!verse||k<1||k>verse.length)continue;const ch=verse[k-1],first=verse.indexOf(ch)+1;records.push({chapter:a,verse:b,position:k,character:ch,first,compatible:first===k,source:verse});}
 check(records.length===2&&records.filter(x=>x.compatible).length===1,"coordinate parse");
 const selected=records.find(x=>x.compatible);
 check(selected.chapter===3&&selected.verse===2&&selected.position===28&&selected.character==="m","historical address");
 const word=[...selected.source.matchAll(/[A-Za-z]+/g)].find(m=>m.index<=selected.position-1&&selected.position-1<m.index+m[0].length)[0];
 check(word==="homeward","containing token");
 const hits=[];for(let k=0;k<chapters.length;k++)for(const [v,s] of Object.entries(chapters[k]))for(const m of s.matchAll(/\b(?:home[a-z]*|tahuti|thoth|tehuti|hermes)\b/gi))hits.push({chapter:k+1,verse:+v,word:m[0],position:m.index+1});
 check(same(p32.slice(28,37),[2,0,0,3,2,8,3,19,18]),"source motif");
 const alphabet=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=alphabet.find(t=>w.startsWith(t.s,i));check(t,"GP "+w);a.push(t.i);i+=t.s.length}}return a})}
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const train=native.sections.filter(s=>!["0_welcome","0_koan_1","p57_parable","p56_an_end"].includes(s.name)).map(s=>read(s.source_text));
 const u=new Uint32Array(Q),b=new Uint32Array(Q**2),t=new Uint32Array(Q**3),bctx=new Uint32Array(Q),tctx=new Uint32Array(Q**2);let total=0;
 for(const a of train)for(let i=0;i<a.length;i++){u[a[i]]++;total++;if(i){b[a[i-1]*Q+a[i]]++;bctx[a[i-1]]++}if(i>=2){let j=a[i-2]*Q+a[i-1];t[j*Q+a[i]]++;tctx[j]++}}
 const UP=Array.from(u,x=>(x+1)/(total+Q));
 const BP=Array.from(b,(x,i)=>(x+16*UP[i%Q])/(bctx[Math.floor(i/Q)]+16));
 const TP=Array.from(t,(x,i)=>(x+12*BP[i%(Q**2)])/(tctx[Math.floor(i/Q)]+12));
 function score(a){return a.reduce((s,x,i)=>s+Math.log(i===0?UP[x]:i===1?BP[a[i-1]*Q+x]:TP[(a[i-2]*Q+a[i-1])*Q+x]),0)/a.length}
 const render=a=>a.map(x=>c.translit[x]).join(" ");
 function encrypt(P,K,hold){let j=0;return P.map(p=>hold&&p===0?0:mod(p+K[j++%K.length]));}
 function decode(C,K,hold){const out=[];const P=[];function step(i,j){if(i===C.length){check(same(encrypt(P,K,hold),C),"replay");out.push({P:[...P],score:score(P),text:render(P)});return;}const p=mod(C[i]-K[j%K.length]);if(hold&&C[i]===0){P.push(0);step(i+1,j);P.pop();}if(!hold||p!==0){P.push(p);step(i+1,j+1);P.pop()}}step(0,0);return out.sort((a,b)=>b.score-a.score)}
 const candidates=[["character",selected.character],["containing_word",word],["whole_verse",selected.source]];
 const controls=["0_welcome","0_koan_1"].map(n=>({name:n,P:read(native.sections.find(s=>s.name===n).source_text).slice(0,121)}));
 const tests=[];
 for(const [name,source] of candidates){const key=gp(source);for(const hold of [false,true]){const plants=controls.map(({name,P})=>{const C=encrypt(P,key,hold),out=decode(C,key,hold);return {name,paths:out.length,truthRetained:out.some(x=>same(x.P,P)),topMatches:out[0]?.P.filter((x,i)=>P[i]===x).length,topScore:out[0]?.score,trueScore:score(P)}});check(plants.every(x=>x.truthRetained),"plant");const out=decode(p32,key,hold);tests.push({name,source,key,hold,plants,original:{paths:out.length,best:out[0]??null,all:out}})}}
 return {sourceSums:sums,ranks,diffs,digits,records,selectedContainingWord:word,aliasAndHomeMatches:hits,p32Motif:render(p32.slice(28,37)),trainingRunes:total,tests};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
