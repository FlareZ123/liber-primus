'use strict';
/** Exact GP29 4x8 historical-branch-coordinate receiver; run from repo root. */
const fs=require('node:fs');
function main(corpus, raw, wordlist, native) {
  const A=corpus.translit, S="0123456789abcdefghijklmnopqrs";
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const key=w=>w.map(x=>S[x]).join(""), unpack=s=>[...s].map(x=>S.indexOf(x));
  const D=new Set();
  for(const line of wordlist.split(/\r?\n/)){
    const q=line.match(/^([a-z]+)\s+([0-9]+)\s*$/);if(!q)continue;
    const w=q[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    function go(i,s){if(i===w.length){D.add(s);return}for(let n=1;n<=3&&i+n<=w.length;n++){const t=w.slice(i,i+n),x=n===3?(t==="ING"?21:-1):A.indexOf(t);if(x>=0)go(i+n,s+S[x])}}
    go(0,"");
  }
  check(D.size===38910,"base register");
  const sections=native.sections.map(z=>({name:z.name,words:(z.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>corpus.runes.indexOf(x)))}));
  for(const z of sections)for(const w of z.words)D.add(key(w));
  check(D.size===38938,"augmented register");
  const words=[];let cur=[],page=0,start=0;
  function finish(){if(cur.length){words.push({w:cur,start,end:page});cur=[]}}
  for(const ch of raw.split("%").slice(0,55).join("%")){const x=corpus.runes.indexOf(ch);if(x>=0){if(!cur.length)start=page;cur.push(x)}else if(ch==="%"){page++}else if(ch!=="/"&&!/\s/u.test(ch)){finish()}}
  finish();
  const flat=words.flatMap(x=>x.w), canonical=corpus.pages.slice(0,56).flatMap(x=>x.indices);
  check(words.length===2896&&flat.length===12956&&flat.every((x,i)=>x===canonical[i]),"original source");
  const opening=words.filter(x=>x.start<=2).map(x=>x.w), body=opening.slice(2);
  check(opening.flat().length===729&&body.length===156&&body.flat().length===716,"opening split");
  const count=w=>{const r=Array(4).fill(0),c=Array(8).fill(0);for(const x of w){r[x>>3]++;c[x&7]++}return [r,c]};
  const pack=h=>h.reduce((v,x,i)=>(v|(x<<(4*i)))>>>0,0);
  const perms=n=>{const out=[];function f(a,rest){if(!rest.length){out.push(a);return}for(const x of rest)f([...a,x],rest.filter(y=>y!==x))}f([],Array.from({length:n},(_,i)=>i));return out};
  const R=perms(4),C=perms(8),N=C.length;
  function remap(h,p){let v=0;for(let i=0;i<h.length;i++)v|=h[i]<<(4*p[i]);return v>>>0}
  const ordinary=new Map(),held=Array.from({length:15},()=>new Map());
  function add(m,r,c){if(!m.has(r))m.set(r,new Set());m.get(r).add(c)}
  for(const s of D){const w=unpack(s);if(w.length>14)continue;let [r,c]=count(w);add(ordinary,pack(r),pack(c));const f=w.filter(x=>x===0).length;r[0]-=f;c[0]-=f;add(held[f],pack(r),pack(c))}
  function signatures(w){const [r,c]=count(w),out=[];for(let h=0;h<=Math.min(r[0],c[0],w.filter(x=>x===0).length);h++){const a=r.slice(),b=c.slice();a[0]-=h;b[0]-=h;out.push({r:a,c:b,cc:Uint32Array.from(C,p=>remap(b,p))})}return out}
  function solve(ws,truth=null){
    const scores=[new Uint16Array(R.length*N),new Uint16Array(R.length*N)], types=new Map();
    for(const w of ws){const k=key(w);if(types.has(k))types.get(k).n++;else types.set(k,{w,n:1})}
    for(const {w,n} of types.values()){
      const s=signatures(w);
      for(let ri=0;ri<R.length;ri++){
        const row=R[ri], a=ordinary.get(remap(s[0].r,row)), b=s.map((q,h)=>held[h].get(remap(q.r,row)));
        if(!a&&!b.some(Boolean))continue;
        const offset=ri*N;
        for(let ci=0;ci<N;ci++){
          if(a&&a.has(s[0].cc[ci]))scores[0][offset+ci]+=n;
          for(let h=0;h<b.length;h++)if(b[h]&&b[h].has(s[h].cc[ci])){scores[1][offset+ci]+=n;break}
        }
      }
    }
    return scores.map((score,mode)=>{let best=-1,index=-1,ties=0;for(let j=0;j<score.length;j++){if(score[j]>best){best=score[j];index=j;ties=1}else if(score[j]===best)ties++}
      const rp=R[Math.floor(index/N)],cp=C[index%N];
      const byLength={};for(const w of ws){const a=byLength[w.length]??=[0,0];a[0]++;const [r,c]=count(w);let ok=false;const f=w.filter(x=>x===0).length;
        for(let h=0;h<=(mode?f:0);h++){let rr=r.slice(),cc=c.slice();rr[0]-=h;cc[0]-=h;const m=mode?held[h]:ordinary;if(m.get(remap(rr,rp))?.has(remap(cc,cp)))ok=true}a[1]+=+ok}
      const truthIdx=truth?R.findIndex(x=>x.join()===truth[0].join())*N+C.findIndex(x=>x.join()===truth[1].join()):-1;
      return {mode:mode?"Fhold":"ordinary",max:best,groups:ws.length,miss:ws.length-best,ties,rowMap:rp,colMap:cp,byLength,truthScore:truth?score[truthIdx]:null}
    })
  }
  const sortedSig=w=>count(w).map(h=>h.sort((a,b)=>a-b).join(",")).join("|");
  const fixedSig=w=>count(w).map(h=>h.join(",")).join("|");
  const fixed=new Set(),free=new Set(),freeHeld=new Set();
  for(const s of D){const w=unpack(s);fixed.add(fixedSig(w));free.add(sortedSig(w));const f=w.filter(x=>x===0).length;freeHeld.add(f+"|"+sortedSig(w.filter(x=>x!==0)))}
  function relaxed(ws){const stats={groups:ws.length,runes:ws.flat().length,fixed:0,free:0,freeHeld:0};for(const w of ws){stats.fixed+=+fixed.has(fixedSig(w));stats.free+=+free.has(sortedSig(w));const f=w.filter(x=>x===0).length;let ok=false;for(let h=0;h<=f;h++){let left=h;const z=w.filter(x=>x!==0||left--<=0);if(freeHeld.has(h+"|"+sortedSig(z)))ok=true}stats.freeHeld+=+ok}return stats}
  function transform(w,axis,op){const n=w.length;return w.map((x,i)=>{const j=op==="reverse"?n-1-i:((i+op)%n+n)%n;return axis==="col"?(x&24)|(w[j]&7):(w[j]&24)|(x&7)})}
  function direct(ws){const out=[];for(const axis of ["row","col"])for(const op of ["reverse",3,-3]){const p=ws.map(w=>transform(w,axis,op)), legal=p.filter(w=>w.every(x=>x<29));out.push({axis,op,holes:p.flat().filter(x=>x>=29).length,legal:legal.length,hits:legal.filter(w=>D.has(key(w))).length,first:p[0].slice(0,12).map(x=>A[x]??"?").join("")})}return out}
  // Hidden source-native plants; map arrays are plaintext->ciphertext.
  function plant(ws,hold,seed,forwardRow,forwardCol){
    let state=seed>>>0;const rand=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n};
    const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=rand(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
    const inv=p=>p.map((_,i)=>p.indexOf(i)), truth=[inv(forwardRow),inv(forwardCol)];let moved=0;
    const enc=ws.map(w=>{
      const pos=w.map((x,i)=>i).filter(i=>!(hold&&w[i]===0)), seq=pos.map(i=>w[i]);let rr,cc,code;
      for(let attempt=0;attempt<=100;attempt++){
        const order=seq.map((_,i)=>i);rr=attempt===100?order:shuffle(order);cc=attempt===100?order:shuffle(order);
        code=rr.map((j,i)=>8*forwardRow[seq[j]>>3]+forwardCol[seq[cc[i]]&7]);
        if(code.every(x=>x<29))break;
      }
      check(code.every(x=>x<29),"plant holes");
      const dec=Array(seq.length).fill(0);for(let i=0;i<code.length;i++){dec[rr[i]]|=8*truth[0][code[i]>>3];dec[cc[i]]|=truth[1][code[i]&7]}
      check(dec.every((x,i)=>x===seq[i]),"plant exact inverse");
      const c=w.slice();for(let i=0;i<pos.length;i++)c[pos[i]]=code[i];
      if(rr.some((x,i)=>x!==cc[i]))moved++;
      return c;
    });
    return {seed,hold,words:ws.length,moved,truth,result:solve(enc,truth)}
  }
  const result={base:38910,augmented:D.size,sourceWords:words.length,sourceRunes:flat.length,opening:relaxed(opening),body:relaxed(body),wholeBookRelaxed:relaxed(words.map(x=>x.w)),title:relaxed(opening.slice(0,2)),direct:direct(body),directWhole:direct([body.flat()]),searchSize:R.length*N,original:solve(body)};
  result.plants=[
    plant(sections.find(z=>z.name==="0_welcome").words.slice(0,70),false,3301,[2,0,1,3],[4,3,1,0,2,7,5,6]),
    plant(sections.find(z=>z.name==="0_koan_1").words.slice(0,70),true,1033,[1,2,0,3],[2,4,0,1,3,6,7,5])
  ];
  for(const p of result.plants){const q=p.result[+p.hold];check(q.max===p.words&&q.truthScore===p.words,"hidden common-axis plant")}
  return result;
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const src=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(main(JSON.parse(src[0]),src[1],src[2],JSON.parse(src[3])),null,2));
