'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(input) {
  const corpus=JSON.parse(input[0]), symbols=corpus.translit;
  const names=new Map(symbols.map((s,i)=>[s,i]));
  const replacements={K:"C",Q:"C",V:"U",Z:"S"};
  function gp(s){const out=[];for(const w of s.toUpperCase().match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){let t=w.slice(i,i+3);if(t==="ING"){out.push(21);i+=3;continue;}t=w.slice(i,i+2);if(t==="IO")t="IA";if(t.length===2&&names.has(t)){out.push(names.get(t));i+=2;continue;}t=replacements[w[i]]||w[i];if(names.has(t))out.push(names.get(t));i++;}}return out;}
  const train=gp(input[1].slice(input[1].indexOf("I. HISTORY."))), aDon=gp(input[2].slice(input[2].indexOf("The Coming of the Ship")>=0?input[2].indexOf("The Coming of the Ship"):input[2].indexOf("THE COMING OF THE SHIP"))), bDon=gp(input[3]);
  const T=Array.from({length:30},()=>Array(29).fill(.5));for(let k=0;k<train.length;k++){T[k?train[k-1]:29][train[k]]++;T[29][train[k]]++;}
  for(const row of T){const z=row.reduce((a,b)=>a+b,0);for(let k=0;k<29;k++)row[k]/=z;}
  let seed=0x2977b055;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
  function enc(p,pad){let t=0;return p.map(x=>x===0?0:(x+pad[t++])%29);}
  const count0=a=>a.filter(x=>x===0).length;
  function randpad(n){return Array.from({length:n},()=>rng(29));}
  function single(c){let dp=Array(30).fill(0);dp[29]=1;for(const z of c){let nd=Array(30).fill(0);for(let a=0;a<30;a++)if(dp[a])for(let x=0;x<29;x++){if(x===0&&z!==0)continue;nd[x]+=dp[a]*T[a][x]*(x===0?29:1);}dp=nd;}return Math.log(dp.reduce((a,b)=>a+b,0));}
  // For each pair of consumed positions, all A holds precede all B holds.
  // This canonicalizes commuting hold events and counts each plaintext pair once.
  function joint(A,B, trace=true){
    const n=A.length,m=B.length,W=m+1, grid=Array((n+1)*W);
    const id=(a,b,h)=>(a*30+b)*2+h;
    const start={s:1,v:0,prev:null,a:-1,b:-1,id:id(29,29,0)};
    grid[0]=new Map([[start.id,start]]);
    let visited=0, arcs=0;
    for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){
      const idx=i*W+j, cell=grid[idx];if(!cell)continue;
      for(const [key,e] of cell){
        visited++;const h=key%2,a=Math.floor(key/60),b=Math.floor(key/2)%30;
        function put(ni,nj,na,nb,nh,w,x,y){
          arcs++;const dest=ni*W+nj,k=id(na,nb,nh);let c=grid[dest];if(!c)grid[dest]=c=new Map();
          const s=e.s*w,v=e.v+Math.log(w);let f=c.get(k);
          if(!f){c.set(k,{s,v,prev:trace?e:null,a:x,b:y,id:k});}
          else{f.s+=s;if(v>f.v){f.v=v;f.prev=trace?e:null;f.a=x;f.b=y;}}
        }
        if(i<n&&A[i]===0&&h===0)put(i+1,j,0,b,0,29*T[a][0],0,-1);
        if(j<m&&B[j]===0)put(i,j+1,a,0,1,29*T[b][0],-1,0);
        if(i<n&&j<m){
          const d=(B[j]-A[i]+29)%29;
          for(let x=1;x<29;x++){const y=(x+d)%29;if(y)put(i+1,j+1,x,y,0,29*T[a][x]*T[b][y],x,y);}
        }else if(i<n){for(let x=1;x<29;x++)put(i+1,j,x,b,0,T[a][x],x,-1);}
        else if(j<m){for(let y=1;y<29;y++)put(i,j+1,a,y,0,T[b][y],-1,y);}
      }
      if(!trace&&idx!==n*W+m)grid[idx]=null;
    }
    const last=grid[n*W+m];let s=0,best=null;for(const e of last.values()){s+=e.s;if(!best||e.v>best.v)best=e;}
    const out={logLR:Math.log(s),logBF:Math.log(s)-single(A)-single(B),maxPosteriorLog:best.v-Math.log(s),visited,arcs};
    if(trace){const a=[],b=[];for(let e=best;e.prev;e=e.prev){if(e.a>=0)a.push(e.a);if(e.b>=0)b.push(e.b);}out.pa=a.reverse();out.pb=b.reverse();const ka=out.pa.flatMap((x,i)=>x?[(A[i]-x+29)%29]:[]),kb=out.pb.flatMap((x,i)=>x?[(B[i]-x+29)%29]:[]);const k=ka.length>=kb.length?ka:kb;if(!ka.every((x,i)=>x===k[i])||!kb.every((x,i)=>x===k[i])||enc(out.pa,k).some((x,i)=>x!==A[i])||enc(out.pb,k).some((x,i)=>x!==B[i]))throw Error("bad replay");out.k=k;out.overlap=Math.min(ka.length,kb.length);}
    return out;
  }
  // Test the canonical hold grammar against exhaustive enumeration on tiny tapes.
  function brute(A,B){let total=0,max=0,count=0;function walk(C,i,p,prev,pr,k,done){if(i===C.length){done(p,k,pr);return;}for(let x=0;x<29;x++){if(x===0&&C[i]!==0)continue;walk(C,i+1,[...p,x],x,pr*T[prev][x],x?[...k,(C[i]-x+29)%29]:k,done);}}
    walk(A,0,[],29,1,[],(p,k,pr)=>walk(B,0,[],29,1,[],(q,l,qr)=>{let z=Math.min(k.length,l.length);if(!k.slice(0,z).every((x,i)=>x===l[i]))return;let v=pr*qr*29**(A.length+B.length-Math.max(k.length,l.length));total+=v;max=Math.max(max,v);count++;}));return {logLR:Math.log(total),maxPosteriorLog:Math.log(max/total),count};}
  let toys=0;for(const [A,B] of [[[0],[0]],[[0,1],[0]],[[1,0],[0,1]],[[0,0],[0]],[[1],[0,0]],[[2],[3]],[[0,1],[2,0]],[[1,0],[2,0]]]){const x=joint(A,B),y=brute(A,B);if(Math.abs(x.logLR-y.logLR)>1e-9||Math.abs(x.maxPosteriorLog-y.maxPosteriorLog)>1e-9)throw Error("toy mismatch "+JSON.stringify({A,B,x,y}));toys++;}
  function score(A,B,trace){const full=joint(A,B,trace),prefix=joint(A.slice(0,40),B.slice(0,40),false);return {full,prefix:prefix.logBF,increment:full.logBF-prefix.logBF};}
  function acc(x,y){return x.reduce((s,v,i)=>s+(v===y[i]),0)/x.length;}
  const plants=[];
  for(let t=0;t<24;t++){
    const a=aDon.slice(300+t*400+rng(150),300+t*400+rng(1)); // offset selected below without coupling to key
    const ia=1000+t*600+rng(300),ib=1000+t*600+rng(300);
    const pa=aDon.slice(ia,ia+179),pb=bDon.slice(ib,ib+75);if(pa.length!==179||pb.length!==75)throw Error("donor too short");
    const k=randpad(179),A=enc(pa,k),B=enc(pb,k);
    let N,tries=0;do{N=enc(pb,randpad(75));if(++tries>20000)throw Error("F-match failed");}while(count0(N)!==count0(B));
    const p=score(A,B,true),neg=score(A,N,false);
    const o=p.full.overlap;
    plants.push({t,ia,ib,actualF:[count0(pa),count0(pb)],cipherF:[count0(A),count0(B)],tries,shared:{bf:p.full.logBF,prefix:p.prefix,increment:p.increment,logMAP:p.full.maxPosteriorLog,accA:acc(p.full.pa,pa),accB:acc(p.full.pb,pb),overlap:o,keyAcc:acc(p.full.k.slice(0,o),k.slice(0,o))},independent:{bf:neg.full.logBF,prefix:neg.prefix,increment:neg.increment}});
  }
  function med(a){let b=[...a].sort((x,y)=>x-y);return (b[(b.length-1)>>1]+b[b.length>>1])/2;}
  const dev=plants.slice(0,8),test=plants.slice(8);const threshold=(med(dev.map(x=>x.shared.increment))+med(dev.map(x=>x.independent.increment)))/2;
  const tp=test.filter(x=>x.shared.increment>threshold).length,tn=test.filter(x=>x.independent.increment<=threshold).length;
  const pass=tp>=15&&tn>=15;
  const A=corpus.pages.find(x=>x.page===53).indices,B=corpus.pages.find(x=>x.page===55).indices.slice(1);
  if(A.length!==179||B.length!==75)throw Error("page geometry");
  const result={trainRunes:train.length,donors:[aDon.length,bDon.length],toys,threshold,tp,tn,pass,plants,originalCipherF:[count0(A),count0(B)],unpairedMinimum:A.length-count0(A)-B.length,original:null};
  if(pass){const x=score(A,B,true);result.original={bf:x.full.logBF,prefix:x.prefix,increment:x.increment,logMAP:x.full.maxPosteriorLog,overlap:x.full.overlap,pa:x.full.pa,pb:x.full.pb,key:x.full.k};}
  return result;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const input=paths.map((p,i)=>{const x=fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');return i?x.split(/\r?\n/).slice(0,2000).join('\n'):x;});
console.log(JSON.stringify(experiment(input),null,2));
