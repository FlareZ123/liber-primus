# Quadratic ciphertext-forced state: exact all-secret original inverse

**Decision — Agent 7, 27 November 2026:** retire the entire defined quadratic ciphertext-forced scalar receiver on original physical p40–53. No unknown plaintext or authenticated key. The exact p39 red quadratic is included, but the wider parameter family is exploratory; no author-selected general quadratic law is asserted.

## Source and mechanism

The three original p39 red indices [27,5,15] define G(k)=27+5k+15k² (mod29), previously tested as an additive p16–21 clock in [Agent1's source report](lp2-p16-p39-nonlinear-forced-state-original-inverse.md). The following floral p40–53 chapter has 3,008 runes in 13 rune-bearing physical pages, including 125 ciphertext F; p50 is rune-free. This is an adjacent receiver with no assumed printed word boundaries.

All laws k' = αk²+βk+γw(C)+δ over GF29 with α and γ nonzero are conjugate by s=αk+β/2 to s'=s²+u w(C)+v, where u=αγ≠0 and v=αδ+β/2−β²/4. Test all 812 (u,v), either native GP ordinal or GP-prime residue w(C), all starting states. For the exact red G and ordinal forcing, (u,v)=(15,17); additive decryption P=C−k becomes P=C+27s+5. The source does not select prime-residue forcing or arbitrary coefficients; these are stronger encompassing alternatives.

## Exact arbitrary-row bound (physical clock)

For ordinary consuming ciphertext, the state is public given the law and start. Grant an arbitrary secret permutation π_s for each state, P=π_s(C). For a histogram H(s,c), the maximum possible count of any two distinct plaintext labels is exactly the sum over states of the two largest row counts. All 23,548 (law,start) combinations per forcing and reset convention are evaluated. Native English control floors are 563 across 59,485 Gibran windows and 518 across 214,099 Shakespeare windows (all length 3,008).

| Forcing | Clock | Max one | Max two | Exact-source (15,17) max two |
|---|---|---:|---:|---:|
| GP ordinal | continuous | 250 | 466 | 423 |
| GP ordinal | common initial state per page | 253 | 465 | 427 |
| GP prime residue | continuous | 251 | 460 | 448 |
| GP prime residue | common initial state per page | 254 | 464 | 446 |

If a plaintext-F hold still advances the physical ciphertext clock, two non-F target labels are bounded by U₂, while a pair containing F is bounded by 125+U₁. The displayed U₂ is the larger in all four cases. Thus even arbitrary secret row permutations cannot reach either finite donor floor in these physical-clock models. Four native arbitrary-row known-key controls reproduce 12,032/12,032 runes; this capacity proof does not depend on optimization success.

## Direct consuming-only authentic F inverse

For affine output, every nonzero ciphertext coefficient and nonzero state coefficient is represented by P=a(C+B s+D), a,B≠0. The literal-F hold yields C=0 without advancing the state; every consuming branch must produce P≠0. Whether P=0 is independent of a. For any (u,v,B,D) propagate the exact 29-bit set of reachable states: for nonzero C retain only nonzero-plaintext consuming transitions; for C=0 union unchanged hold states with legal nonzero consuming states. This is an exact simultaneous all-seed test with no beam, lexical score, fixed F mask or search cutoff.

| Forcing | Normalized nontrivial classes | Full continuous survivors | Longest legal prefix | Surviving common laws with independent initial states after p40,p41,p42,p43,p44 |
|---|---:|---:|---:|---|
| Ordinal | 659,344 | 0 | 691 | 7,610 / 93 / 4 / 1 / 0 |
| GP prime residue | 659,344 | 0 | 781 | 7,521 / 82 / 1 / 0 / 0 |

Every class covers all 28 output scales and all 29 starts; page-private starts can differ freely, but coefficients are shared. B=0,D≠0 necessarily fails at C=−D since all 29 labels occur; B=D=0 gives only a static rescaling of the near-uniform original, not an evolving key. For the exact p39 law the affine-family longest prefixes are 398/416 respectively; its source additive output dies at original offsets 61/71. No language scoring of original ciphertext is warranted after exact infeasibility.

## Blind inverse calibration and scope

Train a smoothed GP29 trigram model on Gibran first 40,000 and Shakespeare first 150,000 encoded runes. Construct disjoint 3,008-rune plants at native donor offsets 51,000/180,000; scan both forcing registers and every normalized ratio class using just the first 1,200 ciphertext runes. Five and seven ratios respectively survive in the correct register; zero in the other. Score all 28 scales of all surviving ratios by exact Viterbi on (state, previous two plaintext runes), retain the best law, scale, seed and terminal state, then decode the remaining 1,808 runes without parameter refitting.

| Plant | Selected secret | Training exact | Held-out exact | Forward replay |
|---|---|---:|---:|---:|
| Ordinal | (15,17,27,5,1,24) | 1,200/1,200 | 1,806/1,808 | 3,008/3,008 |
| Prime | (22,7,20,7,13,9) | 1,200/1,200 | 1,808/1,808 | 3,008/3,008 |

The two errors in the first held-out donor are real latent-hold ambiguity; full replay is not authentication. This is calibrated key recovery for the specified family, not proof of historical selection.

Arbitrary row permutations with a **consuming-only** F clock remain outside the exact affine exclusion. For the fixed (15,17) source law, an exact per-row reward DP over 126 zero-delimited segments, maximizing each row's two selected cipher labels over independent legal state paths, gives relaxed top-two upper bounds 697/689 (one-label bounds 378/381). These exceed the reference floor and are **inconclusive**; independent path relaxation cannot establish a realizable shared-path solution. Do not conflate these with the physical-clock cap. Other nonlinear state laws, secret input encodings, independently changed coefficients per page, transposition, and arbitrary consuming-F row maps remain untested here.

[Standalone CommonJS SFT](../sims/lp2_quadratic_cipher_forced_state_allsecret_sft.cjs) · [Exact output with input blob pins](lp2-quadratic-cipher-forced-state-allsecret-output.json). The exact function in the SFT ran in connected V8 against the fetched repository inputs; the Node CLI wrapper was not separately executed. No workflow or original resource changes.
