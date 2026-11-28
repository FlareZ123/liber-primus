"use strict";
// Agent10 #3301: historical 14/7 row alignment, one stationary GP29 digraph bijection.
// Run from checkout: node sims/lp2_alternating_14_7_pair_alignment_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function main(book,donors){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const orders=[[2,8,9,1,12,13,11,4,5,7,3,0,6,10],[0,6,2,5,1,4,3]];
  const nativeTokens=book.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  /** @param {string} text */
  function native(text){return (text.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];while(w.length){const t=nativeTokens.find(([s])=>w.startsWith(s));check(t,"unknown letter "+w);a.push(t[1]);w=w.slice(t[0].length)}return a})}
  /** @param {number} n */
  function alignment(n){let p=[];for(let start=0,k=0;start<n;k++){let o=orders[k%2];check(start+o.length<=n,"partial frame unsupported");for(const j of o)p.push(start+j);start+=o.length;}check(new Set(p).size===n,"nonbijective alignment");return p}
  const take=(a,p)=>p.map(i=>a[i]);
  function untake(a,p){let b=Array(a.length);p.forEach((v,i)=>b[v]=a[i]);return b}
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const pair=a=>Array.from({length:a.length/2},(_,i)=>29*a[2*i]+a[2*i+1]);
  const unpair=b=>b.flatMap(x=>[Math.floor(x/29),x%29]);
  function profile(b){let h=Array(b.length+1).fill(0),c=new Int32Array(841);for(let x of b)c[x]++;for(const x of c)h[x]++;return {h,distinct:841-h[0],max:h.findLastIndex(x=>x>0)}}
  function partial(a,b){let f=new Int16Array(841).fill(-1),g=new Int16Array(841).fill(-1);for(let i=0;i<a.length;i++){let x=a[i],y=b[i];if((f[x]>=0&&f[x]!==y)||(g[y]>=0&&g[y]!==x))return false;f[x]=y;g[y]=x}return true}
  // Exactly all contiguous native windows, including both start parities.
  function scan(tape,b){
    let n=b.length,th=profile(b).h,windows=0,profileMatches=0,alignedMatches=0,distinctMin=841,distinctMax=0,maxMin=Infinity,maxMax=0,minHistogramL1=Infinity,bestOffset=null;
    let exampleMatches=[];
    for(let parity of [0,1]){
      const a=pair(tape.slice(parity,parity+2*Math.floor((tape.length-parity)/2)));
      if(a.length<n)continue;
      let count=new Int32Array(841),h=Array(n+1).fill(0);for(let i=0;i<n;i++)count[a[i]]++;for(let c of count)h[c]++;
      let d=h.reduce((s,v,i)=>s+Math.abs(v-th[i]),0),largest=h.findLastIndex(x=>x>0);
      const bump=(bin,delta)=>{let old=count[bin],next=old+delta;d-=Math.abs(h[old]-th[old])+Math.abs(h[next]-th[next]);h[old]--;h[next]++;d+=Math.abs(h[old]-th[old])+Math.abs(h[next]-th[next]);count[bin]=next;largest=Math.max(largest,next);while(!h[largest])largest--;};
      for(let i=0;i+n<=a.length;i++){
        windows++;let distinct=841-h[0];distinctMin=Math.min(distinctMin,distinct);distinctMax=Math.max(distinctMax,distinct);maxMin=Math.min(maxMin,largest);maxMax=Math.max(maxMax,largest);
        if(d<minHistogramL1){minHistogramL1=d;bestOffset=2*i+parity;}
        if(d===0){profileMatches++;if(partial(a.slice(i,i+n),b)){alignedMatches++;if(exampleMatches.length<5)exampleMatches.push(2*i+parity);}}
        if(i+n<a.length){bump(a[i],-1);bump(a[i+n],1);}
      }
    }
    check(windows===Math.max(0,tape.length-2*n+1),"window enumeration mismatch");
    return {windows,profileMatches,alignedMatches,distinctRange:[distinctMin,distinctMax],maxRange:[maxMin,maxMax],minHistogramL1,bestOffset,exampleMatches};
  }
  // Historical row permutations themselves, with complete known outputs.
  const row=(s,o)=>{let a=[];for(let i=0;i<s.length;i+=o.length)for(let j of o)a.push(s[i+j]);return a.join("")};
  const h14=["IDGTKUMLOOARWO","ERTHISUTETLHUT","IATSLLOUIMNITE","LNJ7TFYVOIUAUS","NOCO5JI4MEODZZ"].join("");
  check(row(h14,orders[0])==="GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO","historic14");
  const h7="TL BE IE OV UT HT RE ID TS EO ST PO SO YR SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M".replace(/\s/g,"");
  check(row(h7,orders[1])==="TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133","historic7");
  const tapes=donors.map(([name,t])=>[name,native(name==="LP1"?t.split("\n").filter(l=>!l.startsWith("#")).join("\n"):t)]);
  let seed=0x3301ab10;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;return seed%n;}
  const output={historicalControls:[70,56],frameOrders:orders,scopes:[],plants:[]};
  for(const [first,last,expected] of [[33,39,1680],[54,55,308]]){
    const pages=book.pages.filter(p=>p.page>=first&&p.page<=last),c=pages.flatMap(p=>p.indices);check(c.length===expected,"original length");const p=alignment(c.length),logical=take(c,p),b=pair(logical),pr=profile(b);
    check(eq(untake(logical,p),c),"original position roundtrip");
    let seam=0,pageSeams=[];for(const page of pages.slice(0,-1)){seam+=page.indices.length;pageSeams.push({after:page.page,offset:seam,cycleOffset:seam%21})}
    const stats={pages:[first,last],length:c.length,pageSeams,originalPairDistinct:pr.distinct,originalPairMax:pr.max,originalFrequencyOfFrequencies:pr.h.filter((_,i)=>i<=pr.max),logicalTape:logical,donors:tapes.map(([name,t])=>({name,runeCount:t.length,...scan(t,b)}))};
    output.scopes.push(stats);
    for(const [name,t] of tapes){if(t.length<c.length)continue;let at=rnd(t.length-c.length+1),plain=t.slice(at,at+c.length),pb=pair(plain),perm=Array.from({length:841},(_,i)=>i);for(let i=840;i>0;i--){let j=rnd(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}
      let inv=Array(841);perm.forEach((v,i)=>inv[v]=i);let planted=untake(unpair(pb.map(x=>perm[x])),p),recovered=pair(take(planted,p));check(eq(profile(recovered).h,profile(pb).h),"plant spectrum");check(partial(pb,recovered),"plant partial bijection");check(eq(unpair(recovered.map(x=>inv[x])),plain),"plant exact inverse");
      let test=scan(t,recovered);check(test.profileMatches>=1&&test.alignedMatches>=1,"planted window false rejection");output.plants.push({pages:[first,last],name,offset:at,runes:plain.length,profileMatches:test.profileMatches,alignedMatches:test.alignedMatches,oracleExact:true});
    }
  }
  return output;
}
const data=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(main(JSON.parse(data[0]),[["LP1",data[1]],["Gibran",data[2]],["Shakespeare",data[3]],["Emerson",data[4]]]),null,2));
