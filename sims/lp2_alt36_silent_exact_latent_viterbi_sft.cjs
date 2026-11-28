"use strict";
/**
 * Exact generative hidden-silent-symbol decoder for Round48 M1 / C11 V-SILENT.
 * The cipher has 36 output states, 29 printed GP rune glyphs and seven silent
 * nonprinting output symbols 29..35. Plaintext GP rune values 0..28 and SPACE29,
 * key 0..35 uniform, strict output nonrepeat by rejecting key values. Hidden
 * nonprinting output symbols consume plaintext and key, update cipher state.
 * The inverse is a bounded-beam approximation to the physically exact HMM,
 * not a previously known authentic Liber Primus inverse or a key discovery.
 *
 * Training: first 57% of words of Shakespeare, Gibran, Emerson controls.
 * Testing: disjoint last 43% of words under independent true/wrong keystreams.
 * Run: node sims/lp2_alt36_silent_exact_latent_viterbi_sft.cjs
 */
function experiment(raw, options={}) {
  const gp=JSON.parse(raw.gp),M=36,R=29,SPACE=29,SENT=30,Q=31,
    mod=x=>((x%M)+M)%M,Tok=gp.translit.map((s,i)=>({s,i}))
      .sort((a,b)=>b.s.length-a.s.length);
  function words(text){
    const W=[];
    for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      const v=[];
      for(let j=0;j<w.length;){
        const t=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:
          Tok.find(x=>w.startsWith(x.s,j));
        if(!t)throw Error("Unmapped rune spelling");
        v.push(t.i);j+=t.s.length;
      }
      W.push(v);
    }
    return W;
  }
  const sources=[
    {name:"Shakespeare",W:words(raw.shakespeare)},
    {name:"Gibran",W:words(raw.gibran)},
    {name:"Emerson",W:words(raw.emerson)}
  ];
  function tape(W){const P=[];for(const w of W){P.push(...w,SPACE);}return P;}
  function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%n;};}
  function language(){
    const U=new Float64Array(30),B=new Float64Array(Q*Q),T=new Float64Array(Q*Q*Q),
      F=new Uint32Array(Q*Q*Q*Q),Ub=new Float64Array(Q),
      Bb=new Float64Array(Q*Q),Tb=new Uint32Array(Q*Q*Q);
    for(const source of sources) {
      const W=source.W.slice(0,Math.floor(source.W.length*.57));
      let a=SENT,b=SENT,c=SENT;
      for(const p of tape(W)){
        U[p]++;B[c*Q+p]++;T[(b*Q+c)*Q+p]++;
        F[((a*Q+b)*Q+c)*Q+p]++;
        Ub[c]++;Bb[b*Q+c]++;Tb[(a*Q+b)*Q+c]++;
        a=b;b=c;c=p;
      }
    }
    const N=U.reduce((s,v)=>s+v,0),P3=new Float32Array(Q*Q*Q),
      P4=new Float32Array(Q*Q*Q*Q);
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let p=0;p<30;p++){
      const u=(U[p]+.3)/(N+30*.3);
      const bi=(B[b*Q+p]+12*u)/(Ub[b]+12);
      P3[(a*Q+b)*Q+p]=Math.log((T[(a*Q+b)*Q+p]+16*bi)/(Bb[a*Q+b]+16));
    }
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++)for(let p=0;p<30;p++){
      const z=((a*Q+b)*Q+c)*Q+p;
      P4[z]=Math.log((F[z]+10*Math.exp(P3[(b*Q+c)*Q+p]))/(Tb[(a*Q+b)*Q+c]+10));
    }
    return P4;
  }
  function strict(P,K) {
    let j=0,prev=-1;const out=[];
    for(const p of P) {
      while(mod(p+K[j])===prev) {
        j++;if(j>=K.length)throw Error("insufficient key");
      }
      const c=mod(p+K[j]);
      out.push({c,p,j});prev=c;j++;
    }
    return out;
  }
  function plant(source,seed) {
    const r=rng(seed),W=source.W,cut=Math.floor(W.length*.57),
      test=tape(W.slice(cut)),n=314,offset=100+r(test.length-n-300),
      P=test.slice(offset,offset+n);
    const K=Array.from({length:6*n},()=>r(36)),
      WK=Array.from({length:6*n},()=>r(36)),
      A=strict(P,K),printed=A.filter(x=>x.c<29),
      C=printed.map(x=>x.c),
      truth=printed.filter(x=>x.p<29).map(x=>x.p);
    return {source:source.name,seed,underlyingPlainLength:P.length,
      printed:C.length,truth,K,WK,C,actualLastKeyIndex:printed.at(-1).j,
      actualSilentEmissions:A.filter(x=>x.c>=29).length};
  }
  function top(items,limit){
    const map=new Map();
    for(const z of items){
      const id=((((z.j*36+z.prev)*Q+z.a)*Q+z.b)*Q+z.c);
      const q=map.get(id);
      if(!q||z.score>q.score)map.set(id,z);
    }
    const rows=[...map.values()];
    if(rows.length>limit){
      let lo=0,hi=rows.length-1,goal=limit-1;
      while(lo<hi) {
        const pivot=rows[(lo+hi)>>>1].score;let i=lo,j=hi;
        while(i<=j) {
          while(i<=hi&&rows[i].score>pivot)i++;
          while(j>=lo&&rows[j].score<pivot)j--;
          if(i<=j){[rows[i],rows[j]]=[rows[j],rows[i]];i++;j--;}
        }
        if(goal<=j)hi=j;else if(goal>=i)lo=i;else break;
      }
      rows.length=limit;
    }
    rows.sort((a,b)=>b.score-a.score);
    return rows;
  }
  function advance(z,p,newC,j,LM,flag){
    // flag: emit printed or suppressed (the cipher has no probabilistic
    // deletion; the nonprinting symbol is determined by arithmetic).
    return {j,prev:newC,a:z.b,b:z.c,c:p,
      score:z.score+LM[((z.a*Q+z.b)*Q+z.c)*Q+p],
      path: flag?{p,prev:z.path}:z.path};
  }
  function emit(z,c,K,LM,maxJ,printed){
    const rows=[],j0=z.j+1;
    if(printed && (c<0||c>=R))throw Error("printed rune out of range");
    for(let h=0;h<=3;h++) {
      const j=j0+h;if(j>=K.length||j>maxJ)break;
      const p=mod(c-K[j]);
      if(p>29)continue;
      let ok=c!==z.prev;
      for(let t=j0;t<j&&ok;t++)if(mod(p+K[t])!==z.prev)ok=false;
      if(!ok)continue;
      rows.push(advance(z,p,c,j,LM,printed&&p<29));
    }
    return rows;
  }
  function hide(z,K,LM,maxJ){
    const rows=[];
    const j0=z.j+1;if(j0>=K.length||j0>maxJ)return rows;
    // Exactly seven possible nonprinting ciphertext symbols, including
    // every strict-repeat key rejection before the hidden emission.
    for(let c=29;c<36;c++)for(let h=0;h<=3;h++){
      const j=j0+h;
      if(j>=K.length||j>maxJ||c===z.prev)continue;
      const p=mod(c-K[j]);
      if(p>29)continue;
      let okay=true;
      for(let k=j0;k<j;k++)if(mod(p+K[k])!==z.prev){okay=false;break;}
      if(okay)rows.push(advance(z,p,c,j,LM,false));
    }
    return rows;
  }
  function solve(C,K,LM,beam,maxHidden=3){
    let states=[{j:-1,prev:-1,a:SENT,b:SENT,c:SENT,score:0,path:null}],
      explored=0,bestClock=0;
    for(let i=0;i<C.length;i++){
      const maxJ=Math.ceil((i+1)*1.65+16),accepted=[];
      let layer=states;
      for(let d=0;d<=maxHidden;d++) {
        for(const z of layer){
          const x=emit(z,C[i],K,LM,maxJ,true);
          accepted.push(...x);explored+=x.length;
        }
        if(d===maxHidden)break;
        const grow=[];
        for(const z of layer)grow.push(...hide(z,K,LM,maxJ));
        explored+=grow.length;
        layer=top(grow,beam);
        if(!layer.length)break;
      }
      states=top(accepted,beam);
      if(!states.length)return {failed:i,explored};
      bestClock=states[0].j;
    }
    const z=states[0],P=[];
    for(let q=z.path;q;q=q.prev)P.push(q.p);
    P.reverse();
    return {P,score:z.score/C.length,keyLast:z.j,explored,
      preview:P.slice(0,100).map(p=>gp.translit[p]).join("")};
  }
  function lcs(a,b) {
    let p=new Uint16Array(b.length+1),c=new Uint16Array(b.length+1);
    for(const x of a){
      c.fill(0);
      for(let i=0;i<b.length;i++)c[i+1]=x===b[i]?p[i]+1:Math.max(p[i+1],c[i]);
      [p,c]=[c,p];
    }
    return p[b.length];
  }
  const LM=language(),beam=options.beam||600,rows=[];
  if(options.primeMode){
    // One bounded transfer from the authenticated LP2 p56 successive
    // prime-minus-one schedule into a conjectural mod36 silent-output channel.
    const primes=[];
    for(let n=2;primes.length<3500;n++){
      let isP=true;for(let j=2;j*j<=n;j++)if(n%j===0){isP=false;break;}
      if(isP)primes.push(n);
    }
    const K=primes.map(p=>(p-1)%36),offset=1,
      Kshift=K.slice(offset);
    let C,truth=null,target;
    if(options.primeMode==="plant"){
      const source=sources[1],test=tape(source.W.slice(Math.floor(source.W.length*.57)));
      const P=test.slice(5000,5314),A=strict(P,K);
      C=A.filter(x=>x.c<29).map(x=>x.c);
      truth=A.filter(x=>x.c<29&&x.p<29).map(x=>x.p);
      target="Gibran held-out native GP positive under mod36 prime-minus-one";
    }else if(options.primeMode==="original"){
      C=gp.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
      if(C.length!==308)throw Error("original terminal count");
      target="original physical LP2 p54-p55, all308 runes";
    }else throw Error("invalid primeMode");
    const a=solve(C,K,LM,beam,options.maxHidden||3);
    const b=solve(C,Kshift,LM,beam,options.maxHidden||3);
    const report=z=>({score:z.score,estimatedKeyIndex:z.keyLast,
      recovery:truth&&z.P?lcs(z.P,truth)/Math.max(truth.length,z.P.length):null,
      runeOutput:z.P?.map(p=>gp.runes[p]).join(""),
      gpTransliteration:z.P?.map(p=>gp.translit[p]).join("")});
    return {target,inputCount:C.length,truthCount:truth?.length,
      hypothesis:"mod36 strict-repeat with outputs>=29 silent, successive prime_minus_one residues mod36, fixed origin0",
      origin0:report(a),origin1:report(b)};
  }
  for(let i=(options.start||0);i<(options.start||0)+(options.plants||3);i++){
    const source=sources[i%sources.length],s=plant(source,91923+i*991);
    const right=solve(s.C,s.K,LM,beam,options.maxHidden||3),
      wrong=solve(s.C,s.WK,LM,beam,options.maxHidden||3);
    rows.push({source:s.source,seed:s.seed,printed:s.printed,
      recoverableLength:s.truth.length,actualLastKeyIndex:s.actualLastKeyIndex,
      actualSilentEmissions:s.actualSilentEmissions,
      right:{rec:right.P?lcs(right.P,s.truth)/Math.max(right.P.length,s.truth.length):0,
        score:right.score,clock:right.keyLast,preview:right.preview,visited:right.explored},
      wrong:{rec:wrong.P?lcs(wrong.P,s.truth)/Math.max(wrong.P.length,s.truth.length):0,
        score:wrong.score,clock:wrong.keyLast,preview:wrong.preview,visited:wrong.explored}});
  }
  return {scope:"Independent exact generative mod36 V-SILENT inverse for known keystream, not original LP2 solve",
    training:"first57% words for 3 fixed donors; test exclusively last43%",
    beam,maxHidden:options.maxHidden||3,rows};
}
if(typeof module!=="undefined")module.exports={experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const raw={gp:read("resources/liber-primus/lp2-corpus.json"),
    shakespeare:read("resources/control/shakespeare_first300k.txt"),
    gibran:read("resources/control/gibran_prophet_58585.txt"),
    emerson:read("resources/control/emerson_essays_2944.txt")};
  console.log(JSON.stringify(experiment(raw,
    {beam:process.argv.includes("--wide")?1500:600,plants:3,
      primeMode:process.argv.includes("--prime-plant")?"plant":
        process.argv.includes("--prime-original")?"original":undefined}),null,2));
}
