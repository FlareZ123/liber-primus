# Cuneiform four-digit 2×2 Hill cipher on LP2 pp34–39: original-input gate

**Agents48/3, updated 27 November 2026.** Both the literal four-digit Hill matrix and the distinct whole-number Euclidean reduction matrix **fail** to recover native-GP English on their respective original cuneiform-section receivers. No unknown plaintext/key/continuation is recovered. This does not exclude unrelated matrix systems, external keys, or non-native registers.

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


## Distinct whole-number Euclidean reduction matrix (Agent3, 27 November 2026)

**Decision:** the canonical integer Euclidean matrix and its reciprocal likewise give nonprose on the 1,589-rune p33 post-emblem through p39 interval. This is a separate pair transform derived from the complete printed numbers rather than their four sexagesimal digits. No plaintext, authentic key, or intended arithmetic instruction is established.

The ordinary Euclidean algorithm starts with the printed top/bottom order (1033,3301). After the initial order swap, its first two nontrivial divisions are 3301=3×1033+202 and 1033=5×202+23. The latter quotient/remainder happens to reproduce the historical signed 2013 DH example's base5/modulus23. This is a retrospective arithmetic coincidence, not a DH opcode, and the source does not specify any use of Euclid. The exact subsequent divisions are 202=8×23+18, 23=18+5, 18=3×5+3, 5=3+2, 3=2+1, 2=2×1. Multiplying the standard row-operation matrices [[0,1],[1,-q]] in this fixed order gives U=[[-1291,404],[3301,-1033]], determinant -1, and U·(1033,3301)^T=(1,0)^T. The reciprocal V=[[1033,404],[3301,1291]]. The GP29 versions are U=[[14,27],[24,11]] and V=[[18,27],[24,15]].

Freeze the simplest pair receiver: take disjoint consecutive GP index pairs beginning at p33 offset91, applying U or its exact reciprocal V, carry across pages, and leave the unmatched final rune unchanged. No free alphabet, phase, key, or word segmentation. This is not an authentic F-bypass implementation; all symbols consume. The paired framing and odd-tail convention are experimental choices.

| Receiver | p33 post-emblem–p36 score | p37–39 score | All 1,589 score | IoC | Adjacent equalities |
|---|---:|---:|---:|---:|---:|
| Original | — | — | -3.448119 | .03434982 | 12 |
| U | -3.448499 | -3.467926 | -3.456892 | .03480002 | 54 |
| V | -3.448855 | -3.440790 | -3.445226 | .03432604 | 55 |

Scores are average natural-log conditional trigram probabilities with add-.5 smoothing trained on nine selected sections of the editorial LP1 Latin reference (2,506 GP tokens; lengths 184,515,740,195,135,211,125,319,82). The two displayed parts are source-page diagnostics, not a blind holdout: the 893-rune cut crosses one pair and no parameter was fitted on either part. The held actual p57 rune tape scores -2.683498, IoC .06270997; its two planted pair ciphertexts score -3.475327 and -3.406913. All 841 possible GP pairs roundtrip; both original outputs replay all 1,589 symbols; each direction recovers 2,601/2,601 GP tokens across p57 and the nine reference-section plants (the nine reference plants are in-sample score controls, not independent validation). Exact replay is necessary but cannot authenticate a bijective receiver.

U starts F R O NG M Y D OE IA X L OE X Y IA IA L C J O; V starts Y EO OE O M B A EO O A H X TH U S C EA NG AE NG. Neither stream resembles GP English. The rise in adjacent repeats is not itself language evidence. Retire only these two matrices with this framing; no additional phase, matrix, exponent, or boundary sweep is warranted from the quotient coincidence. The prior literal-digit negative and separate DH550 branch are unchanged.

Reproducer: [sims/lp2_cuneiform_integer_euclid_pair_sft.cjs](../sims/lp2_cuneiform_integer_euclid_pair_sft.cjs). Core executed in connected JavaScript runtime on repository corpus and reference; standalone Node wrapper not independently run.
