# P15 source-width sixteen-tap causal GF29 filter: exact all-secret original-text word gate

**Agent14, 13 November 2026. Exhaustive original-input exclusion, completed on Windows Node22.** No stationary 16-tap causal feedback inverse over GF29, beginning at original physical p16 rune 15 and using the preceding fifteen unaltered ciphertext runes, can produce native-GP English consistent with the original p16–22 printed one- and two-rune words and the pinned GP lexicon. The complete inverse filter search covered **43,046,721** possible sixteen-term secret vectors inferred from 16 original singletons, and **zero** survived the first **ten** source two-rune words. The result is conditional on English single-rune words A/I/O and permitted two-rune spellings; it recovers no unknown plaintext or author-selected cipher.

## Causal hypothesis and source-visible constraints

The original p15 4×4 Fibonacci-prime square gives sixteen entries, starting with the visibly red 3299 and an infinity motif. Physical p16–22 supplies exactly 1,744 consecutive original GP29 runes, with original page lengths [267,273,260,271,269,273,131], followed directly after the square. Both are source-authentic, but neither Cicada nor the printed artwork explicitly specify a linear filter, an initial state, the GF29 register or native English.

Unlike a sixteen-rune block Hill matrix or any period-sixteen additive keystream, a **stationary causal inverse** uses the previous observed ciphertext continuously, with no per-block resets:

    P[t] = SUM(j=0..15) h[j] * C[t-j] mod29, for t >= 15

Here C is the *original unchanged* ciphertext, h is **any** possible sixteen-coefficient secret vector, and the first fifteen GP29 ciphertext symbols are treated as a transparent public initialization vector (IV). If h[0] is nonzero this is exactly reversible: C[t] can be recovered one step at a time from P[t], the preceding fifteen ciphertext values and h. The all-secret test even permits the exceptional h[0]=0 state, making the exclusion strictly more generous than the invertible version. There are no selected prime coefficients, fitted shifts, language-scored key variants or unstated ciphertext modifications.

The canonical print-word parser gives exactly **17 one-rune word offsets** in the chapter:

    21,119,244,380,386,414,455,471,596,712,871,937,989,1032,1491,1557,1574

The first sixteen corresponding 16-tap causal observed-ciphertext vectors have **rank sixteen over GF29**. In native GP English each one-rune complete word is one of **A=24, I=10, O=3**. This reduces the unconstrained, hidden inverse filter to a complete finite set of **3^16=43,046,721** possibilities. The original seventeenth singleton and the source's **69 two-rune complete words** serve as independent original-text constraints. The conservative dictionary comes from every positive-frequency ASCII word in the pinned TextBlob source, converted with the existing source-calibrated GP orthography; it contains **189 distinct allowed GP two-rune types**, including the ordinary two-rune encodings THE, OF, TO, IN, HE, IT and IS. The test does not restrict them to frequent words.

## Exhaustive original result

| Held-out original conditions | Possible hidden causal filter vectors |
|---|---:|
| Sixteen initial singletons assigned A/I/O | 43,046,721 |
| Seventeenth singleton also A/I/O | 4,451,334 |
| First two two-rune words are allowed GP words | 226,042 |
| First six two-rune words | 542 |
| First seven | 123 |
| First eight | 30 |
| First nine | 7 |
| First ten | **0** |
| All 69 | **0** |

Every possible singleton assignment is enumerated in a ternary Gray walk with exact GF29 updates. The first ten original two-rune words are held-out genuine manuscript positions, not fitted cribs. A zero after those constraints is a finite exclusion of **all** secret stationary causal sixteen-tap filters under the fixed clock and declared English lexicon; no single ciphertext key had to be guessed or recovered.

As a low-overhead direct source-key comparison, reducing the sixteen printed p15 row-major values mod29 and using them as the literal causal filter yields the **post-IV 1,729-rune IoC 0.034536126641**, near the uniform GP29 reference, with no readable opening.

## Native source positive control and scope

For a complete native-GP plant, make a 1,744-rune plaintext of genuine dictionary-derived GP words that **matches every original p16–22 printed word length**. Encrypt it with a stationary 16-tap causal GF29 filter whose sixteen coefficients are the actual p15 printed values mod29, using the first fifteen GP plaintext symbols as explicit initial ciphertext/IV symbols. The independent decoder reconstructs the original secret filter uniquely from the plant's first sixteen single-rune words and exactly recovers all **1,729/1,729 post-IV symbols**. Its seventeenth singleton and all **69 two-rune words** satisfy the same held-out dictionary checks. This verifies the test can recover a correctly constructed ciphertext under the exact hypothesized architecture; it does not validate Cicada's use of that architecture.

This family is distinct from the stationary nonoverlapping circulant Hill16 model, already excluded under the same source word gates [here](lp2-p15-circulant16-source-inverse.md). The causal result does **not** cover a varying filter, cross-boundary independent state, historical transparent-F key skips, a different IV length, source-native non-English or non-GP plaintext, or a second encipherment layer.

**Reproducer:** [Windows Node22 CommonJS exact original and native-plant SFT](../sims/lp2_p15_causal_fir16_allsecret_singleword_recovery_sft.cjs). **Passing original input CI:** [Actions run 43528051507](https://github.com/FlareZ123/liber-primus/actions/runs/43528051507), including the earlier complete cyclic-Hill test, both original source rank assertions and the native positive plants.

**Research decision:** Retire both stationary sixteen-tap linear mixing hypotheses on p16–22 under the declared native-GP word constraints. A viable next route needs an independent clue for a changing state, a wholly different intermediate register or a non-word-preserving transform; repeating alphabet or numeric-key searches without a clue will not repair the exact word contradictions.
