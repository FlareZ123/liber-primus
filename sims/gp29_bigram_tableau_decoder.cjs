"use strict";

/**
 * Reusable permutation-tableau decoder for GP29 ciphertext.
 *
 * The caller supplies a fixed *observed* key-row label for every ciphertext
 * rune. This cannot infer hidden key skips or discover an author-selected
 * key stream. Every output row is an unrestricted 29-symbol permutation;
 * the solver estimates its inverse using a reference GP bigram language
 * model and rowwise maximum-weight matching (Hungarian algorithm).
 *
 * It never requires the true plaintext or table. Unknown plain runes can
 * remain entirely unconstrained; optional genuine source cribs are fixed.
 * All computations are deterministic, idempotent, read-only and CommonJS.
 *
 * Source-neutral module; run with Node 22 on Windows 11 or CI.
 */

const N=29;

/**
 * Generate smoothed log-probabilities of GP29 bigrams from an independent
 * reference rune array.
 * @param {number[]} reference
 * @param {number} alpha
 * @returns {{unigram:number[],bigram:number[][],logProb:number[][]}}
 */
function languageModel(reference,alpha=3) {
  const unigram=Array(N).fill(0);
  const bigram=Array.from({length:N},()=>Array(N).fill(0));
  for(let i=0;i<reference.length;i++) {
    const r=reference[i];
    unigram[r]++;
    if(i>0)bigram[reference[i-1]][r]++;
  }
  const logProb=Array.from({length:N},(_,p)=>
    Array.from({length:N},(_,q)=>
      Math.log((bigram[p][q]+alpha)/(unigram[p]+N*alpha))));
  return {unigram,bigram,logProb};
}

/**
 * Exact square minimum-cost bipartite assignment. Returns the unique
 * selected column for each input row. Ties have deterministic order.
 * @param {number[][]} cost
 * @returns {number[]}
 */
function hungarian(cost) {
  const n=cost.length;
  const u=new Float64Array(n+1);
  const v=new Float64Array(n+1);
  const p=new Int32Array(n+1);
  const way=new Int32Array(n+1);
  for(let i=1;i<=n;i++) {
    p[0]=i;
    let j0=0;
    const best=new Float64Array(n+1).fill(Infinity);
    const used=new Uint8Array(n+1);
    do {
      used[j0]=1;
      const i0=p[j0];
      let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++) {
        if(used[j])continue;
        const candidate=cost[i0-1][j-1]-u[i0]-v[j];
        if(candidate<best[j]) {
          best[j]=candidate;
          way[j]=j0;
        }
        if(best[j]<delta) {
          delta=best[j];j1=j;
        }
      }
      for(let j=0;j<=n;j++) {
        if(used[j]) {
          u[p[j]]+=delta;
          v[j]-=delta;
        } else best[j]-=delta;
      }
      j0=j1;
    } while(p[j0]!==0);
    do {
      const next=way[j0];
      p[j0]=p[next];
      j0=next;
    } while(j0!==0);
  }
  const assignment=Array(n).fill(-1);
  for(let j=1;j<=n;j++)assignment[p[j]-1]=j-1;
  return assignment;
}

/**
 * @typedef {{position:number,rune:number}} KnownRune
 * @typedef {{inverseTableau:number[][],plaintext:number[],trace:{sweep:number,logLikelihood:number}[],languageLogLikelihood:number}} DecodedTableau
 */

/**
 * Fit a complete 29x29 inverse tableau using GP29 first-order language
 * and exact rowwise matching. The source text and correctness labels
 * are NEVER referenced to select row mappings.
 *
 * @param {number[]} cipher Flat original GP29 rune indices
 * @param {number[]} rowHistory Fixed true/candidate row label at each input position
 * @param {{unigram:number[],logProb:number[][]}} model independent GP language model
 * @param {{known?:KnownRune[],sweeps?:number}} options
 * @returns {DecodedTableau}
 */
function recoverTableau(cipher,rowHistory,model,options={}) {
  if(cipher.length!==rowHistory.length)
    throw new RangeError("Ciphertext and key-row history require identical lengths");
  const n=cipher.length;
  const counts=Array.from({length:N},()=>Array(N).fill(0));
  const known=Array.from({length:N},()=>new Map());
  for(let i=0;i<n;i++)
    counts[rowHistory[i]][cipher[i]]++;
  for(const {position,rune} of options.known||[]) {
    const r=rowHistory[position],c=cipher[position];
    const old=known[r].get(c);
    if(old!==undefined&&old!==rune)
      throw new Error("Conflicting plaintext for one row/cipher symbol");
    known[r].set(c,rune);
  }
  const map=Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<N;r++) {
    const used=new Set(known[r].values());
    if(used.size!==known[r].size)
      throw new Error("Known plaintext violates inverse permutation");
    const freeCipher=Array.from({length:N},(_,i)=>i)
      .filter(c=>!known[r].has(c))
      .sort((a,b)=>counts[r][b]-counts[r][a]||a-b);
    const freePlain=Array.from({length:N},(_,i)=>i)
      .filter(p=>!used.has(p))
      .sort((a,b)=>model.unigram[b]-model.unigram[a]||a-b);
    for(const [c,p] of known[r])map[r][c]=p;
    freeCipher.forEach((c,i)=>map[r][c]=freePlain[i]);
  }
  const trace=[];
  const sweeps=options.sweeps??12;
  for(let sweep=0;sweep<sweeps;sweep++) {
    const decoded=cipher.map((c,i)=>map[rowHistory[i]][c]);
    for(let rr=0;rr<N;rr++) {
      const r=sweep%2?N-1-rr:rr;
      const scores=Array.from({length:N},()=>new Float64Array(N));
      for(let i=0;i<n;i++) {
        if(rowHistory[i]!==r)continue;
        const c=cipher[i];
        for(let p=0;p<N;p++) {
          if(i>0)scores[c][p]+=model.logProb[decoded[i-1]][p];
          if(i+1<n)scores[c][p]+=model.logProb[p][decoded[i+1]];
        }
      }
      const freeCipher=Array.from({length:N},(_,i)=>i)
        .filter(c=>!known[r].has(c));
      const used=new Set(known[r].values());
      const freePlain=Array.from({length:N},(_,i)=>i)
        .filter(p=>!used.has(p));
      const assignment=hungarian(
        freeCipher.map(c=>freePlain.map(p=>-scores[c][p])));
      for(const [c,p] of known[r])map[r][c]=p;
      freeCipher.forEach((c,i)=>map[r][c]=freePlain[assignment[i]]);
      for(let i=0;i<n;i++)if(rowHistory[i]===r)
        decoded[i]=map[r][cipher[i]];
    }
    let score=0;
    for(let i=1;i<n;i++)
      score+=model.logProb[decoded[i-1]][decoded[i]];
    trace.push({sweep:sweep+1,logLikelihood:score});
  }
  const plaintext=cipher.map((c,i)=>map[rowHistory[i]][c]);
  return {inverseTableau:map,plaintext,trace,
    languageLogLikelihood:trace.at(-1)?.logLikelihood??0};
}
module.exports={languageModel,recoverTableau};
