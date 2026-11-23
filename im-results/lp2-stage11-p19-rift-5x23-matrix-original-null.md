# 2014 Stage11 prime omission → LP2 page19 RIFT → 5×23 fold: source-scoped negative

## Independent source and hypothesis

The first-party 2014 Stage11 signed redirect (`resources/historical/cicada2014-stage11-message.asc`) presents whitespace-run sizes `2,3,5,7,11,13,17,23,29,31,37`. The sequence matches the previously documented **OEIS A194954** prime subsequence and skips **19** by its own generating rule. The omission therefore **does not independently select LP2 page19**. A bounded earlier exploratory observation (see `sims/lp2_stage11_p19_rift_split_sft.cjs`) locates the word `RIFT` at the original physical LP2 page19 zero-based rune offset **152** (19 × the one-based ordinal8 of prime19). This 271-rune page splits into 152 runes, the four `RIFT` runes, and 115 runes. Removing the first 37 runes of its left fragment leaves **two 115-rune panels**, with 115 = **5×23**; 37,5,23 occur in the original prime margins.

**All choices are exploratory.** A194954 independently explains the missing 19, and the source does not select the address 19×8, discard the first37 runes, or request a matrix transposition. The earlier source SFT already tested direct additive folds. The present experiment tests a distinct, finite two-dimensional operation and its null, without optimizing candidate keys after looking at English.

## Fixed 5×23 receiver and exact original-result test

Represent each 115-rune panel as a row-major **5×23** or **23×5** array. Allow original-order or transposed flattening, optional reversal of rows and columns. This yields 16 layouts per panel and **512** pairwise layout/sign combinations (16×16×2). For each candidate construct `P[i] = (L_layout[i] ± R_layout[i]) mod29`, a fully reversible GP29 operation if the other panel and both original layouts are retained. Score the 115-rune candidate against a GP29 trigram model with alpha0.2 add-smoothing, frozen from 217,644 Gematria-normalized source Shakespeare runes. No invented plaintext words or fitted substitution tables are used.

Original best: log trigram score **−4.08564616191648 per symbol**, left **5×23 reverse rows**, right **5×23 transpose plus reverse columns**, subtraction, with no natural-language plaintext. Its first runes are `PNGJAEAWOEGAEEOTPNLEJUSYFIAYXHROEEOPYXWSMFNGGEOOEDAEJSCPMAREOAEOEOFASNGASAGOMIMJCJGYBR`.

Null: independently Fisher–Yates-shuffle the 115 original *right* runes while keeping their exact rune inventory and the entire left panel fixed; rescan all 512 alternatives in **100 frozen xorshift32 trials**, seed `0x33011937`. **54/100** null maxima meet or exceed the original maximum, add-one descriptive **p = 55/101 = 0.5445544554**. The null average best is **−4.0736500798**, its strongest best **−3.9415722387**, and genuine 115-rune heldout native GP prose scores **−2.0878596391**. A source-native additive plant exactly reverses 115/115 original-shaped symbols.

**Decision:** This 5×23 two-panel rearrangement/combiner does not recover an authentic p19 passage and gives no evidence for the hypothesized instruction. Retire the specific 512-variant route; the original Stage11 omission and p19 RIFT coincidence remain independent raw observations with unresolved relevance. Do not promote to authoritative plaintext results. Future attempts need an independently authored selector for the discarded37, the coordinate address, and the transform, or a new source-derived key that predicts untouched ciphertext.

## Reproduction

Source: [read-only Windows Node22 SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_stage11_p19_rift_5x23_matrix_screen_sft.cjs). The complete source corpus and independent language control are in `resources/liber-primus/lp2-corpus.json` and `resources/control/shakespeare_first300k.txt`. [Actual Windows CI PASS 2026-11-23, run45118796677](https://github.com/FlareZ123/liber-primus/actions/runs/45118796677); main source-test job 137507599935. Result script asserts the original p19 marker geometry, exact maximum, exact seeded null exceedances, and positive-source inverse. No undocumented random choices or repository file writes.
