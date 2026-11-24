"use strict";
// Agent1: exact spacing-free cumulative GP-prime feedback and native-language path ranking.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/blake_song_of_liberty_train.txt"];
const input=files.map(f=>fs.readFileSync(path.join(root,f),"utf8"));
function experiment(j,gibran,shakespeare,blake){
  const mod=x=>(x%29+29)%29, all=(1<<29)-1, primes=j.prime;
  const check=(x,m)=>{if(!x)throw Error(m)};
  const map=new Map(j.translit.map((s,i)=>[s,i]));map.set("ING",21);
  function gp(t){let result=[];for(let word of t.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");let p=[],i=0;while(i<word.length){let found=false;for(let n of [3,2,1]){if(i+n<=word.length&&map.has(word.slice(i,i+n))){p.push(map.get(word.slice(i,i+n)));i+=n;found=true;break}}if(!found)break}if(i===word.length)result.push(...p)}return result}
  const train=gp(gibran.slice(10000,40000));train.push(...j.pages[57].indices);
  const rows=Array.from({length:30},()=>Array(29).fill(0.5));
  for(let i=0;i<train.length;i++)rows[i?train[i-1]:29][train[i]]++;
  const log=rows.map(r=>{let total=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/total))});
  function parameters(k){let [u,a,b]=k,inv=1;while(u*inv%29!==1)inv++;return {u,pp:Array.from({length:29},(_,d)=>mod(d*inv)),step:primes.map(p=>mod(a*(p-1)+b))}}
  function encode(p,k,seed){let {u,step}=parameters(k),s=seed;return p.map(x=>{if(!x)return 0;let c=mod(u*x+s);s=mod(s+step[x]);return c})}
  function search(c){let survivors=[],max=0,witness=null;
    for(let u=1;u<29;u++)for(let a=1;a<29;a++)for(let b=0;b<29;b++){let {pp,step}=parameters([u,a,b]);let mask=all,i=0;for(;i<c.length;i++){let x=c[i],next=x===0?mask:0;for(let m=mask;m;m&=m-1){let s=31-Math.clz32(m&-m),p=pp[mod(x-s)];if(p)next|=1<<mod(s+step[p])}mask=next;if(!mask)break}if(i>max){max=i;witness=[u,a,b]}if(mask)survivors.push([u,a,b])}
    return {max,witness,survivors};
  }
  function decode(c,k,initial=null){let {pp,step}=parameters(k);let states=new Map();for(let s=0;s<29;s++){if(initial&&s!==initial.s)continue;let prev=initial?initial.prev:29;states.set(s*30+prev,{s,prev,score:0,seed:s,link:null})}
    for(let x of c){let next=new Map();for(let n of states.values()){function emit(p,s){let score=n.score+log[n.prev][p],key=s*30+p,old=next.get(key);if(!old||score>old.score)next.set(key,{s,prev:p,score,seed:n.seed,link:n})}if(x===0)emit(0,n.s);let p=pp[mod(x-n.s)];if(p)emit(p,mod(n.s+step[p]));}states=next;if(!states.size)return null}
    let n=[...states.values()].reduce((a,b)=>a.score>=b.score?a:b);const best=n,p=[];while(n.link){p.push(n.prev);n=n.link}p.reverse();check(encode(p,k,best.seed).every((x,i)=>x===c[i]),"replay failed");return {key:k,seed:best.seed,s:best.s,prev:best.prev,score:best.score,mean:best.score/c.length,p,text:p.map(x=>j.translit[x]).join("")};
  }
  function summarize(r){return {max:r.max,witness:r.witness,count:r.survivors.length}}
  const controls=[];
  for(const [name,p,k,seed] of [["Shakespeare",gp(shakespeare.slice(18000,60000)).slice(0,1000),[16,1,0],12],["Blake",gp(blake).slice(0,1000),[7,23,17],26],["native p57",j.pages[57].indices,[5,10,22],11]]){
    const c=encode(p,k,seed),s=search(c);check(s.survivors.some(x=>x.every((v,i)=>v===k[i])),"planted key rejected");
    const best=s.survivors.map(x=>decode(c,x)).sort((a,b)=>b.score-a.score)[0];
    controls.push({name,n:p.length,planted:k,seed,survivors:s.survivors.length,top:best.key,topSeed:best.seed,exact:best.p.reduce((n,x,i)=>n+Number(x===p[i]),0),mean:best.mean});
  }
  let start=0;const chapters=[];for(const end of [2,7,14,22,26,32,39,53,55]){let c=j.pages.slice(start,end+1).flatMap(p=>p.indices),r=search(c);chapters.push({start,end,n:c.length,...summarize(r)});start=end+1}
  // Shared coefficients, arbitrary independent incoming state on each physical page.
  let shared=search(j.pages[0].indices).survivors;
  const sharedReset=[[0,shared.length]];
  for(let i=1;i<=2;i++){
    const page=j.pages[i].indices;
    shared=shared.filter(k=>{
      const {pp,step}=parameters(k);let mask=all;
      for(const x of page){
        let next=x===0?mask:0;
        for(let m=mask;m;m&=m-1){const s=31-Math.clz32(m&-m),p=pp[mod(x-s)];if(p)next|=1<<mod(s+step[p]);}
        mask=next;if(!mask)return false;
      }return true;
    });
    sharedReset.push([i,shared.length]);
  }
  check(JSON.stringify(sharedReset)===JSON.stringify([[0,839],[1,33],[2,0]]),"page reset gate");
  const prefix=j.pages[54].indices,suffix=j.pages[55].indices,full=[...prefix,...suffix];let s=search(prefix);const ranked=s.survivors.map(k=>decode(prefix,k)).sort((a,b)=>b.score-a.score);let winner=ranked[0],continuation=decode(suffix,winner.key,winner);
  const fullSearch=search(full),fullRank=fullSearch.survivors.map(k=>decode(full,k)).sort((a,b)=>b.score-a.score);
  const result={controls,chapters,sharedReset,final:{prefixN:prefix.length,suffixN:suffix.length,prefixCandidates:ranked.length,prefixWinner:winner,lockedContinuation:continuation,fullCandidates:fullRank}};
  check(chapters.slice(0,8).every(x=>x.count===0),"unexpected chapter survivor");check(fullRank.length===24,"unexpected final chapter count");return result;
}
console.log(JSON.stringify(experiment(JSON.parse(input[0]),...input.slice(1)),null,2));
