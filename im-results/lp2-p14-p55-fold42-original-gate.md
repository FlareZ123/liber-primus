# Physical LP2 p14 FOLD to p55: the 42-page mirror pairing is not a simple shared pad

**Agent 31, 14 November 2026. Classification:** original-image clue, fixed whole-artifact pairing, conditional paired-page coincidence and a source-native-language exclusion of a simple common-key model. **No unknown LP2 plaintext, historical creator key, decipherment algorithm or destination recovered.** The principal 42-page fold is a hypothesis, because the original word FOLD does not explicitly specify an axis, page range or operation.

## An original human-readable clue and a reversible page address

The original physical LP2 p14 (original 31.jpg) prints the four-rune word **ᚠᚩᛚᛞ**, literally FOLD, as the second word. It is embedded in ciphertext prose, so its plaintext status is unproved. An independently authenticated 2016 Cicada message says the manuscript's words are a map, their meaning the road, their numbers the direction. A previously published, *conditional* GP-prime-sum/base58 address rule maps the signed word THE to p14's FOLD. That numerical rule lacks an authenticated choice of modulus/address orientation and has been evaluated elsewhere; the word printed on the original image, rather than the speculative coordinate calculation, is the principal observable input here.

There are **42 complete original physical LP2 pages p14–p55**, including the rune-free 256-cell p50. Folding that contiguous interval physically in half produces **21 ordered page pairs**, with first p14/p55, next p15/p54 and final p34/p35. It asks whether two printed halves carry one shared cipher stream, related text, or a repeated word layout. This page range is a source-motivated but unverified interpretation of FOLD, not an established author instruction.

## What survives direct original-source pairing

Use every rune at its original page-local GP29 offset, with the fixed 21 physical pairs. Two *adjacent* mirrored pairs have **exactly equal original rune lengths**:

- p24 and p45: **270** runes on each page.
- p25 and p44: **273** runes on each page.

No other member of these 21 folded pairs has the same nonzero rune length. This adjacency is a visually simple coincidence, but these two exact page lengths may recur elsewhere; it does not prove an intended plaintext-alignment operation. As a conditional diagnostic, freeze the exact 21 left-page identities and the multiset of 21 right-page lengths, then shuffle right-page assignments (100,000 seeded Fisher–Yates controls, seed 0x31f02114). At least two equal-length pairs occur in **8,492/100,000** matched controls; at least one adjacent pair of equal-length matches occurs in **886/100,000** controls. The adjacency tail is **post-discovery and unadjusted** across all imaginable folds, boundaries and visual patterns. It does not authorize a cryptographic key.

All 21 original pairs offer **4,056** aligned same-offset GP29 comparisons using the shorter of the two page lengths. They contain **138** exact matching runes, consistent with near-uniform ciphertext. In the two exact-length pairs, the original printed orientation contains just **2/270** and **6/273** equal runes: **8/543**. Fully reflecting the right-hand member in each pair raises the equality count to **10/270 + 8/273 = 18/543**. These comparisons require no guessed key, language score, or edited rune. An identical positionwise GP29 additive key applied to two plaintext page streams necessarily preserves every same-offset equality. Consequently the above rare original exact matches would force equally rare same-offset equal plaintext runes for either source-ordered or mirrored common-key reading.

A native-GP English reference benchmark was generated using the independently archived 300,000-character Shakespeare corpus and the source-attested GP spelling (single runes for ING and IO). It yields **217,106 GP29 symbols**. In 20,000 deterministic nonoverlapping 543-symbol paired-window comparisons, the mean count of same-offset equal symbols is **32.3186** and the observed minimum is **11**. None matches as rarely as the original direct **8/543**; **101/20,000** are as sparse as the reverse **18/543**. The language controls are a specified reference register, not a universal impossibility proof: different language, deliberately nonprose or separately encrypted intermediate plaintext is outside scope.

## Direct word-boundary geometry also fails to reveal the fold

The same original canonical transcript preserves every word-ending hyphen/period without mistaking printed slash line wraps and physical page breaks for word boundaries. Across all 21 pairs, **199** same-offset word endings coincide in the source/printed orientation; **191** coincide if each right page's word-break positions are reflected about that page's own total rune length.

A separate 30,000-control matched null permutes the exact 21 original right-hand pages against the same 21 left pages, preserving every page's authentic rune length, all printed break positions, and the original left/right inventories. It uses seed 0x31f02114, with both original and right-reversed orientations evaluated on each surrogate:

| Word-boundary alignment | Actual same-offset matches | Matched-null mean ± SD | Nulls with ≥ actual | One-sided upper tail |
| --- | ---: | ---: | ---: | ---: |
| Printed positions | **199** | 201.6669 ± 12.5641 | 18,014 / 30,000 | 0.60048 |
| Reflected right page | **191** | 201.6593 ± 11.9292 | 24,818 / 30,000 | 0.82727 |

The printed word ends thus provide **no pair-specific evidence of a folding instruction across p14–p55**. The page-length coincidence alone cannot select a word-preserving common decoder or page-key alignment.

## Cryptanalytic decision

**Retire the literal p14–p55 fold as a standalone repeated positionwise additive GP29 key or preserved-word-boundary arrangement for ordinary source-native GP prose.** The unusual adjacent page-length match is conditional and exploratory. It would become actionable if another original, independently authenticated clue specified a page fold, a concrete reversible two-page operation, and a way to recover a key or entire unknown plaintext sentence on untouched ciphertext. Unconstrained new word permutations, offsets and paired-page cipher guesses would turn the initial FOLD observation into fitted coincidence.

**One-file reproduction:** [original-corpus Node22 CommonJS SFT](../sims/lp2_p14_p55_foldpage_equalkey_sft.cjs). This script asserts all original source lengths, the printed FOLD placement, both exact-length pairs, original rune agreements, authentic page word boundaries, both seeded permutation controls, and a 543-rune reversible common-key English plant. The arithmetic was also independently computed against the canonical remote files; no GitHub Actions execution of the new SFT has been claimed. Its source-only paired-page word-boundary control and the English-reference common-key gate are new negative findings, with no change to [the authoritative original-inversion frontier](../workplace/integrated-original-inversion-challenge.md).
