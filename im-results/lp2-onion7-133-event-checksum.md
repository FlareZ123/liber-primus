# Source-locked 256-event rolling checksum reaches the archived Onion7 title `133`

**Evidence class (Agent22, 11 November 2026):** original-source arithmetic, a finite matched-control checksum hypothesis, and a bounded original-cipher inverse. **The checksum match was noticed during hypothesis exploration and is not an authenticated Cicada instruction. No unknown LP2 plaintext, key or final destination has been recovered.**

## Source-visible clue and candidate human operation

The five-dot border ornaments on original LP2 pp40–55 admit the previously recorded five-bit reading **13** and **31**; it depends on a particular orientation/polarity and has not been independently authenticated as the maker's instruction. Original two-ink annotations across all **58** LP2 physical pages contain **225 red GP runes and 31 large thirteen-dot marks**, exactly **256** events, matching the **256 cells** of the printed 32×8 base-60 grid.

The [contemporaneously archived seventh-onion delivery HTML](../resources/cicada2014-onion7-index.html) contains `<title>133</title>` and `<div id="331">`. This 1,640-byte file appears alongside the signed May-2 2014 reply and all 58 page JPEGs in the [participant archive commit of 11 May 2014](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17). The archive is contemporaneous, though not itself a cryptographically authenticated HTTP response from the original hidden service. It supplies a **prospective external checksum target** if the integer `133` was intended to summarize the artifact.

One small and precisely reconstructible way to combine these hints is a base-13 8-bit rolling register:

- Read the original 256 red-rune or 13-dot events in physical manuscript order, with punctuation before a red rune at an identical page offset. Do not deduplicate the p7:194 black/red marks.
- For a red rune with GP index `r` in 0–28, supply input `r+1` (the natural **1-based rune ordinal**). For each thirteen-dot punctuation mark, supply input `31` (the source count of such marks).
- Initialize `s=0`, then for each event perform `s ← (13*s + input) mod256`. No offset, seed, event order, output index or byte value is fitted.

**Exact terminal value: `s_256 = 133`**, equal to the original HTML title. The last event is the original thirteen-dot separator at **p57 rune offset7** after the solved word PARABLE. The register visits **170 distinct pre-event states** (so it is a keyed walk rather than a 256-state permutation).

An exact decomposition helps make the arithmetic auditable: the red ordinal values alone give terminal register **224**; assigning 31 to the fixed marker slots contributes another **165 modulo256**, yielding `(224+165) mod256 =133`. Also, `133` and `331` are decimal reversals and `133+331=464=π(3301)`, since the 464th prime is 3301. Those features are visible after selecting the numbers and should not be multiplied as independent statistical confirmation.

## Exact conditional tests and selection caveat

Two fixed-seed nulls of **100,000** source-sized draws each were applied. The red-rune **multiset shuffle** permutes 225 actual one-based ordinals among their existing positions, retaining 31 marker positions; the **pagewise mask rotation** independently circularly rotates each red-bearing page's complete original rune tape relative to its unchanged red-ink positions and thirteen-dot marks. Neither preserves an intended unknown plaintext or calibrates the whole human discovery process.

Because the match was noticed within a broader family, the same nulls re-evaluate the complete small finite choice of multipliers **13/31**, marker codes **0/1/13/31**, and global additive increments **0/31**. The 16 nominal settings have only eight effective outputs: with 256 event updates, the all-step additive-31 sum vanishes modulo256 for both multipliers.

| Selected endpoint test | Red-value shuffle hits / 100,000 | Plus-one tail | Page-mask rotation hits / 100,000 | Plus-one tail |
| --- | ---: | ---: | ---: | ---: |
| Specific `13*s + input`, marker31 | 1,555 | 0.01556 | 410 | 0.00411 |
| **Best-of-16** candidate family, same 133 target | 3,871 | **0.03872** | 3,142 | **0.03143** |

Only the frozen **multiplier13, marker31** construction reaches 133 on the original source; adding 31 at each step produces the same final value by a 256-step modular identity. Family-corrected results are modest. The source 13/31 reading, marker code, mod256, choice of checksum target, and even the decision to use a rolling hash were not preregistered before this project explored other numerical correspondences. Thus **neither p-value is discovery-wide evidence of intentional encoding**. The alternate interpretation that HTML `331` names the rolling modulus fails for this model: the same original recurrence modulo331 ends at **45**, rather than 133. The HTML id may simply mirror the title without encoding a second independent condition.

## Original-cipher discrimination using the candidate state tape

The checksum relation produces a completely specified **256-state tape** `s_0,…,s_255` (or its post-event values). Treat each state as row-major address into the unchanged 32×8 byte grid, and repeat the resulting 256-byte key over all **12,956** unknown LP2 runes with book-global phase zero.

A bounded inverse tests the only simple direct registers justified by previous solved-page experience: direct GP29 additive and page-IV GP28 predecessor-exclusion (ciphertext doublet gives transparent GP index28). Pre/post-event key read, both signs, and byte projection by remainder or proportional scaling give exactly **16** distinct original-cipher inversions, with no key or alignment fitted. All 16 exactly re-encrypt the original, and each accurately recovers a full-length repeated-p57 GP-native mechanics-only planted plaintext.

| Original-input criterion | Exact observed range |
| --- | ---: |
| Original GP29 ciphertext IoC | 0.0344783979 |
| Eight direct GP29 additive inverses | **0.0344542565–0.0345095814** |
| Eight GP28 predecessor-exclusion inverses, transparent index28 | **0.0352423766–0.0353012166** |

The outputs are nonlinguistic. For GP28, transparent markers distort the raw index28 frequency; its IoC should not be compared directly with the ordinary GP29 uniform benchmark. These are straightforward, reversible but **negative** uses of the candidate state tape as the actual manuscript key.

## Decision and next useful operation

This is a source-derived, **independently targeted numerical correspondence** between the entire published LP2 event tape and the contemporaneous distribution page's numeric HTML title. It is more constrained than a free fitted checksum, and offers a testable state tape for potential future mechanisms. At present it lacks an independent historical instruction to apply this particular rolling hash, a second nontrivial out-of-sample target, or a decoding algorithm that yields plaintext. The finite 13/31 variants already reduce a nominally interesting rare match to a roughly 3–4% conditional family event.

A future promising observation would identify, from the original images or earlier signed stage, **why 31 encodes a punctuation event, which recurrence consumes the event values, and what role the final title has**. That would let the 256-event state tape serve as a predetermined key/clock rather than a post hoc checksum. Do not extend this into free phase, seed, hash-family or table rotations without an external operation selector.

**Exact reproducer:** [`sims/lp2_onion7_133_event_checksum_sft.cjs`](../sims/lp2_onion7_133_event_checksum_sft.cjs), a standalone Node 22/CommonJS program using the frozen original rune corpus, ink annotations, table and HTML. It passed [manual GitHub Actions run 42929968744](https://github.com/FlareZ123/liber-primus/actions/runs/42929968744). It asserts the terminal 133, all original source counts, candidate family, deterministic 100,000+100,000 null counts, all original cipher re-encryptions, and all source-native positive-plant recoveries. It writes no files.
