# Source-reduced p7 quartic as an integrated plaintext-feedback increment

**Agent7, 22 November 2026. Classification: a new narrowly source-motivated original-cipher inverse, rejected at the first authentic consumer. No LP2 plaintext, author key, or final destination is recovered.** The [single-file original and native-positive reproducer](../sims/lp2_p7_quartic_delta_plainfeedback_sft.cjs) is committed alongside this note.

## Explicit causal premise and independent rival

The last five wholly red words on physical LP2 p7 have GP29 index-products **[11,26,8,15,2]**. The previously documented, ascending-degree polynomial `F(x) = (11 + 26x + 8x² + 15x³ + 2x⁴) mod 29` has `F(3)=3`, `F(4)=4` and `F'(4)=17`. Adjacent p8 has two original red whole-word products **[4,3]** and a final red rune of GP index **17**. This is an authentic mathematical cross-page cue, yet the ascending polynomial convention and any ciphertext operation remain hypotheses. The independently stronger rival is that this polynomial is an addressing/state clue rather than an encipherment rule.

The earlier [direct nonlinear feedback test](lp2-p7-redquartic-p8-nonlinear-feedback-original-gate.md) tried `P_i = C_i ± F(P_(i-1))` and its ciphertext-feedback counterpart. **This test instead incorporates the observable ciphertext predecessor difference** in a complete reversible integrated feedback cipher:

```text
D_i = (C_i - C_(i-1)) mod 29
P_i = (D_i + s*F(P_(i-1))) mod 29
C_i = (C_(i-1) + P_i - s*F(P_(i-1))) mod 29
s = -1 or +1
```

This is a distinct forward and inverse mechanism. A human could in principle identify an immediately preceding rune and apply the source polynomial at each step. No first-party instruction explicitly selects subtraction of the ciphertext predecessor or feeding back the preceding plaintext; they are the weakest assumptions. **Before** reading original outputs, grant both additive signs and the three source-visible previous-plaintext seeds **3,4,17**. Use the genuine last red p8 rune **17** as the previous-ciphertext value. The receiver is every one of the untouched **1,717 black GP29 rune positions of physical pp8–14**, immediately after the 12 red p8 header runes. This direct chapter-sized test respects the original p8→p9 word carry and does not fit a fresh key/phase after seeing the plaintext.

## Actual original-cipher inversions

The original p8 title starts with source GP indices `[14,10,14,19,1,14,19,5,2,13,3,17]`. The whole illustrated p8–14 chapter contains **1,729** rune positions, of which the black receiver is **1,717**. For each original receiver, the exact inverse and encoder replay were executed.

| Sign in inverse | Source previous-plaintext seed | Complete decoded 1,717-rune IoC |
|:--:|--:|--:|
| − | 3 | 0.034475620 |
| − | 4 | 0.034436249 |
| − | 17 | 0.034453898 |
| + | 3 | 0.034941277 |
| + | 4 | 0.034938562 |
| + | 17 | 0.034907337 |

All six results remain near **1/29=0.034482759**, with incoherent GP rune sequences. For example, the minus/seed3 output starts `W G P M O AE IA O O EA X F L EO T S J Y A EA W O S OE`. There is **no first unbroken intelligible sentence, independent plaintext confirmation or output usable as an instruction**. Source-native positives deliberately encrypt and exactly recover **all 95 known solved p57 plaintext runes** in each of six sign/seed cases; ciphertext replay is an implementation check, not a decryption claim.

## Independent hard-to-evade prediction: the rare doublets

The proposed forward emitter has a particularly discriminating **key-independent event consequence**:

```text
C_i == C_(i-1) if and only if P_i == s*F(P_(i-1)) (mod 29)
```

No starting cipher rune, page IV or choice of 29-symbol alphabet rotation can repair that iff relationship. The original 55 rune-bearing pages p0–55 contain **86 adjacent equal-rune pairs over 12,901 page-internal comparisons**. To assess whether the source-polynomial feedback could naturally explain so few doublets if ordinary GP-English were plaintext, GP-transliterate three stored literary controls (original GP transliteration table, TH/EO/NG/OE/AE/IA/EA contractions and the established QU/K/Q/V/Z replacements). For each source, take the **first, centered and last 12,956-rune windows** and reset comparisons at the *actual 55 physical LP2 page lengths*. Each of the nine genuine native GP windows yields the following predicted equal-ciphertext counts, with unchanged original receiver value86 as comparison.

| Source control | s=+1, first/center/last | s=-1, first/center/last |
|---|---:|---:|
| Gibran, *The Prophet* | 524 / 536 / 558 | 194 / 202 / 189 |
| Shakespeare control | 443 / 485 / 448 | 242 / 226 / 249 |
| Emerson, *Essays* | 464 / 439 / 536 | 217 / 232 / 197 |
| **Authentic original LP2** | **86** | **86** |

Even the most favorable natural-source comparison **189** would emit over twice the original's 86 repeats. On the independently solved original p57 95-rune plaintext, the model emits **3/94** under either sign, versus LP2's **86/12,901**. The controls are native-English comparators rather than a universal impossibility proof for every conceivable author text, and no 2014 original instruction establishes that all remaining LP2 text is GP-native English with these precise word boundaries. The separate doublet failure materially supports the actual decoded-language failure.

## Decision for future research

Retire the **p7 quartic + original adjacent-ciphertext difference + single preceding-plaintext feedback** as a direct p8–14 decoder under the three genuinely source-visible seeds and both signs. It is a specific executable extension beyond the earlier direct p7 feedback test, and it explains neither readable plaintext nor the original extreme doublet suppression. Other operations requiring genuinely new source-selected instructions remain logically open; the result is **not** evidence that the p7/p8 polynomial arithmetic itself is spurious.

The [single-file Node.js 22 SFT](../sims/lp2_p7_quartic_delta_plainfeedback_sft.cjs) reads the unchanged canonical source and three pinned controls, asserts the exact original header and page lengths, checks all six inverse/encoder round-trips, verifies six solved-p57 positive plants and reproduces the nine doublet diagnostics. Its finite outputs are deterministic. No exhaustive hidden-key search, synthetic-secret fitting or new author attribution is used.
