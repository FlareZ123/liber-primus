'use strict';
// Agent12: page-local maximum histogram bound; arbitrary private output alphabet and rank permutation.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus, transcript, solved, controls) {
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const mod=x=>(x+29)%29;
  const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  const original=pages.flatMap(p=>p.indices);
  const raw=[...transcript.split("%").slice(0,55).join("%")].filter(x=>idx.has(x)).map(x=>idx.get(x));
  assert(pages.length===55&&original.length===12956&&raw.join()===original.join(),"source parity");
  function bounds(segs) {
    let offset=0;
    return segs.map(p=>{
      const n=p.indices.length,h=[Array(28).fill(0),Array(28).fill(0)];
      let free=1;
      for(let i=1;i<n;i++){
        const a=p.indices[i-1],b=p.indices[i];
        if(a===b){free++;continue;}
        h[0][mod(b-a-1)]++;h[1][b-Number(b>a)]++;
      }
      for(const x of h)x.sort((a,b)=>a-b);
      const caps=h.map(x=>x[26]+x[27]+free);
      const result={page:p.page,offset,n,free,caps,cap:Math.max(...caps)};
      offset+=n;return result;
    });
  }
  const rows=bounds(pages),N=original.length;
  assert(rows.reduce((n,r)=>n+r.free,0)===141,"free sites");
  assert(rows.find(r=>r.page===17).cap===30,"p17 cap");
  const order=rows.slice().sort((a,b)=>a.cap/a.n-b.cap/b.n||a.page-b.page);
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function gp(raw,cal) {
    const out=[];
    for(const w of raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){
        if(cal&&w.startsWith("ING",i)){out.push(21);i+=3;continue;}
        if(cal&&w.startsWith("IO",i)){out.push(27);i+=2;continue;}
        const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,"GP token");out.push(t.i);i+=t.s.length;
      }
    }return out;
  }
  function scan(a) {
    const W=a.length-N+1,active=new Uint8Array(W).fill(1),steps=[];
    let remain=W;
    for(const r of order){
      const cnt=Array(29).fill(0);
      for(let i=0;i<r.n;i++)cnt[a[r.offset+i]]++;
      for(let k=0;k<W;k++){
        if(active[k]&&Math.max(...cnt)>r.cap){active[k]=0;remain--;}
        if(k<W-1){cnt[a[r.offset+k]]--;cnt[a[r.offset+k+r.n]]++;}
      }
      steps.push({page:r.page,remaining:remain});
      if(!remain)break;
    }
    return {windows:W,remaining:remain,steps};
  }
  assert(gp("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true).join()===corpus.pages[57].indices.join(),"p57 GP control");
  const native=solved.sections.flatMap(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
  assert(native.length===2979,"solved length");
  const literature=[];
  for(const [name,raw,legacyLength,correctLength] of controls)for(const cal of [false,true]){
    const a=gp(raw,cal);assert(a.length===(cal?correctLength:legacyLength),"native length");
    literature.push({name,calibrated:cal,...scan(a)});
  }
  assert(literature.reduce((s,x)=>s+x.windows,0)===1129739,"all native windows");
  let rng=0x12fa3301;
  function rnd(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
  function shuffle(n){let a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  const plants=[];
  for(const [name,raw] of controls){
    const plain=gp(raw,true).slice(0,N),ct=[],decoded=[];
    for(const r of rows){
      const alphabet=shuffle(29),position=Array(29),perm=shuffle(28),inv=Array(28);
      alphabet.forEach((v,i)=>position[v]=i);perm.forEach((v,i)=>inv[v]=i);
      const mode=rnd()%2,escape=Array.from({length:29},()=>rnd()%29);
      const p=plain.slice(r.offset,r.offset+r.n),c=[rnd()%29],d=[p[0]];
      for(let i=1;i<p.length;i++){
        const e=escape[p[i-1]],x=position[p[i]],prev=c[i-1];
        if(x===e)c.push(prev);
        else {const q=inv[x-Number(x>e)];c.push(mode===0?mod(prev+q+1):q+Number(q>=prev));}
      }
      for(let i=1;i<c.length;i++){
        const e=escape[d[i-1]],a=c[i-1],b=c[i];
        const q=a===b?null:mode===0?mod(b-a-1):b-Number(b>a);
        const x=q===null?e:perm[q]+Number(perm[q]>=e);
        d.push(alphabet[x]);
      }
      assert(d.join()===p.join(),"plant replay");
      ct.push({page:r.page,indices:c});decoded.push(...d);
    }
    const planted=bounds(ct);
    let minSlack=Infinity;
    for(const r of planted){
      const h=Array(29).fill(0);for(const x of plain.slice(r.offset,r.offset+r.n))h[x]++;
      const slack=r.cap-Math.max(...h);assert(slack>=0,"plant violates cap");minSlack=Math.min(minSlack,slack);
    }
    assert(decoded.join()===plain.join(),"whole plant replay");
    plants.push({name,exact:decoded.length,minSlack});
  }
  return {rows,order:order.map(r=>r.page),literature,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const v=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(v[0]),v[1],JSON.parse(v[2]),[['Gibran',v[3],63114,62492],['Shakespeare',v[4],218800,217106],['Emerson',v[5],324630,321327]]),null,2));
