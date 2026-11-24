'use strict';
/** Agent 7: hidden independent line-start phase; literal-F holds. Read-only CJS. */
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,transcript,reference){
  const M=29, mod=x=>(x%M+M)%M, sum=a=>a.reduce((s,x)=>s+x,0);
  function check(x,msg){if(!x)throw Error(msg)}
  let seed=0x7a13f001;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}
  const ri=n=>Math.floor(rnd()*n);
  const rm=new Map(corpus.runes.map((x,i)=>[x,i])), lines=transcript.split(/\r?\n/).map(x=>[...x].filter(c=>rm.has(c)).map(c=>rm.get(c))).filter(x=>x.length);
  const pages=[];let li=0;
  for(const p of corpus.pages.filter(p=>p.page<56&&p.indices.length)){
    const ls=[];let n=0;while(n<p.indices.length){const l=lines[li++];n+=l.length;ls.push(l)}
    check(n===p.indices.length&&ls.flat().every((x,i)=>x===p.indices[i]),"source mismatch");
    pages.push({page:p.page,lines:ls});
  }
  check(li===594&&pages.flatMap(p=>p.lines.flat()).length===12956,"source size");
  const tok=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function encode(s){
    const out=[];for(let w of s.split(/\r?\n/).filter(l=>!l.startsWith("#")&&!l.startsWith("[")).join("\n").toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replaceAll("ING","NG").replaceAll("V","U").replaceAll("K","C").replaceAll("Q","C").replaceAll("Z","S");
      const a=[];for(let k=0;k<w.length;){const t=tok.find(t=>w.startsWith(t.t,k));if(!t){a.length=0;break}a.push(t.i);k+=t.t.length}out.push(...a);
    }return out;
  }
  const cut=reference.indexOf("### 10"),end=reference.indexOf("### 56");check(cut>0&&end>cut,"missing ref split");
  const ref=encode(reference.slice(0,cut)), native=encode(reference.slice(cut,end));
  const u=Array(M).fill(.5), b=Array.from({length:M},()=>Array(M).fill(.25));
  for(const x of ref)u[x]++;
  for(let j=1;j<ref.length;j++)b[ref[j-1]][ref[j]]++;
  const U=u.map(x=>x/sum(u)), B=b.map(row=>row.map(x=>x/sum(row))), logU=U.map(Math.log), logB=B.map(row=>row.map(Math.log));
  const pa=p=>p.page<40&&p.page%2===0,pb=p=>p.page<40&&p.page%2===1,ph=p=>p.page>=40;
  const select=(ps,f)=>ps.filter(f).flatMap(p=>p.lines);
  function plant(q,kind,key){
    const out=pages.map(p=>{
      const truth=p.lines.map(l=>{
        if(kind==="native"){let at=ri(native.length-l.length);return native.slice(at,at+l.length)}
        function draw(probs){let x=rnd();for(let j=0;j<M;j++){x-=probs[j];if(x<0)return j}return M-1}
        const x=[draw(U)];while(x.length<l.length)x.push(draw(B[x.at(-1)]));return x;
      });
      const phases=truth.map(()=>ri(q));
      const ls=truth.map((l,i)=>{let f=phases[i];return l.map(x=>{if(x===0)return 0;const c=mod(x+key[f]);f=(f+1)%q;return c})});
      return {page:p.page,lines:ls,truth,phases};
    });return out;
  }
  function emission(noise){
    return Array.from({length:M},(_,k)=>Float64Array.from({length:M},(_,c)=>(1-noise)*(mod(c-k)===0?0:U[mod(c-k)])+noise*(1-U[0])/M));
  }
  function evalKey(ls,key,noise,counts){
    const q=key.length, E=emission(noise), nmax=27;
    const al=new Float64Array(nmax*q), sc=new Float64Array(nmax), back=new Float64Array(q), prev=new Float64Array(q);
    let score=0,n=0,dead=0;
    for(const l of ls){
      al.fill(0);for(let p=0;p<q;p++)al[p]=1/q;
      let legal=true;
      for(let t=0;t<l.length;t++){
        const c=l[t],a=t*q,z=(t+1)*q,hold=c===0?U[0]:0;let total=0;
        for(let p=0;p<q;p++){
          const prior=(p+q-1)%q;
          const v=al[a+prior]*E[key[prior]][c]+al[a+p]*hold;
          al[z+p]=v;total+=v;
        }
        if(total<=0){legal=false;break}
        sc[t]=total;score+=Math.log(total);
        for(let p=0;p<q;p++)al[z+p]/=total;
      }
      n+=l.length;
      if(!legal){dead++;continue}
      if(!counts)continue;
      back.fill(1);
      for(let t=l.length-1;t>=0;t--){
        const c=l[t],a=t*q,hold=c===0?U[0]:0;
        for(let p=0;p<q;p++){
          const v=E[key[p]][c]*back[(p+1)%q]/sc[t];
          counts[p][c]+=al[a+p]*v;
          prev[p]=v+hold*back[p]/sc[t];
        }
        back.set(prev);
      }
    }
    return {score:dead?-Infinity:score/n,dead,n};
  }
  function canonical(k){
    const variants=k.map((_,p)=>k.slice(p).concat(k.slice(0,p)));
    variants.sort((a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0});
    return variants[0];
  }
  function fit(ls,q,restarts){
    let best=null;const finalNoise=.005, stageNoise=[.15,.04,finalNoise];
    for(let start=0;start<restarts;start++){
      let key=Array.from({length:q},()=>ri(M));
      for(const noise of stageNoise){
        const logE=emission(noise).map(row=>Array.from(row,Math.log));
        for(let t=0;t<22;t++){
          const counts=Array.from({length:q},()=>new Float64Array(M));
          evalKey(ls,key,noise,counts);
          const next=counts.map(row=>{
            let best=-Infinity,at=0;
            for(let k=0;k<M;k++){let s=0;for(let c=0;c<M;c++)s+=row[c]*logE[k][c];if(s>best){best=s;at=k}}
            return at;
          });
          if(next.every((x,i)=>x===key[i]))break;
          key=next;
        }
      }
      key=canonical(key);const v=evalKey(ls,key,finalNoise);
      if(!best||v.score>best.score)best={key,score:v.score};
    }
    return best;
  }
  function rotationMatches(a,b){
    return Math.max(...a.map((_,s)=>a.filter((v,i)=>v===b[(i+s)%a.length]).length));
  }
  // Exact bigram Viterbi with any start phase, retaining the best path for each
  // (phase,previous plaintext). On prefix only choose its best final state;
  // all suffix paths then start from this frozen state.
  function decodePart(l,key,initial){
    const q=key.length,S=q*M, NONE=M;
    let states=new Map();
    if(initial)states.set(initial.phase*M+initial.last,{score:0,seq:[],phase:initial.phase,last:initial.last});
    else for(let p=0;p<q;p++)states.set(p*M+NONE+S,{score:-Math.log(q),seq:[],phase:p,last:NONE});
    for(const c of l){
      const next=new Map();
      function add(st,p,np){const s=st.score+(st.last===NONE?logU[p]:logB[st.last][p]);const id=np*M+p;const old=next.get(id);if(!old||s>old.score)next.set(id,{score:s,seq:st.seq.concat(p),phase:np,last:p})}
      for(const st of states.values()){
        if(c===0)add(st,0,st.phase);
        const p=mod(c-key[st.phase]);if(p!==0)add(st,p,(st.phase+1)%q);
      }
      if(!next.size)return null;
      states=next;
    }
    return [...states.values()].sort((a,b)=>b.score-a.score)[0];
  }
  function frozenSuffix(ls,key,truth){
    let n=0,correct=0,score=0,dead=0,used=0,complete=[];
    for(let i=0;i<ls.length;i++){
      const l=ls[i];if(l.length<8)continue;
      const h=Math.floor(l.length/2),p=decodePart(l.slice(0,h),key,null);used++;
      if(!p){dead++;continue}
      const s=decodePart(l.slice(h),key,p);
      if(!s){dead++;continue}
      n+=s.seq.length;score+=s.score;
      if(truth)for(let j=0;j<s.seq.length;j++)if(s.seq[j]===truth[i][h+j])correct++;
      if(complete.length<4)complete.push(p.seq.concat(s.seq).map(v=>corpus.translit[v]).join("-"));
    }
    return {used,dead,n,score:n?score/n:null,accuracy:truth&&n?correct/n:null,sample:complete};
  }
  function control(q,kind,restarts){
    const key=Array.from({length:q},()=>ri(M)),ps=plant(q,kind,key);
    const a=fit(select(ps,pa),q,restarts),bb=fit(select(ps,pb),q,restarts),ab=fit(select(ps,p=>p.page<40),q,restarts);
    const h=select(ps,ph),truth=ps.filter(ph).flatMap(p=>p.truth);
    return {key,a,b:bb,ab,matches:[a,bb,ab].map(z=>rotationMatches(z.key,key)),agreement:rotationMatches(a.key,bb.key),heldout:[a,bb,ab].map(z=>evalKey(h,z.key,.005)),suffix:[a,bb,ab].map(z=>frozenSuffix(h,z.key,truth)),trueSuffix:frozenSuffix(h,key,truth)};
  }
  const out={referenceRunes:ref.length,nativeRunes:native.length,controls:{},original:{}};
  for(const q of [8,13]){
    const c=control(q,"native",16);
    out.controls[q]=c;
    if(c.matches.every(x=>x===q)){
      const a=fit(select(pages,pa),q,24),bb=fit(select(pages,pb),q,24),ab=fit(select(pages,p=>p.page<40),q,24),h=select(pages,ph);
      const wrong=Array.from({length:100},()=>evalKey(h,Array.from({length:q},()=>ri(M)),.005).score).sort((a,b)=>a-b);
      out.original[q]={a,b:bb,ab,agreement:rotationMatches(a.key,bb.key),heldout:[a,bb,ab].map(z=>evalKey(h,z.key,.005)),suffix:[a,bb,ab].map(z=>frozenSuffix(h,z.key,null)),wrong:{min:wrong[0],median:wrong[50],max:wrong[99]}};
    }else out.original[q]={status:"not evaluated: control did not recover each key"};
  }
  return out;
}
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2));
