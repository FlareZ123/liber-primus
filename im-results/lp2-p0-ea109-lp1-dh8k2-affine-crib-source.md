# P0 EA109 → earlier LP1 WELCOME affine six-rune crib: source-state coincidence, not plaintext

**Agent7 · 23 November 2026. Classification: original-source candidate, exact finite cross-release discriminator; no decoded LP2 plaintext or key.**

## A source-motivated six-symbol alignment

The existing original-state route reads GP-prime(EA)=**109** as a p0 coordinate. The independently documented 2013 DH register supplies **A=8, K=2**; the authenticated 2016 signed-message route later selected the p0 raw `XY` at zero-based rune109. These sources predate *this* cross-release test, but the 2016 message **postdates the original 2014 LP2 publication** and cannot be treated as an original-era instruction to apply an affine cipher.

Compare the actual p0 physical rune offsets **109–114**, in printed line six, with the already-solved LP1 **WELCOME** source at rune offsets **21–26**, where the words are `TO THE GREAT ...` (the six GP runes `T O TH E G R`). The exact source GP29 ordinals are:

```
source LP1 WELCOME local21..26: [16,3,2,18,6,4]   => T O TH E G R
original LP2 p0 local109..114:  [14,26,18,1,21,5] => X Y E U NG C
```

Applying the **already known DH values as an otherwise unselected affine GP29 rule** gives exactly `C=(8P+2) mod29` for all six symbols. The inverse would begin `TO THE GR`. This is a *candidate* partial crib, not a decrypted phrase. The seventh native-LP1 symbol is **EA** (the vowel in GREAT), which under the same frozen affine rule must encrypt to GP ordinal **23 (D)**; the original p0 seventh symbol is **0 (F)**, not D. Thus the fixed rule immediately fails inside the same source word. There is no original instruction selecting the LP1 WELCOME source location, an affine decoder, a state change at that symbol or a carried F exception.

**Independent word-boundary failure:** The same six source runes are in LP1 printed words **`TO` (2 GP runes), `THE` (2), `GREAT` (first 2 of a 4-rune word)**, so the source phrase has visible breaks after the second and fourth six-run positions. The original LP2 p0 physical word segmentation at offset109 is **`XY` (2), `E- U- NG` (3), then `C F N`**—i.e. source breaks after the second and **fifth**, not fourth, positions. A single per-rune affine substitution does not move a printed word break. Even the six-rune crib is therefore **not a literal word-preserving plaintext phrase** without an independently supplied punctuation/segmentation transport. This is separate from the seventh-symbol mismatch and makes the native-LP1 crib materially less credible.

The fixed affine inverse applied to the *entire unchanged p0* has GP29 IoC **0.034307273844**, exactly equal to ciphertext's IoC (as any alphabet permutation must), and does not produce contiguous native GP English. It cannot be promoted as a full-page plaintext recovery.

## Full cross-release match-family control

To avoid elevating a short search hit to proof, use **all seven externally pinned clear LP1 GP29 source records in the relikd file** (2,799 reference runes) against **all 55 rune-bearing original unsolved LP2 pages** (12,956 runes). Preserve **page and known LP1 section boundaries**; never concatenate them to fabricate longer matches. For all nonzero affine slopes `a in 1..28`, all shifts `b in 0..28`, and complete contiguous windows:

| Match family on unchanged sources | Exact pairs |
| --- | ---: |
| Six-rune windows agreeing under some `C=aP+b mod29` | **57** |
| Seven-rune windows under any `a,b` | **0** |
| Six-rune windows under the fixed `a=8,b=2` DH state | **1**, precisely p0:109 ↔ WELCOME:21 |
| Seven-rune windows under that fixed DH state | **0** |

For scale only, the frozen comparator has **2,764** length-six windows inside its seven LP1 sections and original LP2 has **12,681** length-six windows inside 55 rune-bearing pages. Under a deliberately simplistic independent uniform-GP29 reference, a pair admits some nonzero-slope affine relation with probability `(28/29)^2 / 29^4`, yielding approximately **46.2 expected six-window contacts** across 35.0 million pairs. The observed **57** is therefore not remote even in that simplistic scale model. Actual native LP1 language, LP2 anti-repeat constraints and overlapping windows violate the iid reference, so this is **not a calibrated chance probability or proof of independence**.

The `a=8,b=2` match occurs at a previously interesting coordinate, but the LP1 six-rune source window and affine interpretation were selected while looking across the *entire* first-release source. The 57-member full affine search family, several separately investigated source selectors and the exact seventh-rune failure preclude interpreting the short alignment as proof that an original runic phrase was recovered. The exact values `A,K` give a plausible hypothesis to test only if a *different first-party source* prescribes the cipher law **and changing state**, or provides a genuinely withheld decoder receiver.

The pinned external relikd GP-native solved source is **not byte-identical to the later corrected 2,797-rune physical LP1 p0–16 reconstruction**: a two-rune discrepancy lies in the KOAN section, not in the WELCOME six-rune contact. Accordingly, the 57/0 whole-book match counts are exact for this frozen **2,799-rune relikd comparator**, not a claim about every possible historically corrected LP1 transcript. The candidate contact itself is unchanged.

A 95-rune planted independent **solved p57 native-GP plaintext** control passes `P → 8P+2 → 11(C−2)` with **95/95** reconstruction; this validates the arithmetic, not the original hypothesis.

## Decision

Preserve the exact six-rune cross-release contact as a potential marker, with its **immediate seventh-rune rejection**. It supplies **no p0–55 plaintext, creator-selected key, letter-by-letter inverse, or proof of an LP1 reuse scheme**. Do not retune state after the mismatch, relabel F, add wordwise exemptions or expand arbitrary affine phases to rescue it. The scoped reproducer is [`sims/lp2_p0_ea109_lp1_dh8k2_affine_crib_sft.cjs`](../sims/lp2_p0_ea109_lp1_dh8k2_affine_crib_sft.cjs), reading only original LP2 corpus and the already-pinned native first-release LP1 source.

Related context: [existing EA109→XY word-map hypothesis](lp2-signed2016-p50-xy-word-map.md) and [archived original LP1-native reference](../resources/external/relikd-solved-gp29-native-v1.json).
