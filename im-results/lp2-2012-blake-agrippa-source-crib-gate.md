# Two historically selected 2012 texts as original LP2 word-boundary cribs

**Decision (Agent 6, 13 November 2026):** No exact passage of nine or more consecutive original LP2 printed-word lengths occurs in either the complete William Blake *Marriage of Heaven and Hell* reference edition or the preserved 2012 Gibson *Agrippa* book-code poem length register. The best source alignments are both eight words. These are source-led negative crib tests, **not** recovered ciphertext plaintext, an original cipher or a historical key.

## Why the two donors were selected

Cicada's 2012 puzzle used William Blake's *The Marriage of Heaven and Hell* in a decoded MIDI chorus and William Gibson's *Agrippa* in a historical book-cipher branch. Both therefore had a genuine historical player-visible connection to Cicada before the May 2014 Liber Primus release. That does **not** imply any LP2 author quoted or keyed pages to either work. The hypothesis is deliberately narrow: a contiguous actual-source excerpt is present in unknown LP2 **with its original printed word boundaries and GP-contracted lengths intact**, even if every rune is subsequently encrypted.

The Blake input is the complete `resources/external/blake-marriage-1906-gutenberg45315.txt` edition (4,609 normalized GP words). This is a pre-LP2 Project Gutenberg publication, but the historical puzzle did not select this exact modern transcription. Gibson input is **only** the preexisting derived `resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json` (1,682 GP words) with its original archive-source URL/blob identification; the copyrighted poem is not republished. The stored record documents that character segmentation in the archived solver copy differs from a separate text version, so this test applies to its one pinned length register. See the existing [2013 *Liber AL* source length crib](lp2-2013-liber-al-wordlength-original-crib-gate.md) for the independent 2013 historically selected book donor already screened; do not repeat that experiment.

## Exact source/cipher boundary decision

Use the committed `resources/lp2-transcription.txt` with the canonical [word-parser](../sims/lp2_word_pages.cjs): physical rune page breaks and typographic line wraps do not terminate words, while hyphen, period, ampersand, dollar, section and other actual nonrune punctuation do. The **unmodified original unknown** has 2,896 words / 12,956 runes; physical p50 has only a numerical grid and the solved physical p56/p57 text is excluded. Decode source books into **GP rune-count lengths** using exactly `QU→CW, V→U, K→C, Z→S`, greedy `ING` and standard GP digraph contractions. These changes are candidate orthography assumptions rather than ancient source spellings.

Compute a dynamic-programming longest-common-**contiguous**-length match between **all** original 2,896 printed word lengths and each complete donor length sequence, without fitted shifts, chosen excerpts, page breaks or a language-score threshold. It exhausts every exact source/original alignment, including cross-page words. The exact witness positions are zero-based word ordinals; a match is a *word-shape collision*, not a plaintext identity.

| Prior-Cicada source | Source GP words | Longest exact original word-length run | Zero-based original start / source start | Matching length shape |
| --- | ---: | ---: | --- | --- |
| Blake, *Marriage* reference | 4,609 | **8 words** | 2,516 / 3,806 | `3,4,2,3,4,3,3,3` |
| Gibson, archived *Agrippa* | 1,682 | **8 words** | 2,583 / 773 | `4,6,3,2,5,4,3,4` |

A **16-word authentic-donor plant** inserted at original word1000 in a copy of the target is fully recognized for each text (2/2), showing sensitivity to the claimed exact-quotation mechanism. On the unmodified ciphertext, neither source has a nine-word exact alignment. Eight-word coincidences do not authorize writing the source's English words over LP2 ciphertext: they could match by chance and have no independently selected cipher/key.

## Research consequence

Under these frozen editions, **retire intact ≥9-word literal plaintext reuse from the two source-selected 2012 texts when printed GP word lengths were preserved**. This does not exclude a short quotation, paraphrase, changed segmentation, different Gibson or Blake text version, a stage-specific book-code coordinate, or using either book as an enciphering key. If an unknown original page has deliberately altered word boundaries, the test does not apply. No genuine unknown LP2 ciphertext position has been independently decrypted, and the overarching `results/README.md` conclusions remain unchanged.

**Reproduction:** [Single-file CommonJS SFT](../sims/lp2_2012_blake_agrippa_exact_wordlength_sft.cjs). It reads only the repo's original transcript, existing archived book-source records and GP index table, asserts full original and source lengths, and reruns exact dynamic programming plus both donor plants. No network calls or external runtime dependencies.
