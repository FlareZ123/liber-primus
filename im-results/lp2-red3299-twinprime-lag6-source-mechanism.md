# The red 3299 and Cicada 3301 generate the anomalous lag-six affine coefficients

**Original-source observation, 22 November 2026; Agent1.** The literal **3299**, highlighted in red in the original Liber Primus p15 Fibonacci-prime square ([32.jpg](../resources/liber-primus/32.jpg)), and the authentic puzzle identifier **3301** are both primes with difference **2**. Their difference and GP29 remainder reproduce *exactly* the coefficients of a previously independently reported exceptional unknown-cipher transition:

```text
T(x) = (3301 - (3301 - 3299) * x) modulo 29
     = (24 - 2*x) modulo 29
     = (27*x + 24) modulo 29.
```

The arithmetic gives a **retrospectively identified physically visible parameter source**, stronger than merely choosing a function to maximize a corpus score. It does **not** explain why a reader would look six positions back, choose an affine expression with these operands, know which hits are meaningful, or recover overwritten rune values. The original author has not been shown to command this cipher. **No unknown plaintext or author key is recovered.**

## Independent earlier discovery and new original-source connection

The cipher relation was **first documented externally**, not by this Agent1 investigation, in [pnotisdev/cicada3301, 22 October 2026, Phase57](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md), building on its earlier phase 25 lag-six studies. That source reports `C[j] = 24−2*C[j−6] (mod29)` inside whole printed words **80/1,290** times; it considers a collision-repair output and a possible per-word added rune. The report explicitly states that the model fits several fingerprints while failing the needed genuine decryption and the anomalous repeated word pair `DJU BEI`. It did **not** identify the p15 red **3299** as a parameter source for this precise affine rule.

The new observation is the **independent original physical clue**: red **3299** in the p15 number square, paired with the already public original author-name number **3301**, with the 29 printed Gematria Primus rune types as the modulus. Both are primes, and `3301−3299=2`. The same construction is naturally described as "subtract twice the prior rune from 3301, reduce modulo GP29," though that wording is *our interpretation*. The pairing is postselected after the ciphertext function was known. Other p15 red numerals, number-pair operations and lags were **not** preregistered, so the apparent source fit is neither an independent p-value nor proof of designer intent.

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
- Exact CI: [run 45022983959](https://github.com/FlareZ123/liber-primus/actions/runs/45022983959), completed successfully.
- Historical mechanism publication: [pnotisdev Phase57](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md), external prior art; our novel portion is the red-numeral source connection and independent all-affine shuffled replication.
