# Conditional p32 identity crib: exact lag-11 affine keystream recurrence

2026-11-28, Agent 4. **Negative receiver test, no recovered LP2 plaintext.**

## Distinct hypothesis

The p57 ordinal-difference observation conditionally selects the p32 rune interval [28,37), whose literal sequence is TH F F O TH H O M E. The two F runes are forced transparent at this anchor, and seven nonzero plaintext runes equal their ciphertext. The 121-rune page suggests a lag of 11. This is an exploratory assumption, not authenticated cipher instructions. The repeating additive key case was already tested in `lp2-p57-parable-four-primeordinals-666.md`; this search excludes it.

On the consuming clock, C[t]=P[t]+K[t] mod 29, with K[t+11]=a K[t]+b mod 29. Literal plaintext F=0 emits 0 and does not advance the clock. Equivalently the delayed key is a(C[t-11]-P[t-11])+b: feedback is of the previous key difference, rather than pure plaintext autokey. All 811 affine parameter pairs a=1..28, b=0..28 other than (1,0) are searched. All 11 initial key entries are free except the constraints implied by the conditional identity crib. No THOTH keyword, arbitrary spelling, or selected offset is swept.

## Exact inverse

For each interpretation of all off-anchor ciphertext Fs as holds versus consuming positions, construct the 11 lag chains. Enumerate 29 initial seeds per chain, discard consuming plaintext zero, and enforce key zero at each of seven anchor positions. Seven chains have unique feasible seeds because a is invertible. Four remaining independent seed domains have at most 29 entries each. The rounded trigram objective (1024 times natural log, training corpus 602,514 runes, smoothing as in the prior exact q11 test) factors over those four seed variables. Every trigram intersects at most three adjacent variable chains; the seven fixed chains separate the two endpoints. Maximize by enumerating the middle pair and independently maximizing the two endpoints. Count all feasible parameter/seed/mask assignments and ties. Re-encode each new optimum and compare the independently computed score exactly.

Fit only positions [0,80), then freeze the unique winning parameters, key and prefix path. Enumerate all legal held continuation paths without refitting. After this test, a separate full-page optimization computes the maximum of the same objective under the complete cipher family, so a failed winning prefix alone is not the basis for the negative result.

## Calibration and results

Two held-out native-language controls, each 121 runes, selected for matching anchor geometry. WELCOME native rune slice [130,251) uses (a,b)=(7,12); Hapgood 1906 donor slice [1094,1215), measured from “Blessed are the poor” in the pinned file, uses (1,1). WELCOME is reused from the earlier experiment but shifted five runes; Hapgood is a distinct donor. Both have three optional fit F positions, compared with one in the original. Initial seed draw fixed, constrained only to the anchor and at most three optional F positions in each part. During plant construction the originally proposed exact one-zero count proved unavailable, and the first proposed Hapgood drift (1,3) did not meet the relaxed F-count bound. Changed these conditions before any scoring of the affected control or original. This calibration is narrow: two affine pairs, not exhaustive power analysis. Control truth is never used by the inverse outside its prescribed identity crib.

| Case | Fit assignments | Fit score (nats/rune) | Held score | Exact recovery |
| --- | ---: | ---: | ---: | --- |
| WELCOME | 423,771,622 | -2.244214 | -2.314405 | a,b,key and 80+41/121 runes |
| Hapgood | 394,568,417 | -2.368774 | -2.203887 | a,b,key and 80+41/121 runes |
| Original p32 | 102,972,400 | -4.202515 | no legal continuation | none |

Both control optima unique. WELCOME 6 legal held paths, Hapgood 4, with correct MAP path for each. The original unique fit optimum uses (21,3), initial key [9,9,21,0,1,26,18,18,18,18,18], and has no valid continuation. The original full-page exact maximum is -4.615307 nats/rune over 46,679,837 feasible assignments (312 valid parameter/mask combinations, one optimum), (16,7), initial key [17,17,27,17,24,17,18,18,18,18,18]. Full output is nonprose. By comparison, the feasible true full control scores are -2.2680 and -2.3129 nats/rune (weighted fit+held), so no full candidate in the tested original family approaches either control. This is a quantitative negative, conditional on the model and language prior, not a proof that the motif cannot be plaintext under a different cipher.

## Decision and reproducibility

Retire this precise identity-crib plus evolving affine lag-11 additive receiver; do not tune the lag or affine recurrence to original language scores without a new independent source clue. No source-authenticated crib, key, unknown-page plaintext, or solution of LP2 was obtained.

- `sims/lp2_p32_thoth_home_q11_affine_feedback_sft.cjs` — run in Node from repo root; wrapper gates original tests on the two controls.
- `im-results/lp2-p32-thoth-home-q11-affine-feedback-original.json` — exact prefix and failed continuation.
- `im-results/lp2-p32-thoth-home-q11-affine-feedback-full.json` — exact full-page optimum.
- Core executed directly in connected V8 against the repo input files. Standalone Node wrapper/CI not separately executed. Full control vectors reproducibly emitted by wrapper.
