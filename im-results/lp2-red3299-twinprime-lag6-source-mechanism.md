# The red 3299 and Cicada 3301 generate the anomalous lag-six affine coefficients

**Original-source observation, 22 November 2026; Agent1.** The literal **3299**, highlighted in red in the original Liber Primus p15 Fibonacci-prime square ([32.jpg](../resources/liber-primus/32.jpg)), and the authentic puzzle identifier **3301** are both primes with difference **2**. Their difference and GP29 remainder reproduce *exactly* the coefficients of a previously independently reported exceptional unknown-cipher transition:

```text
T(x) = (3301 - (3301 - 3299) * x) modulo 29
     = (24 - 2*x) modulo 29
     = (27*x + 24) modulo 29.
```

The arithmetic gives a **retrospectively identified physically visible parameter source**. However, the role of red 3299 **as the spiral origin** was already independently decoded on 19 November 2026 by [njloof in Dukotah/cicada3301 issue #14](https://github.com/Dukotah/cicada3301/issues/14). That original-source result proves **all 16 grid cells** are `|3301 − prime(F+1)|` in a Fibonacci-indexed spiral from red 3299. It establishes why 3299 equals **3301 minus the first prime (2)**, before this lag-six connection was noticed. The source's `3301−2` arithmetic is consequently **prior art**, and the new cross-puzzle coincidence is specifically that the **same first-prime difference also matches an independently documented statistical ciphertext coefficient**. It does **not** explain why a reader would look six positions back, choose an affine expression with these operands, know which hits are meaningful, or recover overwritten rune values. The original author has not been shown to command this cipher. **No unknown plaintext or author key is recovered.**

## Independent earlier discovery and new original-source connection

The cipher relation was **first documented externally**, not by this Agent1 investigation, in [pnotisdev/cicada3301, 22 October 2026, Phase57](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md), building on its earlier phase 25 lag-six studies. That source reports `C[j] = 24−2*C[j−6] (mod29)` inside whole printed words **80/1,290** times; it considers a collision-repair output and a possible per-word added rune. The report explicitly states that the model fits several fingerprints while failing the needed genuine decryption and the anomalous repeated word pair `DJU BEI`. It did **not** identify the p15 red **3299** as a parameter source for this precise affine rule.

The connection is made precise by an **already solved original artifact**: [Dukotah's p15 16/16 spiral proof](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/P2-p15-grid/closed_form_check.py) demonstrates the complete grid equals `|3301−prime(F+1)|` for Fibonacci F in spiral order starting on the red 3299 cell, and in particular `3299=3301−prime(1)=3301−2`. The highlighted original numeral is therefore not unexplained red numerology. With the printed 29-symbol GP rune chart as modulus, this same source-first prime gives the observed **−2** multiplier and 3301 gives **24**. Interpreting `prime(1)` as the **coefficient multiplying a rune value six positions back** remains our own postselected construction, with no first-party instruction. This paper does not claim to have decoded the p15 square, selected a new key or independently discovered the lag-six effect. No other multiplier source, position-six delimiter, repair flag or key clock is authenticated. The comparison is a plausible operator-construction clue, not independent proof of author intent.

## GP29 alias control on every p15 spiral cell

A source-derived alternative was independently checked before claiming the red cell uniquely selects the observed affine multiplier. The exact original 16/16 Fibonacci-prime spiral contains prime values `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817`. Red `3299` is the first cell (`3301−2`), but the later **nonred** cells `3038` (`3301−263`) and `1820` (`3301−1481`) both satisfy `prime ≡ 2 (mod 29)`. Consequently these three of the 16 grid coefficients all generate the **same 80/1,290 lag-six matches**, whereas the remaining thirteen grid values score from **35 to 56** under the same fixed `3301−prime*x mod29` reading. The red cell does select the **first** and visually privileged occurrence of this coefficient; however **the modulo29 ciphertext alone cannot distinguish those three first-prime-index alternatives**. This is a source-alias caveat against treating numerical agreement as a unique key or a truly author-selected operation. The SFT now checks all exact original sixteen printed numbers in original Fibonacci spiral order, with every original GP29 transition, rather than only the chosen red 3299.

## Exact original-cipher test and non-exact coincidence control

The [single-file original-data SFT](../sims/lp2_3299_3301_lag6_original_sft.cjs) parses **2,896 complete printed words** with all 32 real page-carried words and **12,956/12,956 source runes**. For every within-word pair six positions apart, it counts `C[j] == T(C[j−6])`. It also exhausts **all 812 invertible GP29 affine maps** `a*x+b`, `a=1…28`, `b=0…28`, without selecting a substitution by a language scorer.

| Original-puzzle measurement | Result |
| --- | ---: |
| Legitimate within-word six-back opportunities | **1,290** |
| Exact red3299/3301 affine matches | **80** |
| Uniform independent-relation expectation | 44.48 |
| Next-best of 812 invertible affine maps | **65** (`a=14,b=9`) |
| Original rank among all 812 maps | **1** |
| First four physically illustrated chapters | 35/547 |
| Remaining five physically illustrated chapters | 45/743 |
| Per-word-shuffled nulls, frozen RNG seed `0x33013299` | 2,048 |
| Nulls with this source function at least 80 hits | **0/2,048** |
| Nulls where **any** of 812 affine maps reaches 80 | **1/2,048** |

The shuffle holds each original word's length and exact rune multiset fixed, then independently permutes symbols within that word. The exact **family-maximum add-one Monte Carlo tail estimate** is `2/2049 ≈ 0.000976`, which accounts for trying all 812 affine rules **at the previously discovered lag6**. It is **not** a global discovery-adjusted significance probability: the lag was itself selected after searching, and the numeral coincidence was recognized afterward. The independently fixed source-map-only add-one estimate is `1/2049 ≈ 0.000488`. Counts and actual nine-chapter holdout stratification were independently reproduced on [successful GitHub Actions run 45022983959](https://github.com/FlareZ123/liber-primus/actions/runs/45022983959); the operation itself was not first discovered here.

The lag6 channel is unusually widespread: p0–2 **6/79**, p3–7 **6/106**, p8–14 **10/184**, p15–22 **13/178**, p23–26 **5/100**, p27–32 **11/144**, p33–39 **9/162**, p40–53 **20/302**, p54–55 **0/35**. The last chapter contains only 35 opportunities, so the zero is not enough to declare a different mechanism.

## Further original-cipher failure of a six-back-only repair

The same source-controlled SFT now separately counts *all within-word adjacent* rune pairs by the position of the later rune. **Before a six-back reference exists** (word positions 1–5), the original contains only **54/8,770 = 0.6157%** adjacent repeats, versus an unrepaired GP29 uniform expectation of **8,770/29 ≈ 302.41** repeats. At positions at least six inside the word, it contains **9/1,290 = 0.6977%** adjacent repeats. Both are far below 1/29. Therefore **a lag-six-only collision-replacement process cannot possibly account for the manuscript's global anti-doublet property**. Any viable implementation must include a separate earlier-position fallback, a general anti-repeat mechanism, or a non-uniform upstream cipher. This is an original-layout condition on the proposed repair mechanism, independent of any asserted plaintext. It is consistent with, and should be attributed alongside, pnotisdev Phase57's already proposed **general** anti-repeat channel plus specific lag-six T-valued repair. The amended 12,956-rune test [PASS45023552051](https://github.com/FlareZ123/liber-primus/actions/runs/45023552051) asserts exactly the early/late **8,770/54** and **1,290/9** counts.

## Causal route toward plaintext, and the unresolved obstacle

The manuscript has exactly **86 adjacent-equal** ciphertext pairs among **12,901** within-physical-page transitions, while a uniform GP29 stream would yield approximately `12901/29` equal pairs. The empirical fraction of possible equal-pair events apparently suppressed is `1−86/(12901/29) = 0.80668` conditional on a uniform raw stream. Multiplying the *independently observed suppression rate* by the **1,290 lag-six opportunities / 29 possible matches** predicts **35.88 repaired lag-six hits**. The actual excess is `80−1290/29=35.52` hits. This close agreement is **already explained in the pnotisdev Phase57 mechanism**. It suggests a motivated encoder, not an extracted plaintext:

1. A normal cipher produces provisional GP29 symbol `C[j]` from plaintext and a still unknown key.
2. If this provisional symbol would repeat the previous ciphertext symbol, a majority of such incidents are instead written as `T(C[j−6])` when the prior six positions are in the same printed word.
3. The rule changes the frequencies of adjacent doublets and creates lag-six `T` echoes at approximately the observed magnitudes. It may require a word-scoped extra/null-runic operation for the actual word lengths.

**The fatal invertibility gap is the repair/escape flag**: a matching lag-six output could be a genuine unmodified ciphertext match, a repair overwriting an unknown provisional rune, or a deliberately inserted extra rune. The observed 80 hits include approximately **44 expected accidental matches**, with no first-party method to locate the ~36 altered positions, to recover their source plaintext/key consumption, or to determine the hypothesized word-level nulls. Without these lost symbols or a separately source-derived key, guessing the repair function does not define a reversible decryption. One cannot reconstruct a full original plain text by simply replacing `T` matches with arbitrary GP29 symbols.

**Next decisive experiment:** independently find a first-party clue fixing **lag6**, the output-trigger condition, how a replaced symbol is recovered and whether a null consumed key material. Then test a complete inverse on the original source, demand ≥300 contiguous intelligible GP runes, ≥200 held-out unknown original runes and forward recipher. The highlighted red **3299** is a plausible *coefficient selector* worth keeping visible, while its postselected relationship to the known lag-six rule cannot yet support a solution claim.

## Reproducibility

- Original ciphertext: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), [complete source transcription](../resources/liber-primus/lp2-transcription.txt), real carried-word parser [`sims/lp2_word_pages.cjs`](../sims/lp2_word_pages.cjs).
- SFT: [`sims/lp2_3299_3301_lag6_original_sft.cjs`](../sims/lp2_3299_3301_lag6_original_sft.cjs) (Node22/CommonJS, 2,048 word-preserving randomizations, all 812 candidates, no external packages).
- Exact CI: [original run 45022983959](https://github.com/FlareZ123/liber-primus/actions/runs/45022983959), [expanded early-word run 45023552051](https://github.com/FlareZ123/liber-primus/actions/runs/45023552051) and [final full 16-source-prime alias run 45023731481](https://github.com/FlareZ123/liber-primus/actions/runs/45023731481), all successful.
- Historical mechanism publication: [pnotisdev Phase57](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md), external prior art; our novel portion is the red-numeral source connection and independent all-affine shuffled replication. The p15 grid's `3301−prime(F+1)` spiral, including the red start's first-prime difference, belongs to [njloof/Dukotah #14](https://github.com/Dukotah/cicada3301/issues/14).
