'use strict';
// Agent4: exact contextual escape rank28 lexical constraint attack.
const fs=require('node:fs');const path=require('node:path');
function experiment(corpus,transcript,solved,lexicon){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const mod=(x,n)=>((x%n)+n)%n;
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 assert(words.length===2896&&words.flat().length===12956,"source shape");const actual=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);assert(words.flat().every((v,i)=>v===actual[i]),"source");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const code=p=>String.fromCharCode(...p);
 const gp=s=>{s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;};
 const lex=new Map();const known=new Set();for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p||known.has(code(p)))continue;known.add(code(p));if(!lex.has(p.length))lex.set(p.length,[]);lex.get(p.length).push(p);}
 const ALL=(1<<29)-1, pow=[],logs=Array(29).fill(-1);let a=1;for(let i=0;i<28;i++){pow.push(a);logs[a]=i;a=a*15%29;}assert(new Set(pow).size===28,"root15");
 /** @param {number[]} c @param {number[]} p @param {number} k */
 function constraints(c,p,k){const masks=Array(29).fill(ALL);for(let j=1;j<c.length;j++){const d=mod(c[j]-c[j-1],29),x=p[j-1],y=p[j];let mask;if(!d)mask=1<<y;else{const rank=mod(logs[d]-k,28);if(rank===y)mask=ALL^((1<<(y+1))-1);else if(rank===y-1)mask=(1<<y)-1;else return null;}masks[x]&=mask;if(!masks[x])return null;}return masks;}
 /** @param {number[]} c @param {number} k */
 function candidates(c,k){const out=[];for(const p of lex.get(c.length)||[]){const m=constraints(c,p,k);if(m)out.push({p,m});}return out;}
 function merge(x,y){const z=x.map((v,i)=>v&y[i]);return z.every(Boolean)?z:null;}
 function pop(x){let n=0;while(x){x&=x-1;n++;}return n;}
 // Complete source-word inverse, including first symbol via preceding P,C and f.
 /** @param {number[][]} ws @param {number[]} f @param {number} k @param {boolean} enc */
 function transform(ws,f,k,enc){let prevP=0,prevC=0;return ws.map(w=>w.map(v=>{const e=f[prevP];let p,c;if(enc){p=v;const d=p===e?0:pow[mod(p-(p>e?1:0)+k,28)];c=mod(prevC+d,29);}else{c=v;const d=mod(c-prevC,29);if(!d)p=e;else{const rank=mod(logs[d]-k,28);p=rank+(rank>=e?1:0);}}prevP=p;prevC=c;return enc?c:p;}));}
 const long=words.filter(w=>w.length>=7);
 const byLen={};for(const w of long){const z=byLen[w.length]??={words:0,any:0};z.words++;}
 const matchesPerKey=Array(28).fill(0),maxCandByKey=Array(28).fill(0);let any=0;
 for(const w of long){let found=false;for(let k=0;k<28;k++){const cs=candidates(w,k);if(cs.length){matchesPerKey[k]++;found=true;maxCandByKey[k]=Math.max(maxCandByKey[k],cs.length);}}if(found){any++;byLen[w.length].any++;}}
 // Three disjoint 60-word native-source plants; 40 training, 20 sealed holdout.
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const donorLong=donor.filter(w=>w.length>=5&&known.has(code(w)));
 const plants=[];for(let j=0;j<3;j++){
  const f=Array.from({length:29},(_,i)=>mod([1,3,5][j]*i+[7,13,21][j],29));const k=[7,19,3][j];
  const p=donorLong.slice(j*60,j*60+60);assert(p.length===60,"donor words");const c=transform(p,f,k,true),train=c.slice(0,40);assert(JSON.stringify(transform(c,f,k,false))===JSON.stringify(p),"replay");
  // Exact propagation from each candidate word's per-rune allowed sentinel masks.
  const csByK=Array.from({length:28},(_,kk)=>train.map(w=>candidates(w,kk)));
  const survivors=[],affine=[];for(let kk=0;kk<28;kk++){
    let ds=csByK[kk];if(ds.some(q=>!q.length))continue;
    let domains=Array(29).fill(ALL),change=true;while(change){change=false;for(let i=0;i<ds.length;i++){const q=ds[i].filter(v=>merge(v.m,domains));if(!q.length){ds=[];break;}ds[i]=q;const union=Array(29).fill(0);for(const x of q)for(let z=0;z<29;z++)union[z]|=x.m[z];const nd=merge(domains,union);if(!nd){ds=[];break;}if(nd.some((v,z)=>v!==domains[z]))change=true;domains=nd;}}
    if(ds.length){survivors.push({k:kk,uniqueWords:ds.filter(q=>q.length===1).length,trueWords:ds.filter((q,i)=>q.some(x=>code(x.p)===code(p[i]))).length,domainSizes:domains.map(pop),keyCompatible:f.every((v,i)=>(domains[i]&(1<<v))!==0)});for(let m=0;m<29;m++)for(let b=0;b<29;b++){const ff=Array.from({length:29},(_,i)=>mod(m*i+b,29));if(!ff.every((v,i)=>domains[i]&(1<<v)))continue;const tt=transform(train,ff,kk,false);if(!tt.every(w=>known.has(code(w))))continue;affine.push({m,b,k:kk});}}
  }
  const selected=affine[0];let fullExact=false,holdoutExact=false;if(selected){const ff=Array.from({length:29},(_,i)=>mod(selected.m*i+selected.b,29));const decoded=transform(c,ff,selected.k,false);fullExact=JSON.stringify(decoded)===JSON.stringify(p);holdoutExact=JSON.stringify(decoded.slice(40))===JSON.stringify(p.slice(40));assert(JSON.stringify(transform(decoded,ff,selected.k,true))===JSON.stringify(c),"blind replay");}plants.push({k,words:p.length,runic:p.flat().length,survivors,affine,fullExact,holdoutExact});
 }
 return {lexicon:known.size,original:{long:long.length,any,byLen,matchesPerKey,maxCandByKey},donorLong:donorLong.length,plants};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');const p=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(JSON.parse(read(p[0])),read(p[1]),JSON.parse(read(p[2])),read(p[3])),null,2));
