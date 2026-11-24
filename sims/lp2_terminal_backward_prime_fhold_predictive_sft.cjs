'use strict';
const fs=require('node:fs');
const path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(corpus, donor){
  const mod=x=>(x%29+29)%29, max=3301;
  const primes=[];
  for(let n=2;primes.length<max+1000;n++){if(primes.every(p=>p*p>n||n%p!==0))primes.push(n)}
  const shifts=primes.map(p=>mod(p-1));
  const seq=donor.sections.map(s=>Array.from(s.source_text).map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0));
  // Target-excluded reverse language model, with two start sentinels.
  const targets=[1,3,4,5], counts=new Float64Array(30*30*29).fill(0.2), totals=new Float64Array(30*30).fill(29*.2);
  for(let j=0;j<seq.length;j++)if(!targets.includes(j)){
    let a=29,b=29;
    for(const p of seq[j].slice().reverse()){counts[(a*30+b)*29+p]++;totals[a*30+b]++;a=b;b=p}
  }
  const log=counts.map((c,i)=>Math.log(c/totals[Math.floor(i/29)]));
  function encrypt(p,o){let k=o;return p.map(x=>x===0?0:mod(x+shifts[k++]))}
  function same(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
  function path(s){const p=[];while(s.prev){p.push(s.p);s=s.prev}return p.reverse()}
  function advance(c,o,states){for(const x of c){const next=new Map();
      const put=(s,p,k)=>{const v=s.v+log[(s.a*30+s.b)*29+p],a=s.b,b=p,key=(k*30+a)*30+b,old=next.get(key);
        if(!old||v>old.v)next.set(key,{v,a,b,k,p,prev:s})};
      for(const s of states.values()){if(x===0)put(s,0,s.k);const p=mod(x-shifts[o+s.k]);if(p!==0)put(s,p,s.k+1)}
      states=next;if(!states.size)break;
    }return states}
  function initial(){return new Map([[0,{v:0,a:29,b:29,k:0,prev:null}]])}
  function best(states){let out=null;for(const s of states.values())if(!out||s.v>out.v)out=s;return out}
  function reachable(c,o,k=0){let q=new Set([k]);for(const x of c){const r=new Set();for(const t of q){if(x===0)r.add(t);if(mod(x-shifts[o+t])!==0)r.add(t+1)}q=r;if(!q.size)return false}return true}
  function attack(cipher,cut){
    const pre=cipher.slice(0,cut),post=cipher.slice(cut),ranking=[];
    let fullLegal=0;
    for(let o=0;o<=max;o++){const st=best(advance(pre,o,initial()));if(st)ranking.push({o,st});if(reachable(cipher,o))fullLegal++}
    ranking.sort((a,b)=>b.st.v-a.st.v||a.o-b.o);
    const top=ranking[0];if(!top)return {prefixLegal:0,fullLegal};
    const tail=best(advance(post,top.o,new Map([[0,top.st]])));
    const result={prefixLegal:ranking.length,fullLegal,origin:top.o,prefixScore:top.st.v/cut,runnerUp:ranking[1]?{origin:ranking[1].o,score:ranking[1].st.v/cut}:null,prefix:path(top.st),frozenContinuation:!!tail};
    if(tail){const p=path(tail);result.suffixScore=(tail.v-top.st.v)/post.length;result.decoded=p;result.exactReplay=same(encrypt(p,top.o),cipher)}
    return result;
  }
  const p56=seq[7], authentic=same(encrypt(p56,0),corpus.pages[56].indices);
  if(!authentic)throw Error("p56 control failed");
  const controls=targets.map((j,i)=>{const o=[0,331,1330,3299][i],p=seq[j].slice(-308).reverse(),c=encrypt(p,o),r=attack(c,76);return {name:donor.sections[j].name,trueOrigin:o,recoveredOrigin:r.origin,fullLegal:r.fullLegal,prefixLegal:r.prefixLegal,prefixCorrect:r.prefix.filter((x,i)=>x===p[i]).length,holdoutCorrect:r.decoded?r.decoded.slice(76).filter((x,i)=>x===p[i+76]).length:0,holdoutLength:p.length-76,prefixScore:r.prefixScore,suffixScore:r.suffixScore,exactReplay:r.exactReplay}});
  const c=corpus.pages[54].indices.concat(corpus.pages[55].indices).reverse();
  const zero=best(advance(c,0,initial()));
  const r=attack(c,76);
  return {authentic,controls,original:{...r,sourceOrigin0FullLegal:!!zero,sourceOrigin0PrefixLegal:reachable(c.slice(0,76),0),decodedNaturalOrder:r.decoded?.slice().reverse().map(x=>corpus.translit[x]).join(" "),prefixNaturalOrder:r.prefix?.slice().reverse().map(x=>corpus.translit[x]).join(" ")}};
}
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
