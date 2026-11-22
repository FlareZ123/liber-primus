# Direct 256-cell p50 lookup into the original red/13-dot event tape

**Decision, 16 November 2026, Agent5.** A source-sized, *keyless* book-coordinate operation fails to produce a readable runic message. No unknown LP2 plaintext, authentic key, mechanism or destination is recovered. This is a bounded negative for a previously untested direct lookup, rather than an exclusion of every use of the 256-event alignment.

## Independently visible inputs and historical operator

A physically confirmed full-LP2 inventory gives **225 red GP29 runes and 31 large 13-dot punctuation marks**, covering both unknown and solved LP2 physical pages. Together they form exactly **256 distinct ordered event slots**. The original p49–51 numerical table has exactly **256 alphanumeric two-character cells**, arranged 32×8; the commonly used, *conditional* ordinary base60 encoding interprets each as one unsigned byte in 0..255. [Original physical red/dot inventory](lp2-original-dot-punctuation-physical-census.md) · [original-derived ink annotations](../resources/liber-primus/lp2-ink-annotations.json) · [256-cell source table and codec caveat](../resources/liber-primus/lp2-grid-256.json).

Unlike a hypothetical cryptographic key search, these two objects define a simple **coordinate lookup** with no secret state: order the 256 visual events by physical page and rune offset, insert each thirteen-dot mark immediately after its preceding rune (before a red rune at the same position), and use the 256 table byte values as **zero-based indices into those events**. Return the indexed rune as itself, and the indexed punctuation mark as an ordinary word break. The author historically used explicit book-code coordinates in 2012/2014, so source-derived lookup is a legitimate cheap alternative to blind cipher fitting. However, *no signed LP2 instruction actually selects* this particular cross-object pairing, radix, or zero convention. A prior [red-event/p50 study](lp2-grid256-allsecret-keyclock-original-gate.md) tried **aligned XOR of values**, rather than numeric table values indexing source events; this is an independent operation and has a different output type.

## Original 256-symbol output and falsifiable result

[Source-read-only CJS SFT](../sims/lp2_red256_p50_byteindexed_bookcode_sft.cjs) consumes only the original-derived two JSON resources above, asserts exactly 225 rune and 31 mark slots and 256 canonical byte pointers, and emits **256 GP rune-or-space events** in printed table order. Exact first twelve rune outputs are:

`ᛠᛗᛋᚦᛒᛁᛋᚹᚢᚪᚦᚩ`

The output has **38** spaces, **33** nonempty wordlike runs, and a **longest uninterrupted run of 47 GP runes**. Its first 64 coordinates are precisely the original first 64 grid byte values, without a fitted offset, reversal or reordering. The resulting rune tape is nonprose, with multiple isolated one-rune fragments, wordlike clusters and one 47-rune uninterrupted cluster. It does not read as a literal original-language instruction or conventional native-GP English. The script checks a seven-symbol pointer-control spelling of the *genuinely clear p57 title* `PARABLE` as a narrow indexing sanity check; it is not a positive recovery of a hidden message.

**Decision:** the straightforward, source-sized **p50 byte → red-rune/13-dot event positional book code** yields no plain runic message. The 256-event and 256-cell counts are real, but the sources lack an author-defined codebook relation or typed output. New downstream transforms, rearrangements of slots or inserted seed values require independent original evidence. Do not reinterpret arbitrary substrings of this output as partial decryptions. The prior independent bytewise XOR gate remains negative, and p50 still might serve an as-yet unidentified cryptographic purpose.
