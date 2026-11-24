'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/english_wordfreq_textblob.txt"];
const experiment=function(raw){
 const c=JSON.parse(raw[0]),native=JSON.parse(raw[2]),runes=c.runes,mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},inv=x=>{for(let j=1;j<29;j++)if(mod(j*x)===1)return j;throw Error("zero inverse")};
 const parse=t=>t.split(new RegExp("[^"+runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>runes.indexOf(x)));
 const toks=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=t=>(t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let q=toks.find(t=>w.startsWith(t.s,i));assert(q,"unmapped "+w);a.push(q.i);i+=q.s.length}}return a});
 const sig=w=>String.fromCharCode(...w),nw=native.sections.flatMap(s=>parse(s.source_text)),gw=gp(raw[3]);
 const dict=new Set([...gp(raw[4].split(/\r?\n/).map(x=>x.match(/^([a-z]+)\s+[1-9]\d*$/i)?.[1]).filter(Boolean).join(" ")),...nw,...gw.slice(0,Math.floor(gw.length/2))].map(sig));
 const two=new Uint8Array(841);for(const s of dict)if(s.length===2)two[29*s.charCodeAt(0)+s.charCodeAt(1)]=1;
 const allowed=[24,10,3,15,16,23,19,9,20,4]; // A,I,O,S,T,D,M,N,L,R
 const one=new Uint8Array(29);for(const v of allowed)one[v]=1;
 const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rref=(rows,n)=>{let A=rows.map(r=>r.slice()),j=0;for(let k=0;k<n;k++){let i=A.findIndex((r,l)=>l>=j&&r[k]!==0);if(i<0)continue;[A[j],A[i]]=[A[i],A[j]];let u=inv(A[j][k]);A[j]=A[j].map(x=>mod(x*u));for(let l=0;l<A.length;l++)if(l!==j){let a=A[l][k];A[l]=A[l].map((x,m)=>mod(x-a*A[j][m]))}j++}return {A,rank:j}};
 const inverse=M=>{let n=M.length,r=rref(M.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>+(i===j))]),n);assert(r.rank===n,"singular matrix");return r.A.map(a=>a.slice(n))};
 const span=ws=>{let n=0;return ws.map(w=>{let a=n;n+=w.length;return [a,n]})};
 function encrypt(P,M,b,iv){const I=inverse(M);let C=[],prev=iv;for(let i=0;i+3<P.length;i+=4){let z=P.slice(i,i+4).map((p,j)=>mod(p-b[j]+prev[j]));let cur=I.map(a=>dot(a,z));C.push(...cur);prev=cur}return C}
 function decode(C,M,b,iv){let P=[],prev=iv;for(let i=0;i+3<C.length;i+=4){const q=C.slice(i,i+4);P.push(...M.map((r,j)=>mod(dot(r,q)+b[j]-prev[j])));prev=q}return P}
 function fit(C,sp,cut,phase){
  const start=phase,end=start+4*Math.floor((C.length-start)/4),stop=start+4*Math.floor((cut-start)/4);
  const train=sp.filter(([a,b])=>a>=start+4&&b<=stop);
  const singles=Array.from({length:4},()=>[]),pairs=Array.from({length:4},()=>[]);
  for(const [a,b] of train){let j=(a-start)%4;if(b-a===1)singles[j].push(a);if(b-a===2)pairs[j].push(a)}
  function row(i){let j=(i-start)%4;return [...C.slice(i-j,i-j+4),1]}
  function val(k,i){return mod(dot(k,row(i))-C[i-4])}
  const info=[],cand=[];
  for(let lane=0;lane<4;lane++){
   let basis=[],indices=[];
   for(const a of singles[lane]){const z=row(a);if(rref([...basis,z],5).rank>basis.length){basis.push(z);indices.push(a)}if(basis.length===5)break}
   if(basis.length!==5)return {phase,stop,start,end,status:"singleton basis underdetermined",rank:basis.length,lane,singleCounts:singles.map(a=>a.length)};
   const I=inverse(basis),idx=new Set(indices),rest=singles[lane].filter(x=>!idx.has(x)),trans=rest.map(i=>({i,q:Array.from({length:5},(_,j)=>mod(row(i).reduce((s,x,k)=>s+x*I[k][j],0)))}));
   const ks=[],vals=[];
   function visit(v){if(v.length<5){let i=indices[v.length];for(const p of allowed)visit([...v,mod(p+C[i-4])]);return}
    for(const {i,q} of trans)if(!one[mod(dot(q,v)-C[i-4])])return;
    const k=I.map(a=>dot(a,v));if(k.slice(0,4).every(x=>x===0))return;ks.push(k);
   }visit([]);
   cand.push(ks);info.push({indices,singletons:singles[lane].length,candidates:ks.length});
  }
  const pairInfo=[],edges=[];
  // At most one unrecognized two-rune word per lane-pair; allow native OOV.
  for(let j=0;j<4;j++){
    let a=cand[j],b=cand[(j+1)%4],ss=pairs[j];
    const av=a.map(k=>ss.map(i=>val(k,i))),bv=b.map(k=>ss.map(i=>val(k,i+1)));
    let adj=Array.from({length:a.length},()=>[]),cnt=0;
    for(let x=0;x<a.length;x++)for(let y=0;y<b.length;y++){let miss=0;for(let n=0;n<ss.length;n++)if(!two[av[x][n]*29+bv[y][n]]&&++miss>1)break;if(miss<=1){adj[x].push(y);cnt++}}
    edges.push(adj);pairInfo.push({lane:j,words:ss.length,possiblePairs:a.length*b.length,compatiblePairs:cnt})
  }
  let count=0,best=null;
  const score=(P,lo,hi)=>{let total=0,hit=0,singleBad=0,twoBad=0;for(const [a,b] of sp){if(a<lo||b>hi)continue;let w=P.slice(a-start,b-start);total+=w.length;if(dict.has(sig(w)))hit+=w.length;if(w.length===1&&!one[w[0]])singleBad++;if(w.length===2&&!two[29*w[0]+w[1]])twoBad++}return {hit,total,coverage:hit/total,singleBad,twoBad}};
  for(let x=0;x<cand[0].length;x++)for(const y of edges[0][x])for(const z of edges[1][y])for(const w of edges[2][z])if(edges[3][w].includes(x)){
    const K=[cand[0][x],cand[1][y],cand[2][z],cand[3][w]],M=K.map(k=>k.slice(0,4)),b=K.map(k=>k[4]);if(rref(M,4).rank!==4)continue;count++;
    const P=decode(C.slice(start,stop),M,b,[0,0,0,0]),sc=score(P,start+4,stop);
    if(!best||sc.hit>best.train.hit)best={M,b,train:sc};
  }
  if(!best)return {phase,start,stop,end,status:"no invertible compatible key",info,pairInfo,count};
  const ct=C.slice(start,end),P=decode(ct,best.M,best.b,[0,0,0,0]);assert(encrypt(P,best.M,best.b,[0,0,0,0]).join(",")===ct.join(","),"replay");
  return {phase,start,stop,end,status:"candidate",info,pairInfo,count,best,holdout:score(P,stop,end),decoded:P,preview:P.slice(stop-start,stop-start+72).map(x=>c.translit[x]).join(" ")};
 }
 const ow=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,"")),os=span(ow),whole=ow.flat(),source=c.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(whole.join(",")===source.join(",")&&ow.length===2896,"original alignment");
 const begin=c.pages.filter(p=>p.page<16).reduce((s,p)=>s+p.indices.length,0),cut=c.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0)-begin;
 const O=whole.slice(begin),sp=os.filter(([a,b])=>a>=begin).map(([a,b])=>[a-begin,b-begin]);
 const result={allowed:allowed.map(x=>c.translit[x]),dict:dict.size,twoRuneTypes:two.reduce((s,x)=>s+x,0),original:[],plants:[]};
 for(let phase=0;phase<4;phase++){const x=fit(O,sp,cut,phase);delete x.decoded;result.original.push(x)}
 const plants=[{M:[[1,2,3,4],[5,6,7,9],[2,7,4,1],[8,3,11,5]],b:[4,17,2,28],iv:[9,11,4,16]}, {M:[[3,8,1,6],[7,2,11,5],[4,1,8,2],[9,5,2,13]],b:[21,3,11,9],iv:[12,19,4,8]}];
 for(let j=0;j<2;j++){
   // Disjoint word windows, no Gutenberg front/back. Training Gibran prose; sealed exact native GP tail.
   let from=Math.floor(gw.length/2)+j*1700,ws=[],n=0;
   for(const w of gw.slice(from)){if(n+w.length>cut)break;ws.push(w);n+=w.length}
   let trainN=n;ws.push(...nw);const P=ws.flat(),K=plants[j],C=encrypt(P,K.M,K.b,K.iv),S=span(ws),x=fit(C,S,trainN,0);
   let exact=x.decoded?x.decoded.slice(4).filter((v,i)=>v===P[i+4]).length:null,hold=x.decoded?x.decoded.slice(x.stop).filter((v,i)=>v===P[x.stop+i]).length:null;
   delete x.decoded;result.plants.push({name:"Gibran training, native solved tail "+j,trueKey:K,trainN,exact,expected:C.length-4,hold,holdExpected:C.length-x.stop,...x});
 }
 return result
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
