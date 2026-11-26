"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(inputs){
 const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const corpus=JSON.parse(inputs[0]),rmap=new Map(corpus.runes.map((x,i)=>[x,i])),gp=new Map(corpus.translit.map((x,i)=>[x,i]));
 for(const [a,b] of [["K","C"],["Q","C"],["V","U"],["Z","S"],["ING","NG"],["IO","IA"]])gp.set(a,gp.get(b));
 const encode=(word,contract)=>{let s=word.toUpperCase().replace(/QU/g,"CW"),out=[];while(s.length){let tok=(contract?["ING","TH","NG","EO","OE","AE","IA","EA","IO"]:["TH","NG","EO","OE","AE","IA","EA"]).find(t=>s.startsWith(t))||s[0];out.push(gp.get(tok));s=s.slice(tok.length)}return out};
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[];
 for(const c of inputs[1].split("%").slice(0,55).join("%")){if(rmap.has(c))w.push(rmap.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 check(tape.length===12956&&words.length===2896&&words.flat().every((x,i)=>x===tape[i]),"source alignment");
 const dict=new Map(),add=p=>{if(p.length&&p.length<=14&&p.every(x=>Number.isInteger(x)))dict.set(p.join(","),p)};
 for(const s of inputs.slice(2,7)){for(const t of (s.match(/[a-zA-Z]+/g)||[])){add(encode(t,true));add(encode(t,false))}}
 const native=JSON.parse(inputs[7]).sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>rmap.get(c)))}));
 for(const s of native)for(const p of s.words)add(p);
 const counts=Array(15).fill(0);for(const p of words)counts[p.length]++;
 const d=3;
 function diff(p){let x=p.slice();for(let k=0;k<=d;k++)x=x.slice(1).map((v,i)=>mod(v-x[i]));return x}
 function sig(p){let x=diff(p),a=x.find(v=>v!==0);if(a!==undefined){const v=inv(a);x=x.map(t=>mod(t*v))}return x.join(",")}
 function key(p,mask){return p.length+":"+mask+":"+sig(p.filter((_,j)=>!(mask&(1<<j))))}
 function fmask(p){return p.reduce((m,v,j)=>v===0?m|(1<<j):m,0)}
 const ordinary=new Map(),hold=new Map();for(const p of dict.values()){ordinary.set(key(p,0),p);hold.set(key(p,fmask(p)),p)}
 function match(p){const q=ordinary.get(key(p,0));if(q)return {q,mask:0};const z=fmask(p);for(let m=z;;m=(m-1)&z){const q=hold.get(key(p,m));if(q)return {q,mask:m};if(m===0)break}return null}
 function choose(n,k){let a=1;if(k>n)return 0;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a}
 function recover(p,c,mask){let q=p.filter((_,j)=>!(mask&(1<<j))),t=c.filter((_,j)=>!(mask&(1<<j)));for(let a=1;a<29;a++){let z=t.map((v,j)=>mod(v-a*q[j])),coef=[];for(let j=0;j<=d;j++){coef.push(z[0]||0);z=z.slice(1).map((v,i)=>mod(v-z[i]))}let k=0;let y=p.map((v,j)=>{if(mask&(1<<j))return 0;const z=mod(a*v+coef.reduce((s,x,i)=>s+x*choose(k,i),0));k++;return z});if(y.every((x,j)=>x===c[j]))return {a,coef,mask}}throw Error("no exact local replay")}
 const matches=Array.from({length:tape.length},()=>Array(15).fill(null)),starts=Array.from({length:15},()=>[]);
 for(let i=0;i<tape.length;i++)for(let L=1;L<=14&&i+L<=tape.length;L++){const m=match(tape.slice(i,i+L));if(m){matches[i][L]=m;starts[L].push(i)}}
 check(starts[9].length===82&&starts[10].length===3&&starts[8].length===2735,"prior counts");
 let seed=0x33014326;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function shuffled(x){const y=x.slice();for(let i=y.length-1;i>0;i--){let j=rng()%(i+1);[y[i],y[j]]=[y[j],y[i]]}return y}
 let best=null,attempts=0;
 for(let attempt=0;attempt<128;attempt++){
   attempts++;const occupied=new Uint8Array(tape.length),selected=[],left=counts.slice();
   function take(i,L){if(!left[L]||occupied.subarray(i,i+L).some(x=>x))return false;occupied.fill(1,i,i+L);selected.push({i,L});left[L]--;return true}
   for(let L=14;L>=9;L--)for(const i of attempt===0?starts[L]:shuffled(starts[L]))take(i,L);
   for(const i of shuffled(starts[8])){if(!left[8])break;take(i,8)}
   if(left[8])continue;
   const gaps=[];for(let i=0;i<tape.length;){if(occupied[i]){i++;continue}let j=i+1;while(j<tape.length&&!occupied[j])j++;gaps.push({i,end:j,size:j-i,lengths:[]});i=j}
   let feasible=true;
   // Pack the remaining exact inventory into gaps, longest first, using best fit.
   for(let L=14;L>=1&&feasible;L--)for(let n=0;n<left[L];n++){
      let g=null;for(const x of gaps){if(x.size>=L&&(!g||x.size<g.size))g=x}
      if(!g){feasible=false;break}g.lengths.push(L);g.size-=L
   }
   if(!feasible||gaps.some(g=>g.size))continue;
   for(const g of gaps){let i=g.i;for(const L of shuffled(g.lengths)){selected.push({i,L});i+=L}check(i===g.end,"gap tile")}
   selected.sort((a,b)=>a.i-b.i);
   let oov=selected.filter(x=>!matches[x.i][x.L]).length;
   if(!best||oov<best.oov)best={oov,selected,attempt};
   if(oov<=144)break;
 }
 check(best,"no exact tile found");
 const rows=[],actualCounts=Array(15).fill(0),unmatched=Array(15).fill(0);let pos=0,holdCount=0;
 for(const {i,L} of best.selected){check(i===pos,"tile continuity");actualCounts[L]++;const c=tape.slice(i,i+L),m=matches[i][L];const p=m?m.q:c;
 const k=recover(p,c,m?m.mask:0);if(k.mask)holdCount++;
 if(!m){check(!dict.has(p.join(",")),"OOV identity unexpectedly dictionary");unmatched[L]++}
 rows.push({p,a:k.a,q:k.coef,f:k.mask,oov:!m});pos+=L}
 check(pos===tape.length&&actualCounts.every((x,i)=>x===counts[i]),"inventory");
 let cipher=[];for(const row of rows){let k=0;for(let j=0;j<row.p.length;j++){if(row.f&(1<<j)){check(row.p[j]===0,"F hold");cipher.push(0)}else{cipher.push(mod(row.a*row.p[j]+row.q.reduce((s,x,i)=>s+x*choose(k,i),0)));k++}}}
 check(cipher.every((x,i)=>x===tape[i]),"whole-tape forward replay");
 return {seed:0x33014326,attempts,chosenAttempt:best.attempt,oov:best.oov,withinBudget:best.oov<=144,lexicon:dict.size,counts,unmatched,matchStarts:starts.map(x=>x.length),holdCount,replayed:cipher.length,rows,preview:rows.slice(0,35).map(row=>row.p.map(i=>corpus.translit[i]).join("")).join(" ")};
}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
