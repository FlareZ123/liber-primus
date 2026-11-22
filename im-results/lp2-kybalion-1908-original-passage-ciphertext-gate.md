# Original LP2 against the 1908 Hermetic *Kybalion*: two plaintext-bearing inversions find no full passage

**Agent38, 21 November 2026. Evidence class: bounded original-ciphertext source-quotation search with a pinned pre-2014 public-domain text, exact full-source scan and constructive positives. No unknown LP2 plaintext or key recovered.**

## First-party problem and independently pinned source

The 56 unsolved LP2 physical pages (0–55, with one numeric-only page50) contain **12,956 original GP29 runes in 2,896 intact printed words** and **86 adjacent-identical rune events** within physical pages. The still-unidentified plaintext might copy an earlier philosophical or esoteric source; the solved Cicada material has human-readable philosophical prose and earlier puzzle stages used supplied literary material. This makes a specific pre-existing Hermetic work a realistic *candidate* for a key-independent known-plaintext recovery. Nothing in the author-authenticated 2014 release selects this book, so the title is a research hypothesis and cannot be promoted to a puzzle key.

I acquired a reproducible public-domain full text: [Project Gutenberg #14209](https://www.gutenberg.org/ebooks/14209), *The Kybalion*, attributed to the Three Initiates, first published 1908. The exact source is the [GITenberg file](https://github.com/GITenberg/The-KybalionA-Study-of-The-Hermetic-Philosophy-of-Ancient-Egypt-and-Greece_14209/blob/master/14209.txt), git-blob SHA1 **`04b68061063bd61a0f7192c48d2dfd9c60370bcf`**, copied unchanged to [the repository's stable external resources](../resources/external/kybalion-gitenberg-14209.txt). This predates 2014 as a literary work even though its specific digitized text and editorial apparatus were later distributed.

Discard only Gutenberg license/header/footer by the literal ***START***/***END*** markers, then convert every English word with the already-established native GP29 spelling: `QU→CW`, `V→U`, `K/Q→C`, `Z→S`, `ING→NG` and `IO→IA` rune conventions; longest remaining GP transliteration tokens. The complete edition supplies **34,347 source words and 148,189 native GP29 runes**. Every original LP2 rune and canonical word separator is independently reconstructed from the untouched LP2 source corpus/transcription.

## Gate A: exact printed-word-length source quotation

If the original manuscript's word boundaries preserve the quoted natural language, an unbroken run of original ciphertext GP word lengths must match the source's GP-encoded word-length run irrespective of the alphabet cipher/key. Enumerate every contiguous length-8 source window and compare against all 2,896 original printed word starts, then extend each exact match maximally until the first length disagreement.

The entire scan finds **10 original/source pairs matching eight consecutive words, zero matching nine, and therefore zero matching any longer source passage**. The largest observed exact matched run has length **eight GP words**, too short and nonunique to identify plaintext. A known **18-word source length plant** is recovered at its originally recorded offset, exercising the same indexing rule. This is a key-independent necessary-condition failure for a verbatim quote with unchanged GP spelling and printed word segmentation.

## Gate B: exact fixed-plaintext-rune event-mask passage recovery

The original 86 adjacent rune repetitions permit a stronger, different source-plaintext attack even when the printed word boundaries have been scrambled. In a reversible predecessor-excluding 28-way GP29 alphabet with one designated literal plaintext rune `R` encoded as a repeated predecessor, its *key-independent* necessary condition is:

`C[i]=C[i−1] ⇔ P[i]=R` at all eligible same-page rune positions.

All original physical page leaders are masked as independent initial states. Search **all 29 choices for R**, every source substring start in both the original and each of the nine complete manuscript visual chapter lengths, and demand an **exact full marker mask**: every ciphertext equal-adjacent event coincides with R in the candidate source, while no other source R occurs at any eligible non-event position. No fitted secret codebooks or word boundaries are needed for this necessary condition.

| Visual chapter | Original runes | Original repeated-rune events | Exact source marker matches (all 29 choices) |
| ---: | ---: | ---: | ---: |
| 1 | 729 | 4 | **0** |
| 2 | 1,145 | 6 | **0** |
| 3 | 1,729 | 9 | **0** |
| 4 | 1,903 | 10 | **0** |
| 5 | 1,021 | 11 | **0** |
| 6 | 1,433 | 13 | **0** |
| 7 | 1,680 | 12 | **0** |
| 8 | 3,008 | 18 | **0** |
| 9 | 308 | 3 | **0** |
| **Total** | **12,956** | **86** | **0 complete chapters** |

The full source is 148,189 GP runes; every substring is checked using GP-symbol prefix counts before verifying the source-event positions, and original physical page leaders are handled independently of chapter starts. The complement matters: a candidate with a few coincident special-letter positions and many unexplained extra source occurrences is correctly rejected.

A constructive plant takes **729 actual Kybalion GP symbols**, transmits its two-mode predecessor-feedback encoding under `R=EA`, and recovers **729/729** source symbols through the exact inverse. The synthetic cipher's repeated-rune mask matches every true plaintext R site and has no false sites (excluding physical leaders). This is a positive for the proposed family, not evidence Cicada used it.

## Decision and limits

**No verbatim contiguous original LP2 chapter from this specific edition is recovered under either proposed source-quoting architecture.** This retires two well-defined attempted plaintext-recovery routes for this *specific* historically plausible text: intact source word lengths, and arbitrary secret nonrepeat GP codebooks with one fixed plaintext symbol whose occurrences are marked exactly by adjacent-equal ciphertext runes. The event-mask gate intentionally ignores printed word breaks and still finds no passage.

The scope is precise. The book may still be an external *key*, a paraphrased or non-contiguous textual inspiration, a source using different spelling, a plaintext reshuffled by transposition, or a source for a cipher unrelated to the tested special-rune architecture. Neither negative implies that the Hermetic philosophy itself is ruled out. The source is **not Cicada-authenticated** and these tests give no reason to launch more speculative source scans without a new clue selecting another text.

**Reproduce:** [single-file Node22 SFT](../sims/lp2_kybalion_1908_original_plaintext_passage_sft.cjs), reading [the untouched original GP corpus](../resources/liber-primus/lp2-corpus.json), [actual printed segmentation](../resources/liber-primus/lp2-transcription.txt), and the exact pinned Gutenberg edition. It verifies byte-level Git blob SHA1, full original 12,956-symbol reconstruction, ten eight-word matches with no nine-word match, zero source marker chapters, and positive plants. All assertions passed in [GitHub Actions run 44945138594](https://github.com/FlareZ123/liber-primus/actions/runs/44945138594).
