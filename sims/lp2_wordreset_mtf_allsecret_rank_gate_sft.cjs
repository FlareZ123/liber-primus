'use strict';
// Agent17: all-secret word-reset MTF rank-output gate.
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,transcript,solved,lexicon){
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];let w=[],page=0,start=0,last=0,cross=0;
function finish(){if(w.length){words.push({p:w,page:start});if(start!==last)cross++;w=[]}}
for(const c of transcript.split("%").slice(0,55).join("%")){if(index.has(c)){if(!w.length)start=page;last=page;w.push(index.get(c))}else if(c==="%")page++;else if(c!=="/"&&!/\s/u.test(c))finish()}
finish();
const source=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
if(words.length!==2896||cross!==32||source.length!==12956||!words.flatMap(w=>w.p).every((x,i)=>x===source[i]))throw Error(`original parser ${words.length} ${cross} ${source.length}`);
const native=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>index.get(c))));
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length)}return p}
const ALL=(1<<29)-1;
function masks(word){const seen=[];const out=[];for(const p of word){const k=seen.indexOf(p);out.push(k>=0?(1<<k):(ALL^((1<<seen.length)-1)));if(k>=0)seen.splice(k,1);seen.unshift(p)}return out}
const dictionary=new Map();
for(const line of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m){const p=gp(m[1]);if(p){const k=String.fromCharCode(...p);dictionary.set(k,p)}}}
for(const p of native)dictionary.set(String.fromCharCode(...p),p);
const groups=new Map();
for(const p of dictionary.values()){const m=masks(p);if(!groups.has(p.length))groups.set(p.length,new Map());groups.get(p.length).set(m.join(","),m)}
const templates=new Map([...groups].map(([len,m])=>[len,[...m.values()]]));
function equalityPattern(word){const map=new Map();return word.map(x=>{if(!map.has(x))map.set(x,map.size);return map.get(x)})}
const cache=new Map();
function domains(word){const pat=equalityPattern(word);const k=pat.join(",");if(cache.has(k))return cache.get(k);const n=Math.max(...pat)+1;const union=Array(n).fill(0);let surviving=0;for(const tpl of templates.get(word.length)||[]){const m=Array(n).fill(ALL);for(let j=0;j<pat.length;j++)m[pat[j]]&=tpl[j];if(m.some(x=>x===0))continue;
const owner=Array(29).fill(-1);
function aug(i,seen){let bits=m[i];while(bits){const bit=bits&-bits;bits^=bit;const rank=31-Math.clz32(bit);if(seen[rank])continue;seen[rank]=true;if(owner[rank]===-1||aug(owner[rank],seen)){owner[rank]=i;return true}}return false}
if(!m.every((_,i)=>aug(i,Array(29).fill(false))))continue;
surviving++;for(let i=0;i<n;i++)union[i]|=m[i];
}
const v={union,surviving};cache.set(k,v);return v}
function evalWords(ws){const cost=Array.from({length:29},()=>Array(29).fill(0));let zero=0;let zeroRunes=0;for(const word of ws){const d=domains(word);if(!d.surviving){zero++;zeroRunes+=word.length}const seen=[];for(const x of word){if(!seen.includes(x))seen.push(x)}for(let i=0;i<seen.length;i++){const x=seen[i];for(let r=0;r<29;r++)if((d.union[i]&(1<<r))===0)cost[x][r]++}}
return {impossibleWords:zero,impossibleRunes:zeroRunes,minByRank:Array.from({length:29},(_,r)=>Math.min(...cost.map(c=>c[r]))),zeroGlyphs:cost.map((c,x)=>({x,cost:c[0]})),domains:cost.map(c=>c.flatMap((v,r)=>v===0?[r]:[])),cost}}
const orig=evalWords(words.map(w=>w.p));
let seed=3301;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const perm=()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const key=perm(),initials=native.map(()=>perm()),plant=native.map((p,i)=>{const state=initials[i].slice();return p.map(x=>{const rank=state.indexOf(x);state.splice(rank,1);state.unshift(x);return key[rank]})});const recovered=plant.map((c,i)=>{const state=initials[i].slice();return c.map(x=>{const r=key.indexOf(x),p=state[r];state.splice(r,1);state.unshift(p);return p})});if(JSON.stringify(recovered)!==JSON.stringify(native))throw Error("plant inverse");const pos=evalWords(plant);if(pos.impossibleWords||key.some((x,r)=>pos.cost[x][r]!==0))throw Error("plant support fail");
return {n:words.length,cross,dict:dictionary.size,templateCounts:[...templates].map(([n,t])=>[n,t.length]),cache:cache.size,original:{...orig,cost:undefined},positive:{words:plant.length,impossibleWords:pos.impossibleWords,key,keyRankCosts:key.map((x,r)=>pos.cost[x][r])}};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),f[1],JSON.parse(f[2]),f[3]),null,2));
