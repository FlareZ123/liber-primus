# Original word-boundary feedback input-alphabet capacity

**Established exact conditional exclusion, 12 November 2026; no unknown plaintext recovered.**

A cipher family that a 2014 solver might reasonably consider is a deterministic, secret substitution whose output depends on the current plaintext symbol, the immediately previous ciphertext rune, the visibly delimited chapter, and whether a word has just started. It might reset or change substitution at a word boundary. Even granting arbitrary secret substitutions separately for every such state, the complete 26-letter Latin and 28-symbol input-register families fail an elementary key-independent test.

## Source and exact witness

The original LP2 transcription has 13,136 GP29 rune tokens on 57 nonempty physical pages, of which 12,956 belong to unknown pp0–55, and 2,941 printed words across all 58 pages. The standalone SFT checks every one of the 13,136 rune identities against the independent canonical index array. It preserves a word that crosses a page boundary, treating hyphen, period and paragraph breaks as separators and line/page breaks as continuity unless explicitly marked.

Freeze the original visible chapter pp40–53 and previous ciphertext GP29 index **18** (E). For all **91** instances where the following rune is **inside the same printed word**, the next original ciphertext contains **every value 0 through 28**. This holds with the extra **wordStart = false** flag. The first exact witness for each successor is given in the SFT output as (physical page, zero-based page-local rune offset); there is no secret alphabet or plaintext fitting.

**Theorem.** For an alphabet of size m, a deterministic one-source-symbol/one-output-symbol transducer with a fixed state and no hidden time-varying input has at most m distinct output runes in that state. This remains true for any secret noninjective or injective output function. Here one source-visible state has 29 distinct outputs, so m must be **at least 29**. A plaintext register restricted to 26 ordinary Latin symbols, 28 GP28 symbols, 16 Futhark symbols or hexadecimal cannot generate the observed source under this exact state architecture, regardless of key.

## Sensitivity to additional original-visible state

| Frozen state components | Maximum distinct original next runes | States with more than 26 successors |
|---|---:|---:|
| Chapter, previous ciphertext | 29 | 44 |
| Chapter, previous ciphertext, word-start bit | **29** | **20** |
| Chapter, previous ciphertext, word-position parity | **28** | **3** |
| Chapter, previous ciphertext, word-length parity | **27** | **3** |
| Chapter, previous ciphertext, first/last-letter flags | **28** | **7** |
| Chapter, previous ciphertext, positions 0/1/2/3+ | 26 | 0 |
| Physical page, previous ciphertext | 15 | 0 |

The middle three refinements independently exclude **26-symbol** input registers within their own specific frozen-clock architectures. The final two rows show the result's scope: a richer word-position phase or page-specific mapping is *not excluded* by this alphabet-capacity argument. In particular, no claim is made against arbitrary secret per-word tables, hidden PRNG state, two previous ciphertext symbols, changing alphabets, non-one-to-one encodings, or altered word segmentation.

The SFT includes a full-length **13,136/13,136** GP29 source-native positive plant, encrypted with a genuinely changing prior-ciphertext/word-start additive key and exactly recovered by its inverse. The plant validates the state clock and implementation, while the capacity exclusion itself is an exact pigeonhole argument on the untouched original ciphertext, needing neither language assumptions nor a plausible plaintext score.

**Decision:** A raw-Latin26 intermediate alphabet cannot rescue an otherwise chapter-static first-order ciphertext-feedback substitution simply by adding a word-start flag, a fixed word-position parity, an original-length parity, or first/last-word flags. Reconsider those families only when an independently sourced additional state or non-one-to-one representation is specified. Seek actual plaintext/key recovery rather than expanding arbitrary free state tables.

**Reproduction:** [original-source single-file test](../sims/lp2_word_boundary_feedback_capacity_sft.cjs), with [canonical corpus](../resources/liber-primus/lp2-corpus.json) and [source word separators](../resources/liber-primus/lp2-transcription.txt).