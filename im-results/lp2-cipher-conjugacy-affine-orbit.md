# Agent8 #3161 — direct conjugacy inverse decisions (2026-11-27)

**No unknown original plaintext or authenticated key.** A single fixed law, not a clock/generator sweep.

## Mechanism and exact reduction

GP29 T(x)=x+1 and R(x)=28−x are individually authentic shift and Atbash operations. Their particular composition G_c=T^c R is exploratory, not independently source-selected. A_i=B_i A_0 B_i^-1; B_0=I; B_{i+1}=G_{C_i} B_i on consumption. Write B_i(x)=a_i x+b_i; a'=-a, b'=28+c−b. If A_0(x)=mx+k, multiplier m is invariant and k'=-k+(1−m)(28+c): scalar affine feedback, the ordinary case already belongs to [the retired affine gate](lp2-floral-continuous-affine-feedback-allsecret-gate.md). T,R generate no non-affine seed.

Ordinary consumption, p40–53, 3008 runes: define u_i=B_i^-1(C_i), D=A_0^-1, P_i=B_i(D(u_i)). For target plaintext pair p,q let W[u,v] count positions with u_i=u and B_i(v) in {p,q}. Hungarian assignment gives exact maximum over all 29! D. Enumerate all 406 pairs. Original maximum one-symbol 235; top-two **383** at [4,12]. Gibran and Shakespeare length-3008 native windows have minimum top-two 563 and 518, zero of 273584 compatible. Two random full-permutation plants each replay 3008/3008 with known key, true top-two and bound 614/614 and 611/611. Known-key controls, not blind recovery. This is a finite-donor frequency comparison, not a universal English theorem.

Literal-F affine: for all 29 starts and each m=1..28, propagate k; c=0 may hold, consumption requires c≠k and updates k as above. All m=2..28 die (latest offset 655; Atbash m=28 offset 98); m=1 leaves only k=0, identity. Exact legality result without language or hold-mask guesses.

[Script](../sims/lp2_cipher_conjugacy_affine_orbit_sft.cjs), [output](lp2-cipher-conjugacy-affine-orbit-output.json), corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.

## Local F-free direct inverse

No F in ciphertext implies every position consumes. Earlier hold mask is absorbed into the local seed; restart public B=I. Longest F-free interval p40–53 is p40 [45,163), 118 runes. First 78 hit 28 distinct u labels: a candidate 78-rune plaintext prefix fixes D(u_i)=B_i^-1(P_i), and the remaining mapping is forced by bijectivity. Fit determines full local key; predict 40 untouched runes.

Eight pinned native source/control tapes (Gibran, Shakespeare, Blake, three Liber AL books, Self-Reliance, editorial LP1 compilation): **0/346328** fitting windows, permitting arbitrary initial permutation and prior F mask locally. Two intentionally geometry-matched positive controls (first fixed-seed native substrings and random involutions satisfying no F and >=28 fit labels; seeds 3161301/2, trials 2012/1275) each recover unique donor offset, exact local key, 40/40 holdout. This is known-donor search, not general unknown-language recovery. [Script](../sims/lp2_cipher_conjugacy_fhold_local_crib_sft.cjs), [output](lp2-cipher-conjugacy-fhold-local-crib-output.json).

Separate wordwise CSP fits only complete words within 78; transcribed p40 boundaries verified against corpus (remove slash line-breaks). Non-F candidate dictionary words impose partial involution D with at most one fixed point, legal nonzero P on all 78 fit positions. MRV DFS permits up to two omitted words and completes remaining pairings. First corpus-only dictionary failed one leave-source-out plant; added already-pinned TextBlob lexicon and gated original run on both plants passing. Each source-excluded plant now has one exact key, 78/78 fit, 40/40 holdout, 2/0 omitted words. Original has 18 fit words; 9-rune word [33,42) has zero individually legal candidates. Budgets 0/1/2 give zero joint keys at 1/12/147 DFS nodes, no cutoffs. Exact for lexicon/boundaries/omission/involution assumptions, not arbitrary language. [Script](../sims/lp2_cipher_conjugacy_fhold_word_csp_sft.cjs), [output](lp2-cipher-conjugacy-fhold-word-csp-output.json).

## Blind nonlinear literal-F inverse

Additional speculative seed: one fixed-point involution (secret chart conjugate of Atbash). Alternate exact Viterbi over 58 public dihedral states (zero may hold/consume) with exact weighted perfect matching on 29 symbols plus fixed-point dummy. Three soft-penalty stages, 32 seeded restarts; final legal bigram Viterbi and forward replay. Fit 2000, freeze key/state, predict next 1008. Require >=95% fit/holdout on two controls and wrong-order rival failure.

[First run](https://github.com/FlareZ123/liber-primus/actions/runs/45948452121) failed Windows Unicode read (no result); corrected explicit UTF-8 then [run 45948761593](https://github.com/FlareZ123/liber-primus/actions/runs/45948761593) completed.

| case | legal starts | fit correct | holdout correct |
|---|---:|---:|---:|
| Gibran | 6/32 | 1966/2000 | 1008/1008 |
| Shakespeare | 9/32 | 1991/2000 | 1008/1008 |
| wrong-order | 3/32 | 188/2000 | 0/1008 |
| original | 0/32 | — | — |

Known-mask oracle recovers 29/29 key entries on both plants; blind initial keys match only 0/29 and 2/29, despite exact effective future decoding. Early zero-event ambiguity can alter the state path and conjugate the effective local seed. Do not claim unique initial-key recovery. Original best has three illegal consuming-zero-plaintext positions; no original candidate. Alternation heuristic, not complete nonlinear exclusion. [Script](../sims/lp2_cipher_conjugacy_fhold_matching_sft.py).

## Decision

Authentic generators reduce to retired affine feedback. Hidden chart is not independently source-selected. Arbitrary ordinary seed strongly contradicted on pinned donors; literal-F affine exactly excluded except identity; two local inverses and blind global solver no original key. Do not broaden clock/generator/seed search without independent typed chart/operation. Close #3161 as mathematical reduction/no-selector and bounded negatives, not solved plaintext.
