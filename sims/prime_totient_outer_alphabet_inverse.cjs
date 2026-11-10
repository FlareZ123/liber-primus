'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {inferAlphabet}=require('./outer_permutation_assignment.cjs');
const ROOT=path.join(__dirname,'..');
const CORPUS=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const SHAKESPEARE=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const EMERSON=fs.readFileSync(path.join(ROOT,'resources/control/emerson_essays_2944.txt'),'utf8');
const M=29,N=31,START=29,END=30,SPLIT_PAGE=28,translit=CORPUS.translit;
const mod=(x,n=M)=>((x%n)+n)%n;

function primeTape(count){
 const limit=Math.ceil(count*(Math.log(count)+Math.log(Math.log(count)))+500),composite=new Uint8Array(limit+1);
 for(let p=2;p*p<=limit;p++)if(!composite[p])for(let n=p*p;n<=limit;n+=p)composite[n]=1;
 const out=[];for(let p=2;p<=limit&&out.length<count;p++)if(!composite[p])out.push((p-1)%M);
 assert.equal(out.length,count);return out;
}
function sourcePages(){
 return CORPUS.pages.filter(p=>p.page<56&&p.indices.length).map(p=>{
  const parsed=base.lp2Page(p.page),words=[];let word=[];
  for(let i=0;i<parsed.xs.length;i++){
   if(parsed.start[i]&&word.length){words.push(word);word=[];}
   word.push(parsed.xs[i]);
   if(parsed.end[i]){words.push(word);word=[];}
  }
  if(word.length)words.push(word);
  assert.deepEqual(words.flat(),p.indices,'Canonical transcription segmentation must preserve page runes');
  return {page:p.page,words,length:p.indices.length};
 });
}
function buildData(pageRecords,reset,sign,tape,sigma=null){
 const flatC=[],flatK=[],flatPage=[],g1=[],g2=[],g3=[],gramPage=[],wordPositions=[];
 const expectedPlain=sigma?[]:null;let pointer=0;
 for(const page of pageRecords){
  if(reset)pointer=0;
  for(const word of page.words){
   const positions=[];
   for(const plainOrCipher of word){
    assert(pointer<tape.length,'Prime key tape exhausted');
    const key=tape[pointer++],cipher=sigma?sigma[mod(plainOrCipher+sign*key)]:plainOrCipher;
    positions.push(flatC.length);flatC.push(cipher);flatK.push(key);flatPage.push(page.page);
    if(expectedPlain)expectedPlain.push(plainOrCipher);
   }
   wordPositions.push({page:page.page,positions});
   const seq=[-1,...positions,-2];
   for(let i=0;i+2<seq.length;i++){g1.push(seq[i]);g2.push(seq[i+1]);g3.push(seq[i+2]);gramPage.push(page.page);}
  }
 }
 return {flatC,flatK,flatPage,g1:Int32Array.from(g1),g2:Int32Array.from(g2),g3:Int32Array.from(g3),gramPage,wordPositions,expectedPlain,sign,reset};
}
function subsetByPage(data,predicate){
 const a=[],b=[],c=[];
 for(let i=0;i<data.gramPage.length;i++)if(predicate(data.gramPage[i])){a.push(data.g1[i]);b.push(data.g2[i]);c.push(data.g3[i]);}
 return {flatC:data.flatC,flatK:data.flatK,flatPage:data.flatPage,g1:Int32Array.from(a),g2:Int32Array.from(b),g3:Int32Array.from(c),sign:data.sign,reset:data.reset};
}
function trainTrigrams(words){
 const uni=new Float64Array(N),bi=new Float64Array(N*N),tri=new Float64Array(N*N*N),biCtx=new Float64Array(N),triCtx=new Float64Array(N*N);
 for(const word of words){if(!word.length)continue;const s=[START,...word,END];
  for(const x of s)uni[x]++;
  for(let i=0;i+1<s.length;i++){bi[s[i]*N+s[i+1]]++;biCtx[s[i]]++;}
  for(let i=0;i+2<s.length;i++){const q=s[i]*N+s[i+1];tri[q*N+s[i+2]]++;triCtx[q]++;}
 }
 const total=uni.reduce((a,b)=>a+b,0),prior=Float64Array.from(uni,x=>(x+1)/(total+N)),logp=new Float64Array(N*N*N);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){const q=a*N+b;for(let c=0;c<N;c++){
  const back=(bi[b*N+c]+5*prior[c])/(biCtx[b]+5);
  logp[q*N+c]=Math.log((tri[q*N+c]+9*back)/(triCtx[q]+9));
 }}
 return {logp,prior,words:words.length};
}
function makeRandom(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function fitUnigram(data,lm,limit=SPLIT_PAGE){
 const c=[],k=[];for(let i=0;i<data.flatC.length;i++)if(data.flatPage[i]<limit){c.push(data.flatC[i]);k.push(data.flatK[i]);}
 return inferAlphabet(c,k,lm.prior.slice(0,M)).inverse;
}
function buildAffected(data){
 const sets=Array.from({length:M},()=>new Set());
 for(let g=0;g<data.g1.length;g++)for(const pos of [data.g1[g],data.g2[g],data.g3[g]])if(pos>=0)sets[data.flatC[pos]].add(g);
 return sets.map(s=>Int32Array.from(s));
}
function tokenAt(pos,inv,d){if(pos===-1)return START;if(pos===-2)return END;return mod(inv[d.flatC[pos]]-d.sign*d.flatK[pos]);}
function gramScore(g,inv,d,lm){const a=tokenAt(d.g1[g],inv,d),b=tokenAt(d.g2[g],inv,d),c=tokenAt(d.g3[g],inv,d);return lm.logp[(a*N+b)*N+c];}
function scoreAll(inv,d,lm){let s=0;for(let g=0;g<d.g1.length;g++)s+=gramScore(g,inv,d,lm);return s/Math.max(1,d.g1.length);}
function swapDelta(a,b,inv,d,lm,affected,marks,epoch){
 const stamp=++epoch.value,union=[];let old=0;
 for(const g of affected[a])if(marks[g]!==stamp){marks[g]=stamp;union.push(g);old+=gramScore(g,inv,d,lm);}
 for(const g of affected[b])if(marks[g]!==stamp){marks[g]=stamp;union.push(g);old+=gramScore(g,inv,d,lm);}
 const va=inv[a],vb=inv[b];inv[a]=vb;inv[b]=va;
 let neu=0;for(const g of union)neu+=gramScore(g,inv,d,lm);
 inv[a]=va;inv[b]=vb;
 return (neu-old)/Math.max(1,d.g1.length);
}
function anneal(d,lm,initial,seed,iters){
 const inv=initial.slice(),affected=buildAffected(d),marks=new Int32Array(d.g1.length),epoch={value:0},rand=makeRandom(seed);
 const initialScore=scoreAll(inv,d,lm);let current=initialScore,best=initialScore,bestInv=inv.slice(),deltas=[];
 for(let i=0;i<80;i++){let a=Math.floor(rand()*M),b=Math.floor(rand()*M);if(a===b)b=(b+1)%M;deltas.push(Math.abs(swapDelta(a,b,inv,d,lm,affected,marks,epoch)));}
 deltas.sort((a,b)=>a-b);const temp0=Math.max(.0005,deltas[40]*2);
 for(let it=0;it<iters;it++){
  const a=Math.floor(rand()*M);let b=Math.floor(rand()*M);if(a===b)b=(b+1)%M;
  const delta=swapDelta(a,b,inv,d,lm,affected,marks,epoch),temp=temp0*(1-it/iters)+temp0*.003;
  if(delta>=0||rand()<Math.exp(delta/temp)){[inv[a],inv[b]]=[inv[b],inv[a]];current+=delta;if(current>best){best=current;bestInv=inv.slice();}}
 }
 for(let round=0;round<5;round++){let bestDelta=0,bestA=-1,bestB=-1;
  for(let a=0;a<M;a++)for(let b=a+1;b<M;b++){const dlt=swapDelta(a,b,bestInv,d,lm,affected,marks,epoch);if(dlt>bestDelta+1e-12){bestDelta=dlt;bestA=a;bestB=b;}}
  if(bestA<0)break;[bestInv[bestA],bestInv[bestB]]=[bestInv[bestB],bestInv[bestA]];best+=bestDelta;
 }
 return {inverse:bestInv,initialScore,score:best,temp0,iterations:iters};
}
function decode(d,inv){return Uint8Array.from(d.flatC,(c,i)=>mod(inv[c]-d.sign*d.flatK[i]));}
function scoreDecoded(d,plain,lm){let s=0;for(let g=0;g<d.g1.length;g++){const v=p=>p===-1?START:p===-2?END:plain[p];s+=lm.logp[(v(d.g1[g])*N+v(d.g2[g]))*N+v(d.g3[g])];}return s/Math.max(1,d.g1.length);}
function preview(d,plain,minPage,maxPage){const words=[];for(const w of d.wordPositions)if(w.page>=minPage&&w.page<=maxPage)words.push(w.positions.map(pos=>translit[plain[pos]]).join(''));return words.join(' ');}
function forwardCheck(d,inv,plain){const sigma=Array(M);for(let c=0;c<M;c++)sigma[inv[c]]=c;for(let i=0;i<d.flatC.length;i++)if(sigma[mod(plain[i]+d.sign*d.flatK[i])]!==d.flatC[i])return false;return true;}
function fillHeldoutPages(words,targets){
 let wi=0,carry=null;return targets.map(t=>{let remaining=t.length;const out=[];while(remaining>0){const next=carry||words[wi++];assert(next&&next.length,'Heldout English exhausted');if(next.length<=remaining){out.push(next);remaining-=next.length;carry=null;}else{out.push(next.slice(0,remaining));carry=next.slice(remaining);remaining=0;}}return{page:t.page,words:out,length:t.length};});
}
function inversePermutation(sigma){const inv=Array(M);for(let i=0;i<M;i++)inv[sigma[i]]=i;return inv;}
function positiveControl(targetPages,tape,lm,reset){
 const heldout=base.corpusWords(SHAKESPEARE.slice(240000)).filter(w=>w.length),plainPages=fillHeldoutPages(heldout,targetPages),rand=makeRandom(0x3301c1ca+(reset?0:1));
 const sigma=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>0;i--){const j=Math.floor(rand()*(i+1));[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
 const d=buildData(plainPages,reset,1,tape,sigma),train=subsetByPage(d,p=>p<SPLIT_PAGE),initial=fitUnigram(d,lm),fitted=anneal(train,lm,initial,reset?0x5eed3301:0x5eed3302,90000),recovered=decode(d,fitted.inverse);
 let correct=0,count=0;for(let i=0;i<d.flatPage.length;i++)if(d.flatPage[i]>=SPLIT_PAGE){count++;if(recovered[i]===d.expectedPlain[i])correct++;}
 const exact=fitted.inverse.every((x,i)=>x===inversePermutation(sigma)[i]);
 assert(forwardCheck(d,fitted.inverse,recovered),'Positive control must re-encrypt exactly');
 assert(correct/count>.90,'Positive control must recover >90% of held-out runes');
 return{keyClock:reset?'page-reset':'global',fitScore:fitted.score,heldoutRuneAccuracy:correct/count,exactAlphabetRecovered:exact,preview:preview(d,recovered,SPLIT_PAGE,SPLIT_PAGE+2).slice(0,500)};
}
function run(){
 const pages=sourcePages(),total=pages.reduce((s,p)=>s+p.length,0);assert.equal(pages.length,55);assert.equal(total,12956);
 const tape=primeTape(total),sh=base.corpusWords(SHAKESPEARE.slice(0,240000)).filter(w=>w.length),em=base.corpusWords(EMERSON).filter(w=>w.length);
 const lmSh=trainTrigrams(sh),lmEm=trainTrigrams(em);
 const positive=[positiveControl(pages,tape,lmSh,true),positiveControl(pages,tape,lmSh,false)],results=[];
 for(const reset of [true,false]){
  const d=buildData(pages,reset,1,tape),train=subsetByPage(d,p=>p<SPLIT_PAGE),hold=subsetByPage(d,p=>p>=SPLIT_PAGE);
  const initial=fitUnigram(d,lmSh),fitted=anneal(train,lmSh,initial,reset?0x10101010:0x20202020,45000),plain=decode(d,fitted.inverse),identity=Array.from({length:M},(_,i)=>i);
  results.push({
   keyClock:reset?'prime2 reset at each physical LP2 page':'one continuous prime2 stream across LP2',
   outerAlphabet:'one global unknown 29-symbol permutation fitted on physical pages 0-27',
   initialUnigramScore:fitted.initialScore,
   fittedTrainShakespeareScore:scoreDecoded(train,plain,lmSh),
   heldoutShakespeareScore:scoreDecoded(hold,plain,lmSh),
   heldoutEmersonScore:scoreDecoded(hold,plain,lmEm),
   identityAlphabetHeldoutShakespeareScore:scoreDecoded(hold,decode(d,identity),lmSh),
   exactForwardReencryption:forwardCheck(d,fitted.inverse,plain),
   inversePermutation:fitted.inverse,
   heldoutPreview:preview(d,plain,28,31).slice(0,700)
  });
 }
 return{
  hypothesis:'Reuse the solved p56 prime-totient key under one unknown global outer substitution: C_i = sigma(P_i + K_i mod 29).',
  sourceKey:'K_j=(p_j-1) mod 29, consecutive primes beginning at 2; no free start, no free key, no hidden skips.',
  originalInput:{physicalPages:pages.map(p=>p.page),runeCount:total,wordBoundaries:'canonical lp2-transcription parser'},
  split:'Fit only on physical pages 0-27; hold out pages 28-55.',
  languageModels:{fit:'Shakespeare first 240,000 characters, GP digraph encoding, word-bounded smoothed character trigrams',independentHoldout:'Emerson essays, same GP encoding and word-bounded trigram scoring'},
  positiveControl:positive,results,
  interpretation:'Support requires coherent held-out plaintext under both language models with one fixed source key and one global permutation. Additional key skips, per-section alphabets, and other stateful ciphers are outside this test.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,primeTape,sourcePages,buildData,trainTrigrams,fitUnigram,anneal,decode};
