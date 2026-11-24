'use strict';
// Agent17 #2635: exact reciprocal Porta q8 active alphabet gate.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,gold,raws){
  const assert=(v,m)=>{if(!v)throw Error(m)},mod=(x,n)=>(x%n+n)%n,Q=8,H=14;
  function porta(x,k,h){return x<h?h+mod(x+k,h):mod(x-h-k,h);}
  const latin="ABCDEFGHIJKLMNOPQRSTUVWXYZ", kat=[..."SENDSUPP"].map((x,i)=>latin[porta(latin.indexOf(x),Math.floor(latin.indexOf("EAST"[i%4])/2),13)]).join("");
  assert(kat==="DREZDHGG","1938 Fig. 95 KAT");
  const decode=(x,k)=>x===0?0:1+porta(x-1,k,H);
  for(let k=0;k<H;k++)for(let x=0;x<29;x++){const p=decode(x,k);assert(decode(p,k)===x&&(!x?!p:(x<=14)!==(p<=14)),"reciprocity/half exchange");}
  const idx=new Map(corpus.runes.map((r,i)=>[r,i])),C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  const words=[];let w=[],start=0,pos=0;
  for(const ch of transcript.split("%").slice(0,55).join("%")){if(idx.has(ch)){if(!w.length)start=pos;w.push(idx.get(ch));pos++;}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push({start,w});w=[];}}
  if(w.length)words.push({start,w});
  assert(C.length===12956&&words.length===2896&&words.flatMap(x=>x.w).every((x,i)=>x===C[i])&&pos===C.length,"source parity");
  const bounds=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  function counts(P){let f=0,l=0,h=0,rare=0,e=0,t=0,prev=-1;for(const p of P){if(!p){f++;continue;}const b=Number(p>14);if(b)h++;else l++;if(prev>=0&&b!==prev)t++;prev=b;if(p===11||p===12)rare++;if(p===18)e++;}return {n:P.length,f,l,h,rare,e,t};}
  function transform(P,K){let j=0;return P.map(p=>p?decode(p,K[j++%Q]):0);}
  function gate(c,singletons=[]){
    let j=0;const rows=Array.from({length:Q},()=>Array(29).fill(0)),D=Array(Q).fill((1<<H)-1),sing=new Set(singletons);
    const nativeSingle=[24,10,3,16];let forcedBadSingleton=false;
    for(let i=0;i<c.length;i++){const x=c[i];if(!x){if(sing.has(i))forcedBadSingleton=true;continue;}const phase=j++%Q;rows[phase][x]++;if(sing.has(i))for(let k=0;k<H;k++)if(!nativeSingle.includes(decode(x,k)))D[phase]&=~(1<<k);}
    const values=rows.map(row=>Array.from({length:H},(_,k)=>{let rare=0,e=0;for(let x=1;x<29;x++){const p=decode(x,k);if(p===11||p===12)rare+=row[x];if(p===18)e+=row[x];}return {rare,e};}));
    const a=counts(c),minRare=values.reduce((s,r)=>s+Math.min(...r.map(x=>x.rare)),0),maxE=values.reduce((s,r)=>s+Math.max(...r.map(x=>x.e)),0);
    const phaseSizes=D.map(d=>Array.from({length:H},(_,i)=>Number(!!(d&(1<<i)))).reduce((x,y)=>x+y,0));
    return {n:c.length,f:a.f,plainLow:a.h,plainHigh:a.l,transitions:a.t,minRare,maxE,singletons:singletons.length,forcedBadSingleton,phaseSizes,singletonKeys:(forcedBadSingleton?0n:phaseSizes.reduce((a,b)=>a*BigInt(b),1n)).toString()};
  }
  function pref(a){
    const n=a.length, p=Array.from({length:5},()=>new Int32Array(n+1)), next=new Int32Array(n+1), changes=new Uint8Array(n);let prev=-1;
    for(let i=0;i<n;i++){const x=a[i];const b=x?Number(x>14):-1;const t=b>=0&&prev>=0&&b!==prev;changes[i]=Number(t);if(b>=0)prev=b;const v=[Number(!x),Number(x>0&&x<=14),Number(x===11||x===12),Number(x===18),Number(t)];for(let k=0;k<5;k++)p[k][i+1]=p[k][i]+v[k];}
    next[n]=n;for(let i=n-1;i>=0;i--)next[i]=a[i]?i:next[i+1];
    return {a,p,next,changes};
  }
  function compare(d,g){
    const {a,p,next,changes}=d,n=g.n;let windows=0,rarePass=0,ePass=0,rareEPass=0,halfPass=0,halfTransPass=0,allPass=0,maxRare=0,minE=Infinity;
    for(let i=0;i+n<=a.length;i++){const j=i+n;windows++;const f=p[0][j]-p[0][i],l=p[1][j]-p[1][i],r=p[2][j]-p[2][i],e=p[3][j]-p[3][i];const t=p[4][j]-p[4][i]-(next[i]<j?changes[next[i]]:0);maxRare=Math.max(maxRare,r);minE=Math.min(minE,e);const rr=r>=g.minRare,ee=e<=g.maxE,hh=f===g.f&&l===g.plainLow;rarePass+=Number(rr);ePass+=Number(ee);rareEPass+=Number(rr&&ee);halfPass+=Number(hh);halfTransPass+=Number(hh&&t===g.transitions);allPass+=Number(rr&&ee&&hh&&t===g.transitions);}
    return {windows,rarePass,ePass,rareEPass,halfPass,halfTransPass,allPass,maxRare,minE:windows?minE:null};
  }
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function gp(raw,cal){const out=[];for(const word of raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){if(cal&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}if(cal&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>word.startsWith(x.s,i));assert(t,"GP encoding");out.push(t.i);i+=t.s.length;}}return out;}
  assert(JSON.stringify(gp("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true))===JSON.stringify(corpus.pages[57].indices),"p57 native KAT");
  const donors=[];for(let j=0;j<raws.length;j++)for(const cal of [false,true]){const a=gp(raws[j],cal);assert(a.length===[[63114,62492],[218800,217106],[324630,321327]][j][Number(cal)],"donor length");donors.push({name:["Gibran","Shakespeare","Emerson"][j]+(cal?" calibrated":" greedy"),...pref(a)});}
  const native=gold.sections.map(s=>({name:s.name,...pref([...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)))}));
  assert(native.reduce((s,x)=>s+x.a.length,0)===2979,"native length");
  const scopes=[{name:"whole",s:0,e:C.length},...bounds.slice(0,-1).map((s,i)=>({name:"chapter"+(i+1),s,e:bounds[i+1]}))];
  function aggregate(rows){const o={windows:0,rarePass:0,ePass:0,rareEPass:0,halfPass:0,halfTransPass:0,allPass:0,maxRare:0,minE:null};for(const r of rows){for(const k of ["windows","rarePass","ePass","rareEPass","halfPass","halfTransPass","allPass"])o[k]+=r[k];o.maxRare=Math.max(o.maxRare,r.maxRare);if(r.minE!==null)o.minE=o.minE===null?r.minE:Math.min(o.minE,r.minE);}return o;}
  const original=scopes.map(({name,s,e})=>{const g=gate(C.slice(s,e),words.filter(w=>w.w.length===1&&w.start>=s&&w.start<e).map(w=>w.start-s));const byDonor=donors.map(d=>({name:d.name,...compare(d,g)})),byNative=native.map(d=>({name:d.name,...compare(d,g)}));return {name,...g,literary:aggregate(byDonor),native:aggregate(byNative),byDonor,byNative};});
  // Positive controls: known native rune sections not used to choose any key; and full-length independent literary windows.
  const keys=[[2,11,0,7,5,13,3,9],[13,0,12,1,11,2,10,3],[6,8,3,1,12,0,10,4]];
  const plants=[native[1],native[3],...donors.filter((_,i)=>i%2===1)].map((d,i)=>{const p=d.a.slice(0,Math.min(12956,d.a.length)),K=keys[i%keys.length],c=transform(p,K),g=gate(c),q=transform(c,K),z=compare(pref(p),g);assert(q.every((x,j)=>x===p[j])&&z.allPass===1,"exact planted inverse and gate");return {name:d.name,n:p.length,key:K,exact:q.length,minRare:g.minRare,maxE:g.maxE,actual:counts(p),allPass:z.allPass};});
  return {kat,sourceLength:C.length,sourceGroups:words.length,bounds,original,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),a[1],JSON.parse(a[2]),a.slice(3)),null,2));
