# Alternative plaintext-register source gate: cuneiform numerals and Younger Futhark marks

**Classification:** bounded source-selection negative. No alternative plaintext register, plaintext, key, or cipher operation was recovered. This gate addresses Director Issue [#422](https://github.com/FlareZ123/liber-primus/issues/422).

## Decision

The original LP2's two strongest non-GP artwork candidates fail to select a complete alternative alphabet, and solved prose provides a full-page orthographic baseline:

1. The repeated p33–p39 cuneiform-like marks are **Babylonian sexagesimal numerals**, not a phonetic cuneiform passage. Their four source-visible sign groups read 17, 13, 55, 1; the ordinary left-to-right base-60 convention gives (17,13)₆₀ = 1033 and (55,1)₆₀ = 3301. This is a numeric header and historical operator cue, not an Akkadian/Sumerian plaintext sample or a mapping for the adjacent GP runes.
2. The p0 3|3 branch marks have a historically supported local reading under the dominant Younger Futhark 6:5:5 cipher-rune convention: þ. The first black GP rune immediately after the red heading is TH, a local match. But the source gives no cross-alphabet rule converting the 29-symbol Gematria Primus stream into the 16-rune Younger Futhark system. The p0 red heading itself contains GP phonemes E, G, IA, E and NG with no direct Younger Futhark counterpart under the audited convention. The 3|3 mark can select one local symbol; it does not define a complete plaintext register.

3. The original solved LP2 p57 encodes all **95 runes** of its known English text through the 2013 source's ordinary written grapheme groups and documented aliases (with the independently observed U/V working convention). A strict sound-by-sound IPA-like encoding is incompatible with the printed p57 `ᛚᛁᚳᛖ` for **LIKE**, which retains the silent final E. Solved LP1 likewise prints `ᚳᚾᚩᚹ` for **KNOW** and `ᚦᛝᛋ` for **THINGS**. No original clue requires a different phonemic register on unsolved pp0–55. The exact [solved p57 original-source SFT](../sims/lp2_orthographic_gp29_solved_page_sft.cjs) proves 95/95 matches without tuning ciphertext. This fixes a positive baseline while leaving undocumented switching possible.

Accordingly, neither cue justifies a language model or reversible GP-to-register mapping. A broad Sumerian/Akkadian/Old Norse/Latin leaderboard would be unselected search, not a test of an original clue. No such search was run.

## Source-grounded evidence

### Cuneiform-like header

- Original scan: `resources/liber-primus/50.jpg` (physical LP2 p33).
- The source-matched p33–p39 motif was already read directly from original 2400×3600 JPEG pixels in [the historical-template gate](issue344-cuneiform-historical-template-gate.md). The four sign positions are 17, 13, 55, 1. The only historically supported common convention among the inspected pre-2014 numeral references is ordinary left-to-right base-60 integer reading, producing 1033 and 3301.
- The source-boundary correction places the repeated cuneiform body at p33 local rune 91 through p39 local rune 119 (1,468 runes); p33's preceding 91-rune title unit is separate. The illustration is not a continuous cuneiform text line. See [the source-boundary and p32/p33 synthesis](p32-cuneiform-redtriad-mobius-bridge.md).
- The five explicitly numbered Wisdom passages inside the wider cuneiform enclosure were already tested against the historical 2014 5×5 Wisdom square and the solved p56 prime-totient operation. Both the row-by-row shift and the specified column interleave remain nonlinguistic; those are operation negatives, not evidence for an alternate language. See [the five-passage gate](lp2-cuneiform-five-numbered-wisdom-inversion.md).

The cuneiform cue therefore selects a numeric interpretation of its own signs, not a phonetic alphabet for the adjacent unknown text.

### Younger Futhark cipher-rune mark

- The p0 original-image mark is historically compatible with the dominant Scandinavian 6:5:5 cipher-rune convention. Under the documented 321 grouping and forward counting, 3|3 selects þ. The first black GP rune is TH.
- The source literature explicitly cautions that other manuscript partitions exist; the 6:5:5 rule is a local, historically motivated reading, not a universal transformation of Gematria Primus.
- The 29-symbol GP alphabet and 16-symbol Younger Futhark cipher-rune inventory are different systems. The original p0 red heading includes five GP phoneme instances without direct Younger Futhark counterparts under the audited mapping. No source specifies whether to omit, decompose, substitute, or otherwise encode those symbols.

The local p0 agreement is a plausible selector annotation. It is not a whole-text register selector. See [the original-image historical literature audit](lp2-opening-3x3-yf-cipher-rune-literature-audit.md).

## 12 November 2026: source-visible-chapter alphabet-capacity test (#480)

**New exact, language-independent obstruction.** The [source-visible chapter atlas](lp2-global-original-visual-section-map.md) identifies nine unknown-text chapters from an original page-start red heading paired with a red thirteen-dot terminal marker on the preceding page. The eighth chapter, physical **pp40–53**, is a single **3,008-rune** originally continuous visible unit. Consider any *one-rune in, one-rune out* deterministic encoder where the only history/state used at position i is (visible chapter, immediately preceding ciphertext rune):

\[
C_i=f_{\operatorname{chapter}(i),C_{i-1}}(P_i).
\]

Each secret map may be chosen completely freely, differently for each of 9×29 = 261 states; it need not be additive or even injective. Let the actual plaintext have **m** possible source symbols. For any fixed observed state s, **at most m distinct next ciphertext runes** can be generated because f_s is a function of one of m plaintext symbols. This pigeonhole invariant does not assume English or any plaintext probability distribution.

The original pp0–55 have **217/261** observed (chapter, previous-C) states with **more than 16** distinct next runes. Most decisively, the original p40–53 chapter has **six distinct previous-rune states each followed by all 29 GP ciphertext symbols**:

| Previous-C GP index | Original occurrences of the state | Distinct next GP runes |
| ---: | ---: | ---: |
| 26 | 111 | **29** |
| 25 | 111 | **29** |
| 18 | 111 | **29** |
| 10 | 110 | **29** |
| 22 | 121 | **29** |
| 7 | 85 | **29** |

Thus **m≥29** is necessary under this *complete* specified state family, even with all 261 mappings secret. This strictly excludes directly decoding the original one-for-one ciphertext into a **16-symbol Younger Futhark**, a **16-symbol hexadecimal/nybble alphabet**, a **20-symbol restricted register**, or any other alphabet smaller than 29 through a fixed chapter + previous-ciphertext mapping. The source-visible p0 3|3 Younger Futhark mark still locally selects þ/TH, but cannot provide a whole-book original decoder of that precise first-order kind. This is an architectural exclusion, not a conclusion that the underlying message has to be written in 29 GP letters.

The [original-corpus standalone CommonJS reproducer](../sims/lp2_visible_chapter_register_capacity_sft.cjs) counts every one of the **12,901 within-page transitions**, asserts all six six-state full-alphabet witnesses and the 217 states exceeding 16. Its **positive plant** maps a complete length-matched deterministic **16-letter** source stream through a reversible GP29 previous-ciphertext/chapter-feedback encoder and recovers the exact source after inversion; as the theorem predicts, its observed next-symbol support never exceeds 16 at any state. No unconstrained key or plaintext-score search is involved.

A new source-state convention *could* change this constraint. With the same page-local transition exclusions, source-visible chapter + preceding **two** ciphertext runes (rather than one) produces **5,642** distinct observed states, maximum next-rune support **11**; the preceding-three model has 12,331 states with maximum support three. Those lower maxima arise partly from sparse sampling and **do not** authenticate any two-rune decoder. Per-page arbitrary maps, evolving hidden state, block coding, variable length or codepoint decompositions also escape the first-order conclusion. They require their own human-visible selector, original-cipher inverse, and held-out prediction.

**Decision for #480:** the only period-source-supported non-GP language clue in this finite original-visible inventory remains the *local* p0 Younger Futhark þ; it supplies neither a whole-register map nor a decoder. The cuneiform 1033/3301 signs remain numbers. We now know specifically that any faithful hypothetical **16-symbol** direct alternative cannot use a stationary single-previous-ciphertext map keyed only at the original visibly selected chapter boundaries. A usable alternative-register hypothesis must supply **additional key/state or a source-selected change in message length/segmentation**, with an independently fixed operation and original plaintext prediction. No non-English original LP2 plaintext is recovered.

## Source-visible grapheme versus phoneme decision (#507)

The original 2013 [Gematria Primus table](../results/2013-original-gp29-source-map.md) labels its 29 signs as a mixture of single Latin letters and multi-letter units (notably TH, NG/ING, EA, EO, OE). That is a *written representation* capable of contracting letter groups. In the separately original solved LP2 source, p57's complete phrase `PARABLE LIKE THE INSTAR TUNNELING ...` has 101 Latin letters and **95 original GP29 runes**; deterministic source-alias spelling reproduces the original rune-index stream **exactly at all 95 positions**. `LIKE` contains its orthographic silent E, `TUNNELING` contracts ING, and `SURFACE` retains a printed final E. The solved LP1 KNOW and THINGS provide older independent examples of the same representational practice. These tests use original solved-page evidence, not a statistical model trained on unknown ciphertext.

**Decision:** Within authenticated solved Cicada prose, GP29 is operationally a *graphemic orthography with multi-letter units*. No primary 2013–2016 source identified here authorizes a separate phonemic input convention for the unsolved LP2 pages, and no full phoneme-to-grapheme register or key-state map can be frozen. The original's confirmed 29-glyph classes remain the legitimate source-alphabet baseline. It remains possible that a later encipherment maps a language through phonemes or changes spelling, but that speculation has no independent selector or original-cipher prediction. Issue [#507](https://github.com/FlareZ123/liber-primus/issues/507) is resolved at this source-decision boundary, with **zero** recovered unknown plaintext.

**Full positive control:** [CJS solved-page orthography SFT](../sims/lp2_orthographic_gp29_solved_page_sft.cjs). It asserts the 2013 source ordering, the exact 95/95 original p57 rune match, silent-E mismatch, and original LP1 KNOW and THINGS words. Explicit source-alias distinctions are preserved: original 2013 image prints U while U/V is an observed solved-LP working convention.

## What would reopen this branch

A useful new source must provide at least one of:

- an exact cuneiform source passage or tablet whose sign sequence is visibly reproduced and whose phonetic reading predicts a withheld LP2 segment; or
- an original LP2 instruction or historically attested key that specifies a complete, deterministic mapping between GP29 and Younger Futhark (including multi-rune phonemes and the unmatched GP symbols), plus a held-out prediction.

Without that missing selector/mapping, no alternate-register decoder can be frozen. The directly solved Cicada/LP1/p56/p57 plaintext controls remain English in GP transliteration, but this does **not** prove every unknown LP2 page is English.

## Reproduction and scope

This is a source-selection decision assembled from original image evidence and existing reproducible audits, not a new image classifier or language-model experiment. Relevant original-input implementations and supporting reports are linked above. The decision is limited to the cuneiform-numeral and p0 Younger Futhark candidates; it does not exclude every possible non-English or non-GP intermediate register.
