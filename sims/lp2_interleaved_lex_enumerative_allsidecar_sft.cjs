'use strict';
// Exact interleaved lexicographic GP29 enumerator; source-specific finite gate.
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus,source,native){
  const assert=(condition,message)=>{if(!condition)throw Error(message);};
  const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const gp=new Map(corpus.runes.map((c,i)=>[c,i]));
  const breaks=new Set(["-",".","&","$","§","⁘","⁚","⁜","⁕"]);
  const words=s=>{const out=[];let w=[];for(const ch of s){if(gp.has(ch))w.push(gp.get(ch));else if(breaks.has(ch)&&w.length){out.push(w);w=[];}}if(w.length)out.push(w);return out;};
  const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const sections=source.split("%").slice(0,55).join("%").split("$").map(words).filter(w=>w.length);
  const whole=sections.flat();
  const donor=native.sections.flatMap(s=>[...s.source_text].filter(c=>gp.has(c)).map(c=>gp.get(c)));
  assert(equal(whole.flat(),original),"source alignment");
  assert(sections.length===8&&whole.length===2896&&original.length===12956&&donor.length===2979,"source sizes");
  function choose(n,k){let r=1n;for(let j=1;j<=k;j++)r=r*BigInt(n-j+1)/BigInt(j);return r;}
  function ioc(a){const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
  function digits(r,n){const a=Array(n);for(let j=n-1;j>=0;j--){a[j]=Number(r%29n);r/=29n;}assert(r===0n,"base29 overflow");return a;}
  function toInt(a){let v=0n;for(const x of a)v=v*29n+BigInt(x);return v;}
  function countRepeats(w){return w.reduce((s,x)=>s+x.slice(1).filter((v,i)=>v===x[i]).length,0);}
  /**
   * Lexicographic, physically interleaved exact-repeat code. Rank a ciphertext
   * or unrank a supplied integer with the same known group lengths and quota.
   * @param {number[]} lens
   * @param {number} quota
   * @param {"absolute"|"delta"} order
   * @param {number[]|bigint} input
   */
  function walk(lens,quota,order,input){
    const ranking=Array.isArray(input),n=lens.reduce((a,b)=>a+b,0);
    let t=n-lens.length,k=quota;
    let space=29n**BigInt(lens.length)*choose(t,k)*28n**BigInt(t-k), M=space;
    let rank=ranking?0n:input,pos=0,prev=0;
    const decoded=[];
    assert(ranking?input.length===n:rank>=0n&&rank<M,"invalid input");
    for(const len of lens){
      for(let i=0;i<len;i++,pos++){
        let x;
        if(i===0){
          const b=space/29n;
          if(ranking){x=input[pos];rank+=BigInt(x)*b;}
          else{x=Number(rank/b);rank%=b;}
          space=b;
        }else{
          // Each remaining ordinary digit has the same count; repeat differs.
          const normal=space*BigInt(t-k)/(28n*BigInt(t));
          const repeat=space*BigInt(k)/BigInt(t);
          const sentinel=order==="delta"?0:prev;
          assert(normal*28n+repeat===space,"branch partition");
          let digit;
          if(ranking){
            x=input[pos];digit=order==="delta"?(x-prev+29)%29:x;
            rank+=BigInt(digit-(digit>sentinel?1:0))*normal+(digit>sentinel?repeat:0n);
          }else{
            const left=BigInt(sentinel)*normal;
            if(rank<left){digit=Number(rank/normal);rank%=normal;}
            else if(rank<left+repeat){digit=sentinel;rank-=left;}
            else{rank-=left+repeat;digit=sentinel+1+Number(rank/normal);rank%=normal;}
            x=order==="delta"?(prev+digit)%29:digit;
          }
          if(digit===sentinel){space=repeat;k--;}else space=normal;
          assert(space>0n,"selected empty branch");
          t--;
        }
        decoded.push(x);prev=x;
      }
    }
    assert(t===0&&k===0&&space===1n&&(ranking?rank<M:rank===0n),"terminal state");
    return {rank,M,decoded};
  }
  const results=[];
  for(const [label,w] of [["whole",whole],...sections.map((x,i)=>["section"+i,x])]){
    const lens=w.map(x=>x.length),flat=w.flat(),h=lens.length,k=countRepeats(w),base=29n**BigInt(h);
    const controls=[];for(let i=0;i+h<=donor.length;i++)controls.push(ioc(donor.slice(i,i+h)));
    const rec={label,n:flat.length,h,k,nativeMin:Math.min(...controls),nativeMax:Math.max(...controls),orders:[]};
    for(const order of ["absolute","delta"]){
      const enc=walk(lens,k,order,flat);
      assert(enc.M%base===0n,"all-sidecar invariant");
      const replay=walk(lens,k,order,enc.rank);
      assert(equal(replay.decoded,flat),"original unrank");
      const tail=digits(enc.rank%base,h);
      const plant=Array.from({length:flat.length},(_,i)=>donor[(i+137)%donor.length]);
      const P=toInt(plant),q=P/enc.M,r=P%enc.M;
      const plantedCipher=walk(lens,k,order,r).decoded;
      const plantRank=walk(lens,k,order,plantedCipher).rank;
      assert(equal(digits(q*enc.M+plantRank,plant.length),plant),"native plant replay");
      assert((enc.rank+q*enc.M)%base===enc.rank%base,"quotient invariant");
      rec.orders.push({order,ioc:ioc(tail),preview:tail.slice(0,25).map(i=>corpus.translit[i]).join(" "),plantRunes:plant.length});
    }
    results.push(rec);
  }
  return results;
}
const result=experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp2-image-corrected.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')));
console.log(JSON.stringify(result,null,2));
