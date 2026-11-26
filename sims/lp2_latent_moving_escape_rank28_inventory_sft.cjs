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
 const check=(x,m)=>{if(!x)throw Error(m)},mod=(x,n)=>(x%n+n)%n;
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
 const logs=Array(29).fill(-1),pow=[];for(let i=0,x=1;i<28;i++,x=x*15%29){logs[x]=i;pow.push(x)}check(pow.every((x,i)=>logs[x]===i),"primitive");
 const units=Array.from({length:28},(_,i)=>i).filter(i=>i%2&&i%7);
 const keys=units.flatMap(a=>Array.from({length:28},(_,b)=>({a,b,ranks:logs.map(v=>v<0?-1:mod(a*v+b,28))})));
 // A suffix trie ignores the first plaintext rune, a strict relaxation of the full word relation.
 const nodes=[{child:new Int32Array(29),mask:0,word:null}];
 for(const p of dict.values()){if(p.length<7)continue;let n=0;for(const x of p.slice(1)){let u=nodes[n].child[x];if(!u){u=nodes.length;nodes[n].child[x]=u;nodes[n].mask|=1<<x;nodes.push({child:new Int32Array(29),mask:0,word:null})}n=u}nodes[n].word=p}
 const edges=Array.from({length:tape.length},()=>0),hits=Array(15).fill(0),witness=[];
 const deltas=tape.slice(1).map((v,i)=>mod(v-tape[i],29));
 function scan(ds,start,max,key,found,examples){
   function walk(n,j){
     const node=nodes[n],L=j+1;
     if(node.word&&!(found.value&(1<<L))){found.value|=1<<L;if(examples)examples.push({L,p:node.word,key:{a:key.a,b:key.b}})}
     if(j>=max-1||!node.mask)return;
     const r=key.ranks[ds[start+j]];let mask=r<0?node.mask:node.mask&((1<<r)|(1<<(r+1)));
     while(mask){const bit=mask&-mask,x=31-Math.clz32(bit);mask^=bit;walk(node.child[x],j+1)}
   }walk(0,0)
 }
 const counts=Array(15).fill(0);for(const p of words)counts[p.length]++;
 // Replays use arbitrary position-dependent escapes, not a globally recovered table.
 function replay(c,p,key){let inv=units.find(x=>x*key.a%28===1);let out=[c[0]],escapes=[];
 for(let j=1;j<p.length;j++){const d=mod(c[j]-c[j-1],29),v=p[j];let e,r;if(d===0){e=v;out.push(out[j-1])}else{r=key.ranks[d];check(v===r||v===r+1,"rank mismatch");e=v===r?v+1:v-1;const rank=v-(v>e?1:0);out.push(mod(out[j-1]+pow[mod(inv*(rank-key.b),28)],29))}escapes.push(e)}
 check(out.every((x,j)=>x===c[j]),"replay");return escapes}
 let controls=0,exactTruth=0;
 for(const s of native)for(const [i,p] of s.words.entries()){if(p.length<7||p.length>14)continue;
 const key=keys[(i*37+11)%keys.length],inv=units.find(x=>x*key.a%28===1),c=[mod(i*3+5,29)];
 for(let j=1;j<p.length;j++){let e=mod(i*17+j*11,29),v=p[j];c.push(v===e?c[j-1]:mod(c[j-1]+pow[mod(inv*(v-(v>e?1:0)-key.b),28)],29))}
 const ds=c.slice(1).map((v,j)=>mod(v-c[j],29)),f={value:0},ex=[];scan(ds,0,p.length,key,f,ex);check(f.value&(1<<p.length),"plant coverage");let q=ex.find(x=>x.L===p.length);replay(c,q.p,q.key?{...q.key,ranks:key.ranks}:key);if(q.p.join(",")===p.join(","))exactTruth++;controls++;
 }
 for(let i=0;i+7<=tape.length;i++){const f={value:0},ex=[],max=Math.min(14,tape.length-i);for(const key of keys)scan(deltas,i,max,key,f,ex);edges[i]=f.value;for(let L=7;L<=max;L++)if(f.value&(1<<L))hits[L]++;
 if(ex.length&&witness.length<100)for(const q of ex){if(witness.length>=100)break;const key=keys.find(k=>k.a===q.key.a&&k.b===q.key.b);let c=tape.slice(i,i+q.L);witness.push({start:i,L:q.L,p:q.p,key:q.key,escapes:replay(c,q.p,key)})}}
 const bounds=[];for(let T=7;T<=14;T++){const dp=new Int32Array(tape.length+1);for(let i=tape.length-1;i>=0;i--){dp[i]=dp[i+1];for(let L=T;L<=14&&i+L<=tape.length;L++)if(edges[i]&(1<<L))dp[i]=Math.max(dp[i],1+dp[i+L])}const demand=counts.slice(T).reduce((a,b)=>a+b,0),lengthCap=counts.slice(T).reduce((a,x,j)=>a+Math.min(x,hits[T+j]),0);bounds.push({T,demand,disjointUpper:dp[0],lengthCap,minOOV:demand-Math.min(dp[0],lengthCap)})}
 const printed=Array(15).fill(0);let start=0;for(const p of words){if(edges[start]&(1<<p.length))printed[p.length]++;start+=p.length}
 return {tapeLength:tape.length,words:words.length,lexicon:dict.size,trieNodes:nodes.length,keys:keys.length,counts,hits,printed,bounds,controls,exactTruth,witness};
}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
