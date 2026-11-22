'use strict';
/**
 * Full original-input GIMP 314159265 GRand keyskip hypothesis.
 * The historical image-rendering RNG is documented, but cipher use is conjecture.
 * Per-rune key rejection is permitted only if its first proposal would duplicate
 * the immediately preceding ciphertext rune; at most one extra draw.
 * SFT: node sims/gimp_seed_stream_keyskip_inverse.cjs
 * @module gimp_seed_stream_keyskip_inverse
 */
const MOD=29, CAP=30, N=729, SKIP_PENALTY=3.5;
const mod=x=>(x%MOD+MOD)%MOD;
/** A smoothed native-GP trigram model from the independent solved book. */
function train(reference){
  const u=new Uint32Array(MOD),b=new Uint32Array(MOD**2),t=new Uint32Array(MOD**3);
  for(let i=0;i<reference.length;i++){
    u[reference[i]]++;
    if(i)b[reference[i-1]*MOD+reference[i]]++;
    if(i>1)t[(reference[i-2]*MOD+reference[i-1])*MOD+reference[i]]++;
  }
  const U=Float64Array.from(u,v=>Math.log((v+1)/(reference.length+MOD)));
  const B=Float64Array.from(b,(_,k)=>Math.log(
    (b[k]+12*Math.exp(U[k%MOD]))/(u[Math.floor(k/MOD)]+12)));
  const T=Float64Array.from(t,(_,k)=>Math.log(
    (t[k]+9*Math.exp(B[k%(MOD**2)]))/(b[Math.floor(k/MOD)]+9)));
  return {U,B,T};
}
/**
 * Exact max-score state inference for known fixed pad. DP state=(total
 * extra draws E, whether most recent position consumed one extra draw).
 * A proposed skip is legal only for a previous-ciphertext collision.
 */
function viterbi(cipher,key,sign,lm){
  const n=cipher.length,w=2*(CAP+1);
  if(n!==N||key.length<n+CAP)throw Error('Invalid source length');
  const dec=(i,E)=>mod(cipher[i]-sign*key[i+E]);
  let dp=new Float64Array(w).fill(-Infinity);
  const back=new Int16Array(n*w).fill(-1),p0=dec(0,0);
  for(let rejected=0;rejected<=1;rejected++){
    const p=dec(1,rejected);
    if(rejected&&mod(p+sign*key[1])!==cipher[0])continue;
    dp[rejected*2+rejected]=lm.U[p0]+lm.B[p0*MOD+p]
      -SKIP_PENALTY*rejected;
  }
  for(let i=2;i<n;i++){
    const next=new Float64Array(w).fill(-Infinity);
    for(let E=0;E<=CAP;E++)for(let previousSkip=0;previousSkip<=1;previousSkip++){
      const state=2*E+previousSkip,base=dp[state];
      if(!Number.isFinite(base))continue;
      const pp=dec(i-1,E),ppp=dec(i-2,E-previousSkip);
      for(let rejected=0;rejected<=1&&E+rejected<=CAP;rejected++){
        const p=dec(i,E+rejected);
        if(rejected&&mod(p+sign*key[i+E])!==cipher[i-1])continue;
        const score=base+lm.T[(ppp*MOD+pp)*MOD+p]
          -SKIP_PENALTY*rejected;
        const nextState=2*(E+rejected)+rejected;
        if(score>next[nextState]){
          next[nextState]=score;
          back[i*w+nextState]=state;
        }
      }
    }
    dp=next;
  }
  let best=-Infinity,state=-1;
  for(let j=0;j<w;j++)if(dp[j]>best){best=dp[j];state=j;}
  if(state<0||!Number.isFinite(best))throw Error('No valid Viterbi state');
  const skips=Math.floor(state/2),plaintext=new Array(n),flags=new Array(n).fill(0);
  for(let i=n-1;i>=1;i--){
    flags[i]=state%2;
    plaintext[i]=dec(i,Math.floor(state/2));
    if(i>=2)state=back[i*w+state];
  }
  plaintext[0]=p0;
  return {score:best,perRune:best/n,skips,plaintext,flags};
}
/** Exact original-cipher forward regeneration given inferred skip witnesses. */
function reencrypt(plain,key,sign,flags){
  let extra=0,previous=-1;
  const cipher=[];
  for(let i=0;i<plain.length;i++){
    let proposed=mod(plain[i]+sign*key[i+extra]);
    if(flags[i]){
      if(i===0||proposed!==previous)
        throw Error('Unjustified collision-rejection flag');
      extra++;
      proposed=mod(plain[i]+sign*key[i+extra]);
    }
    cipher.push(proposed);
    previous=proposed;
  }
  return cipher;
}
function plant(plain,key,sign){
  let extra=0,previous=-1,rng=0x34aad151,skips=0;
  const out=[];
  for(let i=0;i<plain.length;i++){
    let c=mod(plain[i]+sign*key[i+extra]);
    if(i&&c===previous){
      rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
      if((rng>>>0)/4294967296<0.81){
        extra++;skips++;c=mod(plain[i]+sign*key[i+extra]);
      }
    }
    out.push(c);previous=c;
  }
  return {out,skips};
}
function run(corpus,reference,lib){
  const cipher=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  if(cipher.length!==N)throw Error('Expected exactly 729 source runes');
  const gp=lib.englishGP(reference,corpus.translit);
  if(gp.length<2929)throw Error('GP reference too short');
  const language=train(gp.slice(0,2200)),sourcePlant=gp.slice(-N);
  const rows=[];
  for(const type of ['raw','byte255','range29']){
    const next=lib.mt(314159265),key=[];
    for(let i=0;i<N+CAP;i++)
      key.push((type==='raw'?next():
        lib.intRange(next,type==='byte255'?255:29))%MOD);
    for(const sign of [-1,1]){
      const result=viterbi(cipher,key,sign,language);
      const recipher=reencrypt(result.plaintext,key,sign,result.flags);
      if(recipher.some((c,i)=>c!==cipher[i]))
        throw Error('Original LP2 exact recipher failed');
      const fake=plant(sourcePlant,key,sign);
      const positive=viterbi(fake.out,key,sign,language);
      const matches=positive.plaintext.filter((c,i)=>c===sourcePlant[i]).length;
      const proof=reencrypt(positive.plaintext,key,sign,positive.flags);
      if(proof.some((c,i)=>c!==fake.out[i]))
        throw Error('Source-native plant recipher failed');
      rows.push({type,sign,originalScore:result.perRune,
        inferredOriginalSkips:result.skips,
        originalExactRecipher:recipher.length,
        originalFirst60:result.plaintext.slice(0,60)
          .map(i=>corpus.translit[i]).join(''),
        plant:{trueSkips:fake.skips,recoveredSkips:positive.skips,
          exactPlainMatches:matches,of:N,score:positive.perRune}});
    }
  }
  rows.sort((a,b)=>b.originalScore-a.originalScore);
  return {model:'Fixed GLib GRand seed314159265 contiguous master pad, six signed/reduced keys, skip only on previous output collision',
    sourceRunes:N,sourceNativeTrainingRunes:2200,capExtraDraws:CAP,
    skipPenalty:SKIP_PENALTY,ranked:rows,
    note:'Source generator authenticated as a GIMP rendering mechanism; no evidence the Cicada LP2 cipher used it. No original plaintext or authentic key recovered.'};
}
if(typeof module!=='undefined')
  module.exports={train,viterbi,reencrypt,plant,run};
if(typeof require==='function'&&require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const root=path.join(__dirname,'..');
  const corpus=JSON.parse(fs.readFileSync(path.join(root,
    'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const ref=fs.readFileSync(path.join(root,
    'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
  const lib=require('./gimp_dissolve_source_pad_gate.cjs');
  console.log(JSON.stringify(run(corpus,ref,lib),null,2));
}
