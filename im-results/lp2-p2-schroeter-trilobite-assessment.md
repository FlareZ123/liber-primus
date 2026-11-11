# LP2 p2 illustration: probable Schröter fantasy trilobite, no cipher operation established

**Status:** intermediate visual/source assessment; not a decryption, key recovery, or verified cipher mechanism.

## Assessment

The illustration on LP2 p2 (repository scan `resources/liber-primus/19.jpg`) is a strong candidate for the historical “leggy trilobite” attributed to J. S. Schröter (1774). The scan depicts a side-view segmented arthropod with speculative-looking limbs and an anomalous head/end arrangement. Richard Fortey's *Trilobite: Eyewitness to Evolution* captions a fantasy trilobite from J. S. Schröter (1774), describing a composite of one correctly oriented head, one reversed head, and a possibly inverted tail. The Strange Science entry “Leggy trilobite” independently gives the same year/attribution and says the figure includes an extra head.

This is a **probable visual identification, not a verified pixel-for-pixel match**: the exact original 1774 plate/page has not been located and compared. Schröter published more than one relevant work in 1774, so author/year alone does not identify the precise source edition.

## What the image can and cannot motivate

A solver could reasonably take “trilobite” and the three-part / reversed-orientation description as a prompt to consider three streams, a three-coordinate operation, or a direction-sensitive transposition. It does **not** specify:
- which ciphertext positions are the three parts;
- whether “reversed” means reversing sequence order, reflecting rune glyphs, or applying an alphabet complement;
- what operation “upside down” selects;
- a key, clock, or page-boundary rule.

Therefore the image is a legitimate clue candidate, but it does not license a generic Trifid search or arbitrary three-way permutations.

## Cheap source-constrained checks on p2

The repository's current LP2 corpus records p2 as 201 runes, using all 29 GP symbols. Its transcription source notes that this transcription is derived through the existing rtkd/iddqd → krisyotam chain, not an independent transcription; treat the exact count as transcription-derived until independently counted from the scan.

| Check | Result |
|---|---:|
| p2 runes | 201 |
| Arithmetic factorization | 3 × 67 |
| IA / EA counts (indices 27 / 28) | 7 / 10 |
| Core after the established IA/EA passthrough convention | 184 |
| Complete 3-symbol groups in that core | 61, with 1 rune left |
| Text lines / rune counts | 9 lines: 21, 24, 22, 25, 23, 21, 24, 22, 19 |
| Totals when grouped as three successive 3-line stanzas | 67, 69, 65 |

The 201 = 3 × 67 coincidence is not unique enough to establish a 3-stream layout: 24 of the corpus's 58 records (including the empty p50 record) have rune counts divisible by three; among the 57 nonempty records, 23 are divisible by three. Four nonempty records have counts equal to three times a prime (p2, p15, p16, p23). The natural 3-line grouping of p2 does not produce three equal 67-rune blocks.

As a deliberately simple test, the 201-rune transcription was split into three consecutive 67-rune blocks. Their index of coincidence values are 0.03483, 0.03211, and 0.03076 (whole-page 0.03562; uniform 29-symbol expectation 1/29 ≈ 0.03448). Pairwise best additive-shift matches are only 6/67, 6/67, and 7/67 (allowing reversal for the last pair). There is no evidence here for three repeated or trivially shifted streams. This does not test a keyed polyalphabetic operation.

## Legendre / three-lobe hypothesis: bounded direct tests fail

The “leggy trilobite” title plus the 29-prime GP alphabet suggested one deliberately small hypothesis: map each GP rune's assigned prime p_i through the Legendre symbol chi_29(p_i) in {-1, 0, +1}, treat the three values as ternary coordinates, arrange p2's 201 values as a 3×67 array, and decode each column as one of 27 symbols. This is an exploratory wordplay hypothesis, not an established clue.

The finite test used the natural base-3 flattening to `A–Z + space` or `A–Z + period`, and all 48 cube symmetries (six coordinate permutations × eight sign flips). It also tested the index-based Legendre alternative, consecutive triplets instead of column triplets, and the specific orientation suggested by the figure (first row forward, second head reversed, tail reversed/inverted). None yielded coherent text.

| Variant | Best mean English quadgram log score | Result |
|---|---:|---|
| Prime-value Legendre, 3×67 column triplets, 48 cube symmetries | −16.9329 | No coherent text; best candidate has only 2 dictionary hits in 7 tokens |
| Rune-index Legendre, same layout/search | −17.2199 | No coherent text |
| Prime-value Legendre, consecutive triplets | −16.5642 | No coherent text |
| Index Legendre, consecutive triplets | −17.2009 | No coherent text |
| Position Legendre key C_i ± chi_29(i + phase), all 29 phases and both signs | −16.4226 | No coherent text; raw p2 is −16.5685 |

For scale, the same quadgram model scored 22,939 stride-10 windows of 67 letters from the repository's first 300k Shakespeare control characters: minimum −13.1132, median −9.9711, maximum −8.2386. All tested Legendre outputs are substantially worse than even the least English-like sampled control windows. The small score improvements within the finite search are not plaintext evidence.

A simpler ternary alternative was also tested: map each GP rune's assigned prime directly to p_i mod 3, use the same 3×67 column-triplet layout, and decode the 27 states as `A–Z + space` or `A–Z + period`. The trit counts are 8/94/99. Across the same 48 cube symmetries the best mean quadgram score is −18.9418 (four dictionary hits in ten tokens, with no coherent text); the figure-specific row orientation (first row forward, second reversed, tail reversed and 1↔2 inverted) is also gibberish. The same 22,939 Shakespeare windows have a minimum score of −13.1132. This retires the obvious prime-mod-3 / three-lobe decode as well.

**Decision:** retire the direct Legendre-trit → 27-symbol p2 decode and the simple period-29 additive Legendre key. Do not expand into arbitrary 27-symbol cube orders or additional fitted offsets. A different Legendre-derived state would need an independent source instruction and a new held-out prediction.

## Existing Trifid constraint

The shared result [`trifid-27cube-allsecret-bound.md`](trifid-27cube-allsecret-bound.md) is already a much stronger gate than a new generic Trifid run: for direct-GP standard 27-cube Trifid with IA/EA transparent, it excludes every continuous period divisible by three from 3 through 12,024 over the full original LP2 core, for every fixed cube ordering, using an exact triple-equality invariant. It is explicitly scoped and does not exclude page-local resets, variable cubes, other alphabets, or additional layers.

For p2 alone, applying that same IA/EA-transparent convention leaves 184 runes, not a complete multiple of three. Thus the simplest page-local 27-cube Trifid cannot consume the whole p2 core without a source-motivated treatment of the one-rune remainder. The raw 201 count being divisible by three does not solve the 29-versus-27 alphabet mismatch.

## Decision / next useful test

Do not reopen continuous standard Trifid or treat 201 = 3 × 67 as a result. Keep the visual match as a provisional clue. A further test is justified only if someone obtains the exact Schröter plate and can map its three anatomical/orientation features to a **pre-specified** partition and transformation of original p2 rune positions. Freeze that mapping before any language scoring. Without that bridge, the image supplies no executable decipherment.

## Reproduction inputs and references

- Original LP2 scan: `resources/liber-primus/19.jpg`.
- Corpus/transcription: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`.
- Existing all-secret Trifid result: `im-results/trifid-27cube-allsecret-bound.md`.
- Richard Fortey, *Trilobite: Eyewitness to Evolution* (caption for the Schröter figure): https://www.geokniga.org/bookfiles/geokniga-trilobiteeywitnesstoevolutionrichardfortey.pdf
- Strange Science, “Invertebrates” (entry “Leggy trilobite”): https://www.strangescience.net/stinv.htm
- Bibliographic context for Schröter's 1774 publications: https://www.thefossilforum.com/topic/80267-trilobite-papers-1762%E2%80%932025-years-in-review/
