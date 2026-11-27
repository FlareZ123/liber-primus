"use strict";
function run(inputs,width=512,steps=120){
 const gp=JSON.parse(inputs[0]),tr=inputs[1],ink=JSON.parse(inputs[2]),mod=x=>(x+29)%29,tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),R=new Map(gp.runes.map((r,i)=>[r,i]));
 function words(s){return(s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}return out})}
 function body(s,a,b){let i=s.indexOf(a),j=s.indexOf(b,i);if(i<0||j<i)throw Error("source boundaries");return s.slice(i,j)}
 let ds=[words(body(inputs[3],"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet")),words(inputs[4]),words(body(inputs[5],"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))],train=ds.map(w=>w.slice(0,Math.floor(w.length*.65)));
 const off=[0,1,30,871],sizes=[1,29,841,24389],N=25260,counts=new Uint32Array(N*29),tot=new Uint32Array(N),probs=new Float64Array(N*29),ll=new Float64Array(N*29),next=new Uint16Array(N*29);
 for(let x of train.map(w=>w.flat()))for(let i=0;i<x.length;i++){let code=0;for(let l=0;l<=Math.min(i,3);l++){if(l>0)code=x[i-l]*29**(l-1)+code;const r=off[l]+code;counts[r*29+x[i]]++;tot[r]++}}
 for(let l=0;l<=3;l++)for(let a=0;a<sizes[l];a++){let r=off[l]+a,back=l===0?-1:off[l-1]+a%sizes[l-1],prior=l===0?14.5:8;for(let p=0;p<29;p++){let ix=r*29+p;probs[ix]=(counts[ix]+prior*(l===0?1/29:probs[back*29+p]))/(tot[r]+prior);ll[ix]=Math.log(29*probs[ix]);next[ix]=l<3?off[l+1]+a*29+p:off[3]+(a%841)*29+p}}
 const q=Array.from(probs.slice(0,29)),roots=new Map(),nodes=[];
 function node(root,parent=-1,p=-1){let i=nodes.length;nodes.push({root,parent,p,mass:0,child:new Int32Array(29).fill(-1),fallback:parent<0?1:nodes[parent].fallback*q[p]});return i}
 function add(w,count){if(!w.length||w.length>30)return;let root=roots.get(w.length);if(root===undefined){root=node(nodes.length);roots.set(w.length,root)}let t=root;nodes[t].mass+=count;for(let p of w){if(nodes[t].child[p]<0)nodes[t].child[p]=node(root,t,p);t=nodes[t].child[p];nodes[t].mass+=count}}
 for(let line of inputs[6].split(/\r?\n/)){let m=line.match(/^([a-z]+)\s+(\d+)$/);if(m)add(words(m[1])[0],Math.sqrt(+m[2]))}
 for(let w of train)for(let p of w)add(p,1);
 const epsilon=.025,lexNext=new Int32Array(nodes.length*29),lexLL=new Float32Array(nodes.length*29),fallbackLL=q.map(p=>Math.log(29*p));
 function mass(n){return(1-epsilon)*n.mass/nodes[n.root].mass+epsilon*n.fallback}
 for(let i=0;i<nodes.length;i++){let n=nodes[i],m=mass(n);for(let p=0;p<29;p++){let k=n.child[p],a=i*29+p;lexNext[a]=k;lexLL[a]=Math.log(29*(k>=0?mass(nodes[k]):epsilon*n.fallback*q[p])/m)}}
 function stream(ws){let C=[],root=[],ending=[],ids=[];for(let wi=0;wi<ws.length;wi++){let w=ws[wi];for(let i=0;i<w.length;i++){C.push(w[i]);root.push(roots.get(w.length)??-1);ending.push(i===w.length-1);ids.push(wi)}}return {C,root,ending,ids}}
 function step(S,o,p){let [i,r,n,z,h]=o;if(i>=S.C.length)return null;let score=z+ll[r*29+p]+.75*(n<0?fallbackLL[p]:lexLL[n*29+p]);let nn=S.ending[i]?(S.root[i+1]??-1):n<0?-1:lexNext[n*29+p];return [i+1,next[r*29+p],nn,score,h]}
 function decode(S,mode,K=null,cap=width){
  const n=S.length;let beam=[{o:S.map(x=>[0,0,x.root[0]??-1,0,0]),s:0,parent:null,k:-1}],expanded=0,pruned=0,peak=0;
  for(let t=0;t<steps;t++){let best=new Map();
   for(let b of beam){
    let options=S.map((x,j)=>{let o=b.o[j].slice();o[3]=0;o[4]=0;let a=[];while(o[0]<x.C.length){a.push(o);if(mode!=="fhold"||x.C[o[0]]!==0)break;let v=step(x,o,0);v[4]=o[4]+1;o=v}return a});
    if(options.some(x=>!x.length))continue;let ar=[];
    function rec(j){if(j<n){for(let o of options[j]){ar[j]=o;rec(j+1)}return}
     for(let k=K?K[t]:0;k<(K?K[t]+1:29);k++){let ps=[],os=[],hs=[],score=b.s,ok=true;for(let j=0;j<n;j++){let o=ar[j],p=mod(S[j].C[o[0]]-k);if(mode==="fhold"&&p===0){ok=false;break}let v=step(S[j],o,p);if(!v){ok=false;break}score+=v[3];ps.push(p);hs.push(o[4]);os.push(v)}
      if(!ok)continue;expanded++;let code=os.map(o=>o.slice(0,3).join(",")).join(";"),prev=best.get(code);if(!prev||score>prev.s)best.set(code,{o:os,s:score,parent:b,k,ps,hs})}
    }rec(0);
   }
   peak=Math.max(peak,best.size);if(!best.size)return{possible:false,failedAt:t,expanded,pruned,peak};beam=[...best.values()].sort((a,b)=>b.s-a.s);pruned+=Math.max(0,beam.length-cap);beam.length=Math.min(cap,beam.length)
  }
  const top=beam[0],chain=[];for(let b=top;b.parent;b=b.parent)chain.push(b);chain.reverse();let key=chain.map(b=>b.k),P=S.map((_,j)=>chain.flatMap(b=>Array(b.hs[j]).fill(0).concat(b.ps[j])));for(let j=0;j<n;j++){let k=0,re=P[j].map(p=>mode==="fhold"&&!p?0:mod(p+key[k++]));if(k!==steps||String(re)!==String(S[j].C.slice(0,re.length)))throw Error("replay")}
  return{possible:true,key,P,score:top.s/P.reduce((a,p)=>a+p.length,0),margin:beam.length>1?top.s-beam[1].s:null,expanded,pruned,peak}
 }
 function fromPage(){let by=new Map();for(let s of tr.split("%").map(x=>x.trim()).filter(Boolean)){let c=[...s].filter(x=>R.has(x)).map(x=>R.get(x));let p=gp.pages.find(x=>String(x.indices)===String(c));if(!p)throw Error("page mismatch");by.set(p.page,s)}function section(a,b,start,end){let s=[];for(let p=a;p<=b;p++)if(by.has(p))s.push(by.get(p));let w=s.join("").replace(/\/\s*/g,"").split(/[^ᚠ-ᛡ]+/).filter(Boolean).map(x=>[...x].map(r=>R.get(r))),flat=w.flat(),expect=gp.pages.slice(a,b+1).flatMap(p=>p.indices);if(String(flat)!==String(expect))throw Error("section");let pos=0,ret=[];for(let x of w){let lo=pos,hi=pos+x.length;if(lo>=start&&hi<=end)ret.push(x);pos=hi}if(String(ret.flat())!==String(expect.slice(start,end)))throw Error("marker not word boundary");return ret}
  let endB=gp.pages.slice(38,50).flatMap(p=>p.indices).length,endC=gp.pages.slice(51,54).flatMap(p=>p.indices).length;return[section(36,38,99,238+228+186),section(38,49,186,endB),section(51,53,0,endC)]
 }
 let original=fromPage(),seed=3157001;function rand(m){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%m}
 function fmt(x,S,truth,key){if(!x||!x.possible)return x;let r={...x,render:x.P.map((p,j)=>p.map((v,i)=>gp.translit[v]+(S[j].ending[i]?" ":"")).join(""))};if(truth){r.correct=x.P.map((p,j)=>p.filter((v,i)=>v===truth[j][i]).length);r.lengths=x.P.map(p=>p.length);r.keyCorrect=x.key.filter((v,i)=>v===key[i]).length}return r}
 function test(mode,kind,trial){let P=ds.map((w,j)=>w.slice(Math.floor(w.length*.72)+trial*173+j*47,Math.floor(w.length*.72)+trial*173+j*47+100));let K=Array.from({length:3},()=>Array.from({length:600},()=>rand(29)));if(kind==="shared")K[1]=K[2]=K[0];if(kind==="independent")K[2]=K[0];if(kind==="near"){K[1]=K[0].slice(0,70).concat(K[1].slice(70));K[2]=K[0]}
  let C=P.map((w,j)=>{let k=0;return w.map(x=>x.map(p=>mode==="fhold"&&p===0?0:mod(p+K[j][k++])))});
  let S=C.map(stream),fit=decode(S.slice(0,2),mode),held=fit.possible?decode(S.slice(2),mode,fit.key,2048):null;return {mode,kind,trial,fit:fmt(fit,S.slice(0,2),P.slice(0,2).map(x=>x.flat()),K[0]),held:fmt(held,S.slice(2),P.slice(2).map(x=>x.flat()),K[2])}}
 let controls=[],out=[];for(let mode of ["ordinary","fhold"]){let c=[test(mode,"shared",0),test(mode,"shared",1),test(mode,"independent",2),test(mode,"near",3)];controls.push(...c);let passed=c.slice(0,2).every(x=>x.fit?.keyCorrect===steps&&x.held?.correct?.[0]===x.held?.lengths?.[0])&&c.slice(2).every(x=>!x.held?.possible||x.held.correct[0]!==x.held.lengths[0]);if(!passed){out.push({mode,passed:false});continue}let S=original.map(stream),fit=decode(S.slice(0,2),mode),held=fit.possible?decode(S.slice(2),mode,fit.key,2048):null;out.push({mode,passed:true,fit:fmt(fit,S.slice(0,2)),held:fmt(held,S.slice(2))})}
 return {width,steps,training:train.map(x=>x.flat().length),lexiconNodes:nodes.length,originalLengths:original.map(x=>x.flat().length),controls,original:out}
}
module.exports=run;
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-ink-annotations.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8")),Number(process.argv[2]||512),120),null,2))}
