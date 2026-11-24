# Blind affine plaintext advancement law recovery for a nonperiodic prime clock

## Question and method

The [direct GP-weighted clock experiment](lp2-plaintext-weighted-prime-index-clock.md) tested four explicit advancement rules. Here the advancement law itself is secret: preserve the authentic p56 shift K(j)=prime[j]−1 mod29 and transparent F/no-advance convention, but for each consuming plaintext rune p advance the zero-based prime index by

g(p) = 1 + (a·x(p)+b) mod29,

where x is either the GP zero-based ordinal or the GP prime value, a,b in 0..28. Constant maps (a=0) are identical in both registers and included once. There are 1,653 maps and 464 independent initial states (766,992 parameter pairs). Every legal F-history is included via exact ordinal-state propagation. This is a distinct model from varying the shift value itself, and the whole-step sequence is nonperiodic. The positive steps ensure monotone advancement; no resets within chapters, no plaintext word-boundary assumptions. The source motivates GP values, primes and totients but does not fix this affine advancement law.

Viterbi ranking uses the previous two decoded runes and prime ordinal as the sufficient state, maximizing a smoothed native trigram model trained on five LP1 sections, withholding both long control sections and p56/p57. The key is inferred from only the prefix; the selected prefix path/state is frozen and used on untouched suffix. Exact reachability is language-independent, while language scores are only heuristic evidence.

## Actual blind controls

| Native plaintext encrypted by hidden law | True and recovered (register,a,b,initial j) | prefix | heldout | heldout nats/rune |
|---|---|---:|---:|---:|
| LP1 first KOAN (780) | ordinal,11,7,173 | 240/240 | 540/540 | −2.54709 |
| LP1 LOSS OF DIVINITY (755) | prime,7,19,83 | 240/240 | 515/515 | −2.71346 |

Both complete plaintexts forward-replay exactly. All 1,653 advancement laws and 464 starting ordinals were considered. 309/883 laws had some legal 240-rune prefix; 7/2 laws had some full legal path; language scoring of the prefix alone selects the planted law and initial ordinal. These are synthetic encryption plants using genuine source plaintext, not additional historical decryptions.

## Original unknown nine chapters

| pages | length | maximum legal prefix | maps with any full legal path | maps with legal half-prefix |
|---|---:|---:|---:|---:|
| 0–2 | 729 | 729 | 26 | 688 |
| 3–7 | 1,145 | 615 | 0 | 3 |
| 8–14 | 1,729 | 634 | 0 | 0 |
| 15–22 | 1,903 | 719 | 0 | 0 |
| 23–26 | 1,021 | 648 | 0 | 37 |
| 27–32 | 1,433 | 684 | 0 | 0 |
| 33–39 | 1,680 | 594 | 0 | 0 |
| 40–53 | 3,008 | 1,315 | 0 | 0 |
| 54–55 | 308 | 308 | 34 | 728 |

No original half-prefix winner has a legal complete frozen continuation. Winners for p0–2, p3–7, p23–26, p54–55 die at offsets706,615,610,169 respectively. Seven chapters have empty full legal path sets even granting independent maps and origins per chapter; in particular p40–53 rules out all 766,992 parameter pairs and all latent F histories before its preselected half-prefix cutoff. The best retrospective full legal path for p0–2 is ordinal(16,7), j239, −4.48154 nats/rune; for p54–55 it is ordinal(15,18), j431, −4.38557. Both forward-replay and produce incoherent text (first p54–55 runes UTIAYTSEIXPTHRCEEAWBIAREXGEAEJPRIIDBEANOLYAEBOTHEFPHTJYPIASDNLEPWAEEAAEOCSGIUFHNARECMIPHIAIANGCGAEPXEPEODEAPIOREIAILEOM). Neither is a source-authenticated key.

## Decision

The exact reachability test excludes the declared affine advancement family on seven chapters, and the calibrated constructive attack finds no authentic text in the short survivors. This closes the finite rule domain only. It does not exclude arbitrary GP-dependent advancement, larger independently justified starting ordinals, a changing shift law, intermediate representations or reset mechanisms. Avoid another affine-advance sweep without a new independent source selector.

Reproduce with [standalone Node SFT](../sims/lp2_affine_plaintext_prime_index_clock_recovery_sft.cjs). Inputs canonical lp2-corpus.json and relikd-solved-gp29-native-v1.json. The calculations were performed on those fetched inputs in connected V8; no independent CI run is claimed.
