# Opening red13 as a mapped repeating key: exact structural and blind-calibrated inverse gates

**Decision.** The original opening red13 cannot be the positive-sign key of a continuously consumed F-fixed common-cycle cipher, for *any* GP29 alphabet permutation and any initial phase. The negative-sign model is structurally possible but its global inverse cannot satisfy four mandatory original p0 lexical anchors simultaneously in the broad frozen register below. There is no recovered unknown plaintext or historical key. The negative-sign continuous-clock model is also excluded with at most three out-of-register words anywhere among the 56 opening-page complete groups. Both signs are retired in the stated scope.

## Hypothesis and original receiver

This transfers the common-cycle idea studied at the terminal red8 to the distinct **opening red13** source operand. Original p0 has 8+5 red runes followed by the large thirteen-dot punctuation; its body starts with TH. Use exactly the corrected red runes
`K=[15,8,18,3,6,19,27,0,15,26,18,21,5]`
in original order, not a guessed Latin title, not a permuted key, and one unknown bijection x of GP29 fixing F=0. For non-F plaintext,
`x(C)=x(P)+s*x(K[j]) mod29`, followed by phase advance j←j+1 mod13. Literal plaintext F emits F and holds phase. Allow an ordinary consuming emission of ciphertext F whenever legal. One continuous clock across words and pages; all 13 starts. No independent first-party instruction establishes this relabeled key mechanism. Solved p56's red heading is encrypted payload; red-as-key is specifically a hypothesis for this chapter.

The original pp0–2 tape contains 729 GP indices; the 13-rune red title is removed, leaving 716 black runes in 156 complete printed groups, including two carry words. The source group tape exactly matches the corpus sequence. The lexical inverse fits only the first 56 body groups (248 runes); the remaining 100 groups (468 runes, including the p0–p1 carry) are not used to select an alphabet. A separate whole-body structural relaxation explicitly uses all 716 runes and is not claimed as a blind holdout.

## Positive sign: all-secret structural obstruction

When x(C)=x(K[j]), consuming inversion necessarily gives P=F and is illegal. This is exactly C=K[j], independent of x. A ciphertext F can additionally hold phase. Dynamic programming over all possible phase states gives the zero-based body offsets where each initial phase loses its final path:

| Initial phase | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Last path lost | 37 | 37 | 2 | 405 | 29 | 19 | 19 | 23 | 72 | 72 | 38 | 38 | 15 |

This excludes the positive-sign continuous law independent of vocabulary, plaintext frequency or hidden alphabet. Phase3 survives into p1 but still dies at body offset405.

## Negative sign: exact matching relaxation

For negative sign a consuming output is legal iff x(C)+x(K[j]) != 0. For nonzero labels the inverse-pair relation is a perfect matching of the 28 labels (14 pairs). Every matching is realizable by assigning its pairs to the 14 residue pairs ±1,...,±14, and every F-fixed alphabet produces a matching. Thus a path with no consumed forbidden matched pair is equivalent to the existence of a legal alphabet and some plaintext, without language assumptions.

The binary MILP uses one unit of flow through per-word phase/hold-mask arcs and degree-one constraints for the 28 nonzero labels. An arc forbids each pair (C,K[j]) it consumes. Its cost is 0 if a native dictionary word has that exact phase/hold-mask and passes independent local GF29 forced-collision tests, else 1. The sum is a **lower bound**, since different local words may need different x. On all 156 original groups, 2,846 binaries and 8,169 constraints, HiGHS terminated optimal with objective/bound **1/1** (13.9 s). It finds a single matching and clock and reconstructs a full 716-rune legal plaintext tape with exact forward replay, but this arbitrary assignment is nonlinguistic. Consequently structural feasibility is established, and zero OOV is impossible under this local register; the one-OOV relaxation does not identify an alphabet satisfying the lexical words globally.

## Direct global inverse with native word anchors

Native word register = greedy GP tokenization with QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA, using TextBlob 0.19.0 en-spelling and CMUdict 1.1.3 union. 121,475 encoded distinct forms before singletons are restricted to A/I/O. This deliberately broad register includes names/rare words, and its frequency-weighted plants are dictionary-native independent words, not natural passages. Exact dictionary TSV SHA256 `e81523d77ba04327ce22845d9805fcfb283827b44986fcb7eb9df854d4355896`. Only lowercase alphabetic source words are admitted.

Freeze four complete p0 anchors selected for long length and small necessary local domains; no plaintext guesses. All offsets below are zero-based after red13. Compact alphabet is 0123456789abcdefghijklmnopqrs.

| Group | Offset | Length | Original | Local word/phase candidates |
|---:|---:|---:|---|---:|
| 3 | 10 | 11 | 9i7hofmcal1 | 2,986 |
| 10 | 43 | 6 | ir0e60 | 348 |
| 11 | 49 | 11 | fdg0d1lqler | 177 |
| 53 | 232 | 9 | 03i7smk0p | 250 |

For each consuming edge impose exact homogeneous equation x(P)-x(C)-x(K)=0. F-hold edges are separate. The local domain builder reduces the homogeneous equations over GF29, excluding a candidate only if any two coordinate forms (including F=0) must coincide. The global join incrementally eliminates a free variable on every new independent equation, retains all remaining coordinate forms, rejects forced equality, and checks necessary continuous phase reachability between selected words. At complete leaves enumerate all distinct free-coordinate assignments modulo the scalar gauge x(S)=1 (nonzero because S is not F). Every resulting full permutation is checked by exact wordwise dynamic programming with up to 3 OOV in all 56 training groups. Anchors themselves are mandatory. A timeout or enumeration cap invalidates an exhaustive negative.

Two separately seeded hidden-permutation controls use the same physical lengths and fixed anchor positions. The dictionary-word sequences are generated before ciphertext search; their truth is not supplied to the solver. The inverse recovers the exact normalized alphabet and phase in both. Both score 0 OOV in train and held-out words. One held-out two-rune word has two legal orderings under the F-hold semantics; the deterministic tie selects the other, hence 714/716 in one control.

| Input | Complete algebraic leaves | Free assignments tested | Distinct normalized maps | Fitting maps | Train truth | Holdout truth | Timeout/caps |
|---|---:|---:|---:|---:|---:|---:|---:|
| Plant 1033 | 1 | 491,400 | 24 | 1 | 248/248 | 468/468 | 0/0 |
| Plant 3301 | 1 | 491,400 | 24 | 1 | 248/248 | 466/468 | 0/0 |
| Original p0 | 0 | 0 | 0 | 0 | — | — | 0/0 |

Original depth tries/survivors in ascending-domain order (11,53,10,3): 177/177, 44,250/2,059, 716,532/160, 477,760/0. 0.33s in local optimized C++. All four anchors are jointly inconsistent even before testing the other p0 words; no key is available for the original holdout. Both plants passed before original full join. No candidate is promoted to plaintext.

## Five-anchor OOV strengthening and exact MRV enumeration

Add body group 29 (offset 122, length 6, 4,674 local word/phase candidates). The five four-subsets of {3,10,11,29,53} have all been independently exhausted with zero normalized maps and no timeout/cap in the completed runs:

| Mandatory subset | Algebraic leaves | Free assignments tested |
|---|---:|---:|
| 3,10,11,53 | 0 | 0 |
| 3,10,11,29 | 0 | 0 |
| 3,11,29,53 | 0 | 0 |
| 3,10,29,53 | 4,044 | 57,539,972 |
| 10,11,29,53 | 111 | 121,886,856 |

The last subset required raising the original per-leaf assignment cap to 20 million; a capped earlier attempt is not counted. If at most one of the five words were OOV, at least one of these four-subsets would have to be feasible. Therefore any surviving map and legal phase path has **at least two OOV words among these five**. This does not require the remaining 51 training words to be in-register.

The [MRV enumerator](../sims/lp2_p0_mapped_red13_anchor_join_mrv.cpp) substitutes the scalar gauge into the coordinate forms and uses pairwise affine disequalities. Each relation with one unassigned coordinate removes its unique forbidden field value. Choose the remaining variable with fewest legal values and backtrack exactly. On plant 1033 it recovers the same 24 maps and unique fit with 65 recursive nodes; on original subset 10,11,29,53 it exhausts 201 recursive nodes instead of 121,886,856 complete free assignments. These counters measure different operations, not wall-clock speedup. The original complete free-assignment counts above remain reproducible with the original enumerator and configurable subset/cap. MRV executable takes dictionary, ciphertext, local-domain TSV, seconds, comma-separated four-anchor indices. No further OOV budget conclusion follows merely from incomplete searches.

## Complete three-OOV fixed-clock inverse

The 248 training runes contain exactly 13 ciphertext F glyphs. Enumerate every legal start and F-hold/consume path, with consuming C=K=F forbidden. A consuming position has token t={C,K}, an unordered pair since x(P)=x(C)+x(K). Repeated tokens must produce the same plaintext, and two distinct tokens sharing a coordinate cannot produce the same plaintext. These constraints hold even in OOV words.

The same frozen local dictionary/GF29 filter produces 906 word-state records, 1,416,615 word/state candidates. Full phase enumeration leaves 35,233 paths with at most three locally unsupported words. A pair-conflict graph and exact bounded vertex cover reduce this to 16,946 histories. For each, the new solver propagates bitset word domains on shared tokens, injective pair-output constraints, and homogeneous linear equations. The linear solver tracks a sufficient set of lexical word assumptions for each contradiction. When a candidate additional row is proportional to a nonzero coordinate difference, it is rejected, since enforcing that row would identify two alphabet coordinates. If propagation is inconclusive, branch over the smallest remaining token label domain; combine all branch contradiction witnesses. At low residual dimension enumerate maps exactly with the affine MRV method. For every contradiction, at least one word in its sufficient witness must be OOV; branch deletion of each witness word within the remaining budget. There is no fixed mandatory anchor. All consumed positions, including deleted words, still obey the common bijection.

| Initial phase | Locally admissible histories | Pair-graph admissible | Initial timeout |
|---:|---:|---:|---:|
| 0 | 3,758 | 2,053 | 0 |
| 1 | 2,209 | 1,089 | 0 |
| 2 | 816 | 304 | 0 |
| 3 | 255 | 78 | 0 |
| 4 | 1,293 | 650 | 1 |
| 5 | 3,471 | 2,040 | 4 |
| 6 | 4,489 | 1,786 | 0 |
| 7 | 4,144 | 2,068 | 0 |
| 8 | 3,271 | 1,443 | 0 |
| 9 | 2,812 | 889 | 0 |
| 10 | 3,092 | 1,268 | 0 |
| 11 | 2,793 | 1,541 | 0 |
| 12 | 2,830 | 1,737 | 0 |
| **Total** | **35,233** | **16,946** | **5** |

Each initially timed-out path was extracted as its exact 56-state tuple and retried independently with a 60s limit. All five finished with zero solutions and zero further timeout. Across all partitions and retries, no original branch reached a viable bijective map, and no unknown plaintext was recovered. This is a complete negative for <=3 OOV under the stated cipher, segmentation, singleton and dictionary assumptions, not a heuristic search score.

Known-clock positive controls on both earlier hidden-permutation plants recovered the exact normalized map and all 248 training runes (one hard call and one actual map each). A third control modifies plant 1033 at body groups 3,29,53 with deterministic non-dictionary strings (seed 1138), then reencrypts the entire tape. The solver, given its true clock but not its key or OOV positions, recovered the exact map and all 248 runes, with OOV=3 and 204 hard calls. The original earlier anchor controls were blind to the initial clock; the fixed-clock controls specifically test the new inverse and deletion reasoning.

Reproduction: [complete clock SFT](../sims/lp2_p0_mapped_red13_clock_sft.py), [exact clock C++](../sims/lp2_p0_mapped_red13_clock_exact.cpp). The local original and control components were run with C++17 g++ and Python; the combined runner consolidates those component runs. Timing can change the first-pass timeout count, so the SFT retries whatever exact states time out and asserts zero remaining timeouts. It does not use held-out p1/p2 to fit the key.

## Research decision

Retire this exact positive-sign continuous source-key law. Retire the negative-sign continuous specialization with at most three OOV among the 56 complete training words; four or more OOV, altered segmentation, different reset schedule or different source operand are outside that result. No new authentic clue supports those rescues. The shared-matching relaxation can be reused on other mapped-key hypotheses without sweeping arbitrary alphabets. The complete fixed-clock inverse supersedes the conditional anchor bounds. Do not spend more time on this source operand without an independently motivated change in the cipher.

Reproduction: [Python SFT](../sims/lp2_p0_mapped_red13_sft.py), [exact local domain builder](../sims/lp2_p0_mapped_red13_domains.cpp), [global anchor join](../sims/lp2_p0_mapped_red13_anchor_join.cpp). The two C++ kernels and the matching MILP were executed locally; the combined orchestration's input generation was checked against those exact runs. Linux g++/Python 3.13, not a claimed Windows CI execution. The scope and dictionary are recorded so the result can be independently reproduced, not as an authorial cipher identification.
