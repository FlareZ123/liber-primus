'use strict';
// Agent41 #2476: native-source separated contrastive joint running-key experiment.
const fs=require('node:fs');
function study(data) {
  const corpus=JSON.parse(data[0]), native=JSON.parse(data[1]), Q=29,B=29,A=30,D=12;
  const alphabet=[["ING",21],...corpus.translit.map((s,i)=>[s,i])].sort((a,b)=>b[0].length-a[0].length);
  function gp(w){w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const a=[];while(w.length){const z=alphabet.find(t=>w.startsWith(t[0]));if(!z)return [];a.push(z[1]);w=w.slice(z[0].length)}return a}
  function trim(s){
    const lines=s.split(/\r?\n/);let start=lines.findIndex(x=>/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG/i.test(x));let end=lines.findIndex(x=>/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG/i.test(x));if(start>=0)s=lines.slice(start+1,end>=0?end:undefined).join("\n");
    if(s.includes("BEGIN SOURCE TEXT"))s=s.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0];
    return s;
  }
  const words=s=>(trim(s).match(/[A-Za-z]+/g)||[]).map(gp).filter(x=>x.length);
  const train=data.slice(2,4).map(words), contrast=data.slice(4,6).map(words), blake=words(data[6]);
  const index=new Map(native.runes.map((x,i)=>[x,i]));
  const nwords=s=>s.match(/[\u16a0-\u16f0]+/gu).map(w=>[...w].filter(x=>index.has(x)).map(x=>index.get(x))).filter(w=>w.length);
  const solved=native.sections.map(x=>({name:x.name,words:nwords(x.source_text)}));
  const mod=x=>(x+Q)%Q;
  const next=(c,x)=>(c%27000)*A+x;
  const C0=new Float64Array(30),C1=new Float64Array(900),C2=new Float64Array(27000),C3=new Float64Array(810000);
  const T1=new Float64Array(30),T2=new Float64Array(900),T3=new Float64Array(27000);
  const C4=new Map();
  const trie=[{child:[],mask:0,f:0,term:false,out:0}];
  const pair=new Map(), N=1048576, lenTotal=new Float64Array(31),lenTypes=new Float64Array(31);
  let nTokens=0,nWords=0;
  function insert(w){
    if(w.length>30)return -1;let id=0;
    for(let i=0;i<w.length;i++){trie[id].mask|=1<<(w.length-i);let j=trie[id].child[w[i]];if(j===undefined){j=trie.length;trie[id].child[w[i]]=j;trie.push({child:[],mask:0,f:0,term:false,out:0})}id=j}
    let t=trie[id];if(!t.term){t.term=true;t.mask|=1;lenTypes[w.length]++}t.f++;lenTotal[w.length]++;nWords++;return id;
  }
  for(const ws of train){
    let c=809999,prev=-1;
    for(const w of ws){const id=insert(w);
      if(prev>=0&&id>=0){const key=prev*N+id;pair.set(key,(pair.get(key)||0)+1);trie[prev].out++}prev=id;
      for(const x of [...w,B]){
        C0[x]++;nTokens++;let c1=c%30,c2=c%900,c3=c%27000;
        C1[c1*30+x]++;T1[c1]++;
        C2[c2*30+x]++;T2[c2]++;
        C3[c3*30+x]++;T3[c3]++;
        let v=C4.get(c);if(!v){v=new Uint32Array(31);C4.set(c,v)}v[x]++;v[30]++;c=next(c,x);
      }
    }
  }
  if(trie.length>=N)throw Error("trie overflow");
  const p1=Float64Array.from(C0,x=>(x+.1)/(nTokens+3));
  const p2=new Float64Array(900),p3=new Float64Array(27000),p4=new Float64Array(810000),l4=new Float64Array(810000);
  for(let c=0;c<30;c++)for(let x=0;x<30;x++)p2[c*30+x]=(C1[c*30+x]+4*p1[x])/(T1[c]+4);
  for(let c=0;c<900;c++)for(let x=0;x<30;x++)p3[c*30+x]=(C2[c*30+x]+10*p2[(c%30)*30+x])/(T2[c]+10);
  for(let c=0;c<27000;c++)for(let x=0;x<30;x++){let j=c*30+x;p4[j]=(C3[j]+20*p3[(c%900)*30+x])/(T3[c]+20);l4[j]=Math.log(p4[j])}
  const l5ratio=new Map();
  for(const [c,v] of C4){const a=new Float32Array(30);for(let x=0;x<30;x++){let p=p4[(c%27000)*30+x];a[x]=Math.log((v[x]+20*p)/(v[30]+20)/p)}l5ratio.set(c,a)}
  C4.clear();
  const follow=(id,x,rem)=>{
    if(id<0)return -1;const j=trie[id].child[x];return j!==undefined&&(rem<0||(rem<=30&&(trie[j].mask&(1<<rem))))?j:-1;
  };
  const term=id=>id>=0&&trie[id].term?id:-1;
  const context=(prev,id)=>{
    if(prev<0||id<0)return 0;const n=trie[prev].out;if(!n)return 0;
    const weight=Math.min(.85,n/(n+20)),q=(trie[id].f+.1)/(nWords+.1*trie.length);
    return Math.log(1-weight+weight*(pair.get(prev*N+id)||0)/(n*q));
  };
  const lex=(id,len)=>{
    const l=Math.min(30,len),f=id<0?0:trie[id].f;
    return Math.log((f+.1)/(lenTotal[l]+.1*lenTypes[l]+1));
  };
  const init=()=>({pc:809999,kc:809999,pn:0,kn:0,pp:-1,kp:-1,kl:0,score:0,prev:null});
  function step(st,p,k,space,rem,wordlen,w,acc){
    let s=st.score,pc=st.pc,kc=st.kc,pn=st.pn,kn=st.kn,pp=st.pp,kp=st.kp,kl=st.kl;
    function add(j,v){s+=w[j]*v;if(acc)acc[j]+=v}
    function ch(c,x,j){add(j,l4[(c%27000)*30+x]);add(10+j,l5ratio.get(c)?.[x]||0)}
    ch(pc,p,0);pc=next(pc,p);const np=follow(pn,p,rem);
    if(np<0)add(pn>=0?2:4,-1);pn=np;
    if(rem===0){ch(pc,B,0);pc=next(pc,B);const id=term(pn);add(6,context(pp,id));add(8,lex(id,wordlen));pp=id;pn=0}
    if(space){
      const id=term(kn);ch(kc,B,1);kc=next(kc,B);
      if(kn>=0&&id<0)add(3,-1);add(7,context(kp,id));add(9,lex(id,kl));
      kn=0;kp=id;kl=0;
    }
    ch(kc,k,1);kc=next(kc,k);const nk=follow(kn,k,-1);
    if(nk<0)add(kn>=0?3:5,-1);kn=nk;kl++;
    return {pc,kc,pn,kn,pp,kp,kl,score:s,prev:st,p,k,space};
  }
  const base=[1,1,3,3,.12,.12,.65,.65,0,0,0,0];
  function shape(L){
    const R=[],W=[];for(const n of L)for(let i=n-1;i>=0;i--){R.push(i);W.push(n)}return {R,W}
  }
  function unpack(st){let P=[],K=[],spaces=[];while(st.prev){P.push(st.p);K.push(st.k);spaces.push(st.space);st=st.prev}return {P:P.reverse(),K:K.reverse(),spaces:spaces.reverse(),score:undefined}}
  function decode(C,L,w,width,limit=6,fixed=null){
    let beam=[init()];const {R,W}=shape(L);
    if(R.length!==C.length)throw Error("bad frame");
    const key=s=>[s.pc,s.kc,s.pn,s.kn,s.pp,s.kp,s.kl].join(",");
    for(let i=0;i<C.length;i++){
      const candidates=new Map();
      function offer(v){const id=key(v),old=candidates.get(id);if(!old||v.score>old.score)candidates.set(id,v)}
      for(const st of beam){
        for(let p=fixed?fixed[i]:0;p<=(fixed?fixed[i]:28);p++){
          const k=mod(C[i]-p);
          offer(step(st,p,k,false,R[i],W[i],w,null));
          if(i>0)offer(step(st,p,k,true,R[i],W[i],w,null));
        }
      }
      beam=Array.from(candidates.values()).sort((a,b)=>b.score-a.score).slice(0,width);
    }
    return beam.slice(0,limit).map(st=>({...unpack(st),score:st.score}));
  }
  function features(P,K,S,L){
    const {R,W}=shape(L),a=new Float64Array(D);let st=init();
    for(let i=0;i<P.length;i++)st=step(st,P[i],K[i],S[i],R[i],W[i],base,a);
    return [...a];
  }
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  function take(ws,off,min){const a=[];let n=0;for(let i=off;i<ws.length&&n<min;i++){a.push(ws[i]);n+=ws[i].length}if(n<min)throw Error("short source "+off);return a}
  function pairPlant(name,pwords,kwords){
    const P=pwords.flat(),K=kwords.flat().slice(0,P.length),L=pwords.map(x=>x.length),S=Array(P.length).fill(false);
    if(K.length!==P.length)throw Error("short key");
    let j=0;for(const w of kwords){if(j>0&&j<S.length)S[j]=true;j+=w.length}
    return {name,P,K,L,S,C:P.map((x,i)=>(x+K[i])%Q)};
  }
  const training=[];
  for(let i=0;i<8;i++){
    const a=i%2,b=1-a,min=108+(i%3)*16;
    training.push(pairPlant(`contrast ${i} ${a? "Prayer/Gibran":"Gibran/Prayer"}`,take(contrast[a],200+350*i,min),take(contrast[b],400+400*i,min+30)));
  }
  const tests=[
    pairPlant("heldout LP welcome / Blake",take(solved.find(x=>x.name==="0_welcome").words,0,120),take(blake,8,160)),
    pairPlant("heldout LP koan / Blake",take(solved.find(x=>x.name==="0_koan_1").words,30,144),take(blake,85,185)),
    pairPlant("heldout LP divinity / Blake",take(solved.find(x=>x.name==="0_loss_of_divinity").words,65,166),take(blake,170,200)),
    pairPlant("heldout Blake / LP koan",take(blake,245,110),take(solved.find(x=>x.name==="0_koan_1").words,80,150)),
  ];
  const diffs=[],trainRound=[];
  function mine(w,round){
    for(const t of training){
      const oracle=features(t.P,t.K,t.S,t.L),cs=decode(t.C,t.L,w,128,5);
      let n=0,gaps=[];
      for(const c of cs){
        if(c.P.every((x,i)=>x===t.P[i])&&c.spaces.every((x,i)=>x===t.S[i]))continue;
        const z=features(c.P,c.K,c.spaces,t.L);
        diffs.push(oracle.map((x,i)=>(x-z[i])/Math.sqrt(t.P.length)));n++;gaps.push(dot(w,oracle)-dot(w,z));
      }
      trainRound.push({round,name:t.name,n:t.P.length,decoys:n,bestGap:Math.min(...gaps),bestCorrect:cs[0].P.filter((x,i)=>x===t.P[i]).length});
    }
  }
  function learn(){
    const scale=base.map((_,j)=>Math.max(.03,Math.sqrt(diffs.reduce((s,d)=>s+d[j]*d[j],0)/diffs.length)));
    const X=diffs.map(d=>d.map((x,j)=>x/scale[j]));
    const center=base.map((x,j)=>x*scale[j]),theta=center.slice();
    for(let it=0;it<650;it++){
      const g=theta.map((x,j)=>.025*(x-center[j]));
      for(const x of X){const m=dot(theta,x);const k=-1/(1+Math.exp(Math.max(-50,Math.min(50,m))))/X.length;for(let j=0;j<D;j++)g[j]+=k*x[j]}
      for(let j=0;j<D;j++)theta[j]=Math.max(0,Math.min(8*scale[j],theta[j]-.12*g[j]));
    }
    const w=theta.map((x,j)=>x/scale[j]);
    return {w,accuracy:diffs.filter(d=>dot(w,d)>0).length/diffs.length,examples:diffs.length};
  }
  mine(base,0);const first=learn();mine(first.w,1);const frozen=learn();
  let seed=0x247641;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29}
  const results=[];
  for(const t of tests){
    const o=features(t.P,t.K,t.S,t.L);
    for(const [model,w] of [["baseline",base],["contrastive",frozen.w]]){
      const c=decode(t.C,t.L,w,256,1)[0],bestTrue=decode(t.C,t.L,w,128,1,t.P)[0];
      const replay=c.P.every((x,i)=>(x+c.K[i])%Q===t.C[i]);if(!replay)throw Error("not exact");
      results.push({name:t.name,n:t.P.length,model,correct:c.P.filter((x,i)=>x===t.P[i]).length,score:c.score/t.P.length,trueActualGap:dot(w,o)-c.score,trueBestSegmentGap:bestTrue.score-c.score,exactReplay:replay});
    }
    const pad=t.P.map(rng),C=t.P.map((x,i)=>(x+pad[i])%Q),c=decode(C,t.L,frozen.w,256,1)[0];
    results.push({name:t.name+" / uniform pad",n:t.P.length,model:"contrastive",correct:c.P.filter((x,i)=>x===t.P[i]).length,score:c.score/t.P.length,exactReplay:c.P.every((x,i)=>(x+c.K[i])%Q===C[i])});
  }
  const gate=results.filter(x=>x.model==="contrastive"&&!x.name.includes("uniform")).every(x=>x.correct===x.n&&x.trueActualGap>=-1e-6&&x.trueBestSegmentGap>=-1e-6);
  return {modelFeatures:["P character4","K character4","P initial OOV","K initial OOV","P continued OOV","K continued OOV","P word bigram","K word bigram","P lexical by length","K lexical by length","P character5 improvement","K character5 improvement"],sourceSplits:{lm:["Shakespeare","Emerson"],contrastive:["Gibran","Orthodox Daily Prayers"],holdout:["native solved LP","Blake"],trainWords:train.map(x=>x.length),contrastWords:contrast.map(x=>x.length),blakeWords:blake.length},trainTokens:nTokens,trieNodes:trie.length,base,first,frozen,trainRound,results,gate};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/orthodox_daily_prayers_pg34981.txt","resources/control/blake_song_of_liberty_train.txt"];
console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(f,'utf8'))),null,2));
