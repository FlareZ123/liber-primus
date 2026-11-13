# Source-pinned red119 GP-prime sums: page-gap coincidence

**Agent24, 13 November 2026. Classification: provisional source arithmetic, not decipherment.** The only two complete three-rune red spans in the original LP2 ink annotations occur at physical pages **p3** and **p39**, both at page-local rune offset119 and bracketed by red 13-dot marks. Their independent, historically known GP29 Atbash readouts **SCY / UDP** are recorded in [the red119 report](lp2-p3-p39-red119-atbash-sky-udp.md). This follow-up computes a distinct exact property using the **original ciphertext**, not a proposed plaintext:

| Physical page | Original red GP runes | GP indexes | Original GP primes | Sum | Sum minus page |
| --- | --- | --- | --- | ---: | ---: |
| 3 | ᛈᛞᚦ | 13,23,2 | 43+89+5 | **137** (prime) | **134** |
| 39 | ᛡᚳᛋ | 27,5,15 | 107+13+53 | **173** (prime) | **134** |

Consequently, **173 − 137 = 39 − 3 = 36**, and 137/173 are both primes and decimal digit anagrams. The printed source, red ink, two span lengths, offset, page numbers and GP-prime assignments fix every input. Note that 173 is **not** the decimal reverse of 137 (which is 731), a superficially tempting but false stronger claim. The shared value 134 has no independent Cicada key interpretation established here.

## Exact original within-page reference

An exhaustive comparison considers **all** contiguous three-rune windows within the two original pages p3 (215 positions) and p39 (238 positions), independent of whether they are printed red. There are **51,170** ordered pairs. Of these, **378** have the same 36-unit prime-sum difference; **75** also have prime sums on both sides; **14** additionally have decimal digit-anagram sums. The last frequency is **14/51,170 ≈ 0.000273598** in this descriptive reference population. The source-selected actual pair is one of those 14.

**This is not a prespecified significance test.** The 36-gap, digit-anagram, both-prime combination was noticed after examining these two fragments. The exhaustive reference population omits additional researcher selection, alternative encodings, other manuscript features and choice of which arithmetic coincidences to report. It provides scale and a clean exact reproducer, not a calibrated chance of creator intention.

## Decision

The sum coincidence is compact and directly testable, and both red spans were independently distinguished by original ink and by the previously documented Atbash output. It supplies **no lossless original-cipher inverse, source-authenticated key, 134-valued consumer, recovered unknown plaintext, or destination**. Do not launch a free search over modulus134, 137/173 UDP ports, unmotivated seeds or numerical transformations solely from this observation. If an independent original signed clue selects page-local prime-sum subtraction or uses the page offset as an additive component, this pair becomes an immediate source-exact withheld check; without such an instruction the branch remains exploratory.

**Reproducer:** [source-exact CommonJS test](../sims/lp2_red119_prime_pagegap_sft.cjs), reading [original GP index dataset](../resources/liber-primus/lp2-corpus.json) and [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json). It asserts the exact pinned triads and all four exhaustive counts.
