"use strict";
// Source-native, all-secret chapter-private TWO-chart necessary-condition gate.
// No unknown plaintext, chosen key or fitted language score is used.
function run(corpus, sources) {
  const A=29, assert=(v,s)=>{if(!v)throw Error(s);}, R=n=>Array.from({length:n},(_,i)=>i);
  const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=53&&p.indices.length);
  assert(pages.length===13,"p40-53 nonempty page count");
  const N=pages.reduce((n,p)=>n+p.indices.length,0);
  assert(N===3008,"original rune count");
  const hist=new Int32Array(A), tensor=new Int32Array(A*A*A), excluded=[];
  let offset=0, transitions=0, triples=0;
  for (const p of pages) {
    const c=p.indices, d=c.slice(1).map((v,i)=>(v-c[i]+A)%A);
    for (const v of d) {hist[v]++;transitions++;}
    for (let i=2;i<d.length;i++) {tensor[(d[i-2]*A+d[i-1])*A+d[i]]++;triples++;}
    excluded.push(offset,offset+c.length-2,offset+c.length-1);
    offset+=c.length;
  }
  assert(transitions===2995&&triples===2969&&excluded.length===39,"source geometry");
  const sorted=R(A).map(i=>({symbol:i,n:hist[i]})).sort((a,b)=>b.n-a.n);
  const q2Capacity=sorted[0].n+sorted[1].n;
  assert(q2Capacity===245,"original two-output unigram capacity");
  // Literal-F-hold alternative: every physically printed F is plaintext F, emits
  // zero, and does not change the predecessor register. This is a conditional
  // authoring hypothesis, not an observed universal LP2 convention.
  const skipHist=new Int32Array(A);let literalFCount=0, skipTransitions=0;
  for(const p of pages){
    let previous=null;
    for(const x of p.indices){
      if(x===0){literalFCount++;continue;}
      if(previous!==null){skipHist[(x-previous+A)%A]++;skipTransitions++;}
      previous=x;
    }
  }
  const skipSorted=R(A).map(i=>({symbol:i,n:skipHist[i]})).sort((a,b)=>b.n-a.n);
  const skipQ2Capacity=skipSorted[0].n+skipSorted[1].n;
  assert(literalFCount===125&&skipTransitions===2870&&skipQ2Capacity===234,"literal-F source");
  const top=(v,q)=>{
    const b=new Int32Array(q);
    for(const n of v){if(n<=b[0])continue;b[0]=n;for(let j=0;j<q-1&&b[j]>b[j+1];j++){const w=b[j];b[j]=b[j+1];b[j+1]=w;}}
    return b.reduce((s,x)=>s+x,0);
  };
  // Exact maximum total weight of any q x q x q residual-trigram box.
  // Upper-bound pruning is safe; every reported optimum has an actual witness.
  function box(F,q){
    let best=0,witness=null,visited=0;
    const rows=new Int32Array(A*A), choices=[],selected=[],axes=R(A);
    function bounds(){
      const row=axes.map(i=>top(rows.subarray(i*A,(i+1)*A),q));
      const col=axes.map(j=>top(axes.map(i=>rows[i*A+j]),q));
      return {row,upper:Math.min(top(row,q),top(col,q))};
    }
    function choose(st){
      if(selected.length===q){choices.push({first:selected.slice(),upper:bounds().upper});return;}
      for(let i=st;i<=A-(q-selected.length);i++){
        for(let j=0;j<rows.length;j++)rows[j]+=F[i*A*A+j];
        selected.push(i);choose(i+1);selected.pop();
        for(let j=0;j<rows.length;j++)rows[j]-=F[i*A*A+j];
      }
    }
    choose(0);choices.sort((a,b)=>b.upper-a.upper);
    for (const choice of choices) {
      if(choice.upper<=best)break;
      visited++;rows.fill(0);
      for(const i of choice.first)for(let j=0;j<rows.length;j++)rows[j]+=F[i*A*A+j];
      const weight=bounds().row,order=axes.slice().sort((a,b)=>weight[b]-weight[a]);
      const col=new Int32Array(A),take=[];
      function dfs(st,rs){
        const remain=q-take.length;
        if(!remain){
          const value=top(col,q);
          if(value>best){best=value;witness=[choice.first.slice(),take.slice(),axes.slice().sort((a,b)=>col[b]-col[a]).slice(0,q)];}
          return;
        }
        const current=top(col,q);
        for(let z=st;z<=A-remain;z++){
          let add=0;for(let j=z;j<z+remain;j++)add+=weight[order[j]];
          if(rs+add<=best||current+add<=best)break;
          const i=order[z];take.push(i);
          for(let j=0;j<A;j++)col[j]+=rows[i*A+j];
          dfs(z+1,rs+weight[i]);
          for(let j=0;j<A;j++)col[j]-=rows[i*A+j];
          take.pop();
        }
      }
      dfs(0,0);
    }
    let replay=0;for(const i of witness[0])for(const j of witness[1])for(const k of witness[2])replay+=F[(i*A+j)*A+k];
    assert(replay===best,"exact triple box witness");
    return {q,cap:best,witness,outerChoices:choices.length,visited};
  }
  const trigramBoxes=[box(tensor,2),box(tensor,3)];
  assert(trigramBoxes[0].cap===10&&trigramBoxes[1].cap===21,"source triple capacities");
  const items=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const single=new Map(corpus.translit.map((s,i)=>[s,i]));
  function gp(txt,mode){
    const out=[];
    const words=txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[];
    for(const w of words)for(let i=0;i<w.length;){
      if(mode==="legacy"&&w.startsWith("ING",i)){out.push(21);i+=3;}
      else if(mode==="legacy"&&w.startsWith("IO",i)){out.push(27);i+=2;}
      else if(mode==="latin"){assert(single.has(w[i]),"Latin symbol");out.push(single.get(w[i]));i++;}
      else {const token=items.find(t=>w.startsWith(t.s,i));assert(token,"GP token "+w);out.push(token.i);i+=token.s.length;}
    }
    return out;
  }
  function body(txt,isShakespeare){
    if(isShakespeare)return txt.split(/\r?\n/).filter(s=>!/^\s*[A-Z][A-Z ]{1,55}: *$/.test(s)&&!/^\s*(ACT|SCENE) [IVX0-9]/i.test(s)).join("\n");
    const st=txt.indexOf("*** START OF THIS PROJECT GUTENBERG"),b=st<0?-1:txt.indexOf("***",st+4),e=txt.indexOf("*** END OF THIS PROJECT GUTENBERG");
    return b>0&&e>b?txt.slice(b+3,e):txt;
  }
  function minMaxLetter(seq){
    assert(seq.length>=N,"control too short");
    const cnt=new Int32Array(A);for(let i=0;i<N;i++)cnt[seq[i]]++;
    let min=Infinity,max=0,minNonF=Infinity,minF=Infinity,maxF=0;
    for(let i=0;i+N<=seq.length;i++){
      if(i){cnt[seq[i-1]]--;cnt[seq[i+N-1]]++;}
      const v=Math.max(...cnt),nonF=Math.max(...cnt.subarray(1));
      if(v<min)min=v;if(v>max)max=v;
      if(nonF<minNonF)minNonF=nonF;
      if(cnt[0]<minF)minF=cnt[0];if(cnt[0]>maxF)maxF=cnt[0];
    }
    return {gpRunes:seq.length,windows:seq.length-N+1,min,max,
      slack:min-(q2Capacity+pages.length),minNonF,minF,maxF,
      skipFNonFSlack:minNonF-(skipQ2Capacity+pages.length)};
  }
  function maskedTriple(seq){
    const cnt=new Int32Array(A*A*A),freq=new Int32Array(N+1),idx=i=>(seq[i]*A+seq[i+1])*A+seq[i+2];
    let mx=0,min=Infinity,passQ2=0,passQ3=0;
    function add(x){const v=cnt[x]++;if(v)freq[v]--;freq[v+1]++;if(v+1>mx)mx=v+1;}
    function rem(x){const v=cnt[x]--;freq[v]--;if(v>1)freq[v-1]++;while(mx&&!freq[mx])mx--;}
    for(let i=0;i<N-2;i++)add(idx(i));
    for(let st=0;st+N<=seq.length;st++){
      if(st){rem(idx(st-1));add(idx(st+N-3));}
      for(const j of excluded)if(j<N-2)rem(idx(st+j));
      if(mx<min)min=mx;
      if(mx<=trigramBoxes[0].cap)passQ2++;
      if(mx<=trigramBoxes[1].cap)passQ3++;
      for(const j of excluded)if(j<N-2)add(idx(st+j));
    }
    return {minMaxTrigram:min,q2Pass:passQ2,q3Pass:passQ3};
  }
  // All nine original chapter alphabets may be entirely independent. For a
  // frequent native symbol in one chapter, two source residual bins + all
  // physical page initials are an exact keyless occupancy upper bound.
  const chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const nineChapters=chapterRanges.map(([lo,hi])=>{
    const items=corpus.pages.filter(p=>p.page>=lo&&p.page<=hi&&p.indices.length);
    const h=new Int32Array(A);let n=0,doublets=0;
    for(const p of items){n+=p.indices.length;for(let i=1;i<p.indices.length;i++){h[(p.indices[i]-p.indices[i-1]+A)%A]++;if(p.indices[i]===p.indices[i-1])doublets++;}}
    const top2=Array.from(h).sort((a,b)=>b-a).slice(0,2);
    return {lo,hi,n,initials:items.length,doublets,top2,cap:top2[0]+top2[1]+items.length};
  });
  const fullN=nineChapters.reduce((s,c)=>s+c.n,0);
  assert(fullN===12956,"nine original chapters total");
  function fullNativeDeficit(seq){
    assert(seq.length>=fullN,"full native source too short");
    const hist=nineChapters.map(()=>new Int32Array(A));
    let offset=0;
    for(let j=0;j<hist.length;j++){
      for(let i=0;i<nineChapters[j].n;i++)hist[j][seq[offset+i]]++;
      offset+=nineChapters[j].n;
    }
    const windows=seq.length-fullN+1;
    let min=Infinity,positions=[],witness=null,localDoubletMin=Infinity,localDoubletPositions=[];
    for(let st=0;st<windows;st++){
      if(st){let off=0;for(let j=0;j<hist.length;j++){
        hist[j][seq[st-1+off]]--;
        hist[j][seq[st-1+off+nineChapters[j].n]]++;
        off+=nineChapters[j].n;
      }}
      let exceptions=0,postDoublet=0;const local=[];
      for(let j=0;j<hist.length;j++){
        let mx=0,leader=0;
        for(let k=0;k<A;k++)if(hist[j][k]>mx){mx=hist[j][k];leader=k;}
        const missing=Math.max(0,mx-nineChapters[j].cap);
        exceptions+=missing;
        postDoublet+=Math.max(0,missing-2*nineChapters[j].doublets);
        if(exceptions<=min)local.push({chapter:j,leader,n:mx,missing});
      }
      if(exceptions<min){min=exceptions;positions=[st];witness=local;}
      else if(exceptions===min&&positions.length<6)positions.push(st);
      if(postDoublet<localDoubletMin){localDoubletMin=postDoublet;localDoubletPositions=[st];}
      else if(postDoublet===localDoubletMin&&localDoubletPositions.length<6)localDoubletPositions.push(st);
    }
    assert(witness.length===9,"whole-book witness");
    return {windows,minimumExceptionalRUnes:min,positions,witness,
      minimumAfterAllDoubletAndSuccessorExceptions:localDoubletMin,
      doubletPositions:localDoubletPositions};
  }
  const controls=[];
  for(const [name,txt] of sources){
    const rec={name,variants:{}};
    for(const mode of ["legacy","greedy","latin"])for(const trim of [false,true]){
      const seq=gp(trim?body(txt,name.includes("shakespeare")):txt,mode);
      rec.variants[mode+"_"+(trim?"body":"full")]={...minMaxLetter(seq),fullBook:fullNativeDeficit(seq)};
      if(mode==="legacy"&&!trim)rec.maskedTriples=maskedTriple(seq);
    }
    controls.push(rec);
  }
  // Constructively plant one true two-chart differential sender with secret,
  // arbitrarily switching charts at every symbol, independent page IVs.
  let seed=3301;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0));
  function perm(){const p=R(A);for(let i=A-1;i>0;i--){let j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]];}return p;}
  const charts=[perm(),perm()],inverse=charts.map(p=>{let inv=new Int32Array(A);p.forEach((x,i)=>inv[x]=i);return inv;});
  const plain=gp(sources[0][1],"legacy").slice(0,N),observed=[],seen=R(A).map(()=>new Set());
  let cursor=0,decoded=0;
  for(const page of pages){
    let prev=rnd()%A;observed.push(prev);cursor++;
    for(let j=1;j<page.indices.length;j++){
      const letter=plain[cursor],state=rnd()%2,step=charts[state][letter];
      prev=(prev+step)%A;observed.push(prev);seen[letter].add(step);
      const got=inverse[state][step];assert(got===letter,"native plant inverse");decoded++;cursor++;
    }
  }
  assert(cursor===N&&decoded===N-pages.length&&seen.every(s=>s.size<=2),"two-chart plant");
  assert(controls.length===3&&controls.every(c=>Object.values(c.variants).every(v=>v.slack>0&&v.skipFNonFSlack>0&&v.maxF<literalFCount&&v.fullBook.minimumExceptionalRUnes>=190)),"all native controls reject both two-output conventions");
  assert(Math.min(...controls.flatMap(c=>Object.values(c.variants).map(v=>v.fullBook.minimumExceptionalRUnes)))===190,"best full-book minimum");
  assert(nineChapters.reduce((s,c)=>s+c.doublets,0)===86,"all original doublets");
  assert(Math.min(...controls.flatMap(c=>Object.values(c.variants).map(v=>v.fullBook.minimumAfterAllDoubletAndSuccessorExceptions)))===48,"worst doublet-local exception");
  return {nineChapters,source:{chapter:"p40-53",N,nonemptyPages:pages.length,transitions,triples,topDiff:sorted.slice(0,6),q2Capacity,uncontrolledPageInitials:pages.length,necessaryNativeMinimum:q2Capacity+pages.length+1,
      literalFCount,skipTransitions,skipTopDiff:skipSorted.slice(0,6),
      skipQ2Capacity,skipUncontrolledPageInitials:pages.length,
      skipNecessaryNonFMinimum:skipQ2Capacity+pages.length+1},
    trigramBoxes,controls,plant:{decoded,distinctResidualOutputsPerLetterMax:Math.max(...seen.map(s=>s.size))}};
}
module.exports={run};
if(require.main===module){
  const fs=require("node:fs"), read=p=>fs.readFileSync(p,"utf8");
  const names=["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];
  console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),names.map(n=>[n,read("resources/control/"+n)])),null,2));
}
