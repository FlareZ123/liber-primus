'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
function experiment(corpus, native, literary) {
  const m=x=>(x%29+29)%29, inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,x)=>x).find(x=>m(a*x)===1)||0);
  const refs=native.sections.map(s=>Array.from(s.source_text,c=>native.runes.indexOf(c)).filter(x=>x>=0));
  const counts=Array(29).fill(0.5); for(const r of refs) for(const x of r) counts[x]++;
  const total=counts.reduce((a,b)=>a+b), prob=counts.map(n=>n/total), log=prob.map(Math.log);
  const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
  const train=pages.filter(p=>p.page<40).flatMap(p=>p.indices);
  const test=pages.filter(p=>p.page>=40&&p.page<54).flatMap(p=>p.indices);
  const symbols=corpus.translit, wordTokens=symbols.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  function encodeText(t) {
    const words=t.toUpperCase().match(/[A-Z]+/g)||[], p=[];
    for(let w of words){w=w.replaceAll("QU","CW").replaceAll("ING","NG").replaceAll("K","C").replaceAll("Q","C").replaceAll("V","U").replaceAll("Z","S").replaceAll("IO","IA");while(w.length){const hit=wordTokens.find(([s])=>w.startsWith(s));if(!hit)throw Error(w);p.push(hit[1]);w=w.slice(hit[0].length)}}
    return p;
  }
  function rows(c) {
    const n=Array.from({length:29},()=>[Array(29).fill(0),Array(29).fill(0)]);
    for(let i=2;i<c.length;i++) n[m(c[i-1]-c[i-2])][c[i]===0?1:0][m(c[i]-c[i-1])]++;
    return n;
  }
  function fit(c,hold) {
    const hist=rows(c); let sum=0;const key=[], ties=[], feasible=[];
    for(let j=0;j<29;j++){
      let best=-Infinity, pair=null, num=0, ntie=0;
      for(let a=1;a<29;a++)for(let b=0;b<29;b++){
        let score=0;for(let d=0;d<29;d++){
          const p=m((d-b)*inv[a]), n=hist[j][0][d], z=hist[j][1][d];
          if(hold&&n&&p===0){score=-Infinity;break}
          if(n) score+=n*log[p];
          if(z) score+=z*(hold?Math.log(prob[0]+(p===0?0:prob[p])):log[p]);
        }
        if(!Number.isFinite(score))continue;num++;
        if(score>best+1e-9){best=score;pair=[a,b];ntie=1}else if(Math.abs(score-best)<=1e-9)ntie++;
      }
      key.push(pair);ties.push(ntie);feasible.push(num);sum+=best;
    }
    return {key,ties,feasible,trainScore:Number.isFinite(sum)?sum:null};
  }
  function decode(c,key,hold,start=2,end=c.length) {
    let score=0, out=[],invalid=0,exact=0;
    for(let i=start;i<end;i++){
      const j=m(c[i-1]-c[i-2]),d=m(c[i]-c[i-1]),row=key[j];if(!row){invalid++;out.push(-1);continue}
      const [a,b]=row,p=m((d-b)*inv[a]);let q=p;
      if(hold&&c[i]===0){score+=Math.log(prob[0]+(p===0?0:prob[p]));if(prob[0]>=prob[p])q=0}
      else if(hold&&p===0){invalid++;out.push(-1);continue}
      else score+=log[p];
      out.push(q);const re=hold&&q===0?0:m(c[i-1]+a*q+b);if(re===c[i])exact++;
    }
    return {score:invalid?null:score,invalid,exact,out};
  }
  function nullscore(c,prior,start,end) {
    const n=Array(29).fill(0.5);for(let i=2;i<prior.length;i++)n[m(prior[i]-prior[i-1])]++;
    const tot=n.reduce((a,b)=>a+b);let z=0;for(let i=start;i<end;i++)z+=Math.log(n[m(c[i]-c[i-1])]/tot);return z;
  }
  function summary(c,k,hold,start,end,prior,truth) {
    const dec=decode(c,k,hold,start,end), n=end-start;
    return {n,invalid:dec.invalid,replay:dec.exact,correct:truth?dec.out.filter((x,i)=>x===truth[start+i-2]).length:null,gain:dec.score===null?null:(dec.score-nullscore(c,prior,start,end))/n,preview:dec.out.slice(0,100).map(x=>symbols[x]??"?").join(" ")};
  }
  function gen(p,key,hold){const c=[7,19];for(const x of p){const j=m(c.at(-1)-c.at(-2)),[a,b]=key[j];c.push(hold&&x===0?0:m(c.at(-1)+a*x+b))}return c}
  function keygen(seed){let s=seed>>>0;const next=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s};return Array.from({length:29},()=>{let a=1+next()%28;return [a,m(-a*28)]})}
  const src=encodeText(literary.split("*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***").at(-1));
  const full=train.concat(test), result={train:train.length,test:test.length,controls:[],original:[]};
  for(const hold of [false,true]){
    const p=src.slice(2000,2000+full.length-2),trueKey=keygen(hold?0x3301:0x7135),c=gen(p,trueKey,hold),f=fit(c.slice(0,train.length),hold);
    result.controls.push({hold,keyRows:f.key.filter((r,j)=>r&&r.every((x,k)=>x===trueKey[j][k])).length,fit:f.trainScore,heldout:summary(c,f.key,hold,train.length,c.length,c.slice(0,train.length),p),ties:f.ties});
    const o=fit(train,hold);
    result.original.push({hold,fit:o.trainScore,feasible:o.feasible,ties:o.ties,key:o.key,training:summary(full,o.key,hold,2,train.length,train),heldout:summary(full,o.key,hold,train.length,full.length,train)});
  }
  return result;
}
const r=experiment(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json",'utf8')),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json",'utf8')),fs.readFileSync("resources/control/gibran_prophet_58585.txt",'utf8'));
assert.equal(r.train,9640);assert.equal(r.test,3008);console.log(JSON.stringify(r,null,2));
