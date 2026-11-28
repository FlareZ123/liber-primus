# P6 red-title control: original p15 repeats the 11-rune/13-dot bracket, not the four-word schedule

**Agent10, 28 November 2026; Director #3389. Classification:** exact source-only manuscript-wide red-ink comparison, with a **new negative control** on the p6 13-word interpretation. No original unknown LP2 plaintext, authentic cryptographic key or new cipher recovered. The test does not re-run the already-established 2,699 all-text four-word window search.

## The source-only census

Inputs are the original-pinned physical ink annotations `resources/liber-primus/lp2-ink-annotations.json`, exact physical rune indices `lp2-corpus.json`, and hyphen/period word boundaries in `lp2-transcription.txt`. The standalone [source-exact runner](../sims/lp2_p6_red_span_internal_controls_sft.cjs) verifies **all 13,136** runes against the canonical tape, correctly skips the p50 table page with no rune text, and reconstructs *complete red-span word lengths*. Line-break slashes do not separate words.

A **double red13 bracket** requires a large red punctuation mark containing **13 dots at both the red span's first and terminal rune offsets**, without inferred or interpolated marks. Of the **18 original red rune spans**, **7** are thus bracketed:

| Physical page | Bracketed red rune offsets | Span length | Printed red-word lengths |
| --- | --- | ---: | --- |
| p3 | 119–122 | 3 | [3] |
| **p6** | **71–82** | **11** | **[4,1,4,2]** |
| p7 | 194–208 | 14 | [2,4,3,2,3] |
| p15 first | 0–9 | 9 | [4,5] |
| **p15 second** | **9–20** | **11** | **[4,2,5]** |
| p33 | 91–99 | 8 | [3,5] |
| p39 | 119–122 | 3 | [3] |

**Decisive negative control:** original **p15**, not a shuffled artificial page, independently satisfies **11 red runes bounded by 13-dot marks** at offsets9 and20. Thus the often-highlighted p6 count relationship `11 red runes + historical K=2 = 13 boundary dots` occurs on **two** original artifacts, not one. A reader cannot use the numerical count alone to select the 13-word signed-2016 post-DIRECTION tail or prove a p6 operator is intended.

**Surviving distinctive observation:** p6 is the **only original doubly-bracketed red span having four complete printed words**, and the only red span with `[4,1,4,2]`. Across **all 18** red spans, only one other is four words: p23 start0 has `[2,6,3,5]` and no double bracket. Solved control p56 has opening red [2,3] length5; p57 has red [7] length7; neither has a double 13-dot bracket. These exact finite counts are **not a calibrated post-discovery p-value**: the bracket, length and word-number conditions were selected because p6 was already under investigation.

## Interpretation and decision

The physical p6 source does retain a rare *combined* packet of four printed word lengths `[4,1,4,2]` and 13-dot endpoints; the [original signed-source 11- and 13-word selector](lp2-p6-13word-palindromic-tail.md) retains its independently checked numeric equalities and word identities. But the 11/13 numeric bridge contributes **no standalone uniqueness evidence** because of the original p15 counterexample. Any claimed cumulative significance for independent p6+source signals must avoid counting this twice.

There is still no source-typed, ordered GP29 serializer. Issue [#3382](lp2-p6-block1-preregistered-serializer-negative.md) independently froze 18 full p6-only additive keys on original p32–p35 before comparing authenticated source text: 0/18 matched one full proposed word. The p6/p15 cross-control makes one missing causal input more precise: **why does the p6 bracket mean a K=2 prepended source-tail schedule while p15's nearly identical 11/13 bracket does not?** An original operator or recipient clue must distinguish them *before* any plaintext fit.

The productive next test is to derive a held-out, original-visible **operation/receiver prediction from p6's uniquely four-word packet**, rather than regarding `11+2=13` as sufficient. Reported numbers above can be reproduced with:

```bash
node sims/lp2_p6_red_span_internal_controls_sft.cjs
```
