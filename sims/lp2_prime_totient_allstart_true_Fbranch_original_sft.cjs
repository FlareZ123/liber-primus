'use strict';

/**
 * Exact all-F-branch feasibility for the already authenticated solved-p56
 * prime-totient cipher transferred, hypothetically, to unknown original LP2.
 * Every initial ordinary-prime index from zero through the source-visible 3301
 * prime's zero-based ordinal 463 is allowed, with both signs and all C=F
 * plaintext-skip branches. No language or key guesses after the original.
 *
 * Windows Node22:
 * node sims/lp2_prime_totient_allstart_true_Fbranch_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const original = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));

const STARTS = 464;
const N = 5000;
const GP = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n%GP)+GP)%GP;
}

/** @returns {number[]} */
function firstPrimes() {
  const values = [];
  for (let n=2;values.length<N;n++) {
    let prime = true;
    for (let d=2;d*d<=n;d++) {
      if (n%d===0) {prime=false;break;}
    }
    if (prime) values.push(n);
  }
  return values;
}
const primes=firstPrimes();
const key=primes.map(p=>mod(p-1));
assert.equal(primes[463],3301);

/**
 * Genuine historical F-transparent emission:
 * P=F -> C=F and no key consumption;
 * P!=F -> C=P+sign*phi(prime[j]) mod29, consume one prime.
 * @param {number[]} plaintext
 * @param {number} start
 * @param {-1|1} sign
 * @returns {{ciphertext:number[],endPointer:number,skipCount:number}}
 */
function encrypt(plaintext,start,sign) {
  const ciphertext=[];
  let j=start;
  let skipCount=0;
  for (const p of plaintext) {
    if (p===0) {
      ciphertext.push(0);
      skipCount++;
    } else {
      ciphertext.push(mod(p+sign*key[j]));
      j++;
    }
  }
  return {ciphertext,endPointer:j,skipCount};
}

/**
 * Full finite-state inverse over 464 starting prime offsets, with every legal
 * plaintext-F skip when ciphertext is F, plus encrypted non-F wrapping to F.
 * @param {number[]} ciphertext
 * @param {-1|1} sign
 * @param {boolean} keepHistory
 * @returns {{firstEmpty:number,paths:Uint8Array[],last:Uint8Array,count:number}}
 */
function reachable(ciphertext,sign,keepHistory=false) {
  let current=new Uint8Array(N);
  current.fill(1,0,STARTS);
  const paths=keepHistory?[current]:[];
  let count=STARTS;
  let firstEmpty=-1;
  for (let i=0;i<ciphertext.length;i++) {
    const c=ciphertext[i];
    const next=new Uint8Array(N);
    for (let j=0;j<STARTS+i;j++) {
      if (!current[j]) continue;
      // Any displayed F might be a literal-F nonconsuming emission.
      if (c===0) next[j]=1;
      // Even displayed F may also be an encrypted non-F and consume a key.
      if (mod(c-sign*key[j])!==0) next[j+1]=1;
    }
    current=next;
    if (keepHistory) paths.push(current);
    count=current.reduce((a,b)=>a+b,0);
    if (count===0) {firstEmpty=i;break;}
  }
  return {firstEmpty,paths,last:current,count};
}

/**
 * Exact count of all paths into each prime pointer on a ciphertext. Integer
 * arithmetic is BigInt; merging different plaintext histories adds counts.
 * @param {number[]} ciphertext
 * @param {-1|1} sign
 * @returns {{counts:bigint[],firstEmpty:number}}
 */
function countPaths(ciphertext,sign) {
  let counts=Array(N).fill(0n);
  for (let s=0;s<STARTS;s++) counts[s]=1n;
  let firstEmpty=-1;
  for (let i=0;i<ciphertext.length;i++) {
    const next=Array(N).fill(0n);
    const c=ciphertext[i];
    for (let j=0;j<STARTS+i;j++) {
      const count=counts[j];
      if (count===0n) continue;
      if (c===0) next[j]+=count;
      if (mod(c-sign*key[j])!==0) next[j+1]+=count;
    }
    counts=next;
    if (!counts.some(x=>x>0n)) {firstEmpty=i;break;}
  }
  return {counts,firstEmpty};
}

/**
 * Reconstruct EVERY complete path from the final pointer of the short
 * p54–55 original, using the preserved full reachable-state history.
 * @param {number[]} ciphertext
 * @param {Uint8Array[]} histories
 * @param {number} end
 * @returns {{start:number,plain:number[],skips:number}[]}
 */
function enumerate(ciphertext,histories,end) {
  const out=[];
  const backwards=[];
  function visit(i,j,skips,positions) {
    if (i<0) {
      out.push({start:j,plain:[...backwards].reverse(),skips,skipIndices:[...positions].reverse()});
      return;
    }
    const c=ciphertext[i];
    if (j>0&&histories[i][j-1]&&mod(c-key[j-1])!==0) {
      backwards.push(mod(c-key[j-1]));
      visit(i-1,j-1,skips,positions);
      backwards.pop();
    }
    if (c===0&&histories[i][j]) {
      backwards.push(0);
      positions.push(i);
      visit(i-1,j,skips+1,positions);
      positions.pop();
      backwards.pop();
    }
  }
  visit(ciphertext.length-1,end,0,[]);
  return out;
}

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const count=new Array(GP).fill(0);
  for (const v of arr) count[v]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}

function main() {
  assert.equal(original.runes.length,GP);
  const p57=original.pages.find(p=>p.page===57).indices;
  assert.equal(p57.length,95);
  assert.ok(p57.includes(0));
  const longNative=Array.from({length:3000},(_,i)=>p57[i%p57.length]);
  for (const sign of /** @type {const} */ ([-1,1])) {
    for (const start of [0,167,463]) {
      const plant=encrypt(longNative,start,sign);
      const result=reachable(plant.ciphertext,sign);
      assert.ok(result.count>0);
      assert.equal(result.last[plant.endPointer],1);
      assert.ok(plant.skipCount>0);
      console.log(`source native 3000 plant: sign=${sign} seed=${start} Fskips=${plant.skipCount} reachable=${result.count}`);
    }
  }

  const chapters=[
    {a:0,b:3,n:729,plus:565,minus:497},
    {a:3,b:8,n:1145,plus:332,minus:355},
    {a:8,b:15,n:1729,plus:271,minus:277},
    {a:15,b:23,n:1903,plus:249,minus:369},
    {a:23,b:27,n:1021,plus:495,minus:282},
    {a:27,b:33,n:1433,plus:505,minus:531},
    {a:33,b:40,n:1680,plus:594,minus:420},
    {a:40,b:54,n:3008,plus:628,minus:329},
    {a:54,b:56,n:308,plus:-1,minus:213}
  ];
  for (const ch of chapters) {
    const cipher=original.pages.slice(ch.a,ch.b).flatMap(p=>p.indices);
    assert.equal(cipher.length,ch.n);
    for (const sign of /** @type {const} */ ([-1,1])) {
      const hit=reachable(cipher,sign,ch.a===54&&sign===1);
      const predicted=sign===1?ch.plus:ch.minus;
      assert.equal(hit.firstEmpty,predicted);
      if (ch.a!==54||sign===-1) {
        assert.equal(hit.count,0);
      } else {
        assert.equal(hit.count,1);
        assert.equal(hit.last[472],1);
        const multiplicities=countPaths(cipher,sign);
        assert.equal(multiplicities.counts[472],3n);
        const candidates=enumerate(cipher,hit.paths,472);
        assert.equal(candidates.length,3);
        assert.deepEqual(candidates.map(c=>c.start),[167,167,168]);
        assert.deepEqual(candidates.map(c=>c.skips),[3,3,4]);
        assert.deepEqual(candidates.map(c=>c.skipIndices),[
          [41,195,247],[65,195,247],[41,65,195,247]
        ]);
        const p55=candidates[0].plain.slice(-76);
        assert.equal(p55.length,76);
        assert.equal(ioc(p55),0.03508771929824561);
        for (const candidate of candidates) {
          assert.deepEqual(candidate.plain.slice(-76),p55);
          assert.deepEqual(candidate.skipIndices.filter(i=>i>=232).map(i=>i-232),[15]);
        }
        assert.deepEqual(original.pages[55].indices
          .map((p,i)=>p===0?i:-1).filter(i=>i>=0),[15,25,41]);
        for (const candidate of candidates) {
          const sent=encrypt(candidate.plain,candidate.start,1);
          assert.deepEqual(sent.ciphertext,cipher);
          assert.equal(sent.endPointer,472);
        }
        const sourceSelectorProducts = [3 * 5, 5 * 13, 3 * 5 * 13].sort((a, b) => a - b);
        const sourceSelectorSkips = [5 * 13, 3 * 5 * 13, 232 + 3 * 5]
          .sort((a, b) => a - b);
        assert.deepEqual(sourceSelectorProducts, [15, 65, 195]);
        assert.deepEqual(sourceSelectorSkips, [65, 195, 247]);
        assert.deepEqual(original.pages[54].indices
          .map((p, i) => p === 0 ? i : -1).filter(i => i >= 0), [41, 65, 195]);
        assert.deepEqual(original.pages[55].indices
          .map((p, i) => p === 0 ? i : -1).filter(i => i >= 0), [15, 25, 41]);
        assert.equal(1033 - 36, 997);
        assert.equal(primes[167], 997);
        const sourceSelectorCandidate = candidates.find(c =>
          c.start === 167 &&
          JSON.stringify(c.skipIndices) === JSON.stringify(sourceSelectorSkips));
        assert.ok(sourceSelectorCandidate,
          'visible 3/5/13 product candidate selects one complete start-167 path');
        assert.equal(ioc(sourceSelectorCandidate.plain), 0.03492110495367824);
        assert.equal(original.translit[sourceSelectorCandidate.plain[232]], 'M',
          'selected p55 candidate still begins with a one-rune M word');

        // The 2013 prime_echo list is finite at its 464th prime, 3301.
        // Test the natural cyclic interpretation without changing the F mask.
        let cyclicPointer = 167;
        const cyclicPlain = [];
        for (let i = 0; i < cipher.length; i++) {
          if (sourceSelectorSkips.includes(i)) {
            cyclicPlain.push(0);
          } else {
            cyclicPlain.push(mod(cipher[i] - key[cyclicPointer % STARTS]));
            cyclicPointer++;
          }
        }
        const cyclicChanges = cyclicPlain.reduce((n, x, i) =>
          n + (x !== sourceSelectorCandidate.plain[i] ? 1 : 0), 0);
        assert.equal(cyclicPointer, 472);
        assert.equal(cyclicChanges, 8);
        assert(Math.abs(ioc(cyclicPlain) - 0.03473074157113245) < 1e-12);
        console.log(JSON.stringify({
          candidate_source_selector: {
            prime_start_zero_based: 167,
            prime_start_value: primes[167],
            selector_equation: '1033 - physical_page36 = 997',
            selected_literal_F_global_offsets: sourceSelectorSkips,
            dot_products: sourceSelectorProducts,
            output_IoC: ioc(sourceSelectorCandidate.plain),
            p55_first_word: original.translit[sourceSelectorCandidate.plain[232]],
            cyclic_prime_wrap_changes: cyclicChanges,
            cyclic_output_IoC: ioc(cyclicPlain)
          }
        }));
        console.log(JSON.stringify({
          physical_pages:'54–55',
          prime_starts:'0..463',
          surviving_final_prime_pointer:472,
          surviving_complete_plaintext_paths:3,
          survivor_initial_starts:candidates.map(x=>x.start),
          survivor_skip_counts:candidates.map(x=>x.skips),
          survivor_skip_indices:candidates.map(x=>x.skipIndices),
          unique_p55_shared_transliteration:p55.map(i=>original.translit[i]).join(' '),
          unique_p55_IoC:ioc(p55),
          candidate_GP29_IoCs:candidates.map(x=>ioc(x.plain))
        }));
      }
      console.log(JSON.stringify({pages:`${ch.a}-${ch.b-1}`,runes:cipher.length,
        sign,first_impossible_zero_based:hit.firstEmpty,reachable_prime_states:hit.count}));
    }
  }
  console.log('PASS: authenticated prime/F plant, all-prime-start all-skip inverse, three p54–55 paths, and a separately flagged post hoc source-selector candidate.');
}
main();
