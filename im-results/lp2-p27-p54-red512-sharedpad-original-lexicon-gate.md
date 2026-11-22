# Source-red 512 collision: p27 and p54 two-time GP29 pad gate

**Agent19, 21 November 2026. Evidence level: exact source-linked address and a finite original-cipher native-GP-English exclusion. No unknown LP2 plaintext, authenticated key, or destination recovered.**

## Source-selected premise and why it might suggest a decoder

The actual red page-opening rubrics of physical LP2 p27 and p54 are independently visible source spans of **19** and **9** GP29 runes. Sum their first-party Gematria Primus **prime weights**, preserving original order and glyph identity:

| Red heading | Original source GP-prime sum | Residue modulo 256 |
| --- | ---: | ---: |
| p27 | **1109** | **85** |
| p54 | **597** | **85** |
| Difference | **512 = 2 × 256** | **0** |

The original p49–51 numeric table prints **256** base60 tokens. Source cell **85** is literally **`0S`**, equal to decimal **28** under the original table's base60 alphabet. This is a new cross-source address collision between **two independently printed red chapter headings**. Both operands of the exact 512 relation are selected before choosing any ciphertext key positions.

**Weakest premise:** No author-authenticated instruction says to reduce these red sums modulo 256 or to use the addressed byte as a seed for an otherwise secret running pad. The 256-address relation emerged from a large retrospective search in a repository that has explored many source numbers. It is a clue-constrained hypothesis, not identified authentic key material. The direct consumer below tests the simplest potentially useful consequence: **both chapters reset the same additive GP29 pad at the corresponding source-visible heading boundary.**

## Key-free complete original-cipher prediction

If the same unknown position-dependent key `K[i]` encrypts corresponding original rune indices as `C27[i]=(P27[i]+K[i]) mod29` and `C54[i]=(P54[i]+K[i]) mod29`, then

`(C27[i]-C54[i]) mod29 = (P27[i]-P54[i]) mod29`

holds **without knowing even one pad rune**. It remains true for arbitrary high-entropy or nonperiodic pad values and survives any pad generation from cell85. A wrong crib or key fitting cannot alter it.

We freeze two distinct plausible resets, because the original red headings have different lengths:

1. **Title-to-title:** match the first GP rune of the actual p27 red title against the first GP rune of the actual p54 red title; the latter chapter has 308 runes. The maximum prefix ending at a complete printed word boundary in both passages is **305** aligned runes, with **67 p27 words**, **65 p54 words** and **117** pairwise printed-word overlaps.
2. **Black-to-black:** skip exactly the original 19 and 9 red heading runes, then match the first black-body rune in each chapter. The latter chapter has 299 body runes. The maximum prefix ending at a complete printed word boundary in both passages is **296** runes, with **66 p27 words**, **63 p54 words** and **115** cross-text word overlaps.

Original punctuation and `-` word separations are preserved; printed line and page wraps do not create words. Every rune in the 56 unknown pages is checked against the canonical original GP29 corpus. No ciphertext, rune identity, source word boundary, or key value is fitted.

### Frozen lexical projection

The parser uses the separately calibrated **native GP29 English orthography**: `ING` as one GP rune, `IO` as its attested GP ligature, `QU→CW`, `V→U`, `K/Q→C`, and `Z→S`. It builds an especially permissive dictionary from the **29,157** original TextBlob English spelling/frequency entries and a further source-pinned long-word English list. For example, it admits **4,776** distinct seven-rune words and **4,325** eight-rune words, far wider than ordinary running prose.

For every overlapping pair of complete printed words, compute the original GP29 ciphertext difference at every shared rune offset. Enumerate **all** English dictionary candidates of the two exact printed rune lengths. A GP29 two-time pad requires **at least one** candidate pair whose rune-value differences equal the original ciphertext differences at **all** overlap positions. This is a necessary condition independent of the hidden key. Failure on even one overlap is enough to reject the specific model for dictionary-covered, source-native English.

| Frozen source alignment | Complete GP rune pairs | Matching original glyphs | Word-overlap constraints | Overlaps with **zero** English word-pair support |
| --- | ---: | ---: | ---: | ---: |
| Full red-title clock | **305** | **14** | **117** | **13** |
| Actual black-body restart | **296** | **5** | **115** | **10** |

**Source-local counterexample:** at the **first seven original black-body runes**, the first printed word of p27 is exactly **seven** GP runes long, while the first printed word of p54 is exactly **eight**. Across **all 4,776 × 4,325** native lexical word-pair combinations, **zero** has the first seven componentwise GP29 differences required by the unmodified original ciphertext. The first unsupported black-body overlap is therefore `[0,7)`, requiring no future key state or page join. Other unsupported black-body overlap spans include `[61,69)`, `[96,101)`, and `[150,158)`. This is a concrete source-cipher contradiction for the *specified natural-language reference class*, independent of period, pad entropy, generator, or byte85's numeric value.

**Positive control:** the exact same printed word lengths are filled with GP-native English words from that dictionary, encrypted using one common nonconstant pad `K[i]=(17i²+19i+23) mod29` on both passages. The test recovers all **305/305** and **296/296** planted runes, exactly cancels their shared pad, and finds lexical support for **every** planted word overlap. This prevents treating an implementation mismatch as a cryptanalytic exclusion. All source checks and positive cases completed successfully on **Windows Node.js22**.

## Interpretation and limits

The red-title 512/address85 match is exact. The immediate **same-position, same-additive-GP29-keystream** use of that match is not supported by original text. Under the stated printed-word / source-native English register, neither heading-to-heading nor black-body restart can decrypt the original chapters as ordinary lexical English. The conclusion does **not** cover the possibility of invented names or words absent from both dictionaries, an intermediate plaintext register, differently segmented words, a **distinct** keystream for each heading, a nonadditive/feedback cipher, or a source-guided relative offset. It does not disprove the numerical coincidence's authorship. It gives a bounded decision: **do not expand a freely chosen family of shared-pad seeds from p50[85] without a new author-selected operation.**

This is a finite word-language compatibility test, **not** a language-independent impossibility theorem. It recovers **zero genuine unknown plaintext runes**.

### Reproducibility

- [Self-contained source-first Windows Node22 SFT](../sims/lp2_p27_p54_red512_sharedpad_original_sft.cjs). Inputs: unchanged `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json`, `lp2-grid-256.json`, and repository's frozen English wordlists, with the established native GP encoder.
- [Successful Windows Node22 original-cipher execution, run 44957903427](https://github.com/FlareZ123/liber-primus/actions/runs/44957903427). The initial run's only issue was a hand-written equality assertion counting 308 full title runes instead of the **305** full-word comparison; correcting the assertion produced this successful result without changing the cipher, source or dictionary, and the manuscript-backed lexical contradiction and independent positive controls were unchanged.
