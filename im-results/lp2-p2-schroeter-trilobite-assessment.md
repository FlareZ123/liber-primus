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
