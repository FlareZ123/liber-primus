'use strict';
// Source-selected previous-plaintext-word pointer feedback. Exact all-seed DP.
const fs=require('node:fs');
const path=require('node:path');
function research(transcription,corpus,grid,native){
  /** @param {boolean} ok @param {string} msg */
  function check(ok,msg){if(!ok)throw Error(msg)}
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b), mod=x=>(x%29+29)%29;
  const idx=new Map(corpus.runes.map((x,i)=>[x,i]));
  /** @param {string} text @param {boolean} solved */
  function parse(text,solved=false){let out=[],w=[];for(const ch of text){if(idx.has(ch))w.push(idx.get(ch));else if((solved||"-.'".includes(ch))&&w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
  const pages=transcription.split("%"),ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const chapters=ranges.map(([a,b])=>{const w=parse(pages.slice(a-(a>=51?1:0),b+1-(b>=50?1:0)).join(""));check(eq(w.flat(),corpus.pages.slice(a,b+1).flatMap(p=>p.indices)),"original chapter mismatch");return w});
  check(chapters.flat().length===2896&&chapters.flat(2).length===12956,"original counts");
  const maps=[59,60].map(radix=>{const a=radix===59?grid.alphabet.replace("f",""):grid.alphabet;return grid.pages.flatMap(p=>p.tokens.map(t=>radix*a.indexOf(t[0])+a.indexOf(t[1])))});
  check(eq(maps[1],grid.bytes)&&maps.every(m=>m.length===256&&m.every(x=>x>=0&&x<256)),"maps");
  const nativeWords=native.sections.map(x=>parse(x.source_text,true));
  const train=nativeWords.filter((_,i)=>i!==0&&i!==3&&i!==7&&i!==8).flat();
  const B=29,E=30,N=31,counts=new Float64Array(N**3),totals=new Float64Array(N*N);
  for(const word of train){let a=B,b=B;for(const c of [...word,E]){counts[(a*N+b)*N+c]++;totals[a*N+b]++;a=b;b=c}}
  /** @param {number[]} w */
  function score(w){let a=B,b=B,s=0;for(const c of [...w,E]){s+=Math.log((counts[(a*N+b)*N+c]+0.2)/(totals[a*N+b]+0.2*N));a=b;b=c}return s}
  const sum=(w,weight)=>w.reduce((v,x)=>v+(weight==="GP0"?x:corpus.prime[x]),0)%256;
  /** @param {number[][]} words @param {number} seed @param {number[]} map @param {string} weight @param {number} sign @param {boolean} hold */
  function enc(words,seed,map,weight,sign,hold){let s=seed;return words.map(w=>{let cur=s;const c=w.map(p=>{if(hold&&p===0)return 0;const c=mod(p+sign*(cur%29));cur=map[cur];return c});s=sum(w,weight);return c})}
  /** Exact inversion of a single printed word given the previous-plaintext sum. */
  function edges(c,s,map,weight,sign,hold){let out=[],w=[];function walk(i,cur){if(i===c.length){out.push({w:w.slice(),next:sum(w,weight),score:score(w)});return}if(hold&&c[i]===0){w.push(0);walk(i+1,cur);w.pop()}const p=mod(c[i]-sign*(cur%29));if(!hold||p!==0){w.push(p);walk(i+1,map[cur]);w.pop()}}walk(0,s);return out}
  /** Viterbi over exact next-word states; keep all reachable states independently of score. */
  function solve(words,seeds,map,weight,sign,hold){let active=new Map(seeds.map(s=>[s,{score:0,seed:s,path:null}]));let minStates=active.size,collapse=null;for(let i=0;i<words.length;i++){let next=new Map();for(const [s,entry] of active){for(const edge of edges(words[i],s,map,weight,sign,hold)){const sc=entry.score+edge.score,old=next.get(edge.next);if(!old||sc>old.score)next.set(edge.next,{score:sc,seed:entry.seed,path:{w:edge.w,prev:entry.path}})}}active=next;minStates=Math.min(minStates,active.size);if(!active.size)return {dead:i,minStates,collapse};if(active.size===1&&collapse===null)collapse=i+1}
    const [end,best]=[...active].reduce((a,b)=>b[1].score>a[1].score?b:a);const plain=[];for(let p=best.path;p;p=p.prev)plain.push(p.w);plain.reverse();return {end,seed:best.seed,score:best.score,plain,states:active.size,minStates,collapse}}
  const all=Array.from({length:256},(_,i)=>i), controlIndices=[0,3,8], out=[];
  const rate=(w)=>w.flat().length;
  const hits=(a,b)=>a.flat().reduce((n,x,i)=>n+(x===b.flat()[i]),0);
  for(const [mi,map] of maps.entries())for(const weight of ["GP0","prime"])for(const sign of [1,-1])for(const hold of [false,true]){
    let controls=[],original=[];
    for(const ci of controlIndices){
      const p=nativeWords[ci],cut=Math.floor(p.length*2/3),seed=(71+37*ci)%256,c=enc(p,seed,map,weight,sign,hold);
      const fit=solve(c.slice(0,cut),all,map,weight,sign,hold);check(fit.plain,"control fit must have path");
      const test=solve(c.slice(cut),[fit.end],map,weight,sign,hold);
      const replay=enc(fit.plain,fit.seed,map,weight,sign,hold);check(eq(replay,c.slice(0,cut)),"fit replay");
      if(test.plain)check(eq(enc(test.plain,fit.end,map,weight,sign,hold),c.slice(cut)),"control suffix replay");
      const trueHold=p.slice(cut);controls.push({name:native.sections[ci].name,seed,found:fit.seed,fitExact:eq(fit.plain,p.slice(0,cut)),holdCorrect:test.plain?hits(test.plain,trueHold):0,holdN:rate(trueHold),holdScore:test.plain?test.score/rate(trueHold):null,trueScore:trueHold.reduce((s,w)=>s+score(w),0)/rate(trueHold),collapse:fit.collapse,dead:test.dead??null});
    }
    for(let ci=0;ci<chapters.length;ci++){
      const c=chapters[ci],cut=Math.floor(c.length*2/3);
      const full=solve(c,all,map,weight,sign,hold);
      const fit=solve(c.slice(0,cut),all,map,weight,sign,hold);
      if(!fit.plain){original.push({range:ranges[ci],dead:full.dead,minStates:full.minStates});continue}
      const test=solve(c.slice(cut),[fit.end],map,weight,sign,hold);
      check(eq(enc(fit.plain,fit.seed,map,weight,sign,hold),c.slice(0,cut)),"original fit replay");
      if(test.plain)check(eq(enc(test.plain,fit.end,map,weight,sign,hold),c.slice(cut)),"original suffix replay");
      original.push({range:ranges[ci],dead:full.dead??null,states:full.states??0,seed:fit.seed,collapse:fit.collapse,fitScore:fit.score/rate(c.slice(0,cut)),holdScore:test.plain?test.score/rate(c.slice(cut)):null,frozenDead:test.dead??null,preview:test.plain?test.plain.slice(0,15).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" "):null});
    }
    out.push({radix:mi+59,weight,sign,hold,controls,original});
  }
  return {trainWords:train.length,chapters:chapters.map(c=>({words:c.length,runes:rate(c)})),results:out};
}
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(research(read(paths[0]),...paths.slice(1).map(p=>JSON.parse(read(p)))),null,2));
