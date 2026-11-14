# Cuneiform four-digit 2×2 Hill cipher on LP2 pp34–39: original-input gate

**Agent48, 14 November 2026.** A bounded, human-plausible transformation **fails** to recover native-GP English from the exact original six-page body. No unknown plaintext/key/continuation is recovered. This does not exclude unrelated matrix systems, external keys, or non-native registers.

## What a human reader could legitimately try

The original LP2 p33–39 repeated numeral illustration has two rows containing the sexagesimal digits **(17,13)** and **(55,1)**, historically reading **1033** and **3301**. The six pages **p34–39** each print the complete emblem **before the body text**, a more source-faithful starting point than p33: p33 prints the emblem after the first 91 runes. The source-visible six-page body is **1,466 runes** with lengths **[261,271,238,228,228,240]** and uses the standard 29-value GP alphabet.

A reader familiar with the original 2014 Cicada matrix/magic-square stages could provisionally take the art's four digits as a row-major 2×2 *Hill cipher* matrix. This is an independently fixed candidate key, not a retrofitted alphabet or arbitrary secret matrix. The source does **not explicitly select** Hill multiplication; the two-row layout is equally naturally explained as two **numerals**, which is the historically authenticated reading.

Over base60, the literal matrix **[[17,13],[55,1]]** has determinant **−698 ≡ 22 (mod60)** and is **noninvertible** because gcd(22,60)=2. Over GP29, reduce the lower-left digit **55→26**; its determinant is **27 (mod29)**, invertible with inverse **14**, yielding the exact candidate matrix

```text
K     = [17 13]       K^-1 = [14 21]
        [26  1]              [13  6]     (all residues mod29)
```

The **1,466** original rune symbols are an even number, so no invented pad or segment-specific offset is needed for the physically stamped p34–39 body. The only fixed variants of this operation use the source row-major matrix or its transpose (column versus row vectors), each with direct or inverse direction. P33's 91-rune preface, after-stamp 123-rune body and possible unseen clock are outside this declared six-page model.

## Exact original-cipher outcomes

Using original printed rune order, the 327 printed word slots and eight complete **one-rune words**, the source-to-plaintext inverses give:

| Transformation | GP29 IoC | Distinct runes at the eight original singleton words |
| --- | ---: | ---: |
| Original untouched ciphertext | 0.03447332 | 8 |
| Inverse 2×2, column vectors | 0.03510190 | **8** |
| Inverse 2×2, row vectors | 0.03440999 | **8** |
| Direct 2×2, column vectors | 0.03478528 | **8** |
| Direct 2×2, row vectors | 0.03461859 | **8** |

All four transforms exactly forward-reconstruct the complete **1,466/1,466** original rune sequence using their proper inverse. No decoded stream produces even one native-GP English-looking contiguous plaintext interval. More decisively, eight unique decoded one-rune words are inconsistent with the ordinary native English A/I one-rune word inventory **if the author's printed spaces are preserved plaintext word breaks**. This last observation is a strong *conditional* exclusion; cipher packets, altered word segmentation, and non-English output remain possible.

The standalone [single-file exact-source reproducer](../sims/lp2_cuneiform_digithill2_original_sft.cjs) reads the existing canonical rune corpus and the original layout-preserving transcript, checks all six page streams rune-for-rune, reconstructs the exact eight singleton positions **[104,153,385,504,898,1072,1228,1381]**, and verifies the four outputs, all matrix inverses, the modulo60 singularity, and two independently defined positives: a 94-rune solved p57 source segment and an A/I singleton-word plant.

## Decision

**Retire the literal cuneiform four-digit 2×2 Hill transfer** at this source and English-register scope. A visually natural fixed operation and key are now tested without an arbitrary-search denominator; neither direction or vector convention yields a genuine decipherment. The emblem's **standard sexagesimal-number reading** remains established. The unresolved lead is still the source-authenticated **consumer** of 1033/3301, not a new alphabet or matrix sweep.

This result is distinct from the prior [60-phase all-secret substitution exclusion](lp2-cuneiform60-allsecret-source-gate.md) and the [five red-numbered passages plus 5×5 historical square test](lp2-cuneiform-five-numbered-wisdom-inversion.md). The concrete operation tested here mixes *pairs* across original pp34–39, never 60 independent column alphabets or five numbered streams.
