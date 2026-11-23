'use strict';

/**
 * LP2 opening 729-rune 27x27 plain-column-transposition original-cipher gate.
 *
 * Original uses three physical pages and the exact canonical 29-rune index register.
 * No secret permutations are selected: a maximum-weight assignment yields an
 * optimistic *upper bound* on the language score of every column permutation.
 * Independent per-edge reversal and cyclic shifts are an additional relaxation.
 *
 * Run: node sims/lp2_p0_729_27square_allcolumn_assignment_original_sft.cjs
 */
const fs = require('node:fs');
const pathLib = require('node:path');
const assert = require('node:assert/strict');

const root = pathLib.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(pathLib.join(root, p), 'utf8');
const data = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = data.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(data.pages.slice(0, 3).map(p => p.runic_count), [262, 266, 201]);
assert.equal(original.length, 729);
assert.deepEqual(original.slice(0, 13), [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const tokens = data.translit.map((t,i) => ({t,i})).sort((a,b) => b.t.length - a.t.length);

/** Encode book-source Latin words in the same GP29 longest-prefix order used in the repository. */
function encode(source) {
  const output = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/V/g, 'U').replace(/K/g, 'C');
    for (let i = 0; i < word.length;) {
      const match = tokens.find(t => word.startsWith(t.t, i));
      if (match) {
        output.push(match.i);
        i += match.t.length;
      } else {
        i++;
      }
    }
  }
  return output;
}

const book = ['I','II','III']
  .map(x => read('resources/external/2013-book-of-law-' + x + '.txt'))
  .join('\n');
const blakeFile = read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt');
const blakeBody = blakeFile.split('THE ARGUMENT').slice(1).join('THE ARGUMENT')
  .split('End of Project Gutenberg')[0];
const training = encode(book);
const blake = encode(blakeBody);
assert.equal(training.length, 21611);
assert.equal(blake.length, 18563);

const freq = Array.from({length:29},()=>Array(29).fill(.2));
const totals = Array(29).fill(29*.2);
for (let i=0;i<training.length-1;i++) {
  freq[training[i]][training[i+1]]++;
  totals[training[i]]++;
}
const logP = freq.map((row,i)=>row.map(n => Math.log(n/totals[i])));

/** Sum 27*26 horizontal bigram log-probabilities; omit artificial line wraps. */
function nativeScore(plain) {
  assert.equal(plain.length,729);
  let result = 0;
  for (let row=0;row<27;row++)
    for (let col=0;col<26;col++)
      result += logP[plain[row*27+col]][plain[row*27+col+1]];
  return result;
}

/** Read native row-major square by vertical strips, a conventional columnar cipher. */
function columnarEncode(plain) {
  return Array.from({length:729},(_,i)=>plain[(i%27)*27+Math.floor(i/27)]);
}

/**
 * Best possible cross-strip bigram edge weight.
 * allowFlip: each original source strip can be read forward or backward.
 * allowShift: each strip can be cyclically offset by an arbitrary 0..26,
 *   independently for each candidate edge. This relaxes global consistency.
 */
function edgeWeights(cipher, allowFlip, allowShift) {
  assert.equal(cipher.length,729);
  const strips = Array.from({length:27},(_,i)=>cipher.slice(i*27,(i+1)*27));
  return strips.map((A,i)=>strips.map((B,j)=>{
    if (i===j) return -1e10;
    let best=-Infinity;
    for (let fa=0;fa<(allowFlip?2:1);fa++)
      for (let fb=0;fb<(allowFlip?2:1);fb++)
        for (let shift=0;shift<(allowShift?27:1);shift++) {
          let score=0;
          for (let row=0;row<27;row++) {
            const a=A[fa?26-row:row];
            const off=(row+shift)%27;
            const b=B[fb?26-off:off];
            score += logP[a][b];
          }
          if (score>best) best=score;
        }
    return best;
  }));
}

/**
 * Maximum-weight assignment/cycle-cover bound on all Hamiltonian paths.
 * A dummy terminal node has zero-weight edges. Removing subtour constraints
 * makes this an *upper bound* even when the chosen assignment is disconnected.
 */
function assignmentUpperBound(edges) {
  const n=28;
  const weight=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>
    i===27||j===27 ? 0 : i===j ? -1e10 : edges[i][j]
  ));
  weight[27][27]=-1e10;
  const u=Array(n+1).fill(0),v=Array(n+1).fill(0);
  const assigned=Array(n+1).fill(0),parent=Array(n+1).fill(0);
  for (let i=1;i<=n;i++) {
    assigned[0]=i;
    let j0=0;
    const minCosts=Array(n+1).fill(Infinity);
    const seen=Array(n+1).fill(false);
    do {
      seen[j0]=true;
      const i0=assigned[j0];
      let delta=Infinity,j1=0;
      for (let j=1;j<=n;j++) {
        if (seen[j]) continue;
        const cost=-weight[i0-1][j-1]-u[i0]-v[j];
        if (cost<minCosts[j]) { minCosts[j]=cost; parent[j]=j0; }
        if (minCosts[j]<delta) { delta=minCosts[j]; j1=j; }
      }
      for (let j=0;j<=n;j++) {
        if (seen[j]) { u[assigned[j]]+=delta; v[j]-=delta; }
        else minCosts[j]-=delta;
      }
      j0=j1;
    } while (assigned[j0]!==0);
    do {
      const j1=parent[j0];
      assigned[j0]=assigned[j1];
      j0=j1;
    } while (j0);
  }
  let total=0;
  for (let j=1;j<=n;j++) total+=weight[assigned[j]-1][j-1];
  return total;
}


// Stronger key-independent test: each source strip may have its own arbitrary
// 29! secret monoalphabetic cipher. Equal-symbol pair counts within each strip
// are invariant under bijections, and nondecreasing under many-to-one maps.
function stripCollisionSum(source) {
  assert.equal(source.length,729);
  let total=0;
  for (let col=0;col<27;col++) {
    const counts=Array(29).fill(0);
    for (let row=0;row<27;row++) counts[source[col*27+row]]++;
    for (const count of counts) total += count*(count-1)/2;
  }
  return total;
}
const originalStripCollisions=stripCollisionSum(original);
assert.equal(originalStripCollisions,337);

const heldoutBlakeCollisions=[];
for (let start=0;start+729<=blake.length;start+=729)
  heldoutBlakeCollisions.push(stripCollisionSum(columnarEncode(blake.slice(start,start+729))));
assert.equal(heldoutBlakeCollisions.length,25);
const bookCollisions=[];
for (let start=0;start+729<=training.length;start+=729)
  bookCollisions.push(stripCollisionSum(columnarEncode(training.slice(start,start+729))));
assert.equal(bookCollisions.length,29);
const blakeCollisionMin=Math.min(...heldoutBlakeCollisions);
const bookCollisionMin=Math.min(...bookCollisions);
assert.ok(originalStripCollisions<blakeCollisionMin);
assert.ok(originalStripCollisions<bookCollisionMin);

// All 27 strips may have unrelated Caesar substitution tables, reversals,
// and a secret strip order without changing within-strip equality.
const scrambled=[];
for (let j=26;j>=0;j--) {
  const strip=planted.slice(j*27,j*27+27);
  scrambled.push(...(j%2?strip.reverse():strip).map(k=>(k+7*j+3)%29));
}
assert.equal(stripCollisionSum(scrambled),stripCollisionSum(planted));

const originalBounds = {
  fixed:assignmentUpperBound(edgeWeights(original,false,false)),
  reversible:assignmentUpperBound(edgeWeights(original,true,false)),
  reversedAndRotated:assignmentUpperBound(edgeWeights(original,true,true))
};
const nativeBook = training.slice(0,729);
const planted = columnarEncode(nativeBook);
const plantScore = nativeScore(nativeBook);
const plantBound = assignmentUpperBound(edgeWeights(planted,false,false));
assert.ok(Math.abs(plantBound-plantScore)<1e-8,
  'Native positive columnar plant must exactly saturate assignment bound.');
assert.ok(assignmentUpperBound(edgeWeights(planted,true,true))>=plantScore-1e-8);

const donorScores=[];
for (let start=0;start+729<=blake.length;start+=729)
  donorScores.push(nativeScore(blake.slice(start,start+729)));
assert.equal(donorScores.length,25);
const low=Math.min(...donorScores);
const high=Math.max(...donorScores);
assert.ok(originalBounds.fixed<=originalBounds.reversible+1e-8);
assert.ok(originalBounds.reversible<=originalBounds.reversedAndRotated+1e-8);
assert.ok(originalBounds.reversedAndRotated<low,
  'Even optimistic original permutation must score worse than every fixed native control.');

console.log(JSON.stringify({
  status:'PASS', originalPages:[0,1,2], originalRunes:original.length,
  trainingBookRunes:training.length, heldOutBlakeRunes:blake.length,
  originalBounds, nativeColumnarPlant:{score:plantScore,bound:plantBound},
  disjointBlakeControls:{count:donorScores.length,min:low,max:high,
    median:[...donorScores].sort((a,b)=>a-b)[12]},
  stripCollisionAllSecret:{original:originalStripCollisions,
    disjointBlakeControl:{count:heldoutBlakeCollisions.length,min:blakeCollisionMin,
      max:Math.max(...heldoutBlakeCollisions)},
    disjointBookControl:{count:bookCollisions.length,min:bookCollisionMin,
      max:Math.max(...bookCollisions)},
    permutedAndCipheredPlant:stripCollisionSum(scrambled)},
  conclusion:'Bounded negative for unchanged-symbol 27x27 columnar transposition; no LP2 plaintext.'
},null,2));
