# Opening red13 as a mapped repeating key: exact structural and blind-calibrated inverse gates

**Decision.** The original opening red13 cannot be the positive-sign key of a continuously consumed F-fixed common-cycle cipher, for *any* GP29 alphabet permutation and any initial phase. The negative-sign model is structurally possible but its global inverse cannot satisfy four mandatory original p0 lexical anchors simultaneously in the broad frozen register below. There is no recovered unknown plaintext or historical key. The negative-sign result is conditional on all four anchor words being in-register; do not claim a three-OOV exclusion for the entire family.

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

## Research decision

Retire this exact positive-sign continuous source-key law. Retire the negative-sign all-four-in-register specialization; a genuinely OOV anchor, altered segmentation, different reset schedule or different source operand is outside that result. No new authentic clue supports those rescues. The shared-matching relaxation can be reused on other mapped-key hypotheses without sweeping arbitrary alphabets. An OOV-aware multi-anchor extension must explicitly account for omitted anchors and should not repeat the completed four-anchor inverse.

Reproduction: [Python SFT](../sims/lp2_p0_mapped_red13_sft.py), [exact local domain builder](../sims/lp2_p0_mapped_red13_domains.cpp), [global anchor join](../sims/lp2_p0_mapped_red13_anchor_join.cpp). The two C++ kernels and the matching MILP were executed locally; the combined orchestration's input generation was checked against those exact runs. Linux g++/Python 3.13, not a claimed Windows CI execution. The scope and dictionary are recorded so the result can be independently reproduced, not as an authorial cipher identification.
