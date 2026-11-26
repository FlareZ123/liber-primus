"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,book){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);



 const K=book.key,L=K.length,modK=x=>(x%L+L)%L;
 const dval=(v,c)=>c.dk==="self"?v%c.M:book.wordPrimeValues[v%book.wordPrimeValues.length]%c.M;
  function plant(ws,sgn,stride,seed,cell,need=80,extra=30,maxNodes=5e5,flexible=true){
  const P=ws.flat(),bounds=[0];for(const w of ws)bounds.push(bounds.at(-1)+w.length);
  const word=new Int32Array(P.length);for(let q=0;q<ws.length;q++)word.fill(q,bounds[q],bounds[q+1]);
  const C=new Int16Array(P.length),D=new Int16Array(ws.length);D.fill(-1);D[0]=dval(0,cell);const J=new Int32Array(ws.length),consumed=new Int32Array(P.length),skips=new Uint8Array(P.length);
  J[0]=modK(sgn*D[0]);const modulus=cell.dk==='self'?cell.M:book.wordPrimeValues.length,weights=cell.ch==='prime'?gp.prime:Array.from({length:29},(_,i)=>i),residues=[...new Set(weights.map(x=>x%modulus))],possible=[new Set([0])];for(let m=1;m<=24;m++)possible[m]=new Set([...possible[m-1]].flatMap(a=>residues.map(b=>(a+b)%modulus)));
  let nodes=0,answer=null,halt=false;
  const coin=(i,j)=>((Math.imul(i+1,0x9e3779b1)^Math.imul(j+seed,0x85ebca6b))>>>0)/4294967296;
  function go(i,j,rejects){
   if(halt)return false;
   if(++nodes>maxNodes){halt=true;return false}
   if(i>=need+extra){
    const last=word[consumed[need-1]];
    if(i>=bounds[last+1]&&skips.slice(0,need).some(x=>x>0)){answer={C:Array.from(C.slice(0,i)),P:P.slice(0,i),lens:ws.map(w=>w.length),skips:Array.from(skips.slice(0,i)),consumed:Array.from(consumed.slice(0,i)),D:Array.from(D),lastUsedKeyWord:last,nodes,seed,sgn,stride,need};return true}
   }
   if(i>=P.length||j>=P.length||rejects>10||j-i>36)return false;
   const target=word[j];let q=1;while(q<=target&&D[q]!==-1)q++;if(q<=target){
    let v=0;const a=bounds[q-1],b=bounds[q],end=Math.max(a,Math.min(i,b));
    for(let t=a;t<end;t++)v+=weights[C[t]];
    const rem=b-end,options=rem<=0?[dval(v,cell)]:[...new Set([...possible[rem]].map(z=>dval(z+v,cell)))];
    // fixed seed order, no tuning to any original; choose candidate hypothesis and enforce when actual cipher word closes.
    options.sort((a,b)=>((a*13+seed*7+q)%29)-((b*13+seed*7+q)%29));
    for(const d of options){D[q]=d;J[q]=modK(J[q-1]+sgn*d);if(go(i,j,rejects))return true;D[q]=-1;if(halt)return false;}
    return false;
   }
   q=target;const k=K[modK(j+J[q])],c=mod(P[i]+k),prev=i?C[i-1]:-1;
   if(c===prev&&coin(i,j)<.83){if(go(i,j+stride,rejects+1))return true;if(!flexible||halt)return false;}
   C[i]=c;consumed[i]=j;skips[i]=rejects;
   const oq=word[i];
   if(i+1===bounds[oq+1]&&oq+1<ws.length&&D[oq+1]!==-1){let v=0;for(let t=bounds[oq];t<=i;t++)v+=weights[C[t]];if(dval(v,cell)!==D[oq+1])return false;}
   return go(i+1,j+1,0);
  }
  go(0,0,0);
  if(answer){
   // Verify K' built from actual full ciphertext and lengths. Replay the whole selected prefix including each rejected key proposal.
   const C=answer.C,tail=answer.consumed[need-1]+1,keys=[];let j=0,J=0,prev=dval(0,cell);
   for(const l of answer.lens){J=modK(J+sgn*prev);for(let t=0;t<l;t++)keys.push(K[modK(j+J+t)]);prev=dval(C.slice(j,j+l).reduce((s,x)=>s+weights[x],0),cell);j+=l;if(j>=tail)break;}
   j=0;for(let i=0;i<need;i++){for(let k=0;k<answer.skips[i];k++){if(mod(P[i]+keys[j])!==C[i-1])throw Error("invalid rejected proposal");j+=stride;}if(mod(P[i]+keys[j])!==C[i]||j!==answer.consumed[i])throw Error("sender replay mismatch");j++;}
   answer.realSkips=answer.skips.slice(0,need).reduce((s,x)=>s+x,0);return answer;
  }
  return {failed:true,halt,nodes,seed,sgn,stride,need};
 }

  const total=[...vocab.values()].reduce((a,b)=>a+b+1,0),lf=Math.log(total),pr=Array.from({length:25},()=>new Map()),scores=new Map();
 for(const [w,f] of vocab){let v=Math.log(f+1)-lf;scores.set(w,v);for(let i=0;i<w.length;i++){let p=w.slice(0,i),m=pr[w.length];if(v>(m.get(p)??-Infinity))m.set(p,v);}}
 const ws=w=>scores.get(w)??(-18-3.5*w.length), upper=(w,l)=>Math.max(pr[l].get(w)??-Infinity,-18-3.5*l);
 function solve(C,N,sign,stride,cell,width=500,known=null){
  const cs=[0];for(const c of C)cs.push(cs.at(-1)+(cell.ch==='prime'?gp.prime[c]:c));let knownEnds=[];if(known){let e=0;for(const l of known){e+=l;knownEnds.push(e);}}
  let beam=[{j:0,end:0,J:0,nextJ:modK(sign*dval(0,cell)),queue:[],pref:"",v:0,rank:0,parent:null}],counts=[];
  for(let i=0;i<N;i++){
   let cand=new Map();
   function ensure(s,j,fn){
    if(j-i>16||j>=C.length)return;
    if(j<s.end){fn(s);return;}
    const start=s.end,J=s.nextJ,ends=known?[knownEnds.find(e=>e>start)]:Array.from({length:Math.min(24,C.length-start)},(_,k)=>start+k+1);
    for(const end of ends){if(!end||end>C.length)continue;ensure({...s,end,J,nextJ:modK(J+sign*dval(cs[end]-cs[start],cell)),queue:[...s.queue,end]},j,fn);}
   }
   function emit(s,p,j,pen,skips,origin){
    const end=s.queue[0];if(end<=i)throw Error("queue");
    let pref=s.pref+String.fromCharCode(65+p),v=s.v+pen,queue=s.queue,word=null;
    if(end===i+1){word=pref;v+=ws(pref);pref="";queue=queue.slice(1);}
    const rank=v+(pref?upper(pref,pref.length+end-i-1):0),state={...s,j:j+1,pref,v,queue,rank,parent:origin,p,word,skips};
    const id=[state.j,state.end,state.J,state.nextJ,queue.join(","),pref].join("|");if(rank>(cand.get(id)?.rank??-Infinity))cand.set(id,state);
   }
   function proposals(s,j,p,pen,skips,origin){
    ensure(s,j,t=>{
     const k=K[modK(j+t.J)],x=mod(C[i]-k),prev=i?C[i-1]:-1;
     if(p===null||p===x)emit(t,x,j,pen+(C[i]===prev?Math.log(.17):0),skips,origin);
     if(i&&skips<5){const q=mod(prev-k);if(p===null||p===q)proposals(t,j+stride,q,pen+Math.log(.83),skips+1,origin);}
    });
   }
   for(const s of beam)proposals(s,s.j,null,0,0,s);
   counts.push(cand.size);beam=[...cand.values()].sort((a,b)=>b.rank-a.rank).slice(0,width);
   if(!beam.length)throw Error("empty beam "+i);
  }
  const terminal=beam[0],future=terminal.queue;let a=terminal,score=a.rank,words=[],P=[],skips=[],bounds=[],n=N,tail=a.pref;
  while(a.parent){P.push(a.p);skips.push(a.skips);if(a.word){words.push(a.word);bounds.push(n);}a=a.parent;n--;}
  P.reverse();skips.reverse();words.reverse();bounds.reverse();
  let J=modK(sign*dval(0,cell)),start=0,kt=[];for(const end of [...bounds,...future]){for(let j=start;j<end;j++)kt.push(K[modK(j+J)]);J=modK(J+sign*dval(cs[end]-cs[start],cell));start=end;}let j=0;for(let i=0;i<N;i++){for(let s=0;s<skips[i];s++){if(mod(P[i]+kt[j])!==C[i-1])throw Error("reject replay");j+=stride;}if(mod(P[i]+kt[j])!==C[i])throw Error("emit replay");j++;}if(j!==terminal.j)throw Error("cursor replay");
  return {P,skips,bounds,future,replay:true,score:score/N,plaintext:[...words,tail].filter(Boolean).map(w=>[...w].map(c=>gp.translit[c.charCodeAt(0)-65]).join("")).join(" "),counts};
 }

 const results=[];
 for(const ch of ["prime","index"])for(const M of [29,28])for(const dk of ["self","cb"]){
 if(ch==="prime"&&M===29&&dk==="self")continue;
 const cell={ch,M,dk},attempts=[],controls=[],originals=[],choices=[];
 for(const stride of [1,2]){
 for(let donor=0;donor<3;donor++){const ws=donors[donor].slice(Math.floor(donors[donor].length*.91),Math.floor(donors[donor].length*.91)+100),sgn=donor===1?-1:1,seed=6301+donor*409+stride*173;
 const p=plant(ws,sgn,stride,seed,cell);attempts.push({donor,...p});
 if(!p.failed&&p.realSkips>0){let e=0,ends=p.lens.map(l=>e+=l).filter(x=>x<=p.need),a=solve(p.C,p.need,p.sgn,p.stride,cell),correct=a.P.filter((x,i)=>x===p.P[i]).length,F1=2*a.bounds.filter(b=>ends.includes(b)).length/(ends.length+a.bounds.length);
 controls.push({donor,sgn,stride,correct,n:p.need,F1,skipCorrect:a.skips.every((s,i)=>s===p.skips[i]),...a});break;}
 }
 }
 if(controls.length===2&&controls.every(c=>c.correct/c.n>=.95&&c.F1>=.90)){
 for(const sign of [-1,1])for(const stride of [1,2])choices.push({sign,stride,...solve(gp.pages[0].indices,80,sign,stride,cell)});
 choices.sort((a,b)=>b.score-a.score);const {sign,stride}=choices[0];
 for(let page=1;page<=5;page++)originals.push({page,sign,stride,...solve(gp.pages[page].indices,80,sign,stride,cell)});
 }
 results.push({cell,attempts,controls,choices,originals});
 }
 return {results,beam:500,drift:16,maxSkipsPerRune:5};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"))),null,2));
