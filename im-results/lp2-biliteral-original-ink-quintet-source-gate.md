# Original LP2 literal ink biliteral: a full-book static Bacon decoder cannot carry prose

**Agent30, 28 November 2026; Director #3303.** A direct 5-bit biliteral read from the **two visually verified ink classes** is impossible as a standard prose-producing decoder on original unsolved LP2 pages. All-color positions and standard quintet phases are derived from original source annotations, not fitted rune-to-bit keys. This is **not** a general exclusion of subtle glyph-form steganography or changing-state ciphers. No hidden plaintext or key was recovered. [One-file original-input reproducer](../sims/lp2_biliteral_source_ink_quintet_sft.cjs).

## Motivation and first-party source

Classical Francis Bacon biliteral encoding uses five successive letters' visually distinct **type forms**, converting each form to A/B and each quintet to one output letter. The mechanism is an independently existing pre-2014 hand cipher. The concrete candidate physical property visible to a player in original Liber Primus is **red versus black printed runic ink**. Source canonical page-local classification is recorded in resources/liber-primus/lp2-ink-annotations.json and separately established against the original JPEGs. The corpus provides 12,956 ciphertext GP runes on p0–55. Of them only **213 are red**; 12,743 are black. The additional 12 red runes belong to already-solved p56/p57 and are not smuggled into unknown-page evidence.

The *source itself does not instruct* Bacon, say whether red means one or zero, or select five-rune boundaries. That is the weakest premise; this gate tests the simplest authentic visual biliteral interpretation without inferring a substitution alphabet from ciphertext. Prior source studies that assign one bit *to each GP rune identity*—[shared-unknown Bacon codebook](lp2-bacon-shared-unknown-codebook-original-gate.md) and [homophonic follow-up](lp2-bacon-shared-homophone-recovery.md)—are **different** from a bit obtained from a visibly red or black **individual occurrence**. Original allograph studies also found no independent stable alternate ordinary-font variant after page-held-out nuisance control ([whole-source glyph study](lp2-allograph-full-source-controlled-split.md)); p50 printed numeral allographs are separately negative ([#345](lp2-grid-11-original-glyph-adjudication.md)). Ink color is a genuine immediately readable two-state signal even though an authored decoder is missing.

## Full original-source test and exact bound

Represent each original unknown rune in physical reading order as 1 if source-annotated red, 0 otherwise, keeping every rune, including page-crossing word carries. Group five **successive** visible runes into a codeword and read MSB-first. Every literal all-black quintet is the same codeword 00000. Under a fixed Bacon table it must decode to the **same letter**, regardless of what that letter is called or how the two ink states are complemented.

Across all possible starting bit phases 0…4, the observed source counts are:

| First-rune phase | Complete 5-rune blocks | All-black 00000 blocks | Percentage of one identical code |
|---:|---:|---:|---:|
| 0, actual start | 2,591 | **2,538** | **97.954%** |
| 1 | 2,591 | 2,538 | 97.954% |
| 2 | 2,590 | 2,538 | 97.992% |
| 3 | 2,590 | **2,539** | **98.031%** |
| 4 | 2,590 | 2,538 | 97.992% |

In the source-start phase only **53 of 2,591** quintets contain even one red rune. That makes the direct output almost 98% one letter under *any* arbitrary fixed 5-bit-to-letter lookup table—not coherent prose, a command, or the language/register of the actual solved LP1, p56 and p57 passages. Under classical Bacon polarity, 00000 gives A; under complement it becomes 11111 (reserved under the 26-letter mapping). The result is independent of prime shifts, rune identity and English-frequency scoring, because those inputs are not involved in the candidate.

Stronger even than the bookwide rate, the original has one uninterrupted run of **2,949 consecutive black GP runes** from **p40 offset8 through p53 offset127 inclusive**. Any simple five-rune framing within it produces hundreds of identical outputs. The next red passage begins at p53 offset128; the physical placement of red is consistent with a heading/verse rubric, not a continuously mixed binary carrier. Page, line or word resets would require fresh independent framing and cannot manufacture missing red variants inside that 2,949-rune region.

## Solved native typography is a negative control

The two actually solved ending pages have precisely the same typesetting convention: a short red heading followed by black text, even though their cryptographic roles differ. On *original visually printed* p56 there are **5 red runes** and a total of85 rune positions. The 17 phase-zero quintets are exactly **16 all-black** plus one red-only 11111. The actual p56 visible heading is **encrypted** under its known prime/F-hold algorithm. On *original clearly written* p57 there are **7 red runes** among95 source runes; its 19 quintets are exactly **17 all-black**, one 11111 and one 11000. Yet that page's 95 GP runes are already its directly intelligible plaintext. The physical red/black distribution is therefore demonstrably used in ordinary clear-text typesetting as well, without carrying the underlying text in biliteral codewords.

The prior five numbered p36–38 units [#2156](lp2-five-numbered-serial-handoff-original-selector.md) also lack a source-selected per-rune two-form alphabet and complete 5-rune continuation; an analyst-selected abstract coloring of GP identities on their first91 quintets already failed native text extraction ([independent #345-era five-unit Bacon gate](lp2-five-numbered-bacon5-unknown-bit-alphabet.md)). The 256-event red-rune/13-dot register [#647](lp2-red13-grid256-tape-gate.md) and its 133-bit combinatorial rank [#1478](lp2-red225-dot13-combinadic-base29-html133-gate.md) are not repeated; those choose a different event population, not two ink forms on each contiguous printed rune.

## Decision and next-source requirement

**Retire literal red=bit, black=other-bit, consecutive-five-runes Bacon as a direct LP2 message decoder**, under every complete-rune starting phase and every fixed output codebook. Its emitted symbol type is essentially constant over thousands of original runes and is **already contradicted by p57's known plain-GP typography**. This conclusion is exact for the announced observation/format; it is not evidence that the creator never used biliteral steganography elsewhere.

A different claimed Bacon carrier must first exhibit two independently stable **source-visible forms within the same normal glyph class** or a first-party instruction defining some other naturally delimited paired event population. The full-source allograph split test did not find that carrier, while artificial regrouping of 225 red rune events and 31 marks has no authored quintet delimiter. Adding arbitrary bit assignments to rune identities or rephasing 5-bit blocks would repeat previously failed hypothesis families rather than recover an original plaintext.
