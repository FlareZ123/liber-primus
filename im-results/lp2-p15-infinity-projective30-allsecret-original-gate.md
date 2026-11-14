# P15 infinity and number square as a projective GP30 cipher: all-secret state bound

**Agent34, 14 November 2026 · Director #867.** A distinct, fully reversible source-motivated non-affine alphabet construction was applied to the entire original unknown LP2 ciphertext and an independently solved genuine-GP positive. It has a **key-independent 1,119-word-break deficit**, even if a secret may select a different one of its four alphabets at every rune. No new LP2 plaintext, authentic key, historical encryption instruction or destination was recovered. This is a bounded original-cipher rejection, not a claim against other stateful ciphers.

## Source-selected input, intended human route, and weakest inference

Original physical LP2 **p15**, source JPEG `resources/liber-primus/32.jpg`, visibly presents a **4×4 numerical square** immediately above an **infinity glyph**. The complete numerical square has been solved independently as a Fibonacci-indexed prime spiral anchored by the red 3299 [here](../results/lp2-p15-fibonacci-prime-spiral.md). Its printed rows are:

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

A human solver familiar with modular arithmetic could treat the infinity glyph as the extra point of the projective line over **F29**, use the 29 GP runes as its 29 finite elements, and use a printed between-word break as the 30th symbol, denoted infinity. Four nonoverlapping **2×2** quadrants of p15's visible square then supply the four familiar fractional-linear maps `x -> (a x+b)/(c x+d)`. Each is non-affine because `c ≠ 0`, and all four source-derived determinants are nonzero. This is a genuinely reversible nonlinear GP30 substitution family using the original printed square, unlike the previously failed period-16 additive/F-transparent or fixed GP29 alphabet transfers.

**Weakest assumption:** the book contains **no explicit instruction** to divide p15's 4×4 into four Möbius maps, to encode printed word breaks as infinity, or to choose quadrant keys by any particular clock. The infinity glyph also has ordinary thematic interpretations. This test checks whether this one plausible source-defined family *could* directly encode source-word-preserving GP English, granting the strongest imaginable hidden switching schedule.

## The exact four source maps and all-secret consequence

Reduce the printed square modulo29 and group its quadrants in row-major order. Each quadruple lists `[a,b,c,d]` of the 2×2 matrix:

| p15 printed quadrant | Matrix modulo29 | Determinant modulo29 | Ciphertext pole for the inverse |
| --- | --- | ---: | ---: |
| top left | [10,3,1,22] | 14 | 10 |
| top right | [20,22,21,25] | 9 | 12 |
| bottom left | [11,17,21,17] | 4 | 24 |
| bottom right | [19,7,12,22] | 15 | 4 |

For the forward map `C=M(P)=(aP+b)/(cP+d)` on the *projective* 30-symbol alphabet, its inverse sends a ciphertext finite rune `x` to plaintext **infinity exactly when** `a−cx=0 mod29`. Thus its only possible plaintext-word-break output is the original ciphertext rune at `x=a/c mod29`. As each of these matrices has `c≠0`, the *ciphertext printed separator itself* always decrypts to a **finite** plaintext rune; it never yields a plaintext separator.

The four allowable ciphertext poles are `{10,12,24,4}`, fixed **before** reading any ciphertext. The full canonical original unknown LP2 source contains 12,956 runes and **2,896 complete words** (therefore **2,895** between-word separators after preserving the runes and removing only literal line/page wraps). The four pole glyph frequencies, in source order, are **471, 399, 482 and 424**, summing to **1,776**.

Therefore for **every** possible choice of the four projective alphabets, including an unknown secret choice at every single source position that depends on *all past or future plaintext and ciphertext*, the exact count bound is

```text
plaintext word breaks <= count(C in {10,12,24,4}) = 1,776
original printed between-word breaks = 2,895
necessary deficit = 2,895 - 1,776 = 1,119
```

This is an algebraic impossibility for the stated **word-count-preserving GP30** model. No choice of phase, secret key, state clock, page reset, independent alphabets, nonlinear feedback, or adversarial quadrant selection can repair the 1,119 missing separators under these four fixed maps. It is much stronger than testing one arbitrary source clock. Under a **different plaintext segmentation** with only 1,777 or fewer words, a different fifth map, a different interpretation of infinity, or an encoder that expands/deletes source symbols, the proof does not apply. An English source with about 1,777 words in 15,851 symbols would have unusually long words relative to the source, but the present test does not claim a language-independent exclusion of all such texts.

## A concrete reversible state clock, original inverse and positive

To give the proposal its best simple operational reading, start with public state `previousCipher=infinity`. Let the previous **published** ciphertext symbol modulo4 select the next quadrant; decrypt each new ciphertext symbol by that quadrant's projective inverse, including printed separators. Re-encryption selects the same quadrant from the previous emitted ciphertext token, so the operation is sequential, fully reversible and lossless. No key tuning or fitted phase occurs.

| Observation | Original entire unknown p0–55 | Interpretation |
| --- | ---: | --- |
| Input GP runes | 12,956 | Unmodified canonical runes |
| Input separator tokens | 2,895 | 2,896 printed source words |
| Inverse GP rune outputs | 15,387 | Spaces become ordinary runes under all four maps |
| Inverse separator outputs | **464** | Only **465** decoded words |
| Inverse finite-rune IoC | **0.04012101119** | No native GP English |
| Exact original re-encryption | **15,851 / 15,851** | The proposed cipher is bijective |

Its first original decoded tokens read `EAXIAAEAEBSNGWEACYIHXRMAEOX...`, with no contiguous authentic plaintext. Re-encryption identity alone is not evidence of correctness.

A native-GP positive starts from the manuscript's independently solved, actually printed **p57 PARABLE**, preserving its exact 95 original plaintext rune symbols and all 23 parsed printed words. Both encrypt-and-decrypt and decrypt-and-reencrypt recover the original exactly. A second plant repeats those native GP symbols and their authentic word separators to **15,851 source-length tokens** and again recovers every token. An additional check verifies every one of the 30 possible alphabet tokens round-trips under **each** of the four matrices. These affirm the mathematical inverse while remaining independent of unknown-page plaintext.

## Decision

The original p15 square and infinity glyph supply a possible **non-affine and variable-segmentation** reading, but these four exact projective maps cannot encode the observed amount of original source whitespace into a word-count-preserving English plaintext, even under **arbitrary secret per-position switching**. This is a new, source-bounded construction and a decisive no-key barrier; its concrete predecessor-state inverse is also nonlinguistic. It does **not** explain the original anti-doublet and within-word lag-five anomalies, so it is not a positive solution to Director #867 and supplies no reason to vary pole sets, invent a fifth matrix, or fit an alternate space symbol. A successor would first need a different original instruction selecting the cipher and a discriminating original-language prediction.

**Reproducer:** [standalone Node 22 CommonJS SFT](../sims/lp2_p15_projective_infinity_quadrant_sft.cjs). Source inputs are the original `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json` and the 16 image-transcribed p15 cells. The SFT asserts exact pole counts and every source/cipher inverse, with two genuine-GP plants. [Successful original-source Windows GitHub Actions run 43614573098](https://github.com/FlareZ123/liber-primus/actions/runs/43614573098), executed 14 November 2026. The workflow is manual-only and adds no scheduled CI.
