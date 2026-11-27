// @ts-check
"use strict";
/** Exact all-secret periodic differential cube-orbit permutation capacity, native reference windows. */
const fs=require("node:fs");
const path=require("node:path");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function run(inputs){
  const corpus=JSON.parse(inputs[0]),native=JSON.parse(inputs[4]),mod=x=>(x%29+29)%29;
  const cube=x=>x*x*x%29,cls=new Int8Array(29).fill(-1),orbits=[];
  for(let i=0;i<29;i++)if(cls[i]<0){let a=[],x=i;do{cls[x]=orbits.length;a.push(x);x=cube(x)}while(x!==i);orbits.push(a)}
  const dict=new Map(corpus.translit.map((s,i)=>[s,i])),glyph=new Map(corpus.runes.map((s,i)=>[s,i]));
  function latin(raw){const a=[];for(let s of raw.match(/[A-Za-z]+/g)||[]){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let j=0;j<s.length;){const t=["TH","EO","NG","OE","AE","IA","EA"].find(t=>s.startsWith(t,j))||s[j];if(!dict.has(t))throw Error(t);a.push(dict.get(t));j+=t.length}}return a}
  const donors=["Gibran","Shakespeare","Emerson"].map((name,i)=>({name,a:latin(inputs[i+1])})).concat(native.sections.map(s=>({name:s.name,a:[...s.source_text].filter(x=>glyph.has(x)).map(x=>glyph.get(x))})));
  const periods=[6,8,13],starts=[0,3,8,15,23,27,33,40,54,56];
  function freq(a){const x=new Int32Array(29);for(const v of a)x[v]++;return x}
  function cumulative(x){let n=0;return Array.from(x).sort((a,b)=>b-a).map(v=>n+=v)}
  function diff(c){return c.slice(1).map((v,i)=>mod(v-c[i]))}
  function bound(d,q){
    const rows=Array.from({length:q},()=>new Int32Array(29));
    for(let i=0;i<d.length;i++)rows[i%q][d[i]]++;
    const aggregated=new Int32Array(29),inv=Array.from({length:q},()=>new Int8Array(29));
    for(let p=0;p<q;p++)for(const o of orbits){
      const labels=o.slice().sort((a,b)=>rows[p][b]-rows[p][a]||a-b);
      for(let j=0;j<o.length;j++){aggregated[o[j]]+=rows[p][labels[j]];inv[p][labels[j]]=o[j]}
    }
    const maximal=d.map((v,i)=>inv[i%q][v]);
    const b=cumulative(aggregated),check=cumulative(freq(maximal));
    if(b.some((v,i)=>v!==check[i]))throw Error("unattained bound");
    return {rankCounts:Array.from(aggregated).sort((a,b)=>b-a),cumulative:b};
  }
  // Every cumulative sorted-rank bound is simultaneously attainable:
  // for r chosen output labels in one orbit, at most the r largest
  // counts at each phase can contribute. Align all phase rankings.
  function windowGate(n,bs){
    const result=[];
    for(const d of donors){
      const windows=Math.max(0,d.a.length-n+1);
      const pass=new Array(bs.length).fill(0),closest=new Array(bs.length).fill(Infinity),deficit=new Int32Array(bs.length);
      let minTop5=Infinity,minTop10=Infinity;
      if(!windows){result.push({name:d.name,windows,pass,minTop5:null,minTop10:null,closest:closest.map(()=>null)});continue}
      const f=freq(d.a.slice(0,n));
      // Maintain sorted counts in a 29-entry permutation as the window slides.
      const order=Array.from({length:29},(_,i)=>i).sort((a,b)=>f[b]-f[a]),pos=new Int8Array(29);
      for(let i=0;i<29;i++)pos[order[i]]=i;
      function adjust(x,delta){
        f[x]+=delta;let i=pos[x];
        if(delta===1){while(i>0&&f[order[i-1]]<f[x]){const y=order[i-1];order[i]=y;pos[y]=i;i--}}
        else{while(i<28&&f[order[i+1]]>f[x]){const y=order[i+1];order[i]=y;pos[y]=i;i++}}
        order[i]=x;pos[x]=i;
      }
      for(let k=0;k<windows;k++){
        let s=0,top5=0,top10=0;deficit.fill(0);
        for(let i=0;i<29;i++){
          s+=f[order[i]];if(i===4)top5=s;if(i===9)top10=s;
          for(let j=0;j<bs.length;j++)if(s-bs[j][i]>deficit[j])deficit[j]=s-bs[j][i];
        }
        if(s!==n)throw Error("window count");
        minTop5=Math.min(minTop5,top5);minTop10=Math.min(minTop10,top10);
        for(let j=0;j<bs.length;j++){if(deficit[j]===0)pass[j]++;closest[j]=Math.min(closest[j],deficit[j])}
        if(k%50000===0){const check=cumulative(freq(d.a.slice(k,k+n)));let a=0;for(let i=0;i<29;i++){a+=f[order[i]];if(a!==check[i])throw Error("incremental count mismatch")}}
        if(k+1<windows){const a=d.a[k],b=d.a[k+n];if(a!==b){adjust(a,-1);adjust(b,1)}}
      }
      result.push({name:d.name,windows,pass,minTop5,minTop10,closest});
    }
    return result;
  }
  const chapters=[];
  for(let j=0;j<9;j++){
    const c=corpus.pages.filter(p=>p.page>=starts[j]&&p.page<starts[j+1]).flatMap(p=>p.indices),d=diff(c),bs=periods.map(q=>bound(d,q));
    const windows=windowGate(d.length,bs.map(x=>x.cumulative));
    chapters.push({pages:[starts[j],starts[j+1]-1],length:d.length,periods:periods.map((q,i)=>({q,rankCounts:bs[i].rankCounts,top5:bs[i].cumulative[4],top10:bs[i].cumulative[9],windows:windows.reduce((n,x)=>n+x.windows,0),passingWindows:windows.reduce((n,x)=>n+x.pass[i],0),minimumMaximumDeficit:Math.min(...windows.filter(x=>x.windows).map(x=>x.closest[i]))})),windows});
  }
  let seed=0x31616221;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
  function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  const controls=[];
  for(const q of periods)for(let j=0;j<2;j++){
    const plain=donors[j+1].a.slice(43000+j*20000,43000+j*20000+1432),h=shuffle(Array.from({length:29},(_,i)=>i));
    const m=Array.from({length:q},()=>{const a=new Int8Array(29);for(const o of orbits){const x=shuffle(o.slice());for(let k=0;k<o.length;k++)a[o[k]]=x[k]}return a});
    const c=[rand(29)];for(let i=0;i<plain.length;i++)c.push(mod(c[i]+m[i%q][h[plain[i]]]));
    const b=bound(diff(c),q),p=cumulative(freq(plain));
    if(p.some((x,i)=>x>b.cumulative[i]))throw Error("native control rejected");
    controls.push({q,donor:donors[j+1].name,length:plain.length,trueTop5:p[4],boundTop5:b.cumulative[4],trueTop10:p[9],boundTop10:b.cumulative[9]});
  }
  return {orbits,periods,chapters,controls};
}
console.log(JSON.stringify(run(inputs),null,2));
