"use strict";
/**
 * Exploratory decoder of two distinct ciphertext erasure channels proposed in
 * Dukotah/cicada3301 Round48 M1 (filed 2026-11-27):
 *   V-DELETE: GP29 strict output anti-repeat, then random deletion ~0.187;
 *   V-SILENT: mod36 with plaintext SPACE=29, strict repeat rejection, 7
 *             nonprinting output symbols [29..35].
 * The correct random keystream is supplied on positive plants; NO original
 * LP2 keystream is supplied. This is not an original decryption.
 * Decode by Viterbi-style beam over unknown key-clock gap, with a GP rune
 * latent-word-space 4-gram model trained on disjoint earlier donor text (no planted crib).
 *
 * Execute: node sims/lp2_alt36_silent_delete_keyed_beam_sft.cjs
 *          node sims/lp2_alt36_silent_delete_keyed_beam_sft.cjs --wide
 */
function experiment(raw, options={}) {
  const gp=JSON.parse(raw.gp),labels=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const MOD=(x,m)=>((x%m)+m)%m, SENT=30, Q=31, FIRST=0x91A1A1;
  function words(text) {
    const out=[];
    for(let w of (text.toUpperCase().match(/[A-Z]+/g)||[])) {
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      const a=[];
      for(let i=0;i<w.length;) {
        const z=w.startsWith("ING",i)?{s:"ING",i:21}:
          w.startsWith("IO",i)?{s:"IO",i:27}:labels.find(z=>w.startsWith(z.s,i));
        if(!z)throw Error("unmapped:"+w.slice(i));
        a.push(z.i); i+=z.s.length;
      }
      out.push(a);
    }
    return out;
  }
  const datasets=[
    {name:"Shakespeare",arr:words(raw.shakespeare)},
    {name:"Gibran",arr:words(raw.gibran)},
    {name:"Emerson",arr:words(raw.emerson)}
  ];
  function tape(W,mode) {
    const a=[];for(const w of W){a.push(...w);if(mode==="V-SILENT")a.push(29);}return a;
  }
  function rng(seed) {
    let x=seed>>>0;
    return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n;};
  }
  function makeLM(mode) {
    const U=new Float64Array(30),B=new Float64Array(Q*Q),T=new Float64Array(Q*Q*Q),
      F=new Uint32Array(Q*Q*Q*Q),Ftotal=new Uint32Array(Q*Q*Q),
      Utotal=new Float64Array(Q),Btotal=new Float64Array(Q*Q);
    let seed=FIRST+(mode==="V-SILENT"?177:71);
    const r=rng(seed);
    for(const donor of datasets) {
      const cut=Math.floor(donor.arr.length*0.57),W=donor.arr.slice(0,cut);
      const full=tape(W,"V-SILENT");
      for(let repeat=0;repeat<4;repeat++) {
        let a=SENT,b=SENT,c=SENT;
        for(const p of full) {
          if(p!==29&&r(10000)<(mode==="V-SILENT"?1944:1870))continue;
          U[p]++; B[c*Q+p]++; T[(b*Q+c)*Q+p]++;
          F[((a*Q+b)*Q+c)*Q+p]++;Ftotal[(a*Q+b)*Q+c]++;
          Utotal[c]++; Btotal[b*Q+c]++; a=b;b=c;c=p;
        }
      }
    }
    const uTotal=U.reduce((s,v)=>s+v,0),lp=new Float64Array(Q*Q*Q);
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let p=0;p<30;p++){
      const unig=(U[p]+.25)/(uTotal+30*.25);
      const big=(B[b*Q+p]+9*unig)/(Utotal[b]+9);
      lp[(a*Q+b)*Q+p]=Math.log((T[(a*Q+b)*Q+p]+13*big)/(Btotal[a*Q+b]+13));
    }
    const lp4=new Float64Array(Q*Q*Q*Q),strength=9;
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++)for(let p=0;p<30;p++){
      const k=((a*Q+b)*Q+c)*Q+p,h=(a*Q+b)*Q+c;
      lp4[k]=Math.log((F[k]+strength*Math.exp(lp[(b*Q+c)*Q+p]))/(Ftotal[h]+strength));
    }
    return {three:lp,four:lp4};
  }
  function strict(P,K,m) {
    let j=0,prev=-1;
    const A=[];
    for(const p of P){
      while(MOD(p+K[j],m)===prev){j++;if(j>=K.length)throw Error("key too short");}
      const c=MOD(p+K[j],m);A.push({c,p,j});prev=c;j++;
    }
    return A;
  }
  function plant(donor,mode,seed) {
    const W=donor.arr,cut=Math.floor(W.length*0.57);
    const test=tape(W.slice(cut),mode);
    const r=rng(seed);const N=mode==="V-SILENT"?314:300;
    if(test.length<=N+200)throw Error("insufficient test corpus");
    const off=50+r(test.length-N-150);
    const P=test.slice(off,off+N),m=mode==="V-SILENT"?36:29;
    const K=Array.from({length:6*N},()=>r(m)),wrong=Array.from({length:6*N},()=>r(m));
    const emitted=strict(P,K,m);
    const keep=mode==="V-SILENT"? emitted.map(x=>x.c<29) :
      emitted.map(()=>r(10000)>=1870);
    const picked=emitted.filter((x,i)=>keep[i]);
    const C=picked.map(x=>x.c),truth=picked.filter(x=>x.p<29).map(x=>x.p);
    const trueJ=picked.map(x=>x.j);
    return {name:donor.name,mode,seed,P,K,wrong,C,truth,trueJ,printed:C.length};
  }
  function solve(C,K,mode,LM,beamSize=1200,maxGap=8) {
    const m=mode==="V-SILENT"?36:29;
    let states=[{j:-1,a:SENT,b:SENT,c:SENT,s:0,path:null}],nExplored=0,maxStates=0;
    const DROP_LOG=Math.log((mode==="V-SILENT"?7/36:.187)+(1/(m-1)));
    for(let i=0;i<C.length;i++) {
      const c=C[i],cand=new Map();
      for(const z of states)for(let g=1;g<=maxGap;g++) {
        const j=z.j+g;
        // No planted key scheduling prior uses the actual key index.
        if(j>=K.length||j>Math.ceil((i+1)*1.60+12))continue;
        // A strict sender with immediately consecutive printings cannot repeat.
        if(i&&c===C[i-1]&&g===1)continue;
        const p=MOD(c-K[j],m);
        if(p>=(mode==="V-SILENT"?30:29))continue;
        for(let insert=0;insert<(mode==="V-DELETE"?2:1);insert++){
          let a=z.a,b=z.b,c0=z.c,s=z.s+DROP_LOG*(g-1);
          if(insert){
            s+=LM.four[((a*Q+b)*Q+c0)*Q+29];
            a=b;b=c0;c0=29;
          }
          s+=LM.four[((a*Q+b)*Q+c0)*Q+p];
          const key=((j*Q+b)*Q+c0)*Q+p,old=cand.get(key);
          nExplored++;
          if(!old||s>old.s) cand.set(key,{j,a:b,b:c0,c:p,s,path:{p,prev:z.path}});
        }
      }
      if(!cand.size)return {failedAt:i,score:-Infinity,nExplored};
      states=[...cand.values()].sort((a,b)=>b.s-a.s).slice(0,beamSize);
      maxStates=Math.max(maxStates,states.length);
    }
    const best=states[0],P=[];
    for(let z=best.path;z;z=z.prev)P.push(z.p);
    P.reverse();
    const onlyRunes=P.filter(p=>p<29);
    return {P:onlyRunes,score:best.s/C.length,lastKeyIndex:best.j,
      printed:C.length,emitted:onlyRunes.length,visited:nExplored,maxStates,
      preview:onlyRunes.slice(0,100).map(i=>gp.translit[i]).join("")};
  }
  function lcs(a,b) {
    let prev=new Uint16Array(b.length+1),cur=new Uint16Array(b.length+1);
    for(const p of a) {
      cur.fill(0);
      for(let j=0;j<b.length;j++)cur[j+1]=p===b[j]?prev[j]+1:
        Math.max(cur[j],prev[j+1]);
      [prev,cur]=[cur,prev];
    }
    return prev[b.length];
  }
  const output=[],beam=options.beam||1200,nPlants=options.plants||2;
  for(const mode of ["V-DELETE","V-SILENT"]) {
    const LM=makeLM(mode);
    for(let j=0;j<nPlants;j++) {
      const donor=datasets[j%datasets.length],p=plant(donor,mode,80421+j*547+(mode==="V-SILENT"?9:0));
      const right=solve(p.C,p.K,mode,LM,beam),wrong=solve(p.C,p.wrong,mode,LM,beam);
      const rec=right.P?lcs(right.P,p.truth)/Math.max(right.P.length,p.truth.length):0;
      const wr=wrong.P?lcs(wrong.P,p.truth)/Math.max(wrong.P.length,p.truth.length):0;
      output.push({name:p.name,mode,seed:p.seed,printed:p.printed,truthLength:p.truth.length,
        right:{recovery:rec,score:right.score,lastKeyIndex:right.lastKeyIndex,visited:right.visited,preview:right.preview},
        wrong:{recovery:wr,score:wrong.score,lastKeyIndex:wrong.lastKeyIndex,visited:wrong.visited,preview:wrong.preview},
        meanActualKeyClock:p.trueJ.length? p.trueJ.at(-1)/p.trueJ.length:null,
        actualLastKeyIndex:p.trueJ.at(-1)});
    }
  }
  return {description:"New explicit keyed decoder of the Round48 M1 V-DELETE/V-SILENT channels; scores conditional on known supplied keystream, original unknown",training:"First57% tokenized words of 3 independent public prose donors; test windows exclusively last43%",beamSize:beam,maxGap:8,order:options.order||4,output};
}
if(typeof module!=="undefined")module.exports={experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const raw={gp:read("resources/liber-primus/lp2-corpus.json"),
    shakespeare:read("resources/control/shakespeare_first300k.txt"),
    gibran:read("resources/control/gibran_prophet_58585.txt"),
    emerson:read("resources/control/emerson_essays_2944.txt")};
  console.log(JSON.stringify(experiment(raw,{beam:process.argv.includes("--wide")?12000:1200,
    plants:process.argv.includes("--wide")?6:2}),null,2));
}
