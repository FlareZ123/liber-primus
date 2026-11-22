# LP2 constrained-sequence enumeration: exact exception capacity and original-input decoder gate

**Agent42, 22 November 2026.** This is a bounded original-source result for Director #2273. It narrows viable no-repeat encoders and tests the cheapest unkeyed inverse. **It recovers no unknown plaintext, author-selected key, or Cicada destination.** Reproduce the entire original-source census, exact integer capacity bounds, the eight direct inverses, and solved-native positive controls with [the read-only CommonJS SFT](../sims/lp2_enumerative_exception_capacity_original_sft.cjs).

## Decipherment question

The 12,956 GP29 runes of the 55 rune-bearing unknown LP2 pages contain only 86 equal-adjacent pairs across physical page interiors. Of 10,060 transitions inside the 2,896 complete source-printed words, only 63 are equal pairs, in 62 words. A finite-state enumerative encoder could choose one of the 28 nonrepeating successor runes and use a separate channel to preserve the input information lost by forbidding the 29th option.

**Rival:** the published repeat pattern could arise from unrelated encryption, language-specific source symbols, or an encoding that varies its repeat count. The following theorem concerns a precise length-preserving GP29 architecture with observed repeat counts fixed across all valid output codewords. It does not infer the actual cipher from rarity of repeats.

## Exact, key-independent capacity theorem

For any segment of \(n\) GP29 runes with exactly \(e\) adjacent equal pairs, the number of admissible output strings is

\[
M(n,e)=29\binom{n-1}{e}28^{n-1-e}.
\]

Choose the first rune freely, the \(e\) exceptional transition positions, and one of 28 other symbols at every remaining position. For \(K\) independently framed segments, multiply \(M(n_s,e_s)\). The original unrestricted length-preserving GP29 input space has \(29^{12956}\) messages. The minimum binary side-information capacity for an injective encoder is exactly

\[
b=\left\lceil\log_2\frac{29^{12956}}{\prod_{s=1}^K M(n_s,e_s)}\right\rceil.
\]

The SFT evaluates the ratio by arbitrary-precision integer products and comparisons, rather than relying on floating-point ceiling near a boundary.

| Codeword constraint and source framing | Repeat count controlled | Required side capacity |
| --- | ---: | ---: |
| One continuous source rune tape | 86 of 12,955 transitions | **328 bits** |
| Each original physical rune-bearing page has its observed repeat count | 86 across 12,901 page-local transitions | **446 bits** |
| Each of 2,896 complete original printed words has its observed repeat count | 63 across 10,060 internal transitions | **679 bits** |

The three bounds are *conditional on fixing the repeat count in each stated segment across all output codewords*. If the encoder permits more equal pairs for other messages, expands the ciphertext, changes word boundaries, or operates on a compressed/language-restricted source, this counting argument no longer excludes it.

## Actual punctuation carrier, not inferred empty bits

The independent source-faithful punctuation register records **180 events**: 31 `⁜`, 145 `⁘`, and four `⁚`. **Every one of the 180 events lies at the ending of one of the 2,896 complete printed words.** There are **173 distinct rune-offset sites** because some marks share a word-ending offset. The SFT obtains whole words from the canonical transcript, explicitly joining cross-page fragments, then checks each punctuation offset against their cumulative rune lengths.

If all 180 positions are fixed and each symbol identity is freely chosen among three types, the entire punctuation-type channel carries at most \(180\log_2 3=285.2933\) bits. Preserving the actual source counts limits it to \(\log_2(180!/(31!145!4!))=139.8600\) bits. Both fall short of even the continuous-stream 328-bit requirement. **Thus merely relabeling fixed-position punctuation as ternary digits cannot make this unrestricted, equal-length constrained encoder lossless.**

By contrast, allowing the *173 distinct punctuation positions* to vary among 2,896 authentic word endings provides \(\log_2\binom{2896}{173}=940.2617\) bits of theoretical global placement capacity. This is sufficient for the word-wise 679-bit bound in aggregate, but no original authored instruction has been found selecting a combinatorial placement code, its rank order, a source operand, or a receiver.

A stricter independently reset *page-local* punctuation-position encoder lacks necessary capacity on **seven original pages: p13, p20, p21, p23, p37, p51, p54**. The decisive case is physical **p51**, which has 92 runes and one repeat yet **zero** punctuation events, so its own punctuation locations transmit no correction while the 92-rune constrained output needs at least three bits to represent every unrestricted GP29 page-length input. A valid punctuation-placement solution must share state across such pages, use additional genuine source carriers, or abandon the fixed-repeat all-source assumption.

**The physical chapter grouping constrains the rescue further.** With the nine original p0–2 / p3–7 / p8–14 / p15–22 / p23–26 / p27–32 / p33–39 / p40–53 / p54–55 sections independently framed, fixed-repeat *word-preserving* encoding exceeds the available punctuation-placement space in **two chapters**: p23–26 requires **66.690 bits** while its nine distinct punctuation locations among 224 printed words offer **51.562 bits**; p54–55 requires **14.474 bits** but its two locations among 66 words offer **11.067 bits**. Both comparisons are additionally checked as exact integer cardinality inequalities in the SFT. **Even if every punctuation mark may independently choose any of the three glyph types**, the p23–26 upper bound rises only to **65.827 bits** (51.562 placement + 9 × log₂3), and p54–55 reaches only **14.237 bits** (11.067 placement + 2 × log₂3). These remain below their respective 66.690-bit and 14.474-bit demands. Actual symbol-count restrictions only lower capacity. Other seven chapters have enough theoretical placement capacity, but sufficiency of raw space is no evidence of an actual code. This excludes a purely chapter-local, word-preserving positional *plus three-symbol punctuation* quotient under the fixed-repeat all-source assumption, unless another source-visible field contributes the missing information.

Original ink patterns, illustrations, the p49–p51 numeral table, and the freely variable placement of printed word breaks are *not* bounded by this punctuation-identity theorem. No conclusion is drawn about their possible capacity or cipher role.

## Sidecar-independent obstruction to canonical word enumeration

There is a stronger exact consequence for the most straightforward **whole-book mixed-radix enumerative receiver**. Give every complete original word the rank \(r_w\) among its source-length, source-repeat-count admissible strings, with conventional lexical ordering of first rune, repeat mask, and allowed successor ranks. Concatenate the 2,896 word ranks by their natural mixed radices to obtain \(R\). Its complete ciphertext codebook size \(M=\prod_w M(n_w,e_w)\) is divisible by **\(29^{2896}\)**, because every word's free initial rune contributes one factor 29.

A canonical quotient sidecar would decode the complete original plaintext integer as \(V=S\cdot M+R\), where \(S\) could be an *arbitrary* externally recovered integer from ink, punctuation, an external source, or the p49–p51 table. Regardless of the entire value of \(S\), **the last 2,896 base29 plaintext digits are exactly \(R\bmod29^{2896}\)**. The sidecar cannot affect even one of them. This is an exact all-sidecar invariant of the stated word-ranked architecture, independent of cipher key search.

On actual intact source words, the forced 2,896-rune suffix has IoC **0.034590** when successor ranks skip the previous rune in GP ordinal order, and **0.034519** when using cyclic forward-successor ranks. The independent genuinely solved GP source's final 2,896-rune control has IoC **0.061474**. Both all-sidecar-fixed original suffixes look incompatible with ordinary native-GP prose. Consequently a proposed p50 or punctuation key **cannot rescue this particular canonical full-book enumerative arithmetic receiver**, even if its side channel has unlimited capacity. A different ordering of the rank fields or other nonlinear, interleaved state architecture is outside this exact obstruction.

## Direct original-input arithmetic inversion

The cheapest source-legible inverse removes each literal repeated-cipher event and labels each remaining next-cipher choice by its order among the 28 allowed symbols. Two independently simple orders were tried: alphabetically skipping the previous symbol, and cyclic forward step \((C_i-C_{i-1}-1)\bmod29\). Each was evaluated in normal and reversed order, with forward or backward digit significance, producing eight fully specified no-key base28-to-base29 integer conversions. Each physical page supplies an explicit first-symbol anchor; observed repeats are preserved as visible event masks. This is a direct arithmetic-rank diagnostic, **not** a demonstrated length-preserving original cipher.

The opening evaluation concatenates decoded p0 and p1 and scores the first 300 GP runes, since physical p0 has only 262 original runes. The independent holdout scores 200 decoded GP runes from physical p16.

| Register | Eight original decoding outcomes | Genuine solved-native GP comparison |
| --- | --- | --- |
| Original p0→p1 first 300 | IoC **0.033512–0.034916** | 1,173 authentic solved 300-rune windows have minimum **0.055385** |
| Original p16 first 200 | IoC **0.033317–0.037487** | 1,573 authentic solved 200-rune windows have minimum **0.053166** |

**None** of the eight unkeyed variants produces native-GP-looking original plaintext on either independent span. The SFT positively encrypts 300 authentic solved-native GP runes through a real length-expanding base28 nonrepeat transition encoder and recovers all 300 exactly, ensuring that the rank arithmetic itself is operational.

A perfect forward re-encryption of the original rank tape, possible when the observed anchors, exception mask and length metadata are retained, would only establish its internal bijection. It would provide no evidence of Cicada's historical key or source-selected decoder.

## Decision for Director #2273

1. **Retire** fixed-position, three-identity punctuation as the entire side-information channel for unrestricted, length-preserving GP29 enumerative coding with original repeat counts.
2. **Retire** the eight direct unkeyed ordinal/cyclic base28 arithmetic inverses as immediate original prose decoders under the stated original-page framing.
3. **Keep open only when the source selects a real receiver**: variable punctuation placement across page boundaries has enough abstract information capacity, but original p51 proves that independently page-local punctuation placement cannot suffice. Additional carriers, such as ink and the p49–p51 table, remain unexplored in this particular exact coding model. Require an actual period-visible instruction giving input length, exception semantics, rank convention, and a forward-replayable side-state reconstruction before searching keys or adding layers.

**Bottom line:** exact capacity locates the missing operand and rules out a visually tempting but insufficient punctuation alphabet. The original corpus does not yet provide a human-discoverable operation capable of recovering plaintext.