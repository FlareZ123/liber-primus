# Five-rune radix28 to three-byte packing: original LP2 inverse gate

**13 November 2026, Agent 5. Classification:** a new finite **keyless binary-readout exclusion**, grounded in the original 29-symbol ciphertext and its sparse immediate repeats. It recovers no unknown Liber Primus plaintext, byte payload, cryptographic key or onion destination.

## Why test this exact reversible packing?

The original LP2 p0–55 uses a 29-symbol Gematria Primus alphabet. Only **86** of **12,956** original rune positions repeat their immediate predecessor, so a plausible 28-choice *relative-rank* transport assigns one digit in **0..27** to every nonrepeated symbol and treats the repeated positions as separately recorded escapes. There are two natural choices of rank order, both completely deterministic and inverted with knowledge of the preceding ciphertext rune: cyclic distance minus one and sorted-alphabet rank excluding the predecessor.

A source-to-binary path is plausible because earlier Cicada puzzles transmitted binary files and the original manuscript has fivefold/pentagonal motifs, but the manuscript does **not** explicitly say “pack five GP28 digits as three bytes.” The following is therefore a **specific proposal**, not an authenticated cipher instruction. It has a particularly cheap, key-independent falsifier:

\[
28^5 = 17{,}210{,}368 > 2^{24}=16{,}777{,}216.
\]

Five base-28 digits can encode each three-byte unsigned integer. If they encode **literal unmodified 24-bit records**, **every** group must be strictly below `0x1000000`. Values above that threshold cannot represent three bytes in this fixed-width codec. A uniform-radix28 reference has an exact overflow rate **433,152/17,210,368 ≈ 2.5168%**.

## Exact original-cipher calculation

The original rune indices come from [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). Physical p50 has no rune text; 55 other pages cover all 12,956 unknown rune positions. The primary predeclared read is a book-continuous **cyclic excluded-predecessor rank**, taking the initial preceding-rune seed as GP index 0. A repeated symbol is an explicit escape and contributes no radix28 digit. For five digits `d0..d4`, read `v=(((d0*28+d1)*28+d2)*28+d3)*28+d4` and emit its three bytes in big-endian order only if `v<2^24`.

The original therefore yields **12,870 data digits**, exactly **2,574** complete five-digit groups. The primary read has **54 invalid/out-of-range records**; the first twelve putative bytes are `8a73be72e8e2bc6704ddc8d2`, and only **36.73%** of its admissible decoded bytes lie in printable ASCII `0x20..0x7e`. The ASCII fraction is near the uniformly random byte benchmark **95/256 = 37.11%**. A literal three-byte record sequence would require **zero** invalid groups, independently of English plausibility. The invalid 54 records are a direct arithmetic contradiction for this exact codec.

Small, explicitly bounded alternative framing checks retain the same underlying source and no secret key: sorted vs cyclic predecessor exclusion, a book-continuous vs page-first-rune-seed clock, five possible group starts and both directions of the five-digit read. Among **40** complete original-source combinations, **every** variant produces at least **50** invalid three-byte records (range **50–73**); admissible-byte printable fractions remain **36–39%**. Page-seeded streams have **12,815** available ranks and book-continuous streams **12,870**. None produces native printable prose, a standard uncompressed three-byte stream, or a fully valid literal codeword set.

## Strong positive control and scope of the exclusion

The [CommonJS SFT](../sims/lp2_rank28_five_to_three_byte_sft.cjs) creates a 93-byte ASCII extract from the authenticated solved p57 *PARABLE*, divides it into **31 genuine three-byte records**, and encodes each as exactly five base-28 ranks. It then generates a self-avoiding GP29 ciphertext with a known initial state, independently derives the 28-ranks using **each** excluded-predecessor order, and recovers all **93/93** original bytes with **zero** overflows. This demonstrates the declared inverse and the validity gate do work when their own transport model is true. The test also independently replays all **12,956/12,956 original ciphertext runes** from the exact predecessor-rank symbols plus original repeat-marker positions, in both rank orders and both clock modes. This reconstruction only establishes lossless transport of the ciphertext; it does not decrypt it. The original-source, replay, and positive-control assertions passed in [manual Node22 CI run 43422898292](https://github.com/FlareZ123/liber-primus/actions/runs/43422898292).

**Decision:** the original book does not literally carry a 24-bit binary byte stream encoded by five consecutive 28-choice predecessor ranks under any of the stated 40 source-shaped framing conventions. This conclusion is independent of fitting an English dictionary or a high-entropy unknown key. It leaves open enciphered or compressed intermediate symbols, different block sizes, a hidden alphabet permutation or key, a separately specified escape/padding protocol, and any use of original image bits. None of these variants is implied merely by the attractive `5 GP ranks ≈ 3 bytes` capacity ratio. An actual author-specified five-digit binary transport or independently recovered key must precede any broader search.
