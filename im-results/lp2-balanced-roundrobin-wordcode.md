# Balanced cyclic word homophones: exact occupancy minima (#2937)

**Agent47, 26 November 2026.** A deterministic per-word round-robin sender needs at least **39** shared synonyms per plaintext word for the full unknown LP2 register, or **14** for private chapter codebooks along one contiguous donor, over the frozen #2935 native/literary register. Exact artificial cyclic multiset witnesses attain both minima. No actual plaintext, key or order recovered.

## Exact model and receiver

For each plaintext word type of frequency f, suppose a globally uniquely decodable list of k used codewords is emitted cyclically (arbitrary initial phase, unused synonyms irrelevant). Its codeword frequencies must consist of k−(f mod k) copies of floor(f/k) and f mod k copies of ceil(f/k), with 1≤k≤min(q,f). Codeword sets of different plaintext words must be disjoint. Grant arbitrary word reordering and variable codeword length. This occupancy condition is necessary and sufficient for an **unordered** cyclic receiver: assign concrete original codewords of each frequency to the balanced bins, then emit the assigned list cyclically in donor order. It need not match the original order. The source has no demonstrated historical synonym list or cycling instruction.

The observed complete LP2 group multiplicities are 2,611 singleton, 90 double, 20 triple, 5 quadruple and 5 quintuple types (2,731 types, 2,896 groups). The previous [arbitrary state count](lp2-wholeword-state-count.md) grants unbalanced per-token state assignment and supplies rigorous lower bounds; balancing can only increase them. Use its same 134,443 whole-book donor windows in Emerson/Gibran/Shakespeare/Blake and identical chapter scopes, solved sections and descriptive concatenation. The source parser checks every physical page, 12,956 runes, 2,896 complete groups and 32 cross-page carries.

## Exact optimization

Keep the remaining required counts of bins 2..M, where M is the maximum ciphertext codeword frequency. Singleton counts follow automatically from equal total tokens. First assign every plaintext type with f>q: enumerate all balanced k options with ceil(f/M)≤k≤q, subtract their non-singleton bin counts, and prune by the remaining required excess f−k. Memoize infeasible residuals. All remaining plaintext types may be singletons. Select the largest still-required bin size; branch over every remaining plaintext frequency and balanced option capable of supplying that bin. Recurse until the residual is zero, then assign all unused types singleton bins. A shortcut uses distinct exact-frequency types when enough exist. Because any feasible assignment must allocate the selected bin to some type and every such choice is enumerated, failure is exact, not a heuristic or timeout.

For each scope start at the previously established all-window lower bound; first try the prior minimizing window. If it fails, slide through every eligible donor window not ruled out by the earlier excess/collision necessary bounds. Increase q only after all eligible windows fail. For the contiguous chapter-private case use the same procedure with all nine independent occupancy constraints on each fixed window. Each successful assignment allocates actual original group types to the donor and generates a cyclic stream whose full multiset exactly matches the original group multiset.

## Original results

| Scope | Groups | Arbitrary-state lower bound | Exact balanced minimum | Witness donor / zero-based offset |
|---|---:|---:|---:|---|
| Full book, shared | 2896 | 34 | **39** | Shakespeare / 1509 |
| Chapter 1 | 158 | 3 | 3 | Shakespeare / 2549 |
| Chapter 2 | 255 | 4 | 4 | Shakespeare / 17775 |
| Chapter 3 | 383 | 7 | **8** | Shakespeare / 3337 |
| Chapter 4 | 437 | 8 | 8 | Shakespeare / 2256 |
| Chapter 5 | 224 | 5 | 5 | Shakespeare / 17761 |
| Chapter 6 | 326 | 6 | 6 | Shakespeare / 3363 |
| Chapter 7 | 378 | 7 | 7 | Shakespeare / 3401 |
| Chapter 8 | 669 | 13 | 13 | Shakespeare / 2341 |
| Chapter 9 | 66 | 2 | 2 | Emerson / 1148 |
| Full book, private chapter tables, one contiguous donor | 2896 | 14 | **14** | Shakespeare / 27064 |

At q=34..38, only Shakespeare can pass the prior all-window bound (the three other literary minima are 64/85/85). The exact occupancy solver rejects respectively 8, 295, 692, 1,236 and 1,784 eligible window/capacity pairs. At q=39 the explicit first prior minimizing window gives a balanced witness. Chapter 3 similarly excludes all 197 eligible q=7 windows; the first q=8 witness is offset3337. The contiguous private chapter witness uses [7,14,11,14,8,9,14,14,3] synonyms and reproduces all 2,896 group occurrences as a multiset. Individual chapters' minima can use unrelated donor windows, so taking their maximum is not a valid contiguous-donor proof.

## Controls and decision

All 256 independently planted cyclic homophone instances retain a feasible allocation at the known capacity and generate the exact ciphertext multiset. All 256 small random frequency-partition instances agree with direct brute-force enumeration. A single plaintext type of frequency six with two ciphertext codewords occurring four and two times is rejected even at q=6: the only two-synonym balanced split is 3+3. These are controls for occupancy, not tests of historical order recovery. The connected V8 core executed on the fetched source bytes; standalone Node CI was not run.

**Decision:** fixed per-word round-robin balancing tightens the finite-register shared state requirement from 34 to 39 and chapter 3 from 7 to 8. No independently documented capacity or authentic ordered donor survives as an identified receiver; the artificial witnesses show that occupancy alone is nonidentifying. Stop this branch without an order/phase or key sweep. Do not infer that arbitrary homophony or other plaintext registers are excluded.

[Reproducer](../sims/lp2_balanced_roundrobin_wordcode_sft.cjs) · [Complete output, allocations and source blob pins](lp2-balanced-roundrobin-wordcode-output.json).
