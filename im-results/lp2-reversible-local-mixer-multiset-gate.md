# Reversible local position mixing: original multiset gate (Director #2878)

## Decision

A position-only post-encryption transport cannot create the observed repeat deficit from a conditionally exchangeable intermediate while preserving every block multiset and being invertible. The exact pair invariant also rejects **every shared q8/q13 additive key**, with ordinary or native literal-plaintext-F holds, on 44 pinned full-length native literary controls for the tested continuous/page pair frames. Wider block multisets alone do not yield an all-key exclusion. A favorable common orientation-map fit can manufacture the deficit retrospectively, but none of its 5,632 frozen continuations reproduces the original internal-repeat count. There is no first-party selector for this mixer or a recovered LP2 key/plaintext. Retire the tested outer-transport explanation; nonexchangeable changing-state intermediates and other framings remain unresolved.

Prior overlap: #2463 tested a pre/value-coupled three-rail composition and a separable row/column mask, not this post-cipher transport. #2856 tested whole-word seam rank ambiguity; #2870 investigated plaintext-dependent increments, #2872 deck depletion. This investigation keeps rune values unchanged and does not assume printed groups are actual words.

## Exact mathematical gate

Let the public partition have disjoint blocks B. For each block, define its multiset M_B and internal equality-pair count Q_B = sum_a choose(count_B(a),2). Any block-local position permutation, even adaptive and noninvertible, preserves Q_B. For width two this is the single adjacent-equality indicator. It cannot remove a repeat inside a pair, whatever the context, key, or swap law.

For wider blocks, let F_M be the finite fiber of all tapes with the same exact block multisets (and unchanged fringes). A globally bijective, possibly context-coupled transport that preserves every block multiset restricts to a bijection of F_M. Hence conditional uniform measure on F_M is preserved exactly. Uniformity conditional on M includes IID or independent within-block exchangeability; no assumption about the distribution of multiset types is needed. The conditional distribution of within-block adjacent equality count is a product convolution of the uniform distinct-arrangement histograms of each block. For example, a triple with type (2,1) has one repeat in 2 of its 3 orientations; a quadruple of type (2,1,1) has one repeat in 6 of 12 orientations. This is stronger than a random fixed-permutation null: it covers **any reversible content-dependent mixer** under the stated conditional source law, including maps coupling distinct blocks.

The canonical LP2 p0–55 rune tape has 12,956 runes, 86 adjacent equalities. Use all complete b-blocks for b=2,3,4 at every fixed offset 0..b-1, continuously or reset at each physical page; incomplete fringes unchanged. The 14 triple/quad frames give conditional lower-tail probabilities between 3.97e-51 and 1.13e-26. Examples:

| Frame | Complete blocks | Invariant Q | Actual internal adjacent repeats | Conditional mean | Lower-tail probability |
|---|---:|---:|---:|---:|---:|
| continuous pairs, offset 0 | 6478 | 37 | 37 | 37 | 1 |
| continuous pairs, offset 1 | 6477 | 49 | 49 | 49 | 1 |
| page pairs, offset 0 | 6462 | 35 | 35 | 35 | 1 |
| page pairs, offset 1 | 6439 | 51 | 51 | 51 | 1 |
| continuous triples, offset 0 | 4318 | 198 | 54 | 132 | 1.16e-29 |
| page triples, offset 0 | 4303 | 210 | 56 | 140 | 2.70e-32 |
| continuous quadruples, offset 0 | 3239 | 395 | 58 | 197.5 | 2.90e-49 |
| page quadruples, offset 0 | 3219 | 391 | 54 | 195.5 | 3.97e-51 |

This is a rejection of the conditional exchangeability null, not an unconditional impossibility for all native ciphertext: an intermediate already carrying strong orientation bias could permit a reversible map to redirect its mass. A sorting/minimization rule that maps all orientations to the rare nonrepeat subset cannot be injective over the entire fiber without extra information.

## All-key pair gate with native GP29 additive sender

For a fixed native reference plaintext p, define phase j(i) as the next consuming key cursor modulo q; literal plaintext F (index 0) is emitted unchanged and consumes no key when enabled. The q8 and q13 lengths are selected by authentic LP1 solved methods, not a claim of reuse in LP2. Sign and origin are absorbed into arbitrary q key digits. Each selected adjacent pair gives one exact cost:
- two consuming runes: equal iff K[j+1]-K[j] = p[i]-p[i+1] (mod 29);
- one held F: equal iff the consuming symbol's key digit is its negative;
- two held Fs: equal unconditionally.

Collect difference histograms E_j and unary histograms U_j; minimize constant + sum_j U_j(K_j) + E_j(K_(j+1)-K_j) around the cyclic phase graph. Fix K_0 to each of 29 possible digits, propagate exact min-sum DP over the remaining digits, close the ring. This optimizes the complete 29^q space, including all possible private shift values. For continuous pairs, use continuous clock only (cross-page pair may violate phase adjacency under page reset); page-framed pairs test both continuous and reset clocks. All four offset/framing classes, both q, both clocks, 24 configurations.

Corpus: pinned native-style GP encodings of Emerson (321,327 runes; 24 disjoint full-length windows), Gibran (62,492; 4), Shakespeare (217,106; 16). All start at offsets 0,12956,... in their respective normalized text; no LP2 data fitted. **0/1,056** (44×24) reference-window/configuration combinations have an attainable pair count <= the corresponding original. Global smallest margin +2 (page pairs offset1, q13 with F hold continuous: original51 vs minimum53); other configurations are stronger. This is an exact all-key finite-reference obstruction, not a proof about all possible English. It also grants arbitrary data-dependent swaps, even if not bijective, since the invariant holds regardless. No assumption that ciphertext zero is necessarily held F is used in the sender cost.

Concrete controlled swap: on a complete block swap positions 0 and 1 when (sum of its rune indices + key[block ordinal mod q]) mod29 <14. The control is invariant under swap, so this is its own inverse. DIUINITY q8, both clocks, one full-length window per donor, widths2/3/4: all 18 controls restore the 12,956-symbol pre-mixer tape exactly and preserve all block multisets; full adjacent equalities after mixing 424–508, against original86. These are actual sender and mixer tests; they do not assert a unique F-hold inverse.

## Wider blocks: honest limitation and predictive gate

For widths3/4 each unordered pair within a block yields an analogous unary or pairwise phase cost (all phase differences, including after F holds). Sum independent minima gives a necessary lower bound on the invariant Q. For a triangle (a,b,c) of phases, enforce differences d_ac=d_ab+d_bc mod29 to tighten three edges jointly. Greedily select edge-disjoint triangles by exact improvement; the sum remains a lower bound. Across 84 frame/key/clock configurations ×44 reference windows, 3,612/3,696 survive independent-edge bound and 3,213/3,696 survive triangle tightening. This deliberately does **not** exclude arbitrary width3/4 periodic-key transport.

Instead test a stronger practical capacity/prediction gate on an explicit reversible orientation-code family. For each block sort distinct rune values; encode the ordered arrangement by its rank code relative to this sorted list and ordered multiplicity vector. A permutation of these codes preserves the multiset and can be inverted by its inverse permutation. Give the receiver an independent shared code permutation for each of four invariant context types: ordered multiplicity shape alone, shape plus sum mod29, shape plus public block ordinal mod q, or shape plus both. No private per-block permutation or state. Within each group the exact in-sample optimum follows the rearrangement inequality: map the highest frequency input code to the lowest-adjacency output code, and so on. This is deliberately more favorable than any specific small controlled swap.

Native controls: same 44 full-length disjoint donor windows, two authentic key strings DIUINITY and FIRFUMFERENFE, both signs, ordinary and plaintext-F-hold senders (continuous clock), both continuous and page-framed complete b3/b4 blocks at offset0. Every group has the same allowed arrangement codes for all its occurrences. Fit the common code maps on the first two-thirds of each block sequence, freeze them, then evaluate the remaining third. Unseen contexts use identity; deterministic rank tie-breaks. Sixteen actual full-tape round trips (one control × 4 frames × 4 context rules) validate the transport. Exact in-sample oracle and heldout minima:

| Frame | Context | Oracle passes /352 | Minimum oracle vs original | Heldout passes /352 | Minimum heldout vs original |
|---|---|---:|---:|---:|---:|
| cont. b3 | shape | 0 | 242 vs 54 | 0 | 73 vs 18 |
| cont. b3 | sum | 0 | 155 vs 54 | 0 | 68 vs 18 |
| cont. b3 | phase | 0 | 174 vs 54 | 0 | 67 vs 18 |
| cont. b3 | sum+phase | 23 | 45 vs 54 | 0 | 64 vs 18 |
| cont. b4 | shape | 0 | 191 vs 58 | 0 | 73 vs 18 |
| cont. b4 | sum | 255 | 17 vs 58 | 0 | 62 vs 18 |
| cont. b4 | phase | 0 | 83 vs 58 | 0 | 67 vs 18 |
| cont. b4 | sum+phase | 352 | 5 vs 58 | 0 | 82 vs 18 |
| page b3 | shape | 0 | 241 vs 56 | 0 | 73 vs 18 |
| page b3 | sum | 0 | 168 vs 56 | 0 | 70 vs 18 |
| page b3 | phase | 0 | 208 vs 56 | 0 | 75 vs 18 |
| page b3 | sum+phase | 9 | 46 vs 56 | 0 | 75 vs 18 |
| page b4 | shape | 0 | 234 vs 54 | 0 | 87 vs 12 |
| page b4 | sum | 212 | 26 vs 54 | 0 | 84 vs 12 |
| page b4 | phase | 0 | 90 vs 54 | 0 | 85 vs 12 |
| page b4 | sum+phase | 352 | 6 vs 54 | 0 | 80 vs 12 |

0/5,632 frozen continuations pass. Fine contexts can meet the whole-sample target by fitting orientation frequencies in sparse groups, but no predictive suppression follows. Neither the map nor its fine context table is selected by an original source. These are bounded historical-key controls, not an all-key proof for b3/4, and the test does not exclude an independently supplied nonexchangeable intermediate or a different block family. The decisive lesson is to require an independent recoverable source for both orientation bias and map, rather than tune a mixer until its original repeat statistic matches.

## Reproduction

Run from the repo root:
- `node sims/lp2_reversible_local_mixer_multiset_gate_sft.cjs` ([raw](lp2-reversible-local-mixer-multiset-gate.json))
- `node sims/lp2_reversible_local_mixer_wide_block_gate_sft.cjs` ([raw](lp2-reversible-local-mixer-wide-block-gate.json))
- `node sims/lp2_reversible_local_mixer_orientation_oracle_sft.cjs` ([raw](lp2-reversible-local-mixer-orientation-oracle.json), rows plus aggregate groups).

Actual V8 core executions succeeded using the committed corpus and three control blobs; standalone Node CI was not run. Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85. No original key or plaintext, and no authenticated selector for an outer local mixer.
