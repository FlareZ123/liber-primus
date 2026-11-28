'use strict';
// Issue #3262: granted-true-q8-action, phase-blind native language receiver.
// No LP2 unknown ciphertext or oracle word phases are used by this decoder.
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..');
function load(p){return fs.readFileSync(path.join(ROOT,p),'utf8');}
function json(p){return JSON.parse(load(p));}
const N=29, SYM='0123456789abcdefghijklmnopqrs';
const ALPHA=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','ING','OE','D','A','AE','Y','IA','EA'];
const native=json('resources/external/relikd-solved-gp29-native-v1.json');
const planted=json('im-results/lp2-q8-seven-crib-conditional-chart-recovery.json');
const index=new Map(native.runes.map((r,i)=>[r,i]));
const rngFactory=(seed)=>{let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;}};
const words=(source)=>[...(source.matchAll(/[\u16a0-\u16ff]+/g))].map(x=>[...x[0]].map(c=>{assert(index.has(c));return index.get(c);}));
const gpword=(xs)=>xs.map(i=>SYM[i]).join('');
const roman=(xs)=>xs.map(i=>ALPHA[i]).join('');
function normalize(w){return w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Q/g,'C').replace(/Z/g,'S');}
const englishText=['resources/control/gibran_prophet_58585.txt','resources/control/emerson_essays_2944.txt'].map(load).join('\n');
const english=(englishText.match(/[A-Za-z]+/g)||[]).map(normalize).filter(w=>w.length>=1&&w.length<=30);
const nativeSections=native.sections.map(s=>({name:s.name,words:words(s.source_text)}));
const known=planted.cases.filter(c=>c.world==='common');
assert.strictEqual(known.length,2);
const trueActions=known.map(c=>{assert(c.solutions.length===1);const x=c.solutions[0];assert(x.planted_action_recovered);return x;});
function makeCounts(held){
  const all=english.concat(...nativeSections.filter(s=>s.name!==held).map(s=>s.words.map(roman)));
  const uni=new Map(),prev=new Map(),pairs=new Map(),lengths=new Map(),chr=new Map(),prefix=new Map();
  for(const w of all){
    uni.set(w,(uni.get(w)||0)+1);lengths.set(w.length,(lengths.get(w.length)||0)+1);
    let a='^^';for(const c of w+'$'){const k=a+c;chr.set(k,(chr.get(k)||0)+1);prefix.set(a,(prefix.get(a)||0)+1);a=(a+c).slice(-2);}
  }
  const a=all.map(x=>'^'+x+'$');
  for(const seq of [english,...nativeSections.filter(s=>s.name!==held).map(s=>s.words.map(roman))]){
    for(let j=1;j<seq.length;j++){const x=seq[j-1],y=seq[j];prev.set(x,(prev.get(x)||0)+1);const p=x+'\t'+y;pairs.set(p,(pairs.get(p)||0)+1);}
  }
  const total=all.length,uniq=uni.size,unkMass=.04;
  function oov(w){
    let x='^^',score=0;
    for(const c of w+'$'){const pair=x+c;score+=Math.log(((chr.get(pair)||0)+.2)/((prefix.get(x)||0)+.2*27));x=(x+c).slice(-2);}
    const lenprob=((lengths.get(w.length)||0)+.1)/(total+.1*40);
    return Math.max(1e-90,unkMass*lenprob*Math.exp(score));
  }
  function uniProb(w){return (1-unkMass)*((uni.get(w)||0)/total)+oov(w);}
  function pairProb(x,y){const n=prev.get(x)||0,v=pairs.get(x+'\t'+y)||0;return (v+12*uniProb(y))/(n+12);}
  return {seen:w=>uni.has(w),uniProb,pairProb,training:total,types:uniq};
}
function encrypt(p,pi,key,start){
  const inv=Array(N);pi.forEach((v,i)=>inv[v]=i);let phase=start,out=[];
  for(const x of p){if(x===0){out.push(0);}else{out.push(inv[(pi[x]+key[phase])%N]);phase=(phase+1)&7;}}
  return out;
}
function inverse(c,pi,key){
  const inv=Array(N);pi.forEach((v,i)=>inv[v]=i);
  const ans=new Map();
  function rec(i,phase,got,start){
    if(i===c.length){const g=gpword(got),w=roman(got);let obj=ans.get(g);if(!obj){obj={w,gp:g,starts:[]};ans.set(g,obj);}if(!obj.starts.includes(start))obj.starts.push(start);return;}
    if(c[i]===0){got.push(0);rec(i+1,phase,got,start);got.pop();}
    const decoded=inv[((pi[c[i]]-key[phase])%N+N)%N];
    if(decoded!==0){got.push(decoded);rec(i+1,(phase+1)&7,got,start);got.pop();}
  }
  for(let j=0;j<8;j++)rec(0,j,[],j);
  return [...ans.values()].map(x=>({...x,starts:x.starts.sort()}));
}
function shuffle(xs,rng){let a=xs.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function logadd(a,b){if(a===-Infinity)return b;if(b===-Infinity)return a;let m=Math.max(a,b);return m+Math.log(Math.exp(a-m)+Math.exp(b-m));}
function lse(xs){return xs.reduce(logadd,-Infinity);}
function infer(arr,model,ordered){
  const q=arr.map(v=>v.length), n=arr.length;
  assert(q.every(x=>x>0));
  const lex=arr.map(v=>v.map(x=>Math.log(model.uniProb(x.w))+Math.log(x.starts.length/8)));
  if(!ordered){
    const post=lex.map(row=>{let z=lse(row);return row.map(x=>Math.exp(x-z));});
    return {logZ:lex.reduce((v,row)=>v+lse(row),0),post};
  }
  const forward=[],backward=Array(n);
  forward[0]=lex[0].slice();
  for(let t=1;t<n;t++){
    forward[t]=arr[t].map((v,j)=>{
      const terms=arr[t-1].map((prev,k)=>forward[t-1][k]+Math.log(model.pairProb(prev.w,v.w)));
      return Math.log(v.starts.length/8)+lse(terms);
    });
  }
  const z=lse(forward[n-1]);
  backward[n-1]=Array(q[n-1]).fill(0);
  for(let t=n-2;t>=0;t--){
    backward[t]=arr[t].map((v,i)=>lse(arr[t+1].map((next,j)=>
      Math.log(model.pairProb(v.w,next.w))+Math.log(next.starts.length/8)+backward[t+1][j])));
  }
  const post=arr.map((v,t)=>v.map((x,i)=>Math.exp(forward[t][i]+backward[t][i]-z)));
  for(const row of post){assert(Math.abs(row.reduce((a,b)=>a+b,0)-1)<1e-5);}
  return {logZ:z,post};
}
function metrics(arr,inferred,truth,starts,model){
  let top=0,topPhase=0,cover90=0,phaseProb=0,wordProb=0,confWrong=0,anyAmb=0,phaseMult=0,oov=0;
  const bins=Array.from({length:10},()=>({n:0,hit:0,confidenceSum:0}));
  const examples=[];
  for(let i=0;i<arr.length;i++){
    const row=arr[i],pr=inferred.post[i],trueW=roman(truth[i]);
    const idx=row.findIndex(v=>v.gp===gpword(truth[i]));
    assert(idx>=0,'true plaintext missing at '+i+' '+trueW);
    assert(row[idx].starts.includes(starts[i]),'true start missing');
    let best=pr.indexOf(Math.max(...pr)),confidence=pr[best],hit=row[best].gp===gpword(truth[i]);
    const bin=Math.min(9,Math.floor(confidence*10));
    bins[bin].n++;bins[bin].hit+=Number(hit);bins[bin].confidenceSum+=confidence;
    top+=Number(hit);confWrong+=Number(!hit&&confidence>=.95);
    wordProb+=pr[idx];phaseProb+=pr[idx]/row[idx].starts.length;
    phaseMult+=Number(row[idx].starts.length>1);
    oov+=Number(!model.seen(trueW));
    anyAmb+=Number(row.length>1);
    const sb=[...row.keys()].sort((a,b)=>pr[b]-pr[a]);let cumulative=0;
    for(const v of sb){cumulative+=pr[v];if(v===idx){cover90++;break;}if(cumulative>=.9)break;}
    let phaseBest=-1,phaseBestProb=-1;
    for(let j=0;j<row.length;j++)for(const start of row[j].starts){const p=pr[j]/row[j].starts.length;if(p>phaseBestProb){phaseBestProb=p;phaseBest=start;}}
    topPhase+=Number(phaseBest===starts[i]);
    if(!hit&&examples.length<4)examples.push({i,truth:trueW,choice:row[best].w,confidence:+confidence.toFixed(4),truePosterior:+pr[idx].toFixed(4),alternatives:row.length});
  }
  return {n:arr.length,top,topPhase,cover90,wordProb,phaseProb,confWrong,ambiguous:anyAmb,phaseMult,oov,bins,examples};
}
function pool(rows,metric){let total=0,correct=0,phase=0,credible=0,sumP=0,sumPhase=0,wrong=0,amb=0,pm=0,oov=0,bins=Array.from({length:10},()=>({n:0,hit:0,confidenceSum:0}));for(const r of rows){const v=r[metric];total+=v.n;correct+=v.top;phase+=v.topPhase;credible+=v.cover90;sumP+=v.wordProb;sumPhase+=v.phaseProb;wrong+=v.confWrong;amb+=v.ambiguous;pm+=v.phaseMult;oov+=v.oov;for(let i=0;i<10;i++){bins[i].n+=v.bins[i].n;bins[i].hit+=v.bins[i].hit;bins[i].confidenceSum+=v.bins[i].confidenceSum;}}
  return {words:total,top1:correct,top1_rate:correct/total,phase_top1:phase,phase_rate:phase/total,mean_true_word_p:sumP/total,mean_true_phase_p:sumPhase/total,coverage90:credible/total,confident_wrong95:wrong,ambiguous:amb,true_with_multiple_starts:pm,true_OOV:oov,
    reliability:bins.map((b,i)=>({bin:i,n:b.n,mean_conf:b.n?b.confidenceSum/b.n:null,accuracy:b.n?b.hit/b.n:null})).filter(b=>b.n)};
}
const selected=[];
for(const section of nativeSections){
  const w=section.words;
  if(w.length>=36){
    selected.push({name:section.name+':first',section:section.name,words:w.slice(0,Math.min(24,w.length))});
    selected.push({name:section.name+':last',section:section.name,words:w.slice(-Math.min(24,w.length))});
  }else selected.push({name:section.name+':all',section:section.name,words:w});
}
const outputs=[];
for(let plant=0;plant<2;plant++){
  const action=trueActions[plant],pi=action.pi;
  const modelCache=new Map();
  for(let k=0;k<selected.length;k++){
    const sec=selected[k];
    let model=modelCache.get(sec.section);
    if(!model){model=makeCounts(sec.section);modelCache.set(sec.section,model);}
    const core=['jpg229','p57_parable','p56_an_end'].indexOf(sec.section);
    const key=core>=0?action.keys[core]:(()=>{const r=rngFactory(8128+plant*103+sec.section.length*29+k);return Array.from({length:8},()=>Math.floor(r()*N));})();
    const rng=rngFactory(92023+plant*1007+k*121);
    const starts=sec.words.map(()=>Math.floor(rng()*8));
    const cipher=sec.words.map((w,i)=>encrypt(w,pi,key,starts[i]));
    const sets=cipher.map(w=>inverse(w,pi,key));
    const truth=sec.words;
    const bag=infer(sets,model,false), ordered=infer(sets,model,true);
    const bagM=metrics(sets,bag,truth,starts,model),orderM=metrics(sets,ordered,truth,starts,model);
    const perm=shuffle([...Array(sets.length).keys()],rng);
    const falseOrder=infer(perm.map(i=>sets[i]),model,true);
    const falseMetrics=metrics(perm.map(i=>sets[i]),falseOrder,perm.map(i=>truth[i]),perm.map(i=>starts[i]),model);
    const shuffleZ=[falseOrder.logZ];
    for(let trial=1;trial<31;trial++)shuffleZ.push(infer(shuffle(sets,rng),model,true).logZ);
    const shuffleP=(1+shuffleZ.filter(z=>z>=ordered.logZ-1e-10).length)/32;
    const falseBag=infer(perm.map(i=>sets[i]),model,false);
    assert(Math.abs(bag.logZ-falseBag.logZ)<1e-6);
    const decoy=cipher.map(x=>x.slice());
    let changed=0;
    for(let j=1;j<decoy.length;j+=5){
      if(decoy[j].length>1){const t=decoy[j-1].concat(decoy[j]);decoy[j-1]=t.slice(0,decoy[j-1].length+1);decoy[j]=t.slice(decoy[j-1].length);changed+=2;}
      else if(decoy[j-1].length>1){const t=decoy[j-1].concat(decoy[j]);const cut=decoy[j-1].length-1;decoy[j-1]=t.slice(0,cut);decoy[j]=t.slice(cut);changed+=2;}
    }
    const decoySets=decoy.map(w=>inverse(w,pi,key));
    const decoyModel=infer(decoySets,model,true);
    outputs.push({plant,name:sec.name,groups:truth.length,runes:truth.reduce((a,w)=>a+w.length,0),changed,
      scores:{ordered:ordered.logZ,bag:bag.logZ,shuffle:falseOrder.logZ,decoy:decoyModel.logZ,shuffleP},
      bag:bagM,ordered:orderM,falseOrder:falseMetrics});
  }
}
function countwins(a,b){let w=0,t=0;for(const x of outputs){if(x.scores[a]>x.scores[b]+1e-8)w++;else if(Math.abs(x.scores[a]-x.scores[b])<=1e-8)t++;}return {wins:w,ties:t,total:outputs.length};}
const summary={status:'true action only, no phase oracle, no original unknown LP2; synthetic phase-masked solved-native controls',
  sources:{native:'resources/external/relikd-solved-gp29-native-v1.json',charts:'im-results/lp2-q8-seven-crib-conditional-chart-recovery.json',
    general_language:'Gibran Gutenberg 58585 + Emerson Gutenberg 2944 + leave-one-source-out solved native; fixed unknown-word mass 0.04, bigram backoff 12'},
  controls:outputs.length,word_groups:outputs.reduce((s,x)=>s+x.groups,0),runes:outputs.reduce((s,x)=>s+x.runes,0),
  bag:pool(outputs,'bag'),ordered:pool(outputs,'ordered'),false_order:pool(outputs,'falseOrder'),
  order_permutation:{n:outputs.length,significant_p_le_005:outputs.filter(x=>x.scores.shuffleP<=.05).length,
    median_p:outputs.map(x=>x.scores.shuffleP).sort((a,b)=>a-b)[Math.floor(outputs.length/2)]},
  wins:{ordered_vs_shuffled:countwins('ordered','shuffle'),ordered_vs_decoy:countwins('ordered','decoy')},
  mean_per_word_margin:{shuffle:outputs.reduce((s,x)=>s+(x.scores.ordered-x.scores.shuffle)/x.groups,0)/outputs.length,
    decoy:outputs.reduce((s,x)=>s+(x.scores.ordered-x.scores.decoy)/x.groups,0)/outputs.length},
  examples:outputs.filter(x=>x.ordered.examples.length).slice(0,4).map(x=>({sample:x.name,wrong:x.ordered.examples})),
  cases:outputs.map(x=>({plant:x.plant,name:x.name,n:x.groups,ambiguous:x.ordered.ambiguous,phaseMulti:x.ordered.phaseMult,
    top_ordered:x.ordered.top,top_bag:x.bag.top,confident_wrong:x.ordered.confWrong,
    ordered_vs_shuffle:+(x.scores.ordered-x.scores.shuffle).toFixed(3),
    ordered_vs_decoy:+(x.scores.ordered-x.scores.decoy).toFixed(3),shuffle_p:x.scores.shuffleP}))
};
console.log('Q8_PHASE_NATIVE_RECEIVER_SUMMARY='+JSON.stringify(summary));
const output=process.env.RUNNER_TEMP;
if(output)fs.writeFileSync(path.join(output,'source-test-output.json'),JSON.stringify({summary,cases:outputs},null,2));
assert(outputs.length>=20);
