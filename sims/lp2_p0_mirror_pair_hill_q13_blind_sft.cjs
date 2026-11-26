"use strict";
const fs=require("node:fs"); const path=require("node:path");
function experiment(book,native,emerson,gibran,shakespeare){
  const Q=29,period=13,sizes=[262,266,201],K=8,shortlist=24;
  const mod=x=>((x%Q)+Q)%Q;
  const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw Error("singular");};
  const determinant=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]);
  const map=new Map(book.translit.map((x,i)=>[x,i]));
  function latin(text){
    const words=text.toUpperCase().match(/[A-Z]+/g)||[];
    const out=[];
    for(let w of words){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
      for(let i=0;i<w.length;){
        const pair=w.slice(i,i+2);
        if(pair.length===2&&map.has(pair)){out.push(map.get(pair));i+=2;}
        else{const v=map.get(w[i++]);if(v!==undefined)out.push(v);}
      }
    }
    return out;
  }
  const texts=native.sections.map(s=>Array.from(s.source_text).map(x=>native.runes.indexOf(x)).filter(x=>x>=0));
  texts.push(latin(emerson).slice(1000));
  const counts=new Float64Array(Q).fill(.5), pairs=new Float64Array(Q*Q).fill(.0), totals=new Float64Array(Q);
  for(const s of texts){for(let i=0;i<s.length;i++){counts[s[i]]++;if(i){pairs[s[i-1]*Q+s[i]]++;totals[s[i-1]]++;}}}
  const sum=counts.reduce((a,b)=>a+b,0), uni=Array.from(counts,c=>Math.log(c/sum)), big=new Float64Array(Q*Q);
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)big[a*Q+b]=Math.log((pairs[a*Q+b]+12*counts[b]/sum)/(totals[a]+12));
  let state=0x1d0ac4b1;function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  function encrypt(pages,rows,keys){
    const d=inv(determinant(rows[0],rows[1])), [a,b]=rows[0], [c,e]=rows[1];
    return pages.map(p=>{const out=p.slice();for(let i=0;i<Math.floor(p.length/2);i++){
      const j=p.length-1-i,x=mod(p[i]-keys[0][i%period]),y=mod(p[j]-keys[1][i%period]);
      out[i]=mod(d*(e*x-b*y));out[j]=mod(d*(-c*x+a*y));
    }return out;});
  }
  function decrypt(pages,rows,keys){return pages.map(p=>{const out=p.slice();for(let i=0;i<Math.floor(p.length/2);i++){
    const j=p.length-1-i,x=p[i],y=p[j];out[i]=mod(rows[0][0]*x+rows[0][1]*y+keys[0][i%period]);out[j]=mod(rows[1][0]*x+rows[1][1]*y+keys[1][i%period]);
  }return out;});}
  function score(pages){let n=0,s=0;for(const p of pages){const m=p.length>>1;for(const rail of [p.slice(0,m),p.slice(p.length-m)]){if(!rail.length)continue;s+=uni[rail[0]];n++;for(let i=1;i<rail.length;i++){s+=big[rail[i-1]*Q+rail[i]];n++;}}}return s/n+Math.log(Q);}
  function fitRow(pages,row,reverse,cap){
    const bins=Array.from({length:period},()=>new Int32Array(Q)), events=Array.from({length:period},()=>[]), starts=Array.from({length:period},()=>[]);
    for(const p of pages){const n=p.length>>1, z=[];for(let i=0;i<n;i++){const j=p.length-1-i,v=mod(row[0]*p[i]+row[1]*p[j]);z.push(v);bins[i%period][v]++;}
      const start=reverse?n-1:0;starts[start%period].push(z[start]);for(let i=0;i<n-1;i++)events[i%period].push([z[i],z[i+1]]);
    }
    const choices=bins.map(h=>Array.from({length:Q},(_,k)=>({k,s:h.reduce((s,n,x)=>s+n*uni[(x+k)%Q],0)})).sort((a,b)=>b.s-a.s||a.k-b.k).slice(0,cap).map(x=>x.k));
    const U=choices.map((ks,p)=>ks.map(k=>starts[p].reduce((s,x)=>s+uni[(x+k)%Q],0)));
    const E=choices.map((ks,p)=>{const next=choices[(p+1)%period],m=new Float64Array(ks.length*next.length);for(let u=0;u<ks.length;u++)for(let v=0;v<next.length;v++){
      const a=ks[u],b=next[v];let s=0;for(const [x,y] of events[p]){const l=(x+a)%Q,h=(y+b)%Q;s+=reverse?big[h*Q+l]:big[l*Q+h];}m[u*next.length+v]=s;
    }return m;});
    let best=-Infinity,bestKey=null;
    for(let init=0;init<choices[0].length;init++){
      let dp=new Float64Array(choices[0].length).fill(-Infinity);dp[init]=U[0][init];const trace=[];
      for(let p=0;p<period-1;p++){const n=choices[p+1].length,next=new Float64Array(n).fill(-Infinity),prev=new Int16Array(n);
        for(let j=0;j<n;j++){let bv=-Infinity,bi=0;for(let i=0;i<dp.length;i++){const v=dp[i]+E[p][i*n+j];if(v>bv){bv=v;bi=i;}}next[j]=bv+U[p+1][j];prev[j]=bi;}
        trace.push(prev);dp=next;
      }
      for(let j=0;j<dp.length;j++){const v=dp[j]+E[period-1][j*choices[0].length+init];if(v>best){best=v;let pos=j;const key=new Array(period);for(let p=period-1;p>=0;p--){key[p]=choices[p][pos];if(p)pos=trace[p-1][pos];}bestKey=key;}}
    }
    return {row,key:bestKey,score:best};
  }
  function rank(pages,reverse){
    const candidates=[];
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)if(a||b)candidates.push(fitRow(pages,[a,b],reverse,K));
    candidates.sort((a,b)=>b.score-a.score);
    return candidates.slice(0,shortlist).map(x=>fitRow(pages,x.row,reverse,Q)).sort((a,b)=>b.score-a.score);
  }
  function fit(pages){
    const l=rank(pages,false),r=rank(pages,true);let best=null;
    for(const a of l)for(const b of r)if(determinant(a.row,b.row)){const s=a.score+b.score;if(!best||s>best.score)best={rows:[a.row,b.row],keys:[a.key,b.key],score:s};}
    if(!best)throw Error("no independent row pair");return best;
  }
  const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const donorA=latin(gibran),donorB=latin(shakespeare);
  function split(s,offset){let pos=offset;return sizes.map(n=>{const a=s.slice(pos,pos+n);pos+=n;if(a.length!==n)throw Error("short donor");return a;});}
  const controls=[];
  for(const [name,donor,offset] of [["Gibran-A",donorA,800],["Gibran-B",donorA,2300],["Shakespeare",donorB,1300]]){
    const plain=split(donor,offset);let rows;
    do{rows=Array.from({length:2},()=>[rand()%Q,rand()%Q]);}while(!determinant(rows[0],rows[1]));
    const keys=Array.from({length:2},()=>Array.from({length:period},()=>rand()%Q));
    const cipher=encrypt(plain,rows,keys),found=fit(cipher.slice(0,2)),decoded=decrypt(cipher,found.rows,found.keys);
    const match=decoded[2].filter((x,i)=>x===plain[2][i]).length;
    const rowMatch=exact(found.rows,rows),keyMatch=exact(found.keys,keys);
    controls.push({name,rows,keys,found,match,heldout:plain[2].length,rowMatch,keyMatch,trainGain:score(decoded.slice(0,2)),holdoutGain:score(decoded.slice(2)),trueGain:score(plain.slice(2)),replay:exact(encrypt(decoded,found.rows,found.keys),cipher)});
  }
  if(!controls.every(x=>x.rowMatch&&x.keyMatch&&x.replay))return {config:{sizes,K,shortlist,period},controls,original:null};
  const cipher=book.pages.slice(0,3).map(p=>p.indices);if(!exact(cipher.map(x=>x.length),sizes))throw Error("source size changed");
  const found=fit(cipher.slice(0,2)),plain=decrypt(cipher,found.rows,found.keys);
  return {config:{sizes,K,shortlist,period},controls,original:{found,trainGain:score(plain.slice(0,2)),holdoutGain:score(plain.slice(2)),replay:exact(encrypt(plain,found.rows,found.keys),cipher),decoded:plain.map(p=>p.map(x=>book.translit[x]).join(" ")),decodedIndices:plain}};
}
const load=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const lines=p=>load(p).split(/\r?\n/).slice(0,400).join("\n");
const result=experiment(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),JSON.parse(load("resources/external/relikd-solved-gp29-native-v1.json")),lines("resources/control/emerson_essays_2944.txt"),lines("resources/control/gibran_prophet_58585.txt"),lines("resources/control/shakespeare_first300k.txt"));
console.log(JSON.stringify(result,null,2));
