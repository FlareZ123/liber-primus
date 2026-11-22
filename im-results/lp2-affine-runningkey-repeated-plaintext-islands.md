# Exact repeated-word island gate under a freely keyed affine running GP29 stream

**22 November 2026, Agent16, Director #2203. Classification:** original-cipher and independent native-English control experiment, negative for one deliberately restricted reversible evolving-key family. **Zero additional recovered plaintext or authenticated unknown-page key.** [Portable read-only Windows Node22 SFT](../sims/lp2_affine_runningkey_repeated_word_islands_sft.cjs) · [issue](https://github.com/FlareZ123/liber-primus/issues/2203).

## What would unlock text, and the mechanism's strongest objection

Prior static pattern comparisons can miss repeated plaintext when another chapter uses a different moving key. A simple historical GP29 additive operation (Cicada authentically used GP29 Vigenère and the p56 evolving prime/totient cipher) motivates asking whether an independent chapter may use a **small, reversible affine running key**:

`C_ch(t)=(P_ch(t)+a_ch+b_ch*t) mod29`, with chapter rune position `t` incrementing once per original rune, original word/punctuation boundaries retained, and independently unknown `a_ch,b_ch`. Nothing in the artifact authenticates a **linear** step `b_ch` on these pages. A genuinely nonlinear source key, a missing random pad, altered word boundaries, or prose lacking long repeated words are the most important independent rivals.

The second difference of every word cancels both secrets exactly:

`D2 C[i] = C[i] - 2*C[i-1] + C[i-2] = D2 P[i] mod29.`

The invariant does **not** depend on the secret intercept, slope, word's chapter position, key start, or key reset across chapters. Two occurrences of the same native-GP plaintext word across chapters **must** produce identical length and original ciphertext second-difference vector if this cipher family is correct. That is a precise *all-key* necessary condition; it allows repeated plaintext to be detected when ciphertext differs, without guessing a dictionary key or first-rune crib.

## Frozen untouched original-source decision

Use the canonical single-parser `sims/lp2_word_pages.cjs` on `resources/liber-primus/lp2-transcription.txt`, with its actual **12,956 runes**, **2,896 complete printed words** and **32 page-crossing whole words**, then map original glyphs through native `lp2-corpus.json` 29-symbol runes. Whole words must lie entirely within each selected physical page range; newline and page seams inside a word do not split it. The original numerical p50 has **no GP runes** and is not a word-bearing page.

- Original first section: physical **p16–21**, **372** complete words.
- Original independent second section: physical **p34–39**, **325** complete words.
- Third section reserved until the condition was evaluated: physical **p40–53**, **669** complete words. This is the literal physical range, not transcript page-index40–53 that would mistakenly include p54.

Test every original **complete-word pair of equal length ≥5 GP runes** between the first two ranges. At length5, the invariant fixes three independent mod29 values; at greater lengths the number of constrained second differences grows. This threshold is an exploratory finite family test; it was selected for specificity and is **not** a preregistered universal significance cutoff. No source word is manually discarded based on its ciphertext content.

| Cross-original comparison | Original word counts | All affine-key-invariant matching words, GP length≥5 | Longest |
| --- | ---: | ---: | ---: |
| p16–21 vs p34–39, primary | 372 × 325 | **0** | None |
| p16–21 vs p40–53, unused third section | 372 × 669 | **1** | 5 GP runes |
| p34–39 vs p40–53, unused third section | 325 × 669 | **0** | None |

There are **3,741** primary equal-length eligible candidate pairs (length5 count1720, length6 868, length7 644, length8 416, lengths9–12 the remainder). Independently uniformly random rune strings would produce `sum_pairs 29^-(wordLength−2) ≈ 0.071783` accidental whole-word invariant matches, explaining the zero original result. The single holdout five-rune match is therefore an exploratory collision, not a recovered repeated phrase. It yields no ≥150-rune independent decryption.

## Source-native positive and matched real-English baselines

The test applies exactly the same GP29 transliteration to independent **Project Gutenberg Gibran, *The Prophet*** and a **300,000-character Shakespeare** control, with GP-specific `TH/NG` digraphs, **ING→NG** rune contraction, and documented K/Q/V/Z canonicalization. The original CJS verifies all 85 authentic solved p56 GP rune plaintext values, including the **literal F at original offset56 consuming no prime**, and re-encrypts all85 exactly; it separately confirms a native-GP 95/95 p57 affine cipher positive.

The source-native Gibran text has **15 real repeated whole-word GP signature matches** between two pinned nonoverlapping 372/325-word intervals. Applying separately unknown, independently evolving affine keys `(a,b)=(11,7)` and `(5,13)` to the actual control words preserves **all 15** signatures and their exact source-native plaintext identities. The inverse of the planted GP29 affine transformation also recovers actual p57 95/95. Thus the detector can truly find hidden repeated plaintext under the selected cipher, rather than merely counting ciphertext duplicates.

For each of **400 deterministic source-English control pairs per book**, independently select nonlocal 372/325-word windows with frozen xorshift32 seed `0x33013381`, a ≥600-word separation corrected by a fixed 1,900-word displacement where required, and pass them through the unchanged original invariant/multiplicity scanner.

| Native-language 400-pair controls | Minimum long-word matches | Median | Maximum | Zero-match controls |
| --- | ---: | ---: | ---: | ---: |
| Gibran GP-native, Gutenberg body only | **1** | **20** | 124 | **0/400** |
| Shakespeare GP-native, 300k source text | **0** | **14** | 283 | **1/400** |
| Original LP2 p16–21 vs p34–39 | **0** | N/A | N/A | **1 observed pair** |

Original's zero is as extreme as at most **0/400** and **1/400** native-control outcomes, with conservative per-control plus-one empirical tail bounds **1/401** and **2/401**. These are *conditional diagnostics* for the chosen word model and comparison controls, rather than independent global p-values after exploring all conceivable ciphers. Different original unknown-page lexicon or nonprose packet could change the baseline. All 3,741 primary placements are included; there is no uncorrected single promising match presented as signal.

## Decision

**Retire this specific independently keyed affine running-key / hidden repeated native-GP-word route on p16–21 versus p34–39.** The no-match result is unsurprising for random-like original ciphertext and sharply unlike native-English GP controls with known repeated words. Because the frozen primary interval yields **no high-confidence repeated plaintext island**, there is no identifiable relative state to carry into a **≥150-rune third-chapter plaintext prediction**. Do not manufacture one by fitting offsets to the single five-rune p40–53 control collision. The problem's true key could be nonlinear, externally supplied, rekeyed midword, or coupled across words, and those mechanisms are outside this test.

This completed assignment changes the causal decision: pursuing repeated *plaintext* under a simple locally affine moving key is a poor original-path bet. A new program should begin from an authentic key-state operation or a demonstrable recovered phrase in the original ciphertext, not from this branch's nonexistent long-word matches.
