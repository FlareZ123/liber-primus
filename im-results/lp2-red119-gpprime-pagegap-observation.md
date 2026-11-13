# Two original red119 triads and the historical Stage11 title 133

**Agent24, 13 November 2026. Classification: provisional cross-artifact arithmetic; no original-cipher inverse or recovered plaintext.** The only two isolated three-rune red spans in the original LP2 ink record occur at physical **p3** and **p39**. Both begin at rune offset119, bracketed by red 13-dot punctuation. Their *already documented*, keyless GP29 Atbash readouts are **SCY** (source-compatible SKY) and **UDP**; see [exact source and historical context](lp2-p3-p39-red119-atbash-sky-udp.md).

| Physical page, 0-based | Original red runes | GP indices | Original GP-prime weights | Prime-weight sum | Subtract (page+1) |
| --- | --- | --- | --- | ---: | ---: |
| p3 | ᛈᛞᚦ | 13,23,2 | 43+89+5 | **137** | **133** |
| p39 | ᛡᚳᛋ | 27,5,15 | 107+13+53 | **173** | **133** |

Both sums are prime, and their difference **173−137=36** equals the physical page gap **39−3=36**. The new **cross-artifact** observation is that both sums, after subtracting their *one-based physical page ordinals* (4 and 40), exactly equal **133**, printed as `<title>133</title>` in the original 2014 seventh-onion Stage11 HTML index. That index also contains `<div id="331">` and enumerates the 58 LP2 images ([preserved historical HTML](../resources/cicada2014-onion7-index.html)).

There is a second, previously recorded, **different** route to this historical metadata: the solved p57 *Parable* heading has GP-prime sum449; the second and third body clauses have sums1031 and1229, and **1031 mod449=133** and **1229 mod449=331**. The earlier [source-arithmetic report](audio-761-pad-scan.md#parable-s-heading-is-the-modulus-of-the-seventh-onion-title-and-id) already compares those exact original values. Its modulus selection is not author-confirmed. The red119 arithmetic adds independent original ciphertext positions to the same *HTML title*, while depending on an equally inferred one-based-page subtraction.

## Fixed-source census, without interpretation inflation

Among **all 18 original isolated red spans**, **exactly these two three-rune spans** satisfy `sum(GP primes) − (physical page+1) = 133`. This is a complete exhaustive reading of the source annotations, with the historical HTML title read rather than hardcoded as a target.

As a descriptive within-source reference, source p3 contains **215** contiguous three-rune windows and p39 **238**, giving **51,170** ordered pairs. Among them, **378** have sum difference36; **75** also have two prime sums; **14** satisfy the stricter title-specific exact pair **p3 sum137 / p39 sum173**, simultaneously having 36-gap, two prime sums, and the same decimal digits in a different order. Both red119 windows are among those 14. The descriptive incidence is **14/51,170 = 0.0002735978112**, with no inference about plaintext. Note 173 is a digit **anagram** of 137, not its reverse (731).

**Critical qualification:** This is exploratory discovery. The red spans are source-selected, but the sum-of-prime-weights operation, the historical title as target, the one-based ordinal correction and the decision to inspect this equality were **not independently selected by an authentic Cicada instruction**. The 14/51,170 count is **not** a search-adjusted p-value or a probability that the author intentionally encoded 133. The known SCY/UDP words also fix the ciphertext triples and thus their prime sums; these observations are partially dependent. The source is consistent with an engineered relationship but cannot by itself distinguish that from a coincidence identified after inspecting multiple motifs.

## Decision and next discriminating input

The cross-artifact equality nominates a simple, testable candidate invariant **`prime_sum(red_fragment) − one_based_page = Stage11_title`**. It provides **no mechanism for decoding black-runic text, no key schedule, no external endpoint, and no unknown LP2 plaintext**. It would become more important if a genuinely independent 2013–2014 author instruction used page ordinals plus GP-prime sums as addresses or supplied a specific use for historical title133. Without that source selector, broad searches involving seeds 133/134, UDP ports, arbitrary cipher shifts or alphabet-fitted variants are unwarranted.

**Exact reproducibility:** [CommonJS source-exact census](../sims/lp2_red119_prime_pagegap_sft.cjs) loads the [original rune indices](../resources/liber-primus/lp2-corpus.json), [annotated red-ink spans](../resources/liber-primus/lp2-ink-annotations.json) and [original Stage11 HTML](../resources/cicada2014-onion7-index.html), asserts both fragments and the HTML title, and computes all above reference counts.
