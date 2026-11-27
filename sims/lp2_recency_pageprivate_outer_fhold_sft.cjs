'use strict';
// Exact page-private, arbitrary-held-label move-to-front rank inverse.
function run(g,donorTexts) {
  const assert=(x,m)=>{if(!x)throw Error(m)},A=29;
  function events(t,h,n){const l=[],out=[],mandatory=Array(n).fill(0),last=Array(n).fill(-1);let lastH=-1;
    for(let i=0;i<t.length;i++){const x=t[i],q=l.indexOf(x),k=l.length;if(x===h){out.push([2,k,0]);lastH=i;continue}if(q>=0){out.push([1,k,q]);if(last[x]>lastH)mandatory[q]++;l.splice(q,1)}else out.push([0,k,0]);l.unshift(x);last[x]=i;}return {out,mandatory};}
  // Count only consuming ranks; the held plaintext F is not one of the target labels.
  // z=n: h has never consumed; otherwise z is the count of more recent distinct non-h glyphs.
  // First-consuming rank is an independent Lehmer digit in the unseen suffix.
  function mins(ev,f,n){const U=n,INF=30000;
    let dp=new Int16Array((n+1)*n).fill(INF),nd=new Int16Array((n+1)*n),active=[U],na=[],stamp=new Int16Array(n+1),ep=0;dp.fill(0,U*n,(U+1)*n);
    for(const [kind,k,q] of ev){ep++;na=[];
      function add(z,z2,rank,lo){if(rank===f)return;
        if(rank===-2){const avail=n-lo-(f>=lo?1:0);if(avail<=0)return;rank=avail===1?(lo===f?lo+1:lo):-1;}
        const b=z*n,c=z2*n;
        if(stamp[z2]!==ep){stamp[z2]=ep;na.push(z2);for(let r=0;r<n;r++)nd[c+r]=dp[b+r]+(r===rank?1:0)}
        else for(let r=0;r<n;r++){const v=dp[b+r]+(r===rank?1:0);if(v<nd[c+r])nd[c+r]=v;}}
      for(const z of active){
        if(kind===2){add(z,z,-1,0);if(z===U)add(z,0,-2,k);else add(z,0,z,0)}
        else if(kind===0)add(z,z===U?U:z+1,-2,k+(z===U?0:1));
        else {const rank=q+(z!==U&&z<=q?1:0);add(z,z===U?U:z+(q>=z?1:0),rank,0);}
      }
      if(!na.length)return null;[dp,nd]=[nd,dp];active=na;
    }
    const m=Array(n).fill(INF);for(const z of active)for(let r=0;r<n;r++)m[r]=Math.min(m[r],dp[z*n+r]);return m;
  }
  function rare(h,k){return h.slice().sort((a,b)=>a-b).slice(0,k).reduce((a,b)=>a+b,0)}
  function analyzePage(t){const best=Array(8).fill(Infinity),literal=Array(8).fill(Infinity),ordinary=Array(8).fill(0),witness=Array(8).fill(null);let keyN=0,litN=0;
    const counts=Array(A).fill(0),l=[];
    for(const x of t){const q=l.indexOf(x);if(q>=0){counts[q]++;l.splice(q,1)}l.unshift(x);}
    for(let i=0;i<8;i++)ordinary[i]=rare(counts,i+1);
    for(let h=0;h<A;h++){const {out,mandatory}=events(t,h,A);for(let f=0;f<A;f++){if(mandatory[f])continue;const m=mins(out,f,A);if(!m)continue;keyN++;if(h===0)litN++;const a=m.filter((x,i)=>i!==f).sort((a,b)=>a-b);let s=0;for(let i=0;i<8;i++){s+=a[i];if(s<best[i]){best[i]=s;witness[i]={h,f}}if(h===0)literal[i]=Math.min(literal[i],s)}}}
    assert(best.every(Number.isFinite)&&literal.every(Number.isFinite),"unexpected globally impossible page; handle separately");
    return {n:t.length,best,literal,ordinary,witness,keyN,litN};
  }
  function analyzePages(ps){const pages=ps.map((t,p)=>({p,...analyzePage(t)}));const sum=key=>Array.from({length:8},(_,i)=>pages.reduce((s,x)=>s+x[key][i],0));return {sum:sum("best"),literal:sum("literal"),ordinary:sum("ordinary"),pages};}
  let seed=0x26f11027;
  function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
  function perm(n){const p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rnd(i+1);[p[i],p[j]]=[p[j],p[i]]}return p;}
  function perms(n){let a=[];function rec(p,rest){if(!rest.length){a.push(p);return;}for(let i=0;i<rest.length;i++)rec([...p,rest[i]],rest.filter((_,j)=>j!==i));}rec([],Array.from({length:n},(_,i)=>i));return a;}
  function oracle(t,h,f,n,keys){const best=Array(n).fill(Infinity),ct=Array(n).fill(0);let legal=0;function go(i,L){if(i===t.length){legal++;for(let r=0;r<n;r++)best[r]=Math.min(best[r],ct[r]);return;}const x=t[i];if(x===h)go(i+1,L);const q=L.indexOf(x);if(q!==f){ct[q]++;const next=L.slice();next.splice(q,1);next.unshift(x);go(i+1,next);ct[q]--;}}for(const key of keys)go(0,key);return legal?best:null;}
  let oracleCases=0,oracleLegal=0,oracleImpossible=0;
  for(const n of [3,4,5]){const keys=perms(n);for(let t=0;t<24;t++){const tape=Array.from({length:5+t%7},()=>rnd(n));for(let h=0;h<n;h++)for(let f=0;f<n;f++){const ev=events(tape,h,n),actual=mins(ev.out,f,n),expected=oracle(tape,h,f,n,keys);assert(JSON.stringify(actual)===JSON.stringify(expected),"explicit-list oracle mismatch "+JSON.stringify({n,tape,h,f,actual,expected}));if(ev.mandatory[f])assert(!actual,"mandatory prune");oracleCases++;if(actual)oracleLegal++;else oracleImpossible++;}}}
  function native(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const tok=g.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length),p=[];for(const w of s.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){const a=tok.find(x=>w.startsWith(x[0],i));assert(a,"token");p.push(a[1]);i+=a[0].length;}return p;}
  const donors=donorTexts.map(native),N=12956;
  function windows(a){assert(a.length>=N,"donor length");const h=Array(A).fill(0),max=Array(8).fill(0),at=Array(8).fill(0);for(let i=0;i<N;i++)h[a[i]]++;
    for(let s=0;s+N<=a.length;s++){if(s){h[a[s-1]]--;h[a[s+N-1]]++;}const v=h.slice(1).sort((a,b)=>a-b);let k=0;for(let i=0;i<8;i++){k+=v[i];if(k>max[i]){max[i]=k;at[i]=s;}}}return {runes:a.length,windows:a.length-N+1,max,at};}
  const source=g.pages.slice(0,56).map(p=>p.indices);assert(source.flat().length===N&&source[50].length===0,"original length");
  const original=analyzePages(source);
  assert(original.sum[3]===318&&original.literal[3]===567&&original.ordinary[3]===592,"pinned results");
  const donorStats=donors.map(windows);
  const globalMax=Array.from({length:8},(_,i)=>Math.max(...donorStats.map(x=>x.max[i])));
  // Full matched-page native plant; all pages use independent initial list, rank map and held label.
  function makePlant(pages){let F=0,hConsumed=0,n=0;const ct=[],details=[];for(const p of pages){const initial=perm(A),map=perm(A),h=rnd(A),f=map.indexOf(0),l=initial.slice(),c=[],truth=Array(A).fill(0),holds=[];
    for(const x of p){if(x===0){F++;c.push(h);holds.push(true);continue;}const q=map.indexOf(x),v=l[q];truth[q]++;if(v===h)hConsumed++;c.push(v);holds.push(false);l.splice(q,1);l.unshift(v);}
    const replay=initial.slice(),d=[];for(let i=0;i<c.length;i++){if(holds[i]){assert(c[i]===h,"held glyph");d.push(0);continue;}const q=replay.indexOf(c[i]);assert(q!==f,"forbidden");d.push(map[q]);replay.splice(q,1);replay.unshift(c[i]);}
    assert(String(p)===String(d),"known-key inverse");
    const ev=events(c,h,A),m=mins(ev.out,f,A);assert(m&&m.every((x,r)=>x<=truth[r]),"true plant rank counts");assert(!ev.mandatory[f],"true f prune");ct.push(c);n+=p.length;details.push({h,f,n:p.length});
  }return {ct,n,F,hConsumed,details};}
  const p57=makePlant([g.pages[57].indices]);const p57Gate=analyzePages(p57.ct);
  const nativeTape=donors[0].slice(1000,1000+N);let pos=0;const chunks=source.map(t=>{const p=nativeTape.slice(pos,pos+t.length);pos+=t.length;return p;});
  const plant=makePlant(chunks),plantGate=analyzePages(plant.ct);
  const h=Array(A).fill(0);for(const x of nativeTape)h[x]++;
  const truthRare=Array.from({length:8},(_,i)=>rare(h.slice(1),i+1));
  assert(plantGate.sum.every((v,i)=>v<=truthRare[i]),"all-key matched plant wrongly rejected");
  return {model:"move selected ciphertext to front/back; stationary per-page rank map; literal plaintext-F held under arbitrary private output relabeling",sourceCount:N,original,donorStats,globalMax,allDonorWindows:donorStats.reduce((a,x)=>a+x.windows,0),excludedAtK4:original.sum[3]>globalMax[3],oracle:{cases:oracleCases,legal:oracleLegal,impossible:oracleImpossible},controls:{p57:{n:p57.n,F:p57.F,hConsumed:p57.hConsumed,bound:p57Gate.sum},matchedPages:{n:plant.n,F:plant.F,hConsumed:plant.hConsumed,bound:plantGate.sum,truthRare,privateKeys:plant.details}}};
}
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const docs=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(docs[0]),docs.slice(1)),null,2));
