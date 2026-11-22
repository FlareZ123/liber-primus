# Original LP2 whole-word equality: constraint on stationary word codebooks

**Agent44, 14 November 2026. Classification:** original-source structural necessary condition, cross-language control. **No recovered unknown plaintext, historical key or selected deciphering operation.** This gives a precise decision against stationary word-codebook mechanisms while retaining the possibility of position-varying ciphers.

## Exact original-text observation

From the physically printed 55 rune-bearing unknown LP2 pages, join actual continued words across line/page wraps, preserve printed word separators, and count **2,896** complete GP29 rune words. They include **1,645 words of four or more GP symbols**. Every one of those 1,645 longer words is **different**, giving **zero same-word pairs at all lengths 4–14**. Original length1, length2 and length3 token cohorts have respectively 83, 448 and 720 words and **107, 106 and 17 equal-token unordered pairs**. The long-word length histogram is `4:513, 5:317, 6:256, 7:216, 8:156, 9:78, 10:52, 11:32, 12:18, 13:4, 14:3`. **Stronger equality invariant:** over all **2,896** ciphertext tokens, **no word appears more than five times**. By GP word length the largest exact token frequencies are **5** (one-rune), **4** (two-rune), **3** (three-rune), and **1** (four or more runes). A stationary encoder would require this extraordinary paucity of repeated *function words* in plaintext, even if all long content words happened to be unique. Source: [`lp2-transcription.txt`](../resources/lp2-transcription.txt), [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json).

The 29-symbol independent uniform-reference expected *all-word* pair collisions conditional on this exact length histogram is **247.20**; the original contains **230**. Nearly all the collision opportunities therefore reside in one- to three-rune words, consistent with a near-uniform alphabet output. The absence of long repeated words by itself is an expected feature of randomized symbol output, **not** an anomalous hidden instruction.

## Why this matters to a decrypting operation

Under **any stationary deterministic whole-word encoder** `E`, whether keyed, unknown, nonlinear, arbitrary finite dictionary, or 29-rune alphabet substitution, `P_i = P_j` necessarily implies `E(P_i) = E(P_j)`. This implication survives an enormous secret codebook; no key recovery is required. Original ciphertext has no repeated length4+ word, so a claimed stationary length-preserving word encoder implies the unknown plaintext also has **zero repeated length4+ words** across all 1,645 positions. A natural-language book with common four-rune content and function words would normally violate this. The stronger short-word constraint implies **every putative plaintext word must occur at most five times** in the whole manuscript. This is incompatible with the usual repeated THE/AND/OF patterns of continuous natural prose (subject to source word boundaries and a stationary encoder). The implication is logical, but the characterization of *natural* prose is empirical, not a theorem over all possible plaintexts. A stateful/rekeyed cipher, page-dependent dictionary, nonce/salt, transposition across word boundaries, or deliberate repeated-word avoidance escapes this constraint.

## Authentic GP29 native controls and page-length matched tests

All controls use the source-calibrated Gematria Primus representation (including TH/ING/IO digraph handling and historical alphabet variants). Shakespeare, Gibran and Emerson source documents are pinned in `resources/control/`; Old English uses the **corrected** original *Beowulf* 48,012-GP-rune register; Latin uses the GP-coded Vulgate whole-word file. To preserve context without an English-only assumption, evaluate every **contiguous 2,896-word** window in all five texts and count exactly repeated **length4+ words**:

| Native source | Complete words | Scanned 2,896-word windows | Fewest longer-word repeated pairs in any window |
| --- | ---: | ---: | ---: |
| Shakespeare | 55,407 | 52,512 | **2,559** |
| Gibran | 15,733 | 12,838 | **3,856** |
| Emerson | 77,932 | 75,037 | **1,021** |
| Old English *Beowulf* | 10,885 | 7,990 | **1,427** |
| Latin Vulgate | 39,835 | 36,940 | **3,570** |

As an independent whole-vocabulary diagnostic, the *most frequent exact word* in the first 2,896 GP tokens of each control occurs **134, 168, 226, 66 and 249 times**, respectively. The original maximum is **5**. Shakespeare's most common token is GP `THE` (134 uses); *Beowulf* is GP `THA` (66); the Vulgate is `ET` (249). This property is invariant for *all* deterministic stationary word encoders, even with a secret noninjective codebook: equal plaintext inputs still have identical outputs.

The original word length proportions differ from individual native windows, so this first comparison is descriptive. A stronger **exact length-conditioned** control independently resamples with replacement **513, 317, 256, 216, 156, 78 and 52** native GP words of respective rune lengths **4–10**, the common lengths represented by *all five* reference corpora. There are **1,588** original tokens of those lengths, all unique. The fixed xorshift32 seed `0x33012014` drives **1,500 trials per source**; none of the 7,500 samples has zero repeated longer-word pairs. The **minimum** matched-length pair counts are respectively **2,157, 3,274, 1,531, 1,061 and 2,849** for Shakespeare, Gibran, Emerson, Beowulf and Latin. The sampling model treats each selected word as an independent draw from that author's finite frequency pool, so these are **conditional controls, not estimates of all natural-language possibilities**.

A fixed global GP29 alphabet rotation by +13 applied to a real 2,896-word Shakespeare passage preserves its **4,506** length4+ repeated word-pairs exactly, a positive proof of the key-independent invariant. The baseline near-uniform LP2 symbol model naturally produces zero longer-word collisions. Punctuation, original page breaks and decorative art have no impact on this equality implication as long as the source-visible word tokenization is used. The same implication holds independently for any stationary cipher restricted to a physical chapter.

## Fixed **per-page** codebook reset is also highly constrained

The globally stationary codebook premise can be relaxed by allowing a **different deterministic word encoder on every original rune-bearing physical page**. Original page boundaries create 2,928 page-local word fragments when otherwise continuous words are split at the page end, spanning **55 rune-bearing pages**. There are exactly **four** repeated-word pairs *inside* those pages, on original rune-bearing page ordinals 7, 10, 19 and 45. Each of the 55 pages has maximum word frequency at most **two**; **51/55** pages have no repeated printed word of any GP length. All four repeated pairs involve one- or two-rune words. This is an original-data necessary-condition test, not a claim that page changes are cipher resets.

For a controlled comparison, sample 1,200 deterministic starting offsets in each independently encoded native text, take **2,928 consecutive native words**, and resegment that run into 55 pieces with exactly the original physical-page **word counts** (17–71 per page). The pseudorandom seed is frozen at `0x33014411`, shared across all five source tests. No key fitting or plaintext scoring occurs.

| Native GP29 text | Minimum number of within-page repeated pairs over 1,200 samples | Fewest pages containing any repeated word | Samples with at most the original four repeated pairs and four repeated pages |
| --- | ---: | ---: | ---: |
| Shakespeare | **631** | **51/55** | **0** |
| Gibran | **1,194** | **52/55** | **0** |
| Emerson | **963** | **51/55** | **0** |
| Corrected Old English *Beowulf* | **195** | **43/55** | **0** |
| Latin Vulgate | **740** | **51/55** | **0** |

The source windows preserve each source's native word order and original page **word counts**. They do **not** match the original page-by-page rune-length histogram, and native whole words are compared with LP2 page-fragments, so this is a transparent conditional check rather than a universal exclusion probability. Even allowing the codebook to rekey once per page would require almost every source page to avoid repeating its own common words. This considerably narrows plausible page-static dictionary methods and strengthens the case for a position-varying cipher. A genuinely nonrepetitive designed plaintext remains possible. The CommonJS reproducer asserts all 55 page sizes, the four original pair positions, all five comparison minima and the original-word diagnostics.
## Research decision

**Retire stationary whole-word replacement and static dictionary-codebook interpretations of ordinary natural-language LP2 text, including a simple **once-per-page rekeyed** version.** They would require the plaintext to have no word recurring more than **five times**, and to avoid repeating every length4+ printed word across the manuscript, despite five native GP29 reference texts showing abundant repeats even under matched word lengths. This does **not** reject whole-word ciphers with changing keys/state, non-stationary encoders, intentionally repetition-free plaintext, or segmentation changes. Do not fit a huge fixed codebook to these independent-looking tokens. Prioritize finding the source-selected **position-dependent generator, nonce or key schedule** capable of explaining the anti-repeat filtered, near-uniform original output. The present test recovers no plaintext.

**Verified Windows Node22 source execution:** [GitHub Actions run 43543192198](https://github.com/FlareZ123/liber-primus/actions/runs/43543192198), following source and report consolidation.

**Reproduction:** [single-file Node.js 22 CommonJS original-input SFT](../sims/lp2_global_wholeword_equality_source_sft.cjs). The file freezes the original token counts and collisions, all five contiguous-source extrema, the length-matched sampler seed/counts and a real native GP29 fixed-substitution positive.
