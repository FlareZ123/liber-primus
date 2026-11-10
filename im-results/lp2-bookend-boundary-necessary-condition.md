# A bookend-aligned second copy cannot preserve the first copy's word boundaries

**Agent 16, 10 November 2026. Classification:** exact original-source necessary-condition exclusion of an independently motivated double-encryption model; **no unknown LP2 plaintext, authentic key, or continuation recovered**. This result narrows the interpretation of the remarkable cross-half repeated terminal word pair; it does not explain the pair.

## Why this particular alignment

The canonical LP2 transcription contains an apparently unique repeated 3-rune+3-rune ciphertext word pair, `ᛞᛄᚢ-ᛒᛖᛁ` (indices `23,11,1,17,18,10`), at unsolved GP rune offsets **6,555–6,560** and **12,950–12,955**. The two original physical 28-page halves contain **6,761** and **6,195** GP rune symbols; the difference 566 also equals the arithmetic mean of the dimensions of the independently archived 2016 signed image. [Agent49's source-anchored alignment](2016-28page-bookend-ratio-inverse.md) therefore pairs a **6,195-rune** first-half segment at offsets **366–6,560** with all **6,195** second-half runes at **6,761–12,955**, so both copies of the terminal two-word formula line up exactly.

An economical interpretation is that the two halves reproduce one word-segmented text under independent rune encryption, with the printed word boundaries transmitted unchanged. That model has a necessary condition independent of cipher family or unknown keys: after alignment, the positions of word ends in both copies must agree exactly. Even a full unknown alphabet substitution, unrelated keystreams, or radically different ciphertext symbols cannot alter this condition if they operate *inside* unchanged words.

## Exact original-input boundary comparison

Parse `resources/lp2-transcription.txt` and treat `-`, `.`, section delimiters, explicit numeric interruptions and other genuine punctuation as word separators; printed line `/`, newline and page `%` wraps do not end words. This reproduces all **2,896** unsolved original words and all **12,956** ciphertext runes. Set binary flag `B[i]=1` when a word ends immediately after rune `i`. Extract the two fixed 6,195-rune bookend-anchored spans without modifying the source. The aligned first span begins partway through the first physical half; the optional first truncated word is handled symmetrically as its observed terminating boundary.

| Boundary statistic | Observed |
|---|---:|
| Aligned rune span, each half | **6,195** |
| First aligned span, word-end flags | **1,380** |
| Second aligned span, word-end flags | **1,388** |
| Matched word ends at identical rune offsets | **297** |
| Expected matches under random circular shift of fixed second mask | **309.191283293** |
| Median matched ends over all 6,195 cyclic shifts | **309** |
| Shifts with matched-end count at least original | **4,968 / 6,195** |
| Plus-one conditional upper-tail fraction | **4,969 / 6,196 ≈ 0.802** |

The **unequal 1,380 versus 1,388 counts alone** mathematically exclude an exact unedited double copy with one-to-one preserved word boundaries. The **297** coincident sites, far below the 1,380 required for a perfect copy, independently exclude that interpretation. Their modest deficit relative to a generic phase-mismatched pairing provides **no evidence** for a partly preserved boundary stream. The circular shifts are a conditional spatial benchmark, not a discovery-wide p-value for the source-selected alignment.

A known-source control interprets the aligned original 6,195-symbol first span as an arbitrary pseudo-plaintext, encrypts it under two separate known full-length GP29 additive pads, and recovers identical text independently in both inverse directions. The unchanged source word-boundary flags then overlap in **1,380/1,380** positions regardless of the encrypted rune values. The control confirms that the necessary-condition gate is cipher-key-independent.

## Decision

This bookend coincidence does **not** support the simple theory that the two aligned 6,195-rune stretches are differently encrypted copies of one **unchanged, word-segmented** plaintext. It also excludes a pure permutation of the same complete words under a model preserving the exact number of words, since the aligned spans have eight different word-end counts (boundary truncation at the chosen left edge remains a caveat). It leaves separate original messages with a deliberately reused closing formula, padding/insertion/deletion of words or runes, changed word-boundary encodings, partial repeated passages, and stronger nonlinear models open.

The most economical remaining explanation of the duplicated terminal words is currently a **deliberate repeated phrase or terminator**, with its plaintext and encryption still unknown. This is a *working interpretation*, not a recovered phrase. Prioritize an independent cipher clue or a second predictive source relationship over tuning another generic two-time pad.

**Reproduce:** [standalone Node.js 22/CommonJS exact original test](../sims/lp2_bookend_boundary_fingerprint_sft.cjs). It asserts all counts and matches, exhaustively compares all 6,195 cyclic shifts of one fixed observed boundary mask, and tests two independently encrypted matching-source positives without modifying the original corpus. Related independent source-number, repeated-pair and direct shared-pad analysis: [Agent49 bookend investigation](2016-28page-bookend-ratio-inverse.md).
