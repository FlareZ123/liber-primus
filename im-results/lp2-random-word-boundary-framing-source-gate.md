# Original printed word boundaries exclude memoryless ciphertext packet framing

**Agent46, 16 November 2026; Director #1208.** This is a quantitative, source-exact exclusion of one complete framing family, not a recovered plaintext, key, or general prohibition on changed segmentation.

## Which hypothesis this tests

A cheap way to explain the original **83 one-rune words spanning 28 distinct GP glyphs** is to treat all printed hyphens as arbitrary ciphertext packet delimiters rather than plaintext word spaces. The strongest simple version places packet boundaries **independently of ciphertext values**, uniformly among legal rune gaps, while preserving the number of printed packets and every source-visible punctuation-delimited span. Every plaintext word could then cross these packet cuts; decrypting an eventual keyed stream would reconstruct its own spaces.

The rival is that word lengths are deliberately preserved or produced by a syntax-aware/codebook/length-transforming process. Uniform random boundary placement is a precise necessary model of a *memoryless packet delimiter* and is worth excluding before seeking a free-boundary cipher. The 2016 signed instruction about the words' numbers is compatible with using printed word lengths as key material; it does not certify random packetization.

## Exact conditional null and source observation

The canonical, unchanged LP2 pp0–55 transcript has **12,956 runes in 2,896 complete printed words**, with **83 singleton words**, and **175 nonempty punctuation-delimited spans**. Physical line breaks `/` and page separators `%` are retained as layout, not extra word delimiters; actual `-` and `.$&§` terminate printed words. The fixed segments contain precisely all original rune indices and preserve source punctuations.

In a span with `N` runes and `W` printed words, randomly choose `W-1` separator positions among the `N-1` possible inter-rune gaps. Each of the `C(N-1,W-1)` positive-integer word-length compositions is equiprobable. The probability that any specified word position has length1 is `p=(W-1)/(N-1)`. For any two distinct word positions the joint probability is `p2=(W-1)(W-2)/((N-1)(N-2))`. Therefore the exact conditional first two moments of the **count** of singletons in the segment are

```text
E[singletons] = W*p
Var[singletons] = W*p*(1-p) + W*(W-1)*(p2-p*p)
```

These sum across the 175 disjoint punctuation spans. Length-1/2 degeneracies use their deterministic counts.

| Conditioning | Expected singleton count | SD | Observed singleton count |
| --- | ---: | ---: | ---: |
| Only book totals 12,956 / 2,896 | **647.1571** | **19.7543** | **83** |
| Preserve all 175 original punctuated spans and their exact word counts | **627.1323** | **19.4749** | **83** |

The second source-conditioned residual is **−27.9403 standard deviations**, far beyond a plausible random-packet construction under this exact null. This is an analytic moment comparison, not a distribution-free p-value or evidence of author identity. The observed word-length histogram for lengths 1–14 is exactly **[83,448,720,513,317,256,216,156,78,52,32,18,4,3]**. A memoryless delimiter would make singletons commonplace; the actual manuscript has very few.

## Feasible side-channel size despite failure of random boundaries

The exact **number of possible word-boundary configurations** while preserving every one of the same 175 source punctuation segments and the exact printed word counts is

```text
B = product over spans of binomial(N_span - 1, W_span - 1)
log2(B) = 9007.999797... bits
```

This is a **maximum combinatorial capacity** of about **9,008 bits (1,126 bytes)**, or 0.6953 bits per printed GP rune. It is **not** evidence that an actual 9,008-bit message is encoded: the true word-length distribution is far from uniform, and an intentional plausible-English word-shape constraint would greatly reduce freely selectable entropy. It does, however, show why the observed nonrandom boundaries alone cannot eliminate an author-designed *contextual* side channel: 9,008 potential configuration bits are ample in principle to encode the independently established **at least 330 side bits** needed by a fixed-length hard anti-repeat escape codec. The missing information remains an original source-selected, lossless code assigning specific boundary configurations to those bits, followed by an actual plaintext inverse. The SFT calculates this count exactly from the unchanged 175 source segments.

**Next decision:** ordinary random packetization (including independent uniform spacing after encrypting an otherwise unsegmented GP29 stream) cannot explain the untouched word lengths. Any source-framed, spacing-changing cipher must **deliberately engineer the strongly non-geometric packet lengths** or preserve much of a genuine word-length process. This raises the evidence burden for a non-plaintext space model. It does not show that the text is readable English under its published breaks: the actual ciphertext values remain near-uniform and the 28 singleton glyphs still require a changing cipher. A keyed contextual encoder may generate English-like lengths and is outside the null.

The earlier [full arbitrary-resegmentation lexical gate](lp2-boundary-anybreak-english-lexicon-gate.md) separately shows that moving spaces *alone* cannot decode the original rune tape; value-changing or reordering remains mandatory. The independently tested [printed line-end dash/ASCII channel](lp2-linewrap-2013-whitespace-transfer-original-gate.md) likewise yielded no instruction. Together these results identify a hard structural condition on further issue #1208 work, without inventing a complete cipher.

**Reproducer:** [read-only exact original-input Node22 SFT](../sims/lp2_word_separator_randomframing_source_sft.cjs), with all original GP rune indices checked against `resources/liber-primus/lp2-transcription.txt`, exact 175 segments, 2,896 words and 83 singletons asserted.
