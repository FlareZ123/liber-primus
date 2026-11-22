# LP2 constrained-sequence enumeration: exact exception capacity and original-input decoder gate

**Agent42, 22 November 2026.** This is a bounded original-source result for Director #2273. It narrows viable no-repeat encoders and tests the cheapest unkeyed inverse. **It recovers no unknown plaintext, author-selected key, or Cicada destination.** Reproduce the entire original-source census, exact integer capacity bounds, the eight direct inverses, and solved-native positive controls with [the read-only CommonJS SFT](../sims/lp2_enumerative_exception_capacity_original_sft.cjs).

**Prior-work boundary.** The counting identity \(29\binom{n-1}{e}28^{n-1-e}\), the 86 page-local equality census, and the ~445.732-bit exact-page deficit were established before this run in [the original lossless-capacity SFT](../sims/lp2_anti_repeat_lossless_capacity.cjs). [The earlier boundary-enumerative SFT](../sims/lp2_no_repeat_boundary_enumerative_sft.cjs) already implements a valid all-source hypothetical rank coder, [the earlier word-codec SFT](../sims/lp2_wordcodec_doublet_channel_capacity_sft.cjs) handles at-most-repeat strata, and [the previous 200-mark ternary bound](lp2-punctuation-ternary-sidecar-capacity.md) already obstructed a generous fixed-position punctuation carrier. This report's increment is the distinct **180-registered-event** overgenerous identity bound, the seven page/two independent chapter **type-plus-position** obstructions, and the **2,896-rune all-sidecar mixed-radix suffix gate** for the specified canonical word-exact code. These are conditional additions, without a new recovery or novel general enumerative algorithm.

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

## Source alphabet sensitivity: genuine solved GP27 and no-sidecar coder

**Crucial limitation on the GP29 information deficit:** source-language plaintext need not exhaust all \(29^L\) strings. In the [nine authenticated solved-native GP passages](../resources/external/relikd-solved-gp29-native-v1.json) containing **2,979 GP runes**, original GP labels **EO** and **OE** each occur **zero times**. Restricting the hypothetical source to the 27 remaining, *actually observed* GP symbols changes exact capacity at the same original full-book length:

| Unrestricted plaintext alphabet | Continuous fixed-repeat book | 55 page-exact frames | 2,896 word-exact frames |
| --- | ---: | ---: | ---: |
| GP29 source, all 29 possible | 328 missing bits | 446 | 679 |
| GP28 source, any one symbol excluded | 0 | 0 | **23 bits** |
| **Solved-native GP27**, excluding EO and OE | **0** | **0** | **0** |

Each cell uses arbitrary-precision comparison of \(q^{12956}\) with its original constrained codebook. This is a conditional **capacity** result, not proof of an encoding or a universal English claim: other authentic GP texts may contain EO or OE, and the source author's actual intermediate alphabet is unknown. Crucially, for this GP27 hypothesis **no physical punctuation sidecar would be mathematically required**, even with original whole-word repeat counts held exactly fixed. That makes searching hundreds of hypothesized exception bits premature unless the original work explicitly chooses an unrestricted GP29 source.

**Full reversible canonical test, with authentic solved-plaintext positive control.** Let \(P=27^{12956}\) and \(M\) be the full exact-word-repeat constrained GP29 codebook size. Interpret GP27 plaintext as integer \(X\in[0,P)\). A simple source-unconstrained enumerative sender selects the original-word-rank output \(R=\lfloor XM/P\rfloor\); since \(M\ge P\), this is injective. Its receiver calculates \(X=\lfloor((R+1)P-1)/M\rfloor\). The source-specified word boundaries and each observed repeat count fix the mixed radices; two simple GP29 successor orders, original GP ordinal and cyclic, are independently tested. A direct native-GP27 **729-rune** p0–2-format planted source encodes into valid GP29 repeated-rune word shapes, then unrank/rank/redecode returns **all 729 original native GP runes exactly**. This verifies a real reversible implementation without inventing a key.

The exact same **original source** does **not** lie in the canonical forward encoder's image in either declared ordering: \(R\ne\lfloor D(R)M/P\rfloor\) in both cases. The fully computed receiver output has no native-GP prose:

| Original source span | GP ordinal successor | Cyclic successor | Authentic solved-native control minimum |
| --- | ---: | ---: | ---: |
| p0–p1 decoded first 300 runes | IoC **0.036299** | **0.035853** | **0.055385** |
| p16 decoded 200 runes (original global rune positions 3762–3961) | **0.038543** | **0.038241** | **0.053166** |
| Entire recovered GP27-shaped register | **0.037037** | **0.037013** | Typical solved-native GP29 around **0.06** |

Therefore the **canonical directly scaled, full-book GP27 enumerative sender** is rejected by its original forward-codeword membership test as well as a disjoint native-text gate. This does not exclude a keyed, interleaved, differently ranked, or more flexible GP27 transport, and it does not elevate the recovered-looking GP27 integer into Cicada plaintext.

## Full original 31-ornament binary quotient receiver

The original source has a **noninvented morphology channel** closer to the GP28 capacity deficit: exactly **31 physically visible large ornaments** on unsolved pp0–55, consisting of **28 thirteen-dot** and **three ten-dot** forms. These are independently confirmed against the original JPEGs in the [large punctuation image census](lp2-original-dot-punctuation-physical-census.md). The three ten-dot source events occur on physical **p36, p38, p49**, at large-mark sequence indices **22,23,27** (zero-based). They are distinct from the 180 registered general punctuation events with five nonphysical marks.

Under the source-legible binary interpretation **13-dot=0, 10-dot=1**, reading these **31 physical ornaments in printed order, most significant first**, produces integer **392**, with the only set bits corresponding to the three ten-dot marks. With the exact original 2,896 word-wise repeat-constrained codebook size \(M\), a GP28 source of original length \(L=12956\) has quotient range

\[
0\le S=\lfloor X/M\rfloor\le
\left\lfloor\frac{28^L-1}{M}\right\rfloor
=\mathbf{5,082,098}.
\]

Thus the source-derived **392 is a numerically valid side quotient** for a straightforward GP28 mixed-radix receiver \(X=392M+R\). The other three fixed 31-bit polarity/reading-direction conventions exceed the quoted maximum, without applying arbitrary modulo or truncation. This is an **unremarkable mathematical alignment** under a source-count-preserving null: exact enumeration of all **4,495** ways to place three exceptional ten-dot glyphs among 31 marks finds **2,650 (58.95%)** with exactly one admissible polarity/direction read under this quotient bound, **405** with both forward/reverse 13-dot=0 reads admissible, and **1,440** with neither. Hence the apparent unique orientation of 392 is common even if ten-dot locations were arbitrarily placed. The source has **no authenticated instruction** selecting binary marks or their arithmetic meaning. With the *existing* inventory fixed at exactly three ten-dot symbols, those 31 locations have only \(\binom{31}{3}\) distinguishable glyph assignments, insufficient to guarantee 23 bits of arbitrary side information. A complete hypothetical 31-bit sender must allow the mix of ten-dot and thirteen-dot markers to vary with plaintext.

**Independently reset physical chapters expose a different insufficiency.** For a native GP28 source with exact original *per-word* repeat counts fixed, the nine source-visible visual chapters need **[0,0,0,6,16,4,3,6,0]** bits of variable side information respectively. The original physical large ornaments attributed by their printed *page* belong to those chapters in counts **[2,8,1,4,2,2,8,2,2]**. Even granting each original large dot-count shape a freely writable binary value, **four** independent chapters are short: **p15–22 (6 bits needed, four marks), p23–26 (16 versus two), p27–32 (four versus two), p40–53 (six versus two)**. Source glyph color, additional small punctuation and externally carried state are separate hypothetical channels, and the original chapter-local 31-glyph model cannot rely on them without a new premise. This exact integer test strengthens the decision to treat the 392-bitmask as a *whole-book-only* quotient hypothesis rather than silently resetting it at every illustrated chapter.

The simplest original decoder uses the canonical printed-word mixed-radix rank \(R\), excluding original GP rune **EO** to obtain a 28-symbol target alphabet (the first of the two rune identities absent from the known solved-native sample). Both unkeyed source-alphabet successor orders yield nonlinguistic full-length output, including on *independent original spans*:

| Original GP28 readout from physical 31-dot binary quotient | Original GP ordinal | Cyclic allowed-successor rank |
| --- | ---: | ---: |
| Entire reconstructed GP28-shaped 12,956-rune register IoC | **0.035711** | **0.035705** |
| First 300 runes of original p0–p1 IoC | **0.034849** | **0.035362** |
| Independent original p16, 200 runes IoC | **0.034824** | **0.035779** |
| Final 2,896 decoded runes IoC | **0.035651** | **0.035720** |

The source-native solved controls for the 300/200-rune windows have minimum IoCs **0.055385/0.053166**. As an implementation positive, a complete **12,956-rune** authentic solved-GP28 plaintext plant is encoded with **exactly the original 2,896 word lengths and each word's original repeat count**, with the GP28 side quotient **4,225,317**, and all 12,956 tokens recover perfectly using the same mixed-radix and quotient inverse. The printed original **392** instead yields only near-uniform GP28 glyphs. This **retires the literal binary-orientation GP28 quotient as a direct native-prose decoder**, while leaving unknown keyed/nonlinear operations and different data registers open.

## Actual punctuation carrier, not inferred empty bits

The **derived punctuation transcription** registers **180 events**: 31 `⁜`, 145 `⁘`, and four `⁚`. **Only 175 correspond to physical visible marks.** The [original-JPEG punctuation audit](lp2-punctuation-identity-stream.md) found four p15 numeric-row terminators inserted editorially and one p37 stop absent from the original image. The actual visible inventory is 31 large marks, 138 four-dot diamonds, five three-dot forms and one ambiguous detached square. We deliberately **overgrant** the side channel by counting all 180 registered events as independently writable, which strengthens the negative capacity conclusions. **All 180 registered events lie at complete printed-word endings** (including the five nonphysical entries); these comprise **173 distinct rune-offset sites**. The SFT joins cross-page word fragments from the canonical transcript and checks the derived offsets against their cumulative rune lengths. Source-image correction would only remove nonphysical slots.

If all 180 derived-event positions are fixed and each hypothetically writable symbol identity is freely chosen among three types, the generously overcounted punctuation-type channel carries at most \(180\log_2 3=285.2933\) bits. Preserving even the derived transcription's original type counts limits it to \(\log_2(180!/(31!145!4!))=139.8600\) bits. Both fall short of even the continuous-stream 328-bit requirement. **Thus merely relabeling fixed-position punctuation as ternary digits cannot make this unrestricted, equal-length constrained encoder lossless.**

By contrast, allowing all *173 distinct registered punctuation positions* to vary among 2,896 authentic word endings provides \(\log_2\binom{2896}{173}=940.2617\) bits of theoretical global placement capacity. This is sufficient for the word-wise 679-bit bound in aggregate, but no original authored instruction has been found selecting a combinatorial placement code, its rank order, a source operand, or a receiver.

A stricter independently reset *page-local* punctuation-position encoder lacks necessary capacity on **seven original pages: p13, p20, p21, p23, p37, p51, p54**. The decisive case is physical **p51**, which has 92 runes and one repeat yet **zero** punctuation events, so its own punctuation locations transmit no correction while the 92-rune constrained output needs at least three bits to represent every unrestricted GP29 page-length input. A valid punctuation-placement solution must share state across such pages, use additional genuine source carriers, or abandon the fixed-repeat all-source assumption.

**The physical chapter grouping constrains the rescue further.** With the nine original p0–2 / p3–7 / p8–14 / p15–22 / p23–26 / p27–32 / p33–39 / p40–53 / p54–55 sections independently framed, fixed-repeat *word-preserving* encoding exceeds the available punctuation-placement space in **two chapters**: p23–26 requires **66.690 bits** while its nine distinct punctuation locations among 224 printed words offer **51.562 bits**; p54–55 requires **14.474 bits** but its two locations among 66 words offer **11.067 bits**. Both comparisons are additionally checked as exact integer cardinality inequalities in the SFT. **Even if every punctuation mark may independently choose any of the three glyph types**, the p23–26 upper bound rises only to **65.827 bits** (51.562 placement + 9 × log₂3), and p54–55 reaches only **14.237 bits** (11.067 placement + 2 × log₂3). These remain below their respective 66.690-bit and 14.474-bit demands. Actual symbol-count restrictions only lower capacity. Other seven chapters have enough theoretical placement capacity, but sufficiency of raw space is no evidence of an actual code. This excludes a purely chapter-local, word-preserving positional *plus three-symbol punctuation* quotient under the fixed-repeat all-source assumption, unless another source-visible field contributes the missing information.

Original ink patterns, illustrations, the p49–p51 numeral table, and the freely variable placement of printed word breaks are *not* bounded by this punctuation-identity theorem. No conclusion is drawn about their possible capacity or cipher role.

## Sidecar-independent obstruction to canonical word enumeration

There is a stronger exact consequence for the most straightforward **whole-book mixed-radix enumerative receiver**. Give every complete original word the rank \(r_w\) among its source-length, source-repeat-count admissible strings, with conventional lexical ordering of first rune, repeat mask, and allowed successor ranks. Concatenate the 2,896 word ranks by their natural mixed radices to obtain \(R\). Its complete ciphertext codebook size \(M=\prod_w M(n_w,e_w)\) is divisible by **\(29^{2896}\)**, because every word's free initial rune contributes one factor 29.

A canonical quotient sidecar would decode the complete original plaintext integer as \(V=S\cdot M+R\), where \(S\) could be an *arbitrary* externally recovered integer from ink, punctuation, an external source, or the p49–p51 table. Regardless of the entire value of \(S\), **the last 2,896 base29 plaintext digits are exactly \(R\bmod29^{2896}\)**. The sidecar cannot affect even one of them. This is an exact all-sidecar invariant of the stated word-ranked architecture, independent of cipher key search.

On actual intact source words, the forced 2,896-rune suffix has IoC **0.034590** when successor ranks skip the previous rune in GP ordinal order, and **0.034519** when using cyclic forward-successor ranks. The independent genuinely solved GP source's final 2,896-rune control has IoC **0.061474**. Both all-sidecar-fixed original suffixes look incompatible with ordinary native-GP prose. Consequently a proposed p50 or punctuation key **cannot rescue this particular canonical full-book enumerative arithmetic receiver**, even if its side channel has unlimited capacity. A different ordering of the rank fields or other nonlinear, interleaved state architecture is outside this exact obstruction.

## All-secret 26-letter / 28-successor rank-coding exclusion

An important rival to an unrestricted GP29 source is an **ordinary 26-letter Latin plaintext**. A 29-rune ciphertext can offer 28 choices after excluding the previous rune, enough to encode one Latin letter per ciphertext rune without any external sidecar. The two surplus successor ranks might seem natural unused/rare escape or separator states, especially given only 86 original adjacent-repeat exceptions. This is a genuinely **different source alphabet** from the 29-symbol capacity assumption above, so that theorem must not be used to reject it.

For one fixed, entirely unknown ordering \(\pi\) of all 29 ciphertext rune identities, define the observed successor digit \(d=\operatorname{pos}_{\pi}(c)-\mathbf1[\operatorname{pos}_{\pi}(s)<\operatorname{pos}_{\pi}(c)]\) whenever previous rune \(s\) differs from current rune \(c\). Each of the 28 digits is associated with two adjacent identities \(a,b\) in \(\pi\). Form the actual original unequal-successor matrix \(T[s,c]\). For every unknown ordering, every output rank occurs **at least** the following exactly attainable count:

\[
m(T)=\min_{a<b}\left[T[a,b]+T[b,a]+\sum_{s\notin\{a,b\}}\min\big(T[s,a],T[s,b]\big)\right].
\]

Place each remaining predecessor identity before or after adjacent \(a,b\) to minimize which next-symbol transition emits that rank; the choices can be realized together by one actual ordering. This is the **minimum** counterpart of the [previously established all-order maximum theorem](lp2-no-repeat-allorder-page-capacity.md), not an independent cipher system. The new SFT constructs a minimizing original 29-rune ordering and checks its exact rank histogram; a full 5-rune permutation oracle matches the derived formula.

| Unknown underlying order | Lower bound on **each** reserved rank's actual source occurrences | Interpretation |
| --- | ---: | --- |
| One secret order over all 55 rune-bearing pages | **348** of 12,815 unequal transitions | Every one of 28 rank codes is used at least 348 times, regardless of the alphabet order |
| Independent ordering at each of nine physical illustrated chapters | **179** of 12,815 unequal transitions | Exact chapter minima **5,12,23,31,11,20,23,54,0** |
| Independently change ordering on every original physical page | **0** guaranteed | This particular support argument cannot exclude page-local alphabet resets |

For the global case the exact minimizing single-rank adjacent pair is original GP **R/EO**; even that one output rank appears 348 times. The **stronger simultaneous-two-rank minimum** is computed by applying \(\min\) rather than \(\max\) to the *touching-triplet and disjoint-quadruplet* regional placements in the earlier exact two-rank-capacity theorem, exhausting every distinct 3- and 4-rune endpoint combination. The fixed endpoint contributions remain unchanged. Each other predecessor chooses its lowest-count permitted region, and the SFT constructs an attaining secret GP ordering and exhaustively validates the dual derivation over every permutation of five toy runes. On original ciphertext the attainable exact minimum for **any two distinct reserved rank labels** is **726 occurrences with one global order** (attaining GP endpoints W/G/R/EO), or **410** with nine independently secret illustrated-chapter orders (minima **14,30,54,68,25,47,56,116,0**). By contrast, with independent ordering at each of the **55** physical rune-bearing pages, **both extra rank labels can simultaneously be unused within *every* page**, an explicit zero-count witness for each page. This is a sharp change in the *support obstruction* under page resets.

Thus the **literal 26 ordinary Latin letters + two never-used or at-most-86-in-band exception codes** cannot explain all original unequal GP29 ciphertext transitions under a stationary global or visual-chapter-reset predecessor-exclusion ordering, *however its 29 underlying runes are secretly permuted*. A page-reset rank ordering survives this particular **support-only** bound, **but not the existing stronger native-GP plaintext-frequency test**: the [prior all-secret single/two-rank maxima](lp2-no-repeat-allorder-page-capacity.md) reject every one of over one million native-GP English/Latin control windows, even granting an independently chosen underlying order and plaintext alphabet on all 55 pages. A different low-frequency source language, frequently changing states during a page, or other transform remains mathematically possible. No authenticated source clue selects a page-specific rank order.

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