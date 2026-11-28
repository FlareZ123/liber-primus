# Source-selected partial plaintext invariants: the p56 F-converse trap (Director #3274)

**Agent15, 28 November 2026 — source gate negative for unknown-page plaintext.** A legitimate, *one-sided* ciphertext/cleartext relation is identifiable on the original solved p56 cryptosystem: plaintext `F` is passed through unchanged, so `P=F ⇒ C=F`. The converse fails on the **actual original p56 ciphertext**, not merely a synthetic example. Four of its five ciphertext `F` runes decrypt to different non-F values. No 2014/2016 authored source identifies this map as the cipher on any unknown p0–p55 receiver, so its only purported unknown-page projection is **conditional**, not a new plaintext recovery.

## Source-exact control and offset evidence

The authentic p56 original ciphertext is in `resources/liber-primus/lp2-corpus.json`, physical page56, 85 GP29 indices. The independently solved plaintext in `resources/external/relikd-solved-gp29-native-v1.json`, section `p56_an_end`, also has 85 rune symbols (ignore plaintext punctuation and its 128 hex digits). The original p56 additive prime-minus-one key schedule skips plaintext F; the only plaintext F genuinely occupies offset56. [Exact original p56 method and clock](../results/README.md#1-original-source-and-real-decoding-controls).

| Zero-based rune offset in p56 | Original ciphertext | Authenticated plaintext | In GP0 |
| ---: | --- | --- | --- |
| 35 | `F` | `A` | 0→24 |
| 47 | `F` | `I` | 0→10 |
| 51 | `F` | `D` | 0→23 |
| 56 | `F` | `F` | 0→0 |
| 74 | `F` | `C` | 0→5 |

Source exact: one `P=F` and five `C=F` in p56, with **four** source-authenticated false-positive ciphertext F marks; there are **zero** `P=F,C≠F` marks. This establishes the direction of the actual bypass implication and shows why a human who simply treats every observed ciphertext F as known plaintext F would introduce four incorrect p56 cribs.

## Mathematical invariant and its sharp limitation

Consider the class of candidate senders with *only* the p56-style special rule `P_i=F ⇒ C_i=F` and otherwise an unprovided, reversible nonzero-plaintext action with arbitrary key/state. By contraposition, a non-F ciphertext `C_i≠F` proves `P_i≠F`. But `C_i=F` cannot decide whether the sender passed through plaintext F or an ordinary non-F rune happened to encrypt numerically to zero. In the additive example, for any chosen `P_i=x≠F` and observed `C_i=y` one may set the unknown additive key at that position to `y−x mod29`; for `P_i=F` emission is F regardless of key. Thus without source-selected state constraints the non-F value classes are completely ambiguous.

The unknown physical pages p0–55 contain exactly **12,956** observed ciphertext runes: **458** are visible F and **12,498** are non-F. *If*, and only if, the exact plaintext-F bypass property extended unchanged, this would exclude plaintext F at those 12,498 non-F positions; it would **not** identify any actual plaintext letter at those positions or at the 458 ciphertext-F positions. The red p0 title's ciphertext F at offset7 does **not** authenticate a plaintext F; a proposed first title word lacking F is not falsified by that fact.

This is the highest-confidence available candidate for a source-derived **one-sided** partial plaintext projection, because p56 supplies a genuine known-encryption control. But the hypothetical transfer from p56 to the unknown book has no explicit source selector. Indeed, source-established p56 and LP1 cipher operations differ, and original-all-origin p56-style extensions have strong negative tests; treating this property as universal would assume the mechanism we must discover. It therefore contributes **zero unconditional original-plaintext constraints**, not 12,498 known runes.

## Why existing p0 / q8 partial clues cannot rescue this

- The independent historical reading of the p0 `3|3` staves as `E` is a **visible ornament interpretation**, not a first-party statement that either unknown title plaintext letter is E or that an authenticated cipher map preserves E ([English group-and-position witnesses](lp2-anglosaxon-isruna28-gp29-gate.md)). Source-visible E at the third position of a title *ciphertext* is not a plaintext crib.
- A global unknown chart admits swaps on chart labels absent from its authentic inputs (exact certificates in [#3261](lp2-q8-erased-crib-native-coverage-gate.md)), so an unanchored symbol label is not a gauge-invariant plaintext value. A chart's equality partition can survive those swaps, but no first-party source states that a corresponding repeat in unknown LP2 encrypts through that same chart and phase.
- The seven-crib conditional common-q8 action becomes identifiable on some oracle-controlled plants only after **true located plaintext words are supplied**. The [candidate audit](lp2-q8-source-placed-crib-dependency-gate.md) finds no authenticated original (location, word) pair, thus no nontrivial source-justified q8 input row.
- A source-held equality relation without a placed recipient or a named rune value (2013 repeated book coordinates) is not a projected original plaintext function; exact historical parity/equality does not transfer by appearance alone.

## Decision and minimum new input

No LP2 p0–55 plaintext can be derived from the proposed F-mask, p0 staves or q8 chart-swap quotient without importing an unselected cipher-law transfer. **Do not convert ciphertext F into plaintext F**, and do not count 12,498 conditional `P≠F` exclusions as independent source evidence.

The minimum new evidence is a first-party statement or an independently tested original inverse that selects a specific unknown-page receiver and guarantees `P=F ⇒ C=F` there. That would make a genuine partial **non-F class** constraint; to fix an actual plaintext rune value (rather than only `P≠F`) it additionally needs a source-fixed key/chart/phase or a source-labelled equality relating it to known plaintext, plus a separately frozen untouched prediction. No new original search is justified now.

**Exact reproducibility:** `python3 sims/lp2_p56_f_nonconverse_source_sft.py` (stdlib only, read-only). Its assertions span all 85 original p56 pairs, the five false-converse events, full 12,956-rune unknown corpus and p0 title offset7. This proves a real control fact and the extent of the conditional projection; it neither fits unknown plaintext nor asserts the missing transfer.
