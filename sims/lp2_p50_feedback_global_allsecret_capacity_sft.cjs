'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,grid,transcript,shakespeare,gibran){
const check=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29;
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const C=corpus.pages.slice(0,56).flatMap(x=>x.indices),D=C.map((x,i)=>mod(x-(C[i-1]??0))),T=grid.bytes,N=C.length;
check(N===12956&&T.length===256,"source size");
const map=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=transcript.split("%").slice(0,-2).join("").replace(/[\/\r\n&$]/g,"").split(/[.\-]/).map(w=>[...w].filter(c=>map.has(c)).map(c=>map.get(c))).filter(w=>w.length);
check(words.length===2896&&equal(words.flat(),C),"original parse");
function cumulative(counts){let sum=0;return [...counts].sort((a,b)=>b-a).map(x=>sum+=x)}
function capacity(channel,driver,mode,seed){
let s=seed;const counts=new Uint16Array(256*29);
for(let i=0;i<N;i++){counts[s*29+channel[i]]++;s=mode==="XOR"?(T[s]^driver[i]):((T[s]+driver[i])&255)}
const total=Array(29).fill(0);
for(let k=0;k<256;k++){const v=cumulative(counts.slice(k*29,(k+1)*29));for(let j=0;j<29;j++)total[j]+=v[j]}
return total;
}
const regimes=[];
for(const mode of ["XOR","ADD"])for(const driver of ["C","D"])for(const channel of ["C","D"]){
const maxima=Array(29).fill(0),seeds=Array(29).fill(0);
for(let seed=0;seed<256;seed++){const v=capacity(channel==="C"?C:D,driver==="C"?C:D,mode,seed);for(let k=0;k<29;k++)if(v[k]>maxima[k]){maxima[k]=v[k];seeds[k]=seed}}
regimes.push({mode,driver,channel,maxima,seeds});
}
const alphabet=corpus.translit.map((token,id)=>({token,id})).sort((a,b)=>b.token.length-a.token.length);
const native=word=>{const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3;continue;}if(s.startsWith("IO",i)){a.push(27);i+=2;continue;}const h=alphabet.find(x=>s.startsWith(x.token,i));check(h,"native "+s);a.push(h.id);i+=h.token.length}return a};
const nativeWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(native);
let rng=0x50330186;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
function donor(name,source){
const ws=nativeWords(source),flat=ws.flat(),pools=new Map();
for(const w of ws){if(!pools.has(w.length))pools.set(w.length,[]);pools.get(w.length).push(w)}
const sampleMin=Array(29).fill(Infinity),windowMin=Array(29).fill(Infinity);
for(let trial=0;trial<1000;trial++){const count=Array(29).fill(0);for(const w of words){const pool=pools.get(w.length);check(pool?.length,"length pool "+w.length);for(const x of pool[rand()%pool.length])count[x]++}const v=cumulative(count);for(let j=0;j<29;j++)sampleMin[j]=Math.min(sampleMin[j],v[j])}
const count=Array(29).fill(0);for(const x of flat.slice(0,N))count[x]++;
for(let i=0;i<=flat.length-N;i++){if(i){count[flat[i-1]]--;count[flat[i+N-1]]++}const v=cumulative(count);for(let j=0;j<29;j++)windowMin[j]=Math.min(windowMin[j],v[j])}
return {name,nativeRunes:flat.length,contiguousWindows:flat.length-N+1,layoutTrials:1000,sampleMin,windowMin};
}
const donors=[donor("Shakespeare",shakespeare),donor("Gibran",gibran)];
const controls=[];
for(const mode of ["XOR","ADD"])for(const driver of ["C","D"])for(const channel of ["C","D"]){
const plain=nativeWords(gibran).flat().slice(0,N),key=Array.from({length:256},()=>{const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand()%(j+1);[a[j],a[k]]=[a[k],a[j]]}return a});
let s=84,prev=0;const cc=[],dd=[];
for(const p of plain){const x=key[s][p],c=channel==="C"?x:mod(prev+x),d=mod(c-prev);cc.push(c);dd.push(d);s=mode==="XOR"?(T[s]^(driver==="C"?c:d)):((T[s]+(driver==="C"?c:d))&255);prev=c}
s=84;const recovered=[];for(let i=0;i<N;i++){const x=channel==="C"?cc[i]:dd[i];recovered.push(key[s].indexOf(x));s=mode==="XOR"?(T[s]^(driver==="C"?cc[i]:dd[i])):((T[s]+(driver==="C"?cc[i]:dd[i]))&255)}
check(equal(plain,recovered),"control inverse");
const cap=capacity(channel==="C"?cc:dd,driver==="C"?cc:dd,mode,84),cnt=Array(29).fill(0);for(const p of plain)cnt[p]++;
const actual=cumulative(cnt);check(actual.every((v,i)=>v<=cap[i]),"capacity theorem");
controls.push({mode,driver,channel,exact:recovered.length,plainTop1:actual[0],capacityTop1:cap[0]});
}
return{N,regimes,donors,controls};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
const input=files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(input[0]),JSON.parse(input[1]),...input.slice(2)),null,2));
