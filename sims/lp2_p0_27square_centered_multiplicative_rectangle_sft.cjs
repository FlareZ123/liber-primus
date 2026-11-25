'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,native,controls,log){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>((x%29)+29)%29;
  const log2=new Int8Array(29).fill(-1);for(let i=0,v=1;i<28;i++,v=v*2%29)log2[v]=i;
  check(log2[0]===-1&&log2.slice(1).every(x=>x>=0),"2 primitive");
  const trans=a=>Array.from({length:729},(_,i)=>a[i%27*27+Math.floor(i/27)]);
  const sort=a=>Array.from(a).sort((x,y)=>x-y).join(",");
  const sym=(a,b)=>[a,b].sort().join("|");
  const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(text){
    const out=[];for(const w of text.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){const x=tokens.find(t=>w.startsWith(t.s,i));check(x,"unencodable word "+w);out.push(x.i);i+=x.s.length;}
    }return out;
  }
  function zero(a,z){
    const rows=new Uint8Array(27),cols=new Uint8Array(27);let n=0;
    for(let i=0;i<729;i++)if(a[i]===z){n++;rows[Math.floor(i/27)]++;cols[i%27]++;}
    return {n,deg:sym(sort(rows),sort(cols))};
  }
  function ratios(a,z,full=false){
    const l=Int8Array.from(a,x=>log2[mod(x-z)]);
    let q=0,rect=0;const profiles=[];
    const h=new Uint8Array(28);
    for(let r=0;r<27;r++)for(let s=r+1;s<27;s++){
      h.fill(0);let n=0;
      for(let j=0;j<27;j++){
        const u=l[r*27+j],v=l[s*27+j];if(u<0||v<0)continue;
        const d=(u-v+28)%28;q+=h[d]++;rect+=n++;
      }
      if(full)profiles.push(sort(h));
    }
    return {q,rect,profile:full?profiles.sort().join(";"):null};
  }
  function invariant(a,z){
    const g=zero(a,z),r=ratios(a,z,true),c=ratios(trans(a),z,true);
    check(r.q===c.q&&r.rect===c.rect,"rectangle symmetry");
    return {...g,q:r.q,rect:r.rect,profile:sym(r.profile,c.profile)};
  }
  const C=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  check(corpus.pages.slice(0,3).map(p=>p.indices.length).join(",")==="262,266,201","source lengths");
  const orig=Array.from({length:29},(_,z)=>invariant(C,z));
  log("Original center statistics "+JSON.stringify(orig.map((x,z)=>({z,n:x.n,q:x.q,rect:x.rect}))));
  const byCount=new Map();for(let z=0;z<29;z++){const x=orig[z];if(!byCount.has(x.n))byCount.set(x.n,[]);byCount.get(x.n).push(z);}
  const pages=native.split("%").map(s=>Array.from(s).filter(x=>glyph.has(x)).map(x=>glyph.get(x))).filter(a=>a.length);
  check(pages.length===15,"native page count "+pages.length);
  const clear=[3,8,9,10,11,14].flatMap(i=>pages[i]);
  check(clear.length===1001,"native clear length "+clear.length);
  const donors=Object.entries(controls).map(([name,text])=>[name,encode(text)]);
  donors.push(["native-clear-LP1",clear]);
  const report={};
  const matched=orig.map(()=>({n:0,atOrBelow:0,min:Infinity}));
  for(const [name,a] of donors){
    const out={windows:0,centerPairs:0,degreePairs:0,ratioCountPairs:0,ratioAndRectPairs:0,combinedPairs:0,fullPairs:0,degreeExamples:[],fullExamples:[]};
    for(let i=0;i+729<=a.length;i+=729){
      const P=a.slice(i,i+729);out.windows++;
      for(let alpha=0;alpha<29;alpha++){
        const g=zero(P,alpha),matches=byCount.get(g.n)||[];if(!matches.length)continue;
        out.centerPairs+=matches.length;
        const rr=ratios(P,alpha);
        for(const beta of matches){
          const t=orig[beta];const deg=g.deg===t.deg;
          if(name!=="native-clear-LP1"){
            const m=matched[beta];m.n++;m.atOrBelow+=Number(rr.q*t.rect<=t.q*rr.rect);m.min=Math.min(m.min,rr.q/rr.rect);
          }
          if(deg){out.degreePairs++;if(out.degreeExamples.length<6)out.degreeExamples.push([i,alpha,beta,g.n,rr.q,t.q]);}
          if(rr.q===t.q)out.ratioCountPairs++;
          if(rr.q===t.q&&rr.rect===t.rect){out.ratioAndRectPairs++;if(deg){out.combinedPairs++;if(invariant(P,alpha).profile===t.profile){out.fullPairs++;out.fullExamples.push([i,alpha,beta]);}}}
        }
      }
    }report[name]=out;log(name+" "+JSON.stringify(out));
  }
  const rates=matched.map((m,z)=>({z,zeroCount:orig[z].n,rate:orig[z].q/orig[z].rect,...m}));
  const belowAll=rates.filter(x=>x.atOrBelow===0).map(x=>x.z);
  check(belowAll.join(',')==='6,14,15,18,21,22,26','conditional ratio rate result');
  log('Conditional literary ratio rates '+JSON.stringify(rates));
  for(const [name,expected] of Object.entries({'gibran_prophet_58585.txt':[86,939,6,0,0],'shakespeare_first300k.txt':[300,3751,22,7,0],'emerson_essays_2944.txt':[445,5604,15,7,1],'native-clear-LP1':[1,14,1,0,0]})){
    const x=report[name];check([x.windows,x.centerPairs,x.degreePairs,x.ratioCountPairs,x.ratioAndRectPairs].join(',')===expected.join(',')&&x.combinedPairs===0,'source decision '+name);
  }
  let state=0x33012729;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
  const perm=()=>{const a=Array.from({length:27},(_,i)=>i);for(let i=26;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
  const inv=Array.from({length:29},(_,i)=>i===0?0:Array.from({length:28},(_,j)=>j+1).find(j=>i*j%29===1));
  let recovered=0;
  for(let t=0;t<8;t++){
    const plain=t<4?clear.slice(t*60,t*60+729):donors[t%3][1].slice(t*729,t*729+729);
    const P=t%2?trans(plain):plain;
    const rows=perm(),cols=perm(),R=Array.from({length:27},()=>1+rng()%28),K=Array.from({length:27},()=>1+rng()%28);
    const alpha=rng()%29,beta=rng()%29;
    const E=Array.from({length:729},(_,i)=>{const r=Math.floor(i/27),c=i%27;return mod(beta+R[r]*K[c]*(P[rows[r]*27+cols[c]]-alpha));});
    const D=Array(729);for(let r=0;r<27;r++)for(let c=0;c<27;c++)D[rows[r]*27+cols[c]]=mod(alpha+inv[R[r]]*inv[K[c]]*(E[r*27+c]-beta));
    check(D.every((x,i)=>x===P[i]),"inverse");
    check(JSON.stringify(invariant(plain,alpha))===JSON.stringify(invariant(E,beta)),"full multiplicative invariant");
    recovered+=D.length;
    log("plant "+t+" "+JSON.stringify({alpha,beta,n:zero(E,beta).n,q:ratios(E,beta).q,exact:D.length}));
  }
  log("exact replay "+recovered);return {report,recovered,rates};
}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const controls=Object.fromEntries(['gibran_prophet_58585.txt','shakespeare_first300k.txt','emerson_essays_2944.txt'].map(p=>[p,read('resources/control/'+p)]));
experiment(corpus,native,controls,console.log);
