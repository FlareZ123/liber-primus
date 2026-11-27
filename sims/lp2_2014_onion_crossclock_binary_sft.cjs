"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(t,u,c,reference){
  const assert=(condition,msg)=>{if(!condition)throw Error(msg);};
  const sum=a=>a.reduce((s,x)=>s+x,0);
  const mod=x=>(x%29+29)%29;
  const pack=(a,w)=>Array.from({length:Math.floor(a.length/w)},(_,i)=>parseInt(a.slice(i*w,i*w+w).join(""),2));
  const hex=a=>a.map(x=>x.toString(16).padStart(2,"0")).join("");
  const printable=a=>a.filter(x=>x>=32&&x<127).length;
  const pop=x=>x.toString(2).replace(/0/g,"").length;
  const gapBits=k=>k.flatMap(v=>{assert(Number.isInteger(v)&&v>0,"positive interval");return Array(v-1).fill(0).concat(1);});
  const k2=[...t.five_minute_units_A_positions_143_189,2,4,...t.five_minute_units_B_positions_192_256];
  const m=gapBits(k2);
  const bytes=u.hex.match(/../g).map(x=>parseInt(x,16)).slice(16);
  assert(m.length===240&&bytes.length===240,"source span");
  let p=u.rows[0];const known=new Map(),dups=[],gaps=[],clean=[p];
  for(const x of u.rows.slice(1)){
    const d=(Date.parse(x.ts)-Date.parse(p.ts))/1000;
    assert(d===x.delta,"timestamp delta");
    if(x.length===p.length){dups.push([x.length,d]);continue;}
    if(x.length===p.length+1&&Math.abs(d-Math.round(d/60)*60)<=2)known.set(x.length,Math.round(d/60)%2);
    else gaps.push([p.length,x.length,d]);
    clean.push(x);p=x;
  }
  const unknown=Array.from({length:240},(_,i)=>i+17).filter(n=>!known.has(n));
  assert(unknown.join(",")==="133,134,135,181,182","unknown parity positions");
  const inspect=v=>{const b=pack(v,8),w=pack(v,5);return {hex:hex(b),printable:printable(b),invalid:w.filter(x=>x>=29).length};};
  const cross=[];
  for(let mask=0;mask<1<<unknown.length;mask++){
    const x=new Map(known);for(let i=0;i<unknown.length;i++)x.set(unknown[i],mask>>i&1);
    if((x.get(181)^x.get(182))!==1)continue;
    cross.push({mask,...inspect(m.map((b,i)=>b^x.get(i+17)))});
  }
  const byteOps={low:bytes.map(x=>x&1),high:bytes.map(x=>x>>7),parity:bytes.map(x=>pop(x)%2)};
  const fixed=Object.entries(byteOps).map(([name,b])=>({name,...inspect(m.map((x,i)=>x^b[i]))}));
  const msg="THE SOURCE MASK IS REVERSIBLE!";
  assert(msg.length===30,"plant length");
  const plantBits=[...msg].flatMap(x=>Array.from({length:8},(_,i)=>x.charCodeAt(0)>>(7-i)&1));
  const plantedBytes=bytes.map((v,i)=>(v&254)|(m[i]^plantBits[i]));
  assert(hex(pack(m.map((x,i)=>x^(plantedBytes[i]&1)),8))===hex([...msg].map(x=>x.charCodeAt(0))),"cross mask plant");
  const segment=clean.filter(x=>x.length>=17&&x.length<=120);
  assert(segment.length===104&&segment.every(x=>Math.abs(x.delta-180*Math.round(x.delta/180))<=2),"3m segment");
  const bits=gapBits(segment.map(x=>Math.round(x.delta/180))),pad=pack(bits,5);
  assert(bits.length===425&&pad.length===85&&pad.every(x=>x<29),"first segment cells");
  let dp=Array(105).fill(0n);dp[0]=1n;
  for(let i=0;i<85;i++){
    const counts=Array(6).fill(0);
    for(let x=0;x<29;x++)if(i!==84||(x&1))counts[pop(x)]++;
    const next=Array(105).fill(0n);
    for(let j=0;j<=104;j++)for(let k=0;k<=5&&j+k<=104;k++)next[j+k]+=dp[j]*BigInt(counts[k]);
    dp=next;
  }
  const choose=(n,k)=>{let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n-i+1)/BigInt(i);return a;};
  const prob=Number(dp[104])/Number(choose(424,103));
  const toks=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
  const encode=s=>s.toUpperCase().match(/[A-Z]+/g).flatMap(word=>{
    let w=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),out=[];
    while(w){if(w.startsWith("ING")){out.push(21);w=w.slice(3);continue;}if(w.startsWith("IO")){out.push(27);w=w.slice(2);continue;}const hit=toks.find(([t])=>w.startsWith(t));assert(hit,"unmapped "+w);out.push(hit[1]);w=w.slice(hit[0].length);}return out;
  });
  const p56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
  const p57=c.pages[57].indices;
  const primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
  let pos=0;assert(p56.length===85&&p56.every((x,i)=>(x===0?0:mod(x+primes[pos++]-1))===c.pages[56].indices[i]),"authentic p56");
  assert(pos===84,"one F hold");
  const train=encode(reference.split(/^###\s+(?:56|57)\b/m)[0].split("\n").filter(l=>!l.startsWith("#")&&!l.startsWith("[")&&!l.startsWith("(")&&/[A-Z]/.test(l)&&l===l.toUpperCase()).join(" "));
  const uni=Array(29).fill(.25),bi=Array.from({length:29},()=>Array(29).fill(.25)),tri=Array.from({length:841},()=>Array(29).fill(.25));
  for(let i=0;i<train.length;i++){uni[train[i]]++;if(i)bi[train[i-1]][train[i]]++;if(i>1)tri[29*train[i-2]+train[i-1]][train[i]]++;}
  const norm=a=>{const s=sum(a);return a.map(x=>x/s);};
  const U=norm(uni),B=bi.map(norm),T=tri.map(norm);
  const ll=(a,b,x)=>Math.log(a<0?(b<0?U[x]:.8*B[b][x]+.2*U[x]):.65*T[a*29+b][x]+.25*B[b][x]+.10*U[x]);
  const score=x=>sum(x.map((v,i)=>ll(x[i-2]??-1,x[i-1]??-1,v)))/x.length;
  const encodeWith=(p,sign,hold)=>{let k=0;return p.map(x=>hold&&x===0?0:mod(x+sign*pad[k++%85]));};
  const decode=(cipher,sign,hold)=>{
    let states=new Map([["0,-1,-1",{phase:0,a:-1,b:-1,ll:0,node:null,count:1n}]]);
    for(const y of cipher){
      const next=new Map();
      for(const st of states.values()){
        const add=(x,phase)=>{
          const key=`${phase},${st.b},${x}`,v=st.ll+ll(st.a,st.b,x),old=next.get(key),count=st.count+(old?.count??0n);
          if(!old||v>old.ll)next.set(key,{phase,a:st.b,b:x,ll:v,node:{x,prev:st.node},count});
          else old.count=count;
        };
        if(hold&&y===0)add(0,st.phase);
        const x=mod(y-sign*pad[st.phase]);if(!hold||x!==0)add(x,(st.phase+1)%85);
      }
      states=next;if(!states.size)return null;
    }
    let best=null,count=0n;
    for(const st of states.values()){count+=st.count;if(!best||st.ll>best.ll)best=st;}
    const out=[];for(let n=best.node;n;n=n.prev)out.push(n.x);out.reverse();
    assert(encodeWith(out,sign,hold).every((x,i)=>x===cipher[i]),"roundtrip");
    return {score:best.ll/out.length,plaintext:out,paths:count.toString()};
  };
  const plants=[],original=[],full=[];
  for(const sign of [1,-1])for(const hold of [false,true]){
    for(const [page,p] of [[56,p56],[57,p57]]){
      const planted=encodeWith(p,sign,hold),d=decode(planted,sign,hold);
      assert(d,"plant has path");
      plants.push({page,sign,hold,matches:d.plaintext.filter((v,i)=>v===p[i]).length,n:p.length,paths:d.paths});
    }
    const control=encodeWith(p56,sign,hold);
    const match=control.filter((v,i)=>v===c.pages[56].indices[i]).length;
    const all=c.pages.slice(0,56).flatMap(p=>p.indices);
    const d=decode(all,sign,hold);
    full.push({sign,hold,controlMatches:match,score:d?.score??null,paths:d?.paths??"0",preview:d?.plaintext.slice(0,100).map(x=>c.translit[x]).join("")??null});
    for(const p of c.pages.slice(0,56)){
      if(!p.indices.length)continue;
      const d=decode(p.indices,sign,hold);
      original.push({page:p.page,sign,hold,score:d?.score??null,paths:d?.paths??"0",preview:d?.plaintext.slice(0,100).map(x=>c.translit[x]).join("")??null});
    }
  }
  const sorted=original.filter(x=>x.score!==null).sort((a,b)=>b.score-a.score);
  return {cross:{dups,gaps,known:known.size,unknown,variants:cross.length,minInvalid:Math.min(...cross.map(x=>x.invalid)),maxPrintable:Math.max(...cross.map(x=>x.printable)),cross,fixed,inversionPrintable:printable(bytes.map((x,i)=>x^(255*m[i]))),selected:[0,1].map(v=>[v,bytes.filter((x,i)=>m[i]===v).length,printable(bytes.filter((x,i)=>m[i]===v))]),unconfirmedSlots:sum(k2.slice(0,9)),plant:true},segment:{bits:bits.length,ones:sum(bits),pad,zeros:pad.filter(x=>x===0).length,conditionalAllLegalProbability:prob},training:train.length,controls:{p56:score(p56),p57:score(p57),raw:score(c.pages.slice(0,56).flatMap(p=>p.indices))},plants,full,originalCount:original.length,legalCount:sorted.length,best:sorted.slice(0,10),original};
}
const files=["resources/external/2014-onion2-timing-tail-v1.json","resources/external/2014-third-onion-timing.json","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp1-plaintext-reference.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),JSON.parse(data[2]),data[3]),null,2));
