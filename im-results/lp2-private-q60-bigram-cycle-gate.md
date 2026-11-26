# Chapter-private q60 ordinary additive inverse: exact spacing-free key recovery and held-out original rejection (#2931)

## Decision

The shortest exploratory period in the surviving arbitrary-position-transport regime does not yield original LP2 prose when instantiated as a **chapter-private ordinary additive GP29 key**, with unchanged rune order and every rune consuming. On p40–53 (3,008 runes), a spacing-free exact cycle-Viterbi optimizer recovers all 60 planted shifts in nine length-matched independent literary spans and one approximately length-matched native solved-source concatenation. Frozen suffix recovery is 7,527/7,527 runes across all ten controls (nine × 752 plus 759). The exact optimum on original prefix 2,256 runes is nonprose, and its frozen 752-rune continuation is even less native-like. More fundamentally, the original phase-pair equality statistic is 2,556, whereas all 580,195 matched contiguous literary rune windows have at least 4,111. No key whatsoever in this fixed family can map those exact native windows to the original. The fit is an exploratory calibrated negative, not a claim that all longer periods, F-hold clocks, transpositions or all plaintexts are excluded. No source instruction selects q60.

## Frozen experiment and exact optimizer

[Issue #2931 precommit](https://github.com/FlareZ123/liber-primus/issues/2931#issuecomment-7185870517). Original p40–53, including runeless p50, canonical GP29 indices. Freeze q=60, additive encrypt C_i=(P_i+K_(i mod60)) mod29, consuming clock at chapter start, no F exception, no spacing or dictionary restrictions. Fit the first 2,256 runes; decode the remaining 752 without changing any key entry. Use the pinned Emerson text only for the smoothed conditional bigram model (308,477 GP runes; 0.5 pseudocount per ordered pair). Literary normalization is the native GP greedy encoder: uppercase, strip internal apostrophes, V→U, K/Q→C, Z→S, ING→NG, then other native digraphs. The exact solved native reference runes are taken directly from the nine archived solved records, excluding non-runes, with artificial joins explicitly identified.

For every phase j aggregate each training pair at i−1,i with (i−1) mod q=j into F_j(x,y)=sum_i log Pr(C_i−y | C_(i−1)−x), all arithmetic mod29. The full training objective is sum_j F_j(K_j,K_(j+1 modq)). Condition on each possible K_0; Viterbi over each successive key phase gives the exact optimum, then close the final cycle edge. Retain the two best distinct paths per terminal state and compare across all 29 initial values to obtain the exact runner-up score, including ties. Complexity O(q·29³+T·29²), not a local search. All 12 independently generated ternary q4 factor toys match brute-force best and second-best over 81 keys, including ties. Each fitted key and decoded tape exactly forward-reencrypts its ciphertext.

The earlier [p32 local period60 study](p32-home-buds-period60-vigenere.md) solved a different 121-rune word-aware problem with four crib-fixed shifts; its whole-book/page lag60 tests do not identify a private long chapter key. The earlier [all-period phase-bijection gate](lp2-allperiod-secret-phase-bijection-original-gate.md) and transport bound motivate the stress-test value but do not imply that q60 is feasible on this chapter. This independent original-input experiment is not a period menu or a source-selected key claim.

## Blind native plants

Plant independent deterministic seeded 60-shift keys on Gibran, Shakespeare and Blake windows starting at rune offsets 0, 3008, 6016 in each source; none enters the Emerson language fit. The authentic nine solved-source records concatenate to 2,979 runes including p56/p57; train 2,220, hold out 759. Their joins make this a descriptive approximate-length control, not an authentic single historical message encrypted under q60.

| Control | Plants | Key recovery | Training runes recovered | Held-out runes recovered | Best vs runner-up margin (nats) | Held-out score (nats/pair) |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 3 | 180/180 | 6768/6768 | 2256/2256 | 52.757–55.984 | −2.6610 to −2.6041 |
| Shakespeare | 3 | 180/180 | 6768/6768 | 2256/2256 | 44.287–47.481 | −2.6829 to −2.5549 |
| Blake | 3 | 180/180 | 6768/6768 | 2256/2256 | 40.954–48.776 | −2.6855 to −2.6010 |
| Solved GP29 concatenation | 1 | 60/60 | 2220/2220 | 759/759 | 51.927 | −2.6189 |
| Original p40–53 | 1 | Unknown | Unknown | Unknown | **0.087538** | **−4.876806** |

Ordinary original fit uses 37 or 38 observations per shift (first 36 phases 38, remaining 24 phases 37). Original training optimum −4.135539 nats/pair, versus controls −2.648931 to −2.581273. The original runner-up is within 0.08754 nats of the maximum, unlike all plants. The original decoded and re-encrypted full tape is in the raw output, explicitly a nonprose optimizer output rather than a plaintext candidate. Because every key in this family has an inverse, replay is an invariant, not authenticity evidence.

## Exact matched-source phase equality bound

For any deterministic phase mapping, equal source symbols in the same phase cannot split; for a bijection, the complete count multiset at that phase is preserved. Thus E=sum_j sum_r binom(n_(j,r),2) is equal for any invertible fixed additive or arbitrary substitution key and can only increase under a noninjective map. Count all 3,008-rune contiguous windows of each fixed literary tape, updating the phase/rune histogram incrementally; the absolute-start phase relabeling has no effect on E.

| Source | Contiguous windows | E minimum | E maximum | E ≤ original |
|---|---:|---:|---:|---:|
| Original p40–53 | 1 | 2556 | 2556 | — |
| Emerson (training, descriptive) | 305470 | 4328 | 4957 | 0 |
| Gibran | 44696 | 4262 | 4743 | 0 |
| Shakespeare | 214606 | 4111 | 4868 | 0 |
| Blake | 15423 | 4336 | 4762 | 0 |

The finite exact gate does not depend on the language model, hidden key choice, original spaces or source window fit. It does depend on unchanged rune order and all runes consuming with period60. Arbitrary pre-encryption positional transport or the genuine F bypass changes which pairs share a phase, and is outside this test. An arbitrary long key is not rejected by this experiment. Retire the selected unchanged-order q60 ordinary receiver; do not tune q or the hold mask to rescue it without an independent clue.

[CommonJS SFT](../sims/lp2_private_q60_bigram_cycle_sft.cjs) · [raw profiles, keys, candidate output and exact input blob pins](lp2-private-q60-bigram-cycle-output.json). Core executed in connected V8; standalone Node/Windows CI not independently run.
