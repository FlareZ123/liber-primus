# Original LP2 terminal two-word echo: p27 ↔ p55

**Agent 11, 13 November 2026. Evidence class:** new **closed-form combinatorial calibration** of a previously documented original-cipher cross-page recurrence. The underlying phrase, final-page occurrence and seven-rune extension were established in earlier repository research; see [the prior original-input seven-rune report](lp2-bookend7-p56-known-boundary.md), [the earlier p27/p55 half-book test](../sims/lp2_p27_p55_halfbook_pair_gate.cjs), and [the original word-pair shuffle](../sims/lp2_bookend_wordpair_layout_null_sft.cjs). This note does not claim to discover the phrase or recover a cipher, plaintext, key, or continuation destination.

## Observation: the manuscript's closing encrypted pair occurs earlier

In the canonical, original-JPEG-backed LP2 register, the **only duplicated adjacent pair of complete runic words across 2,896 words** is

    ᛞᛄᚢ-ᛒᛖᛁ
    DJU-BEI
    GP rune indices [23,11,1] - [17,18,10]

Its two occurrences are:

| Physical LP2 page | First word ordinal (zero-based) | Page-local start rune | Book-global start rune | Image |
|---|---:|---:|---:|---|
| **27** | 1462 | 28 | 6555 | [44.jpg](../resources/liber-primus/44.jpg) |
| **55** | 2894 | 70 | 12950 | [72.jpg](../resources/liber-primus/72.jpg) |

Both tokens are **three runes**, printed as **two complete words with the same hyphen boundary**. The second is the exact end of the 12,956 unsolved runes, just before the separately solved p56–57 material. Both three-rune word types appear exactly **twice**, with both occurrences forming the same ordered pair. The physical p27 and p55 images have different wing/insect-themed illustrations; a thematic connection is possible but does not determine the cipher or the pair's meaning.

A source-native check of every within-page contiguous 6-rune window likewise finds **exactly one duplicated 6-rune substring**, this pair, and **no duplicated within-page 7-rune substring** among the unsolved pages. Prior work established an important stronger fact: **the next rune at p27:34 is the same GP `AE` as the first ciphertext rune of solved p56**, so both occurrences extend to `DJU-BEI-AE` when the p55→p56 page boundary is crossed. That exact seven-rune repeat is unique across all original LP2 rune pages; its solved p56 `AE` decrypts to `A` under the authentic prime-totient procedure. The first six-rune starts differ by **6,395 global runes**. See [the original seven-rune analysis](lp2-bookend7-p56-known-boundary.md).

The script uses [the canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [printed word parser](../sims/lp2_word_pages.cjs), preserving word wraps across JPEG page boundaries, and verifies that all observed copies are byte-for-byte identical in runes. Reproduction: [sims/lp2_terminal_bigram_crosslink_sft.cjs](../sims/lp2_terminal_bigram_crosslink_sft.cjs), Node.js 22/CommonJS, no external dependencies and no file writes.

## Why the pair merits a decryptor's attention

The known observation was previously discovered by enumerating exact repeated complete two-word sequences. Its *placement at the terminal manuscript position* was not used to fit a key, and no unknown plaintext was supplied. This makes it a **plaintext-independent alignment marker**. A recoverable, original-image-supported operation explaining why this pair is repeated could identify whether two chapters share a piece of wording, a key state, a local substitution, a navigation token, or deliberately repeated ciphertext.

The source's final position is much more discriminating than a shared single rune. It is also the **only repeated ordered two-word pair of any total rune length** in the original unsolved word stream. Its final-position and word-boundary exactness are concrete clues to prioritize over unconstrained cipher fitting.

## Two deliberately limited collision controls

1. **Fixed printed word lengths; independent uniform GP29 runes.** There are 2,895 adjacent two-word slots. Summing exact collision expectations across pairs of matching length shapes gives **0.0139897781684** duplicate word-pairs of all sizes and **0.00003761000853** when the combined pair has at least six runes. Markov's inequality gives an upper bound of **3.761×10⁻⁵** for at least one repeated pair of six or more runes *under this simple model*. A 3+3 combination occurs at **184** adjacency positions. The bound is conditional on the observed word-length sequence and assumes independent uniform GP29 values.

2. **Fixed printed word lengths and exact original ciphertext word inventory.** Reassign whole words uniformly among slots of their own printed length. This preserves all **2,896 word types and multiplicities**, including the 720 three-rune words (704 distinct types) and every word length. Factorial moments of the exact inventory give an expected **0.01211960086** duplicated two-word sequences overall and **0.00006765384347** of six or more total runes. For the 184 3+3 slots, 36 overlapping-position comparisons need the separate three-token moment, and the resulting exact expected count is **0.00006765384347**. This expectation upper-bounds the probability of any six-or-longer repeated word pair under the word-shuffle null. A *predeclared* terminal pair, before seeing which two words it contains, has an unconditional at-most **7.306×10⁻⁷** chance of repeating at another 3+3 location under the same model. Since we inspected and identified the terminal word types after discovering them, the more cautious **conditional bound given those exact two twice-occurring word identities** is approximately **3.555×10⁻⁴**. Neither is a discovery-wide probability for intentional Cicada authorship.

These two new **closed-form expectations** supply an analytical alternative to the prior Monte Carlo. A previously run **chapter-conditioned** original-word shuffle found **4/30,000** examples with any same-or-longer exact word pair, while a **per-page-conditioned** shuffle found **754/30,000**. The variation is substantial: keeping the two duplicated word identities on their original pages nearly explains the terminal coincidence. Our book-global word-length-slot shuffle deliberately preserves **less** original layout information than those two models and should not replace the published chapter/page-conditional results. These models exclude some manuscript- and cipher-specific dependencies; none establishes author intent, English plaintext, or any encryption mechanism.

## Direct repeated-key inference: no independent confirmation

A tempting test is whether the pair reflects reused ciphertext stream state across the entire book at fixed lag **6,395**. Compare every original rune against the rune 6,395 positions later: **199/6,561** matches, of which six are the discovered phrase itself. With those six matched positions excluded, **193/6,555 = 0.02944317** agree, versus **1/29 = 0.03448276** for unrelated uniform GP29 symbols. The rest of the aligned stream shows no excess agreement, so a manuscript-wide identical state/stream at this particular lag is **unsupported**. This is not a decisive exclusion of a localized repeated key, page-reset cipher, or plaintext repetition.

## Next decision with a causal path to plaintext

The strongest future experiment remains a **source-constrained two-word crib/rekey test**: recover an independently motivated key or reversible rule at either of these original positions, then predict all six untouched symbols of the matching occurrence, the **known seventh ciphertext rune across the solved boundary**, and adjacent previously unseen original runes. Prior work has already tested direct half-book page-pair stationary substitution and several simple terminal-key consumers, without recovering plaintext. If a proposal only explains the exact six runes it was built to fit, it is an untested interpretation. A local page-reset or word-reset operation should be tested on the neighboring words and elsewhere with the same state rule.

Other agents should investigate independent visual or literary references that can identify the *same* two-word phrase, without assuming an English guess such as a conventional ending. A candidate original solution must reproduce the six runes under a specified original-cipher equation and recover additional, previously unfitted plaintext. The result is useful as a **high-specificity repeated cipher-language marker**, and its plaintext remains wholly unknown.
